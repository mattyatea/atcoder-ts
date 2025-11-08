import { fetchContestTasks, fetchProblem } from './scraper/fetcher';
import { saveProblem, saveContestIndex } from './scraper/saver';
import { logger, symbols, colors } from './utils/logger';
import { parseContestUrl, getContestDir } from './utils/contest-utils';
import { retryAsync } from './utils/retry-utils';
import type { Problem } from './types';

/**
 * 複数の問題を並列でスクレイピングする
 */
async function scrapeProblemsInParallel(
  contestDir: string,
  taskUrls: string[],
  concurrency: number = 3
): Promise<Problem[]> {
  const results: Array<{ url: string; problemId: string; success: boolean; error?: Error; problem?: Problem }> = [];
  let completed = 0;

  logger.newline();
  logger.subheader('Scraping Problems');

  // 並列実行数を制限しながら処理
  for (let i = 0; i < taskUrls.length; i += concurrency) {
    const batch = taskUrls.slice(i, i + concurrency);
    const batchPromises = batch.map(async (taskUrl) => {
      const problemId = taskUrl.split('/').pop() || 'unknown';
      try {
        // リトライ付きで問題を取得
        const problem = await retryAsync(
          () => fetchProblem(taskUrl, logger),
          {
            maxRetries: 3,
            delayMs: 1000,
            onRetry: (attempt, error) => {
              console.log(`${colors.yellow}${symbols.warning} Retry ${attempt}/3 for ${problemId}: ${error.message}${colors.reset}`);
            },
          }
        );

        saveProblem(contestDir, problem, logger);
        completed++;
        logger.progress(completed, taskUrls.length, `${problem.id} completed`);
        return { url: taskUrl, problemId: problem.id, success: true, problem };
      } catch (error) {
        completed++;
        logger.error(`Failed to fetch ${problemId} after 3 retries`, error as Error);
        return { url: taskUrl, problemId, success: false, error: error as Error };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // バッチ間に短い待機時間を入れる（レート制限対策）
    if (i + concurrency < taskUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 結果のサマリーを表示
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  logger.newline();
  logger.subheader('Scraping Summary');

  const summaryData = [
    ['Total', taskUrls.length.toString()],
    ['Successful', `${successful} ${symbols.success}`],
    ['Failed', `${failed} ${failed > 0 ? symbols.error : symbols.success}`],
    ['Success Rate', `${((successful / taskUrls.length) * 100).toFixed(1)}%`],
  ];

  logger.table(['Metric', 'Value'], summaryData);

  if (failed > 0) {
    logger.newline();
    logger.warning('Failed problems:');
    results.filter(r => !r.success).forEach(r => {
      logger.item(`${r.problemId}`, 1);
    });
  }

  // 成功した問題のみを返す
  return results.filter(r => r.success && r.problem).map(r => r.problem!);
}

async function scrapeContest(contestUrl: string): Promise<void> {
  try {
    const contestInfo = parseContestUrl(contestUrl);
    if (!contestInfo) {
      throw new Error('Invalid contest URL');
    }

    const contestDir = getContestDir(contestInfo);

    logger.header(`${symbols.rocket} AtCoder Scraper`);

    logger.box('Contest Information', [
      `Name: ${contestInfo.fullName}`,
      `Type: ${contestInfo.type.toUpperCase()}`,
      `Number: ${contestInfo.number}`,
      `URL: ${contestUrl}`,
      `Save to: ${contestDir}/`,
      `Concurrency: 3`,
    ]);

    logger.startTimer();

    // コンテストのタスク一覧を取得（リトライ付き）
    const taskUrls = await retryAsync(
      () => fetchContestTasks(contestUrl, logger),
      {
        maxRetries: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          logger.warning(`Retrying to fetch contest tasks (${attempt}/3)...`);
          logger.detail('Error', error.message);
        },
      }
    );

    // 並列でスクレイピング（同時実行数: 3）
    const problems = await scrapeProblemsInParallel(contestDir, taskUrls, 3);

    // コンテストのindex.mdを生成
    logger.newline();
    logger.info('Generating contest index...');
    saveContestIndex(contestDir, problems, contestInfo.fullName, contestUrl, logger);

    logger.newline();
    logger.endTimer('Total time');
    logger.newline();
    logger.success(`All tasks saved to: ${contestDir}/`);
    logger.info(`Contest index: ${contestDir}/index.md`);
    logger.newline();
  } catch (error) {
    logger.error('Scraping failed', error as Error);
    throw error;
  }
}

// コマンドライン引数から実行
const contestUrl = process.argv[2];
if (!contestUrl) {
  console.error('Usage: ts-node src/scraper.ts <contest-url>');
  console.error('Example: ts-node src/scraper.ts https://atcoder.jp/contests/abc001');
  process.exit(1);
}

scrapeContest(contestUrl);
