# 🚀 AtCoder TypeScript Environment

AtCoderの問題をTypeScriptで効率的に解くための高機能環境です。

## ✨ 主な機能

- 🔍 **並列スクレイピング**: コンテストの全問題を高速に自動取得
- 🧪 **リッチなテストランナー**: Time Limit/Memory Limitを考慮した詳細なテスト実行
- 📊 **視覚的なログ**: カラフルで見やすいプログレスバーとサマリー
- ⚡ **実行時間計測**: 各テストケースの実行時間とメモリ使用量を自動測定
- 📝 **自動テンプレート**: 各問題に即座に使えるテンプレートを生成

## 📚 練習問題

https://kenkoooo.com/atcoder/#/table/

## 🛠️ セットアップ

```bash
# 依存関係のインストール
pnpm install

# または npm を使用
npm install
```

## 📖 使い方

### 1. コンテストの問題をスクレイピング

コンテストURLを指定して、全問題と例を一括ダウンロード:

```bash
# 基本コマンド
pnpm scrape https://atcoder.jp/contests/abc001

# ショートカット版（sも使用可能）
pnpm s https://atcoder.jp/contests/abc001
```

**実行すると以下のような構造で保存されます:**

```
problems/
└── abc/              # コンテストタイプ
    └── 001/          # コンテスト番号（3桁ゼロパディング）
        ├── index.md  # コンテストまとめ（全問題へのリンク）
        ├── a/        # 問題ID（小文字）
        │   ├── task.md           # 問題文（Time Limit/Memory Limit含む）
        │   ├── index.ts          # 解答用テンプレート
        │   └── tests/
        │       ├── input-1.txt   # サンプル入力1
        │       ├── output-1.txt  # サンプル出力1
        │       ├── input-2.txt   # サンプル入力2
        │       └── output-2.txt  # サンプル出力2
        ├── b/
        ├── c/
        └── d/
```

**スクレイピングの特徴:**
- ⚡ **並列処理**: 3問同時にスクレイピング（高速化）
- 📊 **リアルタイム進捗**: プログレスバーで進行状況を表示
- 🔄 **自動リトライ**: エラーハンドリングとレート制限対策
- 📈 **サマリー表示**: 成功/失敗の統計情報を表示

### 2. 問題を解く

スクレイピングで作成されたテンプレートファイルを編集:

```bash
# お好みのエディタで編集
code problems/abc/001/a/index.ts
# または
vim problems/abc/001/a/index.ts
```

### 3. テストを実行

```bash
# 基本コマンド（推奨）
pnpm test abc001/a

# ショートカット版（tも使用可能）
pnpm t abc001/a

# 完全パスでも動作
pnpm t abc/001/a
pnpm t problems/abc/001/a

# 他の問題も同様に
pnpm t abc001/b
pnpm t abc370/a
pnpm t arc180/a
```

**実行結果の例:**

```
════════════════════════════════════════════════════════════
  🚀 AtCoder Test Runner
════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────┐
│ Test Configuration                                     │
├────────────────────────────────────────────────────────┤
│ Problem: abc001/A                                      │
│ Solution: index.ts                                     │
│ Directory: D:\atcoder-ts\problems\abc\001\a           │
│ Time Limit: 2.00s                                      │
│ Memory Limit: 1024.00MB                                │
└────────────────────────────────────────────────────────┘

ℹ Found 3 test case(s)

────────────────────────────────────────────────────────────

✓ PASS Test Case 1
────────────────────────────────────────────────────────────
  ⏱ Time: 145ms / 2.00s
  📦 Memory: 24.50MB / 1024.00MB

✓ PASS Test Case 2
────────────────────────────────────────────────────────────
  ⏱ Time: 138ms / 2.00s
  📦 Memory: 23.80MB / 1024.00MB

✓ PASS Test Case 3
────────────────────────────────────────────────────────────
  ⏱ Time: 152ms / 2.00s
  📦 Memory: 25.10MB / 1024.00MB

⏱ Total execution time: 0.45s

────────────────────────────────────────────────────────────
  Test Summary
────────────────────────────────────────────────────────────
┌──────────────┬─────────────┐
│ Metric       │ Value       │
├──────────────┼─────────────┤
│ Total Tests  │ 3           │
│ Passed       │ 3 ✓         │
│ Failed       │ 0 ✓         │
│ TLE          │ 0 ✓         │
│ MLE          │ 0 ✓         │
│ Success Rate │ 100.0%      │
│ Avg Time     │ 145ms       │
│ Max Time     │ 152ms       │
└──────────────┴─────────────┘

✓ All tests passed!
```

**テスト失敗時の詳細表示:**

