/* =========================================================
   PromeonWeb 採用LP  main.js
   ========================================================= */

/* ---------------------------------------------------------
   【要設定】ここだけ書き換えれば動きます（詳しくは README.md）
   --------------------------------------------------------- */
const CONFIG = {
  // Google Apps Script を「ウェブアプリ」としてデプロイしたときのURL
  // 例: https://script.google.com/macros/s/XXXXXXXXXXXX/exec
  GAS_ENDPOINT: '',

  // Googleアナリティクス4 の測定ID（例: G-XXXXXXXXXX）。空欄なら計測しません
  GA4_ID: '',

  // 問い合わせ用メールアドレス（フッターの表示に使います）
  CONTACT_EMAIL: 'contact@example.com',
};

(function () {
  'use strict';

  /* ---------- GA4（IDがあるときだけ読み込む） ---------- */
  function loadGA4(id) {
    if (!id) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
  }
  loadGA4(CONFIG.GA4_ID);

  function track(eventName, params) {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params || {});
  }

  /* ---------- CTAクリック計測（data-cta の値で場所を区別） ---------- */
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    if (el.tagName === 'BUTTON') return; // 送信ボタンは送信成功時に計測
    el.addEventListener('click', function () {
      track('cta_click', { cta_position: el.dataset.cta });
    });
  });

  /* ---------- 連絡先・年の表示 ---------- */
  document.querySelectorAll('[data-contact-email]').forEach(function (a) {
    a.href = 'mailto:' + CONFIG.CONTACT_EMAIL;
    a.textContent = CONFIG.CONTACT_EMAIL;
  });
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- スマホ下部の固定CTA ----------
     ファーストビューと診断フォームが見えている間は隠す */
  const sticky = document.getElementById('sticky-cta');
  const hero = document.querySelector('.hero');
  const diagnosis = document.getElementById('diagnosis');
  if (sticky && hero && diagnosis && 'IntersectionObserver' in window) {
    const visible = new Set();
    const stickyLink = sticky.querySelector('a');
    const so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
      });
      const show = visible.size === 0;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      stickyLink.tabIndex = show ? 0 : -1;
    });
    so.observe(hero);
    so.observe(diagnosis);
  }

  /* ---------- 診断フォーム ---------- */
  const form = document.getElementById('diagnosis-form');
  const done = document.getElementById('form-done');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(name, hasError) {
    const field = form.querySelector('[data-field="' + name + '"]');
    if (field) field.classList.toggle('has-error', hasError);
    return hasError;
  }

  function validate() {
    const data = new FormData(form);
    const errors = [
      setError('company', !String(data.get('company') || '').trim()),
      setError('name', !String(data.get('name') || '').trim()),
      setError('email', !EMAIL_RE.test(String(data.get('email') || '').trim())),
      setError('industry', !data.get('industry')),
    ];
    return !errors.some(Boolean);
  }

  // 入力し直したらエラー表示を消す
  form.addEventListener('input', function (e) {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('has-error');
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');

    if (!validate()) {
      statusEl.textContent = '入力内容をご確認ください。';
      statusEl.classList.add('is-error');
      const firstError = form.querySelector('.has-error input, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    const data = new FormData(form);

    // スパム対策：見えない欄に入力があれば送信したふりをして終了
    if (String(data.get('website') || '').trim()) {
      showDone();
      return;
    }

    if (!CONFIG.GAS_ENDPOINT) {
      statusEl.textContent = '送信先が未設定です（main.js の GAS_ENDPOINT を設定してください）。';
      statusEl.classList.add('is-error');
      console.warn('[PromeonWeb] CONFIG.GAS_ENDPOINT is empty.');
      return;
    }

    const body = new URLSearchParams();
    body.append('company', String(data.get('company')).trim());
    body.append('name', String(data.get('name')).trim());
    body.append('email', String(data.get('email')).trim());
    body.append('tel', String(data.get('tel') || '').trim());
    body.append('industry', String(data.get('industry') || ''));
    body.append('url', String(data.get('url') || '').trim());
    body.append('concerns', data.getAll('concerns').join(' / '));
    body.append('message', String(data.get('message') || '').trim());
    body.append('page', location.href);
    body.append('website', '');

    submitBtn.disabled = true;
    submitBtn.textContent = '送信しています…';

    try {
      // Apps Script はCORSヘッダーを返さないため no-cors で送る。
      // レスポンスは読めないので、通信エラーがなければ成功として扱う。
      await fetch(CONFIG.GAS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString(),
      });
      track('generate_lead', { form: 'diagnosis' });
      showDone();
    } catch (err) {
      console.error(err);
      statusEl.textContent = '送信できませんでした。通信環境をご確認のうえ、もう一度お試しいただくか、' + CONFIG.CONTACT_EMAIL + ' までメールでご連絡ください。';
      statusEl.classList.add('is-error');
      submitBtn.disabled = false;
      submitBtn.textContent = '無料で採用ページを診断する';
    }
  });

  function showDone() {
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }
})();
