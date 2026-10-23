# 生活記憶第十批驗收（v0.31.0）

日期2026-10-23（Asia/Taipei）。[規劃](plans/2026-10-23-life-memory-tenth.md)。本批在既有中文回想加漸進開頭提示／退場，兩種句子練習目錄加有文字草稿篩選；沒有新教材、題目、音檔、依賴、schema、source或評分。

## 範圍與保護

- LR主動開始後仍預設無原日文提示。先看1字，再按需看最多4個Unicode碼點，至少保留1字不顯示；552組提示完全取原276句開頭，不是詞彙／文法切分。收起提示回最新稿，不改草稿。刷新／換句／模式／close／compare／edit均重設，LD及對照無提示控制。
- 每次揭提示先保存本課原qid參考曝光，沿用提示分類，原首答保持；不新增答對數、完成或熟練度。mode／ref／epoch／busy、input version與composition保護延遲揭露，新輸入／新選字／取消選字無input皆使舊提示失效，不重繪編輯器。失敗不揭，候選與latest cache仍可匯出；pending全遮蔽接原UUID。
- LR／LD各自依非空白text篩選有文字草稿，與程度／場景組合；顯示真實草稿句數及有文字句數。空稿留原刪除意圖，但不列有文字；LN／作品不混入。目錄無正文或個人文字預覽、不曝光、不推論弱點。提示及篩選暫存，既有備份／V1/V2／schema3不變。

## 自動測試與獨立審查

新增16項；核心4項RED→GREEN，UI/controller最初7項RED（其餘5項既有保護行為已通過），實作後核心與UI/controller全通過。UI目錄測試曾因helper預設ref把undefined當單句頁，改用null明示目錄後驗證正確，沒有放寬產品斷言。

完整npm test **644/644通過**，提示＋LR／LD九測試檔 **54/54**；build→check及audit成功，audit 0弱點。208卡／508筆順／10947音檔索引／176生活字串通過。160份shell，fingerprint `9449246bbb549b0e2abed466c3a8868ff7e888538a48bba3fc8ea3c8b381507c`。

核心獨立審查：生活192/192、276原句／552提示、504組mode／程度／場景／scope驗證通過；純函數不改草稿／首答／曝光，備份往返保持。UI獨立審查：54/54，另main-style structuredClone→fn→延遲write／unsaved／cache六情境通過，包含held提示連按只一階、新input／composition／取消選字不重繪、quota不揭且可匯出、切LD不拉回。兩審查均無P1/P2，全程唯讀，未操作瀏覽器。

## 本機實際操作

所有新輸入及作答僅 `http://127.0.0.1:18124/?qa=1` 隔離庫；不清DB／快取／SW，不改時鐘或注入歷史。

- 有文字篩選得到L07真實1課／2稿／2有文字，focus留scope；health組合0課，有可復原提示，改全部恢復12課。
- LR第1句→1字「コ」→4字「コーヒー」，只原句開頭、無自動音訊；收起提示回原稿與textarea焦點，沒有改草稿。另輸入日文／emoji後刷新先收起，開始恢復新稿，沒有殘留提示。對照後提示控制消失，收起原句回無提示編輯器；切LD舊稿仍在且無hint控制。
- Tab從編輯器到提示按鈕有outline，揭露後focus到hint段，scroll margin 119.375px。提示狀態320／390／768／1024／1440px無橫溢；對照48px、收起提示／關閉49px。console warn/error空，ignored截圖 `work/life-tenth-local-390.png`。
- 原輪 `e07f56be-e902-404e-b5da-52c370f1a526` 未完成時全遮蔽，只接同UUID；完成1題／1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2正確／3提示／0無提示；第六批L07中日文線索保持，沒有改寫。
- UTC06:11:35本機160份shell逐檔SHA256／JS MIME／SW及146原音HTTP通過，1次暫時連線重試；預設TLS驗證，ignored紀錄 `work/life-tenth-local-http.json`。

桌面寬度／IME事件不等於iPhone／Android實機或OS日文鍵盤；教師／真人審校與長期效果不由本批推論。回退先匯出JSON、保留DB／備份；個人資料及QA不提交Git。

## 發布驗證

- [PR #43](https://github.com/linhercherng/japanese-learning-platform/pull/43) head `46168d36ff0ae18cd15b41c33f818524ad511dd7`；同head [CI39910368446](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39910368446) completed/success後按match-head合併，merge `f82306622f1ffb3a12f38a0323d942fa1295146c`。
- [Pages39910507764](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39910507764)整體completed/success、build與deploy均success；deploy UTC06:17:54（台北14:17）完成。[正式中文回想](https://linhercherng.github.io/japanese-learning-platform/#life-recall)與[聽寫目錄](https://linhercherng.github.io/japanese-learning-platform/#life-dictation)已包含本批功能。
- UTC06:19:16正式160份shell逐檔SHA256／JS MIME／SW及146次原音HTTP通過，0重試，fingerprint與本機相同；預設TLS驗證，ignored紀錄 `work/life-tenth-public-http.json`。276原句音檔全量索引／實體檔案驗證屬原自動測試，不宣稱276皆做正式HTTP。
- 更新前在既有正式隔離庫展開LR原稿作保留比對；正常正式分頁reload下載新shell，暫離後依正常SW生命週期接手，沒有清DB／快取／SW或強制啟用。所有新輸入／提示／作答只在?qa=1隔離庫。
- 正式有文字篩選初始LR為L07一課2稿2有文字，無私稿預覽、focus留scope；原LR第1句與更新前完全相同。第3句原先無稿，開始後空字不可對照，按需只顯1字「こ」→4字「ここで飲」，沒有完整原句或自動音訊。退場後仍空稿，輸入少量日文→刷新→開始恢復新稿，提示不殘留。對照後無hint控制，收起原句返回無提示編輯器；切LD舊稿不變且無hint。
- 正式原輪 `251ff352-51b8-431d-bb5d-cdd1ca686493` 未完成時中文／草稿／提示全遮蔽，只接同UUID；完成1題／1正確／1提示／0無提示。舊L07首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3正確／2無提示／1提示，第六批L07中日文線索保持。
- 新增第3句稿後，LR有文字篩選真實1課／3稿／3有文字，LD仍1課／2稿／2有文字，兩模式各自計數；LR的health組合為0課且可改看全部。
- 正式提示狀態320／390／768／1024／1440px無橫溢，提示退場49px／對照48px；focus至hint段、scroll margin119.375px，Tab接首字提示有outline。console warn/error空。ignored截圖 `work/life-tenth-public-390.png`。
- 回正常正式入口只讀，12課全0 LR稿，沒有寫測試答案／私人文字；入口截圖 `work/life-tenth-public-entry-390.png`。離開QA、停止18124伺服器、恢復viewport並保留正式目錄。第一至第九批一同保留；實機／OS日文鍵盤、教師／真人審校與長期效果仍未由本批推論完成。
