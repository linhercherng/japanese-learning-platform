# 每日推薦整合提示歷史 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 五十音、生活與 N5～N2 的每日推薦採用相同的答前提示、答後回饋與跨日證據，只安排少量原題，保留全部原資料。

**Architecture:** 把既有 unified-review 的唯讀記憶分析抽成 memory-evidence，週報與每日推薦共用。新增 daily-memory 唯讀挑題及 today-review 頁，按實際最後曝光日安排隔天／七日，弱點優先；明確按開始才建立既有 source/reference 的 V3 原題輪。沿用 schema3、原題、首答、提示側錄、保存交易與備份。

**Tech Stack:** Node 22 ES modules、原生 HTML/CSS、IndexedDB、GitHub Pages。

## 選擇與驗收規則

- 延續原優先序：未完成原活動 → 今日完成可休息 → 七日 → 隔天 → 弱點 → 新內容。
- 每輪最多三題；5 分鐘只取一題。五十音同字不重複，生活與檢定每課一題。
- 首日需要提示、錯答、舊階段不明優先於已有可靠跨日證據。每日首答仍代表當日表現，同日訂正不抹掉弱點。
- 原答案後的 feedback 不倒灌為答前提示，但它與 reference 都重新起算下次間隔。同日剛看線索的題不進自動隔天／七日隊列；仍可自行從原課加練。
- 單次或需幫忙隔1天、已有跨日證據隔3天、七日證據隔7天；皆從最後實際曝光起算台北日期；未來、同時碰撞、手寫自評及非原題保持原證據邊界。只有參考而未作答不會創造題目。
- 首頁說明原因、提示階段及待確認日期；不揭示題幹／答案／個人草稿。時間線與弱點入口能追溯原因。
- 開始前與交易內重算；新出現的原輪優先，空隊列或今日已完成不另建輪；延遲保存離頁不搶路由。錯誤保留原資料、備份及重試。

## Tasks

- [x] 1. RED：tests/daily-memory.test.mjs 覆蓋六區提示前後、間隔與每日首答、排序、日期、唯讀及原輪保護。抽出 app/core/memory-evidence.mjs；新增 app/core/daily-memory.mjs；舊週報回歸綠燈後提交。
- [x] 2. RED：每日推薦／畫面與控制器測試。整合 app/core/unified-learning.mjs、app/ui/unified-learning.mjs、app/v3.mjs、app/ui/navigation.mjs；加入 today-review 確認頁與交易內重算。驗證延遲／失敗／重複點擊／午夜／舊原輪／備份不變，提交。
- [x] 3. 獨立程式審查，修正重要問題並加回歸。更新規格／課綱／畫面／路線／來源與版本。完整 npm test、build、check、audit。
- [x] 4. 本機 HTTP 與瀏覽器 QA 庫測試：舊備份唯讀比對、六區推薦及原輪、320/390/768/1024/1440 無溢出、觸控尺寸／Tab／大字／console，完成截圖。
- [x] 5. PR 同 head CI → 合併 → Pages；正式 HTTP 檔案與 SW 指紋、正常與 QA 資料升級前後比較、實際首頁／新路徑確認；留下發布文件與連結。

不新增教材／依賴／持久排程，不清除 DB／cache／SW，不把桌面尺寸測試說成實機或學習成效驗證。
