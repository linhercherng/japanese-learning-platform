# 五十音記憶第十六批 Implementation Plan（v0.20.0）

> REQUIRED SUB-SKILL：superpowers:executing-plans。使用者已授權本批規劃、實作、測試、GitHub與Pages發布，沿用現有畫面，本清單追蹤，不再設確認關卡。

**Goal:** 雙向聽辨完成後，兩字逐一看原首答、挑一處記憶線索，主動留下想再練的字，接起短而完整的回想循環。

**Architecture:** 延伸既有kana-pocket-review至已完成kana-contrast，不新增source、題目、資料欄位或主選單。動態kp題用contrastQuestion解析，回顧逐字只展開該目標的既有訣竅；錯答可用既有雙卡遮住／揭開。入口與返回路徑保留原雙向輪，口袋異動只在明示留回時發生。

**Tech Stack:** Node22 ESM、node:test、既有IndexedDB schema3與K音檔；無新依賴、教材或素材。

## 設計與取捨

比較增加第三個遊戲、再做同一組題、補上完成後回顧，選第三項。第十五批只有兩題結果，尚未接上逐字訣竅與主動留回；本批以既有回顧元件完成此循環，避免更多導覽入口。結果新增「兩字逐一回顧與記憶線索」，選字器只顯示題序及原首答狀態，逐一看目標／原選字。展開只給目標的一處既有訣竅與個人線索，錯字雙卡仍可主動對照、遮住再回想。從未加入與已移出分開說明，均須主動加入，不自動清空或擴大口袋。

已完成原口袋與雙向聽辨均可回顧，其他來源／未完成／未知輪不接受。動態解析無catalog循環依賴；新輪不依賴最初的口袋session存在。回顧不新增attempt、不重評、不改首答／自評；顯示及展開的實際文字才記曝光，同步七日、默寫草稿與cache。任一口袋聽辨pending時，兩類舊回顧均先遮蔽並接續原輪。切字／刷新收起線索與雙卡，保持鍵盤焦點；保存失敗保留匯出、延遲離頁不拉回。只視為當天加練，不推論跨日掌握、手寫或真人發音。

## Task 1：純核心與入口（先紅後綠）

Files：app/core/kana-pocket-review.mjs、app/ui/kana-pocket-review.mjs、app/ui/v3.mjs、app/ui/navigation.mjs；tests/kana-contrast-review.test.mjs。

- [x] 先寫測試：兩題原順序／四種首答狀態、正確與錯誤原選字、未完成及非指定來源拒絕、備份往返／合併不變、只有實際文字曝光、目標單一訣竅、結果入口／原字對麵包屑、未留與已移出、pending無預覽。
- [x] node --test tests/kana-contrast-review.test.mjs確認預期紅；最小實作再綠，原口袋回歸一起跑；提交。

## Task 2：真控制器與文件

Files：tests/kana-contrast-review-controller.test.mjs；必要時app/kana-pocket-review.mjs；README、規格、課綱、素材、驗收、package版本。

- [x] 先寫真控制器行為測試：曝光同步七日／默寫cache、切字關閉與過期事件、遮住不曝光、主動keep與連按／延遲／離頁／保存失敗匯出、pending雙向阻擋，不改原輪。共用控制器直接綠，無額外改碼。
- [x] 版本0.20.0、文件與測試整合；npm test→npm run build→npm run check→npm audit --audit-level=high，獨立審查及必要修正；提交。

## Task 3：瀏覽器與發布

- [x] 本機隔離UI：合法字對入口→兩題→新回顧→線索／雙卡遮住揭開→切字／刷新→主動留回→原結果／原首答不變；320/390px無溢出、44px、焦點、console；HTTP雜湊／音檔。原錯答入口沿用第十五批，正式站再驗既有原輪。
- [x] PR同head CI成功後合併，Pages成功，正式HTTP及隔離UI／截圖驗證。補發布證據、push遠端同步、清理QA/server。見[第十六批驗收](../kana-sixteenth-validation.md)。

沿用208卡、508筆順、10947音檔索引及K包668檔。既有試用訣竅／合成音仍待獨立教師審校，實機依先前決定略過。個人資料、QA、截圖不提交公開Git；無schema變更，回退前仍先匯出JSON。
