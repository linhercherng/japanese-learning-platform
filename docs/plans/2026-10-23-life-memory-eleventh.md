# 生活記憶第十一批 Implementation Plan（v0.32.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者授權規劃、實作、測試、GitHub及發布，按清單直接完成。

**Goal:** 不先看到舊稿，從空白重新想出一句；新文字另存最新再想稿，原草稿保留。

**Architecture:** 在既有LR／LD單句頁增加「不看舊稿，從空白再想」與「接續上次再想稿」。schema3 drafts新增text:LB-R-<unit>:<slot>／text:LB-D-<unit>:<slot>，兩種再想稿與原LR／LD、LN／作品分開；共用曝光、提示、Unicode對照與原音。目錄加有文字再想稿scope，不新增路由／評分source。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原生textarea／IME、既有PWA。

## 設計與取捨

比較更多統計、每日草稿到期日、空白再想。現有草稿重新開始會看到自己上次寫的原文，無法先獨立回想；選空白再想。到期日不能僅靠草稿存在就當作記住，統計亦不補這個卡點。

- 既有開始入口保留；新「不看舊稿，從空白再想」只開空白textarea，不讀出原LR／LD或上次再想稿，不先刪除舊稿。LR仍先保存中文參考曝光才開啟，LD空白開始不記曝光，聽音／輸入／對照沿用原規則。
- 每句每模式只保留最新再想稿：輸入另存LB-R／LB-D，原LR／LD不覆寫；新一輪未輸入不清掉上一份LB。明示此範圍。有非空白LB時可主動「接續上次再想稿」，才展開LB文字並記曝光；刷新／換句／模式先收起。沒有得分、完成／熟練度或跨日記住推論。
- 空白編輯的UI buffer獨立，不由舊LB初始化；input不重繪，先latest cache後串行寫入。比較、提示／提示退場、回編輯都留本次buffer；離頁前已輸入的LB可恢復，失敗保留可匯出候選。busy／ref／mode／epoch／version／IME防延遲揭露、連按與跨模式覆寫。
- LB嚴格驗證R／D模式、canonical unit:slot、300字／空points／合法時間及欄位，實際時間merge、同時異文衝突、較新空稿不復活；schema3／V1/V2原資料保持。pending遮蔽原稿、再想稿、中文及提示，接原UUID。
- 兩目錄新增「有文字再想稿」，各模式獨立計數。原「有文字草稿」仍只計LR／LD；卡片另列再想稿總句與有文字句數，不預覽個人文字、不記曝光。程度／場景組合、空結果可復原，48px控制與焦點延續。

## Task 1：再想稿資料與備份

Files: modify `app/core/life-dictation-state.mjs`、`app/core/life-dictation.mjs`、`app/core/learning.mjs`；create `tests/life-blank.test.mjs`。

- [x] RED：552再想key與276原句、LR／LD／LB-R／LB-D／LN／作品／首答保留，非法mode／ref／日期／欄位／長度／points，備份往返／時間merge／空稿／衝突／pending。
- [x] RED：兩模式再想稿目錄與原稿scope各自計數／空白不列／只讀；GREEN並提交。

## Task 2：空白回想與接續

Files: modify `app/life-dictation.mjs`、`app/ui/life-dictation.mjs`及必要CSS；create `tests/life-blank-ui.test.mjs`、`tests/life-blank-controller.test.mjs`。

- [x] RED：空白不顯原稿／舊LB、明示最新再想稿、接續／重啟／刷新、LR中文／LD音訊、提示與比較保留新buffer、pending／目錄／編碼／焦點。
- [x] RED：開始不改任何稿，輸入只存本模式LB、失敗可匯出、先曝光再開、連按／stale route／新input與IME不打斷；GREEN並獨立核心／UI審查修補。

## Task 3：驗證與發布

- [x] 0.32.0與README／規格／課綱／畫面／來源／驗收，test→build→check、audit、160 shell SHA／MIME／SW與146原音HTTP。
- [x] 本機隔離QA空白→新稿→提示／比較→刷新接續／再開空白，原LR／LD／LN／首答保留、LB目錄真數字與空結果、pending原UUID；320／390／768／1024／1440、48px／Tab／console／截圖。只用?qa=1，不清DB／快取／SW、不注入歷史。
- [ ] PR同head CI、merge、Pages、正式HTTP／隔離UI、正常SW更新；證據文件push遠端一致，離開QA／停止server／恢復viewport。

此為整句再想練習，不是自由翻譯／作文／口說評量。教師／真人審校、實機／OS日文鍵盤、長期效果仍未由本批推論。回退先匯出JSON、保留DB／備份，舊版可能不辨LB入口；個人資料及QA不提交Git。
