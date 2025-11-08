import * as fs from 'fs';
import * as path from 'path';
import type { ProblemMetadata } from '../types';

/**
 * task.mdからTime LimitとMemory Limitを抽出する
 */
export function parseProblemMetadata(problemDir: string): ProblemMetadata {
  const taskMdPath = path.join(problemDir, 'task.md');

  if (!fs.existsSync(taskMdPath)) {
    // デフォルト値を返す（AtCoderの標準的な制限）
    return {
      timeLimit: 2000, // 2秒
      memoryLimit: 1024, // 1024 MB
    };
  }

  const content = fs.readFileSync(taskMdPath, 'utf-8');

  // Time Limitを抽出
  let timeLimit = 2000; // デフォルト2秒
  const timeLimitMatch = content.match(/\*\*Time Limit:\*\*\s*(.+)/);
  if (timeLimitMatch) {
    const timeLimitStr = timeLimitMatch[1].trim();
    // "2 sec" や "2000 ms" などの形式をパース
    const secMatch = timeLimitStr.match(/(\d+(?:\.\d+)?)\s*sec/i);
    const msMatch = timeLimitStr.match(/(\d+(?:\.\d+)?)\s*ms/i);

    if (secMatch) {
      timeLimit = parseFloat(secMatch[1]) * 1000;
    } else if (msMatch) {
      timeLimit = parseFloat(msMatch[1]);
    }
  }

  // Memory Limitを抽出
  let memoryLimit = 1024; // デフォルト1024 MB
  const memoryLimitMatch = content.match(/\*\*Memory Limit:\*\*\s*(.+)/);
  if (memoryLimitMatch) {
    const memoryLimitStr = memoryLimitMatch[1].trim();
    // "1024 MB" や "1 GB" などの形式をパース
    const mbMatch = memoryLimitStr.match(/(\d+(?:\.\d+)?)\s*MB/i);
    const gbMatch = memoryLimitStr.match(/(\d+(?:\.\d+)?)\s*GB/i);

    if (mbMatch) {
      memoryLimit = parseFloat(mbMatch[1]);
    } else if (gbMatch) {
      memoryLimit = parseFloat(gbMatch[1]) * 1024;
    }
  }

  return {
    timeLimit,
    memoryLimit,
  };
}

/**
 * 時間を人間が読みやすい形式にフォーマット
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * メモリサイズを人間が読みやすい形式にフォーマット
 */
export function formatMemory(mb: number): string {
  if (mb < 1024) {
    return `${mb.toFixed(2)}MB`;
  }
  return `${(mb / 1024).toFixed(2)}GB`;
}
