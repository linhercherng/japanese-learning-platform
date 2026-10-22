# 五十音記憶第七批 Implementation Plan（v0.11.0）

> 執行流程：superpowers:executing-plans，依下列小步驟驗證；使用者已授權規劃後直接實作與發布。

**Goal:** 把既有208張平／片假名字卡連成104對，以每次三題、可選對照及反向回想練字形連結。

**Architecture:** 新增單一 `kana-bridge/<source item>` 入口；內容模組定義104對、208個雙向穩定題與固定三題reference，沿用V3首答、提示、續作、備份及曝光。schema3不遷移、不清資料；只記目標字的recognition，不推論聽辨、書寫或長期熟練。

**Tech Stack:** 原生ES modules、Node22 node:test、IndexedDB、既有PWA／音庫／CSS，沒有新依賴或素材。

## 設計選擇

採平片連結，優先於更多圖像或擴充相似字題。只增加今天怎麼練的一個入口，不增加底部導覽。八種方向與分類（看平／片 × 基本／濁音／半濁音／拗音）使用既有正規化分類，從起始字取同類最多三張，尾端循環。

1. 平片互換三題：來源字形作題幹，從另一套三個不同讀音的字形中選同一假名的對應字；保留ぢ／じ、づ／ず的字形對應，不把同讀音當成唯一映射依據。ID使用 `kx:`，避免既有拼詞 `kb:`。reference為來源起始字，題序嚴格固定；未完成先接續。
2. 同音雙形對照：預設收起，主動展開才顯示三對字、既有讀音／訣竅和每對一個有效音鈕。可收起；曝光依實際可見字形解析，同步七日未答題與默寫草稿。待續輪次返回時不顯示對照。這是提示，不產生attempt。
3. 反向再想：同一組一鍵換來源字形，方向另存首答；同日或輪內看到任一配對字形的提示，作答標為hinted。完成後經來源頁提供反向／下一組／隔天檢查；不自動開新輪，不把當日換方向當跨日記住。

## Task 1：內容與核心契約

Files：新增 `app/content/kana-bridge.mjs`、`app/core/kana-bridge.mjs`、`tests/kana-bridge.test.mjs`；整合catalog、v3-state、v3-learning、kana-recall。

- [x] 先寫失敗測試：104對／208題唯一、雙向對應／同音異字／半濁音、每題三選項且僅一正解、既有音檔、固定三題、未知／混組reference拒絕、首答／續作／備份、同日提示與未來時間邊界。
- [x] `node --test tests/kana-bridge.test.mjs` 觀察失敗，再實作最小模組與整合；新舊測試通過後 build／check 並提交。

## Task 2：介面、控制器與曝光

Files：新增 `app/ui/kana-bridge.mjs`、`app/kana-bridge.mjs`、`tests/kana-bridge-ui.test.mjs`、`tests/kana-bridge-controller.test.mjs`；整合main、navigation、path及v3結果返回。

- [x] 先紅後綠：隱藏答案、八分類／反向／下一組、原輪續作、不洩漏對照、過期動作拒絕、提示曝光／草稿快取、保存失敗可匯出；不新增自評分數。通過test／build／check後提交。

## Task 3：審查、驗收與發布

- [x] 真實瀏覽器隔離QA：三題含正答／提示、刷新與返回續作、展開／收起、反向、八分類、320／390px尺寸與44px操作目標、console、既有入口回歸；實機沿用使用者略過決定。
- [x] 獨立審查並修正重要問題；完整npm test、build、check、audit。同步README、規格、課綱、素材與驗收文件；不得提交QA或個人資料。
- [x] PR／CI／相同head合併／Pages成功；正式HTTPS逐檔shell SHA-256、JS MIME、SW fingerprint與音檔抽查，正式瀏覽器操作與截圖。補發布紀錄、推送並確認remote一致，清理測試分頁與server。

回退前匯出JSON；舊版可能不識別kana-bridge來源，保留備份等待新版，不清IndexedDB。教材／合成語音沿用原創試用與待教師審校邊界。
