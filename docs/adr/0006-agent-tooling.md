# 0006. 開発に使う MCP サーバー・プラグイン

- 状態：承認
- 日付：2026-11-24
- 関連：`DEVELOPMENT_GUIDELINES.md`「承認ゲート」

## 背景

AI エージェントで開発するため、MCP サーバーやプラグインを入れると作業は速くなるが、エージェントが本番の Firebase を操作したり、外部へ情報を送ったりする経路も増える。

## 決定

- 今は何も入れない。
- Firebase の MCP サーバー・プラグインは入れない。
- PR-4 では、firebase/agent-skills の firebase-security-rules-auditor を読み物として参照する（インストールしない）。
- PR-7 で Playwright MCP を入れる。ローカルスコープ・版を固定・`--isolated --caps=network` で使う。
- Chrome DevTools MCP は実機確認のときに検討する。使う場合は `--no-usage-statistics --no-performance-crux` を付ける。
- typescript-lsp・GitHub MCP は入れない。

## 根拠

- Firebase の公式プラグインは最新版の firebase-tools の MCP サーバーを版の固定なしで起動し、デプロイ・プロジェクト作成・初期化の操作を含む（2026-11-24 時点の確認）。承認ゲートの「Firebase プロジェクトの作成・設定」「Hosting へのデプロイ」をエージェントが直接行える状態を作らない。
- 必要になった時点で、権限を絞った形で1つずつ入れる。

## 影響

- Firebase の操作は、利用者が確認したうえで firebase-tools（devDependency）から行う。

## 見直し条件

- Firebase の MCP サーバーで、操作を読み取りだけに絞れるようになったとき。
