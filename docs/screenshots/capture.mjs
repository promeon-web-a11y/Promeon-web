#!/usr/bin/env node
/* ============================================================
   保存用スクリーンショットの再撮影スクリプト

   使い方（プロジェクトのルートで）:
     node docs/screenshots/capture.mjs
     node docs/screenshots/capture.mjs --base http://localhost:8000
     node docs/screenshots/capture.mjs --only mobile
     node docs/screenshots/capture.mjs --out C:/tmp/shots   （試し撮り用）
     node docs/screenshots/capture.mjs --serve              （撮影せず、http://localhost:8000 で表示確認だけ行う）
     node docs/screenshots/capture.mjs --ogp                （docs/ogp/ogp.html から assets/img/ogp.png を作り直す）

   追加のインストールは不要です。Node.js 22以上と、PCに入っている
   Chrome（なければ Edge）だけで動きます。
   --base を省略すると、このスクリプトがプロジェクトのルートを
   一時的にローカル配信して撮影します（本番には一切アクセスしません）。
   ============================================================ */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');

/* ---------- 設定（ページを追加・変更したらここを直す） ---------- */

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};

// 存在しないページ（HTTP 200以外）は撮影せず、「未撮影」として報告します。
const PAGES = [
  { name: '01-home', path: '/', firstView: true },
  { name: '02-recruitment-site', path: '/services/recruitment-site/' },
  { name: '03-recruitment-seo', path: '/services/recruitment-seo/' },
  { name: '04-pricing', path: '/pricing/' },
  { name: '05-diagnosis', path: '/diagnosis/' },
  { name: '06-guides', path: '/guides/' },
  { name: '07-guide-recruitment-seo', path: '/guides/recruitment-seo/' },
  { name: '08-guide-recruitment-content', path: '/guides/recruitment-content/' },
  { name: '09-guide-recruitment-operation', path: '/guides/recruitment-operation/' },
];

// 操作状態。click（CSSセレクタ）か clickText（ボタンの表示文字）で押す要素を探します。
// clip は撮影範囲：'viewport'＝画面そのまま／CSSセレクタ＝押した要素から見て一番近いその要素。
// 押す要素が見つからなければ撮影せず「未撮影」として報告します。
const INTERACTIONS = [
  { name: 'demo-office', label: 'スマホ型デモ：事務・オフィス', path: '/', viewport: 'desktop', clickText: '事務・オフィス', clip: '#demo' },
  { name: 'demo-food-retail', label: 'スマホ型デモ：飲食・小売', path: '/', viewport: 'desktop', clickText: '飲食・小売', clip: '#demo' },
  { name: 'demo-care-welfare', label: 'スマホ型デモ：介護・福祉', path: '/', viewport: 'desktop', clickText: '介護・福祉', clip: '#demo' },
  { name: 'faq-open', label: 'FAQを開いた状態', path: '/', viewport: 'desktop', click: '.faq-list summary', clip: 'section' },
  { name: 'mobile-menu-open', label: 'スマホメニューを開いた状態', path: '/', viewport: 'mobile', click: '.menu-toggle', clip: 'viewport' },
];

// Chromeが1枚で描ける高さには上限（約16,000px）があるため、
// これより長いページは分割して撮影し、1枚のPNGに結合します。
const CHUNK_HEIGHT = 8000;

/* ---------- 引数 ---------- */

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i === -1 ? null : process.argv[i + 1];
}
const BASE_ARG = arg('base');
const OUT = path.resolve(arg('out') || HERE);
const ONLY = arg('only'); // desktop / mobile / interactions
const SCALE = Number(arg('scale') || 1); // 2 にすると高精細（画像の横幅も2倍）

/* ---------- ローカル配信（--base を省略したとき） ---------- */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

function startStaticServer(port = 0) {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(ROOT, pathname);
      if (!file.startsWith(ROOT)) throw new Error('forbidden');
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ server, base: `http://${port ? 'localhost' : '127.0.0.1'}:${server.address().port}` }));
  });
}

/* ---------- ブラウザ（Chrome DevTools Protocol を直接使う） ---------- */

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ];
  return candidates.find((p) => p && existsSync(p));
}

