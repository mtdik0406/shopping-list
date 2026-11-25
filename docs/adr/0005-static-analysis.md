# 0005. 静的解析の道具

- 状態：承認
- 日付：2026-11-24
- 関連：`DEVELOPMENT_GUIDELINES.md`「CI 必須の確認」

## 背景

CI の lint・型検査・gitleaks・`pnpm audit` に加えて、どの静的解析を入れるかを決める。

## 決定

| 道具 | 扱い |
|---|---|
| CodeQL（default setup、javascript-typescript・actions） | 有効にする |
| knip（未使用のファイル・依存・export の検出） | PR-3 で入れる |
| eslint-plugin-vuejs-accessibility | PR-7（共通部品）で入れる |
| zizmor・actionlint・Semgrep | 入れない |

## 根拠

- 道具は、対象のコードができる段階（PR）に合わせて入れる。
- CodeQL の default setup はリポジトリの設定だけで使える。

## 影響

- PR-3・PR-7 の完了条件に、それぞれの道具を CI に加えることを含める。

## 見直し条件

- GitHub Actions のワークフローが増え、設定の誤りを CodeQL（actions）だけでは見つけにくくなったとき。
