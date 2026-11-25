# DEVELOPMENT_GUIDELINES — Claude Code 実装引継ぎ

- 版: v0.9.5

## リポジトリ推奨構成

```text
src/
  app/{router,providers}/
  features/{auth,groups,invitations,stores,staples,shopping-lists}/
    [feature]/{components,application,domain,infrastructure}/
  shared/{components,firebase,utils,styles}/   # styles/tokens.css はデザイントークンの正本
  main.ts
tests/{unit,integration,security-rules,e2e}/
docs/{PRODUCT_BRIEF,REQUIREMENTS,ACCEPTANCE_CRITERIA,ARCHITECTURE,TECHNICAL_VALIDATION,DEVELOPMENT_GUIDELINES,UI_DESIGN}.md
docs/ui-prototype/Main.dc.html   # 操作できるプロトタイプのソース（参照用）
docs/adr/
firestore.rules
firestore.indexes.json
firebase.json
```

小規模MVPを優先し、featureに不要なフォルダを予め大量作成しない。Domain層の純粋関数にはFirebase SDKを入れない。Applicationでユースケースを調停し、Repositoryインターフェース越しにFirestoreへアクセス。Piniaはローカル画面状態を保持するがサーバー正本の二重管理を避ける。UIの見た目・振る舞い・文言は `docs/UI_DESIGN.md` と `tokens.css` に従い、プロトタイプのHTMLは移植せずVueで作り直す。

## 承認ゲート

- 安全性・整合性に関わる機能は、対応するPoCがPASSするか、代替方式を人が承認するまで完成扱いにしない。Emulatorの結果だけでRISKを閉じない。
- 次は必ず利用者の承認を受ける：Blaze移行、Cloud Billingのリンク、Cloud Functionsの導入、要件・受け入れ条件・UI設計の変更・緩和・延期、Security Rulesの権限拡大、個人データ保持の拡大、30日以内消去目標の扱いの変更、PoCがFAILしたときの代替設計。
- 次は実行前に確認する：GitHubのリポジトリ設定の変更（承認済みのブランチ保護を除く）、Firebaseプロジェクトの作成・設定、Hostingへのデプロイ、本番環境の操作、元に戻せない削除。
- PR-7以降（計画は Issue #11）は、PoC結果の報告後に改めて利用者の承認を受けてから着手する。
- 開発用Firebaseプロジェクト（Spark）は利用者が作成する。Hostingへのデプロイは毎回確認する。

## Pull Request運用

- main直コミット禁止、feature branch→PR→CI→レビュー→Squash merge。mergeは利用者が行う。
- 作業はGitHub IssueとマイルストーンでPRの単位に管理し、PRは`Closes #n`でIssueと結ぶ。検討中の事項はラベル「検討中」のIssueで扱い、決まったらADRか該当する文書に書く。
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
- 実機：iPhone Safari/PWAとAndroid Chrome/PWAで認証・永続化・再接続・アカウント切替・権限失効。キーボード表示時の入力欄、日本語変換確定のEnter、文字サイズ最大（UI_DESIGN.md 第10章）。
- 行カバレッジ数値のみを品質判定にしない。振る舞い・境界・権限を検証する。

## デプロイ・運用

- 開発用と本番用Firebaseプロジェクト分離。公開前の最小権限、Rules/Indexレビュー、承認済みHosting設定、ドメイン確認。
- サービスアカウントキー・Refresh Token・招待URLはログ/レポジトリへ保存しない。
- 公開リポジトリのため、PR本文・コミット・ADR・試験記録に利用者の実名・続柄・メールアドレス・秘密情報を書かない（「家族」「利用者B」等で表す）。
- Spark利用量の定期確認。Cloud BillingリンクやBlaze変更は手動の明示承認を必須にする。
- 削除、アカウント無効化、オフラインキャッシュは未検証を示す。失敗時に成功表示をしない。

## 文書の書き方と改訂

- `docs/` の文書には、現在の決定と現在の姿だけを書く。工程（STEP）・承認状態・改訂記録・変更の経緯は書かない。経緯はgitの履歴・PR・ADRに残す。
- mainへのmergeをもって、その文書の内容を承認したものとする。整理前（工程と承認状態を本文に書いていた時点）の基準は`adr/0001-docs-current-state-only.md`に記録する。
- 未検証の事項は、検証して結果を記録するまで未検証と明示し続ける（`TECHNICAL_VALIDATION.md`）。
- 版番号は各文書の冒頭の版の行にだけ書く。他の文書はファイル名・章・ID（FR・NFR・AC・RISK・PoC、P01-xx・P02-xxなどの検証項目、S-xx、T-INV-xx、ADRなど）で参照し、版番号を付けない。参照は常にmainの最新版を指す。ただしADRは記録なので、当時の版番号を書いてよい。
- 意味を変えない字句の修正（参照の書き方・表記の統一など）では版を上げない。
- 文書の改訂は文書だけのPRで行い、別のエージェントにレビューさせる。

## Claude Codeへの最初の指示テンプレート

> `docs/` の正本（`PRODUCT_BRIEF.md`、`REQUIREMENTS.md`、`ACCEPTANCE_CRITERIA.md`、`ARCHITECTURE.md`、`TECHNICAL_VALIDATION.md`、本書、`UI_DESIGN.md`、`adr/`）を読み、未検証事項（RISK-01〜10、PoC-01〜05）と承認ゲートを要約する。PoC対象の最小検証計画を実行単位に分解し、承認済みMVP要件を変更せず、Security Rules/トランザクション/削除/オフラインの成立条件を優先して確認する。BlazeやCloud Functionsの導入は独断で行わない。計画の承認前に実装を始めない。
