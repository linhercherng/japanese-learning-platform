# 首頁統一每日學習與複習驗收（v0.38.0）

2026-10-23，Asia/Taipei。[完整規劃](unified-daily-route.md)、[執行計畫](plans/2026-10-23-unified-daily-route.md)。

## 範圍

首頁以唯讀計算整合K／L／N5／N4／N3／N2六區，沿既有kanaNextStep／lifeNextStep／jlptNextStep及日期／提示規則。不建立總排程、新題、作答、曝光或熟練度；沿schema3、goal與dailyMinutes，原四步安排與工具入口保留。全域接續原輪與今日收尾優先，再跨區七日／隔天／弱點／口袋／選定目標新內容。待完成原輪即使裝置時間倒退仍保護，不改原題。

V1收尾僅在目前分頁仍有完整原輪metadata時，逐題核實已保存的event ID／item／dimension／correct／hinted及最後台北日期；不能用index或不完整紀錄推論。刷新遺失V1分頁metadata後，已提交首答仍在，但不憑零散作答假定整輪完成。V2歷史原輪由既有practice-hub找回，不導向沒有原結果的到期列表。

## 測試與審查

核心18項RED18fail→18pass，UI/controller13項初次11fail、2項既有行為通過；實作後含舊V3 UI／指南46項通過。UI安全測試發現共用primary不編碼route，新元件先編碼再交給primary，沒有擴大修改舊工具。

獨立唯讀審查發現兩個P2：createPlan只比hash，離頁再回同首頁仍會被舊操作導航；完整V1原輪未列全站收尾。另指出V2歷史結果連結錯頁。補四項RED→GREEN：route epoch＋dispose保持已保存安排但不導航；V1匹配完整保存紀錄才收尾；歷史V2進practice-hub。最終新增35項、全站 **794／794通過**。build→check與audit 0弱點，208字卡／508筆順／10,947音檔索引／176生活字串檢查通過。

核心獨立另跑72個六目標／六來源截止與備份情境；修正複核35項及10個跨台北午夜、漏存／欄位不符／昨天／未來答案情境通過，原資料與備份不變。UI獨立複核controller7項、離頁返相同hash與dispose兩種延遲情境不跳路由；全程留首頁仍正常保存並前往原安排。兩審查最終無P1/P2阻擋，未改檔、操作瀏覽器或提交。

## 本機瀏覽器

18124/?qa=1沿原庫，未清DB/cache/SW。原今日N4完成輪使首頁顯「今天已完成一小輪，可以先休息」，六區如實顯K 0字／生活8原題／N5 3／N4 1／N3 0／N2 2。私人線索／作文不預覽。六目標依序選擇仍保持今日可收尾；選N2、5分鐘後刷新值保存，不自動升級或建安排。

明確自選N2-01漢字一題原輪465a6d1b-e042-45d8-8999-f5c03d335a51；回首頁與刷新後推薦同UUID，沒有新建按鈕。改選生活日語、更新推薦，仍接原輪；答「ふたん」完成後從結果回首頁，收尾原結果轉為該N2輪，1正確／0提示。

UI匯出備份比對：原33筆attempts、22輪sessions、13份drafts、生活線索／作品／模擬逐筆相同；只新增明確操作的一輪與一筆作答。兩次更新首頁推薦後再次匯出，parse後整份state深比對完全相同。QA目標／時間／字級測試後恢復K／15分鐘／15px；沒有對正常庫寫測試資料。

首頁320／390／768／1024／1440收合與全展開共10組無橫溢，展開工具控制最小44px；320px大字19px亦無溢出，主畫面只有一張未藏在details內的hero。Tab由目標至5分鐘按鈕有solid outline，焦點在可見範圍。390px主卡按鈕底部750px、底部導覽自769px起，不遮住主要操作。截圖work/unified-local-home-390.png，ignored排版證據work/unified-local-layout.json。

## 限制

本次整合既有教材與程式路線；沒有新增日文、音檔、依賴或後端。教師審校、真人審音、iPhone／Android實機OS鍵盤／手勢與真人長期學習成效仍待外部證據。桌面手機尺寸及合成日期測試不代替實機或長期成效，不宣稱官方成績或合格率。回退前匯出JSON，不刪除資料。

最終172份shell fingerprint `cc8dfd1c5e910d7a2dc07b55e118ef5a08066b9a2e1e6a8083addaf55bcc5e45`。UTC11:25:27本機172 shell逐檔SHA256／JS MIME／SW與10原音抽樣HTTP通過，1次暫時重試，PowerShell預設TLS；ignored證據work/unified-local-http.json。10樣本包含K／L及N5～N2原詞與聽解；全量音訊索引檢查不是全量HTTP或真人審音。
