import * as fs from 'fs';
import * as path from 'path';

export function findTestFiles(problemDir: string): { inputs: string[], outputs: string[] } {
  const testsDir = path.join(problemDir, 'tests');

  if (!fs.existsSync(testsDir)) {
    throw new Error(`Tests directory not found: ${testsDir}`);
  }

  const files = fs.readdirSync(testsDir);
  const inputFiles = files.filter(f => f.startsWith('input-') && f.endsWith('.txt')).sort();
  const outputFiles = files.filter(f => f.startsWith('output-') && f.endsWith('.txt')).sort();

  const inputs = inputFiles.map(f => path.join(testsDir, f));
  const outputs = outputFiles.map(f => path.join(testsDir, f));

  return { inputs, outputs };
}

export function ensureDirectoryExists(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function copyTemplate(templatePath: string, targetPath: string): void {
  if (fs.existsSync(templatePath) && !fs.existsSync(targetPath)) {
    fs.copyFileSync(templatePath, targetPath);
    console.log(`Created: ${targetPath}`);
  }
}
