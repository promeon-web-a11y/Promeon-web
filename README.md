# PromeonWeb

ビルド不要の静的サイトです。

## 0. リニューアル後のサイト（2026-10-05・9ページ）

トップ（`/`）を、業種不問の「採用サイト制作・採用SEO・運用支援」のサイトに置き換えました。
`docs/reference-source/`（ChatGPTで制作した参考ソース）を、このプロジェクトの構成に合わせて移植したものです。

| URL | ファイル |
|---|---|
| `/` | `index.html` |
| `/services/recruitment-site/` | `services/recruitment-site/index.html` |
| `/services/recruitment-seo/` | `services/recruitment-seo/index.html` |
| `/pricing/` | `pricing/index.html` |
| `/diagnosis/` | `diagnosis/index.html` |
| `/guides/` | `guides/index.html` |
| `/guides/recruitment-seo/` ほか2記事 | `guides/*/index.html` |

```
assets/css/site.css          9ページ共通のスタイル
assets/js/site.js            スマホメニュー・検索タブ・スマホ型デモ・診断フォーム
assets/img/team.jpg ほか     写真（出典は各ページのフッターに記載）
assets/img/favicon-site.svg  9ページ用のファビコン
docs/                        資料用（.vercelignore で公開対象から除外）
  screenshots/               保存用スクリーンショットと再撮影スクリプト
  reference-source/          参考ソース（解凍したもの）
  legacy/index-kensetu-lp.html  置き換え前のトップ（建設・設備工事会社向けLP）
```

- **ローカルで確認**：`node docs/screenshots/capture.mjs --serve` を実行し、`http://localhost:8000/` を開きます。
- **診断フォーム**：既存の Google Apps Script 受付に `service=recruit` で送信します（送信先は `assets/js/site.js` の `GAS_ENDPOINT`）。スプレッドシートの「採用Web診断申込」シートに記録し、通知メールと自動返信（5営業日以内の案内）を送ります。
- **Apps Script は更新済み**（2026-10-05、既存デプロイをバージョン2に更新。URLは変更なし）。`gas/form-handler.gs` を変更したときは、Apps Script エディタに貼り付けて保存し、**デプロイを管理 → 編集 → バージョン：新バージョン → デプロイ**で反映します（「新しいデプロイ」はURLが変わるので使わない）。
- **フォームの表示**：Apps Script の応答は画面側で読めないため、受付の成功・失敗は画面では判定していません。送信後は「送信処理を行いました。受付が完了すると…確認メールが届きます」と表示し、受付完了とは断定しません。
- **プライバシーポリシー**：`privacy.html` を9ページと同じデザインにし、実際の受付・保存方法に合わせて更新しました（旧版は `docs/legacy/privacy-old.html`）。全ページのフッターとフォームからリンクしています。制定日・改定日は公開日に合わせて確認してください。
- **OGP画像**：`assets/img/ogp.png`（1200×630）。元データは `docs/ogp/ogp.html`、作り直しは `node docs/screenshots/capture.mjs --ogp`。
- **未決定・未連携のもの**：税込・税別の区分、GA4（9ページには計測タグを入れていません）。Search Console は公開後に sitemap を再送信してください。
- **`/sns-kensetu/`**：作業中のため sitemap から外しています。Git に追加（コミット）すると公開されます。
- **スマホ型デモの企業・スケジュールは架空の制作サンプル**です。実績として掲載しないでください。
- 9ページの canonical / OG / JSON-LD / sitemap は `https://promeon-web.vercel.app/` です。独自ドメインに移す場合は一括で置換してください。

以下は、リニューアル前から残している建設・設備工事会社向けLPの説明です。
`/sns-kensetu/`・`privacy.html`・`sample/`・`gas/` は変更せずに残しています（トップだけ `docs/legacy/` に退避）。

---

# （旧）PromeonWeb 採用LP

建設・設備工事会社向けの販売検証用LPです（2サービス）。
ビルド不要の静的サイトなので、フォルダごとアップロードすれば公開できます。

- `/` … 採用ページ制作「採用スターターパック」（従業員5〜30名向け）
- `/sns-kensetu/` … SNS採用設計・運用支援「Promeon SNS採用スタート」（北海道・従業員5〜50名向け）→ 詳細は「6. SNS採用LP」

