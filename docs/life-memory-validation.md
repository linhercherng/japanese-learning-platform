# 生活日語記憶與複習驗收（v0.22.0）

日期：2026-10-23（Asia/Taipei）。[規劃](plans/2026-10-23-life-memory.md)。沿用92課、原題、原合成音，沒有新增外部內容或依賴。

## 已實作

- `#life-memory`：起步12課與N5～N2各20個情境，程度／生活分類篩選，預設起步。
- `#life-memory/<原課ID>`：最多三句去重原對話，中文回想，完整例句合成音與日文／讀音按需展開。收起參考後做原三題：聽解、填空／排序、情境理解。結果可回原課「自己寫」。
- `#life-check`：每日一輪、最多三題且每課一題，較早日期實際練過／今天未作答者，錯答／提示與到期優先。兩新來源共一個pending；原V2完整回想另外保留。
- 首答、提示與跨日可比較證據分開。中途另做同題、時間戳重疊、缺少較早紀錄／提示題不列跨日比較；不宣稱自由口說、手寫或檢定能力。
- schema3與舊資料延續；optional `lifeHints`保存原qid每天最早曝光，跨分支保留不同日期及較早值，上限20000筆。備份衝突明確拒絕，原首答不改寫。裝置時間回調造成曝光與較晚首答矛盾時，在交給儲存前拒絕，避免留下非法待存備份。

## 自動測試與獨立審查

新增核心、UI與控制器回歸測試，包含92課／既有音檔、3題原ID、單pending／日唯一、cutoff重建reviews、時間與曝光、舊備份合併、嚴格來源／題序、首答不改寫、錯誤分支、連按／離頁、失敗待存可匯出、原課曝光與展開寫作參考、鍵盤焦點。

獨立核心與UI審查提出2項P2：時間回調可能留下非法待存state、卡片重繪遺失鍵盤焦點；`54ccce3`修正並各加回歸測試，兩位審查者複核通過。最後本機 `npm test` 474/474通過；`npm run build` → `npm run check`皆成功，`npm audit --audit-level=high`為0弱點。原素材檢查208卡／508筆順／10947音檔通過。

## 本機瀏覽器驗收

在 `http://127.0.0.1:18124/?qa=1` 隔離QA庫操作，不使用個人資料。390px完成場景篩選、L07三句預設中文、日文展開／收起與完整音檔按鈕，三題中第一題故意選錯，刷新保持原錯答與禁用選項，第二題日文「で」草稿刷新後保留，提交並完成第三題。結果首答與提示分開，能直接回原課寫作；隔天頁誠實顯示尚無較早日期題目。

320px另驗N2飲食長句：無橫溢，按鈕48px以上、Enter展開／收起維持同卡焦點，console warn/error空。390px卡片按鈕48px以上。HTTP驗證136份shell逐檔SHA、JS MIME、SW fingerprint及128次原音檔HTTP抽查通過（UTC01:07:41）。fingerprint `0a3aa9d30481d61c5458c896f810e39a703e053b0e17e514085165f05c412080`。

跨日時間／排程以固定測試時間與原題驗證，不修改瀏覽器時鐘、不注入歷史學習資料；當日UI驗收不能替代真實隔日使用追蹤。音檔HTTP／索引與播放器按鈕狀態驗證，不宣稱語音內容或真人發音已獨立審校。320／390px為桌面瀏覽器尺寸驗證，iPhone／Android實機鍵盤／觸控仍未驗證。

## 回退與資料

回退前先從「我的」匯出JSON。舊版可能不認得 `life-memory`／`life-check`來源與optional lifeHints，勿清資料；保留原備份並回本版匯入。首次答題、作品、V2完整課練習與其歷史未重設。答案／草稿／QA截圖留於ignored work，不提交公開Git。

## 發布紀錄

- [PR #34](https://github.com/linhercherng/japanese-learning-platform/pull/34) head `8ba5132104cb17fb9851aa76bdcca5acbb9f9c5b`，PR [CI run39882398897](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39882398897) completed/success後，按相同head合併至main。
- merge commit `0698580360671c72fdcf5895fd623c10b5a4ac55`，Pages [run39882514268](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39882514268) completed/success，build/deploy皆success；deploy UTC01:12:00完成（台北09:12）。
- 正式[生活記憶](https://linhercherng.github.io/japanese-learning-platform/#life-memory)與[隔天生活複習](https://linhercherng.github.io/japanese-learning-platform/#life-check)可開啟。
- UTC01:17:35正式HTTP通過：136份shell逐檔SHA256、JS MIME、SW fingerprint相符；146次原音檔抽查（原128次＋起步／N5／N4／N3／N2生活卡18次）。Node直連遇ECONNRESET／connect timeout，改用PowerShell Invoke-WebRequest預設TLS驗證完成全部抽查，沒有停用憑證驗證；此成功輪無重試。
- 正式隔離QA走完L07三題：不先看參考，聽解一般音檔後正答仍為無提示；暫停收起卡片、刷新續接同一ID；第二題明示提示與日文填空，第三題未提示，最終3題首答正確／其中2題無提示／1題用提示。隔天頁維持尚無較早日期題目的誠實空狀態，未注入虛構歷史。
- 既有五十音兩題與三題口袋結果仍為0/2（2提示）與0/3（3提示）；原輪與新生活輪互不覆寫。正常個人資料庫未作答或改動，隔離QA沒有清庫／快取／SW。
- 正式390／320px記憶卡無橫溢；320px新按鈕48px以上。Enter展開後同卡focus與aria-expanded正確，console warn/error空。既有舊離線分頁正常重新載入、短暫離開網站後取得新版，不清資料。
- 截圖留在ignored `work/life-public-390.png`、`work/life-public-320.png`；HTTP紀錄`work/life-public-http.json`，本機`work/life-local-320.png`。QA分頁與本機18124伺服器已關閉。實機、真實隔日學習效果與獨立教師審校不由上述測試推論完成。
