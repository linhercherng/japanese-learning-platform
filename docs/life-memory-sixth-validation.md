# 生活日語記憶第六批驗收（v0.27.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-sixth.md)。本批加入自己的生活情境線索與線索簿，維持92課436道原題，沒有新教材、音訊或依賴。

## 實際範圍

- life-notes/<unit>：個人160字線索，預設收起，主動展開才出現文字與編輯器；離頁／刷新收起。input只留草稿，明示保存；空白保存留有日期的空文字，避免舊備份復活已移除文字。
- life-notes：保存線索與草稿的聯集，搜尋原課／自己的文字、程度／場景／狀態篩選、每頁10課；只顯示課名／日期／狀態，不預覽正文，也不新增參考紀錄。空草稿可找回，未知課／空結果可復原。
- 任一生活pending均遮蔽個人正文與表單，接原UUID。非空線索展開、輸入、保存沿用lifeHints，保守記本課全部原qid；不新增作答或完成紀錄、不改原首答。回原課、逐句卡、能力專練、生活寫作與複習預告。
- schema3 optional lifeNotes及text:LN-草稿；160字／92key／已知課／日期／欄位／空points驗證。依實際時間合併，同時異文拒絕，舊草稿對消、較新草稿保留；原schema升級與首答／作品規則維持。
- IME事件守護、輸入不重繪、連按鎖、route epoch、保存期間新輸入版本保護；失敗候選及最新草稿可匯出。收起／保存後展開按鈕接焦點，搜尋／篩選／翻頁後結果標題接焦點，避開目前路徑遮擋。

## 自動測試與審查

新增18項測試。資料／介面／controller先紅再綠；審查發現的焦點缺口另加RED→GREEN回歸。涵蓋全92課、備份往返、墓碑／實際時間／同時衝突、草稿對消、新輸入保存競態、曝光／pending、HTML編碼、空索引／篩選／10筆頁碼、刷新路徑、IME事件、超長拒絕、失敗匯出、連按與延遲離頁。

獨立核心審查生活117/117通過，額外全92課436原題曝光／備份及368組雙向合併通過；沒有P2以上阻擋。獨立介面審查找出焦點缺口，修補後15/15複核通過；額外以接近main的串行queue／fn後延遲落盤／unsaved與latestDrafts overlay驗證保存成功、保存失敗後的新輸入均保留。其後再補3項IME／空白／過長／舊路徑驗證，新增測試合計18/18。

完整 `npm test` **573/573通過**；`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點。208卡／508筆順／10947音檔索引／176生活字串檢查通過。152份shell，fingerprint `da6a34c97e837a29ea119c4e468d760488005d178245ecf5d6f550ebc0d979ab`。

## 本機實際操作

隔離QA `http://127.0.0.1:18124/?qa=1#life-notes`：真實空線索簿→L07原課新入口→空編輯器→繁中／日文草稿→刷新收起→展開恢復原文字→明示保存收起。搜尋個人文字找到本課但正文不在目錄；N2篩選得真實空結果，清除恢復。保存後鍵盤焦點回展開按鈕，Tab到保存按鈕有可見outline；加scroll margin後焦點top119.44px，大於導覽bottom95.38px。

能力聽解原輪 `3a1e4479-fb97-4f7a-95d6-7f24ec594fb5`：線索頁全遮蔽／無表單→接同UUID→完成一題，1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2首答正確／3提示／0無提示，沒有被改寫。

單課開啟編輯器於320／390／768／1024／1440px無橫溢；保存48px、收起49px，textarea不溢出。console warn/error空。截圖ignored `work/life-sixth-local-390.png`。UTC04:00:27本機152份shell逐檔SHA256／JS MIME／SW fingerprint及146次原音HTTP通過，1次暫時連線重試，紀錄ignored `work/life-sixth-local-http.json`；預設TLS驗證。

不清DB／快取／SW、不改時鐘、不注入跨日歷史。個人資料／QA均不提交。桌面寬度及IME事件測試不等於iPhone／Android實機或OS日文鍵盤驗收；教師／真人審校及真實長期記憶效果仍未驗證。回退前先匯出JSON；舊版可能不認lifeNotes，保留原DB及備份。

## 發布驗證

- [PR #39](https://github.com/linhercherng/japanese-learning-platform/pull/39) head `84033ffd501e7eac847a96b53458133e5b9e797c`；同head [CI39898145584](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39898145584) completed/success後按match-head合併，merge `84e239b823b700b604ab1c7b359897ba3aa733fb`。
- [Pages39898233180](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39898233180)整體completed/success，build及deploy均success，deploy job UTC04:04:11（台北12:04）完成。
- 正式[生活線索簿](https://linhercherng.github.io/japanese-learning-platform/#life-notes)及[單課線索](https://linhercherng.github.io/japanese-learning-platform/#life-notes/L07)可用。UTC04:05:19正式152份shell逐檔SHA256／JS MIME／SW及146次原音HTTP通過，0重試，fingerprint與本機相同，預設TLS驗證；紀錄ignored `work/life-sixth-public-http.json`。
- 正式隔離QA從空線索簿→原課新入口→中日文草稿→刷新收起→展開原文字→明示保存收起。搜索自己的文字得到本課，正文不在目錄；N2篩選真實空結果、清除復原。保存後焦點回展開按鈕且位於路徑列下方；新按鈕48／49px，Tab outline可見。
- 正式生活能力聽解原輪 `5c98662d-196d-45de-bbb3-99104298f0a4`：線索頁全遮蔽並接同UUID；完成1題／1正確／1提示／0無提示。舊首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3首答正確／2無提示／1提示，沒有被改寫。
- 正式320／390px編輯器無橫溢，console warn/error空，截圖ignored `work/life-sixth-public-390.png`。本機另實測L08空字草稿在待保存篩選可找到、清除復原2課，搜尋結果標題接焦點且320px無橫溢。
- 正常分頁循SW正常更新生命週期（下載新shell後暫離網站再回來），已出現新入口；能力原紀錄仍0練過／1、2、5未練。正常庫只查看收起的空線索入口，不寫個人文字／作答或打開教材參考；正式入口截圖ignored `work/life-sixth-public-entry-390.png`。未清DB／快取／SW。隔離QA及18124伺服器已關閉，正式單課入口保留。
- 實機、OS日文鍵盤、教師／真人審校與實際長期效果仍未驗證；第一至第五批功能保留且一同發布。
