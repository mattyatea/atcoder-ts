import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { TestResult } from './types';
import { findTestFiles } from './utils/file-utils';
import { printTestResult, printTestSummary } from './utils/output-utils';
import { logger, symbols } from './utils/logger';
import { parseProblemMetadata, formatTime, formatMemory } from './utils/metadata-parser';

function runTest(
  solutionPath: string,
  inputFile: string,
  outputFile: string,
  testNum: number,
  timeLimit: number,
  memoryLimit: number
): TestResult {
  const input = fs.readFileSync(inputFile, 'utf8');
  const expected = fs.readFileSync(outputFile, 'utf8').trim();

  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const command = `ts-node "${solutionPath}"`;
    const actual = execSync(command, {
      input: input,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeLimit,
      maxBuffer: memoryLimit * 1024 * 1024, // MBをバイトに変換
    }).trim();

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // メモリ使用量の概算（実際のプロセスのメモリ使用量を正確に取得するのは困難）
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsage = (endMemory - startMemory) / (1024 * 1024); // MBに変換

    const passed = actual === expected;
    const timeLimitExceeded = executionTime > timeLimit;
    const memoryLimitExceeded = memoryUsage > memoryLimit;

    return {
      testCase: testNum,
      passed: passed && !timeLimitExceeded && !memoryLimitExceeded,
      input: input.trim(),
      expected,
      actual,
      executionTime,
      memoryUsage: Math.max(0, memoryUsage), // 負の値を避ける
      timeLimitExceeded,
      memoryLimitExceeded,
    };
  } catch (error: any) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // タイムアウトエラーかチェック
    const isTimeout = error.killed || error.code === 'ETIMEDOUT';
    const timeLimitExceeded = isTimeout || executionTime >= timeLimit;

    return {
      testCase: testNum,
      passed: false,
      input: input.trim(),
      expected,
      actual: '',
      error: error.message,
      executionTime,
      timeLimitExceeded,
    };
  }
}

function normalizeProblemPath(problemPath: string): string {
  // 絶対パスならそのまま返す
  if (path.isAbsolute(problemPath)) {
    return problemPath;
  }

  // problems/ で始まっている場合はそのまま返す
  if (problemPath.startsWith('problems/')) {
    return problemPath;
  }

  // abc/001/a のような形式の場合
  if (problemPath.match(/^[a-z]+\/\d+\/[a-z]$/)) {
    return path.join('problems', problemPath);
  }

  // abc001/a のような形式の場合 -> abc/001/a に変換
  const match = problemPath.match(/^([a-z]+)(\d+)\/([a-z])$/);
  if (match) {
    const [, type, num, problemId] = match;
    const paddedNum = num.padStart(3, '0');
    return path.join('problems', type, paddedNum, problemId);
  }

  // その他の場合は problems/ を追加
  return path.join('problems', problemPath);
}

function runAllTests(problemPath: string): void {
  const normalizedPath = normalizeProblemPath(problemPath);
  const problemDir = path.resolve(normalizedPath);
  const solutionPath = path.join(problemDir, 'index.ts');

  if (!fs.existsSync(solutionPath)) {
    logger.error('Solution file not found');
    logger.detail('Input', problemPath);
    logger.detail('Normalized', normalizedPath);
    logger.detail('Full path', problemDir);
    logger.detail('Looking for', solutionPath);
    process.exit(1);
  }

  // メタデータを読み込む
  const metadata = parseProblemMetadata(problemDir);

  logger.header(`${symbols.rocket} AtCoder Test Runner`);

  logger.box('Test Configuration', [
    `Problem: ${problemPath}`,
    `Solution: ${path.basename(solutionPath)}`,
    `Directory: ${problemDir}`,
    `Time Limit: ${formatTime(metadata.timeLimit)}`,
    `Memory Limit: ${formatMemory(metadata.memoryLimit)}`,
  ]);

  const { inputs, outputs } = findTestFiles(problemDir);

  if (inputs.length === 0) {
    logger.error('No test cases found');
    process.exit(1);
  }

  logger.info(`Found ${inputs.length} test case(s)`);
  logger.newline();
  logger.separator();

  logger.startTimer();

  const results: TestResult[] = [];

  for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
    const result = runTest(
      solutionPath,
      inputs[i],
      outputs[i],
      i + 1,
      metadata.timeLimit,
      metadata.memoryLimit
    );
    results.push(result);
    printTestResult(result, metadata);
  }

  logger.newline();
  logger.endTimer('Total execution time');

  printTestSummary(results);
}

// コマンドライン引数から実行
const problemPath = process.argv[2];

if (!problemPath) {
  logger.error('Missing problem path argument');
  logger.newline();
  console.log('Usage: pnpm test <problem-path>');
  console.log('\nExamples:');
  logger.item('pnpm test abc001/A');
  logger.item('pnpm test tasks/abc001/A');
  logger.item('pnpm test abc370/B');
  logger.newline();
  process.exit(1);
}

runAllTests(problemPath);
