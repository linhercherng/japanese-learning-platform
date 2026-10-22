# 五十音記憶第七批驗收（v0.11.0）

日期2026-10-22，基底ab87224。[實作規劃](plans/2026-10-22-kana-seventh.md)。

## 交付

單一入口 `#kana-bridge/<source item>` 整合三種操作：平片互換三題、按需展開同音雙形對照、同一組反向再想。104對涵蓋208卡及八種方向／分類，保留じ／ぢ、ず／づ的字形映射。208個穩定kx題每題三個另一套同分類選項，僅一正解；每輪固定同類三字，不補跨類新字。

沿用schema3，新增kana-bridge來源，嚴格驗證reference／題序與queue。首答、續作、合併備份及舊資料保留；只新增目標字recognition紀錄，不當成聽辨／書寫／長期記憶分數。反向另存首答，同日或輪內已記錄的任一配對提示使新答案標hinted，原首答不回寫。

雙形對照預設收起，主動展開才顯示三對字、既有讀音／平片訣竅及三個有效音鈕。實際可見字形會記提示，含解說內假名；同步七日未答題及默寫草稿／快取。待續頁收起對照，刷新關閉暫存開關，不丟已開始的固定輪次。

## 測試與審查

新增14項測試涵蓋104對／208題、八類／半濁音、同音異字、音庫／K包、嚴格來源／題序、備份合併／首答、同日／未來曝光、七日證據及整理保留、隱藏對照／導航、刷新／待續、草稿快取、保存失敗與延遲保存期間離頁。

核心審查獨立執行63項相關測試，另重現kx來源字的七日證據與整理保留，未見P1／P2。UI審查找到一項P2：開始練習等待保存時，已離開或換類仍被拉回舊輪。先補deferred update回歸重現，再擷取原hash，保存後只有仍在原路徑才導頁；輪次保留可續作。獨立覆核13/13通過，沒有其他重要問題。

## 真實瀏覽器

內建瀏覽器 `127.0.0.1:18113/?qa=1` 隔離庫，未注入資料庫或修改時鐘。由今天怎麼練進新入口，完成三題：首題正答刷新保留，次題錯答，第三題用提示後正答；完成顯示1/3無提示、1題提示，沒有改寫錯答。返回來源接續同一UUID並維持2/3，沒有露出對照。

從結果切反向方向，八分類皆實際選取並展開，顯示正確基本／濁音／半濁音／拗音三對字。對照的空白鍵播放顯示日語合成語音播放狀態，焦點留在音鈕；收起與刷新均正常。反向作答顯示今日／本輪提示狀態，解說仍收起，作答後標「提示後答對」。

320／390px共27個頁面狀態（兩寬八分類對照、練習／回饋、待續、結果及導引），無橫向溢出，main的button／select／primary至少44px；console warn／error空。既有翻卡與二選一入口回歸正常。版面JSON／截圖留在ignored `work/seventh-qa`。實機依使用者既有決定略過，沒有操作iPhone／Android、系統日文鍵盤或真人發音評分。

## 完整檢查

- npm test：292/292；npm run build／check成功；npm audit --audit-level=high：0 vulnerabilities。
- 本機HTTP：106個shell逐檔SHA-256、JS MIME與service-worker fingerprint一致，78次音檔HTTP抽查成功，包含基本／濁音／半濁音／拗音首尾平片字音。
- fingerprint：`052e6755a5cf0e1b2f9322c6a3b0c5853c44c230cfeee5a0f6bde6b0a199507b`；本機驗證時間2026-10-22 11:28:48 UTC（台北19:28）。日誌與JSON在ignored `work/seventh-*.log`、`work/seventh-local-http.json`。

## 發布

- [PR #23](https://github.com/linhercherng/japanese-learning-platform/pull/23)，head `5c32d911c3b631588849c4af38d84514640534d7`；[PR CI](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39771082264)成功，依相同head合併。
- main merge `f78a7ba8bc2653a5fa69ba8cd040836d5e260c33`；[Pages build／deploy](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39771209588)均成功，2026-10-22 11:32:53 UTC完成部署（台北19:32）。
- 正式HTTPS於2026-10-22 11:33:59 UTC（台北19:33）確認106個shell SHA-256、JS MIME及service-worker fingerprint與本機相符，78次音檔HTTP抽查通過。完整JSON在ignored `work/seventh-public-http.json`，fingerprint同上。
- 正常資料庫的既有頁面先顯示第六批快取，待新版shell下載完成，離開頁面再開回來後出現「平片互換三題」。未清快取、個人資料或資料庫。
- 正式站 `?qa=1` 隔離庫390px：由今天怎麼練進入，選看平選片拗音，展開きゃ／キャ、きゅ／キュ、きょ／キョ，空白鍵播放顯示合成語音播放狀態。實際完成三題、首題保存後刷新仍為提示後答對；結果列0/3無提示、3題提示。完成後換方向，URL與「看片假名，選平假名」一致。console warn／error空，無橫向溢出；畫面在ignored `work/seventh-qa/public-390-bridge.jpg`。
- 公開入口：[平片互換三題](https://linhercherng.github.io/japanese-learning-platform/#kana-bridge)、[今天怎麼練](https://linhercherng.github.io/japanese-learning-platform/#kana-path)。測試分頁與本機server已關閉，還原viewport，保留正常公開入口。QA資料、日誌與截圖只留ignored work，不提交個人紀錄。

## 素材與回退

沒有新依賴、音檔、圖片或外部素材，沿用208卡、508筆順、10947音檔索引與K包668檔。新題目與編排為日和原創試用，教材／合成音尚待獨立教師審校。

回退前匯出JSON；舊版可能無法識別新kana-bridge來源，保留原備份待新版恢復，不清IndexedDB。站內曝光只能反映已記錄的提示，無法偵測紙本或站外學習。本次不宣稱跨日學習效果或正式檢定成果。
