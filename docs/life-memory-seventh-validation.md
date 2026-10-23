# 生活日語記憶第七批驗收（v0.28.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-seventh.md)。本批加入同主題、程度上限內的跨課原題回想；沿用92課436原題，沒有新教材、題目、音訊或依賴。

## 實際範圍

- life-topic及life-topic/<ceiling>：20主題目錄，真實可用課數／練過課數／最多題數。L→N5→N4→N3→N2上限（預設L），主題／上限留URL，刷新及返回不丟選擇。無答案、課名答案線索、個人正文或參考曝光。
- life-topic/<topic>:<ceiling>：只用cutoff內實際練過的原qid，從有效維度attempts重建reviews，最近錯答／提示→到期→其他已練、較早作答／qid穩定排序；去除同unit，最多三課各一題，同主題且不超上限。無歷史不塞新題，單課明示、未知值有復原入口。
- 新source life-topic、reference=topic:ceiling，嚴格驗證1～3唯一qid／不同unit／同主題／程度上限／原題queue；不插訂正變式。raw/canonical共用主題對照，不改原題／schema3。共同pending、lifeHints、首答、備份、筆記／草稿、地圖／每日收尾均延續。
- pending先接同UUID並遮蔽選單／開始控制；連按鎖、過期reference／route epoch、成功才導航、失敗可匯出。結果標實際課／題數，接各原課三句／卡片／能力／線索及原topic URL，原輪回顧及最近輪辨識新source。

## 自動測試與獨立審查

新增17項先紅再綠測試，完整 `npm test` **590/590通過**。涵蓋92課metadata、100種主題上限、只取已練／不同unit／三題上限、cutoff／唯讀／review重建、弱點與到期排序、錯誤reference／qid／queue、共pending／備份／提示／原首答／每日收尾、目錄真數字／單課／無正文、來源路徑與結果／HTML、連按／延遲離頁／quota候選／上限URL。

獨立核心審查：生活138/138，全92課436原題raw/canonical原值一致，43,600組單題主題／程度驗證及100組建立輪次／state／正規化備份往返通過，個人線索與草稿保持。獨立UI/controller審查：17/17，另以貼近main的串行queue、fn後阻塞實際落盤、quota待存候選驗證成功／失敗／離頁返回3情境，皆成功前不導航、連按一輪、失敗可匯出、epoch不拉回。兩者無P2以上阻擋，未操作瀏覽器或修改檔案。

`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點。208卡／508筆順／10947音檔索引／176生活字串檢查通過。156份shell，fingerprint `871a57eca6b08fff9aeacb2f111c106c40768a547978ee2b22891b39c47a57a2`。

## 本機實際操作

隔離QA `http://127.0.0.1:18124/?qa=1#life-topic`：目錄20主題→N5上限→購物空歷史→刷新保留shopping:N5。用實際UI完成L03聽解原輪 `7bf39b9e-8030-49ff-8f18-5ba25b72ed60`（0正確／0提示），目錄變1已練課，單頁明示只有1課。再完成L08原輪 `967200d2-764e-4f3a-96dc-50ce614f496c`，變2已練課，開始2課各1題。

主題原輪 `80538b7e-7ed6-4330-960a-ad9f504ebd12`：第一題提交後刷新，原選項禁用與原答案保留；暫停主題頁只接同UUID，第二題確為另一課。完成2題／1正確／2提示／0無提示；結果分別接L03／L08卡片／能力／線索，逐題回顧可回shopping:L。切N2上限URL為shopping:N2，真實範圍6課／練過2課／仍2題，沒有更難新題。

L07第六批已保存中日文線索可展開恢復；舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2首答正確／3提示／0無提示，原紀錄未改寫。單頁320／390／768／1024／1440px無橫溢；選單／開始均48px，Tab可見outline、路由main聚焦。20主題目錄320px無橫溢，Tab接主題卡有outline；console warn/error空。截圖ignored `work/life-seventh-local-390.png`。

UTC04:22:16本機156份shell逐檔SHA256／JS MIME／SW fingerprint及146次原音HTTP通過，1次暫時連線重試；紀錄ignored `work/life-seventh-local-http.json`，預設TLS驗證。未清DB／快取／SW、不改時鐘、不注入跨日歷史，所有答題用隔離QA。個人資料與QA不提交Git。

桌面寬度不是iPhone／Android實機或OS日文鍵盤驗收；教師／真人審校、新情境遷移與真實長期記憶效果未由本批推論完成。回退先匯出JSON，舊版可能不認life-topic；保留DB與備份。

## 發布驗證

- [PR #40](https://github.com/linhercherng/japanese-learning-platform/pull/40) head `d19c7c55ff1852e629c8bdeadab95f18a826d898`；同head [CI39900147747](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39900147747) completed/success後按match-head合併，merge `ec827f84f622832656630b56585c2d3fba102c13`。
- [Pages39900282526](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39900282526)整體completed/success，build及deploy均success，deploy job UTC04:27:01（台北12:27）完成。
- 正式[主題目錄](https://linhercherng.github.io/japanese-learning-platform/#life-topic)及[主題回想](https://linhercherng.github.io/japanese-learning-platform/#life-topic/shopping:L)可用。UTC04:28:19正式156份shell逐檔SHA256／JS MIME／SW與146次原音HTTP通過，0重試，fingerprint與本機相同；預設TLS驗證，紀錄ignored `work/life-seventh-public-http.json`。
- 更新前用既有正式版隔離QA實際完成L03原輪 `51c50aed-01ae-4134-a74f-d347030204d5`（0正確／0提示）與L08原輪 `8cce05af-b065-43cc-9874-567f273d18a6`（1正確／0提示）。正常分頁重新載入下載新shell後暫離網站，依正常SW生命週期接手；不清DB／快取／SW。新版主題頁讀到2已練課，N5選擇與刷新保持shopping:N5。
- 主題原輪 `19b591fb-2e6d-4959-854f-d1e967ae988d`：第一題提交後刷新保留禁用原選項／已提交答案；暫停主題頁遮蔽控制，只接原UUID。手機分頁同隔離QA庫接原輪第二題，完成2課2題／2正確／2提示／0無提示。結果接各原課卡片／能力／線索，逐題回顧回shopping:N5。
- 新加練後L03原輪仍0正確／0提示；更早L07首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3首答正確／2無提示／1提示。第六批L07中日文已保存線索可恢復。food:L真實1課單課文案、N2目錄20主題均正確。
- 正式320／390px主題頁無橫溢，選單與開始均48px，Tab接開始有可見outline；console warn/error空。截圖ignored `work/life-seventh-public-390.png`。背景QA分頁的viewport override未套用時，先讀DOM確認仍1280px；改在既有可調尺寸分頁使用相同?qa=1 URL，讀DOM確認320／390px後才採計手機證據。
- 回正常URL後只查看目錄及真實空課狀態，不寫個人答案／線索，不開參考。正常庫仍20主題／預設L／已練0課，正式入口截圖ignored `work/life-seventh-public-entry-390.png`。所有新作答與線索操作皆在?qa=1隔離庫；離開QA／關臨時QA與18124伺服器、恢復視窗尺寸，正常正式目錄保留。
- 第一至第六批均保留並一同發布。實機／OS日文鍵盤、教師／真人審校及真實長期或新情境效果仍未由本次推論完成。
