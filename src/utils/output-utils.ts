import type { TestResult, ProblemMetadata } from '../types';
import { colors, symbols, logger } from './logger';
import { formatTime, formatMemory } from './metadata-parser';

export function printTestResult(result: TestResult, metadata: ProblemMetadata): void {
  let status = result.passed ? `${colors.green}${symbols.success} PASS${colors.reset}` : `${colors.red}${symbols.error} FAIL${colors.reset}`;

  // Time Limit Exceeded または Memory Limit Exceeded の場合
  if (result.timeLimitExceeded) {
    status = `${colors.yellow}${symbols.warning} TLE${colors.reset}`;
  } else if (result.memoryLimitExceeded) {
    status = `${colors.yellow}${symbols.warning} MLE${colors.reset}`;
  }

  logger.newline();
  console.log(`${colors.bright}${status} Test Case ${result.testCase}${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

  // 実行時間とメモリ使用量を表示
  if (result.executionTime !== undefined) {
    const timeColor = result.timeLimitExceeded ? colors.red :
                      (result.executionTime > metadata.timeLimit * 0.8 ? colors.yellow : colors.green);
    console.log(`  ${colors.dim}${symbols.clock} Time:${colors.reset} ${timeColor}${formatTime(result.executionTime)}${colors.reset} ${colors.dim}/ ${formatTime(metadata.timeLimit)}${colors.reset}`);
  }

  if (result.memoryUsage !== undefined && result.memoryUsage > 0) {
    const memColor = result.memoryLimitExceeded ? colors.red :
                     (result.memoryUsage > metadata.memoryLimit * 0.8 ? colors.yellow : colors.green);
    console.log(`  ${colors.dim}${symbols.package} Memory:${colors.reset} ${memColor}${formatMemory(result.memoryUsage)}${colors.reset} ${colors.dim}/ ${formatMemory(metadata.memoryLimit)}${colors.reset}`);
  }

  if (!result.passed) {
    // 入力
    console.log(`${colors.cyan}${symbols.arrow} Input:${colors.reset}`);
    const inputLines = result.input.split('\n');
    inputLines.forEach(line => {
      console.log(`  ${colors.dim}${line}${colors.reset}`);
    });

    // 期待される出力
    console.log(`\n${colors.green}${symbols.check} Expected:${colors.reset}`);
    const expectedLines = result.expected.split('\n');
    expectedLines.forEach(line => {
      console.log(`  ${colors.green}${line}${colors.reset}`);
    });

    if (result.error) {
      // エラー
      console.log(`\n${colors.red}${symbols.error} Error:${colors.reset}`);
      console.log(`  ${colors.red}${result.error}${colors.reset}`);
    } else {
      // 実際の出力
      console.log(`\n${colors.red}${symbols.cross} Actual:${colors.reset}`);
      const actualLines = result.actual.split('\n');
      actualLines.forEach(line => {
        console.log(`  ${colors.red}${line}${colors.reset}`);
      });

      // 差分を表示
      if (result.actual !== result.expected) {
        console.log(`\n${colors.yellow}${symbols.warning} Difference:${colors.reset}`);
        const expectedLines = result.expected.split('\n');
        const actualLines = result.actual.split('\n');
        const maxLines = Math.max(expectedLines.length, actualLines.length);

        for (let i = 0; i < maxLines; i++) {
          const exp = expectedLines[i] || '';
          const act = actualLines[i] || '';

          if (exp !== act) {
            console.log(`  ${colors.dim}Line ${i + 1}:${colors.reset}`);
            console.log(`    ${colors.green}- Expected: "${exp}"${colors.reset}`);
            console.log(`    ${colors.red}+ Actual:   "${act}"${colors.reset}`);
          }
        }
      }
    }
  }
}

export function printTestSummary(results: TestResult[]): void {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const tle = results.filter(r => r.timeLimitExceeded).length;
  const mle = results.filter(r => r.memoryLimitExceeded).length;
  const percentage = ((passed / total) * 100).toFixed(1);

  // 平均実行時間を計算
  const validTimes = results.filter(r => r.executionTime !== undefined).map(r => r.executionTime!);
  const avgTime = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
  const maxTime = validTimes.length > 0 ? Math.max(...validTimes) : 0;

  logger.newline();
  logger.subheader('Test Summary');

  const summaryData = [
    ['Total Tests', total.toString()],
    ['Passed', `${passed} ${symbols.success}`],
    ['Failed', `${total - passed} ${total - passed > 0 ? symbols.error : symbols.success}`],
    ['TLE', `${tle} ${tle > 0 ? symbols.warning : symbols.success}`],
    ['MLE', `${mle} ${mle > 0 ? symbols.warning : symbols.success}`],
    ['Success Rate', `${percentage}%`],
    ['Avg Time', formatTime(avgTime)],
    ['Max Time', formatTime(maxTime)],
  ];

  logger.table(['Metric', 'Value'], summaryData);

  if (passed === total) {
    logger.newline();
    logger.success('All tests passed!');
    logger.newline();
    process.exit(0);
  } else {
    logger.newline();
    if (tle > 0) {
      logger.warning(`${tle} test(s) exceeded time limit`);
    }
    if (mle > 0) {
      logger.warning(`${mle} test(s) exceeded memory limit`);
    }
    logger.error(`${total - passed} test(s) failed`);
    logger.newline();
    process.exit(1);
  }
}
