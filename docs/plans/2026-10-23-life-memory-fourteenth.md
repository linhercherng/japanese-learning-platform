# 生活記憶第十四批 Implementation Plan（v0.35.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者明示規劃、實作、測試與發布，按清單直接完成。

**Goal:** 看過一處差異後，先遮住該片段自己補回，再接整句空白回想。

**Architecture:** 在既有一處差異視圖加暫存fragment練習，不新增教材、路由、保存欄位或作答source。只取已對照的原句差異片段，以相同短前後文定位；輸入暫存、主動核對才揭原片段，沿Unicode字元對照，不計分。回原差異或整句空白再想均沿既有控制器。

**Tech Stack:** Node22 ESM、node:test、原生textarea／IME、既有IndexedDB與PWA。

## 決策與規格

比較再加統計、增加每日任務、將卡住的一處先補回。前兩者已有路線與回顧；本批選「小片段→整句」，降低一次重想整句的負擔。沿用276原句、原差異分組與前後最多4碼點定位；片段不是詞彙／文法切分。

- 僅在已展開的一處差異提供「遮住這一處，自己補回」。原日文差異與這次寫的差異同時遮住，只留共同前後短定位；不額外列原句全文、中文、讀音或音訊。如果沒有共同前後文，可能是整句都不同，清楚提醒可回完整對照先看一小段。
- 片段編輯器max300字，label「補回剛看的原句片段（暫存）」。input不重繪、無DB／cache／曝光／作答寫入；離開／刷新／換句／模式收起且不保留片段輸入，明示整句草稿與再想稿保持。與原整句input、IME、submit事件分流。
- 「核對這一處」須至少一個字元（不trim，空白可能是原差異）。永遠提供「這裡不需要文字」作明示空回答，不能只在正解為空時顯示，避免提前洩答案。IME選字中不得核對／空回答或切換重繪；超過300字拒絕、保留原輸入。
- 主動核對才顯自己的片段與原片段，空側明示；相同／不同只表示字元序列，沒有分數、完成或熟練推論。原片段及輸入皆HTML編碼、保留空白。可「再遮住試一次」重設暫存，或「回這處差異」保留index，或「收起答案，整句從空白再想」。不因核對新增曝光；原對照已durable保存參考。
- fragment只在合法ref、open+comparison+有效differenceIndex時存在；無差異／完整對照／收起頁不提供。route／close／edit／start／compare／restart與差異切換均重設fragment；pending全遮蔽，接原UUID。busy／ref／epoch／IME、原稿／LB與失敗可匯出保護保持。
- 觸控至少48px、textarea18px、focus回片段input／核對標題／差異標題，sticky避讓與Tab可見；320／390／768／1024／1440px無溢出。

## Task 1：介面與狀態契約

Files: tests/life-fragment-ui.test.mjs、tests/life-fragment-controller.test.mjs。
- [x] RED：按需入口、遮原／己片段、上下文／空側／編碼／無差異／pending、暫存說明與揭露後核對；controller空選／IME／300字／零寫入／路由及原稿保留。

## Task 2：實作與審查

Files: app/ui/life-dictation.mjs、app/life-dictation.mjs、app/v3.css。
- [x] GREEN：共用既有difference與字元比較，不新增core保存資料；暫存fragment input／form及composition分流，不重繪input。
- [x] GREEN：合法狀態／pending／route／busy／IME保護、回一處／重試／整句空白再想，獨立UI與保存／邊界審查。

## Task 3：驗證與發布

- [x] 0.35.0與README／規格／課綱／畫面／來源／驗收，完整npm test→build→check／audit、160 shell SHA／MIME／SW與146原音HTTP。
- [x] 本機?qa=1遮一處→輸入→核對／再試→整句空白再想→舊LB仍在，空原片段／明示空答、雙模式／刷新／原輪UUID／舊首答線索；五種寬度／48px／Tab／console／截圖。
- [x] PR #47同head CI再合併，Pages整體／build／deploy成功，正式HTTP／正常SW與隔離UI通過，文件證據push遠端一致；回正常入口、恢復viewport、停server。詳見驗收文件。

片段為當次回想，不評自由翻譯／文法／口說或跨日記憶。無新語言教材，教師／真人審校、實機OS日文鍵盤與長期效果仍另列未驗證。不清DB／快取／SW、不注入歷史，個人資料及QA不提交Git，回退先匯出JSON保留資料。
