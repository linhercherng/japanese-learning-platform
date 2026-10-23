# 生活記憶第三批 Implementation Plan（v0.24.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃→實作→測試→GitHub→發布，本清單追蹤，沿用既有教材／畫面直接執行。

**Goal:** 把每日少量回想接成可理解的節奏：完成就可收尾，明天再想，滿七天再確認。

**Architecture:** 新life-week與life-schedule頁；life-week來源與前三種生活來源共一pending，每台北日一輪。七日選題與預告從cutoff內attempts／lifeHints推導，無新schema欄位或教材。既有首答／草稿／備份延續。

**Tech Stack:** Node22 ESM、node:test、既有IndexedDB／PWA／合成音。

## 設計與取捨

比較新增收藏／自評、再造變式題庫、接續實際練習的間隔與收尾，選第三項。前兩批已能練、看弱點與回顧，但同日提示題不易消失，下一步會反覆推薦加練；本批讓「今天做得夠了」及下一次何時再想變得清楚，不加入未審校語言教材。

- `#life-week`：較早實際做過的原題，距最後同題練習及最後本題參考的台北日期至少7天，今天未練，最多三題且每課一題。錯答／提示、到期及原時間優先。先按cutoff過濾歷史再重建reviews，未來attempt／hint不影響今日。無適合題時顯示最早可回想日期，不用新題充數。
- 新source `life-week`，reference=建立台北日，日期／原qid／三課／無插入訂正／同日唯一／共一pending與備份合併驗證。提示沿用lifeHints但七日輪需考慮作答前7個日期及整段未完成輪期間的曝光（day >= min(startDay, answerDay-6)，且time <= answer）；合併若與原無提示首答矛盾，拒絕並保留備份。
- 七日小結：與隔天報告共用結構，須有至少7天前同題紀錄，排除提示、中途另練、同時戳及缺少可比較歷史。正常聽解刺激音不當額外提示；不宣稱手寫／真人口說／JLPT熟練。
- 每日收尾：地圖下一步先接續pending；當日已完成任一生活小輪（且完成時間不晚於cutoff）便顯示收尾與複習預告。未完成今日小輪時，優先七日→隔天→弱點→未練課。仍有明確「自行加練」入口，不強制重做、不取消原輪；手寫自評／V2完整課不冒充本小輪完成。
- `#life-schedule`：從真實做過原題推導每課最早隔天檢查日／七日回想日，最近參考會延後七日日期。最多6個場景預告、其餘有數量說明；日期可變，非系統通知或自動排程。只有題目／場景日期，無答案或音檔，不造成曝光。空歷史說明先練一課。
- 專屬controller `data-life-retention-action`：start先保存，busy／過期路由／延遲保存離頁守護，失敗可匯出；pending回原UUID，當日完成不重建。整合首頁、生活目錄、地圖、第一批隔天頁與結果。七日結果可用第二批原輪回顧，pending全遮蔽延續。

## Task 1：核心、提示與保存

Files: `app/core/life-retention.mjs`、`app/core/life-progress.mjs`、`app/core/life-memory.mjs`、`app/core/life-memory-state.mjs`、`app/core/v3-learning.mjs`、`app/core/v3-state.mjs`、`app/content/life-memory-ids.mjs`；`tests/life-retention.test.mjs`。

- [ ] 先紅：7日邊界／台北日、最後練習／曝光延後、未來cutoff、三課、每日唯一與pending／備份、7日提示與衝突合併／回調、報告排除、完成收尾／未來完成不算、預告不改原資料。
- [ ] 實作純函式／原引擎接合，`node --test tests/life-*.test.mjs`綠，提交。

## Task 2：手機路線與預告

Files: `app/life-retention.mjs`、`app/ui/life-retention.mjs`、main／navigation／v3／life-memory／life-review／courses UI，`app/v3.css`；`tests/life-retention-ui.test.mjs`、`tests/life-retention-controller.test.mjs`。

- [ ] 先紅：七日入口／空與未到期／已完成／pending、預告真日期／無答案／HTML編碼、返回／原輪回顧與收尾、自行加練仍可用。
- [ ] 控制器日唯一／刷新／連按／過期／延遲離頁／失敗匯出測試綠，整合既有入口；提交。

## Task 3：驗收與發布

- [ ] 版本0.24.0、README／規格／課綱／畫面／來源／驗收；npm test→build→check，audit零high。
- [ ] requesting-code-review獨立核心／UI審查及修補複核；本機隔離QA收尾／預告／七日未到期／既有回顧與加練、320/390px／44px／鍵盤／console／原紀錄。
- [ ] 同head CI成功合併、Pages成功，正式shell SHA／JS MIME／SW與146次原音HTTP、隔離UI與截圖；補證據push、遠端一致、關QA／server。

七日／跨日規則用固定時間自動測試，不注入虛構瀏覽器歷史或改時鐘，不把當日QA說成實際追蹤七天。實機與教師／真人審校另列；回退先匯出JSON，舊版可能不認life-week，勿清DB。個人答案／草稿／QA不進Git。
