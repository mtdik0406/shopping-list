# shopping-list

家族で共有する買い物リストのPWA（Vue 3 / TypeScript / Firebase）。アプリの機能はまだ実装していない（初期構成と技術検証の準備まで）。

## 文書

| 文書                             | 内容                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `docs/PRODUCT_BRIEF.md`          | 企画                                                                                 |
| `docs/REQUIREMENTS.md`           | 要件（FR-001〜037、NFR-001〜007、RISK-01〜10）                                       |
| `docs/ACCEPTANCE_CRITERIA.md`    | 受け入れ条件（AC-01〜25、AC-N01〜N07）                                               |
| `docs/ARCHITECTURE.md`           | アーキテクチャ                                                                       |
| `docs/TECHNICAL_VALIDATION.md`   | 技術検証計画（PoC-01〜05、すべて未実施）                                             |
| `docs/DEVELOPMENT_GUIDELINES.md` | 開発ガイドライン                                                                     |
| `docs/UI_DESIGN.md`              | UI/UX設計                                                                            |
| `docs/adr/`                      | 設計判断の記録                                                                       |
| `docs/ui-prototype/Main.dc.html` | 操作できるプロトタイプのソース（挙動・文言の参照用。単体のブラウザでは表示できない） |
| `src/shared/styles/tokens.css`   | デザイントークン                                                                     |

要件（REQUIREMENTS・ACCEPTANCE_CRITERIA）は設計（ARCHITECTURE・UI_DESIGNなど）より優先する。

## 開発

Node.js 26（`.nvmrc`）と pnpm 12（`package.json` の `packageManager`）を使う。

```sh
pnpm install --frozen-lockfile  # 依存関係のインストール（pnpm-lock.yaml どおり）
pnpm run dev                    # 開発サーバー
pnpm run check                  # CI と同じ検査（lint・format・型・stylelint・テスト・ビルド）
```

| コマンド                | 内容                                                 |
| ----------------------- | ---------------------------------------------------- |
| `pnpm run lint`         | ESLint                                               |
| `pnpm run format:check` | Prettier の確認（`pnpm run format` で整形）          |
| `pnpm run typecheck`    | vue-tsc による型チェック                             |
| `pnpm run lint:style`   | stylelint（`tokens.css` 以外での色の直接指定を禁止） |
| `pnpm run test`         | Vitest                                               |
| `pnpm run build`        | 型チェックとビルド                                   |
