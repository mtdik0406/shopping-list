# 0005. 静的解析の道具

- 状態：承認
- 日付：2026-11-24
- 関連：`DEVELOPMENT_GUIDELINES.md`「CI 必須の確認」

## 背景

CI の lint・型検査・gitleaks・`pnpm audit` に加えて、どの静的解析を入れるかを決める。

## 選択肢

下の表の道具を比べた。

## 決定

| 道具 | 扱い |
|---|---|
| CodeQL（default setup、javascript-typescript・actions） | 有効にする |
| knip（未使用のファイル・依存・export の検出） | PR-3 で入れる |
| eslint-plugin-vuejs-accessibility | PR-7（共通部品）で入れる |
| zizmor・actionlint・Semgrep | 入れない |

## 根拠

- 判断の理由は記録していない。

## 影響

- knip は PR-3、eslint-plugin-vuejs-accessibility は PR-7 で CI に加える。

## 見直し条件

- 入れなかった道具でしか見つからない問題が起きたとき。
