# shopping-list

家族で共有する買い物リストのPWA（Vue 3 / TypeScript / Firebase）。現在はSTEP 5（実装）の準備段階で、アプリのコードはまだない。

## 文書

| 文書                                    | 内容                                                                                 | 状態                              |
| --------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| `docs/PRODUCT_BRIEF.md` v1.2            | 企画                                                                                 | STEP 1 承認済み                   |
| `docs/REQUIREMENTS.md` v2.2             | 要件（FR-001〜037、NFR-001〜007、RISK-01〜10）                                       | v2.1承認済み、v2.2はCM-11の反映版 |
| `docs/ACCEPTANCE_CRITERIA.md` v2.2      | 受け入れ条件（AC-01〜25、AC-N01〜N07）                                               | 同上                              |
| `docs/ARCHITECTURE.md` v0.9.2           | アーキテクチャ                                                                       | 条件付き承認                      |
| `docs/TECHNICAL_VALIDATION.md` v0.9.2   | 技術検証計画（PoC-01〜05、すべて未実施）                                             | 条件付き承認                      |
| `docs/DEVELOPMENT_GUIDELINES.md` v0.9.2 | 開発ガイドライン                                                                     | 条件付き承認                      |
| `docs/UI_DESIGN.md` v1.0.2              | UI/UX設計                                                                            | STEP 4 承認済み                   |
| `docs/CHANGE_REQUESTS_STEP2.md`         | 変更管理（CM）の一覧                                                                 | —                                 |
| `docs/STEP5_PLAN.md`                    | STEP 5準備の計画と決定事項                                                           | PR-0〜PR-6の着手を承認済み        |
| `docs/adr/`                             | 設計判断の記録                                                                       | —                                 |
| `docs/ui-prototype/Main.dc.html`        | 操作できるプロトタイプのソース（挙動・文言の参照用。単体のブラウザでは表示できない） | 参照用                            |
| `src/shared/styles/tokens.css`          | デザイントークン                                                                     | STEP 4 確定                       |

要件（REQUIREMENTS・ACCEPTANCE_CRITERIA）は設計（ARCHITECTURE・UI_DESIGNなど）より優先する。

## 開発

Node.js 26（`.nvmrc`）と npm を使う。

```sh
npm ci            # 依存関係のインストール（package-lock.json どおり）
npm run dev       # 開発サーバー
npm run check     # CI と同じ検査（lint・format・型・stylelint・テスト・ビルド）
```

| コマンド               | 内容                                                 |
| ---------------------- | ---------------------------------------------------- |
| `npm run lint`         | ESLint                                               |
| `npm run format:check` | Prettier の確認（`npm run format` で整形）           |
| `npm run typecheck`    | vue-tsc による型チェック                             |
| `npm run lint:style`   | stylelint（`tokens.css` 以外での色の直接指定を禁止） |
| `npm run test`         | Vitest                                               |
| `npm run build`        | 型チェックとビルド                                   |
