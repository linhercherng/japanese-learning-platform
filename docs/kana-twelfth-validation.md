# 五十音記憶第十二批驗收（v0.16.0）

日期：2026-10-22。[規劃與邊界](plans/2026-10-22-kana-twelfth.md)。

## 交付

不熟字口袋內加入聽音回想，從較早留下的最多三個有效字卡，輪轉一格後沿用既有kc聽辨題。空清單不補新題、只有一字就一題；自評展示輪完成後或選單可開始聽辨，已有聽辨輪時先接續並收起字卡。正常／慢速音、四選一首答、提示與結果沿用V3；答對不自動移出原清單。

source=kana-pocket-listen，reference按原題序串接字卡ID，嚴格驗證原題序、1～3題queue與全站單一pending。schema3與既有題庫／ID不遷移；刷新或清單後來變動不重排原輪。備份／合併保留首答，拒絕不一致輪次；保存失敗可匯出，延遲離頁不拉回。

## 測試與審查

新增16項先紅後綠測試。涵蓋208字canonical四選一與K包音檔、空／1／2／3題、舊時間／未來標記截止、固定輪轉、單pending、清單更動／備份／合併、嚴格reference／queue、first answer不回寫、只記listening、不改自評、同日／輪內提示及前日／未來邊界。UI／真控制器覆蓋pending收起、來源返回、最近結果、明示提示、連按、過期／延遲離頁與失敗保存。

核心獨立審查38項相關測試及雙向備份合併，未見P1／P2。UI審查發現P2：答「あ」後解說含「あめ」，原共用機制只曝光「あ」，可能讓同輪「め」列無提示且漏同步默寫快取。新增「あ→め」與個人線索「ぬ」兩項真控制器回歸，先失敗後修正；僅此來源afterRender解析實際已顯示解說與個人線索，先固定字卡ID再同步曝光／七日未答題／默寫草稿及快取。明示提示只存flag，真正render才記詞例曝光，隱藏內容不預記。

UI獨立複核修補與原口袋／翻卡／V3／V2節奏共38項，確認P2解決，無剩餘P1／P2。審查均唯讀，未操作瀏覽器或改檔。

最終完整npm test **365/365**；npm run build、npm run check成功；npm audit --audit-level=high **0 vulnerabilities**。208卡、508筆順、10947音檔索引與K包668檔維持原數量，沒有新依賴。

## 本機真實瀏覽器

內建瀏覽器`127.0.0.1:18118/?qa=1`獨立QA庫，未注入資料庫、修改時鐘或使用個人進度。

- 由翻卡留下あ／い／キャ共3字，口袋直接聽辨依い／キャ／あ順序固定。正常與慢速播放均顯示成功，空白鍵可開始；每題僅兩個音鈕，解說答前收起。同日剛看過字卡，警語與hinted符合實際，不宣稱無提示。
- 第一題い答對後刷新，原URL／首答與disabled選項保留。2/3暫停返回原口袋，字卡、音鈕與自評收起，只接續同UUID。第二題刻意選ニュ答錯，顯示キャ與既有拗音訣竅；第三題明示提示後答あ。完成0/3無提示、3題提示，沒有覆寫錯答；最近結果與返回路徑正確。
- 聽辨完成清單仍3字；回原自評移出あ／い、留下キャ，再聽辨只出1/1，答完仍留1字，不自動清空。自評進行中沒有聽辨新輪入口。
- 320／390px共18個選單、題目收起／回饋／提示、pending、結果及單題量測狀態。無橫向溢出，main button／select／primary均至少44px；console warn／error空。ignored `work/twelfth-qa/layout.json`。

無提示與跨日、不同備份衝突、保存失敗及七日／默寫快取，以Node真實邏輯驗證；本輪沒有在瀏覽器注入舊日期或製造容量耗盡。iPhone／Android實機及系統IME依先前決定略過，不推論真人發音或手寫評分已驗收。

## HTTP與發布

本機119份shell逐檔SHA-256、JS MIME與SW fingerprint一致，128次既有音檔HTTP抽查通過。fingerprint `2ccfb9e408c8a88d8f36f5c8d397df562c7804297f88530c52a2ca0486eb2595`；2026-10-22 15:04:48 UTC（台北23:04），ignored `work/twelfth-local-http.json`。

- [PR #28](https://github.com/linhercherng/japanese-learning-platform/pull/28)，head `1c6a63eb63e9b7b2bdcb609a0ece974e08187d1c`；[PR CI 39801842563](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39801842563) completed／success，按相同head合併。
- merge `ef9810745e959f89440b3f19e93415d09c1a0ff8`，2026-10-22 15:09:34 UTC（台北23:09）；[Pages工作39802171270](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39802171270) build／deploy皆completed／success，部署完成15:10:48 UTC（台北23:10）。
- [正式入口](https://linhercherng.github.io/japanese-learning-platform/#kana-pocket)的119份shell SHA／JS MIME／SW fingerprint與本機相符，128次音檔HTTP抽查全通過；2026-10-22 15:13:34 UTC（台北23:13），ignored `work/twelfth-public-http.json`。
- 一般正式頁重載、離頁再回，已載入新版；沒有清除快取或IndexedDB，正常庫僅查看。正式隔離QA沿用口袋あ，再由翻卡加入が／パ，聽辨依が／パ／あ固定三題。正常及慢速音播放成功，空白鍵可開始；が首答正確後刷新，原UUID與答案保留；2/3暫停時口袋字卡與音鈕收起，續作同輪。パ刻意選ベ答錯，あ明示提示後答對；當天看過的三字均另列提示，結果0/3無提示、3題提示，錯答不覆寫。
- 完成返回仍3字，最近結果可開啟；320／390px題目無橫溢、主要控制≥44px，console warn／error空。正式手機畫面在ignored `work/twelfth-qa/public-390-menu.jpg`，版面紀錄在public-layout.json。QA頁已關閉、尺寸還原、本機18118 server停止，保留一般正式站入口。此補記只改文件，不改已部署的網站檔案。

前批補查：[第十一批Pages工作39793736230](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39793736230)現已completed／success，build與deploy皆成功，deploy completedAt為2026-10-22 14:20:05 UTC。前批驗收中的waiting保留為當時觀測；未變更部署保護或重新部署其他版本。

## 教材與回退

沿用既有試用例詞、訣竅與合成音，尚待教師審校；口袋自評、聽辨、手寫、真人發音與跨日證據分開。提示只能涵蓋本站記錄到的實際曝光，不能偵測站外學習。

回退前匯出JSON，舊版可能不識別新source，保留備份等新版，不清IndexedDB。個人清單／線索／答案與QA資料不提交；正式站與本機驗收分開記錄。