async function launchBrowser() {
  const exe = findBrowser();
  if (!exe) throw new Error('Chrome / Edge が見つかりません。環境変数 CHROME_PATH に実行ファイルの場所を指定してください。');
  const profile = await mkdtemp(path.join(tmpdir(), 'promeon-shots-'));
  const proc = spawn(exe, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('ブラウザの起動がタイムアウトしました')), 30000);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve(m[1]); }
    });
    proc.on('exit', () => { clearTimeout(timer); reject(new Error('ブラウザが起動できませんでした')); });
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('ブラウザに接続できませんでした')); });

  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
    } else {
      for (const fn of listeners) fn(msg);
    }
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const close = async () => {
    try { await send('Browser.close'); } catch { /* すでに終了している */ }
    proc.kill();
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }).catch(() => {});
  };
  return { exe, send, listeners, close };
}

async function openTab(browser, vp) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => browser.send(method, params, sessionId);
  const errors = [];
  let onLoad = null;
  const listener = (msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Page.loadEventFired' && onLoad) onLoad();
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') errors.push(`${msg.params.entry.text} ${msg.params.entry.url || ''}`.trim());
  };
  browser.listeners.add(listener);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: SCALE, mobile: vp.mobile });
  if (vp.mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });

  return {
    errors,
    async goto(url) {
      errors.length = 0;
      const loaded = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('ページの読み込みがタイムアウトしました')), 45000);
        onLoad = () => { clearTimeout(timer); resolve(); };
      });
      await send('Page.navigate', { url });
      await loaded;
    },
    // ページ内で関数を実行して結果を受け取る
    async run(fn, ...args) {
      const { result, exceptionDetails } = await send('Runtime.evaluate', {
        expression: `(${fn})(...${JSON.stringify(args)})`, awaitPromise: true, returnByValue: true,
      });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
      return result.value;
    },
    async shot(file, clip) {
      const grab = async (c) => {
        const params = { format: 'png' };
        if (c) Object.assign(params, { captureBeyondViewport: true, clip: { ...c, scale: 1 } });
        return Buffer.from((await send('Page.captureScreenshot', params)).data, 'base64');
      };
      const step = Math.floor(CHUNK_HEIGHT / SCALE);
      let png;
      if (clip && clip.height > step) {
        const parts = [];
        for (let y = 0; y < clip.height; y += step) parts.push(await grab({ ...clip, y: clip.y + y, height: Math.min(step, clip.height - y) }));
        png = stitchPngs(parts);
      } else {
        png = await grab(clip);
      }
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, png);
    },
    async close() {
      browser.listeners.delete(listener);
      await browser.send('Target.closeTarget', { targetId });
    },
  };
}

/* ---------- PNGの結合（長いページ用） ---------- */

function decodePng(buf) {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const ch = buf[25] === 6 ? 4 : 3; // Chromeの出力は8bitのRGBかRGBA
  const idat = [];
  for (let p = 8; p < buf.length;) {
    const len = buf.readUInt32BE(p);
    if (buf.toString('latin1', p + 4, p + 8) === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const row = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? px[row + i - ch] : 0;
      const b = y > 0 ? px[row - stride + i] : 0;
      const c = i >= ch && y > 0 ? px[row - stride + i - ch] : 0;
      let v = raw[src + i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[row + i] = v;
    }
  }
  if (ch === 4) return { width, height, rgba: px };
  const rgba = Buffer.alloc(width * height * 4, 255);
  for (let i = 0, j = 0; i < px.length; i += 3, j += 4) px.copy(rgba, j, i, i + 3);
  return { width, height, rgba };
}

// 同じ横幅のPNGを縦につなげる
function stitchPngs(buffers) {
  const parts = buffers.map(decodePng);
  const width = parts[0].width;
  const height = parts.reduce((sum, p) => sum + p.height, 0);
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  let y = 0;
  for (const p of parts) {
    for (let r = 0; r < p.height; r++, y++) p.rgba.copy(raw, y * (stride + 1) + 1, r * stride, (r + 1) * stride);
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), out.length - 4);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- ページ内で実行する処理 ---------- */

// フォント・遅延読み込み画像・スクロール連動の表示を出し切ってから、最上部に戻す
async function settlePage() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const de = document.documentElement;
  await document.fonts.ready;
  const step = Math.max(200, Math.floor(innerHeight * 0.8));
  for (let y = 0; y < de.scrollHeight; y += step) {
    scrollTo({ top: y, behavior: 'instant' });
    await sleep(120);
  }
  scrollTo({ top: de.scrollHeight, behavior: 'instant' });
  await sleep(200);
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
    setTimeout(r, 8000);
  })));
  // スマホ型デモなど、内側でスクロールする枠は最上部に戻す
  document.querySelectorAll('*').forEach((el) => { if (el.scrollTop > 0 && el !== de && el !== document.body) el.scrollTop = 0; });
  document.querySelectorAll('iframe').forEach((f) => { try { f.contentWindow.scrollTo(0, 0); } catch { /* 別オリジン */ } });
  scrollTo({ top: 0, behavior: 'instant' });
  await sleep(500);
  await document.fonts.ready;

  const overflowing = [...document.querySelectorAll('body *')]
    .filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > de.clientWidth + 1)
    .slice(0, 5)
    .map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''));
  return {
    height: Math.max(de.scrollHeight, document.body.scrollHeight),
    overflowX: de.scrollWidth > de.clientWidth,
    overflowing,
    brokenImages: [...document.images].filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src),
  };
}

