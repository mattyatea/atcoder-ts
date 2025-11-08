import * as fs from 'fs';

function main(input: string): void {
  const lines = input.trim().split('\n');

  // ここに解答コードを書く
  console.log('Hello, AtCoder!');
}

// 標準入力を読み込む
// Windowsの場合は process.stdin.fd (0) を使用
const input = fs.readFileSync(process.stdin.fd, 'utf8');
main(input);
