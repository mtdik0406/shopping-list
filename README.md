# shopping-list

家族で共有する買い物リストのPWA（Vue 3 / TypeScript / Firebase）。現在はSTEP 5（実装）の準備段階で、アプリのコードはまだない。

## 文書

| 文書                             | 内容                                                                                 | 状態                              |
| -------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| `docs/PRODUCT_BRIEF.md`          | 企画                                                                                 | STEP 1 承認済み                   |
| `docs/REQUIREMENTS.md`           | 要件（FR-001〜037、NFR-001〜007、RISK-01〜10）                                       | v2.1承認済み、v2.2はCM-11の反映版 |
| `docs/ACCEPTANCE_CRITERIA.md`    | 受け入れ条件（AC-01〜25、AC-N01〜N07）                                               | 同上                              |
| `docs/ARCHITECTURE.md`           | アーキテクチャ                                                                       | 条件付き承認                      |
| `docs/TECHNICAL_VALIDATION.md`   | 技術検証計画（PoC-01〜05、すべて未実施）                                             | 条件付き承認                      |
| `docs/DEVELOPMENT_GUIDELINES.md` | 開発ガイドライン                                                                     | 条件付き承認                      |
| `docs/UI_DESIGN.md`              | UI/UX設計                                                                            | STEP 4 承認済み                   |
| `docs/CHANGE_REQUESTS_STEP2.md`  | 変更管理（CM）の一覧                                                                 | —                                 |
| `docs/STEP5_PLAN.md`             | STEP 5準備の計画と決定事項                                                           | PR-0〜PR-6の着手を承認済み        |
| `docs/adr/`                      | 設計判断の記録                                                                       | —                                 |
| `docs/ui-prototype/Main.dc.html` | 操作できるプロトタイプのソース（挙動・文言の参照用。単体のブラウザでは表示できない） | 参照用                            |
| `src/shared/styles/tokens.css`   | デザイントークン                                                                     | STEP 4 確定                       |

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