// 指定の要素を押し、撮影範囲（ページ座標）を返す。見つからなければ null
async function operate(spec) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  let target = null;
  if (spec.click) {
    target = [...document.querySelectorAll(spec.click)].find(visible) || null;
  } else if (spec.clickText) {
    target = [...document.querySelectorAll('button, [role="tab"], a, label, summary')]
      .filter((el) => visible(el) && el.textContent.includes(spec.clickText))
      .sort((a, b) => a.textContent.length - b.textContent.length)[0] || null;
  }
  if (!target) return null;
  target.scrollIntoView({ block: 'center', behavior: 'instant' });
  await sleep(200);
  target.click();
  await sleep(900);
  await document.fonts.ready;
  if (spec.clip === 'viewport') return { viewport: true };
  const box = target.closest(spec.clip) || target;
  box.querySelectorAll('*').forEach((el) => { if (el.scrollTop > 0) el.scrollTop = 0; });
  box.querySelectorAll('iframe').forEach((f) => { try { f.contentWindow.scrollTo(0, 0); } catch { /* 別オリジン */ } });
  await sleep(200);
  // 横は画面幅いっぱい、上下に少し余白を付けて切り抜く
  const r = box.getBoundingClientRect();
  const pad = 48;
  const top = Math.max(0, r.top + scrollY - pad);
  const bottom = Math.min(document.documentElement.scrollHeight, r.bottom + scrollY + pad);
  return { x: 0, y: top, width: document.documentElement.clientWidth, height: bottom - top };
}

/* ---------- 撮影 ---------- */

const results = [];
const rel = (file) => path.relative(OUT, file).replaceAll('\\', '/');

async function exists(url) {
  try {
    const res = await fetch(url);
    return res.status === 200 ? null : `HTTP ${res.status}`;
  } catch {
    return '接続できません';
  }
}

function warningsOf(info, tab) {
  const w = [];
  if (info.overflowX) w.push(`横はみ出しあり（${info.overflowing.join(', ') || '要素不明'}）`);
  if (info.brokenImages.length) w.push(`読み込めない画像: ${info.brokenImages.join(', ')}`);
  if (tab.errors.length) w.push(`コンソールエラー: ${[...new Set(tab.errors)].join(' / ')}`);
  return w;
}

async function capturePages(browser, base, vpName) {
  const vp = VIEWPORTS[vpName];
  for (const page of PAGES) {
    const file = path.join(OUT, vpName, `${page.name}.png`);
    const url = base + page.path;
    const missing = await exists(url);
    if (missing) {
      results.push({ file: rel(file), url, status: '未撮影', reason: `ページがありません（${missing}）` });
      if (page.firstView) results.push({ file: rel(file).replace('.png', '-first-view.png'), url, status: '未撮影', reason: `ページがありません（${missing}）` });
      continue;
    }
    const tab = await openTab(browser, vp);
    try {
      await tab.goto(url);
      const info = await tab.run(settlePage);
      const warnings = warningsOf(info, tab);
      if (page.firstView) {
        const fv = file.replace('.png', '-first-view.png');
        await tab.shot(fv);
        results.push({ file: rel(fv), url, status: '撮影', size: `${vp.width}×${vp.height}`, warnings });
      }
      await tab.shot(file, { x: 0, y: 0, width: vp.width, height: info.height });
      results.push({ file: rel(file), url, status: '撮影', size: `${vp.width}×${info.height}`, warnings });
    } catch (err) {
      results.push({ file: rel(file), url, status: '未撮影', reason: err.message });
    } finally {
      await tab.close();
    }
  }
}

