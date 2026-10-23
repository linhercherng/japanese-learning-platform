# 生活記憶第十三批 Implementation Plan（v0.34.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃、實作、測試及發布，承接第十二批直接執行。

**Goal:** 對照後只聚焦一處文字差異，收起答案與剛寫的文字，從空白再想一次。

**Architecture:** 沿用compareLifeText Unicode差異序列，純函式將相鄰own／original片段分組、附最多4碼點前後相同字作定位。在原對照頁新增按需一處差異視圖與回完整對照；明示重想動作切到現有空白LB編輯buffer，不刪舊稿、不新增作答或曝光。

**Tech Stack:** Node22 ESM、node:test、現有LR／LD控制器與PWA。

## 決策與行為

比起再加統計或更多題目，本批補齊「看一處→收起→自己想」循環。不同日文說法可能都合理，字元差異僅作觀察，不評作文／翻譯或得分。完全沿用276原句與原音，無新語言教材。

- lifeTextDifferenceSteps(own,original)沿compareLifeText既有300字與型別驗證。相鄰own／original為一處，遇same結束；各回own／original字串與before／after（最多4個Unicode碼點）。相同全文為空陣列，增／刪時另一側空，不寫state。
- 原完整對照保持；有差異才提供「一次只看一處差異」。一處頁顯第N／總數、共同前後定位片段、這次寫的／原句這一處；空側明示「這裡沒有文字」。按上一／下一處逐個看，不循環越界；回完整對照保留原own。進入／切處後focus標題。提示已由原compare保存，不重複作答／曝光。
- 所有對照狀態（包含完全相同）提供「收起答案，從空白再想」。只重設暫存comparison／hint／differenceIndex，blank=true、blankText=''並focus textarea；不立刻改LR／LD或舊LB。輸入後沿既有LB-R／LB-D保存最新再想稿，原草稿保持；沒輸入退出仍可恢復上次LB。
- 一處模式只在open+comparison合法ref與無pending時可用；edit／close／route／start／新compare重設index，不把跨句或另一模式片段帶入。原busy／epoch／ref／IME與pending原UUID、latest cache／失敗可匯出保護沿用，完全不新添保存欄位。
- 一處頁不另外列完整原句／讀音／原音；若整句全不同，單一差異片段可能涵蓋全文；可回完整對照主動聽音。片段原樣HTML編碼，含空白也保留。文字不是詞彙／文法切分，一次只看一處不保證獨立記住。
- 控制至少48px、focus／sticky避讓、320～1440px無溢出。無差異時明示文字相同，仍可從空白再想，不提供無效一處入口。

## Task 1：差異分組

Files: app/core/life-dictation.mjs、tests/life-difference-steps.test.mjs。
- [x] RED：插入／刪除／替換、多處／Unicode emoji／相同全文／空側／4字context／300字上限與重組順序；GREEN。

## Task 2：一處視圖與重想

Files: app/ui/life-dictation.mjs、app/life-dictation.mjs、app/v3.css（必要時）；tests/life-difference-steps-ui.test.mjs／life-difference-steps-controller.test.mjs。
- [x] RED：按需才出片段、上一下一／回完整、空側／編碼／無差異、pending、重想空buffer／保留原稿及舊LB／輸入只存本模式／刷新模式與focus；GREEN、獨立審查。

## Task 3：測試與發布

- [x] 0.34.0及規格／課綱／畫面／來源／README／驗收。完整test→build→check／audit、160shell及146原音HTTP／SHA／MIME／SW。
- [x] 本機隔離QA多處差異→下一處→回完整→收起從空白再想→未輸入舊LB保留→輸入／刷新接續；雙模式／pending原UUID／舊首答線索、320／390／768／1024／1440、48px／Tab／console／截圖。
- [x] PR同headCI通過後合併、Pages build／deploy成功、正式HTTP／隔離UI／正常SW更新，文件證據push／遠端一致，正常入口／viewport／停server。

個人資料／QA不提交Git，不清DB／快取／SW或注入歷史。教師／真人／實機日文鍵盤及長期成效另列未驗證，回退先匯出JSON保留資料。
