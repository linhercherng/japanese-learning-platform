# 生活日語記憶與複習完整整合 Implementation Plan（v0.36.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者明示不再分批、一次完成剩餘部分；直接完成規劃、實作、測試與發布，不新增確認關卡。

**Goal:** 將前十四批串成找得到、接得上、能適時收尾的完整生活學習循環。

**Architecture:** 重用lifeNextStep與所有既有教材、原輪、草稿和線索。新增唯讀life-path、life-guide與life-workspace入口，練習簿從既有LR／LD／LB／LN及lifeNotes建立metadata索引，不另存資料。沿用原編輯頁、schema3與PWA。

**Tech Stack:** Node22 ESM、node:test、原生form/textarea、IndexedDB；無依賴或新語言素材。

## 取捨與完成定義

再加遊戲會增加入口，重寫排程會與既有紀錄矛盾；選擇將已完成工具整合。範圍是生活日語記憶與複習程式功能。教師審校、真人錄音、長期效果、實機日文鍵盤、付費雲端與全站教材擴編各需外部資源，不由本版冒稱完成。

1. 今日一小步：沿原lifeNextStep，pending優先、當日已完成可收尾、七日→隔天→弱點→新課。弱點沿原按鈕保存成功才開輪，不自動開始或生成新紀錄。參考與個人文字不預覽。
2. 我的生活練習簿：一次找到兩種整句模式、原稿、再想稿、生活線索及待保存草稿。按課名／場景／自己的文字明示搜尋；程度／種類／有文字原稿、有文字再想稿、待保存線索篩選；每頁最多10筆，空白稿仍有入口，清除可復原。結果只顯課名、模式、句序、草稿狀態與日期，不回傳或預覽文字。點原入口後仍先收起，主動開始才展開。
3. 六段完整指南：場景與三句→逐句雙向卡→中文回想／聽寫→差異小補練／整句再想→原題能力與換場景／輸出→隔天七日／地圖小結與收尾。說明提示、首答、文字核對、自評和跨日證據的差別，每次只選一條路。
4. 整合首頁、生活目錄、記憶地圖、練習中心、草稿目錄與路徑麵包屑。保留既有深連結；pending時練習簿全遮蔽，只接原UUID。
5. 搜尋不寫DB/cache/曝光/作答，不因輸入重繪；IME中Enter與pointerdown→blur→compositionend→click/submit不得送出／清除／換頁；下一次明確操作可用。過期route與dispose忽略。使用者文字HTML編碼。

## Task 1：唯讀索引與驗收契約

Files: app/core/life-workspace.mjs、tests/life-workspace.test.mjs。
- [x] RED：92課／雙模式／276句、原稿與再想稿分開、空稿／線索草稿、搜尋兩份文字但不回傳、篩選／分頁／穩定排序、零資料與備份變更。
- [x] GREEN：最小純函式索引，沿既有key解析，不新增保存資料；測試並提交。

## Task 2：完整入口與控制器

Files: app/life-workspace.mjs、app/ui/life-workspace.mjs、app/ui/life-guide.mjs、app/main.mjs、app/ui/navigation.mjs、app/ui/life-memory.mjs、app/ui/life-review.mjs、app/ui/life-dictation.mjs、app/ui/v3.mjs、app/ui/courses.mjs、app/v3.css；tests/life-completion-ui.test.mjs、tests/life-workspace-controller.test.mjs。
- [x] RED：今日推薦同源／收尾／pending、guide連結、workspace隱藏文字與明示搜尋、空頁／focus／HTML、麵包屑與入口；控制器IME／pointer鎖／分頁／離頁／零寫入。
- [x] GREEN：沿既有樣式48px控制、18px輸入、focus與sticky避讓；整合並提交。

## Task 3：整包驗證、審查與一次發布

- [x] 完成矩陣與README／規格／課綱／畫面／來源／路線／版本0.36.0；完整npm test→build→check→audit。
- [x] 獨立唯讀核心與UI審查，必要修補與複核；本機隔離QA搜尋／篩選／分頁／清除／雙模式舊稿／路由／pending／原資料、320／390／768／1024／1440、Tab／console／截圖；shell及原音HTTP。
- [x] PR #48同head CI成功才合併；Pages build/deploy與正式HTTP／正常SW更新／隔離UI／原資料通過；文件證據同步GitHub。恢復正常入口／viewport並停測試server，詳見整合驗收。

不清DB／cache／SW、不注入虛構跨日歷史；失敗沿原可匯出機制。回退先匯出JSON並保留資料，個人文字／QA與截圖不提交Git。完成後不再列下一批生活記憶程式功能。
