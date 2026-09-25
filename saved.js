/* 典藏案件：捐款人可以在案件頁典藏案件，之後到會員中心的「典藏案件」追蹤。
   - 網頁初版沒有後端，典藏清單存在這個瀏覽器（localStorage）；正式版要改存在會員帳號。
   - 案件頁：有 data-save-case 的按鈕會切換典藏狀態，按鈕上的 data-case 是案件資料（JSON）。
   - 典藏頁：#saved-list 會列出所有典藏的案件，可以取消典藏。
   - 第一次使用時先放幾筆範例，畫面才不會是空的。 */
(function () {
  var KEY = 'nm-saved-cases';
  var SEEDED = 'nm-saved-seeded';
  var DEMO = [
    { id: 'c5', title: '罹患乳癌的林媽媽需要標靶治療', type: '重大傷病', county: '台南市', img: 'images/case-illness-room.jpg',
      desc: '乳癌第三期，健保給付之外的標靶藥物每月需自費數萬元。', target: 'NT$ 300,000', days: 17, update: '2026/09/22', savedAt: '2026/09/18' },
    { id: 'c2', title: '工地墜落受傷的小志復健之路', type: '意外事故', county: '高雄市', img: 'images/case-accident-crutches.jpg',
      desc: '從鷹架摔落導致腰椎骨折，手術後需要半年以上的復健，暫時無法工作。', target: 'NT$ 300,000', days: 25, update: '2026/09/19', savedAt: '2026/09/02' },
    { id: 'c4', title: '颱風後老家全毀的王奶奶重建家園', type: '災害', county: '台中市', img: 'images/case-disaster-house.jpg',
      desc: '獨居的王奶奶老家在颱風中屋頂被掀、牆面倒塌，急需修繕才能住回去。', target: 'NT$ 500,000', days: 0, update: '2026/09/10', savedAt: '2026/08/16' }
  ];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null && !localStorage.getItem(SEEDED)) {
        localStorage.setItem(SEEDED, '1');
        localStorage.setItem(KEY, JSON.stringify(DEMO));
        return DEMO.slice();
      }
      return JSON.parse(raw || '[]');
    } catch (e) { return DEMO.slice(); }
  }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 忽略 */ } }
  function has(list, id) { return list.some(function (c) { return c.id === id; }); }
  function today() {
    var d = new Date();
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  var ICON = '<svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

  /* ---------- 案件頁的典藏按鈕 ---------- */
  var buttons = document.querySelectorAll('[data-save-case]');
  function syncButtons() {
    var list = load();
    buttons.forEach(function (btn) {
      var c = JSON.parse(btn.getAttribute('data-case'));
      var on = has(list, c.id);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('is-saved', on);
      var label = btn.querySelector('[data-save-label]');
      if (label) label.textContent = on ? '已典藏' : '典藏案件';
      if (btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', on ? '取消典藏' : '典藏案件');
    });
  }
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = JSON.parse(btn.getAttribute('data-case'));
      var list = load();
      if (has(list, c.id)) {
        list = list.filter(function (x) { return x.id !== c.id; });
        toast('已取消典藏');
      } else {
        c.savedAt = today();
        list.unshift(c);
        toast('已加入典藏，可以到「我的留言 › 典藏案件」追蹤');
      }
      save(list);
      syncButtons();
    });
  });
  if (buttons.length) syncButtons();

  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'save-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ---------- 典藏頁 ---------- */
  var grid = document.getElementById('saved-list');
  if (!grid) return;
  var empty = document.getElementById('saved-empty');
  var count = document.querySelectorAll('[data-saved-count]');

  function card(c) {
    var ended = !c.days;
    return '<article class="card case-card saved-card" data-id="' + esc(c.id) + '">' +
      '<a href="campaign.html" tabindex="-1" aria-hidden="true"><img class="ph-case" src="' + esc(c.img) + '" alt="" width="1600" height="900" loading="lazy"></a>' +
      '<button type="button" class="saved-remove" data-remove aria-label="取消典藏：' + esc(c.title) + '">' + ICON + '</button>' +
      '<div class="case-body"><div class="row between"><span class="chip">' + esc(c.type) + '</span>' +
      (ended ? '<span class="chip chip-loc">已結案</span>' : '<span class="chip chip-ok">進行中</span>') + '</div>' +
      '<a class="case-title" href="campaign.html">' + esc(c.title) + '</a>' +
      '<p class="case-desc">' + esc(c.desc) + '</p>' +
      '<div class="saved-meta small muted"><span>最新近況 ' + esc(c.update) + '</span><span>典藏於 ' + esc(c.savedAt) + '</span></div>' +
      '<div class="case-foot"><b>目標 ' + esc(c.target) + '</b><span class="small muted">' + (ended ? '已結束募款' : '剩餘 ' + c.days + ' 天') + '</span></div>' +
      '</div></article>';
  }
  function render() {
    var list = load();
    grid.innerHTML = list.map(card).join('');
    grid.hidden = !list.length;
    if (empty) empty.hidden = !!list.length;
    count.forEach(function (el) { el.textContent = list.length; });
  }
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    var id = btn.closest('[data-id]').getAttribute('data-id');
    save(load().filter(function (c) { return c.id !== id; }));
    render();
    toast('已取消典藏');
  });
  render();
})();
