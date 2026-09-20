/* 聯絡客服
   - 選擇問題類別後，先顯示相關的常見問題，再顯示填寫資料的欄位
   - 依類別顯示「案件編號」、調整 Email 標籤與提示
   - 檢舉可疑案件：不在這裡送出，導向檢舉表單
   - 從常見問題按「沒有」進來時，帶入剛才看的問題
   - 欄位檢查與錯誤訊息；通過後前往「我們收到你的訊息了」
   這是介面示意，尚未串接後端。 */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var form = $('contact-form');
  if (!form) return;

  var MAX_FILES = 3, MAX_MB = 5, MIN_CHARS = 10;
  var cats = Array.prototype.slice.call(form.querySelectorAll('input[name="cat"]'));
  var sug = $('sp-sug'), step2 = $('sp-step2'), reportBox = $('sp-report');
  var caseWrap = $('sp-case-wrap'), emailLabel = $('sp-email-label'), need = $('sp-need');

  function show(el, on) { el.hidden = !on; }
  function err(id, on, text) {
    var el = $(id);
    if (text) el.textContent = text;
    show(el, on);
    return on;
  }

  /* ---------- 選擇類別 ---------- */
  function onCat(r) {
    var key = r.value;
    err('err-cat', false);
    sug.innerHTML = '';
    var tpl = $('sug-' + key);
    if (tpl) {
      sug.appendChild(tpl.content.cloneNode(true));
      var more = document.createElement('p');
      more.className = 'sp-sug-more';
      more.textContent = '看完還是需要協助的話，請繼續填寫下面的資料。';
      sug.appendChild(more);
    }
    show(sug, !!tpl);
    var isReport = key === 'report';
    show(reportBox, isReport);
    show(step2, !isReport);
    show(caseWrap, r.dataset.case === '1');
    emailLabel.textContent = r.dataset.elabel + '（必填）';
    var n = r.dataset.need;
    need.textContent = n ? '這類問題請提供：' + n + '。' : '';
    show(need, !!n);
  }
  cats.forEach(function (r) { r.addEventListener('change', function () { onCat(r); }); });

  /* ---------- 從常見問題帶入 ---------- */
  var params = new URLSearchParams(location.search);
  if (params.get('title')) {
    $('sp-from-title').textContent = '〈' + params.get('title') + '〉';
    show($('sp-from'), true);
  }

  /* ---------- 附件 ---------- */
  var fileInput = $('sp-file'), fileList = $('sp-files');
  fileInput.addEventListener('change', function () {
    fileList.innerHTML = '';
    var files = Array.prototype.slice.call(fileInput.files);
    var msg = '';
    if (files.length > MAX_FILES) msg = '最多只能附 [' + MAX_FILES + '] 個檔案。';
    files.forEach(function (f) {
      if (msg) return;
      if (!/^image\/(jpeg|png)$/.test(f.type)) msg = '只能上傳 JPG 或 PNG 圖片。';
      else if (f.size > MAX_MB * 1024 * 1024) msg = '檔案超過 [' + MAX_MB + '] MB，請縮小後再上傳。';
    });
    if (msg) {
      fileInput.value = '';
      err('err-file', true, msg);
      return;
    }
    err('err-file', false);
    files.forEach(function (f) {
      var li = document.createElement('li');
      li.textContent = f.name;
      fileList.appendChild(li);
    });
  });

  /* ---------- 送出 ---------- */
  function checked(name) { return !!form.querySelector('input[name="' + name + '"]:checked'); }
  $('sp-submit').addEventListener('click', function () {
    var first = null;
    function bad(id, on, target) { if (on && !first) first = target || $(id); return on; }
    var cat = form.querySelector('input[name="cat"]:checked');
    bad('err-cat', err('err-cat', !cat), form.querySelector('.sp-cats'));
    if (cat && cat.value === 'report') return;

    bad('err-who', err('err-who', !checked('who')), form.querySelector('.sp-who'));
    var needCase = cat && cat.dataset.case === '1';
    bad('err-case', err('err-case', !!needCase && !$('sp-case').value.trim()), $('sp-case'));
    var email = $('sp-email').value.trim();
    bad('err-email', err('err-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)), $('sp-email'));
    bad('err-text', err('err-text', $('sp-text').value.trim().length < MIN_CHARS), $('sp-text'));
    bad('err-agree', err('err-agree', !$('sp-agree').checked), $('sp-agree'));

    if (first) { first.scrollIntoView({ block: 'center' }); return; }
    try { sessionStorage.setItem('support_email', email); } catch (e) { /* 忽略 */ }
    location.href = 'support-sent.html';
  });
})();
