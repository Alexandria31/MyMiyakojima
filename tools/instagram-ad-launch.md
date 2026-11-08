# Instagram Ad Links / Instagram広告リンク

Use these after the website changes are published.
サイトの変更を公開してからご利用ください。

## Business Enquiries / 掲載相談

https://mymiyakojima.com/contact.html?utm_source=instagram&utm_medium=paid_social&utm_campaign=november_2026_business#business-inquiry

## Island Guide Visitors / 島のガイドを見る方へ

https://mymiyakojima.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=november_2026_guide

The two campaigns have separate names so their traffic can be compared. Do not add internal UTM tags to normal website navigation.
流入を比較できるよう、キャンペーン名を分けています。サイト内の通常リンクにはUTMタグを追加しません。

## Measurement / 計測

- `business_inquiry_click`: homepage business links only; fixed placement label.
- `generate_lead` (Google Analytics) and `Lead` (Meta Pixel): only after Formspree returns a successful response. Neither custom event includes form values.
- Failed requests, invalid forms, repeat clicks while sending, and page navigation do not emit lead events.
- A blocked analytics tool cannot change a successful inquiry into an error.

- ホームページの掲載相談リンクは、固定の設置位置ラベルでクリックを計測します。
- Google Analyticsの`generate_lead`とMeta Pixelの`Lead`は、Formspreeが正常応答した後にのみ送信します。独自イベントにはフォームの入力内容を含めません。
- 送信失敗、入力不備、送信中の連打、ページ移動ではリードイベントを送信しません。
- 計測ツールがブロックされても、お問い合わせの正常な送信結果は変わりません。

## Before Spending / 広告配信前

Publish, then open the business link from Instagram on your phone. Complete one genuine test enquiry, confirm it appears in Formspree, and confirm delivery to `hello@mymiyakojima.com`. Check the events in your own analytics accounts. Local browser tests mock delivery and tracking; they do not verify your mailbox or Ads Manager configuration.

公開後、スマートフォンのInstagramから掲載相談リンクを開いてください。実際のテスト送信を一度行い、Formspreeへの記録と`hello@mymiyakojima.com`への受信をご確認ください。計測イベントはご自身の管理画面でも確認してください。ローカルのブラウザテストでは送信と計測を模擬しており、メール受信や広告管理画面の設定は確認できません。

Sources / 参考:
- https://support.google.com/analytics/answer/10917952
- https://developers.google.com/analytics/devguides/collection/ga4/reference/events
