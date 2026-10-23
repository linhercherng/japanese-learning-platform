# 六區每週回顧與弱點分析 Implementation Plan

> **For Codex:** Use superpowers:executing-plans task-by-task. User already authorizes implementation, tests and release.

**Goal:** 五十音、生活日語與N5～N2以可追溯作答證據呈現近七日活動、目前記憶狀態與下一步練習。

**Architecture:** 新增唯讀unifiedReview，將原題×能力歷史分六區，沿既有studyDay與原始首答；weekly／weaknesses原路由升級，保留舊概念與作品修訂／備份整理於收折區。下一步沿unifiedLearning／原地圖與原輪，不另建題或改資料。

**Tech Stack:** Node22 ESM、node:test、原生HTML/CSS、schema3 IndexedDB、Pages/PWA，無新依賴或教材。

## 決策

另存總熟練度會與原始證據分歧；只連六區舊頁難比較。採唯讀聚合，六區每項以最新日期每日首答及最後首答保守分類：需複習、時間重疊待確認、無提示答對但跨日待確認、跨日想起、七日後想起。最近錯答／提示不被同日後來答對沖掉；沒有紀錄不推論已會。記憶證據不是永久掌握、自由口說／手寫能力或官方成績。

- 近七個台北日期，截至當下；未來紀錄不提前列入。每題×能力×日期只取最早首答，同時間碰撞另列，不任選成功。
- 跨日證據須有較早日期原題紀錄、當日第一筆無提示正確；距最近較早練習及可見提示／同字其他能力曝光至少1日／7日。同日題外參考、比較字提示、錯誤訂正不能製造記憶證據。
- 本週活動與目前累積狀態分開；每能力各自計數。原課／原題可追溯但不預先展示題幹、選項、答案或私人線索。五十音用字種與字表序號定位，原記憶地圖查看字形；生活與檢定用課名＋原題ID。
- 手寫自評、作品、訂正、舊深化概念獨立呈現；未納入六區原題的舊紀錄另計不丟失。查看報表不寫任何作答、提示、方案或偏好。
- 待接續模擬／原輪優先，摘要唯一主要按鈕；各區連既有地圖與練習，遇pending接原輪。weaknesses支援目標／狀態／頁數深連結，12項一頁，全部紀錄可找回。

## Task 1：核心

Create app/core/unified-review.mjs and tests/unified-review.test.mjs.
- [x] RED：六區空資料、各能力、跨日／七日、同日訂正、提示與比較字曝光、時間重疊、未來、台北午夜、目前與本週分離、手寫／作品分開、舊紀錄、pending及唯讀備份。
- [x] GREEN：純計算、可追溯項目與可靠分母；提交。

## Task 2：UI與整合

Create app/ui/unified-review.mjs and tests/unified-review-ui.test.mjs; modify app/ui/v3.mjs, app/v3.mjs, app/ui/unified-learning.mjs, app/ui/navigation.mjs, app/v3.css.
- [x] RED→GREEN：六區周摘要／能力、狀態與分頁、下一步、pending保護、空資料、編碼／不洩題、舊工具保留、首頁明顯入口與breadcrumbs。
- [x] 同步README／規格／課綱／畫面／來源／roadmap，v0.39.0與驗收矩陣。

## Task 3：驗收發布

- [x] 獨立唯讀核心與UI審查；全站test→build→check／audit，修正回歸。
- [x] 本機QA UI匯出前後整份state不變、原輪續作與深連結、五寬320／390／768／1024／1440、Tab／大字／console、HTTP shell SHA與原音抽樣。
- [x] PR同head CI→merge→Pages→正式HTTP／PWA自然更新／正常與QA備份深比對，截圖、恢復viewport／停server、文件推送與遠端HEAD一致。

不清DB／cache／SW。新增日語教材／真人審音／實機OS鍵盤／長期成效不在本輪；部署失敗保留資料與原發布，可回退程式但先匯出備份。

審查修正：答後回饋不抹去生活／檢定已有首答證據；五十音只存最後提示，晚於首答而無法還原時改列紀錄待確認，並獨立uncertainHistory，不當成同時碰撞。
