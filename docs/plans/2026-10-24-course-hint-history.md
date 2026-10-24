# 生活與 N5～N2 提示歷史 Implementation Plan

> **For Codex:** Use superpowers:executing-plans and test-driven-development. User authorizes implementation, GitHub merge and Pages release.

**Goal:** 分開生活日語與四級主課的答前提示／答後回饋／參考，提升跨日及七日證據精度，原答案、續作與草稿保持。

**Architecture:** schema3新增optional v3.courseHistory v1，事件僅item/time/kind/ref；已知生活原題及四級主課原題驗證。保留lifeHints/jlptHints每日合併資料相容舊工具；首次實際寫入懶建legacy，舊歷史不補造階段或首答檢查點。報表唯讀，索引歷史一次後共用提示判定。

**Tech Stack:** Node22 ESM、原生HTML/CSS、node:test、IndexedDB schema3、Pages/PWA，無新依賴、語言教材或音檔。

## 決策

只擴充舊每日時間仍會丟失同日提示／回饋順序；改原hinted會破壞首答。採旁掛事件簿與新首答ID檢查點，原紀錄不可變。每item×kind×ref×精確時間去重，不裁切。60000事件上限明確拒絕並保留待存可匯出；整份備份仍12MB匯入上限。新版可讀舊schema1/2/3；含新欄位的備份需新版匯入。

hint為主動答前提示；feedback為當次答後解釋；reference為教材、卡片、原輪答案或個人線索等參考；answer連新attempt；legacy保留舊每日最早已知時間但階段不明。答後回饋不倒灌當次提示，影響下次1/7日間隔；舊無檢查點且較晚legacy仍待確認。合併較早參考時以分析反映，不改原答案；舊分支衝突與格式驗證保留。

## Task 1：資料與證據

- [x] Create app/core/course-history-state.mjs and tests/course-history.test.mjs。RED舊shape／懶legacy／去重／同日多次／容量／來源／已知ID／檢查點／備份聯集衝突，GREEN後提交。
- [x] Modify learning.mjs、v3-state.mjs、life-memory-state.mjs、jlpt-memory-state.mjs。recordAnswer才新建checkpoint，recordAnswers/rebuild不補造。原attempt/session/draft immutable。
- [x] RED→GREEN tests/course-history-evidence.test.mjs；整合v3-learning／v2／life-retention／life-memory／life-progress／jlpt-memory／unified-review。答前、答後、同時、未來、跨日、七日、合併及舊未知；各級真實原題逐級覆蓋。

## Task 2：控制器與時間線

- [x] RED→GREEN真實V3／V2控制器：hint準備時間去重、feedback保存後才揭開、容量／quota失敗、離頁回來重試、原首答不改。沿五十音現有屏障擴至生活／主課，移除舊重複afterRender曝光。
- [x] 教材、詞卡、原輪回顧、聽寫／中文回想／線索保留reference；原課listen題幹／選項不誤當提示；V1生活題後回饋保存屏障。不同來源命名，不保存私人文字。
- [x] Create app/ui/course-history.mjs and UI tests。每頁20，全部／L／N5～N2／原題過濾、breadcrumb、台北精確時間、五類數量、來源、返回原課與弱點。無題幹／答案／私人文字；零寫入。weekly分類摘要、weakness單題時間線入口。

## Task 3：驗收與發布

- [x] 完整規劃／README／規格／課綱／畫面／來源／roadmap及v0.41.0。
- [x] 獨立唯讀核心與整合審查，修正重要問題再複核。全站test→build→check、audit，記錄最終hash。
- [x] 新port隔離QA由UI匯入舊備份；實際生活與N5～N2提示／作答／回饋、原輪／草稿保留、歷史／weekly零寫入、五寬／Tab／大字／console及shell HTTP。無真實庫測試寫入或腳本注入。
- [x] 正式前備份，PR同head CI→merge→Pages→正式HTTP／自然PWA升級／畫面／正常與QA全state比對。保留正式頁、截圖，還原viewport、停server，文件推送與遠端一致。

不清DB／cache／SW，不假造跨日學習、實機或教師審校證據。只用原教材，非官方熟練或檢定分數。
