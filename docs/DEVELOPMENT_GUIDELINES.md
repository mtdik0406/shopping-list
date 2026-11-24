# DEVELOPMENT_GUIDELINES — Claude Code 実装引継ぎ

- 工程: STEP 3 / v0.9.4（v0.9条件付き承認に、REQUIREMENTS/AC v2.2・STEP 4 UI_DESIGNを反映し、文書の参照と改訂の規則を追加）/ 2026-11-25
- 本書は実装時の方針であり、実装開始（STEP 5）の承認そのものではない。

## リポジトリ推奨構成

```text
src/
  app/{router,providers}/
  features/{auth,groups,invitations,stores,staples,shopping-lists}/
    [feature]/{components,application,domain,infrastructure}/
  shared/{components,firebase,utils,styles}/   # styles/tokens.css はSTEP 4の確定版
  main.ts
tests/{unit,integration,security-rules,e2e}/
docs/{PRODUCT_BRIEF,REQUIREMENTS,ACCEPTANCE_CRITERIA,ARCHITECTURE,TECHNICAL_VALIDATION,DEVELOPMENT_GUIDELINES,UI_DESIGN,CHANGE_REQUESTS_STEP2,STEP5_PLAN}.md
docs/ui-prototype/Main.dc.html   # 操作できるプロトタイプのソース（参照用）
docs/adr/
firestore.rules
firestore.indexes.json
firebase.json
```

小規模MVPを優先し、featureに不要なフォルダを予め大量作成しない。Domain層の純粋関数にはFirebase SDKを入れない。Applicationでユースケースを調停し、Repositoryインターフェース越しにFirestoreへアクセス。Piniaはローカル画面状態を保持するがサーバー正本の二重管理を避ける。UIの見た目・振る舞い・文言は `docs/UI_DESIGN.md` と `tokens.css` に従い、プロトタイプのHTMLは移植せずVueで作り直す。

## Pull Request運用

- main直コミット禁止、feature branch→PR→CI→レビュー→Squash merge。
- commit: `feat: 商品の数量合算を追加`、`fix: 終了後の購入チェックを拒否` のようにtype+日本語。
- 重要な設計変更はADRに「背景/選択肢/決定/根拠/影響/見直し条件」を記録。
- AIエージェントには `docs/` の正本（PRODUCT_BRIEF、REQUIREMENTS、ACCEPTANCE_CRITERIA、ARCHITECTURE、TECHNICAL_VALIDATION、UI_DESIGN、本書）を明示する。要件変更・課金プラン変更・Security Rulesの権限拡大・個人データ保持の拡大を無断で行わせない。

## CI 必須の確認

1. pnpm による再現性のある依存インストール（`pnpm-lock.yaml` どおり。依存関係のインストール時スクリプトは許可したものだけ、公開から1日未満の版は入れない）
2. ESLint / Prettier --check / `tsc --noEmit` / stylelint（`tokens.css` 以外での色の直接指定を禁止）
3. Vitest（ドメイン、アプリケーション）
4. Firebase Emulator Suite + Rulesの許可/拒否テスト
5. Vite build、PWA manifest検査
6. gitleaks、Dependabot、GitHub Actionsの権限最小化、`pnpm audit`（PRごとと毎週。pnpm 12のlockfileではDependabotのセキュリティアラートが出ないため）
7. Playwrightの代表的利用フロー（Emulator上、画面幅320・375・414px）。実機試験は別ゲート。

## テスト戦略

