/* 首頁「如何運作」：三個步驟＋左邊的動畫。
   - 滑過（或點、鍵盤聚焦）某一步：左邊立刻換成那一步的動畫
   - 自動輪播：每一步停 6 秒（進度條走完就換下一步）；滑鼠停在區塊上、鍵盤聚焦、離開畫面、
     按暫停鍵時都會停；使用者設定「減少動態效果」時不自動播放
   沒有 JavaScript 時，顯示第一步，三個步驟的文字仍完整可讀。 */
(function () {
  var root = document.querySelector('[data-how]');
  if (!root) return;
  var stage = root.querySelector('.how-stage');
  var rows = Array.prototype.slice.call(root.querySelectorAll('.how-row'));
  var caps = Array.prototype.slice.call(root.querySelectorAll('.how-cap'));
  var toggle = root.querySelector('[data-how-toggle]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var playing = !reduce;
  var active = 0;

  function set(i, fromUser) {
    active = (i + rows.length) % rows.length;
    var n = String(active + 1);
    root.dataset.step = n;
    stage.dataset.step = n;   // 換掉屬性：動畫選擇器改掛到新的場景，從頭播放
    rows.forEach(function (r, k) {
      var on = k === active;
      r.classList.toggle('is-on', on);
      if (on) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current');
    });
    caps.forEach(function (c, k) {
      var on = k === active, a = c.querySelector('a');
      c.classList.toggle('is-on', on);
      if (on) { c.removeAttribute('aria-hidden'); a.removeAttribute('tabindex'); }
      else { c.setAttribute('aria-hidden', 'true'); a.setAttribute('tabindex', '-1'); }
    });
    // 讓進度條重新開始
    var bar = rows[active].querySelector('.how-bar');
    bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
  }

  rows.forEach(function (r, k) {
    r.addEventListener('mouseenter', function (e) { if (k !== active) set(k, true); });
    r.addEventListener('focus', function () { if (k !== active) set(k, true); });
    r.addEventListener('click', function () { set(k, true); });
  });

  // 進度條走完 → 下一步
  root.addEventListener('animationend', function (e) {
    if (e.animationName === 'how-fill' && playing) set(active + 1);
  });

  function syncToggle() {
    root.classList.toggle('is-paused', !playing);
    toggle.setAttribute('aria-label', playing ? '暫停自動播放' : '開始自動播放');
  }
  toggle.addEventListener('click', function () {
    playing = !playing; syncToggle();
    if (playing) set(active); // 重新開始這一步的計時
  });

  // 滑鼠停在區塊上、鍵盤聚焦時暫停
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') root.classList.add('is-hover'); });
  root.addEventListener('pointerleave', function () { root.classList.remove('is-hover'); });
  root.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches(':focus-visible')) root.classList.add('is-hover'); });
  root.addEventListener('focusout', function () { root.classList.remove('is-hover'); });

  // 不在畫面內、或分頁在背景時暫停
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      root.classList.toggle('is-offscreen', !es[0].isIntersecting);
    }, { threshold: 0.25 }).observe(root);
  }
  document.addEventListener('visibilitychange', function () { root.classList.toggle('is-offscreen', document.hidden); });

  if (reduce) { root.querySelectorAll('.how-bar').forEach(function (b) { b.style.display = 'none'; }); }
  syncToggle();
})();
