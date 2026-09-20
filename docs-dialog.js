/* 首頁「查看所需文件」：在原地彈出視窗，列出各類案件要準備的文件。
   沒有 JavaScript（或瀏覽器不支援 <dialog>）時，按鈕會直接連到常見問題 Q15。 */
(function () {
  var dialog = document.getElementById('docs-dialog');
  var triggers = document.querySelectorAll('[data-open-docs]');
  if (!dialog || typeof dialog.showModal !== 'function' || !triggers.length) return;

  triggers.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      dialog.showModal();
    });
  });

  // 點視窗外的灰色背景也能關閉（Esc 與關閉鈕是瀏覽器內建行為）
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
})();
