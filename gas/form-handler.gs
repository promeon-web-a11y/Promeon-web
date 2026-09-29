/**
 * @OnlyCurrentDoc
 *
 * PromeonWeb 無料採用Web診断フォーム 受付スクリプト（Google Apps Script）
 *
 * 権限：このスクリプトを紐づけたスプレッドシートのみ（spreadsheets.currentonly）と
 *       メール送信のみ（script.send_mail）。Drive全体・Gmailの読み取りは使いません。
 *
 * 動き：
 *   1. LPのフォームから送られた内容をスプレッドシートに1行追加
 *   2. 担当者（NOTIFY_EMAIL）に通知メールを送信
 *   3. 申込者に受付完了の自動返信メールを送信（SEND_AUTO_REPLY が true のとき）
 *
 * 設定手順は README.md の「フォーム送信（Google Apps Script）の設定」を参照。
 */

/* ---------------------------------------------------------
   【要設定】ここを書き換えてください
   --------------------------------------------------------- */
const SETTINGS = {
  // 通知を受け取るメールアドレス（既存の問い合わせ用アドレス）
  NOTIFY_EMAIL: 'satokazu.promeon@gmail.com',

  // 自動返信メールの差出人名
  SENDER_NAME: 'PromeonWeb',

  // 申込者への自動返信を送るか
  SEND_AUTO_REPLY: true,

  // 自動返信に書く「診断結果の返信目安」（LPの完了メッセージと合わせる）
  REPLY_DAYS_TEXT: '3営業日以内',

  // 記録するシート名（なければ自動で作成されます）
  SHEET_NAME: '診断申込',
};

const COLUMNS = [
  ['receivedAt', '受付日時'],
  ['company', '会社名'],
  ['name', 'お名前'],
  ['email', 'メールアドレス'],
  ['tel', '電話番号'],
  ['industry', '業種'],
  ['url', 'ホームページURL'],
  ['concerns', 'お悩み'],
  ['message', 'その他・ご質問'],
  ['page', '送信元ページ'],
  ['status', '対応状況'],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const p = (e && e.parameter) || {};

    // スパム対策：見えない欄に入力があれば記録しない
    if (p.website) return json_({ ok: true });

    const record = {
      receivedAt: new Date(),
      company: clean_(p.company, 100),
      name: clean_(p.name, 60),
      email: clean_(p.email, 120),
      tel: clean_(p.tel, 30),
      industry: clean_(p.industry, 20),
      url: clean_(p.url, 300),
      concerns: clean_(p.concerns, 300),
      message: clean_(p.message, 2000),
      page: clean_(p.page, 300),
      status: '未対応',
    };

    if (!record.company || !record.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      return json_({ ok: false, error: 'invalid' });
    }

    const sheet = getSheet_();
    sheet.appendRow(COLUMNS.map(function (c) { return record[c[0]]; }));

    notifyOwner_(record);
    if (SETTINGS.SEND_AUTO_REPLY) autoReply_(record);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/** 動作確認用：ブラウザでウェブアプリのURLを開くと表示されます */
function doGet() {
  return ContentService.createTextOutput('PromeonWeb form handler is running.');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS.SHEET_NAME);
    sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}

function notifyOwner_(r) {
  const subject = '【無料診断の申込】' + r.company + ' ' + r.name + '様';
  const body = [
    '無料採用Web診断の申し込みがありました。',
    '',
    '会社名　　：' + r.company,
    'お名前　　：' + r.name,
    'メール　　：' + r.email,
    '電話番号　：' + (r.tel || '（未入力）'),
    '業種　　　：' + r.industry,
    'HP URL　　：' + (r.url || '（なし）'),
    'お悩み　　：' + (r.concerns || '（未選択）'),
    'その他　　：' + (r.message || '（なし）'),
    '',
    '受付日時　：' + Utilities.formatDate(r.receivedAt, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'),
    '送信元　　：' + r.page,
    '',
    '記録先：' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ].join('\n');

  MailApp.sendEmail({
    to: SETTINGS.NOTIFY_EMAIL,
    subject: subject,
    body: body,
    replyTo: r.email,
    name: SETTINGS.SENDER_NAME + ' LP',
  });
}

function autoReply_(r) {
  const subject = '【PromeonWeb】無料採用Web診断のお申し込みを受け付けました';
  const body = [
    r.company,
    r.name + ' 様',
    '',
    'このたびは無料採用Web診断にお申し込みいただき、ありがとうございます。',
    'PromeonWebです。',
    '',
    '御社の会社名での検索結果と、求人・採用情報を確認したうえで、',
    SETTINGS.REPLY_DAYS_TEXT + 'に診断結果をメールでお送りします。',
    '',
    '―― お申し込み内容 ――',
    '会社名：' + r.company,
    'お名前：' + r.name,
    '業種　：' + r.industry,
    'HP URL：' + (r.url || '（なし）'),
    '',
    '※このメールは送信専用の自動返信です。',
    '　ご質問などは ' + SETTINGS.NOTIFY_EMAIL + ' までご連絡ください。',
    '',
    '――――――――――――――',
    'PromeonWeb',
    '北海道札幌市',
    SETTINGS.NOTIFY_EMAIL,
  ].join('\n');

  MailApp.sendEmail({
    to: r.email,
    subject: subject,
    body: body,
    replyTo: SETTINGS.NOTIFY_EMAIL,
    name: SETTINGS.SENDER_NAME,
  });
}

/** 文字列を整え、長さを制限し、スプレッドシートの数式として解釈されないようにする */
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 設定確認用：エディタから実行すると、通知先にテストメールが届きます */
function testNotify() {
  notifyOwner_({
    receivedAt: new Date(),
    company: 'テスト株式会社',
    name: 'テスト太郎',
    email: SETTINGS.NOTIFY_EMAIL,
    tel: '',
    industry: '設備工事',
    url: '',
    concerns: '応募が来ない',
    message: 'これはテスト送信です',
    page: 'test',
  });
}
