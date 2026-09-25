/* 首頁案件輪播
   - 每 5 秒自動換下一張；滑鼠移入、鍵盤聚焦、拖曳中、分頁在背景時暫停
   - 手機左右滑、桌機用滑鼠拖曳、圓點、鍵盤左右鍵都能切換（沒有上一張／下一張／暫停按鈕）
   - 環狀輪播：到最後一張會接回第一張
   - 使用者設定「減少動態效果」時不自動播放
   沒有 JavaScript 時只顯示第一張，內容與連結不受影響。 */
(function () {
  var root = document.querySelector('[data-carousel]');
  if (!root) return;

  var stage = root.querySelector('.hc-stage');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.hc-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.hc-dot'));
  var stageBox = root.closest('.hero-stage');
  var bgLayers = stageBox ? Array.prototype.slice.call(stageBox.querySelectorAll('.hb-layer')) : [];
  var bgOn = -1;
  var n = slides.length;
  var INTERVAL = 5000;
  var SCALE = [1, 0.84, 0.7];
  var SWIPE = 50;

  var active = 0;
  var prevOff = [];
  var timer = null;
  var playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hovering = false, focused = false, dragging = false;

  function offsetOf(i) {
    var d = (((i - active) % n) + n) % n;
    return d > n / 2 ? d - n : d;
  }

  function render() {
    slides.forEach(function (el, i) {
      var off = offsetOf(i);
      // 從一側繞到另一側的那張：先隱藏、瞬間移過去，再淡入，避免橫跨整個畫面
      var wrapped = prevOff[i] !== undefined && Math.abs(off - prevOff[i]) > 2;
      if (wrapped) el.classList.add('is-jump');
      el.dataset.off = off;
      el.style.setProperty('--off', off);
      el.style.setProperty('--s', SCALE[Math.abs(off)]);
      if (wrapped) { void el.offsetWidth; el.classList.remove('is-jump'); }
      prevOff[i] = off;

      var isActive = off === 0;
      el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      el.tabIndex = isActive ? 0 : -1;
    });
    dots.forEach(function (d, i) {
      if (i === active) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    setBackground();
  }


  /* 首屏背景：把目前案件的主圖模糊後當背景，兩層交替淡入淡出 */
  function setBackground() {
    if (bgLayers.length < 2) return;
    var img = slides[active].querySelector('img');
    if (!img) return;
    var next = (bgOn + 1) % bgLayers.length;
    var layer = bgLayers[next];
    layer.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
    layer.style.backgroundPosition = getComputedStyle(img).objectPosition || 'center';
    layer.classList.add('is-on');
    if (bgOn >= 0) bgLayers[bgOn].classList.remove('is-on');
    bgOn = next;
  }

  function go(i) {
    active = ((i % n) + n) % n;
    render();
    restart();
  }
  function next() { go(active + 1); }
  function prev() { go(active - 1); }

  function restart() {
    clearTimeout(timer);
    timer = null;
    if (playing && !hovering && !focused && !dragging && !document.hidden) {
      timer = setTimeout(next, INTERVAL);
    }
  }

  // 圓點
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });

  // 鍵盤左右鍵
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  // 暫停：滑鼠移入、鍵盤聚焦（點擊造成的聚焦不算）、分頁在背景
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; restart(); } });
  root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; restart(); } });
  root.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches(':focus-visible')) { focused = true; restart(); }
  });
  root.addEventListener('focusout', function () { focused = false; restart(); });
  document.addEventListener('visibilitychange', restart);

  // 左右滑動（觸控與滑鼠拖曳）
  var startX = null, dx = 0, moved = false, suppressClick = false, pointerId = null;

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX; dx = 0; moved = false; pointerId = e.pointerId;
    dragging = true; restart();
  });
  stage.addEventListener('pointermove', function (e) {
    if (startX === null) return;
    dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      root.classList.add('is-dragging');
      try { stage.setPointerCapture(pointerId); } catch (err) { /* 忽略 */ }
    }
    if (moved) stage.style.setProperty('--drag', dx + 'px');
  });
  function endDrag() {
    if (startX === null) return;
    var d = dx, didMove = moved;
    startX = null; dragging = false; moved = false;
    root.classList.remove('is-dragging');
    stage.style.setProperty('--drag', '0px');
    if (didMove) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      if (d <= -SWIPE) { next(); return; }
      if (d >= SWIPE) { prev(); return; }
    }
    restart();
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // 點擊：剛拖曳完不算；點旁邊的卡片是把它移到中間，只有中間那張才連到案件頁
  stage.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    var el = e.target.closest ? e.target.closest('.hc-slide') : null;
    if (el && el.dataset.off !== '0') { e.preventDefault(); go(slides.indexOf(el)); }
  }, true);

  render();
  // 下一個畫格才開啟過場，避免初始位置閃動
  requestAnimationFrame(function () {
    root.classList.add('is-ready');
    restart();
  });
})();
