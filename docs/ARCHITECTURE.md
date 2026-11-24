# 家族共有型・買い物リストPWA — ARCHITECTURE

- 工程: STEP 3 技術選定・アーキテクチャ設計
- 版: v0.9.2（条件付き最終承認版 v0.9 に、STEP 2 v2.2・STEP 4・STEP 5準備の確定事項を反映。第13章参照）
- 日付: 2026-11-23
- 状態: **条件付き承認。PoC未実施、実装可能性を保証しない**
- 正本: `PRODUCT_BRIEF.md`、`REQUIREMENTS.md`、`ACCEPTANCE_CRITERIA.md`。UIは`UI_DESIGN.md`・`tokens.css`
- 要件優先順位: 承認済み業務要件 > 本設計案。相違が生じた場合、要件を勝手に変更せず承認ゲートへ戻す。

## 1. 目的と設計原則

MVP（Googleログイン、2人グループ、招待承認、購入先、定番商品、買い物リスト、購入チェック、履歴・引継ぎ、オフライン同期）をClaude Codeで実装するための技術上の指針。Vue 3/TypeScript/Firebaseを維持し、早期完成、運用費原則0円、保守性、セキュリティを優先。UI詳細設計・アプリ実装は対象外。

**条件付き承認の意味**: 本書の候補構成および検証方針は承認された。RISK-01〜10の重要な不確定点は解決・合格していない。安全性や整合性を伴う本番実装・一般公開について、検証結果なしに承認済みとみなさない。Sparkで成立しない場合、Blaze移行や業務要件変更を自動的に行わず再承認を受ける。

## 2. 技術スタック

| 種別 | 採用案 | 備考 |
|---|---|---|
| UI | Vue 3 Composition API、TypeScript strict | SPA / 静的配信 |
| ビルド | Vite | ロックファイルで互換版を固定 |
| 状態管理 | Pinia | 画面状態・セッション状態。Firestoreの正本を複製しない |
| ルーティング | Vue Router | 認証ガードはUX用であり認可境界ではない |
| PWA | vite-plugin-pwa | Service Workerはアプリ殻/静的アセット主体 |
| 認証 | Firebase Authentication / Google provider | モバイルはRedirect候補。ドメイン構成をPoC検証 |
| DB・リアルタイム | Cloud Firestore Standard | サーバーデータの正本 |
| キャッシュ | Firestore Web永続キャッシュ＋必要最小限の同期操作メタデータ | アカウント切替/権限剥奪時の消去はPoC |
| デプロイ | Firebase Hosting | Sparkの範囲から開始 |
| テスト | Vitest, Vue Test Utils, Playwright, Firebase Emulator Suite | 実機試験併用 |
| CI | GitHub Actions | lint、format、typecheck、test、rules、build、secret scan |
| UI定義 | `UI_DESIGN.md`・`tokens.css`（STEP 4で確定） | Storybook / Figmaは任意。アイコンは lucide-vue-next |
| APIサーバー | 原則なし | 特権処理が要件を満たさなければ再設計・再承認 |

外部依存の正確なバージョンは、実装開始時にサポート状況と互換性を再確認して固定する。開発/検証と本番のFirebaseプロジェクトを分離する。

## 3. システム境界

```text
iPhone Safari/PWA, Android Chrome/PWA
        Vue UI -> Use cases -> Domain -> Repository interface
                                         -> Firebase Web SDK
                  Auth <- Firebase Authentication (Google)
                  Reads / writes / listeners <-> Firestore
                                       ^ Security Rules
                  static app <- Firebase Hosting
            optional local persistent cache / outbox metadata
```

UI層からFirestoreを直接変更しない。ドメイン層はFirebaseに依存しない。Repositoryはクエリ、トランザクション、リアルタイム監視、結果のエラー分類を担う。Rulesはクライアント検証とは独立してサーバーで制約を守る。Firebase Admin SDKの認証情報をPWAへ組み込まない。

## 4. データモデル（設計候補、PoCにより改訂あり）

```text
users/{uid}
groups/{groupId}
  members/{uid}
  invitations/{invitationId}
    requests/{uid}  ※有効期間・失効時の承認状態を独立して管理
  stores/{storeId}
  staples/{stapleId}
  lists/{listId}
    items/{itemId}
```

