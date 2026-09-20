/* 發起求助 步驟 4：必要的聲明全部勾選後，才能前往下一步。
   沒有 JavaScript 時，按鈕仍可直接前往下一步。 */
(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input[data-required]'));
  var next = document.getElementById('next-btn');
  var err = document.getElementById('decl-err');
  if (!boxes.length || !next) return;

  function ok() { return boxes.every(function (b) { return b.checked; }); }
  function sync() {
    var done = ok();
    next.setAttribute('aria-disabled', done ? 'false' : 'true');
    if (done) err.hidden = true;
  }
  boxes.forEach(function (b) { b.addEventListener('change', sync); });
  next.addEventListener('click', function (e) {
    if (!ok()) { e.preventDefault(); err.hidden = false; var first = boxes.filter(function (b) { return !b.checked; })[0]; first.focus(); }
  });
  sync();
})();
