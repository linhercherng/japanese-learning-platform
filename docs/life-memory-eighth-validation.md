# 生活日語記憶第八批驗收（v0.29.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-eighth.md)。本批新增一次一句生活聽寫：92課各三句，共276句，沿用memoryPhrases、讀音、中文與原音；沒有新教材、題目、音訊、依賴或評分來源。

## 實際範圍

- life-dictation目錄：程度／場景篩選、真實課數與每課草稿句數，無正文預覽／曝光，空場景可復原。life-dictation/<unit>:<0..2>一次一句，上一／下一句留URL。
- 預設草稿及原句不在DOM；主動開始才出原音／0.75慢速、300字textarea，空字不能對照。input自動留本機草稿，不重繪；刷新／離頁／換句收起，各句不互相覆寫。明示對照後唯讀「這次寫的／課程原句」、字元差異、原讀音／中文，收起回最新草稿。
- Unicode序列LCS保留原字形／空白／標點／emoji，不判同義句、文法自然度、聽寫分數或完成；完全相同僅敘述相同，不新增attempts、source、完成或熟練度。
- 聽音、非空稿展開／輸入、對照保守記本課全部原qid參考；空編輯器／目錄不記，原首答保持。任何life pending全遮蔽草稿與原句，接同UUID。
- schema3既有drafts加text:LD-<unit>:<slot>；300字、合法ref／日期／欄位／空points驗證。依實際時間合併、同時異文拒絕、較新空稿不復活舊文字，原課寫作／LN線索／作品保留。失敗候選與latest cache可匯出。
- busy／route epoch／ref防延遲音訊與揭原句，保存曝光成功後才播放／對照；新input或compositionstart會使舊對照失效，IME不中斷。焦點於對照標題／編輯器／開始按鈕接續；48px控制、HTML編碼與原課路徑整合。

## 自動測試與獨立審查

新增22項測試，完整 `npm test` **612/612通過**；`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點。208卡／508筆順／10947音檔索引／176生活字串檢查通過。160份shell，fingerprint `e3f23ea38e313d06be1200af44c12f3081121a9bc912f47000b3e7f3880f5bd5`。

測試涵蓋276合法原句、獨立草稿、300字／時間／欄位／points／未知ref、備份往返／實際時間／同時衝突／空稿、首答／筆記／作品保留、雙端文字還原、HTML／預設隱藏／唯讀、pending／音訊／篩選／焦點、IME／連按／stale route／quota候選／較新input。276句音檔皆有既有索引與實體有效檔。

獨立核心初審驗證276原句欄位同源、2,404組文字雙端還原、emoji／長度邊界、276空稿雙向merge及舊資料保留。核心及UI均找到同一P2：compare等待保存時開始composition但尚未input，舊version未失效會移除正在選字的textarea。先加兩項RED（render3≠2）再修補：compositionstart限目前編輯ref並version++，post-await再檢查!composing。持續選字與取消選字無input兩情境GREEN。

979191c複核：新增22/22、生活160/160通過；UI另用貼近main的clone／串行queue／fn後延遲落盤、quota與cache驗證，兩IME原重現均不重繪、textarea保留。無剩餘P2以上阻擋。審查全程唯讀、未操作瀏覽器。

## 本機實際操作

使用既有可調尺寸分頁，所有新操作僅 `http://127.0.0.1:18124/?qa=1#life-dictation` 隔離庫，不清DB／快取／SW、不改時鐘或注入跨日歷史。

