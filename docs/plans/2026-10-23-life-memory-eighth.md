# 生活記憶第八批 Implementation Plan（v0.29.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者授權規劃、實作、測試、GitHub與發布，按清單直接完成。

**Goal:** 聽一句既有生活日文，先自己打字，再對照文字差異，幫助整句回想。

**Architecture:** life-dictation目錄與unit:slot單句頁，沿用92課各三句memoryPhrases，不新增教材／評分source。schema3既有drafts加text:LD-<unit>:<0..2>，每句300字／空points／合法時間、同時衝突拒絕，保留舊資料。純文字序列對照與原lifeHints、公用音訊、pending保護整合。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原生textarea／IME、既有合成原音、PWA。

## 設計與取捨

比較錯因標籤、週記圖表與整句聽寫，選整句聽寫。前七批已有原課、逐句卡、能力、弱點、跨日、自己的線索及主題交替；本批補整句輸出，以既有276句作回想參照，不評自由作文自然度。

- life-dictation：程度／場景篩選92課，課名及有草稿句數，無正文預覽或提示曝光；有pending只接原UUID。未知課／slot可回目錄。
- life-dictation/<unit>:<slot>：每課前三句（與逐句卡同源），一次一句，上一／下一句在URL。預設收起輸入與原句，主動「開始這句聽寫」才出音訊、300字textarea及對照按鈕。refresh／離頁／換句皆收起，草稿保留；沒有輸入時不能對照，無多餘自評或虛構完成數。
- 聽原音／慢速、非空草稿展開／輸入與原句對照保守記本課全部原qid的lifeHints（句子與題目無唯一映射），空編輯器／目錄不記。pending遮蔽整個編輯與參考，接原生活輪；舊首答不改，聽寫不新增客觀作答／熟練度／完成。
- 「對照原句」擷取目前文字，先保存曝光，再顯示唯讀對照：以Unicode字元序列比較，保留字形／空白／標點，不做同義句／文法判定。用清楚的「這次寫的／課程原句」與差異標示，附原讀音／中文。明示文字不同不等於說法錯。對照期間不編輯，按「收起原句，繼續回想」回最新草稿；不保存比較成績。
- 每句draft獨立key，最多300字、空points、只允許text／time／points；實際時間較新勝，同一時刻不同原文拒絕合併；空字草稿保留移除意圖。schema3、V1/V2、既有作品、LN線索草稿與首答皆保持。輸入先cache後串行寫入，失敗留可匯出內容，input不重繪、不打斷IME。
- Controller namespace、busy／route epoch、unit:slot檢查，延遲曝光／音訊／對照不拉回；IME選字未結束不誤觸對照。對照只讀最新textarea捕獲值，保存中較新輸入不被舊快照覆寫／中斷。收起後／返回編輯有明確焦點，控制項48px，路徑與篩選標籤清楚。
- 結果接回原課、逐句卡、能力、自己的線索與隔天／預告。入口加在原課／能力／卡片／線索及生活目錄／練習總覽，原教材及146原音抽樣不變。

## Task 1：草稿、文字對照與提示

Files: create app/core/life-dictation-state.mjs、app/core/life-dictation.mjs；modify app/core/learning.mjs；tests/life-dictation.test.mjs。

- [ ] RED：92×3合法ref與原句同源、300字／時間／欄位／points／未知ref拒絕、純字元對照可還原兩端／重複字／空白／emoji／日文，不修改原文或打分。
- [ ] RED：分句草稿不覆寫原課／LN／作品、備份往返／實際時間merge／同時異文衝突／空稿不復活，曝光只限本課、空稿／目錄不記、pending不編輯不曝光、原首答不變。
- [ ] 最小實作GREEN並提交。

## Task 2：手機聽寫與流程整合

Files: create app/life-dictation.mjs、app/ui/life-dictation.mjs；modify main／navigation／life-memory／life-cards／life-skills／life-notes／courses入口及v3.css；tests/life-dictation-ui.test.mjs、tests/life-dictation-controller.test.mjs。

- [ ] RED：正文與草稿預設不在DOM、主動開始／聽音／輸入／對照／收起、兩欄標籤與HTML安全、無評分／空字禁用／pending／缺課／slot復原、index篩選與句數真實、來源路徑與下一句。
- [ ] RED：cache／串行寫入、失敗可匯出、IME lifecycle、連按／stale ref／epoch、較新輸入不被delayed compare覆寫與重繪、焦點、dispose。
- [ ] GREEN，獨立核心與UI審查及必要RED→GREEN修補。

## Task 3：驗收與發布

- [ ] 隔離QA日文／繁中輸入、草稿刷新／換句、空與非空開始、原音／慢速／文字差異／收起、pending原UUID、舊首答／線索保留；320／390及桌面、48px／鍵盤／console。所有新輸入只用?qa=1，不清DB／快取／SW、不偽造跨日歷史。
- [ ] 版本0.29.0與README／規格／課綱／畫面／來源／驗收；npm test→build→check、audit、shell逐檔SHA／JS MIME／SW及146原音HTTP。
- [ ] PR同head CI、merge、Pages成功，正式HTTP／隔離UI與截圖、正常SW更新；文件證據push遠端一致，關QA與server、復原viewport。

原句對照不是聽寫評分、自由作文／手寫／口說或JLPT能力；實機／OS日文鍵盤、教師／真人審校及長期效果未由本批驗證。回退前匯出JSON、保留DB，舊版可能不辨新草稿key；個人內容與QA不提交Git。
