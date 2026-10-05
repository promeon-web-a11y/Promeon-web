#!/usr/bin/env node
/* ============================================================
   日本語の文節の区切りに <wbr>（改行してよい位置）を入れるツール

   サイトのCSSは「<wbr> と句読点・空白の位置でだけ改行する」設定
   （word-break: keep-all）にしてあります。そのため、本文を書き換えたら
   このツールを実行して <wbr> を入れ直してください。入れ忘れると、
   その文章は文節で折り返されず、はみ出しそうな所で機械的に折れます。

   使い方（プロジェクトのルートで）:
     node docs/tools/phrase-breaks.mjs            9ページ＋プライバシーポリシーを処理
     node docs/tools/phrase-breaks.mjs --check    変更が必要なファイルを表示するだけ
     node docs/tools/phrase-breaks.mjs --print "文章"   区切りを入れた結果を表示
       （assets/js/site.js のデモ文言など、HTML以外に貼る文章用）

   文字は一切増減しません（<wbr> タグの追加・入れ直しだけ）。
   追加のインストールは不要です（Node.js だけで動きます）。

   文節の判定には、Google の BudouX の日本語モデル（budoux-ja.json、
   Apache License 2.0、https://github.com/google/budoux ）を使っています。
   Chrome の word-break: auto-phrase と同じ仕組みです。
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');

// 処理するHTML（ページを追加したらここに足す）
const FILES = [
  'index.html',
  'privacy.html',
  'services/recruitment-site/index.html',
  'services/recruitment-seo/index.html',
  'pricing/index.html',
  'diagnosis/index.html',
  'guides/index.html',
  'guides/recruitment-seo/index.html',
  'guides/recruitment-content/index.html',
  'guides/recruitment-operation/index.html',
];

const JA = /[぀-ヿ㐀-鿿]/;

/* ---------- BudouX の判定（公式の parser と同じ計算） ---------- */

const model = JSON.parse(readFileSync(path.join(HERE, 'budoux-ja.json'), 'utf8'));
const baseScore = -0.5 * Object.values(model).reduce((sum, group) => sum + Object.values(group).reduce((a, b) => a + b, 0), 0);
const weight = (group, key) => (model[group] && model[group][key]) || 0;

/** 文節の区切り位置（文字の番号）を返す */
function boundaries(s) {
  const result = [];
  for (let i = 1; i < s.length; i++) {
    if ((s.codePointAt(i - 1) ?? 0) > 0xffff) continue;
    const score = baseScore +
      weight('UW1', s.substring(i - 3, i - 2)) + weight('UW2', s.substring(i - 2, i - 1)) +
      weight('UW3', s.substring(i - 1, i)) + weight('UW4', s.substring(i, i + 1)) +
      weight('UW5', s.substring(i + 1, i + 2)) + weight('UW6', s.substring(i + 2, i + 3)) +
      weight('BW1', s.substring(i - 2, i)) + weight('BW2', s.substring(i - 1, i + 1)) + weight('BW3', s.substring(i, i + 2)) +
      weight('TW1', s.substring(i - 3, i)) + weight('TW2', s.substring(i - 2, i + 1)) +
      weight('TW3', s.substring(i - 1, i + 2)) + weight('TW4', s.substring(i, i + 3));
    if (score > 0) result.push(i);
  }
  return result;
}

/* ---------- HTMLへの適用 ---------- */

/** タグ以外の文章に <wbr> を入れる（script / style の中身とタグはそのまま） */
function addBreaks(html) {
  return html.replace(/<wbr\s*\/?>/g, '').replace(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/g, (all, tag, text) => {
    // 画面幅によってCSSで隠す <br> があるので、その位置でも改行できるようにしておく
    if (tag) return /^<br[\s/>]/i.test(tag) ? tag + '<wbr>' : tag;
    if (!JA.test(text) || text.includes('&')) return text;
    let out = '', last = 0;
    // 文節の区切りに加えて、「・」「｜」「／」の直後でも改行できるようにする（長い並列を1行に押し込まない）
    const points = new Set(boundaries(text));
    for (let i = 1; i < text.length; i++) if ('・｜／'.includes(text[i - 1])) points.add(i);
    for (const i of [...points].sort((x, y) => x - y)) {
      if (/\s/.test(text[i - 1]) || /\s/.test(text[i])) continue; // 空白の位置はもともと改行できる
      out += text.slice(last, i) + '<wbr>';
      last = i;
    }
    return out + text.slice(last);
  });
}

const args = process.argv.slice(2);
if (args[0] === '--print') {
  console.log(addBreaks(args.slice(1).join(' ')));
} else {
  const check = args.includes('--check');
  let changed = 0;
  for (const f of FILES) {
    const source = readFileSync(path.join(ROOT, f), 'utf8');
    // <body> より前（title や meta）は触らない
    const at = source.indexOf('<body');
    const next = source.slice(0, at) + addBreaks(source.slice(at));
    const count = (next.match(/<wbr>/g) || []).length;
    if (next.replace(/<wbr>/g, '') !== source.replace(/<wbr\s*\/?>/g, '')) throw new Error(f + ': 文字が変わってしまうため中止しました');
    if (next === source) { console.log(`変更なし  ${f}（<wbr> ${count}か所）`); continue; }
    changed++;
    if (!check) writeFileSync(path.join(ROOT, f), next);
    console.log(`${check ? '要更新  ' : '更新    '}${f}（<wbr> ${count}か所）`);
  }
  if (check && changed) process.exitCode = 1;
}
