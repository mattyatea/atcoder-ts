import * as fs from 'fs';
import * as path from 'path';
import type { Problem } from '../types';
import { cleanStatement } from '../utils/text-utils';
import { ensureDirectoryExists, copyTemplate } from '../utils/file-utils';
import { normalizeProblemId } from '../utils/contest-utils';

export function saveProblem(contestDir: string, problem: Problem, logger: any): void {
  const normalizedId = normalizeProblemId(problem.id);
  const problemDir = path.join(contestDir, normalizedId);
  const testsDir = path.join(problemDir, 'tests');

  ensureDirectoryExists(testsDir);

  const cleanedStatement = cleanStatement(problem.statement);
  const cleanTitle = problem.title.replace(/\s*Editorial\s*/gi, '').trim();

  // contestDirから相対パスを作成（例: tasks/abc/001 -> abc001/a）
  // Windows の \ と Unix の / の両方に対応
  const normalizedContestDir = contestDir.replace(/\\/g, '/');
  const pathParts = normalizedContestDir.split('/');
  const contestType = pathParts[pathParts.length - 2]; // abc
  const contestNum = pathParts[pathParts.length - 1];  // 001
  const testCommand = `pnpm t ${contestType}${contestNum}/${normalizedId}`;

  const testCasesSection = problem.testCases.map((testCase, i) => {
    return `### Sample ${i + 1}

**Input:**
\`\`\`
${testCase.input}
\`\`\`

**Output:**
\`\`\`
${testCase.output}
\`\`\`
`;
  }).join('\n');

  const markdown = `# ${problem.id} - ${cleanTitle}


**Time Limit:** ${problem.timeLimit}


**Memory Limit:** ${problem.memoryLimit}


**URL:** ${problem.url}


---


${cleanedStatement}


---


## Run Tests

\`\`\`bash
${testCommand}
\`\`\`


## Test Cases

${testCasesSection}
`;

  fs.writeFileSync(path.join(problemDir, 'task.md'), markdown, 'utf-8');
  logger.success(`Saved task.md for ${problem.id}`);
  logger.detail('Title', cleanTitle);
  logger.detail('Test cases', problem.testCases.length.toString());

  problem.testCases.forEach((testCase, index) => {
    const inputFile = path.join(testsDir, `input-${index + 1}.txt`);
    const outputFile = path.join(testsDir, `output-${index + 1}.txt`);

    fs.writeFileSync(inputFile, testCase.input, 'utf-8');
    fs.writeFileSync(outputFile, testCase.output, 'utf-8');
  });

  const templatePath = path.join('template.ts');
  const solutionPath = path.join(problemDir, 'index.ts');
  copyTemplate(templatePath, solutionPath);
}

/**
 * コンテストのindex.mdを生成
 */
export function saveContestIndex(contestDir: string, problems: Problem[], contestName: string, contestUrl: string, logger: any): void {
  const indexPath = path.join(contestDir, 'index.md');

  const problemLinks = problems.map(p => {
    const normalizedId = normalizeProblemId(p.id);
    const cleanTitle = p.title.replace(/\s*Editorial\s*/gi, '').trim();
    return `- [${p.id} - ${cleanTitle}](${normalizedId}/task.md)`;
  }).join('\n');

  const markdown = `# ${contestName.toUpperCase()}

**Contest URL:** ${contestUrl}

## Problems

${problemLinks}

## Progress

| Problem | Status | Time | Memory | Notes |
|---------|--------|------|--------|-------|
${problems.map(p => `| [${p.id}](${normalizeProblemId(p.id)}/task.md) | - | - | - | - |`).join('\n')}

## Notes

<!-- Add your notes here -->
`;

  fs.writeFileSync(indexPath, markdown, 'utf-8');
  logger.success(`Created contest index: ${indexPath}`);
}