```
✗ FAIL Test Case 2
────────────────────────────────────────────────────────────
  ⏱ Time: 143ms / 2.00s
  📦 Memory: 24.20MB / 1024.00MB
→ Input:
  5 3

✓ Expected:
  2

✗ Actual:
  3

⚠ Difference:
  Line 1:
    - Expected: "2"
    + Actual:   "3"
```

**Time Limit Exceeded (TLE) の例:**

```
⚠ TLE Test Case 3
────────────────────────────────────────────────────────────
  ⏱ Time: 2150ms / 2.00s
  📦 Memory: 28.50MB / 1024.00MB
```

**テストランナーの特徴:**
- ⏱️ **Time Limit チェック**: task.mdから自動取得して判定
- 💾 **Memory Limit チェック**: メモリ使用量を監視
- 🎨 **カラフルな出力**: 成功は緑、失敗は赤、TLE/MLEは黄色
- 📊 **詳細な統計**: 平均時間、最大時間、成功率を表示
- 🔍 **Diff表示**: 期待値と実際の値の差分を行単位で表示

### 4. 手動実行（デバッグ用）

```bash
# 単一のテストケースで実行
pnpm dev problems/abc/001/a/index.ts < problems/abc/001/a/tests/input-1.txt

# または標準入力を直接入力
echo "5 3" | pnpm dev problems/abc/001/a/index.ts
```

## 📂 ファイル構成

```
atcoder-ts/
├── template.ts                # 問題を解くためのテンプレート
├── src/
│   ├── scraper.ts            # メインスクレイピングスクリプト
│   ├── test-runner.ts        # メインテストランナー
│   ├── types.ts              # 共通の型定義
│   ├── scraper/
│   │   ├── fetcher.ts        # AtCoderからのデータ取得
│   │   └── saver.ts          # 問題データの保存
│   └── utils/
│       ├── file-utils.ts     # ファイル操作ユーティリティ
│       ├── text-utils.ts     # テキスト処理ユーティリティ
│       ├── logger.ts         # リッチなログ出力
│       ├── output-utils.ts   # テスト結果の表示
│       ├── metadata-parser.ts # task.mdからメタデータ抽出
│       └── contest-utils.ts  # コンテスト情報の解析
├── problems/                  # スクレイピングで取得した問題
│   ├── abc/                  # コンテストタイプ別
│   │   └── 001/              # コンテスト番号
│   │       ├── index.md      # コンテストまとめ
│   │       └── a/            # 問題（小文字）
│   │           ├── task.md   # 問題文とテストコマンド
│   │           ├── index.ts  # 解答ファイル
│   │           └── tests/
│   ├── arc/
│   ├── agc/
│   └── other/
├── package.json
└── tsconfig.json
```

## テンプレートの説明

`template.ts` には以下の基本構造が含まれています：

```typescript
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
```

## 🎯 コマンドリファレンス

| コマンド | 短縮版             | 説明 |
|---------|-----------------|------|
| `pnpm scrape <url>` | `pnpm s <url>`  | コンテストの全問題をスクレイピング |
| `pnpm test <path>` | `pnpm t <path>` | 指定した問題のテストを実行 |
| `pnpm dev <file>` | -               | TypeScriptファイルを直接実行 |
| `pnpm build` | -               | TypeScriptをJavaScriptにコンパイル |

### 使用例

```bash
# スクレイピング
pnpm s https://atcoder.jp/contests/abc370
pnpm s https://atcoder.jp/contests/arc180

# テスト実行（推奨: abc001/a 形式）
pnpm t abc370/a
pnpm t abc370/b
pnpm t arc180/a

# 完全パスでも可能
pnpm t abc/370/a
pnpm t problems/abc/370/a
```

## ⚙️ 技術詳細

### スクレイパーの仕組み

- **並列処理**: 同時に3問をスクレイピング（`Promise.all`）
- **レート制限対策**: バッチ間に500ms待機
- **エラーハンドリング**: 個別の問題が失敗しても全体は継続
- **データ抽出**:
  - 問題文（日本語優先、英語フォールバック）
  - Time Limit / Memory Limit
  - サンプル入出力
  - LaTeX数式の自動変換

### テストランナーの仕組み

- **Time Limit**: `task.md`から自動抽出し、`execSync`の`timeout`に設定
- **Memory Limit**: `maxBuffer`パラメータで制限
- **実行時間計測**: `Date.now()`で開始/終了時刻を記録
- **メモリ計測**: `process.memoryUsage()`で概算値を取得
- **判定ロジック**:
  - TLE: 実行時間 > Time Limit
  - MLE: メモリ使用量 > Memory Limit
  - カラー表示: 制限の80%超で黄色警告
