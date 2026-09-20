/* 捐贈頁：依縣市篩選案件。沒有 JavaScript 時顯示全部案件。
   網址加上 ?county=台北市 也能直接套用篩選。 */
(function () {
  var sel = document.getElementById('county-filter');
  var grid = document.getElementById('case-grid');
  if (!sel || !grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.case-card'));
  var count = document.getElementById('case-count');
  var empty = document.getElementById('case-empty');

  function apply() {
    var v = sel.value, shown = 0;
    cards.forEach(function (c) {
      var ok = !v || c.dataset.county === v;
      c.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;
    if (!v) count.textContent = count.dataset.default;
    else count.textContent = v + '共 ' + shown + ' 件進行中案件';
    try {
      var u = new URL(location.href);
      if (v) u.searchParams.set('county', v); else u.searchParams.delete('county');
      history.replaceState(null, '', u);
    } catch (e) { /* 忽略 */ }
  }
  sel.addEventListener('change', apply);
  document.getElementById('county-reset').addEventListener('click', function () { sel.value = ''; apply(); sel.focus(); });

  var q = new URLSearchParams(location.search).get('county');
  if (q && Array.prototype.some.call(sel.options, function (o) { return o.value === q; })) { sel.value = q; apply(); }
})();
