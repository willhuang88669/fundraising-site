/* 發起人的身分驗證狀態（網頁初版存在這個瀏覽器的 localStorage；正式版要存在帳號，並由身分驗證服務回傳結果）。
   - 驗證一次就好：已完成時，發起流程的進度條不顯示第 5 步「身分驗證」，送出審核後直接到確認頁。
   - 有 data-kyc-done 的元素只在「已完成」時顯示；有 data-kyc-pending 的元素只在「未完成」時顯示。
   - create-verify.html：「完成身分驗證」會記錄為已完成；網址帶 ?from=dashboard 時，完成或稍後再做都回到後台。 */
(function () {
  var KEY = 'nm-kyc';
  function done() { try { return localStorage.getItem(KEY) === 'done'; } catch (e) { return false; } }
  function setDone() { try { localStorage.setItem(KEY, 'done'); } catch (e) { /* 忽略 */ } }
  window.nmKyc = { done: done };

  function apply() {
    var ok = done();
    document.querySelectorAll('[data-kyc-done]').forEach(function (el) { el.hidden = !ok; });
    document.querySelectorAll('[data-kyc-pending]').forEach(function (el) { el.hidden = ok; });

    // 後台：側欄「帳號與驗證」連到 #verify，未完成時改指向未完成版本的區塊
    var vDone = document.getElementById('verify'), vPend = document.getElementById('verify-pending');
    if (vDone && vPend && !ok) { vDone.id = 'verify-done'; vPend.id = 'verify'; }

    // 發起流程：已驗證就拿掉第 5 步，進度改成「／4」，送出審核直接到確認頁
    if (ok) {
      var li = document.querySelector('[data-kyc-step]');
      if (li) li.remove();
      var cap = document.querySelector('.step-caption');
      if (cap) cap.textContent = cap.textContent.replace('／5', '／4');
      var next = document.querySelector('[data-kyc-next]');
      if (next) next.setAttribute('href', 'create-done.html');
    }
  }
  apply();

  // 身分驗證頁
  var finish = document.querySelector('[data-kyc-finish]');
  if (!finish) return;
  if (new URLSearchParams(location.search).get('from') === 'dashboard') {
    finish.setAttribute('href', 'dashboard.html');
    var later = document.querySelector('[data-kyc-later]');
    if (later) { later.setAttribute('href', 'dashboard.html'); later.textContent = '回到後台'; }
    var cap = document.querySelector('.step-caption');
    if (cap) cap.textContent = '身分驗證';
    var steps = document.querySelector('.steps');
    if (steps) steps.hidden = true;
    var lead = document.querySelector('.col-main .muted');
    if (lead) lead.textContent = '驗證一次就好。完成後，審核一通過，案件就會上架開放捐款。';
  }
  var faceBtn = document.querySelector('[data-face-start]');
  var faceSt = document.querySelector('[data-face-status]');
  if (faceBtn && faceSt) {
    faceBtn.addEventListener('click', function () {
      faceBtn.disabled = true;
      faceBtn.textContent = '辨識中…';
      setTimeout(function () {
        faceSt.textContent = '已完成';
        faceSt.className = 'chip chip-ok';
        faceBtn.textContent = '重新辨識';
        faceBtn.disabled = false;
        faceBtn.className = 'btn btn-outline btn-md';
      }, 1200);
    });
  }
  finish.addEventListener('click', setDone);
})();
