# 首頁統一每日學習與複習 Implementation Plan（v0.38.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已要求規劃、實作、測試與發布，沿既有樣式直接整合，不另設批准關卡。

**Goal:** 首頁依五十音、生活日語、N5／N4／N3／N2的實際進度，說明今天最適合接續或回想的一小步。

**Architecture:** 新增純計算的unified-learning模組，重用kanaNextStep、lifeNextStep、jlptNextStep及現有跨日／提示規則。推薦只讀資料，不產生題目、排程、首答或曝光；沿現有v3.goal與dailyMinutes保存偏好。首頁一個主建議，六區摘要收折，原四步每日安排及所有舊入口仍可明確接續。

**Tech Stack:** Node22 ESM、node:test、原生HTML/CSS、schema3 IndexedDB與既有Pages/PWA；無新依賴、語言教材、帳號、後端或保存欄位。

## 決策與規則

三種方案：另建總排程會複製原輪；只加六個入口不能依進度引導；採唯讀整合器，把既有下一步與原輪串到首頁。

- 先保護activeExam；再接目前V1五十音回想、V2課內練習或V3任一來源未完成原輪（同層以最近更新優先、穩定ID決勝）。原ID／題序／答案／草稿／計時不變，並提供其他待接續清單。
- 未評完的既有五十音聽寫沿kanaNextStep接續；已開始的舊每日安排先接原活動；只建立而未開始的安排保留為可選，不擋住應複習項目。
- 今天已有完整原輪或每日安排，可收尾；保留所屬區與原結果。不能用單一自評、作品、開卡或搜尋推論完成／熟練。
- 尚未收尾：六區先選七日→隔天→弱點→口袋，再選目前目標的新內容；同類優先目前目標，其餘按較早練習、固定區序。每區題數與資格沿原路線，不補新題湊複習。不自動升級目標。
- 所有統計用截至現在的可靠原題／字卡作答；未來作答與曝光不使目前報表提前。不將練過題數當合格率。待完成原輪本身仍需接續，避免系統時間倒退時另開一份。
- 首頁明示台北日期、選擇原因、實際練過數／最近日期、下一步連結與可以休息；六區摘要、其他工具、四步安排收折，避免首頁同時塞入多個主要任務。
- 偏好沿舊選單／時間儲存；「更新今天的推薦」只重繪、不寫入。舊create-plan／extra-plan也在交易內檢查待完成原輪，避免過期按鈕另建安排；等待保存離頁後不搶回路由。
- V3／V2完成頁增加回首頁連結；保留舊結果、返回原課、指南、五十音／生活／檢定工具與深連結。

## Task 1：純計算與測試

Create app/core/unified-learning.mjs、tests/unified-learning.test.mjs。
- [x] RED：空資料六目標、三區複習／跨區排序、台北跨日、提示延後七日、當日收尾、未完成各來源／模擬／V1／聽寫／舊安排、未來資料、唯讀與備份不變。
- [x] GREEN：learningPending／unifiedLearning、可靠統計、穩定決策；分次提交。

## Task 2：首頁整合

Create app/ui/unified-learning.mjs、tests/unified-learning-ui.test.mjs、tests/unified-learning-controller.test.mjs；modify app/ui/v3.mjs、app/v3.mjs、app/ui/study.mjs、app/v3.css。
- [x] RED→GREEN：首頁主建議／日期／原因／收折摘要、舊安排及工具保留、pending不出新建按鈕、完成頁返回、HTML編碼／無答案或私人文字曝光。
- [x] controller交易內pending守門、保存失敗／離頁不跳轉、刷新唯讀、偏好沿既有流程；直接驗證實際控制器。

## Task 3：整包驗收與發布

- [x] 更新README／規格／課綱／畫面／來源／路線、完成矩陣／驗收、版本0.38.0；test→build→check／audit。
- [x] 獨立唯讀審查核心及整合；本機隔離QA六目標、原輪續作、完成回首頁、選擇保存／刷新、舊資料、320／390／768／1024／1440、Tab／console／截圖、shell HTTP SHA。
- [x] 同head PR CI→merge→Pages→正式HTTP／正常PWA自然更新／隔離操作、個人與舊QA資料比對；文件證據push、遠端HEAD一致、恢復viewport／正式首頁、停server。

不清DB／cache／SW，不注入瀏覽器歷史或虛構跨日學習。教師／真人審音／實機鍵盤與長期學習成效不由本次程式驗收推論；回退先備份，不丟棄新舊資料。
