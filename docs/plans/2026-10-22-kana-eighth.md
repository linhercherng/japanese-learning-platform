# 五十音記憶第八批 Implementation Plan（v0.12.0）

> 執行流程：superpowers:executing-plans；使用者已授權規劃後直接實作、測試、GitHub與Pages發布。

**Goal:** 用既有清音／濁音／半濁音連成小家族，透過標記切換與兩至三題聽辨，減少逐字死背。

**Architecture:** 單一 `kana-family/<base item>` 入口，58組含132字，含平片基本字及已有成組拗音。以Unicode正規分解找同原字，只收教材已存在的2／3字家族，不自造缺少的字。新題目 `kg:<base>:<target>`、來源kana-family，固定每家族一題一字，沿用schema3／V3保存、備份與提示。

**Tech Stack:** Node22原生ES modules、node:test、IndexedDB與既有PWA／K音包，不增依賴或外部素材。

## 設計與取捨

本批選擇字形規則與家族聽辨，優先於再增加聯想圖或一般隨機題。只增加今天怎麼練的一個入口。家族選單使用平／片、基本／拗音與組號，不預覽答案或羅馬字；預設為は／ば／ぱ家族。可換下一家族與同家族另一套字形。

1. 家族記憶卡：對照預設收起，展開才看當前一字的讀音、詞例、既有記憶訣竅與有效音鈕。原字／兩點／小圈依家族實際成員顯示，不提供不存在的組合。
2. 標記切換：按鈕切換當前字並記實際可見提示，開關及所選字暫存，刷新收起；不新增作答或自評分數。曝光含可見詞／解說裡的假名，同步七日未答題、默寫草稿及快取。
3. 聽音分家族：132個穩定聽辨題，每家族2／3題、每題選項為該家族成員，正常／慢速音沿用既有完整字音；無提示頁不預覽讀音或對照。原輪未完先接續。同日／輪內任一家族提示使新作答hinted，首答不回寫；答後解說展示全家族，所有成員都更新曝光。

能力只記目標字listening；小選項加練正確率不等於跨日熟練、手寫、發音評分或JLPT成績。聲音與教材仍為原創試用、合成音待獨立教師審校。

## Task 1：內容、核心與多字曝光

Files：新增 `app/content/kana-family.mjs`、`app/core/kana-family.mjs`、`tests/kana-family.test.mjs`；整合catalog、v3-state／learning、kana-recall多字曝光與V3曝光。

- [x] 先寫失敗測試：58組132字／題、原字兩點小圈分類、同讀音不同字不混家族、穩定ID／選項／音包、嚴格reference／queue、固定續作／首答／備份、過去／未來提示、三字曝光對七日／整理相容。
- [x] `node --test tests/kana-family.test.mjs`先失敗，再實作、跑新舊測試；build後check，通過後提交。

## Task 2：可操作介面

Files：新增 `app/ui/kana-family.mjs`、`app/kana-family.mjs`、UI／controller測試；整合main、navigation、path與v3來源返回。

- [x] 先紅後綠：隱藏答案、僅顯示實際標記切換、58組分類／下一組／換字形、續作不洩漏提示、刷新、過期動作與延遲保存離頁、曝光／草稿快取、保存失敗保留匯出。完成test／build／check後提交。

## Task 3：驗收與發布

- [x] 真實瀏覽器隔離QA：切標記／音鈕／鍵盤、2與3題、首答／提示／刷新／續作、平片基本與拗音、320／390px／44px／console及既有入口回歸。實機依使用者先前決定略過。
- [x] 獨立審查並修正；完整test／build／check／audit，106份以上shell HTTP逐檔SHA／MIME／SW與音檔抽查。同步README、規格、課綱、素材及驗收。
- [ ] PR／CI／相同head合併／Pages成功；正式HTTPS與瀏覽器驗證及畫面、發布紀錄、remote一致、清理QA分頁與server。

回退前匯出JSON，舊版可能不識別新來源，保留備份等新版，不清IndexedDB。所有QA紀錄、日誌與截圖在ignored work，不提交個人資料。
