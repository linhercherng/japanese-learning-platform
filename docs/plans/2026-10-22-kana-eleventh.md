# 五十音記憶第十一批 Implementation Plan（v0.15.0）

> 執行流程：superpowers:executing-plans。使用者已授權規劃、實作、測試、GitHub及Pages發布，直接執行。

**Goal:** 把翻卡的「還不熟」保留下來，下次最多三字混合回想，再由使用者主動移出口袋，維持容易學、容易記。

**Architecture:** 延用208字卡、既有音檔與翻卡曝光機制；新增翻卡內的kana-pocket入口。optional v3.kanaPocket只存合法字卡的active/time事件（含移出墓碑），不增加答題來源或題庫、不遷移schema3。合併採較晚時間，同時衝突保留active；口袋三字輪暫存，刷新重新選尚留口袋的字。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原有合成音與PWA，無新增依賴。

## 選擇與界線

相較新增另一種題型或自動宣告熟練，本批補上原翻卡自評刷新即消失的缺口。「還不熟，稍後再想」同時保存口袋；原本同組翻卡與最多六次展示不改。口袋每輪固定至多三個不同字，先選較早留下的字；同時以字卡順序穩定排序，不隨機、不計時、不預覽字表。輪中先看字回想，展開原讀音／例詞／訣竅後才可選「還不熟，留在口袋」或「這次想起，移出口袋」。三字完成後手動另開下一輪，不自動連刷。

口袋是自己的練習清單，不是答對、熟練、到期或七日證據；移出不抹除既有答題與提示。看見字形即記該字曝光，展開才記實際例詞與訣竅曝光，沿用recordKanaExposure同步七日未答題及默寫草稿／快取。刷新或重新開頁保留清單、收起提示、本輪暫存重來；畫面清楚說明。無資料時引導原翻卡，不硬補新字。

驗證僅接受208個ID、布林active與有效ISO時間，拒絕額外欄位。移出墓碑防止舊備份復活，較晚事件優先；同一時刻衝突保留不熟字，合併需具交換性／冪等性。無效或過期DOM動作忽略；等待保存換頁不能強制跳轉，失敗保留可匯出的待存事件。來源位置、返回翻卡與今天怎麼練皆清楚。原提示與首答不回寫。

## Task 1：保存與小輪核心

Files：app/core/kana-pocket-state.mjs、app/core/kana-pocket.mjs、app/core/v3-state.mjs、tests/kana-pocket.test.mjs。

- [x] 先失敗：208字／非法ID與時間／額外欄位、舊備份、active/tombstone往返、晚事件與同時衝突雙向合併、三字穩定排序與固定輪、不可未展開自評、無新增attempt/review。
- [x] 最小實作，node --test tests/kana-pocket.test.mjs綠；npm test 341/341；提交。

## Task 2：翻卡與口袋畫面

Files：app/kana-sixth.mjs、app/ui/kana-sixth.mjs、app/ui/kana-focus.mjs、app/ui/navigation.mjs；tests/kana-pocket-ui.test.mjs、tests/kana-pocket-controller.test.mjs。

- [x] 先失敗：空清單／三字前後隱藏、顯式留存與移出、翻卡原功能、刷新／過期／雙擊／延遲／失敗保存、曝光與默寫／七日同步、麵包屑無答案。
- [x] 實作入口、固定三字局部輪、按鈕焦點、清楚自評說明，版本v0.15.0；test、build後check，提交。

## Task 3：驗收、審查、發布

- [x] 隔離瀏覽器建立口袋、刷新、三字混合／先回想再展開／移出；Node備份往返；空、進行、完成狀態320／390px、44px、鍵盤／音鈕與console；既有翻卡／二選一與節奏回歸。
- [x] 依requesting-code-review獨立審查核心與UI，完整npm test 349/349、npm run build、npm run check、npm audit --audit-level=high；README／規格／課綱／素材／驗收同步。
- [ ] PR、CI、相同head合併、Pages成功、正式HTTPS shell SHA／MIME／SW／音檔與隔離瀏覽器驗證／截圖；發布證據與remote同步；清理本輪server／QA頁。

實機依使用者前次決定略過，不宣稱實機／IME／發音自動評分。素材沿用既有原創試用教材，尚待教師審校。回退前保留JSON，新optional欄位舊版可能無法匯入，不清IndexedDB。
