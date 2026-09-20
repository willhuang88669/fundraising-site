# 個人急難募資平台 網頁初版

純 HTML/CSS 的網頁初版，由 Claude 設計畫布轉成。直接用瀏覽器打開 `index.html` 即可預覽，不需要建置。

| 檔案 | 內容 |
|---|---|
| `index.html` | 首頁 |
| `campaign.html` | 案件頁（含手機版，響應式） |
| `donate.html` | 捐款頁 |
| `create-beneficiary.html` | 發起求助 步驟 1：類型與受益人 |
| `create-documents.html` | 發起求助 步驟 3：上傳文件 |
| `dashboard.html` | 發起人後台 |
| `styles.css` | 共用樣式與設計變數（顏色、字體、元件） |

## 注意
- 原稿只有步驟 1 與 3，步驟 2、4、5 尚未設計；目前「儲存並繼續」直接跳到下一個已有的頁面。
- 頁面中的 `[平台名稱]`、`[金額]`、`[待律師確認]` 等為佔位文字，待補。
- 字體 Noto Sans TC / Noto Serif TC 從 Google Fonts 載入，離線時會退回系統字體。
