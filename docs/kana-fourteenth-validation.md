# 五十音記憶第十四批驗收（v0.18.0）

日期：2026-10-23（台北）。[規劃](plans/2026-10-23-kana-fourteenth.md)。

## 交付

逐字回顧的有效原錯答可展開參考字與原選字雙卡，兩字各有既有例詞／詞義、訣竅與明確命名的音鈕；已有混淆對照才顯示既有差異。可遮住字形、原選字、線索與音鈕，自己回想後揭開核對。同一輪原首答不重評，無新attempt、分數、schema、source或題庫ID。

原提示與雙卡互斥，切字／刷新收起；pending口袋聽辨遮蔽原回顧。實際雙卡文字出現才同步提示、七日未答題、默寫草稿與cache；遮住不新增曝光。既有留回口袋、保存失敗與離頁守護沿用。

## 自動驗證與審查

新增17項核心、UI與真控制器測試先紅後綠，覆蓋208字的原錯選項、角色／未知值／同字、既有difference雙向、雙卡實際曝光、遮住不洩、兩音鈕／HTML編碼、局部重置、pending／過期動作、焦點、原答案不變、七日／默寫cache與失敗保存。最終完整npm test **396/396**，build後check與npm audit --audit-level=high通過，0 vulnerabilities。

核心獨立審查30項新舊相關測試無P1/P2。UI獨立審查39項回歸發現P2：shared audioButton新增第二參數後，V3舊availableAudio的map(audioButton)會把index當文字，K01例句音鈕變0/1。新增真deepView K01步驟2、含分隔例句共5音鈕的回歸先紅後綠；呼叫改為單參數callback，app搜尋無其他同類呼叫。獨立複核18項測試通過，無剩餘P1/P2。

## 瀏覽器與發布

本機內建瀏覽器127.0.0.1:18120/?qa=1獨立庫，僅透過可見UI留下あ／い，完成い刻意選ら錯答、あ正確。結果0/2無提示、2題提示符合當天看過字卡。從結果進逐字回顧，錯字對照顯示い／ら原角色、例詞與訣竅，兩音鈕可分別操作，空白鍵可播放；正確的あ沒有錯字對照入口。

遮住後目前參考字／原選字、雙卡、線索與音鈕皆不在main DOM，焦點落在揭開按鈕；揭開回相同雙卡並聚焦遮住按鈕。切字與刷新收起對照、刷新回首字且保留原錯答；原線索1音鈕與對照2音鈕互斥。返回原結果仍0/2無提示、2提示，未新增成績。另開pending聽辨後舊回顧仍整頁遮蔽，僅提供接續。K01既有深化課對照例句實際五鈕皆顯示聽發音，確認P2修補。

320／390px共11個展開、遮住／揭開、正確卡、刷新、原線索互斥、pending與舊課程狀態量測，無橫溢，main button/select/primary至少44px；console warn/error空。淺底雙卡與文字可讀，例詞／訣竅在窄版換行。ignored work/fourteenth-qa/local-layout.json。保存失敗／七日／默寫cache以Node真控制器驗證，未在瀏覽器注入資料或製造容量耗盡。

本機122份shell SHA-256、JS MIME與SW fingerprint相符，128次既有音檔HTTP抽查通過；2026-10-22 16:50:57 UTC（台北10/23 00:50）。fingerprint `2e2c9d03f719dc6ae728a599e08e6b355b5c09eb140daad6e56e0981903fe45f`，ignored work/fourteenth-local-http.json。

- [PR #30](https://github.com/linhercherng/japanese-learning-platform/pull/30)，head `e34747b447bac40e77c9d766a405c1c2ead963b8`。[PR檢查39817693690](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39817693690)的build於2026-10-22 16:52:54 UTC completed/success，PR部署依設計skipped。合併前GitHub statusCheckRollup皆completed，必要build SUCCESS且mergeStateStatus=CLEAN，按相同head合併。
- PR workflow總狀態在發布後查詢仍in_progress、conclusion空，與已完成jobs不一致；因此此處僅記必要檢查完成，不宣稱該run整體completed。未取消／重跑遠端workflow或更改部署保護。獨立的main Pages工作已正常completed/success，見下節。
- merge `1330ea36b9f312941253340a7fc82ed533e7265f`，2026-10-22 16:56:02 UTC（台北10/23 00:56）；[Pages 39818239248](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39818239248)整體completed/success，build/deploy皆success，deploy完成16:57:17 UTC（台北00:57）。
- 正式HTTPS的122份shell SHA、JS MIME與SW fingerprint與本機一致，128次既有音檔HTTP抽查全通過；2026-10-22 16:59:17 UTC（台北10/23 00:59），ignored work/fourteenth-public-http.json。
- 一般正式來源重載、離頁再回，未清快取／IndexedDB，個人學習資料未作測試。正式隔離QA沿用第十二批的が／パ／あ完成輪，正確が無錯字入口，原錯答パ／原選字ベ可展開兩卡，原角色、輔助讀音、例詞與既有訣竅正確，兩音鈕各可播放。空白鍵遮住後main無字音／兩字／訣竅，焦點在揭開；揭開回同雙卡、焦點在遮住。切字與刷新收起，返回原結果仍0/3無提示、3提示，沒有改寫原首答或新增成績。
- 正式320/390px共5個對照、遮住／揭開與最終狀態量測，無橫溢、主要控制至少44px；console warn/error空。淺底字卡／詞例文字在窄版正常換行，正式畫面ignored work/fourteenth-qa/public-390-contrast.jpg，量測public-layout.json。已關閉QA、還原尺寸、停止本機18120 server；保留一般正式站分頁。此補記只改文件，不改已部署app資源。

## 素材與邊界

沿用208卡、508筆順、10947音檔索引與K包668檔，無新素材或依賴。試用訣竅與合成音仍待教師審校；回顧不是新首答、手寫、真人發音或跨日掌握。實機依先前決定略過。回退前匯出JSON，不清IndexedDB；個人線索／答案與QA不提交。
