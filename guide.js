/* 發起求助的新手引導：從步驟 1 一路帶到送出審核。
   - 進入步驟 1 時先詢問要不要跟著引導；選「我自己來」就不再出現（右下角的「新手引導」按鈕可以隨時再打開）。
   - 引導時一次亮起一個區塊，旁邊的說明框告訴使用者怎麼填；區塊仍可直接填寫。
   - 每頁最後一步按「前往下一頁」會按下該頁的「儲存並繼續」，下一頁自動接著引導。
   - 進度存在這個瀏覽器（localStorage）；使用者設定「減少動態效果」時不做捲動動畫。 */
(function () {
  var KEY = 'nm-create-guide'; // on：引導中；off：使用者選擇自己來；done：已完成
  var page = (location.pathname.split('/').pop() || '').replace('.html', '');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function section(i) { return function () { return $$('.col-main > .form-section')[i]; }; }
  function closest(sel, up) { return function () { var el = $(sel); return el && el.closest(up); }; }
  function nextBtn() { return $('.form-actions .btn-primary'); }

  var PAGES = {
    'create-beneficiary': { n: 1, steps: [
      { el: function () { return $('.choice-grid'); }, t: '先選求助類型',
        d: '選最接近的一種就好。例如住院開刀選「重大傷病」，車禍選「意外事故」，房子被颱風吹壞選「災害」。' },
      { el: closest('input[name="who"]', '.form-section'), t: '您以什麼身分發起',
        d: '只有受益人本人，或受益人的法定代理人（例如未成年孩子的父母）可以發起。親友不能代為發起。' },
      { el: function () { return $$('.form-grid')[0]; }, t: '填寫受益人資料',
        d: '姓名請和身分證上一模一樣，案件頁會打碼顯示（例如王*明），讓捐款人核對收款戶名。電話和 Email 只用來聯絡您，不會公開。' },
      { el: closest('#beneficiary-county', '.field'), t: '選擇所在縣市',
        d: '這一欄必填。案件頁只會顯示縣市，不會顯示地址。' },
      { el: function () { return $('#account'); }, t: '建立募資人帳號',
        d: '如果您就是受益人本人，保留勾選「用上方的受益人資料建立帳號」，只要再填密碼和顯示名稱。顯示名稱可以用小名，例如「阿明媽媽」。' },
      { el: nextBtn, t: '這一頁完成了', d: '接下來寫案件說明與目標金額。', last: true }
    ] },
    'create-story': { n: 2, steps: [
      { el: section(0), t: '寫一個清楚的標題',
        d: '公式是「誰＋發生了什麼事」，例如「阿明的血癌化療與骨髓移植」。20 個字以內最好讀。' },
      { el: section(1), t: '說明狀況與需要', tool: 'outline',
        d: '照這三段寫就不會漏：目前的狀況、已經做了什麼、還缺什麼（款項會怎麼用）。按下面的按鈕，可以把這三段的小標題先放進框裡。' },
      { el: section(2), t: '設定目標金額',
        d: '把接下來需要的費用加起來，再扣掉保險或補助。金額合理具體，捐款人比較放心。之後想調高要重新審核。' },
      { el: function () { return $('.dropzone'); }, t: '上傳案件照片',
        d: '至少 1 張照片。可以拍病房、受損的房子、帳單（記得遮住個資）。不一定要拍到臉。' },
      { el: nextBtn, t: '這一頁完成了', d: '接下來確認幾項聲明。', last: true }
    ] },
    'create-declaration': { n: 3, steps: [
      { el: function () { return $('#declarations'); }, t: '逐項閱讀並勾選',
        d: '這些聲明是審核和處理爭議的依據，請看完每一項再勾選。全部勾選後才能繼續。' },
      { el: section(1), t: '案件頁會公開什麼',
        d: '確認一下哪些資料會被看到：打碼姓名、縣市、案件內容與照片會公開；完整姓名、證件與聯絡方式不會公開。' },
      { el: function () { return $('#next-btn'); }, t: '這一頁完成了', d: '最後一步：檢查內容，送出審核。', last: true }
    ] },
    'create-submit': { n: 4, steps: [
      { els: function () { return $$('.sum-card'); }, t: '最後檢查一次',
        d: '看看前面填的內容有沒有錯。要修改的話，按該區塊右上角的「編輯」回去改。' },
      { el: closest('.next-steps', '.form-section'), t: '送出之後會發生什麼',
        d: '平台審核內容，並請您完成身分驗證（拍證件與人臉）。兩者都通過，案件就會上架開放捐款。' },
      kycDone()
        ? { el: nextBtn, t: '準備好就送出吧', d: '確認沒問題後，按「送出審核」就完成了。您已經完成過身分驗證，審核一通過案件就會上架。', end: true }
        : { el: nextBtn, t: '準備好就送出吧', d: '確認沒問題後，按「送出審核」。下一步是身分驗證，完成後案件才能上架。', last: true }
    ] },
    'create-verify': { n: 5, steps: [
      { el: function () { return $('[data-kyc-part="id"]'); }, t: '拍攝身分證件',
        d: '上傳身分證正面和反面，四個角都要拍進去、不要反光。由法定代理人發起時，另外上傳戶口名簿等代理關係證明。' },
      { el: function () { return $('.kyc-face'); }, t: '人臉辨識',
        d: '按「開始人臉辨識」，用手機鏡頭自拍一段，系統會比對是不是證件上的本人。記得拿下口罩和帽子。' },
      { el: function () { return $('[data-kyc-part="bank"]'); }, t: '設定收款帳戶',
        d: '捐款人會直接匯款到這個帳戶。戶名要和證件上的姓名一樣，捐款頁會打碼顯示，讓捐款人自己核對。' },
      { el: function () { return $('[data-kyc-finish]'); }, t: '完成身分驗證', end: true,
        d: '都填好後按「完成身分驗證」，引導到這裡結束。現在不方便的話，也可以按「稍後再做」，之後在發起人後台完成。' }
    ] }
  };
  function kycDone() { try { return localStorage.getItem('nm-kyc') === 'done'; } catch (e) { return false; } }
  var conf = PAGES[page];
  if (!conf) return;

  function getState() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setState(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* 忽略 */ } }

  var steps = conf.steps, idx = 0, ring, box, launcher;

  function build() {
    ring = document.createElement('div');
    ring.className = 'guide-ring';
    ring.setAttribute('aria-hidden', 'true');
    box = document.createElement('div');
    box.className = 'guide-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', '新手引導');
    box.tabIndex = -1;
    document.body.appendChild(ring);
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var a = e.target.closest('[data-g]');
      if (!a) return;
      var act = a.getAttribute('data-g');
      if (act === 'next') go(idx + 1);
      else if (act === 'prev') go(idx - 1);
      else if (act === 'skip') { setState('off'); stop(); }
      else if (act === 'page') { setState('on'); var b = nextBtn(); if (b) b.click(); }
      else if (act === 'end') { setState('done'); stop(); }
      else if (act === 'outline') insertOutline();
    });
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-on')) { setState('off'); stop(); } });
  }

  function targets(s) { var r = s.els ? s.els() : [s.el()]; return r.filter(Boolean); }
  function rectOf(list) {
    var r = null;
    list.forEach(function (el) {
      var b = el.getBoundingClientRect();
      r = r ? { top: Math.min(r.top, b.top), left: Math.min(r.left, b.left), bottom: Math.max(r.bottom, b.bottom), right: Math.max(r.right, b.right) } : { top: b.top, left: b.left, bottom: b.bottom, right: b.right };
    });
    return r;
  }

  function go(i) {
    if (i < 0 || i >= steps.length) return;
    idx = i;
    var s = steps[i], list = targets(s);
    if (!list.length) { if (i + 1 < steps.length) go(i + 1); return; }
    var total = steps.length;
    var btns = '';
    if (i > 0) btns += '<button type="button" class="btn btn-secondary btn-sm" data-g="prev">上一步</button>';
    if (s.end) btns += '<button type="button" class="btn btn-primary btn-sm" data-g="end">完成引導</button>';
    else if (s.last) btns += '<button type="button" class="btn btn-primary btn-sm" data-g="page">前往下一頁</button>';
    else btns += '<button type="button" class="btn btn-primary btn-sm" data-g="next">下一步</button>';
    box.innerHTML =
      '<div class="guide-top"><span class="guide-count">第 ' + conf.n + '／' + (kycDone() ? 4 : 5) + ' 頁　' + (i + 1) + '／' + total + '</span>' +
      '<button type="button" class="guide-skip" data-g="skip">我自己來</button></div>' +
      '<b class="guide-t">' + s.t + '</b><p class="guide-d">' + s.d + '</p>' +
      (s.tool === 'outline' ? '<button type="button" class="btn btn-outline btn-sm guide-tool" data-g="outline">放入三段小標題</button>' : '') +
      '<div class="guide-actions">' + btns + '</div>';
    ring.classList.add('is-on');
    box.classList.add('is-on');
    var rr = rectOf(list), tall = (rr.bottom - rr.top) > window.innerHeight * 0.45;
    var phone = window.innerWidth <= 760; // 手機的說明框固定在底部，所以區塊一律捲到上方
    list[0].scrollIntoView({ block: (tall || phone) ? 'start' : 'center', behavior: reduce ? 'auto' : 'smooth' });
    place();
    setTimeout(place, reduce ? 0 : 400);
    box.focus({ preventScroll: true });
  }

  function place() {
    if (!box || !box.classList.contains('is-on')) return;
    var list = targets(steps[idx]);
    if (!list.length) return;
    var r = rectOf(list), pad = 8;
    ring.style.top = (r.top - pad) + 'px';
    ring.style.left = (r.left - pad) + 'px';
    ring.style.width = (r.right - r.left + pad * 2) + 'px';
    ring.style.height = (r.bottom - r.top + pad * 2) + 'px';
    if (window.innerWidth <= 760) { box.style.top = ''; box.style.left = ''; return; } // 手機：固定在畫面底部
    var vw = window.innerWidth, vh = window.innerHeight, m = 12, gap = 16;
    box.style.width = '';
    var bw = box.offsetWidth, bh = box.offsetHeight;
    var T = r.top - pad, B = r.bottom + pad, L = r.left - pad, R = r.right + pad;
    var top, left;
    if (B + gap + bh <= vh - m) { top = B + gap; left = clamp(L, m, vw - bw - m); }          // 放在區塊下方
    else if (T - gap - bh >= m) { top = T - gap - bh; left = clamp(L, m, vw - bw - m); }      // 放在區塊上方
    else {
      var side = Math.max(vw - R - gap - m, L - gap - m);
      if (side >= 260) {                                                                     // 放在區塊旁邊
        var w = Math.min(bw, side);
        box.style.width = w + 'px';
        bh = box.offsetHeight;
        left = (vw - R - gap - m >= w) ? R + gap : L - gap - w;
        top = clamp(Math.max(T, m), m, vh - bh - m);
      } else {                                                                               // 都放不下：放在區塊露出比較少的那一側角落
        left = vw - bw - m;
        top = (T > vh - B) ? m : vh - bh - m;
      }
    }
    box.style.top = top + 'px';
    box.style.left = left + 'px';
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function stop() {
    ring.classList.remove('is-on');
    box.classList.remove('is-on');
    if (launcher) launcher.focus();
  }

  function insertOutline() {
    var ta = $('textarea');
    if (!ta) return;
    var tpl = '【目前的狀況】\n\n\n【已經做了什麼】\n\n\n【還缺什麼、款項會怎麼用】\n';
    if (ta.value.indexOf('【目前的狀況】') === -1) ta.value = ta.value ? ta.value + '\n\n' + tpl : tpl;
    ta.focus();
    ta.setSelectionRange(9, 9);
  }

  function welcome() {
    box.innerHTML =
      '<div class="guide-top"><span class="guide-count">新手引導</span></div>' +
      '<b class="guide-t">第一次發起求助嗎？</b>' +
      '<p class="guide-d">跟著引導一步步填，每一格都會告訴您怎麼寫，大約 10 分鐘就能送出審核。</p>' +
      '<div class="guide-actions"><button type="button" class="btn btn-secondary btn-sm" data-g="skip">我自己來</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-g="start">跟著引導填寫</button></div>';
    box.classList.add('is-on', 'is-welcome');
    box.style.top = ''; box.style.left = '';
    box.querySelector('[data-g="start"]').addEventListener('click', function () {
      box.classList.remove('is-welcome'); setState('on'); go(0);
    });
    box.focus({ preventScroll: true });
  }

  build();
  launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'guide-launch';
  launcher.innerHTML = '<svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 17h.01"/></svg><span>新手引導</span>';
  launcher.addEventListener('click', function () { box.classList.remove('is-welcome'); setState('on'); go(0); });
  document.body.appendChild(launcher);

  // 在最後一頁直接按「送出審核」，也視為完成引導
  if (page === 'create-submit') { var sb = nextBtn(); if (sb) sb.addEventListener('click', function () { if (getState() === 'on') setState('done'); }); }

  var st = getState();
  if (st === 'on') go(0);
  else if (st === null && page === 'create-beneficiary') welcome();
})();
