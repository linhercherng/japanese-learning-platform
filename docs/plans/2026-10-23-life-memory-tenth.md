# 生活記憶第十批 Implementation Plan（v0.31.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者授權規劃、實作、測試及發布，按清單直接完成。

**Goal:** 整句卡住時只借一點開頭提示，再收起重想；快速找回有文字的回想／聽寫草稿。

**Architecture:** 在既有life-recall單句頁加暫存兩階段開頭提示；life-recall／life-dictation目錄加有文字草稿篩選，共用原教材、曝光、LR／LD草稿與控制器。不新增路由、schema／source／評分／依賴。

**Tech Stack:** Node22 ESM、node:test、原生textarea／IME、IndexedDB、既有PWA。

## 設計與取捨

比較更多統計、自動安排新翻譯題與溫和提示。前者偏資訊整理、後者需要新教材審校；選現有句子的開頭提示與草稿入口，補「完全想不起來」和「找不到上次寫到哪」兩個卡點。

- LR主動開始後，初始仍只有中文與自己的草稿。明示「先看一個字」才給原日文前1字；需要更多才「再看原句開頭」，最多前4個Unicode碼點並至少留1字不顯示。明示為原句開頭，不是單字／文法切分，也不判其他說法錯。
- 每次提示先成功保存本課參考曝光；busy、mode／ref／route epoch及captured input version保護。若等待期間有新input或compositionstart，即取消顯示，不移除正在編輯的textarea。提示開啟時不自動播放日文。
- 「收起提示，繼續回想」移除開頭提示，返回原編輯器與最新稿；不清空／改寫任何草稿。換句／模式／刷新／關閉／對照與收起原句皆重設提示。沒有假分數、連勝、計時或新增作答；pending連中文／提示／草稿全遮蔽並接原UUID。
- 目錄新增「全部課程／有文字草稿」篩選，分別依LR或LD現有非空白text判定，不讀對方模式或LN／作品。顯示真實草稿句數及有文字句數，不預覽私人內容、不新增曝光、不推論弱點或熟練。與程度／場景組合；空結果可改看全部，焦點保留同選單。
- 已有備份、first answers、lifeHints、較新空稿與失敗候選保持。提示狀態及篩選僅暫存，不另存教材／私人文字。手機48px控制、提示焦點／sticky避讓、日文原序列與HTML編碼延續。

## Task 1：提示與草稿目錄純邏輯

Files: modify `app/core/life-dictation.mjs`；create `tests/life-hints.test.mjs`。

- [ ] RED：276句開頭同源、1／4字階段不出全文，非法ref／level拒絕；LR／LD／LN獨立篩選、空稿／空白／無稿、程度場景、只讀不曝光。
- [ ] GREEN，原文／備份／首答不改；提交。

## Task 2：漸進提示、退場與篩選

Files: modify `app/life-dictation.mjs`、`app/ui/life-dictation.mjs`、`app/v3.css`；create `tests/life-hints-ui.test.mjs`、`tests/life-hints-controller.test.mjs`。

- [ ] RED：預設無提示、主動1→4字、收起／刷新／換句模式不殘留、對照無提示控制、LD無提示、空結果與篩選焦點、pending與編碼。
- [ ] RED：先保存曝光才提示、quota不揭、連按不跳階、較新input／IME使延遲顯示失效、stale route不拉回、收起不改草稿／首答。
- [ ] GREEN，獨立核心與UI審查並修補。

## Task 3：驗證與發布

- [ ] 0.31.0、README／規格／課綱／畫面／來源／驗收；test→build→check、audit、160 shell逐檔SHA／MIME／SW及146原音HTTP。
- [ ] 本機隔離QA提示1→4→退場、日文草稿刷新／切模式保留、文字草稿篩選／空結果、pending同UUID、舊首答／線索；320／390／768／1024／1440、48px／Tab／console／截圖。只用?qa=1，不清DB／快取／SW、不注入歷史。
- [ ] PR同head CI、merge、Pages、正式HTTP與隔離UI、正常SW更新，發布證據push遠端一致，離開QA／停止server／恢復viewport。

提示不是無提示記住或翻譯評量。教材仍待教師／真人審校，實機／OS日文鍵盤及長期效果不由本批推論。回退前匯出JSON並保留DB／備份；個人資料與QA不提交Git。
