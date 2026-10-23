# 五十音記憶第十五批 Implementation Plan（v0.19.0）

> REQUIRED SUB-SKILL：superpowers:executing-plans。使用者已授權本批規劃、實作、測試、GitHub及Pages發布，沿用既有畫面，以本清單追蹤，不再設確認關卡。

**Goal:** 把原錯字雙卡接上兩題雙向聽辨，從看懂差異走到收起線索自己選字。

**Architecture:** 雙卡增加kana-contrast/<reference>入口；reference為原參考字ID:原選字ID，動態kp題各以兩字之一為目標。新source kana-contrast沿用V3原首答／提示／中斷保存與schema3，嚴格兩題無repeat、兩種口袋聽辨合計最多一輪pending；不改原錯答或自評口袋。

**Tech Stack:** Node22 ESM、node:test、IndexedDB及既有K音檔；無新素材或依賴。

## 設計與邊界

比較再加一組提示、另開遊戲、把雙卡接上真實兩題聽辨，選第三項。只由可用的原錯答雙卡提供入口，先看過對照，再收起做兩選一；沒有新增主選單。入口頁不預覽字形／讀音／解說，兩題先問原選字、再問原參考字，選項仍由既有V3呈現穩定洗牌。每個字各聽一次，原輪與這輪首答分開保存。兩選一屬當天加練，不當成跨日掌握、手寫或真人發音評分。

content/kana-contrast.mjs提供有效同script異字異音的pair解析、kp:<target>:<other>題與嚴格reference／questionIds；同音字不做聽辨對照，沿用現有讀音正規化。題型kind=listen、correct=0、兩個options、cueItems含兩字，解說重用既有兩字訣竅。catalog以lazy resolver解析，不建立龐大靜態題庫。core/kana-contrast.mjs提供pending/start，共用pendingPocketActivity與原口袋雙向互斥；已pending則接續同UUID，不因入口換pair重建。

validateSession驗證source/reference/題序與queue剛好兩題，validateV3拒絕兩種口袋聽辨合計多pending；備份往返／合併保留首答及提示。回退舊版可能不識別新source，先匯出JSON，保留備份等新版，不清資料。新輪不依賴原session持續存在，整理舊歷史後仍能接續；返回來源是該雙字聽辨入口，再回口袋尋原結果。

V3對兩字同日／本輪曝光使用duelCueSeen判斷hinted；同音拒絕、前日與未來時間界線測試。答後／明示提示的實際解說及個人線索沿用可見文字曝光，固定字卡ID再同步七日未答題、默寫草稿及cache；隱藏解說不預記。新輪只有兩題，無當天repeat。原雙卡回顧在此source或口袋聽辨pending時遮蔽，防預覽原答案；其他練習頁的實際提示仍會被記錄。

UI沿用淺底卡、明確返回與不含答案的麵包屑；新控制器防連按／過期reference／延遲離頁與保存失敗。失敗保留可匯出的待存快照，不宣告已保存或跳入未存輪次。

## Task 1：題目與保存核心

Files：app/content/kana-contrast.mjs、app/core/kana-contrast.mjs、app/content/catalog.mjs、app/core/v3-state.mjs、app/core/v3-learning.mjs；tests/kana-contrast.test.mjs。

- [x] 先紅：有效／同字／同音／異script／未知拒絕、原pair兩方向與原音檔、strict題序／queue／單pending、備份合併、中斷與新舊首答、兩字曝光時間邊界、不改口袋。
- [x] 實作最小content/core/validator與lazy resolver，相關測試綠；提交。

## Task 2：入口與V3整合

Files：app/ui/kana-contrast.mjs、app/kana-contrast.mjs、app/main.mjs、app/ui/kana-pocket-review.mjs、app/kana-pocket-review.mjs、app/ui/v3.mjs、app/v3.mjs、app/ui/navigation.mjs；tests/kana-contrast-ui.test.mjs、tests/kana-contrast-controller.test.mjs。

- [x] 先紅：雙卡入口、無預覽、兩音選項／提示／原結果返回、pending回顧遮蔽、刷新／連按／過期／延遲／失敗、七日／默寫cache與原首答保留。
- [x] 最小整合，版本0.19.0；完整npm test→build→check及audit；README／規格／課綱／素材／驗收；提交。

## Task 3：驗收與發布

- [x] 隔離真實瀏覽器原錯答→雙卡→兩題→刷新／暫停接續→結果，原首答與自評不變；320/390px、44px、焦點與console。
- [x] requesting-code-review獨立審查，必要修補及重驗；本機shell SHA/MIME/SW與既有音檔HTTP通過。
- [x] PR必要檢查成功、同head合併、Pages成功；正式HTTP／隔離瀏覽器／截圖，補發布文件push與remote同步；清理QA及server。證據見[第十五批驗收](../kana-fifteenth-validation.md)。

沿用208卡、508筆順、10947音檔索引與K包668檔，既有試用訣竅／合成音仍待獨立教師審校。實機依先前決定略過；個人線索／答案與QA不提交公開Git。