- 12課目錄→L07第1句空開始，空字對照禁用；原音及慢速按鈕實際回報「正在播放日語合成語音」。日文草稿輸入後刷新，文字收起、開始可恢復；對照唯讀且原句不提前出現。
- 輸入少長音的原句，對照只標「ー」；收起回textarea及原草稿，換第2句輸入繁中／日文／emoji，回第1句原稿仍在。目錄真實顯示2句草稿。原文完全相同時僅顯示文字相同，不新增作答。
- N2／food得到1課，L／health得到真實0課，換all恢復；篩選重繪後焦點留同select。新頁目前路徑包含原課與生活聽寫。
- L07能力原輪 `b942f713-376c-474e-b72d-1b2ae89fe9e1` 建立後，聽寫頁全遮蔽，接同UUID；完成1題／1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2首答正確／3提示／0無提示，第六批L07原線索可恢復。
- 編輯器320／390／768／1024／1440px無橫溢；音訊／對照48px、收起49px；唯讀對照320／390px也無橫溢。Tab接對照按鈕有outline，對照標題及返回textarea焦點明確；console warn/error空。截圖ignored `work/life-eighth-local-390.png`。

UTC05:05:38本機160份shell逐檔SHA256／JS MIME／SW及146原音HTTP通過，0重試，預設TLS驗證；紀錄ignored `work/life-eighth-local-http.json`。個人文字及QA不提交公開Git。

桌面寬度及IME事件不等於iPhone／Android實機／OS日文鍵盤；教師／真人審校、長期效果、自由寫作／手寫／口說能力未由本次推論完成。回退前匯出JSON、保留原DB與備份，舊版可能不辨LD草稿入口。

## 發布驗證

- [PR #41](https://github.com/linhercherng/japanese-learning-platform/pull/41) head `09603a88e0852858c9addcd320b2c3a43da44e72`；同head [CI39904011033](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39904011033) completed/success後按match-head合併，merge `19e64c40571c4aba5a24972418c885d6184cc5df`。
- [Pages39904256403](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39904256403)整體completed/success，build及deploy均success；deploy UTC05:11:24（台北13:11）完成。正式[生活聽寫目錄](https://linhercherng.github.io/japanese-learning-platform/#life-dictation)已可用。
- UTC05:12:34正式160份shell逐檔SHA256／JS MIME／SW及146次原音HTTP通過，0重試，fingerprint與本機相同；預設TLS驗證，紀錄ignored `work/life-eighth-public-http.json`。276句音檔的全量索引／實體檔案驗證另由自動測試完成，並非276句皆做正式HTTP測試。
- 正常正式分頁reload下載新shell後暫離網站，依正常SW生命週期接手；沒有清DB／快取／SW。所有新輸入／音訊／作答皆只在 `?qa=1` 隔離庫；目錄初始12課各0草稿，新單句頁空字不能對照。
- 正式原音與0.75慢速實際回報播放日語合成語音；日文輸入→刷新先收起→開始恢復原稿，少一個長音的稿對照僅標「ー」，唯讀時沒有textarea，焦點至對照標題，收起回原稿與textarea焦點。下一句中日文／emoji獨立保存，回前句原稿仍在；目錄真實顯示2句草稿。N2／food為1課，L／health為0課可換篩選。
- 正式隔離原輪 `c6a8a375-a0e4-45bf-af05-c62c704a43a8` 未完成時，聽寫頁完全遮蔽草稿／原句／編輯及音訊，只接同UUID；完成1題／1正確／1提示／0無提示，使用過參考的分類正確。
- 舊L07首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3首答正確／2無提示／1提示；第七批主題原輪 `19b591fb-2e6d-4959-854f-d1e967ae988d`仍2正確／2提示／0無提示；第六批已保存L07中日文線索可展開恢復，未修改個人文字。
- 正式編輯器320／390／768／1024／1440px及唯讀對照320／390px無橫溢，音訊及主要操作48px、收起49px；Tab接對照按鈕有可見outline，console warn/error空。截圖ignored `work/life-eighth-public-390.png`。
- 最後回正常正式URL只查看目錄，12課草稿仍皆0，沒有寫個人答案或線索；正常入口截圖ignored `work/life-eighth-public-entry-390.png`。離開QA、停止18124伺服器、恢復viewport，正式目錄保留。第一至第七批一同保留發布；實機／OS日文鍵盤、教師／真人審校、長期效果仍未由本批推論完成。
