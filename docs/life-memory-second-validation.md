# 生活日語記憶第二批驗收（v0.23.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-second.md)。新地圖、回顧與弱點原題加練，不新增語言教材、依賴、素材或schema欄位。

## 實際範圍

- life-map：92課地圖，程度／場景／範圍；實際練過原題、台北日期、最新弱點與下一步。小結以同題同日首筆，聽解／自主填空排序／理解選擇分開，時間重疊另列。
- life-round：完成生活輪原序回顧；原選項／詞塊維持穩定混排，必要短文獨立開啟，原首答／正誤提示／正解／原解說按需揭開，切題／刷新收起。不新增作答、不重評舊首答。
- life-repair：從cutoff內最新錯答／提示的既練題挑最多三課各一題；不湊新題，新source沿用原V3草稿／保存／備份。與第一批三題／隔天共一pending，結果保留同日加練界線，接至回顧與隔天。
- 參考曝光依實際短文開啟／解說揭開／回顧音，記原qid。正常V3聽解刺激音不當額外答案提示。各生活輪pending時，所有原輪回顧先遮蔽。

## 自動與審查

核心、UI／controller測試先紅再綠；涵蓋cutoff、原題／能力／日期統計、不同時區格式同一時刻的重疊首答、弱點三課、不湊新題、共享pending、來源日期／備份合併、原題序與首答、HTML編碼、焦點／切題／刷新／過期／連按／延遲保存離頁及失敗匯出。

核心獨立審查通過。UI審查P2指出排序詞塊／選項／閱讀刺激不足，`696c395`補齊原刺激及獨立短文toggle曝光，正解仍遮蔽；新增2項回歸測試，13項UI/controller複核通過，無剩餘阻擋項。完整 `npm test` 496/496通過；`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點。另修補單題repair結果誤用固定三題說明，`66ed31c`加回歸測試並通過UI定點複核。

## 瀏覽器與資料界線

本機 `http://127.0.0.1:18124/?qa=1` 沿用第一批L07真實操作QA：地圖3/8原題、1日、3弱點；三種能力各1筆每日首答。完成弱點1/1後仍各1筆，不以同日重做灌高。原輪仍0/3無提示、原首答共2題正確／3題提示。

390px驗證弱點／場景篩選、原輪預設收起、原選項、原錯答「內用」與參考「外帶」分開、原提示旗標、音檔、Enter焦點、切題與刷新收起、回顧寫作連結。弱點只有一課即出一題；暫停／直接開原回顧皆遮蔽答案，刷新接續相同UUID，完成後有原輪回顧與同日加練界線。排序詞塊及閱讀短文獨立開啟由自動回歸測試驗證。

320px回顧與地圖無橫溢，新按鈕／selector至少48px，N2弱點空結果可復原，console warn/error空；本機截圖ignored `work/life-second-local-320.png`。本機HTTP139份shell逐檔SHA／JS MIME／SW fingerprint與146音檔抽查通過（UTC01:44:52，1次暫時連線重試），fingerprint `1fb2179a25de29c2771522f75c598682bf694a45f495c2f08b2e31c18d45e5e1`，紀錄`work/life-second-local-http.json`。

使用 `?qa=1` 隔離QA沿用第一批實際操作紀錄；不清庫、不注入虛構跨日歷史、不更改時鐘，不使用個人資料庫做答。跨日／cutoff用固定時間自動測試；桌面320／390px不能替代iPhone／Android實機。真實學習效果與教師／真人語音審校未由本批推論完成。

回退先匯出JSON；舊版可能不認life-repair來源，保留原備份與DB，不清資料。QA答案／草稿／截圖留ignored work，不進Git。

## 發布證據

- [PR #35](https://github.com/linhercherng/japanese-learning-platform/pull/35) head `66e8aec507300776ed51c7b16be9fa1697cdc973`，同head [CI run39885927201](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39885927201) completed/success後按match-head合併。
- merge `9aa56bc403f800fae7d5167c46bd18d79e8c38d6`；[Pages run39886039295](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39886039295)整體completed/success，build/deploy皆success。deploy UTC01:49:11完成（台北09:49）。
- 正式[生活記憶地圖](https://linhercherng.github.io/japanese-learning-platform/#life-map)及首頁／生活／練習入口可使用。
- UTC01:51:10正式HTTP通過139份shell逐檔SHA256、JS MIME、SW fingerprint及146次原音檔抽查，fingerprint與本機一致，0重試。使用PowerShell預設TLS驗證，沒有停用憑證驗證；ignored紀錄`work/life-second-public-http.json`。
- 正式隔離QA第一批L07原輪仍3題首答正確／2題無提示／1提示；地圖三種能力各1筆每日首答。回顧預設隱藏原值，選填空題揭開可見原「で」與原提示旗標，Enter留同按鈕焦點。弱點實際只有一課便出1題，日文草稿「で」離頁／刷新後仍保留並接續同UUID；未完成時原回顧全遮蔽。完成後只顯示弱點加練說明，沒有固定三題錯誤文案；原三題結果與每日首筆不變。
- 正式既有五十音兩題輪仍0/2無提示、2提示，原錯答回顧／小結入口保留。正常個人資料庫未答題或改資料，所有新操作使用隔離QA。
- 390/320px正式地圖無橫溢；320px新selector48px以上，console warn/error空。本機另驗回顧按鈕48px以上。正式截圖ignored `work/life-second-public-390.png`與`work/life-second-public-320.png`。排序／閱讀刺激與toggle以自動回歸驗證，正式手動主要走填空回顧與加練。
- 既有正常分頁重新載入後暫離網站，讓新SW正常接手，沒有清DB／快取／SW。QA分頁與本機18124伺服器已關閉；正式分頁保留新版入口。真實隔日效果、iPhone／Android實機、教師／真人審校仍未由這批驗證完成。
