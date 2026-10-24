# 每日成果與下一週重點驗收（v0.43.0）

2026-10-24。實作、審查、本機與正式發布驗收已完成。

## 已完成的回歸範圍

新增54項測試包含六區無提示跨日失敗／答前提示／答後回饋／同日訂正、跨週完成與未來時間、唯一原首答歸屬、最多三項／5分鐘一項、每日同類挑題優先、預覽不露答案、到期／等待與時間線連結，以及控制器保存失敗、午夜、原輪優先與路由切換。測試先RED後GREEN；無自然詞18卡另外遍歷原language工具與操作指引。

兩次獨立唯讀審查修正跨週未來完成漏列、詞音能力無到期入口、當日弱點等待邊界與無自然詞卡入口。舊記憶證據144案例差異比對保持相同；完整檢查、本機與正式端結果見下列紀錄。

原教材、schema3與資料保留；不把桌面瀏覽器尺寸測試宣稱為iPhone／Android實機測試。

## 本機驗收

- npm test：1,095／1,095，零失敗；新增54項。npm run build、npm run check與npm audit --audit-level=high通過，0 vulnerabilities。208字卡、508筆順、10,947音訊內容檢查通過。
- 185份shell檔案逐一HTTP200／SHA-256／JS MIME，以及離線fingerprint與六區10份原音檔抽樣全部通過，零重試。fingerprint：8e0efe65c24761a7a06f51530c24a18e11a5baad4bcd80e1dcb6e5bf7fec1fba。
- IAB以隔離QA庫匯入舊備份；查看首頁／週報／重點後完整state與預期merge結果深比較相同：45筆首答、28原輪、10草稿，原未完成ID保持。
- 人工建立且經原API保存的10首答、2完成原輪、1草稿QA案例，週報正確顯示學習1、複習1、提示1、跨日想起1／未想起1。五寬三頁查看後完整state不變。
- 由週重點開始N2語彙兩題原check，答第一題後重整仍同輪與首答；完成第二題回週報：複習變2輪、跨日想起變3，N2語彙不再佔前三待鞏固重點，完成頁與重點頁提示休息。原10首答、2輪及草稿逐一保持，只增加2首答及1輪。
- 320／375／390／768／1440共15頁（週報、能力重點、首頁）無橫向溢出，單一h1，主要開始／操作元件至少44px高。320大字19px不溢出，5分鐘只顯示1項；Tab焦點有可見外框，console warn／error空。

上述為桌面IAB與隔離合成案例，不代表真人長期記憶效果或手機實機驗收。正式Pages與自然SW升級結果見下節。

## GitHub與正式發布

- [PR #56](https://github.com/linhercherng/japanese-learning-platform/pull/56)已合併。測試head cc3316c93921e10b7be20635dfe1a7185d3ea4c7 的[PR CI](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40054197540)成功。
- 合併721f1fc3e3410cdd68d13a0e76f5eec2dbce3a10的[Pages workflow](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40054314626) build／deploy均成功，2026-10-24 10:30台北完成部署；合併樹與測試head相同。
- [正式每週回顧](https://linhercherng.github.io/japanese-learning-platform/#weekly)的185份shell逐一200／SHA-256／JS MIME、SW fingerprint與10份六區原音訊抽樣全部通過，1筆重試後成功；採PowerShell預設TLS驗證。fingerprint與本機一致。
- 舊分頁先維持完整舊版；讓下載與正常waiting生命週期完成、離開再回正式網址後，已顯示新成果與下一週重點，無清除SW、快取、IndexedDB或原進度。
- 升級後唯讀查看正式首頁／週報／重點，再匯出與升級前parseBackup完整深比較：正常庫1首答／1原輪／0草稿及QA庫45首答／28原輪／10草稿完全相同（含revision、原未完成與各提示事件）。未向正式庫寫入測試答案。
- 正式站320／375／390／768／1440共15頁無橫向溢出、每頁單一h1，主要操作44px以上，console warn／error空；保留正式週報分頁、恢復viewport，本輪18131／18132／18133測試伺服器已停止，0監聽。
- 補驗無自然詞キョ：照重點指引切片假名／拗音／きゃ・きゅ・きょ／詞中補字，可開始原拼字題；資料在另一隔離本機QA庫。

最後補交的文件紀錄不更動已驗證的app或部署素材。本次不新增日文教材，也不宣稱真人審校、手機實機或長期成效已通過。