`users`: uid、currentGroupId(nullまたは1件)、accountStatus、createdAt。呼び名（FR-002/005、CM-01）は相手に表示するため `members/{uid}.nickname` に保持し、`users` には複製しない案を第一候補とする（アカウント削除時の消去対象）。グループの管理者UID、メンバー集合はgroup側に記録。二重管理する際は一つのトランザクションで変更しRulesで前後関係を検証。**正本の所属表現およびRulesのアクセス呼出し回数はPoCで確定**。

`groups`: adminUid、status(active/deleting)、memberCount、versionなど。`members`: uid、role(admin/member)、joinedAt、nickname（前後空白除去後1文字以上。上限はdomainのテストで確定。UI案は20文字）。最大2人、1ユーザー1グループを必ずサーバー側で検証する。役割はクライアント入力だけで自由変更不可。

`invitations`: createdAt、expiresAt、status(active/revoked/consumed)、opaque tokenのハッシュまたは不可推測ID、利用成立時刻。`requests`: applicantUid、nickname、申請時に通知済みのGoogle由来email、requestedAt、status(pending/approved/rejected/invalidated)。期限内の申請はリンク失効後も承認可能。承認・拒否・無効の確定時に申請のemailとnicknameを削除し、statusと理由だけを残す。申請文書は申請者が結果を確認した時点か一定期間の経過後に削除する（期間はPoC-02で確定。STEP5_PLAN A3）。取り消しは申請も無効化、最初の承認1件のみ有効。**URLトークンを秘密として扱い、申請者が他人のメールを偽装・閲覧できないRules設計をPoCで検証**。Googleメールの取得方法とプロフィール変更時の扱いも検証。

`stores`: name、nameKey、iconKey（12種の識別子：cart/pill/bread/fish/veg/home/tool/shirt/cafe/gift/store/book、未設定はnull＝store表示。FR-011・CM-08）。名前はtrim後1〜50文字。同一グループで重複不可。既存リスト/定番商品が参照する購入先の削除は拒否。参照存在確認をコレクション横断でRulesのみで達成できるかはPoC対象（単純なクエリ不存在チェックをRulesでできると仮定しない）。

`staples`: storeId、name、nameKey、usualQty（1..9、既定1。FR-013・CM-10・CM-11）。担当者は持たない。購入先ごとに定番を選択しリストへ追加でき（追加時の数量の初期値＝usualQty）、元の定番変更・削除は既存リスト商品に波及しない。リストの商品からの定番登録（FR-036）はusualQty=1で作成する。

`lists`: name、storeId、status(active/closed)、storeNameAtClose、closedAt、createdAt、updatedAt、revision。複数active可。オンライン終了のみ。終了時に参照購入先名を固定し、終了後の変更を全経路で拒否。履歴は手動削除まで保持、再開不可。利用中リストも手動削除できる（FR-037）。削除後に届いた書き込みはRulesで拒否し、クライアントは未反映として通知する（RISK-09）。削除時はitemsの残存に注意。購入予定日はリスト名の初期値の生成にのみ使い、保存しない。

`items`: name、nameKey、quantity(1..9)、assigneeUid、purchased(bool)、updatedAt、revision。リストごとのnameKeyの一意性を満たすため、`itemId`に衝突耐性のある正規化キー由来識別子を使う案、またはレジストリ文書＋トランザクション案を比較する。nameKeyのUnicode表現、長さ、ハッシュ衝突時の扱いを確定するまでID生成方式は固定しない。編集時の重複は拒否、追加時の同名商品は数量合算・既存担当維持・購入済み解除、9超は拒否。履歴商品は担当者脱退後も変更しない。

`SyncOperation`: 概念上の操作ID・対象商品・期待状態・送信/確定/拒否状態。端末側IndexedDB等に置くか、Firestore SDK保留書き込みと対応付けるかは未決定。**操作キューを2系統並列送信しない**。認証状態/権限失効時の処理と、拒否後の未反映通知保持をPoCで確定する。

### 入力規則

- 商品/定番の名称: trim後1〜100文字。購入先/リスト名: trim後1〜50文字。数量: 整数1〜9（CM-11）。
- 重複用 `nameKey`: NFKC正規化＋大文字小文字の同一視を基礎候補。前後空白、Unicode空白種、コードポイント/書記素単位での文字数、ケースフォールディング非一致例をテストで明文化する。業務要件「全角/半角・大文字/小文字を同一視」を満たさない場合は変更。
- 購入先名の重複は承認済みの「前後空白除去後の比較」に従い、商品のUnicode同一視規則を購入先へ自動適用しない。
- すべての権限・値域・更新禁止条件をサーバーで検証する。競合時はクライアントの成功表示を確定まで延期、楽観更新は未確定と表示する。

