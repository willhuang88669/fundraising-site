/* 全站頁面兩側的飄移太陽／星星。
   - 放在內容區（最寬 1280px）外面的左右留白，不會壓到任何區塊邊框（水平位置由 theme.css 決定）
   - 垂直位置用 JS 算：平均分布在頁首下緣到頁尾上緣之間，所以不管頁面長短都不會卡到頁首頁尾
   - 數量依頁面高度調整，最多 16 個；視窗大小改變時重新排 */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var SPARKLE = 'M50 2C50 30 30 50 2 50 30 50 50 70 50 98 50 70 70 50 98 50 70 50 50 30 50 2Z';

  function sun(id, color) {
    var rays = [[50,2,50,18],[50,82,50,98],[2,50,18,50],[82,50,98,50],[16,16,27,27],[73,73,84,84],[16,84,27,73],[73,27,84,16]]
      .map(function (l) { return '<line x1="' + l[0] + '" y1="' + l[1] + '" x2="' + l[2] + '" y2="' + l[3] + '"/>'; }).join('');
    return '<symbol id="' + id + '" viewBox="0 0 100 100"><g stroke="' + color + '" stroke-width="8" stroke-linecap="round">' + rays +
      '</g><circle cx="50" cy="50" r="23" fill="' + color + '" stroke="#2F2F2F" stroke-width="5"/></symbol>';
  }
  function sparkle(id, color) {
    return '<symbol id="' + id + '" viewBox="0 0 100 100"><path d="' + SPARKLE + '" fill="' + color +
      '" stroke="#2F2F2F" stroke-width="4" stroke-linejoin="round"/></symbol>';
  }

  // 首頁的 SVG 圖庫已經有這些圖形；其他頁面沒有，就補一份
  if (!document.getElementById('y2k-sparkle-o')) {
    var sprite = document.createElementNS(NS, 'svg');
    sprite.setAttribute('width', '0');
    sprite.setAttribute('height', '0');
    sprite.setAttribute('aria-hidden', 'true');
    sprite.style.position = 'absolute';
    sprite.innerHTML = sun('y2k-sun', '#F2C343') + sun('y2k-sun-o', '#EC6630') +
      sparkle('y2k-sparkle', '#5DB3C8') + sparkle('y2k-sparkle-o', '#EC6630');
    document.body.insertBefore(sprite, document.body.firstChild);
  }

  // [左右, 大小, 圖形, 動畫秒數, 起始延遲, 水平微調]
  var PATTERN = [
    ['l', 48, 'sun', 7.5, 0.0, -8], ['r', 30, 'sparkle', 6.0, 1.2, 10],
    ['l', 26, 'sparkle-o', 5.5, 0.6, 14], ['r', 44, 'sun', 8.0, 2.0, -6],
    ['l', 38, 'sun', 6.5, 1.5, 6], ['r', 28, 'sparkle-o', 5.0, 0.3, -12],
    ['l', 30, 'sparkle', 7.0, 2.4, -10], ['r', 50, 'sun', 8.5, 0.9, 4],
    ['l', 46, 'sun', 7.2, 0.2, 10], ['r', 26, 'sparkle', 5.8, 1.8, 12],
    ['l', 28, 'sparkle-o', 6.2, 1.1, -14], ['r', 40, 'sun', 7.8, 2.6, -8],
    ['l', 40, 'sun', 8.2, 0.7, 2], ['r', 30, 'sparkle-o', 5.4, 1.4, 8],
    ['l', 26, 'sparkle', 6.6, 2.1, 12], ['r', 34, 'sun', 7.0, 0.5, -10]
  ];

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  function place() {
    layer.innerHTML = '';
    var header = document.querySelector('.site-header');
    var footer = document.querySelector('.site-footer');
    var top = (header ? header.offsetTop + header.offsetHeight : 0) + 60;
    var bottom = (footer ? footer.offsetTop : document.body.scrollHeight) - 80;
    var span = bottom - top;
    if (span < 200) return;
    var n = Math.min(PATTERN.length, Math.max(4, Math.round(span / 260)));
    for (var i = 0; i < n; i++) {
      var p = PATTERN[i];
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'y2k-side-deco y2k-side-' + p[0]);
      svg.setAttribute('style', 'top:' + Math.round(top + span * (i + 0.5) / n - p[1] / 2) + 'px;--s:' + p[1] +
        'px;--dur:' + p[3] + 's;--delay:-' + p[4] + 's;--dx:' + p[5] + 'px');
      var use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#y2k-' + p[2]);
      svg.appendChild(use);
      layer.appendChild(svg);
    }
  }

  var timer = null;
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(place, 150); });
  window.addEventListener('load', place);
  place();
})();