```
index.html              採用ページ制作LP（全11セクション）
sns-kensetu/index.html  SNS採用LP（全12セクション＋診断フォーム）
sns-kensetu/sns.css     SNS採用LPだけで使う部品のスタイル（共通は style.css）
privacy.html            プライバシーポリシー（両LP共通）
sample/index.html       制作例のデモ採用ページ（架空の会社）
sample/sample.css       デモページ専用のスタイル
assets/css/style.css    LPの共通スタイル
assets/js/main.js       設定値・フォーム送信・計測・スマホ固定CTA（両LP共通）
assets/img/favicon.svg  ファビコン
gas/form-handler.gs     フォーム受付用 Google Apps Script（両LP共通）
robots.txt / sitemap.xml
```

---

## 1. 公開前に必ず設定・差し替えする箇所

HTML内の該当箇所には `【要差し替え】` `【要確認】` のコメントを入れてあります。

| # | 項目 | ファイル | 内容 |
|---|---|---|---|
| 1 | **GASのURL** | `assets/js/main.js` の `CONFIG.GAS_ENDPOINT` | 下の手順2で発行したウェブアプリURL。**未設定だとフォームは送信されません** |
| 2 | **問い合わせ用メールアドレス（LP側）** | `assets/js/main.js` の `CONFIG.CONTACT_EMAIL` | フッターとプライバシーポリシーの表示に反映されます |
| 3 | 問い合わせ用メールアドレス（HTML初期値） | `index.html` フッター、`privacy.html` 窓口 | `contact@example.com` を置換（JSが動かない環境向け） |
| 4 | **通知先メールアドレス（GAS側）** | `gas/form-handler.gs` の `SETTINGS.NOTIFY_EMAIL` | 申込通知が届くアドレス。自動返信の問い合わせ先にも使われます |
| 5 | 詳細住所（必要な場合） | `index.html` フッター、`privacy.html` 窓口 | 現在は「北海道札幌市」のみ |
| 6 | 公開URL | `index.html` の `canonical` / `og:url` / `og:image` | `https://example.com/` を置換 |
| 7 | OGP画像 | `assets/img/ogp.png` | **未作成**。1200×630pxの画像を置いてください（なくても表示に問題はありません） |
| 8 | GA4測定ID（任意） | `assets/js/main.js` の `CONFIG.GA4_ID` | 空欄なら計測しません |
| 9 | 制定日 | `privacy.html` 末尾 | 公開日に合わせて変更 |

### 運用方針として確認が必要な記載

LPに次の内容を書いています。実際の運用と違う場合は修正してください。

- 診断結果の返信目安：**3営業日以内**（`index.html` の完了メッセージ、`gas/form-handler.gs` の `REPLY_DAYS_TEXT`）
- 月額サポートは **最低契約期間なし・いつでも解約可**（FAQ）
- **全国対応**（オンライン）（FAQ）
- ヒアリングは **60分・オンライン**（導入の流れ）
- 月額サポートの内容：更新は **月1回まで**、月次レポート、公開環境の管理、メール相談
- 含まれないもの：撮影、求人広告費、**独自ドメインの新規取得の実費**

---

## 2. フォーム送信（Google Apps Script）の設定

1. Googleドライブで新しいスプレッドシートを作成します（例：「PromeonWeb 診断申込」）
2. メニューの **拡張機能 → Apps Script** を開きます
3. 最初からある `コード.gs` の中身を消して、`gas/form-handler.gs` の中身をすべて貼り付けます
4. 冒頭の `SETTINGS` を書き換えます
   - `NOTIFY_EMAIL`：通知を受け取る問い合わせ用メールアドレス
   - 必要に応じて `SEND_AUTO_REPLY`（申込者への自動返信）、`REPLY_DAYS_TEXT`
5. 保存し、関数の選択で `testNotify` を選んで **実行** します
   - 初回は権限の承認画面が出るので許可します（「このアプリは確認されていません」と出たら「詳細」→「（安全ではないページ）に移動」）
   - `NOTIFY_EMAIL` にテストメールが届けば、メール送信の設定は完了です
6. 右上の **デプロイ → 新しいデプロイ** を選びます
   - 種類：**ウェブアプリ**
   - 次のユーザーとして実行：**自分**
   - アクセスできるユーザー：**全員**
7. デプロイ後に表示される **ウェブアプリのURL**（`https://script.google.com/macros/s/.../exec`）をコピーします
8. `assets/js/main.js` の `CONFIG.GAS_ENDPOINT` に貼り付けます
9. LPのフォームからテスト送信し、次の3点を確認します
   - スプレッドシートに「診断申込」シートができて1行追加される
   - 通知メールが届く
   - 自動返信が届く（有効にしている場合）

> **注意**：GASのコードを修正したときは「デプロイを管理 → 編集 → バージョン：新バージョン」で再デプロイしてください。「新しいデプロイ」にするとURLが変わります。