## 5. ユースケース境界

- SignIn / SignOut / DeleteAccount
- CreateGroup / IssueInvitation / RequestJoin / ReviewJoinRequest / LeaveOrRemoveMember / DeleteGroup
- ManageStore（iconKeyを含む） / ManageStaple（usualQtyを含む） / AddListItemFromStaple / SaveListItemAsStaple（FR-036）
- UpdateNickname（CM-01）
- CreateList / ChangeListStore / AddOrMergeItem / RenameItem / ChangeAssignee / TogglePurchased / CloseList / DeleteList（利用中・終了済み、FR-026/037） / CarryOverSelectedUnpurchasedItems / UndoLastAdd（直前の追加・合算の取り消し。同時操作との整合はPoC-01で確認し、成立しなければ範囲を狭める）
- ObserveSharedList / QueueOfflineToggle / RetrySync / ResolveRejectedSync

購入先の削除拒否、利用中リスト削除と遅延書き込みの拒否、同時参加承認、脱退時の担当者再割当、終了直後の全書き込み拒否、削除処理の完走性は、Security RulesとWebトランザクションだけで成立するかPoCを要する。多数文書の再割当・大量削除を単一トランザクションで無制限に処理できると仮定しない。

## 6. 同期の意味論

- サーバー確定状態が正本。Firestore `serverTimestamp` の大小比較だけを「一意の確定順の証拠」として採用しない。最終状態の一意性と再送の冪等性を検証する。
- オフライン必須は**既取得のリスト閲覧と購入チェック切替**のみ。新規追加・削除・リスト終了はオンライン必須。
- 一時失敗は保持・自動再試行・手動再試行、確定的拒否は成功扱い禁止・未反映の通知まで保持。
- オンライン終了は他端末の未同期状態が不明でも警告・明示確認により実行できる。確定後の更新は拒否。終了の瞬間と競合する通常編集/同期はPoC-01で原子的境界を検証。
- Firestoreトランザクションはオフラインでは失敗。永続キャッシュの初回設定、リロード、ブラウザの複数タブ、ログアウト後のクリア条件を実機で検証する。
- 最新状態の表示とローカル操作の表示を区別。NFR-002「1秒」はサーバー同期完了ではなく端末上の表示反映目標。

## 7. 認証・認可・セキュリティ

Googleログインはモバイル向けRedirectを第一候補とし、Hostingの認証ドメイン・サードパーティストレージ制約を検証する。Auth永続化はLOCAL候補だが、他アカウント再ログイン時のキャッシュ隔離と再接続時の所属検証を必須とする。

Security Rulesはdefault deny。group内のread/writeはmembershipとgroup activeを検証。管理者操作はadminUid判定。invite tokenから直接データを読ませない。申請者には自分の申請作成・参照に限定し、他人の申請メールへアクセスさせない。ユーザーの自己申告でrole/groupId変更が成立しないことを攻撃テストで確かめる。Rulesの `get` / `getAfter` 呼び出し制限およびオフライン時のルール再評価を検証。

PWA Service Workerは静的アセット主体とし、認証済みFirestoreレスポンスを明示的にCache Storageへ保存しない。端末内永続データの削除・権限失効時無効化は保証未確定（RISK-07）。クライアントFirebase configは秘密鍵ではないが、管理者秘密鍵・サービスアカウントキーは絶対に配信しない。App Checkは濫用リスクと利用可能性を比較検討するが、認可の代替としない。

## 8. 削除・ライフサイクル

- 親Firestoreドキュメント削除はサブコレクションを消さない。Webクライアントでコレクション削除を保証できるとは言わない。
- 管理者のグループ削除：削除中にアクセス遮断、配下の全データ消去、削除途中中断からの再開・完了検証が必要。Spark+Web-onlyでは無人での完走性が未証明。失敗時は人間へ再承認を要求。
- 一般メンバー脱退・除外：有効リストの担当を残存メンバーへ再割当、履歴は保存、サーバーアクセス直ちに拒否、キャッシュは再接続時無効化。
- アプリアカウント削除：所属解消後に通常データを削除し認証アクセス停止。Firebase Authentication側の再認証要求、バックアップ・ログ30日以内消去**目標**はRISK-06で検証。Googleアカウント自体は削除しない。

## 9. 非機能・運用・費用

