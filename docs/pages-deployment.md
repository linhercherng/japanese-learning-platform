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
- [x] 儲存庫公開、完整版合併到 main、Pages 來源為 workflow。
- [x] GitHub Actions build/deploy 成功，取得正式部署URL。
- [x] 未登入公開URL與代表性CSS、JS、MP3、SVG、PWA素材回應正常。
- [x] 實際瀏覽器首頁、生活情境、五十音、筆順、課程、音檔播放與保存／刷新正常。
- [x] 手機尺寸沒有橫向溢出；正常來源SW安裝成功。

## 資料與回退

本機與線上網址為不同來源。先在舊網址匯出JSON，再到新網址合併匯入。公開並不提供跨裝置自動同步；瀏覽器清除資料前應保存備份。

部署失敗時不發佈未完成的build。需回退時在main建立revert提交並重新通過相同流程；不用改寫Git歷史。SW保留等待更新機制，既有分頁維持同版資源；在「我的」啟用已就緒更新，或關閉所有網站分頁再打開。回退不刪除IndexedDB學習資料。

首次正式部署已完成並驗證，詳見下節。真實iOS／Android觸控、安裝與麥克風仍需實機驗收。

## 發布前檢查

51／51測試（含Pages子路徑SW回歸）、build/check通過；npm audit零漏洞。Git全部已追蹤歷史的已知憑證格式掃描與敏感檔名檢查無匹配；未提交個人備份／錄音。部署修改已複查：只上傳dist、僅main可部署、PR無Pages寫入權限、官方Action固定SHA、不增加執行依賴，不清除學習資料。

## 正式發布驗收結果