async function captureInteractions(browser, base) {
  for (const it of INTERACTIONS) {
    const vp = VIEWPORTS[it.viewport];
    const file = path.join(OUT, 'interactions', `${it.name}.png`);
    const url = base + it.path;
    const missing = await exists(url);
    if (missing) {
      results.push({ file: rel(file), url, label: it.label, status: '未撮影', reason: `ページがありません（${missing}）` });
      continue;
    }
    const tab = await openTab(browser, vp);
    try {
      await tab.goto(url);
      await tab.run(settlePage);
      const clip = await tab.run(operate, it);
      if (!clip) {
        results.push({ file: rel(file), url, label: it.label, status: '未撮影', reason: '操作する要素が見つかりません（capture.mjs の INTERACTIONS を確認）' });
        continue;
      }
      await tab.shot(file, clip.viewport ? null : clip);
      const size = clip.viewport ? `${vp.width}×${vp.height}` : `${Math.round(clip.width)}×${Math.round(clip.height)}`;
      results.push({ file: rel(file), url, label: it.label, status: '撮影', size, warnings: tab.errors.length ? [`コンソールエラー: ${[...new Set(tab.errors)].join(' / ')}`] : [] });
    } catch (err) {
      results.push({ file: rel(file), url, label: it.label, status: '未撮影', reason: err.message });
    } finally {
      await tab.close();
    }
  }
}

// SNS共有用の画像（1200×630）を docs/ogp/ogp.html から作る
async function makeOgp() {
  const local = await startStaticServer();
  const browser = await launchBrowser();
  try {
    const tab = await openTab(browser, { width: 1200, height: 630, mobile: false });
    await tab.goto(local.base + '/docs/ogp/ogp.html');
    await tab.run(async () => {
      await document.fonts.ready;
      await new Promise((r) => { const img = new Image(); img.onload = img.onerror = r; img.src = '/assets/img/team.jpg'; });
      await new Promise((r) => setTimeout(r, 500));
    });
    const file = path.join(ROOT, 'assets', 'img', 'ogp.png');
    await tab.shot(file);
    console.log('作成しました: ' + file);
  } finally {
    await browser.close();
    local.server.close();
  }
}

async function main() {
  if (process.argv.includes('--ogp')) return makeOgp();
  if (process.argv.includes('--serve')) {
    const { base } = await startStaticServer(Number(arg('port') || 8000));
    console.log(`ローカル表示中: ${base}/  （終了は Ctrl+C）`);
    return;
  }
  if (typeof WebSocket === 'undefined') throw new Error('Node.js 22以上が必要です（現在: ' + process.version + '）');
  let local = null;
  let base = BASE_ARG && BASE_ARG.replace(/\/$/, '');
  if (!base) {
    local = await startStaticServer();
    base = local.base;
  }
  const browser = await launchBrowser();
  const startedAt = new Date();
  try {
    if (!ONLY || ONLY === 'desktop') await capturePages(browser, base, 'desktop');
    if (!ONLY || ONLY === 'mobile') await capturePages(browser, base, 'mobile');
    if (!ONLY || ONLY === 'interactions') await captureInteractions(browser, base);
  } finally {
    await browser.close();
    if (local) local.server.close();
  }

  const log = {
    capturedAt: startedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + ' (JST)',
    baseUrl: base + (local ? '（スクリプトによる一時ローカル配信）' : ''),
    browser: path.basename(browser.exe),
    viewports: VIEWPORTS,
    scale: SCALE,
    results,
  };
  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, 'last-run.json'), JSON.stringify(log, null, 2) + '\n');

  console.log(`\n撮影日時: ${log.capturedAt}\nURL: ${log.baseUrl}\n保存先: ${OUT}\n`);
  for (const r of results) {
    console.log(`${r.status === '撮影' ? '[OK]  ' : '[未撮影]'} ${r.file}${r.size ? '  ' + r.size : ''}${r.reason ? '  … ' + r.reason : ''}`);
    for (const w of r.warnings || []) console.log(`        ! ${w}`);
  }
  const ng = results.filter((r) => r.status !== '撮影').length;
  console.log(`\n撮影 ${results.length - ng} 件 / 未撮影 ${ng} 件（詳細は last-run.json）`);
}

main().catch((err) => { console.error('エラー: ' + err.message); process.exit(1); });