- 単体：商品名trim/正規化、文字数境界、数量1/9と合算超過、いつもの数量（定番）、編集による重複拒否、担当者と初期値（表示中の人）、呼び名、リスト名の初期値（購入予定日）、履歴スナップショット。
- 統合：招待発行24時間、複数申請と同時承認、1ユーザー1グループ、Rules拒否（呼び名の参照範囲を含む）、購入先参照削除拒否、同時商品追加、定番の同時登録、終了競合、利用中リスト削除と遅延チェック、未同期拒否。
- E2E：ログイン、グループ作成（呼び名）、共有、入力欄と定番候補からの追加・合算・取り消し、担当者別（自分／相手／すべて）、購入チェック、買い物を終える（4つの入口）、履歴、引継ぎ、リスト削除、空/失敗状態。
- 実機：iPhone Safari/PWAとAndroid Chrome/PWAで認証・永続化・再接続・アカウント切替・権限失効。キーボード表示時の入力欄、日本語変換確定のEnter、文字サイズ最大（UI_DESIGN.md 第11章）。
- 行カバレッジ数値のみを品質判定にしない。振る舞い・境界・権限を検証する。

## デプロイ・運用

- 開発用と本番用Firebaseプロジェクト分離。公開前の最小権限、Rules/Indexレビュー、承認済みHosting設定、ドメイン確認。
- サービスアカウントキー・Refresh Token・招待URLはログ/レポジトリへ保存しない。
- 公開リポジトリのため、PR本文・コミット・ADR・試験記録に利用者の実名・続柄・メールアドレスを書かない（「家族」「利用者B」等で表す）。
- Spark利用量の定期確認。Cloud BillingリンクやBlaze変更は手動の明示承認を必須にする。
- 削除、アカウント無効化、オフラインキャッシュは未検証を示す。失敗時に成功表示をしない。

## 文書の参照と改訂

- 版番号は原則として各文書の冒頭の版の行にだけ書く。他の文書はファイル名・章・ID（FR・NFR・AC・RISK・PoC、P01-xx・P02-xxなどの検証項目、S-xx、T-INV-xx、CM、ADRなど）で参照し、版番号を付けない。参照は常にmainの最新版を指す。
- ただし次は当時の版を残すための記録なので、他の文書の版番号を書いてよい：改訂記録、変更管理の記録、承認の記録（「v2.1を承認」など）、冒頭の版の行に書く「その版で何を反映したか」の説明。
- 意味を変えない字句の修正（参照の書き方・表記の統一など）では版を上げず、改訂記録も書かない。変更はgitの履歴に残る。
- 文書の改訂は文書だけのPRで行い、別のエージェントにレビューさせる。

## Claude Codeへの最初の指示テンプレート

> `docs/` の正本（`PRODUCT_BRIEF.md`、`REQUIREMENTS.md`、`ACCEPTANCE_CRITERIA.md`、`ARCHITECTURE.md`、`TECHNICAL_VALIDATION.md`、本書、`UI_DESIGN.md`、`STEP5_PLAN.md`）を読み、未検証事項（RISK-01〜10、PoC-01〜05）と承認ゲートを要約する。PoC対象の最小検証計画を実行単位に分解し、承認済みMVP要件を変更せず、Security Rules/トランザクション/削除/オフラインの成立条件を優先して確認する。BlazeやCloud Functionsの導入は独断で行わない。計画の承認前に実装を始めない。

## 改訂記録

- v0.9.1（2026-11-24）：推奨構成に `docs/` の文書一覧・`tokens.css`・プロトタイプのソースを追加し、AGENTS.mdを外した（エージェントへの指示は正本と最初の指示で与える）。CIにstylelint（色の直接指定禁止）と画面幅を追加し、テスト戦略にSTEP 4の確定事項を追加した。最初の指示テンプレートを実装工程向けに更新した。
- v0.9.2（2026-11-24）：CM-11により単体テストの数量境界を1/9に変更した。`STEP5_PLAN.md`を文書一覧と最初の指示テンプレートに加え（参照する版も更新）、公開リポジトリでの個人情報の扱いを追記した。
- v0.9.3（2026-11-24）：パッケージ管理をnpmからpnpmに変更した（利用者承認）。CIの依存インストールを`pnpm-lock.yaml`どおりのインストールに、脆弱性の検査を`pnpm audit`に改めた。
- v0.9.4（2026-11-25）：「文書の参照と改訂」の節を追加した（版番号は各文書の冒頭にだけ書き、他の文書はファイル名・章・IDで参照する。意味を変えない字句の修正では版を上げない）。
