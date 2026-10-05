# PromeonWeb 実装参考ソース（2026年10月5日）

ChatGPTで制作した最新版の9ページ・CSS・JavaScript・写真素材です。
reference-site/ は静的HTMLの参考実装です。既存サイトのフレームワークへ移植し、既存のVercelプロジェクトとURLを維持してください。
既存リポジトリをこのフォルダで丸ごと上書きしないでください。

## ページ
/ トップ
/services/recruitment-site/ 採用サイト制作
/services/recruitment-seo/ 採用SEO・運用支援
/pricing/ 料金
/diagnosis/ 無料診断
/guides/ ガイド一覧
/guides/recruitment-seo/ 採用SEOの記事
/guides/recruitment-content/ 掲載内容の記事
/guides/recruitment-operation/ 運用の記事

## 移植の注意
- 見た目・原稿・写真・料金・契約条件を参考として再現。
- ChatGPT SitesのURLをcanonical・OG・JSON-LD・sitemapから置換し、https://promeon-web.vercel.app/ を使う。既存の本番独自ドメインが確認できればその設定を優先。
- .openai/hosting.json、Sitesの認証・公開設定・クレデンシャルは含んでいない。
- 静的HTMLのクリック処理は既存フレームワークに合わせて実装。
- GA4・Search Consoleは未連携。架空の測定IDや認証コードを入れない。
- フォームはメール本文を作成する方式。自動送信・保存・自動診断は行わない。
- サンプル企業・スケジュールは架空の制作例。実績として掲載しない。
- 税込・税別区分は未決定。勝手に決めない。
- 各写真の出典はfooterに記載。旧建設写真は含めていない。
- スクリーンショットを作る場合は自分用の画面確認として実施。
- push・本番デプロイは別の明示的な指示があるまで行わず、プレビューで確認。
