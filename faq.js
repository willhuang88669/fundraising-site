/* 常見問題
   1. 用網址的 #q8 這類錨點連到某一題時，自動展開那一題。
   2. 搜尋：用 ?q=關鍵字 或搜尋列，只顯示相關的題目。
   3. 每則答案底部的「這個回答有幫助嗎？」；選「沒有」會帶著這一題去聯絡客服。
   沒有 JavaScript 時，題目仍可用點擊展開。 */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.faq-group'));
  var input = document.getElementById('faq-q');
  var status = document.getElementById('faq-status');

  // 先記下每題的文字，再加上回饋列（避免回饋列的字進入搜尋）
  var index = items.map(function (el) {
    return {
      el: el,
      title: el.querySelector('.faq-title').textContent,
      body: el.querySelector('.faq-a').textContent
    };
  });

  /* ---------- 1. 錨點 ---------- */
  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView({ block: 'start' });
    }
  }

  /* ---------- 2. 搜尋 ---------- */
  var STOP = ['怎麼', '什麼', '可以', '麼辦', '為什', '是不'];
  function grams(q) {
    var t = q.replace(/[\s，。？！、,.?!「」『』（）()]/g, '');
    if (t.length < 2) return t ? [t] : [];
    var out = [];
    for (var i = 0; i < t.length - 1; i++) {
      var g = t.substr(i, 2);
      if (STOP.indexOf(g) < 0) out.push(g);
    }
    return out;
  }
  function search(q) {
    q = q.trim();
    var closeAuto = function () {
      items.forEach(function (el) { if (el.dataset.auto) { el.open = false; delete el.dataset.auto; } });
    };
    closeAuto();
    if (!q) {
      items.forEach(function (el) { el.hidden = false; });
      groups.forEach(function (g) { g.hidden = false; });
      if (status) status.hidden = true;
      return;
    }
    var compact = q.replace(/\s+/g, '');
    var exact = index.filter(function (r) { return (r.title + r.body).indexOf(compact) >= 0; });
    var hit;
    if (exact.length) {
      hit = exact;
    } else {
      var gs = grams(q);
      hit = index.filter(function (r) {
        return gs.some(function (g) { return (r.title + r.body).indexOf(g) >= 0; });
      });
    }
    var set = hit.map(function (r) { return r.el; });
    items.forEach(function (el) { el.hidden = set.indexOf(el) < 0; });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.faq-item:not([hidden])'); });
    if (set.length && set.length <= 3) set.forEach(function (el) { if (!el.open) { el.open = true; el.dataset.auto = '1'; } });
    if (status) {
      status.hidden = false;
      status.innerHTML = '';
      if (set.length) {
        status.textContent = '找到 ' + set.length + ' 題相關的問題。';
      } else {
        status.appendChild(document.createTextNode('找不到相關內容。你可以換個說法，或直接'));
        var a = document.createElement('a');
        a.href = 'support.html#contact';
        a.textContent = '聯絡我們';
        status.appendChild(a);
        status.appendChild(document.createTextNode('。'));
      }
    }
  }
  if (input) {
    var form = input.form;
    var params = new URLSearchParams(location.search);
    if (params.get('q')) { input.value = params.get('q'); search(input.value); }
    input.addEventListener('input', function () { search(input.value); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      search(input.value);
      try { history.replaceState(null, '', input.value ? '?q=' + encodeURIComponent(input.value) : location.pathname); } catch (err) { /* 忽略 */ }
    });
  }

  /* ---------- 3. 這個回答有幫助嗎？ ---------- */
  index.forEach(function (r) {
    var fb = document.createElement('div');
    fb.className = 'faq-fb';
    fb.innerHTML = '<span class="faq-fb-q">這個回答有幫助嗎？</span>' +
      '<button type="button" class="faq-fb-btn" data-v="yes" aria-pressed="false">有</button>' +
      '<button type="button" class="faq-fb-btn" data-v="no" aria-pressed="false">沒有</button>' +
      '<p class="faq-fb-msg" role="status" aria-live="polite"></p>';
    r.el.querySelector('.faq-a').appendChild(fb);
    var msg = fb.querySelector('.faq-fb-msg');
    fb.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.faq-fb-btn') : null;
      if (!btn) return;
      Array.prototype.forEach.call(fb.querySelectorAll('.faq-fb-btn'), function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      msg.innerHTML = '';
      if (btn.dataset.v === 'yes') {
        msg.textContent = '謝謝你的回饋。';
      } else {
        msg.appendChild(document.createTextNode('很抱歉沒有解決你的問題。你可以'));
        var a = document.createElement('a');
        // 自動帶入剛才看的問題，客服才知道你卡在哪
        a.href = 'support.html?from=' + encodeURIComponent(r.el.id) + '&title=' + encodeURIComponent(r.title) + '#contact';
        a.textContent = '聯絡我們';
        msg.appendChild(a);
        msg.appendChild(document.createTextNode('。'));
      }
    });
  });

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
