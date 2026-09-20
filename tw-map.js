/* 首頁捐贈地圖：滑過（或點、鍵盤聚焦）縣市時，右側顯示該縣市的數字；離開後回到全台。
   數字寫在 HTML 裡（data-*），沒有 JavaScript 時仍可用表格查看。 */
(function () {
  var big = document.getElementById('map-big');
  var tag = document.getElementById('map-tag');
  var hint = document.getElementById('map-hint');
  var cs = Array.prototype.slice.call(document.querySelectorAll('.tw-c'));
  if (!big || !cs.length) return;

  var defBig = big.innerHTML, defTag = tag.textContent, defHint = hint.innerHTML;
  var current = null;

  function show(el) {
    if (current) current.classList.remove('is-on');
    current = el;
    el.classList.add('is-on');
    // 較小的縣市（例如台北市、基隆）會被畫在較大的縣市之上，這裡再把目前這個移到最上層，避免邊框被蓋住
    el.parentNode.appendChild(el);
    tag.textContent = el.dataset.name + '・過去 365 天';
    big.innerHTML = '<b>' + el.dataset.count + '</b> 次捐贈，共募得 <b>NT$ ' + el.dataset.amount + '</b>';
    hint.textContent = '再點一次同一個縣市，或移開滑鼠，回到全台。';
  }
  function reset() {
    if (current) current.classList.remove('is-on');
    current = null;
    tag.textContent = defTag; big.innerHTML = defBig; hint.innerHTML = defHint;
  }

  cs.forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('click', function () { if (current === el && el.dataset.tapped) { delete el.dataset.tapped; reset(); } else { show(el); el.dataset.tapped = '1'; } });
    el.addEventListener('blur', function () { delete el.dataset.tapped; });
  });
  var svg = document.querySelector('.tw-svg');
  svg.addEventListener('mouseleave', reset);
  // 點地圖以外的地方回到全台
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.tw-svg')) reset(); });
})();
