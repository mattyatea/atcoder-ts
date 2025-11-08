/**
 * LaTeX記法をシンプルなテキストに変換する
 */
export function cleanMathText(text: string): string {
  return text
    // LaTeX記法の削除
    .replace(/\\rm\s*/g, '')
    .replace(/\{\\rm\s+([^}]+)\}/g, '$1')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/\\\\/g, '')
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    // 不等号記号の変換
    .replace(/\\le\b/g, '<=')
    .replace(/\\ge\b/g, '>=')
    .replace(/\\lt\b/g, '<')
    .replace(/\\gt\b/g, '>')
    .replace(/\\leq\b/g, '<=')
    .replace(/\\geq\b/g, '>=')
    .replace(/≦/g, '<=')
    .replace(/≧/g, '>=')
    // その他の記号
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    // 下付き文字の変換
    .replace(/_\{([^}]+)\}/g, '_$1')
    .replace(/\^\\{([^}]+)\}/g, '^$1')
    // 余分な空白を整理
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * <var>タグを$...$記法に変換する
 */
export function convertVarToMath(html: string): string {
  return html.replace(/<var>(.*?)<\/var>/g, (match, content) => {
    const decoded = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `$${decoded}$`;
  });
}

/**
 * 問題文をクリーンアップする
 */
export function cleanStatement(statement: string): string {
  return statement
    .replace(/\s*Editorial\s*/gi, '')
    .replace(/\s*Copy\s*/gi, '')
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed !== 'Editorial' && trimmed !== 'Copy' && trimmed !== '';
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(##\s+\S)/g, '\n$1')
    .trim();
}