- Sparkプラン優先。Blazeへの自動移行・Cloud Billing連携は行わない。Cloud Functions採用には別途承認を得る。
- Firestoreのreads/writes/deletes、同時監視、ルール内部参照、Hosting通信量を見積もる。無料枠は無制限ではなく一般公開後の利用量を保証しない。Sparkの上限超過時のサービス停止条件を監視。
- 性能: 暫定測定データ30/100商品、iPhone/Android、各30操作、p95表示反映<=1秒の目標でPoC。条件はNFRの正式な改訂ではない。
- ロギング: 認証情報、メール、招待URL、買い物商品の具体名を不要にログへ残さない。エラーコード・相関ID・匿名化した状態を原則とする。
- データ保持: 履歴は手動削除まで保持。バックアップ/ログ保持期限は公式仕様確認を要する。

## 10. 品質・リリースゲート

単体（Domainの例・境界値）、統合（Firestore Emulator・Rules許可/拒否）、E2E（主要フロー）、iPhone/Android実機（Redirect・PWA・オフライン・キャッシュ）を分ける。PoCのチェックリストは`TECHNICAL_VALIDATION.md`。

**実装着手条件**：安全性に影響する操作のPoC合格、または正式な代替方式の再承認。通常のUIや純粋なDomain試作と、本番安全性を要する機能の完成扱いを混同しない。

## 11. 追跡性・未解決事項

| 要件領域 | 設計箇所 | 技術ゲート |
|---|---|---|
| FR-001〜010 | §4,5,7,8 | PoC-02,04 |
| FR-011〜015、FR-036 | §4,5 | 一意性/参照整合性をPoC-01で検証（RISK-08、P01-09・11・12） |
| FR-016〜028、FR-037 | §4,5,6 | PoC-01,04（RISK-09） |
| FR-029〜035 | §6,7 | PoC-01,03 |
| NFR-001〜007 | §7,9,10 | PoC-03,04,05 |
| AC-01〜25 / AC-N01〜N07 | TECHNICAL_VALIDATION.md | 全項目は実装後受入。PoCで代表的な高リスクシナリオを先行検証 |

- 「リスト商品から定番登録」はSTEP 2でFR-036として正式化済み。STEP 4の変更管理（CM-01〜03・08〜10）はREQUIREMENTS/ACCEPTANCE_CRITERIA v2.1に反映済み（2026-11-24承認）。CM-11（数量1〜9）はv2.2に反映。
- RISKの定義はREQUIREMENTSの第7章（RISK-01〜10）、RISKとPoCの対応は`TECHNICAL_VALIDATION.md`のRISK台帳が正。STEP 3で識別したグループライフサイクル（Web SDK+Rulesの成立性）は、REQUIREMENTSのRISK-08（定番の同時更新）と番号が衝突していたためRISK-10に改番した。
- 主要リスク・代替案・再承認条件は`TECHNICAL_VALIDATION.md`とADRに記録。

## 12. 公式資料（確認日: 2026-11-23）

- Firestore Offline: https://firebase.google.com/docs/firestore/manage-data/enable-offline
- Transactions / getAfter: https://firebase.google.com/docs/firestore/manage-data/transactions
- Rules conditions: https://firebase.google.com/docs/firestore/security/rules-conditions
- Firestore Delete: https://firebase.google.com/docs/firestore/manage-data/delete-data
- Delete collections: https://firebase.google.com/docs/firestore/solutions/delete-collections
- Google login redirect: https://firebase.google.com/docs/auth/web/redirect-best-practices
- Firebase pricing: https://firebase.google.com/pricing
- Spark/Blaze: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans

## 13. 改訂記録

- v0.9.1（2026-11-24）：STEP 2 v2.1とSTEP 4の確定事項に合わせて参照を更新した。データモデルに `members.nickname`・`requests.nickname`（CM-01）、`stores.iconKey`（CM-08）、`staples.usualQty`（CM-10）を追加し、利用中リストの削除（FR-037、RISK-09）とユースケース（UpdateNickname、DeleteList、UndoLastAdd）を追記した。グループライフサイクルのリスクをRISK-10に改番した。技術スタック・システム境界・同期の方針は変更していない。条件付き承認の扱いはv0.9のまま。
- v0.9.2（2026-11-24）：CM-11により数量・いつもの数量を1..9に変更した。§11の追跡性をTECHNICAL_VALIDATIONの台帳に合わせ、購入先の参照・重複の検証（P01-11・12）を明記した。STEP 5準備で決めた設計上の事項は`STEP5_PLAN.md`第4章を参照（参加申請の個人データの削除時期は§4に反映）。条件付き承認の扱いはv0.9のまま。
