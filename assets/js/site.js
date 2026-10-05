/* ============================================================
   PromeonWeb 採用サイト制作・採用SEO（9ページ共通）
   スマホメニュー / 検索タブ / スマホ型デモ / 診断フォーム

   フォームは既存の Google Apps Script 受付（gas/form-handler.gs）に送信します。
   ============================================================ */
(function () {
  'use strict';

  // Google Apps Script のウェブアプリURL（assets/js/main.js の CONFIG.GAS_ENDPOINT と同じもの）
  var GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzOtZm8ochX9cPmxAKuhGfN2qBDDQNqxMgxEcRn0epIa8xssP9KbTJeusoYLPotJRuv/exec';

  // 問い合わせ用メールアドレス。フッターの表示（各HTML）と揃えてください。
  var CONTACT_EMAIL = 'satokazu.promeon@gmail.com';

  /* ---------- スマホメニュー（全ページ） ---------- */
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('header nav');
  if (menuButton && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      menuButton.textContent = open ? '閉じる' : 'メニュー';
    };
    menuButton.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  /* ---------- Google検索 / AI検索 のタブ（トップ） ---------- */
  var searchText = {
    google: '<p class="search-query">地域名　事務職　未経験　求人</p><p class="search-caption">地域 × 職種 × 経験 × 条件</p><div class="search-lines"><strong>未経験から始める仕事を、具体的に。</strong><p>研修の流れ・担当する業務・1年目の働き方。<br>御社だから答えられる情報が、求職者との接点になります。</p></div>',
    ai: '<p class="search-query">未経験から始められて、研修がある会社は？</p><p class="search-caption">自然な言葉の質問にも、答えられる情報を。</p><div class="search-lines"><strong>企業の事実を、明確に揃える。</strong><p>勤務地、募集職種、働き方、教育体制。<br>企業情報とFAQを整理し、理解・参照されやすい状態を目指します。</p></div>'
  };
  var searchPanel = document.querySelector('#search-content');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  if (searchPanel && tabs.length) {
    var selectTab = function (tab) {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', String(t === tab));
        t.tabIndex = t === tab ? 0 : -1;
      });
      searchPanel.innerHTML = searchText[tab.dataset.search];
    };
    tabs.forEach(function (tab, i) {
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) === -1) return;
        e.preventDefault();
        var next = e.key === 'Home' ? 0
          : e.key === 'End' ? tabs.length - 1
          : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectTab(tabs[next]);
        tabs[next].focus();
      });
    });
  }

  /* ---------- スマホ型デモ（トップ） ----------
     すべて架空企業の制作サンプルです。実績として扱わないでください。 */
  var jobSamples = {
    office: {
      company: 'つむぎオフィス',
      catch: '日々の仕事を、チームで支える。',
      title: 'あなたの気配りが、<br>チームの力になる。',
      intro: '仕事の進め方を、先輩と一緒に少しずつ。チームで確認しながら、できることを増やしていきます。',
      work: '資料の整理、データ入力、お問い合わせの確認。仲間と連携しながら、日々の業務を支える仕事です。',
      benefits: ['未経験歓迎', '研修あり', 'チームで仕事'],
      image: '/assets/img/team.jpg',
      alt: 'オフィスで仕事をするチーム',
      schedule: [['09:00', '今日の業務をチームで確認'], ['09:30', '書類整理・データ入力'], ['12:00', '昼休み'], ['13:00', '連絡対応・資料作成'], ['18:00', '引き継ぎ・退勤']]
    },
    food: {
      company: 'つむぎカフェ',
      catch: '一杯のコーヒーから、笑顔を。',
      title: '好きな時間を、<br>誰かの笑顔に。',
      intro: '接客も、ドリンクづくりも、少しずつ。先輩と一緒に、お客様が心地よく過ごせるお店をつくります。',
      work: 'ご注文の受付、ドリンクづくり、お店の準備。お客様との会話を大切にしながら、チームで店舗を運営します。',
      benefits: ['接客の研修', 'シフト相談', 'チームで仕事'],
      image: '/assets/img/cafe.jpg',
      alt: 'カフェでコーヒーを準備するスタッフ',
      schedule: [['09:00', '開店準備・仕込み'], ['10:00', '接客・ドリンクづくり'], ['12:00', '交代で休憩'], ['13:00', '接客・店内の整理'], ['18:00', '引き継ぎ・退勤']]
    },
    care: {
      company: 'つむぎケア',
      catch: '一人ひとりの毎日に、寄り添う。',
      title: 'あなたのやさしさが、<br>毎日の安心になる。',
      intro: 'ご利用者の生活を、仲間と支える。研修や先輩との振り返りを通じて、一つずつ仕事を学んでいきます。',
      work: '生活のお手伝い、活動のサポート、日々の記録。ご利用者のペースを大切にしながら、チームでケアを行います。',
      benefits: ['研修あり', '資格の相談', 'チームでケア'],
      image: '/assets/img/care.jpg',
      alt: '高齢者の歩行を支援するスタッフ',
      schedule: [['09:00', '申し送り・予定の確認'], ['09:30', '生活・活動のサポート'], ['12:00', '交代で休憩'], ['13:00', '活動支援・記録'], ['18:00', '申し送り・退勤']]
    }
  };
  var jobButtons = Array.prototype.slice.call(document.querySelectorAll('[data-job]'));
  var phoneScroll = document.querySelector('.phone-scroll');
  var applyButton = document.querySelector('#sample-apply');
  var applyInfo = document.querySelector('#sample-apply-info');
  var byId = function (id) { return document.getElementById(id); };

  if (jobButtons.length && phoneScroll && applyButton && applyInfo) {
    jobButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var job = jobSamples[button.dataset.job];
        jobButtons.forEach(function (b) {
          b.classList.toggle('active', b === button);
          b.setAttribute('aria-pressed', String(b === button));
        });
        byId('sample-company').textContent = job.company;
        byId('sample-catch').textContent = job.catch;
        byId('sample-title').innerHTML = job.title;
        byId('sample-intro').textContent = job.intro;
        byId('sample-work').textContent = job.work;
        var photo = byId('sample-photo');
        photo.src = job.image;
        photo.alt = job.alt;
        byId('sample-benefits').replaceChildren.apply(byId('sample-benefits'), job.benefits.map(function (text) {
          var span = document.createElement('span');
          span.textContent = text;
          return span;
        }));
        byId('sample-schedule').replaceChildren.apply(byId('sample-schedule'), job.schedule.map(function (row) {
          var p = document.createElement('p');
          var b = document.createElement('b');
          b.textContent = row[0];
          p.append(b, document.createTextNode(row[1]));
          return p;
        }));
        applyInfo.hidden = true;
        applyButton.textContent = '応募の流れを見る';
        phoneScroll.scrollTop = 0;
      });
    });

    applyButton.addEventListener('click', function () {
      applyInfo.hidden = !applyInfo.hidden;
      applyButton.textContent = applyInfo.hidden ? '応募の流れを見る' : '応募の流れを閉じる';
      if (!applyInfo.hidden) applyInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ---------- 診断フォーム（トップ） ----------
     既存の Google Apps Script（gas/form-handler.gs）へ service=recruit で送ります。
     Apps Script はCORSヘッダーを返さないため no-cors で送り、レスポンスは読めません。
     そのため受付の成功・失敗は画面では判定できません。「送信処理を行った」ことだけを伝え、
     受付の確認は自動返信メールで行ってもらいます（受付完了と断定する表現は使わない）。 */
  var form = document.querySelector('#diagnosis-form');
  var result = document.querySelector('#form-result');
  if (form && result) {
    var submitButton = form.querySelector('button[type="submit"]');
    var submitLabel = submitButton.textContent;

    var mailLink = function () {
      var a = document.createElement('a');
      a.href = 'mailto:' + CONTACT_EMAIL;
      a.textContent = CONTACT_EMAIL;
      return a;
    };

    var show = function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      result.hidden = false;
      result.replaceChildren(p);
      return p;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);

      // スパム対策：見えない欄に入力があれば何も送らない
      if (String(d.get('website') || '').trim()) {
        form.reset();
        return;
      }

      var body = new URLSearchParams();
      body.append('service', 'recruit');
      ['company', 'name', 'email', 'url', 'role', 'message'].forEach(function (key) {
        body.append(key, String(d.get(key) || '').trim());
      });
      body.append('page', location.href);
      body.append('website', '');

      submitButton.disabled = true;
      submitButton.textContent = '送信しています…';
      result.hidden = true;

      fetch(GAS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString()
      }).then(function () {
        form.reset();
        show('送信処理を行いました。受付が完了すると、入力したメールアドレスに確認メールが届きます。メールが届かない場合は、迷惑メールフォルダをご確認のうえ、お問い合わせください。').after(mailLink());
      }).catch(function () {
        var p = show('送信処理を行えませんでした。通信環境をご確認のうえ、もう一度お試しいただくか、メールでご連絡ください。');
        p.after(mailLink());
      }).then(function () {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      });
    });
  }
})();
