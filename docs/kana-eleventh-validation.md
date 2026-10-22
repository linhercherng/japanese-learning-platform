# 五十音記憶第十一批驗收（v0.15.0）

日期：2026-10-22。[規劃與邊界](plans/2026-10-22-kana-eleventh.md)。

## 交付

翻卡可把「還不熟」保存至不熟字口袋，208張既有卡皆可用。口袋從較早留下的字取至多三張，固定一輪、先看字回想，再展開原讀音／例詞／訣竅，主動留存或移出。每輪結束後手動挑下一輪，剩一字只練一字，不補陌生字。原本翻卡同組與隔兩張重看仍保留。

optional v3.kanaPocket存active／canonical UTC time（含移出墓碑）；合法ID、時間與精確欄位驗證。較晚事件優先，同時衝突保留active，舊備份不會復活已移出字。schema3、原ID、題庫／作答／複習不變。自評不計答對或熟練，移出不清除歷史；清單保存，本輪展示暫存、刷新收起提示並重新挑剩餘字。

## 測試與審查

12項先紅後綠測試，加1項失敗移出的額外邊界測試。涵蓋208字、舊備份、非法ID／日期／額外欄位、雙向合併／墓碑／同時衝突、固定三字、不先展開不能自評、無新增attempt、刷新、過期round／item／cursor、連按互斥、延遲換頁及失敗保存仍可匯出。

實際曝光沿用recordKanaExposure：看到字形記該字，展開才記例詞與訣竅；同步七日未答題、默寫草稿與快取。既有首答不回寫。測試直接使用真實狀態、備份及控制器邏輯，只替換瀏覽器事件與保存邊界。

獨立核心審查12項口袋及54項相關回歸，UI審查25項相關測試及208卡共416個收起／展開render狀態，未發現P1／P2，兩者均唯讀且未操作瀏覽器。另補失敗移出測試5/5控制器通過。完整npm test **349/349**；npm run build、npm run check成功；npm audit --audit-level=high **0 vulnerabilities**。

## 本機真實瀏覽器

內建瀏覽器`127.0.0.1:18117/?qa=1`，獨立QA庫；沒有注入資料、修改時鐘或操作個人學習紀錄。

- 空口袋正確引導翻卡；平／片假名基本、濁音、半濁音、拗音八類各留一字，共8字，刷新仍保留且字表不提前預覽。
- 第一輪あ／が／ぱ依序固定；移出あ、保留が、移出ぱ，完成後剩6字。數量變化不重排當輪，不增加答對數；正常字音播放顯示成功狀態，空白鍵可展開讀音並把焦點移到音鈕。
- 下一輪展開きゃ後刷新，提示收起、仍6字，再開始きゃ／ア／ガ混合三字並移出，剩3字。後續保留1字時只顯示1/1，最後移出變0，刷新仍0。
- 320／390px共48個量測狀態含空、選單、三字／單字的收起及展開、完成與八類翻卡。無橫向溢出，main button／select／primary均至少44px。console warn／error空。
- 返回翻卡、今天怎麼練及麵包屑正確；既有數拍三題入口、二選一目錄／差異對照正常。版面JSON留ignored `work/eleventh-qa/layout.json`。

備份與失敗保存以Node真實邏輯驗證，未在瀏覽器製造儲存空間耗盡。iPhone／Android實機、系統IME、真人發音與手寫評分依先前範圍未驗證。

## HTTP驗證

本機118份shell逐檔SHA-256、JS MIME與SW fingerprint一致，128次既有音檔HTTP抽查通過；無新音檔。fingerprint `30aa5a1f6aa44d2c5304457f0d37e0a4f2ccdd3290ea0f4d94daae04e12defca`；2026-10-22 14:03:25 UTC（台北22:03），ignored `work/eleventh-local-http.json`。

## 發布

- [PR #27](https://github.com/linhercherng/japanese-learning-platform/pull/27)，head `c5b51673b59f7888dcfda53d396707636632f3b0`；[PR CI 39792883449](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39792883449) completed／success，檢查及GitHub自動審查沒有待解問題，按相同head合併。
- merge `270719d4820b9196c33c194186b83544a95d82b0`，2026-10-22 14:12:42 UTC（台北22:12）；[Pages工作 39793736230](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39793736230)的build／test／check／audit／artifact upload全部成功。工作狀態回報長時間queued／waiting；環境只有允許main的branch policy，無wait timer或reviewer名單，設定未修改。嘗試重新排程時取消端點回「工作已完成」，重跑端點回「仍在執行」，沒有成功取消或另起attempt。**最後查詢deploy仍waiting，不能把API回報寫成completed／success。**
- [正式入口](https://linhercherng.github.io/japanese-learning-platform/#kana-pocket)已可讀到新版。2026-10-22 14:24:52 UTC（台北22:24），118份shell SHA-256／JS MIME／SW fingerprint與本機版本一致，128次音檔HTTP抽查全部通過；ignored `work/eleventh-public-http.json`。這是實際HTTPS版本驗證，與尚未更新完成的工作狀態分開記錄。
- 正常正式頁重載後離頁再回，已顯示不熟字口袋及正確麵包屑，沒有清除快取或IndexedDB，正常庫僅查看。正式隔離QA實際保存あ／い／パ，刷新仍3字；固定三字先回想後展開，空白鍵操作與字音播放成功，保留あ、移出い／パ後剩1字，刷新仍1字且提示收起。320／390px無橫溢、主要控制≥44px，console warn／error空。
- 正式手機畫面在ignored `work/eleventh-qa/public-390-pocket.jpg`；QA頁已關閉、尺寸還原、本機18117 server停止；保留一般正式入口。此補記只改文件，不改已驗證的網站檔案。

## 教材與回退

第十二批補查（2026-10-22）：上述Pages工作39793736230已completed／success，build／deploy皆成功，deploy completedAt為14:20:05 UTC；waiting為先前API觀測，正式驗證與最終工作結果均已確認。詳見[第十二批驗收](kana-twelfth-validation.md)。

沿用208卡、508筆順、10947音檔索引與K包668檔，無新增依賴或外部素材。原創試用訣竅與合成音仍待教師審校。口袋自評不能取代隔天獨立回想，亦不偵測站外學習或評分發音。

回退前匯出JSON；舊版可能不識別optional kanaPocket，保留備份等新版，不清IndexedDB。QA資料、個人清單與備份不提交。
