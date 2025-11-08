/**
 * リッチなログ出力のためのユーティリティ
 */

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // 色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // 背景色
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

export const symbols = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  arrow: '→',
  bullet: '•',
  check: '✓',
  cross: '✗',
  star: '★',
  clock: '⏱',
  rocket: '🚀',
  package: '📦',
  folder: '📁',
  file: '📄',
  link: '🔗',
  download: '⬇',
  upload: '⬆',
};

export class Logger {
  private startTime: number | null = null;

  /**
   * ヘッダー（大きなセクション）
   */
  header(message: string): void {
    console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${message}${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
  }

  /**
   * サブヘッダー（中セクション）
   */
  subheader(message: string): void {
    console.log(`\n${colors.bright}${colors.blue}${'─'.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  ${message}${colors.reset}`);
    console.log(`${colors.blue}${'─'.repeat(60)}${colors.reset}`);
  }

  /**
   * 成功メッセージ
   */
  success(message: string): void {
    console.log(`${colors.green}${symbols.success} ${message}${colors.reset}`);
  }

  /**
   * エラーメッセージ
   */
  error(message: string, error?: Error): void {
    console.log(`${colors.red}${symbols.error} ${message}${colors.reset}`);
    if (error) {
      console.log(`${colors.dim}  ${error.message}${colors.reset}`);
    }
  }

  /**
   * 警告メッセージ
   */
  warning(message: string): void {
    console.log(`${colors.yellow}${symbols.warning} ${message}${colors.reset}`);
  }

  /**
   * 情報メッセージ
   */
  info(message: string): void {
    console.log(`${colors.cyan}${symbols.info} ${message}${colors.reset}`);
  }

  /**
   * 詳細情報（通常より目立たない）
   */
  detail(label: string, value: string | number): void {
    console.log(`  ${colors.dim}${label}:${colors.reset} ${value}`);
  }

  /**
   * リスト項目
   */
  item(message: string, indent: number = 0): void {
    const spaces = ' '.repeat(indent * 2);
    console.log(`${spaces}${colors.blue}${symbols.bullet}${colors.reset} ${message}`);
  }

  /**
   * 進行状況
   */
  progress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100);
    const bar = this.createProgressBar(current, total, 30);
    console.log(`${colors.cyan}${bar}${colors.reset} ${percentage}% ${colors.dim}${message}${colors.reset}`);
  }

  /**
   * プログレスバーを作成
   */
  private createProgressBar(current: number, total: number, width: number): string {
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * タイマー開始
   */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * タイマー終了して経過時間を表示
   */
  endTimer(message: string): void {
    if (this.startTime === null) {
      return;
    }
    const elapsed = Date.now() - this.startTime;
    const seconds = (elapsed / 1000).toFixed(2);
    console.log(`${colors.dim}${symbols.clock} ${message}: ${seconds}s${colors.reset}`);
    this.startTime = null;
  }

  /**
   * ボックス表示
   */
  box(title: string, lines: string[]): void {
    const maxLength = Math.max(title.length, ...lines.map(l => l.length));
    const width = Math.min(maxLength + 4, 60);

    console.log(`${colors.cyan}┌${'─'.repeat(width)}┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bright}${title.padEnd(width - 1)}${colors.reset}${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├${'─'.repeat(width)}┤${colors.reset}`);

    lines.forEach(line => {
      console.log(`${colors.cyan}│${colors.reset} ${line.padEnd(width - 1)} ${colors.cyan}│${colors.reset}`);
    });

    console.log(`${colors.cyan}└${'─'.repeat(width)}┘${colors.reset}`);
  }

  /**
   * テーブル表示
   */
  table(headers: string[], rows: string[][]): void {
    const colWidths = headers.map((h, i) => {
      const maxCellWidth = Math.max(...rows.map(r => (r[i] || '').length));
      return Math.max(h.length, maxCellWidth);
    });

    // ヘッダー
    const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ');
    console.log(`${colors.cyan}┌${'─'.repeat(headerRow.length + 2)}┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bright}${headerRow}${colors.reset} ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├${'─'.repeat(headerRow.length + 2)}┤${colors.reset}`);

    // 行
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' │ ');
      console.log(`${colors.cyan}│${colors.reset} ${rowStr} ${colors.cyan}│${colors.reset}`);
    });

    console.log(`${colors.cyan}└${'─'.repeat(headerRow.length + 2)}┘${colors.reset}`);
  }

  /**
   * 空行
   */
  newline(): void {
    console.log();
  }

  /**
   * 区切り線
   */
  separator(char: string = '─', length: number = 60): void {
    console.log(`${colors.dim}${char.repeat(length)}${colors.reset}`);
  }
}

// シングルトンインスタンス
export const logger = new Logger();
