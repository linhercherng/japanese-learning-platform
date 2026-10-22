# 五十音記憶第十二批 Implementation Plan（v0.16.0）

> 執行流程：superpowers:executing-plans。使用者已授權規劃、實作、測試與GitHub／Pages發布，沿用既有畫面直接執行。

**Goal:** 在不熟字口袋加入最多三題的聽音選字，讓自評清單接上可保存的客觀首答，仍保持容易學、容易記。

**Architecture:** 不新增導覽或題庫，口袋選較早留下的最多三張卡，輪轉一格後使用既有kc:check:<item>:listen題。source=kana-pocket-listen、reference為原字卡ID依題序以冒號連接，嚴格驗證1～3題、唯一題序及不追加重複。全站此來源最多一個pending，清單後來保留／移出不重排原輪；沿用schema3的V3 session保存、首答／提示／結果與備份。

**Tech Stack:** Node22 ES modules、node:test、既有IndexedDB、合成音及PWA，無新增依賴或素材。

## 設計與範圍

在新增計時遊戲、加更多新字、深化不熟字口袋中選第三項。口袋已有自評，現在補聲音→字形的短檢查，沿用四選一既有聽辨題；不把自評改算答對，不做自動移出或發音評分。每輪最多三題，只有一字就一題，空清單引導翻卡，不硬補新字。先前標記時間晚於本次時間的字不入選，題序輪轉避免照原翻卡順序提示；仍不宣稱隨機或跨日掌握。

口袋選單／自評完成後可直接「收起字卡，聽音回想」；自評輪進行時維持原操作，完成後再選。開始後若返回口袋，先接續保存的聽辨輪，收起原自評字形、讀音、音鈕與清單，不讓清單變更重排。同日或本輪曾見目標字提示，首答列hinted但不提前展開解說；未看過才可列無提示。答後／明示提示的實際字卡曝光沿用V3共用機制同步七日未答題、默寫草稿及快取。既有每日／到期題庫不增加，不引入新題ID。

結果列原首答、使用提示、錯題留待複習，返回口袋；另有最近結果連結。聽辨與書寫／真人發音分開，答對也不自動移出口袋，隔天檢查仍另行。待存失敗不能跳頁，資料可匯出；延遲保存換頁不拉回、快速連按／過期DOM忽略。備份保存原輪並拒絕不同題序、非法字、混合模式、追加題與多個pending。

## Task 1：核心及保存

Files：新增app/content/kana-pocket-listen.mjs；修改app/core/kana-pocket.mjs、app/core/v3-state.mjs、app/core/v3-learning.mjs；tests/kana-pocket-listen.test.mjs。

- [x] 先失敗：208字均能解析且K包音檔存在、空／1／2／3字選題、時間截止與固定輪轉、原輪續作且清單改動不重排、嚴格reference／queue／單pending、備份／合併、只記listening首答不改自評、同日／前日／未來／輪內提示、首答不回寫。
- [x] 最小實作；node --test tests/kana-pocket-listen.test.mjs綠；npm test；提交。

## Task 2：口袋與V3介面

Files：修改app/kana-sixth.mjs、app/ui/kana-sixth.mjs、app/ui/v3.mjs、app/ui/navigation.mjs、app/v3.mjs；新增tests/kana-pocket-listen-ui.test.mjs與tests/kana-pocket-listen-controller.test.mjs。

- [x] 先失敗：聽辨入口／自評輪進行時不插入、pending收起、最近結果／來源返回／麵包屑不洩答案、題目有正常慢速音、答前隱藏／答後曝光、七日／默寫快取、快速連按、過期／延遲離頁／保存失敗可匯出。
- [x] 實作整合，版本v0.16.0；test、build後check；更新README／規格／課綱／來源／驗收；提交。

## Task 3：真實驗收及發布

- [x] 隔離瀏覽器口袋→聽辨→首答→刷新／返回續作→結果，正／錯／明示提示、原清單不自動移出；320／390px、44px、鍵盤／正常慢速音與console；原自評／翻卡回歸。
- [x] requesting-code-review獨立核心與整合審查；npm test／build／check／audit通過；本機shell SHA／MIME／SW與音檔HTTP驗收。
- [x] PR #28／CI／相同head合併／Pages成功，正式HTTPS119份shell與128次音檔、瀏覽器驗證／截圖，發布文件與remote同步，清理QA與server；不從localhost推論部署。

延用既有208卡與試用教材、合成音，尚待教師審校；不加新外部內容。實機依使用者先前決定略過。回退前保存JSON，舊版可能不認得新source，保留備份、不清IndexedDB。前批Pages狀態本輪重新查詢已completed／success，舊文件保留原觀測時間，補記於本輪驗收。
