# 五十音記憶第九批 Implementation Plan（v0.13.0）

> 執行流程：superpowers:executing-plans。使用者已授權規劃後直接實作、驗收及公開發布，延續前八批介面。

**Goal:** 用行與母音段的位置串起清音，再用離序少量聽辨確認，不只順背。

**Architecture:** 新增單一 `kana-row/<row id>` 入口，20行、90個既有清音（撥音另外連結）。五欄a／i／u／e／o保留空格；逐格提示預設隱藏，僅曝光實際選中的既有字／詞／訣竅。每行分前3字與剩餘2字（稀疏行只有2／3字一輪），共36組固定離序題，沿用既有 `kc:check:<item>:listen` canonical問題及schema3。新來源kana-row有嚴格reference／queue，不新增能力或自評分數。

**Tech Stack:** Node22原生ES modules、node:test、現有IndexedDB／PWA與合成音庫，不增加依賴或素材。

## 取捨與內容

在「增加隨機題」「再加圖像」與「行段導航」三種方案中，選行段導航補字表關係。只增加今天怎麼練的一個入口；預設平假名第2行。選單只顯示字形類別、行號、字數，不預覽字或讀音。五個可用格至少44px，空格是非互動佔位，不把不存在的字補進表。切換只記提示，不記答對；沒有計時或連勝。

逐格提示一次只顯示一字，帶該字原有讀音、詞例、記憶線索與發音。羅馬字是輔助標記，不據一般子音拼接猜讀音；し／ち／つ／ふ等沿用既有實際讀音。を／ヲ仍在o段，ん／ン由獨立字卡練習，不放進母音欄。

離序小測每輪2／3字，三字順序為中、前、後；兩字為後、前。沿用四選項聽辨，正常／慢速各一鈕。不因看提示而新增session.hints提前顯示解說：作答時依目標字同日／輪內曝光標hinted，原首答不改。pending行先接續，不換題，對照隱藏。返回路徑與麵包屑回原行；刷新只清本頁對照，不清題目／答案。

行段參照：[國際交流基金《いろどり》假名表](https://www.irodori.jpf.go.jp/assets/data/Kana_all.pdf)、[文部科學省假名表](https://tsunagarujp.mext.go.jp/assets/download/hiragana_katakana_ver202210.pdf)，2026-10-22查核。僅核對排列，不重製其圖片／錄音；所有解說為既有試用教材或原創編排，尚待教師審校。不是手寫、真人發音或JLPT評分。

## Task 1：固定行段與小輪核心

Files：新增 `app/content/kana-row.mjs`、`app/core/kana-row.mjs`、`tests/kana-row.test.mjs`；修改 `app/core/v3-state.mjs`、`app/core/v3-learning.mjs`。

- [x] 先寫失敗測試：20行90字／36組，空格與o段、canonical題／音庫、2／3題非順序、嚴格reference／queue、未完先接續、首答／提示／備份合併／未來及跨日曝光。
- [x] 實作 `rowById`／`rowRounds`／`validRowReference`／`rowVisibleItems`、pendingRow／startRow，註冊來源並使用目標字曝光。先紅後綠，新舊test、build再check，提交。

## Task 2：行段介面與整合

Files：新增 `app/ui/kana-row.mjs`、`app/kana-row.mjs`、UI／controller測試；修改main、navigation、path、v3返回路徑與CSS。

- [x] 先失敗測試：隱藏字音與空格不可按、20行選單／換平片／下一行、只展一字、pending收起、來源返回、提示警語、過期動作、延遲保存離頁、保存失敗匯出、曝光同步七日與默寫草稿快取。
- [x] 實作逐格選擇／收起／離序小輪、既有UI樣式及44px五欄；test／build／check通過提交。

## Task 3：瀏覽器、審查與發布

- [x] 本機隔離QA實際操作20行切換、空格／平片／2與3題／正錯與提示／音鈕／刷新續作；320／390px檢查、鍵盤焦點、console與舊入口回歸。實機依先前決定略過。
- [x] 獨立審查、完整test／build／check／audit；逐檔shell hash／MIME／SW及音檔HTTP；同步README、規格、課綱、素材與驗收文件。
- [ ] PR、CI、相同head合併、Pages成功、正式HTTPS與隔離瀏覽器實測／截圖，補發布證據；remote一致、停server、關QA並還原視窗。

QA與日誌只存ignored work。schema3與舊ID不遷移，保留IndexedDB；回退前匯出JSON，舊版可能不識別kana-row來源，保留備份等新版，不能清個人資料。
