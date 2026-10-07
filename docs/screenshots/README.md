## SEO補強（トップページ5か所の追加）の記録

| 項目 | 内容 |
|---|---|
| 撮影日時 | 2026/10/7 18:09:39 (JST) |
| 撮影したURL | ローカル配信（本番ではありません） |
| 変更したページ | トップ（`/`）のみ。採用課題・CONCEPT・採用SEOとは？・SERVICES 01・FAQ 3問 |
| 参考画像 | `reference/promeon-seo-preview/`（承認済みプレビュー。PC 1024px／スマホ 390px。本番の画面ではありません） |
| 変更前 | `before-seo-reinforcement/1440-390/`、`before-seo-reinforcement/1024-320/` |
| 変更後（ページ全体） | `desktop/`・`mobile/`・`interactions/`（1440／390px）、`after-1024-320/`（1024／320px） |
| 変更後（変更箇所の切り抜き） | `desktop/seo-{1440,1024}-*.png`、`mobile/seo-{390,320}-*.png`（challenges / concept / seo / services / faq / faq-open） |

- 4つの幅（1440・1024・390・320px）で、横はみ出し・コンソールエラー・リンク切れなし
- FAQ（11問）とレポートの開閉、検索タブ、業種別デモ3種と枠内スクロール、応募の流れの開閉、スマホメニューを確認
- 問い合わせフォームは送信していません（送信コードは変更なし）
- 同日に「09 / OUR PURPOSE」の本文差し替え（`desktop/purpose-*.png`・`mobile/purpose-*.png`）とレスポンシブ調整を行い、`desktop/`・`mobile/`・`interactions/`・`after-1024-320/` を撮り直しています。`before-seo-reinforcement/` と `after-1024-320/` はトップページの画像だけを残しています
- レスポンシブ調整後は、全10ページを 320・360・600・768・900・1024・1440px で確認（横はみ出し・コンソールエラーなし）
- 以下の「画像一覧」のページ全体の縦サイズは 2026/10/5 時点のものです。最新は `last-run.json` を参照してください
- 幅を変えて撮るとき：`node docs/screenshots/capture.mjs --out 保存先 --desktop-width 1024 --mobile-width 320`

---

390×844| 項目 | 内容 |
|---|---|
| 撮影日時 | 2026/10/5 19:06:15 (JST) |
| 撮影したURL | http://localhost:8000（`capture.mjs --serve` で起動したローカルサイト。本番ではありません） |
| ブラウザ | Chrome（画面なしのヘッドレス） |
| 画面サイズ | PC：横1440×縦900px ／ スマホ：横390×縦844px（PNG・等倍） |
| 撮影枚数 | 25枚（未撮影 0枚） |
| 参考画像（`reference/`） | 0枚（参考ソース `docs/reference-source/` を基準に実装） |

### 撮影できなかった項目

ありません。

### 撮影時に確認したこと

- 横はみ出し・読み込めない画像・コンソールエラー：全ページでなし（スクリプトの自動検出）
- 内部リンクと画像・CSS・JSの参照：リンク切れなし
- スマホ型デモ3業種の切り替え、応募の流れの開閉、FAQ、スマホメニューの開閉、検索タブ
- フォーム：未入力・スパム欄入力では送信されないこと、入力すると既存の Apps Script へ `service=recruit` で送られること（撮影はしていません）
- 参考ソースとの比較：参考画像（`reference/`）は0枚のため、参考ソース（`docs/reference-source/reference-site/`）そのものを同じ画面サイズで表示し、実装と比べました。本文テキストは、意図して変えたフォームまわりとフッターのリンク以外、全9ページで一致。ファーストビューの画素一致率は PC 97〜99％台、スマホ 88〜99％台（差は改行調整・リスト表示の統一・フッターのリンク追加によるもの）
- フォーム（Apps Script 受付）：2026/10/5 19:04 にローカルのフォームからテスト送信し、シート「採用Web診断申込」への記録・運営者への通知メール・自動返信メールの3点を確認
- 目視で見つけて修正し、撮り直したもの
  - スマホで見出しや説明文の末尾に「す。」など1〜2文字だけが次の行に残る → CSSで改行を調整
  - 料金・診断ページで、料金カードや診断例のリストがトップより字下げ・拡大されていた → トップと同じ見た目に統一

---

## 画像一覧

ページ全体の画像は、縦の長さがページごとに違います。

### PC（`desktop/`）

