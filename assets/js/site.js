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
    google: '<p class="search-query">地域名　事務職　未経験　求人</p><p class="search-caption">地域 × 職種 × 経験 × 条件</p><div class="search-lines"><strong>未経験から<wbr>始める<wbr>仕事を、<wbr>具体的に。</strong><p>研修の<wbr>流れ・<wbr>担当する<wbr>業務・<wbr>1年目の<wbr>働き方。<br>御社だから<wbr>答えられる<wbr>情報が、<wbr>求職者との<wbr>接点に<wbr>なります。</p></div>',
    ai: '<p class="search-query">未経験から<wbr>始められて、<wbr>研修が<wbr>ある<wbr>会社は？</p><p class="search-caption">自然な<wbr>言葉の<wbr>質問にも、<wbr>答えられる<wbr>情報を。</p><div class="search-lines"><strong>企業の<wbr>事実を、<wbr>明確に<wbr>揃える。</strong><p>勤務地、<wbr>募集職種、<wbr>働き方、<wbr>教育体制。<br>企業情報と<wbr>FAQを<wbr>整理し、<wbr>理解・<wbr>参照されやすい<wbr>状態を<wbr>目指します。</p></div>'
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
     すべて架空企業の制作サンプルです。実績として扱わないでください。
     文言の <wbr> は改行してよい位置（文節の区切り）。文言を変えたら
     node docs/tools/phrase-breaks.mjs --print "文章" の結果を貼ってください。 */
  var jobSamples = {
    office: {
      company: 'つむぎオフィス',
      catch: '日々の<wbr>仕事を、<wbr>チームで<wbr>支える。',
      title: 'あなたの<wbr>気配りが、<br>チームの<wbr>力に<wbr>なる。',
      intro: '仕事の<wbr>進め方を、<wbr>先輩と<wbr>一緒に<wbr>少しずつ。<wbr>チームで<wbr>確認しながら、<wbr>できる<wbr>ことを<wbr>増やしていきます。',
      work: '資料の<wbr>整理、<wbr>データ入力、<wbr>お問い合わせの<wbr>確認。<wbr>仲間と<wbr>連携しながら、<wbr>日々の<wbr>業務を<wbr>支える<wbr>仕事です。',
      benefits: ['未経験歓迎', '研修あり', 'チームで仕事'],
      image: '/assets/img/team.webp',
      alt: 'オフィスで仕事をするチーム',
      schedule: [['09:00', '今日の<wbr>業務を<wbr>チームで<wbr>確認'], ['09:30', '書類整理・<wbr>データ入力'], ['12:00', '昼休み'], ['13:00', '連絡対応・<wbr>資料作成'], ['18:00', '引き継ぎ・<wbr>退勤']]
    },
    food: {
      company: 'つむぎカフェ',
      catch: '一杯の<wbr>コーヒーから、<wbr>笑顔を。',
      title: '好きな<wbr>時間を、<br>誰かの笑顔に。',
      intro: '接客も、<wbr>ドリンクづくりも、<wbr>少しずつ。<wbr>先輩と<wbr>一緒に、<wbr>お客様が<wbr>心地よく<wbr>過ごせる<wbr>お店を<wbr>つくります。',
      work: 'ご注文の<wbr>受付、<wbr>ドリンクづくり、<wbr>お店の<wbr>準備。<wbr>お客様との<wbr>会話を<wbr>大切に<wbr>しながら、<wbr>チームで<wbr>店舗を<wbr>運営します。',
      benefits: ['接客の研修', 'シフト相談', 'チームで仕事'],
      image: '/assets/img/cafe.webp',
      alt: 'カフェでコーヒーを準備するスタッフ',
      schedule: [['09:00', '開店準備・<wbr>仕込み'], ['10:00', '接客・<wbr>ドリンクづくり'], ['12:00', '交代で<wbr>休憩'], ['13:00', '接客・<wbr>店内の<wbr>整理'], ['18:00', '引き継ぎ・<wbr>退勤']]
    },
    care: {
      company: 'つむぎケア',
      catch: '一人<wbr>ひとりの<wbr>毎日に、<wbr>寄り添う。',
      title: 'あなたの<wbr>やさしさが、<br>毎日の<wbr>安心に<wbr>なる。',
      intro: 'ご利用者の<wbr>生活を、<wbr>仲間と<wbr>支える。<wbr>研修や<wbr>先輩との<wbr>振り返りを<wbr>通じて、<wbr>一つ<wbr>ずつ<wbr>仕事を<wbr>学んでいきます。',
      work: '生活の<wbr>お手伝い、<wbr>活動の<wbr>サポート、<wbr>日々の<wbr>記録。<wbr>ご利用者の<wbr>ペースを<wbr>大切に<wbr>しながら、<wbr>チームで<wbr>ケアを<wbr>行います。',
      benefits: ['研修あり', '資格の相談', 'チームでケア'],
      image: '/assets/img/care.webp',
      alt: '高齢者の歩行を支援するスタッフ',
      schedule: [['09:00', '申し送り・<wbr>予定の<wbr>確認'], ['09:30', '生活・<wbr>活動の<wbr>サポート'], ['12:00', '交代で<wbr>休憩'], ['13:00', '活動支援・<wbr>記録'], ['18:00', '申し送り・<wbr>退勤']]
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
        byId('sample-catch').innerHTML = job.catch;
        byId('sample-title').innerHTML = job.title;
        byId('sample-intro').innerHTML = job.intro;
        byId('sample-work').innerHTML = job.work;
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
          p.append(b);
          p.insertAdjacentHTML('beforeend', row[1]);
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
