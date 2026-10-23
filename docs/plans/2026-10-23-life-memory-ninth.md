# 生活記憶第九批 Implementation Plan（v0.30.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者授權規劃、實作、測試、GitHub與發布，直接按清單執行。

**Goal:** 看原課中文意思，先自己想出一句日文，再核對與收起重想，補足從意思到整句的回想。

**Architecture:** `life-recall`目錄與`life-recall/<unit>:<0..2>`單句頁，沿用92課276句原中文／日文／讀音／音訊。與聽寫共用控制器及唯讀字元對照；獨立`text:LR-<unit>:<slot>`草稿，schema3不變，不新增評分或作答來源。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原生textarea／IME、既有PWA。

## 設計與取捨

候選為聽寫草稿清單、更多統計、中文到日文回想。清單與統計偏整理；選中文回想，補上第八批聲音到文字之外的意思到文字路徑。每次一句，沒有倒數、連勝壓力或假分數。

- 目錄程度／場景篩選、真實課數與LR草稿句數；不預覽正文、個人草稿或記曝光。單句預設收起；主動開始後才出原課中文提示及空白／原LR草稿編輯器。中文提示不是新翻譯或唯一正解。
- 開始先持久化本課原qid參考曝光，成功才顯示中文；當日相關原題另列使用提示，不改已提交首答。pending全遮蔽並接原UUID。
- 編輯階段只看中文與自己的文字，不提前提供日文、讀音或音訊。明示對照後顯示唯讀兩文、Unicode字元差異、讀音／中文及原音／慢速；明示相同意思可能有不同說法，差異不判文法／自然度／分數。收起原句回編輯器與中文，再自己想一次。
- `text:LR-`與`text:LD-`、原課寫作／LN／作品分開。300字、空points、合法ref／時間／欄位驗證；實際時間較新者勝、同時異文衝突、較新空稿不復活舊文字。完整備份往返，失敗保留可匯出候選與latest cache。
- 兩模式共用小型控制器，route epoch／mode／ref隔離，換句／換模式／刷新收起；連按不重複、先曝光再顯示、較新輸入／compositionstart取消延遲對照，input不重繪。LR不能用偽造audio action在對照前播日文。
- 入口由生活目錄／練習總覽／原課／能力／卡片／線索與聽寫互連；路徑顯示原課與中文回想目錄。手機48px控制、標籤／焦點、字形／HTML保護延續。

## Task 1：草稿與資料保留

Files: modify `app/core/life-dictation-state.mjs`、`app/core/life-dictation.mjs`、`app/core/learning.mjs`；create `tests/life-recall.test.mjs`。

- [x] RED：276合法LR ref、獨立LD／LR／LN／作品與首答，300字／非法欄位／時間／points，備份往返／時間合併／空稿／同時衝突／pending。
- [x] GREEN並提交；沿用原276句，不加新教材。

## Task 2：中文提示、回想與整合

Files: modify `app/life-dictation.mjs`、`app/ui/life-dictation.mjs`、navigation／life-memory／life-cards／life-skills／life-notes／courses；create `tests/life-recall-ui.test.mjs` and `tests/life-recall-controller.test.mjs`。

- [x] RED：預設隱藏／中文先提示／日文與audio對照前不在DOM、空字禁用、差異唯讀／收起／跨模式／篩選／pending／入口路徑。
- [x] RED：曝光成功後才顯中文、quota與可匯出草稿、模式／ref隔離、延遲離頁／連按／IME不中斷與新input失效。
- [x] GREEN，核心及UI獨立審查，必要修補。

## Task 3：驗證與發布

- [x] 版本0.30.0、README／規格／課綱／畫面／來源／驗收同步；完整test→build→check、audit、shell逐檔SHA／JS MIME／SW與146原音HTTP。
- [x] 隔離QA中文回想→日文草稿→刷新／獨立聽寫→對照→收起，空場景、pending原UUID、舊首答／線索保留；320／390／768／1024／1440、48px／鍵盤／console／截圖。只用?qa=1，不清DB／快取／SW、不注入跨日歷史。
- [ ] PR同head CI、merge、Pages成功，正式HTTP與隔離UI、正常SW更新；證據文件push遠端一致，離開QA、停止server、復原viewport。

本批不是自由翻譯／作文／口說評量。教材仍原創試用待教師審校；實機／OS日文鍵盤及長期效果不由本批推論。回退先匯出JSON、保留DB與備份，舊版可能不辨LR入口；個人文字與QA不提交Git。
