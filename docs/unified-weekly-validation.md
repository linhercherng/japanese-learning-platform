# 六區每週回顧與弱點驗收（v0.39.0）

2026-10-23，Asia/Taipei。[完整規劃](unified-weekly-review.md)、[執行計畫](plans/2026-10-23-unified-weekly-review.md)。

## 功能與資料界線

weekly／weaknesses沿舊路由升級，首頁增加可見入口；六區原題×能力的近七日活動與累積記憶證據分開。五種互斥狀態、原題ID／首答日／證據日、六區能力摘要、hash篩選及12項分頁、pending先接原輪。原深化概念／作品修訂／備份整理仍保留。沒有新增schema／依賴／日語教材／音檔，報表不保存任何分數／提示／作答。

跨日證據保守按每日第一筆、原題與可見參考間隔；碰撞、未來、提示、同日訂正不冒充掌握。手寫／作品／其他舊題獨立。五十音最後提示時間無完整歷史可還原時標紀錄待確認，不改舊首答補造證據。摘要只出metadata，不預覽題幹、正解、私人線索或作品文字。

## 測試與審查

核心初次20項RED失敗，修正測試fixtures（各級原題ID不同、optional提示欄位、exportedAt不屬state）後20項GREEN。UI初次9項8fail／1只讀行為已通過；導覽測試RED後修正，相關核心／UI／舊導航60項通過。

獨立唯讀核心審查找出兩項P2：答後自動回饋被當弱點，以及五十音單一最後提示時間覆蓋早先參考造成假跨日成功。新增真實recordKanaExposure→startKanaCheck→answer→feedback、生活／檢定答後回饋、比較字曝光回歸；3fail→全部通過。修正不把答後回饋抹除生活／檢定歷史證據，五十音歷史不足獨立計uncertainHistory、保守不列proof。

獨立複核33項與另編10情境全通過，包括原重現、未來hint、錯答優先、七日／隔天與備份不變。UI另跑55相關測試與獨立49筆五頁／異常篩選／受控時間／零寫入，沒有其他P1/P2。後續一項RED→GREEN讓五十音明細直接連原字kana-map/item，避免回全圖找字。

最終新增34項、全站 **828／828通過**；build→check通過，audit 0弱點。208字卡／508筆順／10,947音訊索引／176生活字串檢查通過。不是教師審校或全量真人審音。

## 本機瀏覽器與資料

18124沿原正常PWA自然更新，未清DB／cache／SW；隔離QA原資料34筆attempts／23輪sessions／13份drafts。回顧顯34原始首答、15每日原題能力首答；六區原題數K0／L8／N5 3／N4 1／N3 0／N2 3。當日N2原完成輪465a6d1b-e042-45d8-8999-f5c03d335a51仍可收尾。

生活能力展開如實分聽辨／理解／補字；全部15項跨兩頁，第二頁N2原題3筆；切N2需要複習、重開仍保留hash與breadcrumb，正確列N2-24-r1，點進原N2-24課可選讀解2題，沒有自動新開輪次或看參考。舊作品／備份工具展開存在，main只有一個h1。

UI匯出前後parseBackup整份state完全一致（work/weekly-local-before.json／after），包含所有首答／sessions／草稿與其他紀錄。其後另外以UI測19px主內容、320px兩頁不溢出、Tab到結果主按鈕有solid outline且在可見範圍；恢復原15px後再匯出，除設定操作revision+2，其餘state完全一致（work/weekly-local-restored.json）。沒有對正常庫寫測試資料。

回顧／弱點320／390／768／1024／1440共10組，加六區摘要全展開5組，皆無橫溢；新控制至少44px，五寬main h1皆1。console warn／error空，排版證據work/weekly-local-layout.json。

最終174 shell fingerprint `9d550c4fcb77cf13afcf976f5dbabf691b00287397276e89ebb09988ae34ddf0`；本機174逐檔SHA256／JS MIME／SW與10原音HTTP抽樣以PowerShell預設TLS通過，見ignored work/weekly-local-http.json。音檔未改，抽樣涵蓋K／L及四級原詞與聽解，不是全量音訊HTTP。

## 待完成發布證據

正式PR CI、merge／Pages與正式URL驗證完成後補記。教師／實機OS鍵盤及長期學習成效仍需獨立證據；本次只驗證程式邏輯、桌面瀏覽器與指定尺寸。回退前匯出備份，保留新舊資料。