| 画像 | サイズ | URL |
|---|---|---|
| `desktop/01-home-first-view.png` | 1440×900 | / |
| `desktop/01-home.png` | 1440×11707 | / |
| `desktop/02-recruitment-site.png` | 1440×2887 | /services/recruitment-site/ |
| `desktop/03-recruitment-seo.png` | 1440×2790 | /services/recruitment-seo/ |
| `desktop/04-pricing.png` | 1440×2261 | /pricing/ |
| `desktop/05-diagnosis.png` | 1440×2233 | /diagnosis/ |
| `desktop/06-guides.png` | 1440×1306 | /guides/ |
| `desktop/07-guide-recruitment-seo.png` | 1440×2926 | /guides/recruitment-seo/ |
| `desktop/08-guide-recruitment-content.png` | 1440×3019 | /guides/recruitment-content/ |
| `desktop/09-guide-recruitment-operation.png` | 1440×2919 | /guides/recruitment-operation/ |

### スマホ（`mobile/`）

| 画像 | サイズ | URL |
|---|---|---|
| `mobile/01-home-first-view.png` | 390×844 | / |
| `mobile/01-home.png` | 390×17863 | / |
| `mobile/02-recruitment-site.png` | 390×3495 | /services/recruitment-site/ |
| `mobile/03-recruitment-seo.png` | 390×3302 | /services/recruitment-seo/ |
| `mobile/04-pricing.png` | 390×3562 | /pricing/ |
| `mobile/05-diagnosis.png` | 390×3110 | /diagnosis/ |
| `mobile/06-guides.png` | 390×1994 | /guides/ |
| `mobile/07-guide-recruitment-seo.png` | 390×3451 | /guides/recruitment-seo/ |
| `mobile/08-guide-recruitment-content.png` | 390×3436 | /guides/recruitment-content/ |
| `mobile/09-guide-recruitment-operation.png` | 390×3388 | /guides/recruitment-operation/ |

### 操作状態（`interactions/`）

| 画像 | サイズ | 内容 |
|---|---|---|
| `interactions/demo-office.png` | 1440×866 | スマホ型デモ：事務・オフィス |
| `interactions/demo-food-retail.png` | 1440×866 | スマホ型デモ：飲食・小売 |
| `interactions/demo-care-welfare.png` | 1440×866 | スマホ型デモ：介護・福祉 |
| `interactions/faq-open.png` | 1440×872 | FAQを開いた状態 |
| `interactions/mobile-menu-open.png` | 390×844 | スマホメニューを開いた状態 |

スマホ型デモとFAQはPC幅、スマホメニューはスマホ幅で撮影しています。

---

## 再撮影の手順

追加のインストールは不要です。Node.js 22以上と、PCに入っている Chrome（なければ Edge）で動きます。
本番サイトにはアクセスせず、デプロイや Git の操作も行いません。

1. ページやボタンを追加・変更したときは、`capture.mjs` 冒頭の `PAGES`（URL）と `INTERACTIONS`（押すボタン）を合わせます
2. プロジェクトのルートで実行します

   ```
   node docs/screenshots/capture.mjs
   ```

   スクリプトがルートのフォルダを一時的にローカル配信して撮影します。
   すでに起動しているローカルサイトを撮る場合は `--base` を付けます。

   ```
   node docs/screenshots/capture.mjs --serve
   node docs/screenshots/capture.mjs --base http://localhost:8000
   ```

   （1行目は別のターミナルで実行。`http://localhost:8000/` で表示確認もできます）

3. 終了時に表示される一覧で `[未撮影]` と `!`（警告）を確認します
   - `!` は、横はみ出し・読み込めない画像・コンソールエラーを検出したときに出ます
   - 文字の重なり・改行・余白は自動では判定できないので、画像を開いて目で確認します
4. 問題があれば修正し、もう一度実行して撮り直します（同じ名前で上書きされます）
5. このREADMEの「撮影の記録」と「画像一覧」を、`last-run.json` の撮影日時・URLに合わせて書き換えます

### オプション

| 指定 | 内容 |
|---|---|
| `--base URL` | 撮影するサイトのURL（省略時はスクリプトがローカル配信） |
| `--only desktop` / `mobile` / `interactions` | その種類だけ撮り直す |
| `--serve`（`--port 8000`） | 撮影せず、ローカルで表示するだけ |
| `--out フォルダ` | 保存先を変える（試し撮り用。省略時はこのフォルダ） |
| `--scale 2` | 高精細で撮る（画像の横幅も2倍になります） |

Chrome の場所が標準と違う場合は、環境変数 `CHROME_PATH` に実行ファイルのパスを指定してください。

### スクリプトが撮影時に行っていること

- フォントの読み込み完了を待つ
- ページを最下部までスクロールして、遅延読み込み画像とスクロール連動の表示を出し切ってから最上部に戻す
- スマホ型デモなど、内側でスクロールする枠を最上部に戻す
- ページ全体の画像は、メニューを操作していない（閉じた）状態で撮る
- 画面のない（ヘッドレス）ブラウザで撮るため、開発ツールは写り込まない
- フォームには何も入力しない