### 仕組みのメモ
- Apps Script はCORSに対応していないため、LPからは `no-cors` で送信しています。LP側では送信結果を読めないので、**通信エラーがなければ完了表示**にしています。確実な確認はスプレッドシートと通知メールで行ってください。
- スパム対策として、人には見えない入力欄（`website`）に入力がある送信は記録しません。
- スプレッドシートに記録するとき、`=` などで始まる入力は数式として実行されないよう先頭に `'` を付けています。
- 無料のGoogleアカウントでは、MailAppで送れるメールは1日100通程度が上限です（通知と自動返信で1件につき2通使います）。

---

## 3. 公開方法（例）

どれも無料枠で公開できます。

- **Netlify**：app.netlify.com にフォルダをドラッグ＆ドロップ
- **Cloudflare Pages**：「Direct Upload」でフォルダをアップロード
- **GitHub Pages**：リポジトリに置いて Pages を有効化

ローカルで確認する場合は、このフォルダで `python -m http.server 8000` を実行して `http://localhost:8000` を開いてください（`file://` で直接開くと、制作例の表示やフォームの動きが一部変わることがあります）。

---

## 4. 計測（GA4を設定した場合）

| イベント名 | 内容 | パラメータ |
|---|---|---|
| `cta_click` | CTAボタンのクリック | `cta_position`：`header` / `hero` / `journey` / `sample-open` / `sticky`（SNS採用LPは `header` / `hero` / `route` / `price` / `sticky`） |
| `form_view` | 診断フォームが初めて画面に入った（フォーム到達） | `form`：`diagnosis` / `sns_diagnosis` |
| `generate_lead` | 診断フォームの送信 | `form`：`diagnosis`（採用ページ制作LP） / `sns_diagnosis`（SNS採用LP） |

LP閲覧は GA4 標準の `page_view` で、ページのパス（`/` と `/sns-kensetu/`）で区別できます。

どの位置のボタンから申し込みが多いかを見て、訴求を改善してください。

---

## 5. 制作例（sample/）について

- `sample/index.html`：**札幌みらい設備株式会社**（架空・社員18名・給排水／空調設備工事）の施工スタッフ採用ページ。LPの「制作例」のスマホ枠に表示されます。
- `sample/northline/index.html`：以前作ったサンプル（株式会社ノースライン設備・架空）。別の見本として残しています。
- どちらも会社名・人物・数値・電話番号（011-000-0000）はすべて**架空**です。ページ上部とフッターに「制作サンプル」と明記し、検索エンジンに載らないよう `noindex` を設定しています。
- 写真の部分は「PHOTO」ラベル付きの差し込み枠です。営業では「ここに御社の現場写真が入ります」と説明できます。
- 応募フォームは送信されません（完了表示のみ）。

---

## 6. SNS採用LP（/sns-kensetu/）

### 公開の順番（重要）
フォームは既存と同じ GAS に送り、`service=sns` で振り分けます。**GAS を更新する前に LP を公開すると、SNS診断の申込が「診断申込」シートに入り、採用Web診断の自動返信が届いてしまいます。** 必ず次の順番で公開してください。

1. `gas/form-handler.gs` の中身を Apps Script エディタに貼り付けて保存
2. **デプロイを管理 → 編集 → バージョン：新バージョン → デプロイ**（URLは変わりません。「新しいデプロイ」は使わない）
3. SNS採用LPのフォームからテスト送信し、次の3点を確認
   - スプレッドシートに「SNS診断申込」シートができて1行追加される
   - 件名「【SNS採用診断の申込】」の通知メールが届く
   - 件名「無料SNS採用診断のお申し込みを受け付けました」の自動返信が届く
4. 既存LP（/）からもテスト送信し、従来どおり「診断申込」シートに入ることを確認
5. LPを公開（main にマージ）

### 運用方針として確認が必要な記載（HTMLに `【要確認】` コメントあり）
- 診断結果の返信目安：**3営業日以内**（完了メッセージ、GAS の `REPLY_DAYS_TEXT` と共通）
- 現状ヒアリング：**30分・オンライン**（導入の流れ）
- 4ヶ月目以降：**1ヶ月ごとに継続・終了を選べる**（料金・FAQ）
- Instagramのログイン情報は**お預かりしない**／投稿は企業側（FAQ）
- 北海道中心・道外もオンラインで相談可（FAQ）

### 写真について
現在は写真を使わず、図とテキストで構成しています。実際の現場写真を使う場合は `assets/img/` に置いて差し替えてください。架空の人物のAI生成画像は、実在の社員や導入事例に見えるため使わない方針です。