- PR #3 已合併，首發main commit：`d107a7fb2a18ebc907915aab21193306e5b2659e`。儲存庫 `isPrivate=false`，Pages `public=true`、`build_type=workflow`、HTTPS開啟。
- [正式部署run 38319598490](https://github.com/linhercherng/japanese-learning-platform/actions/runs/38319598490)：build／deploy皆success；Linux Node22完整51項測試、build/check/audit通過。PR與分支檢查亦成功，部署步驟依設計略過。
- 未附認證的HTTPS共63個請求，全部200。52份shell資源SHA-256全數符合發布索引和本機審查版本；每個音檔包抽一份MP3校驗相符、MIME正確；JavaScript MIME可執行，原始SVG與PWA manifest可取得。
- 正式桌面瀏覽器載入首頁、完整課程、飲食生活分類、N5／N4／N3模擬列表；五十音播放回報「正在播放日語合成語音」，筆順動畫顯示第1筆／共3筆，手寫畫布正常載入。
- 正常來源「我的」顯示文字／筆順已準備離線使用，證實SW已完成初次安裝；並未在此次線上驗收下載全部五種音檔包。包完整性仍由已有素材與離線回歸證據支持。
- 隔離QA庫每日時間改成30分鐘後刷新仍保留，未修改正常來源個人進度。正式390px頁面、QA 320px課程列表皆無橫向溢出，瀏覽器console無error／warn。QA分頁已關閉。
- 正式網站分頁保留供使用者使用。HTTP驗收JSON與手機截圖另存交付outputs；沒有把QA資料提交到公開儲存庫。

本次證明GitHub Pages端點、部署與代表性桌面瀏覽器行為。真實iOS／Android、觸控筆、麥克風、背景回收、全部離線包線上下載與跨裝置同步未因此宣稱已驗收。
## 第三版發布

V3.0已於2026-10-13透過PR#4整合至main。成功部署run38392302028；正式URL與62份shell、3個MP3及實際瀏覽器版本切換已驗收。完整證據及限制见[第三版驗證](v3-validation.md)。

## 五十音第十三批發布（2026-10-23，台北）

v0.17.0經[PR #29](https://github.com/linhercherng/japanese-learning-platform/pull/29)合併；[Pages run39810937235](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39810937235)的build/deploy皆success。379項測試、build/check/audit與獨立審查通過，正式122份shell雜湊及128次音檔HTTP抽查相符；正式隔離瀏覽器驗收既有原輪逐字回顧、展開／刷新、錯答保留與主動留回。證據與實機／教師審校邊界見[第十三批驗收](kana-thirteenth-validation.md)。

## 五十音第十四批發布（2026-10-23，台北）

v0.18.0經[PR #30](https://github.com/linhercherng/japanese-learning-platform/pull/30)按必要build成功的同一head合併；[Pages run39818239248](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39818239248)整體completed/success、build/deploy皆success。396項測試、build/check/audit、獨立審查與修補複核通過；正式122份shell雜湊與128次音檔HTTP相符，隔離瀏覽器確認原錯答雙卡、兩字音、遮住／核對、刷新及原統計保留。PR workflow總狀態仍in_progress，與已完成必要檢查分開記錄；完整證據與邊界見[第十四批驗收](kana-fourteenth-validation.md)。

## 五十音第十五批發布（2026-10-23，台北）

v0.19.0「錯字雙向聽辨」經[PR #31](https://github.com/linhercherng/japanese-learning-platform/pull/31)同head合併；PR CI整體completed/success，[Pages run39874860680](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39874860680)整體completed/success、build/deploy皆success。415項測試、build/check/audit、獨立審查與共用pending複核通過。正式126份shell雜湊、SW fingerprint及128次音檔HTTP相符；正式隔離瀏覽器從パ／ベ原錯答進入兩題，驗證刷新、暫停續作、單一未完成輪、提示分列與原首答保留，320/390px無橫溢且主要觸控目標至少44px。完整證據、截圖位置與實機／教師審校邊界見[第十五批驗收](kana-fifteenth-validation.md)。

## 五十音第十六批發布（2026-10-23，台北）

v0.20.0「雙向聽辨後逐字回顧」經[PR #32](https://github.com/linhercherng/japanese-learning-platform/pull/32)同head成功CI後合併；[Pages run39876749540](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39876749540)整體completed/success、build/deploy皆success。428項測試、build/check/audit與獨立94項相關審查通過；正式126份shell雜湊及128次音檔HTTP相符。正式隔離UI確認既有第十五批兩題可回顧、單目標訣竅、主動留下、錯答雙卡遮住／揭開、刷新與原新舊首答統計保留，320/390px無橫溢。已開舊離線分頁正常重開後取得新版，沒有清資料。完整證據與實機／教師審校邊界見[第十六批驗收](kana-sixteenth-validation.md)。


## 五十音記憶剩餘整合發布（2026-10-23，台北）

v0.21.0經[PR #33](https://github.com/linhercherng/japanese-learning-platform/pull/33)同head成功CI後合併；[Pages run39879287506](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39879287506)整體completed/success，build/deploy皆success。452項測試、build/check/audit及獨立審查／修補複核通過；正式131份shell雜湊及128次音檔HTTP相符。正式隔離UI驗證今日推薦接續較早原輪、六段指南、線索保存／搜尋／口袋篩選／空結果／草稿刷新續寫／筆順與舊首答統計，320/390px無橫溢。完成矩陣見[完整規劃](kana-memory-completion.md)，證據與外部驗證邊界見[整合驗收](kana-memory-completion-validation.md)。


## 生活日語記憶與複習發布（2026-10-23，台北）

v0.22.0經[PR #34](https://github.com/linhercherng/japanese-learning-platform/pull/34)同head成功CI後合併；[Pages run39882514268](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39882514268)整體completed/success，build/deploy皆success。474項測試、build→check、audit零弱點與獨立核心／UI修補複核通過；正式136份shell SHA／SW fingerprint與146次音檔HTTP抽查通過。正式隔離UI驗證三題首答、單題提示、刷新／暫停續作、參考卡遮蔽、隔天空狀態及舊五十音紀錄保留；320/390px無橫溢、新按鈕48px以上，鍵盤焦點與console通過。完整範圍、證據與實機／教師審校邊界見[生活記憶驗收](life-memory-validation.md)。
