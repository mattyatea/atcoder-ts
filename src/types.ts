export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  url: string;
  timeLimit: string;
  memoryLimit: string;
  statement: string;
  testCases: TestCase[];
}

export interface TestResult {
  testCase: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
  timeLimitExceeded?: boolean;
  memoryLimitExceeded?: boolean;
}

export interface ProblemMetadata {
  timeLimit: number; // ミリ秒
  memoryLimit: number; // MB
}
