# 0003. パッケージ管理に pnpm を使う

- 状態：承認
- 日付：2026-11-24
- 関連：`DEVELOPMENT_GUIDELINES.md`「CI 必須の確認」

## 背景

依存関係のインストールで、インストール時のスクリプトの実行と公開直後の版の取り込みを制御したい。

## 選択肢

1. npm
2. pnpm

## 決定

- pnpm を使い、版は `package.json` の `packageManager`（pnpm 12.23.0）で固定する。
- `pnpm-workspace.yaml` で次を設定する。
  - `strictDepBuilds: true`、`allowBuilds: {}`：インストール時のスクリプトは、許可したものだけを実行する（既定はすべて不許可）
  - `minimumReleaseAge: 1440`：公開から1日未満の版は入れない
- CI は pnpm のセットアップ用 Action（`require-lockfile: true`）で、`pnpm-lock.yaml` どおりに入れる。Action はコミットの SHA で固定する。
- `pnpm audit` を PR・main への push・毎週月曜に実行する。本番の依存（`--prod`）は全件、全体は high 以上で失敗とする。

## 根拠

- 上の2つの設定で、インストール時のスクリプトと公開直後の版を既定で止められる。
- pnpm 12 の lockfile では Dependabot のセキュリティアラートが出ないため、`pnpm audit` の定期実行で補う（2026-11-24 時点の確認）。

## 影響

- 依存を足すときに、インストール時のスクリプトが要るものは `allowBuilds` に明示して許可する。
- 公開直後の版は、公開から1日たつまで入れられない。

## 見直し条件

- Dependabot が pnpm 12 の lockfile に対応したとき。
- `minimumReleaseAge` のために、必要な修正版を入れられない状況が続いたとき。
