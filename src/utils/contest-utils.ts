/**
 * コンテストURLからコンテスト情報を抽出
 */
export interface ContestInfo {
  type: string;        // abc, arc, agc, etc.
  number: string;      // 001, 370, etc.
  fullName: string;    // abc001, arc180, etc.
}

export function parseContestUrl(contestUrl: string): ContestInfo | null {
  // https://atcoder.jp/contests/abc001 -> abc001
  const match = contestUrl.match(/contests\/([^/]+)/);
  if (!match) {
    return null;
  }

  const fullName = match[1];

  // コンテストタイプと番号を抽出
  // abc001 -> type: abc, number: 001
  // arc180 -> type: arc, number: 180
  const typeMatch = fullName.match(/^([a-z]+)(\d+)$/);
  if (!typeMatch) {
    // 特殊なコンテスト名の場合（例: dp, typical90）
    return {
      type: 'other',
      number: fullName,
      fullName: fullName,
    };
  }

  const type = typeMatch[1];
  const number = typeMatch[2].padStart(3, '0'); // 001, 370 のように3桁にゼロパディング

  return {
    type,
    number,
    fullName,
  };
}

/**
 * コンテスト情報からディレクトリパスを生成
 */
export function getContestDir(contestInfo: ContestInfo): string {
  return `problems/${contestInfo.type}/${contestInfo.number}`;
}

/**
 * 問題IDを小文字に変換（A -> a, B -> b）
 */
export function normalizeProblemId(problemId: string): string {
  return problemId.toLowerCase();
}
