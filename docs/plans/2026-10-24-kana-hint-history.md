# 五十音提示與回饋歷史 Implementation Plan

> **For Codex:** Use superpowers:executing-plans and test-driven-development task-by-task. User authorizes implementation and release.

**Goal:** 分開答前提示、答後回饋與後續參考，讓跨日／七日記憶以完整可追溯事件判定；既有答案不改寫。

**Architecture:** schema3保留，在v3新增optional kanaHistory v1事件簿。原kanaHints三欄保留供舊工具提示階段／最新參考使用；事件簿採每字×種類×來源×精確時間，首答另以原event ID檢查點連結。舊最後提示懶載入為legacy，不虛構早先事件。報表和時間線唯讀，下一步仍沿原輪。

**Tech Stack:** Node22 ESM、node:test、原生HTML/CSS、IndexedDB schema3、Pages/PWA，無新依賴、語言教材或音檔。

## 決策與約束

只改latestHint仍會覆蓋證據；另改舊答案會失去首答。採旁掛事件簿，不遷移／清空DB，不重算原答案。新紀錄區分hint（主動提示）、feedback（已提交答案的回饋）、reference（原圖／詞例／後續參考）、answer（新首答檢查點）、legacy（舊最後提示，不完整）。同來源同一時間重繪只保存一筆；不同時間／種類／來源與日期仍分開。60000事件上限報未保存，不默默裁切。

- 新首答檢查點與原attempt的ID／item／time匹配；不將匯入舊作答或reviews重建回填為新證據。
- 參考與回饋皆影響之後1／7日間隔，答後回饋不倒灌成當次提示；新答前提示沿原hinted旗標保存。認字／聽辨／詞音／手寫各自保留，手寫仍是自評。
- 舊最後時間以legacy原樣留存。沒有新檢查點且舊提示晚於首答者仍待確認；不由新紀錄補造舊記憶。未來事件截止排除；同時事件保守處理。
- shape、種類、時間、208字ID、來源格式、重複／容量、檢查點與備份合併均驗證。合併採聯集及同key去重；衝突拒絕，不改原首答；整理舊完成輪後歷史仍在。
- V3／V2／V1題前提示與題後回饋分開記；既有提示頁統一reference，五十音教材／字圖／筆順／書寫頁實際顯示的字納入參考。題目必要聲音／選項不因顯示題幹被誤算提示。
- 時間線入口在五十音弱點明細，原字ID定位、台北精確時間、種類與來源、分頁；不顯示答案文字或私人線索。weekly展示分類事件數，舊歷史不足說明保留。

## Task 1：事件資料與備份

Create app/core/kana-history-state.mjs、tests/kana-history.test.mjs；modify learning.mjs、v3-state.mjs、kana-studio.mjs。
- [x] RED→GREEN：舊schema1/2/3、懶建legacy、種類／重繪去重／跨日、單調latest、首答檢查點、malformed／上限、備份聯集／衝突／不改舊答案。

## Task 2：答題與記憶證據

Modify v3-learning.mjs、v3.mjs、v2.mjs、main.mjs、kana-rhythm.mjs、kana-recall.mjs、kana-coach.mjs、unified-review.mjs；new meaningful controller/evidence regressions。
- [x] RED→GREEN：答前hint／reference判定、答後feedback不抹除、翌日與七日間隔、原覆蓋重現、未來／同時／比較字曝光、真實V3/V2控制器與V1整合。
- [x] 原pending／計時／題序／首答／草稿／提示階段保持，儲存失敗未揭題且待存可匯出。

## Task 3：時間線與發布

Create app/ui/kana-history.mjs、tests/kana-history-ui.test.mjs；modify unified-review UI／v3 views／navigation／CSS。
- [x] RED→GREEN：分頁、種類、原字深連結、空／舊資料、編碼、零寫入、手機排版與焦點。
- [x] 同步README／規格／課綱／畫面／來源／roadmap，v0.40.0完整規劃與驗收。
- [x] 獨立唯讀核心／整合審查；全站test→build→check、audit。
- [x] 本機隔離QA新提示／答題／回饋／時間線、舊備份與原答案保持、五寬／Tab／console、HTTP SHA；正式前後正常與QA備份。
- [ ] PR同head CI→merge→Pages→正式HTTP／PWA自然更新／實際畫面與資料比對，截圖、文件推送／遠端一致、恢復viewport／停server。

不清DB／cache／SW，不以瀏覽器注入虛構跨日進度。實機OS操作、教師／真人審音與長期學習成效仍待外部證據；回退前先匯出備份。
