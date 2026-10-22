# 五十音記憶第九批驗收（v0.13.0）

2026-10-22；基底596e6cd。[規劃與執行清單](plans/2026-10-22-kana-ninth.md)。

## 交付

單一 `#kana-row/<row id>` 行段記憶導航：20行、90個既有清音，依a／i／u／e／o五欄記位置。や／わ行的空格非互動佔位，を／ヲ在o段，ん／ン另接原字卡；濁音與拗音另接第八批聲音家族。一次一行、按一格才展示該字／讀音／詞例／訣竅與音鈕，其他格保持問號。收起與切格不記答對數。

36組固定離序小輪沿用既有 `kc:check:<item>:listen` canonical題（不增加題庫數），每輪2／3字，正常／慢速各一鈕。三字順序中／前／後，兩字後／前；不是每次隨機換題。有同行未完輪即接續原輪，預覽收起。schema3、新kana-row來源／嚴格reference與題序；只記目標字listening，原首答、提示、訂正及合併備份保留。

## 測試與審查

新增13項測試，先失敗再實作；紅／綠與完整檢查日誌在ignored `work/ninth-*`。

- 20行90字、36組canonical題／音庫與K包、空格與o段、非順背順序、嚴格reference／queue、pending同行不換半輪。
- 同日／前日／未來／跨日輪內目標字曝光、首答不回寫、備份合併與固定續作。
- 預覽隱藏與單格展開、來源麵包屑／返回、過期行／格／round拒絕、延遲保存離頁不拉回、失敗仍可匯出、七日未答題與默寫草稿／快取同步。
- npm test 319/319；npm run build、npm run check成功；npm audit --audit-level=high：0 vulnerabilities。
- 核心獨立審查64/64相關測試通過；UI獨立審查6/6及另行render146狀態（20行隱藏、90格、36輪返回）通過，均未發現可重現P1／P2。審查者未改檔或操作瀏覽器。

## 本機真實瀏覽器

內建瀏覽器 `127.0.0.1:18115/?qa=1`隔離庫。未注入資料庫／修改時鐘，未使用個人進度。

- 從今天怎麼練入行段，平假名第2行前三字依き／か／く離序。首題正確後刷新仍保留，2/3暫停隱藏格子與音鈕，續作同UUID；第二題錯選れ，第三題明按提示再正答。完成列1/3無提示、1題提示，原錯答保留。
- 空白鍵逐格展開與播放，焦點保留；刷新收起提示且仍有5個格子。20行實際選單切換，所選行與標題均匹配。
- 320px每行隱藏／a段展開，以及390px平片的第4、6、8、10行所有可用格，另含兩題結果，共81個量測狀態；無橫向溢出，main button／select／primary至少44px。320px五格實測約49.8px寬；390px約61.4px寬。や行三格與兩空位、わ行兩格與三空位，空格不能點。
- 片假名第10行先看ヲ及ワ，再做ヲ／ワ兩題；提示警語顯示，結果0/2無提示、2題提示，沒有第三題。同一行換平假名h-10、下一行h-1、撥音h-3093連結正確。
- 正常／慢速音及合成語音播放狀態、既有聲音家族與平片互換入口正常，console warn／error空。截圖與版面JSON在ignored `work/ninth-qa`。QA頁已關閉、尺寸已還原。

## HTTP驗證

114份shell逐檔SHA-256、JS MIME與SW fingerprint一致；128次音檔HTTP抽查通過，包含平片第4、6、8、10行全部字音及既有家族／平片／節奏／支援課程樣本。

fingerprint `cfa61de7a0240f009fe33085630f92eae66ce92f6d44fc84ccccb2a668a40187`；2026-10-22 13:00:56 UTC（台北21:00），ignored `work/ninth-local-http.json`。

## 發布

- [PR #25](https://github.com/linhercherng/japanese-learning-platform/pull/25)，head `b2bd13f330444956e3364d149a61ba3af3fb6c1f`；[CI 39783500038](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39783500038)成功，以相同head合併。
- merge `32a4501c04fc621a9600fb18c0bbddee34fb4afe`；[Pages 39783685190](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39783685190)建置與部署成功，部署完成2026-10-22 13:06:30 UTC（台北21:06）。
- [正式入口](https://linhercherng.github.io/japanese-learning-platform/#kana-row)。HTTPS 114份shell hash／JS MIME／SW與本機fingerprint一致，128次音檔抽查通過，2026-10-22 13:08:12 UTC（台北21:08），ignored `work/ninth-public-http.json`。
- 舊離線快取下載後離頁再回，正式分頁已見行段入口，未清快取或IndexedDB。正常站只讀；隔離QA實際點進入口，在390px選第8行u段顯示ゆ／yu、兩個空位，空白鍵選格與播放可操作；正式截圖在ignored `work/ninth-qa/public-390-row.jpg`。
- 第10行先看o段を，完成を／わ兩題：首題提示後答對並刷新保留、次題無提示答對，結果1/2無提示、1題提示；返回原行並換k-10正確。正常／慢速音均確認合成音播放狀態。快速切頁時曾出現播放重試提示，在練習頁重新播放成功；console warn／error空。390px無橫溢。
- QA頁關閉、臨時尺寸還原、本機18115server已停止，保留正常正式入口。此發布補記只改文件，不改已部署網站檔案。

## 內容與邊界

沿用208卡、508筆順、10947音檔索引與K包668檔，沒有新增音檔、外部圖片或依賴。行段只對應本批90字，不是通用發音推導器；羅馬字為輔助標記，實際音以既有字音為準。排列參考見規劃所附官方假名表，未重製其素材；新編排為原創試用，既有訣竅與合成音尚待獨立教師審校。

站內提示只反映已記錄可見內容，不代表能偵測紙本或站外練習。實體iPhone／Android、系統日文鍵盤與真人發音評分依先前範圍未驗證。回退前匯出JSON；舊版可能不識別kana-row來源，保留備份等新版，不清IndexedDB。
