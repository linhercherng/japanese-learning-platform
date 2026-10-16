# 回想導覽與計時器修正驗收

2026-10-16；基準 `main`：`e1c4e2cad51edfe5520ead6c2f4b9d4a3decd96c`。以下記錄第一輪本機修正與驗證；當時分支 `fix/navigation-recall-timer` 保留未提交變更。使用者後續於台灣時間 23:07 批准提交、PR、合併與部署；發布結果以 PR／Actions 及另存的正式站驗收證據為準。

## 修正範圍

- PR #11 的[回想導覽問題](https://github.com/linhercherng/japanese-learning-platform/pull/11#discussion_r4294469592)：課內回想與 V3 回想使用來源課程 ID，例如 `N5-09`、`N5-03`，避免課名中的「に」「の」提示答案。來源連結與課程 ID 保留；回到一般課程頁仍顯示完整課名。
- PR #11 的[計時器遮蓋問題](https://github.com/linhercherng/japanese-learning-platform/pull/11#discussion_r4294469515)：原本位置列與考試計時器都固定於 `top:0`，倒數會被位置列遮住。現在同步量測位置列實際高度，計時器以該高度作為 sticky 偏移；`ResizeObserver` 處理換行與視窗變更，不支援時沿用 resize 事件。移除窄版覆寫的 `top:0`。
- 無進度格式、題目、課程、備份 schema 或儲存邏輯變更。

## 先紅後綠與回歸

| 驗證 | 修正前 | 修正後 |
| --- | --- | --- |
| 導覽單元測試 | 18 項中 5 項失敗 | 18/18 通過 |
| 瀏覽器回歸 | 7 項全部失敗：2 項洩題、5 項遮蓋 | 7/7 通過 |
| 完整 `npm test` | — | 169/169 通過 |
| `npm run build`、`npm run check` | — | 通過 |

新增導覽測試涵蓋全部 238 筆教材的課內回想、全部深化課程、V3 各種來源、完整課名正常呈現、來源連結與 schema 3 合法備份往返。也檢查產生導覽不改變答案、提示、草稿或匯出資料。

真實 Chromium 的隔離 QA 流程包含：

- N5-09 課內回想與 N5-03 深化回想，重新整理後仍無課名提示；點擊來源可回原課程；導航前後備份相同，首次正確且未提示的答案正常保存，題目 ID 不變。
- 320、390、768、1024、1440px 寬度的 N5-A 完整模考，捲動兩次、倒數持續更新、重新整理保留相同考試 ID／題目／截止時間。
- 桌面縮至 320px，再以 240px 壓力測試強制位置列換行，驗證計時器隨實際高度位移且無遮蓋或橫向溢出。240px 僅為換行壓力測試。
- 修正前 320px 捲動時位置列與計時器均從 `y=0` 開始，倒數 hit-test 被遮住；修正後計時器從位置列底部 `y=66.1875` 開始，倒數 hit-test 可見。全部流程無 console error／warning 或 HTTP 失敗。

建置重新產生 shell manifest 與 service worker 雜湊；完整內容、音檔、語法與靜態資產一致性檢查通過。

## 重跑方式與證據

`npm test` 執行一般測試。瀏覽器回歸獨立於預設測試，使用既有本機 Playwright 與 Chromium，不新增專案依賴：

```powershell
node scripts/serve.mjs 18107
# 另一個終端；如未安裝到專案，指定既有工具的實際路徑。
$env:PLAYWRIGHT_MODULE='file:///path/to/playwright/index.mjs'
$env:CHROMIUM_EXECUTABLE='C:/path/to/chrome.exe'
node tests/navigation-layout.browser.mjs green
```

預設測試網址為 `http://127.0.0.1:18107/?qa=1`，可透過 `HIYORI_QA_URL` 指定其他 localhost QA 連接埠；腳本拒絕正式網域與非 QA 網址。每個情境使用新的瀏覽器 context，僅透過介面匯入合成資料及匯出驗證，未讀取真實使用者資料。

本機證據保留在 checkout 外的 `../navigation-timer-evidence/`：紅綠測試紀錄、`red/browser-results.json`、`green/browser-results.json`、幾何量測、畫面及合成備份；合成備份不納入 patch。

## 尚未驗證

本機驗證為桌面 headless Chromium 的尺寸模擬，未做 iOS／Android 實機或其他瀏覽器驗收。QA 模式跳過 service worker，本機階段未重做斷網啟動與舊分頁更新接手；建置及靜態離線資產檢查通過。正式站與離線索引驗收待部署後另行記錄，不能以此份本機紀錄代替。
