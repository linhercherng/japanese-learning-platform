# GitHub Pages 公開試用部署

日期：2026-10-13。使用者已明示授權公開儲存庫與可直接使用的 GitHub 網站。

網址：https://linhercherng.github.io/japanese-learning-platform/

## 部署範圍與流程

- 公開 `linhercherng/japanese-learning-platform`，以 `main` 為發布來源。
- `.github/workflows/pages.yml`：Node 22、npm ci、測試、build、check、audit；只有 main 通過才發布 dist。
- GitHub 官方 checkout、setup-node、configure-pages、upload-pages-artifact、deploy-pages 以查核後的完整 commit SHA 固定。
- 相對路徑、PWA scope、音檔包與shell索引都以專案子路徑為根，不要求自訂網域。
- 僅發布靜態應用。GitHub Actions 不生成語音，也不接收個人進度、作品、錄音或備份。
- 公開的是試用平台，自編教材與合成聲音未完成獨立教師審校；不當作官方題庫或合格證明。

流程依 [GitHub Pages 官方自訂工作流文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 上線驗收清單

- [x] 檢查目前與歷史追蹤檔案沒有憑證、備份、個人作品或錄音。
- [x] 本機測試、建置與完整素材／內容校驗通過。
- [x] 子路徑下的SW安裝、離線導覽、音檔Range和跨專案隔離回歸通過。
- [ ] 儲存庫公開、完整版合併到 main、Pages 來源為 workflow。
- [ ] GitHub Actions build/deploy 成功，取得正式部署URL。
- [ ] 未登入公開URL與代表性CSS、JS、MP3、SVG、PWA素材回應正常。
- [ ] 實際瀏覽器首頁、生活情境、五十音、筆順、課程、音檔播放與保存／刷新正常。
- [ ] 手機尺寸沒有橫向溢出；正常來源SW安裝成功。

## 資料與回退

本機與線上網址為不同來源。先在舊網址匯出JSON，再到新網址合併匯入。公開並不提供跨裝置自動同步；瀏覽器清除資料前應保存備份。

部署失敗時不發佈未完成的build。需回退時在main建立revert提交並重新通過相同流程；不用改寫Git歷史。SW保留等待更新機制，既有分頁維持同版資源；在「我的」啟用已就緒更新，或關閉所有網站分頁再打開。回退不刪除IndexedDB學習資料。

實際部署run、commit與驗收結果待完成後補入。真實iOS／Android觸控、安裝與麥克風仍需實機驗收。

## 發布前檢查

51／51測試（含Pages子路徑SW回歸）、build/check通過；npm audit零漏洞。Git全部已追蹤歷史的已知憑證格式掃描與敏感檔名檢查無匹配；未提交個人備份／錄音。部署修改已複查：只上傳dist、僅main可部署、PR無Pages寫入權限、官方Action固定SHA、不增加執行依賴，不清除學習資料。
