/* 後台通知：標示已讀／未讀、篩選、全部標為已讀；未讀數同步到側欄與後台的「最新通知」。
   已讀狀態存在這個瀏覽器（localStorage），沒有 JavaScript 時仍可閱讀所有通知。 */
(function () {
  var KEY = 'notif_read_v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* 忽略 */ } }
  var read = load();
  var items = Array.prototype.slice.call(document.querySelectorAll('.nt'));
  var mini = Array.prototype.slice.call(document.querySelectorAll('.nt-mini li'));

  // 頁面預設的未讀：原本標示未讀、且 id 不在已讀清單裡
  var initial = {};
  items.concat(mini).forEach(function (el) {
    var id = el.dataset.id;
    if (!(id in initial)) initial[id] = el.classList.contains('is-unread');
  });
  function isUnread(id) { return initial[id] && read.indexOf(id) < 0; }

  function paint() {
    var n = 0;
    items.forEach(function (el) {
      var u = isUnread(el.dataset.id);
      el.classList.toggle('is-unread', u);
      var b = el.querySelector('.nt-dot');
      if (b) {
        b.setAttribute('aria-pressed', u ? 'false' : 'true');
        b.setAttribute('aria-label', u ? '標示為已讀' : '標示為未讀');
      }
    });
    Object.keys(initial).forEach(function (id) { if (isUnread(id)) n++; });
    mini.forEach(function (el) {
      var u = isUnread(el.dataset.id);
      el.classList.toggle('is-unread', u);
      el.classList.toggle('is-read', !u);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-unread-count]'), function (e) { e.textContent = n; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-unread-badge]'), function (e) {
      e.textContent = n; e.hidden = n === 0; e.setAttribute('aria-label', n + ' 則未讀通知');
    });
    var chip = document.getElementById('nt-unread-chip');
    if (chip) chip.hidden = n === 0;
  }

  items.forEach(function (el) {
    var b = el.querySelector('.nt-dot');
    if (b) b.addEventListener('click', function () {
      var id = el.dataset.id, i = read.indexOf(id);
      if (i < 0) read.push(id); else read.splice(i, 1);
      save(read); paint();
    });
    // 點「前往處理」的連結也算已讀
    Array.prototype.forEach.call(el.querySelectorAll('.nt-cta a'), function (a) {
      a.addEventListener('click', function () {
        if (read.indexOf(el.dataset.id) < 0) { read.push(el.dataset.id); save(read); }
      });
    });
  });

  var all = document.getElementById('nt-read-all');
  if (all) all.addEventListener('click', function () {
    Object.keys(initial).forEach(function (id) { if (read.indexOf(id) < 0) read.push(id); });
    save(read); paint();
  });

  // 篩選
  var pills = Array.prototype.slice.call(document.querySelectorAll('.nt-filters .pill'));
  var empty = document.getElementById('nt-empty');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nt-group'));
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var f = p.dataset.filter, shown = 0;
      pills.forEach(function (q) {
        var on = q === p;
        q.classList.toggle('is-active', on);
        q.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach(function (el) {
        var ok = f === 'all' || el.dataset.kind === f;
        el.hidden = !ok;
        if (ok) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('.nt:not([hidden])'); });
      if (empty) empty.hidden = shown !== 0;
    });
  });
  paint();
})();
