# 五十音記憶第十三批 Implementation Plan（v0.17.0）

> 執行流程：superpowers:executing-plans。使用者已授權規劃、實作、測試、GitHub及Pages發布，沿用既有介面直接執行。

**Goal:** 讓口袋聽辨結果接上逐字回顧，分清原首答與提示，按需看一處記憶線索，再決定要不要留回口袋。

**Architecture:** 新增kana-pocket-review/<sessionId>，只由已完成kana-pocket-listen結果頁進入，不新增主導覽、題庫或資料欄位。從原questionIds／answers生成至多三張回顧卡，逐張顯示目標與原選字；訣竅與個人線索預設收起。沿用recordKanaExposure、setPocket及schema3，不新增attempt、分數或自動熟練判定。

**Tech Stack:** Node22 ESM、node:test、既有IndexedDB與K包音檔，無新增依賴或外部素材。

## 設計與邊界

在新增打字題型、另一個遊戲入口、深化結果回顧中選第三項。現有結果只列總數，尤其看過字卡後0/3無提示容易不知道該補哪字；本批把最多三個原首答分開呈現。每字標「無提示首答答對／提示後答對／首答答錯」及提示狀態，顯示原選字與參考字，不重評或改寫第一次答案。提示後想起來仍鼓勵，再由使用者挑一處線索。

結果頁提供「逐字回顧與記憶線索」，回顧頁可選第幾字（選單不預覽其他字形）、按需展開既有解說／個人線索與原字音。切字與刷新收起解說，局部選擇暫存；原聽辨輪與首答已保存。若目前有未完成口袋聽辨，回顧先收起，接續原輪，不預覽答案。未完成、來源不符或不存在的session不能回顧。

畫面已顯示的目標字與原選字即記曝光；展開才記解說與個人線索實際出現的假名。同步七日未答題、默寫草稿與快取，不把隱藏選單其他字或收起內容預記。回顧不新增答題事件；使用提示不回寫舊首答。

已在口袋的字標明狀態；已移出的字可明按「還想再練，留回口袋」，只更動清單，不移除其他字或自動宣告掌握。動作需核對原session／目前qid，避免過期DOM與快速連按。等待保存離頁／換字不拉回，失敗保留可匯出的待存資料。返回原聽辨結果、口袋、記憶線索與隔天檢查的路徑清楚。

## Task 1：唯讀回顧與曝光核心

Files：app/core/kana-pocket-review.mjs、tests/kana-pocket-review.test.mjs。

- [x] 先失敗：只接受完成來源、依原題序與原答案、四種正錯／提示組合、空／過期／其他來源、個人提示與目標／原選字實際曝光、收起不預記、純查詢不改state、備份往返不變。
- [x] 實作最小query／cue helper；node --test tests/kana-pocket-review.test.mjs綠，npm test；提交。

## Task 2：結果頁、回顧頁與控制器

Files：app/kana-pocket-review.mjs、app/ui/kana-pocket-review.mjs、app/main.mjs、app/ui/v3.mjs、app/ui/navigation.mjs；tests/kana-pocket-review-ui.test.mjs、tests/kana-pocket-review-controller.test.mjs。

- [x] 先失敗：入口／原來源返回、逐字選擇與預設收起、pending遮蔽、HTML安全、留回口袋、重複／過期動作、延遲／失敗保存、七日／默寫草稿快取、刷新保留首答。
- [x] 實作整合，版本v0.17.0；npm test、build後check、audit；更新README／規格／課綱／來源／驗收；提交。

## Task 3：實際驗收與發布

- [x] 隔離瀏覽器完成三題→回顧正錯與提示、切字／訣竅／音鈕、刷新／已移出再留回／原結果返回；pending不洩答案；320／390px、44px、鍵盤焦點與console。
- [x] requesting-code-review獨立核心與整合審查，必要修正；完整test／build／check／audit與本機shell SHA／MIME／SW／音檔HTTP通過。
- [x] PR／CI／相同head合併／Pages成功、正式HTTPS與隔離瀏覽器驗證／截圖、發布文件／remote同步；清理QA及server。

延用208卡及既有試用解說／合成音，尚待教師審校。實機依使用者先前決定略過，不推論發音或手寫評分。回退不清IndexedDB；無新schema欄位、source或ID，但回退前仍保存JSON。個人清單／線索／作答與QA紀錄不提交。
