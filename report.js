/* 檢舉與申訴：從案件頁的「檢舉此案件」進來（網址帶 ?case=…）時，
   自動把案件帶入檢舉表單。這是介面示意，尚未串接後端。 */
(function () {
  var input = document.getElementById('rp-case');
  if (!input || !/[?&]case=/.test(location.search)) return;
  input.value = '[案件標題：受益人與事由]';
  input.readOnly = true;
  var hint = document.getElementById('rp-case-hint');
  if (hint) hint.textContent = '已從案件頁帶入。';
})();
