# 生活日語記憶與複習 Implementation Plan（v0.22.0）

> REQUIRED SUB-SKILL：superpowers:executing-plans。使用者授權規劃、實作、測試、GitHub與發布，沿用既有畫面與教材，本清單追蹤，不另設確認關卡。

**Goal:** 讓12生活起步與80分級情境可用「三句參考→三題回想→隔天最多三題→小結／原課輸出」短循環接續。

**Architecture:** life-memory hub／單課、life-check隔天入口，沿用V3作答、草稿及首答。新life-memory、life-check來源合計最多一輪pending；新optional lifeHints保存每題每天最早參考曝光，schema3延續。既有教材、題目ID、音檔與V1/V2資料不改。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原PWA／音檔；無新依賴、題庫或真人素材。

## 設計

比較新造大量題庫、另開背單字遊戲、串接原生活教材，選第三項。分類／程度找課，一課最多三句不重複原對話，先看中文回想；日文／讀音按需展開，聽例句與展開皆記為本課參考。新三題固定一聽解、一自主填空／排序、一情境／理解選擇（若無該類則用其餘原題補足），開始後收起卡片。生活起步與N5～N2各自標示，原文較長時保持完整語意，不切割合成音。

隔天最多三題，每課最多一題，只用較早日期實際做過且今天未作答的題；錯答／提示與到期優先，以cutoff attempts重建reviews，不用未來資料。每天一輪，沒有題就說明原因，不用新題冒充跨日。新兩來源一pending，刷新／離開續作，其他完整課回想分開保留。結果原首答／提示／跨日可比較證據分開，不推論真人口說、自由寫作或JLPT。

lifeHints以原qid為key、每天最早ISO曝光為value array，按台北日去重／合併保留，總量上限20000；未來曝光不掩蓋較早日期。本課三句參考及原study的learn／words／read可見參考標記該課原題；write只在展開參考時記錄。V2/V3答後／明示提示標記實際原題，不把一般題目音檔重播視為本題答案提示。新答案依同日／起輪當日至作答的已可見曝光另列hinted，答後曝光晚於首答，避免回寫原評分。

來源／題序／題數／日唯一、qid歸屬與optional提示資料納入驗證與備份合併；衝突pending／同日雙輪拒絕，不清資料。控制器防連按、過期路由／卡片事件、延遲離頁與保存失敗，失敗仍可匯出。提示需實際展示才記，局部卡片展開刷新收起。此批內容全重用既有試用教材，不新增未經教師審校的語言規則。

## Task 1：內容、提示與保存核心

Files：content/life-memory-ids.mjs、core/life-memory-state.mjs、core/life-memory.mjs、core/v3-state.mjs、core/v3-learning.mjs；tests/life-memory.test.mjs。

- [ ] 先紅：92課／三題與既有音檔、三句去重、首答／提示分開、單pending、strict reference／queue、隔天三課／每日唯一／cutoff、曝光時間與合併／舊備份、原資料不變。
- [ ] 最小核心／validators／engine整合→綠→提交。

## Task 2：手機短循環與曝光

Files：life-memory.mjs、ui/life-memory.mjs、main.mjs、ui/v3.mjs、ui/navigation.mjs、ui/study.mjs、ui/courses.mjs；tests/life-memory-ui.test.mjs、tests/life-memory-controller.test.mjs。

- [ ] 先紅：hub分類／程度、三句中文與日文按需、正常音／三題啟動／pending遮蔽、結果與跨日小結、來源麵包屑、原課及寫作入口。
- [ ] 控制器曝光／提示／日唯一／連按／刷新／過期／延遲／失敗匯出／原study可見內容與write參考toggle→綠，整合首頁／生活分類／單課／練習入口；提交。

## Task 3：驗證與發布

- [ ] 版本0.22.0，README／規格／課綱／素材／驗收；全npm test→build→check→audit。
- [ ] requesting-code-review獨立審查，必要修補／複核。本機隔離UI三句→三題→首答／提示／刷新接續→結果、原課、隔天空狀態；320/390px、44px、鍵盤、console、HTTP shell SHA／原音檔。
- [ ] 同head PR CI成功合併、Pages成功，正式HTTP與隔離UI／舊資料、截圖；補發布文件、push遠端一致、清理QA/server。

教師／真人／實機仍依既有邊界；不把桌機尺寸當實機。回退前匯出JSON，舊版可能不識別新source／optional lifeHints，保留備份，不清DB。個人答案／草稿／QA不提交Git。
