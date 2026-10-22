# 五十音記憶第十四批 Implementation Plan（v0.18.0）

> REQUIRED SUB-SKILL：superpowers:executing-plans。使用者已授權本批規劃、實作、測試、GitHub與Pages發布，沿用既有畫面，不再加確認關卡；以本文件清單追蹤執行。

**Goal:** 從自己選錯的兩個字看一處差異，再遮住字形回想、揭開核對，讓錯答接上可完成的記憶小循環。

**Architecture:** 接在kana-pocket-review/<sessionId>的錯答卡，從原canonical選項解析參考字與原選字，沿用既有memoryFor與confusionPairs。只加局部UI狀態，不新增schema、題庫、source、attempt或分數；已顯示的雙卡文字仍沿用曝光／七日／默寫快取同步。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原有K音檔與淺底卡樣式，無新依賴與素材。

## 設計與邊界

比較另開新遊戲、擴充更多訣竅、把原錯答轉為雙卡對照三種方向，選第三項：第十三批已讓人看見原選字，本批直接幫他比較兩字。只在原首答錯誤、兩個canonical假名存在且不同時提供「對照參考字與原選字」。未知選項、正確答案與不一致的備份值不憑空配對，也不自動推論為長期混淆。

預設收起；展開兩張淺底卡，標明「參考字／我當時選的字」、各自字形、輔助讀音、既有例詞／詞義與記憶訣竅，音鈕分別命名。若兩字恰有既有confusionPairs對照，另顯示既有difference；其他組合不生成新的音韻／字形規則。一次只看原線索或雙卡，避免重複堆內容；切字與刷新皆收起。

展開雙卡後，可按「遮住字形，自己回想」，隱藏目前目標／原選字、雙卡解說、音鈕及個人線索，保留不含字形的原首答狀態、選單與操作。提示「回想參考字的字形與一處差異，再揭開核對」，按「揭開雙卡，自己核對」回同一對照。不計時、不問是否答對、不產生答題紀錄或跨日證據。遮住／揭開是當天加練；原首答與提示永遠不重寫。

僅雙卡實際展開才曝光兩字的reading／word／wordReading／memory.tip與可用difference，包括其內其他假名；原選字原本已在基礎回顧可見。遮住時不記隱藏內容、沒有新曝光。實際render固定ID後入更新佇列，同步七日未答題、默寫草稿與cache。未完成口袋聽辨時仍整頁遮蔽；事件須核對session/qid及當前對照狀態，過期／快速重複／離頁事件忽略。原留回口袋的保存失敗／延遲守護保留。

## Task 1：雙卡與曝光核心

Files：app/core/kana-pocket-review.mjs、tests/kana-pocket-contrast.test.mjs。

- [x] 先紅：原錯答配對／順序、正確與未知／同字拒絕、208字選項涵蓋、既有difference雙向匹配、無匹配不造規則、實際雙卡文字曝光、純查詢與備份不變。
- [x] 實作pocketContrast(entry)與contrastCueItems(pair)，node --test tests/kana-pocket-contrast.test.mjs綠；提交。

## Task 2：對照／遮住／核對小循環

Files：app/ui/kana-pocket-review.mjs、app/kana-pocket-review.mjs、app/ui/shared.mjs；tests/kana-pocket-contrast-ui.test.mjs、tests/kana-pocket-contrast-controller.test.mjs。

- [x] 先紅：只有錯答入口、雙音鈕命名與HTML編碼、遮住不洩字音／選字／線索、切字／刷新重置、pending遮蔽、過期操作與焦點、無作答副作用、七日／默寫cache及失敗保存。
- [x] 最小整合：reviewLocal加contrast/covered；兩面板互斥；cover/uncover只局部UI；afterRender可見分流，covered直接不曝光；成功動作聚焦實際存在的控制。保留原keep行為。
- [x] npm test→build→check及audit，版本0.18.0，更新README、規格、課綱、素材與驗收；提交。

## Task 3：實際驗收與發布

- [x] 隔離真實瀏覽器造原錯答→雙卡→兩音→遮住／核對→切字／刷新→原結果；320／390px、主要控制44px、鍵盤焦點、長文字與console。
- [x] requesting-code-review獨立審查，必要修正再驗證；本機shell SHA/MIME/SW與既有音檔HTTP通過。
- [ ] PR／CI相同head合併、Pages成功；正式HTTPS與隔離瀏覽器確認、保存截圖，補發布文件並push，remote同步；關閉QA與server。

教材仍是尚待教師審校的既有試用內容／合成音；沿用208卡、508筆順、10947音檔索引，K包668檔。實機依先前決定略過；回退前匯出JSON，不清IndexedDB。個人線索／答案與QA紀錄不提交公開Git。
