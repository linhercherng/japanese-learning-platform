# 五十音提示歷史驗收（v0.40.0）

2026-10-24，Asia/Taipei。[完整規劃](kana-hint-history.md)。

## 邏輯與獨立審查

資料簿、跨日／七日證據、實際V2／V3控制器、V1整合、一般參考偵測與UI均以失敗回歸後修正。涵蓋舊schema、未來／同時事件、legacy不足、備份合併、60000容量、quota失敗與重試、首答不改寫、時間線分頁及唯讀。獨立核心與整合審查發現的問題已修正：詞例頁漏記、默寫hint分類、native details／描寫／對照漏記、回饋保存前洩露、記憶地圖判定與週回顧不一致、離頁回來重試入口消失，以及地圖重掃歷史。

複核同一合法1000跨日答案＋6000參考事件，map從13.148秒降至505ms；12組新舊函式比較208卡結果一致且state未變。另有事件讀取次數上限回歸，避免機器速度影響測試。核心49與整合20相關測試、最後小修複核均無剩餘P1/P2。

## 本機實際流程

18127的隔離QA庫，由網站備份介面匯入v0.39備份（45答案／28輪／10草稿）；未以腳本注入瀏覽器狀態。初次發現舊UI白名單誤擋生活草稿，新增RED→GREEN與已知課程白名單後可正常匯入。匯入後attempts／v3／drafts逐字相等。時間線翻頁與weekly查看後，全state完全相等，沒有因讀報表建立事件簿。

同一個新隔天檢查輪，依介面提交無提示錯答、無提示正答、提示後正答三題；回饋先保存，正答仍列跨日記憶證據，提示題列需複習。另經原詞例、書寫收起／對照／描寫、展開46字表、V1提示與首答。匯出核對原45答案、28輪、10草稿與作品均相等；只新增4答案與1輪，事件hint5／feedback6／reference153／answer4／legacy63，來源含page:kana-words／writing:compare／writing:trace／details:kana／v1／v3。原題序與既有pending未變。最後發現實際非同步時鐘會使一次提示重複寫入，新增時鐘推進回歸（RED→GREEN）後以同visit/key準備時間去重；再次實際UI驗證第四題只新增一筆hint。離頁返回則是新的揭示，獨立複核仍另記一筆。舊教練測試harness也補上實際onRoute／afterRender保存屏障，避免跳過真實非同步階段。

320／390／768／1024／1440 × 時間線／weekly／weaknesses共15組：無橫溢、main h1各1、所有可見主內容控制至少44px。390px實看排版；320px 19px大字無溢出。Tab到第一個時間線返回入口有solid outline，位置在可視範圍。console warn/error空。還原15px與預設viewport。

本機備份、測試log、版面紀錄與HTTP結果留ignored work/，不把測試答案或私人文字提交GitHub。正式正常庫與隔離QA已經網站匯出升級前備份，發布後再驗全state。

## 發布驗證

新增54項，全站882／882通過；最終build→check與audit通過（0弱點），208字卡／508筆順／10947音訊索引／176生活字串檢查通過。178 shell檔 fingerprint `f8c215a0e07b3e78f34aa308ef48591b64fd873b3c33d9df6623f2dea8a550e1`；本機逐檔SHA256、JS MIME、SW與10原音HTTP抽樣全通過（最終本機1次重試）。


PR [#53](https://github.com/linhercherng/japanese-learning-platform/pull/53) 最終head `34c9fcc39a1ef34a6fc03dc3f4ba3dce023183b6`，CI [40044162896](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40044162896) build success、PR deploy依規則略過。UTC00:18:31合併為 `689e7a787b235c44d7241b150cb9ce384bf384dd`，tree與已測head一致。Pages [40044324634](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40044324634) 同merge SHA的build／deploy／整體success，deploy於UTC00:19:54完成。

正式URL https://linhercherng.github.io/japanese-learning-platform/ ，UTC00:20:40經PowerShell預設TLS驗178 shell逐檔SHA256／JS MIME／SW與10原音HTTP抽樣通過，1次暫時錯誤重試後成功，fingerprint與本機f8c215a0一致（work/kana-history-public-http.json）。此為音訊抽樣，非全量真人審音。

正常PWA先仍用舊完整shell，等待新shell自然下載並暫離舊頁後，正式kana-history顯示新五類時間線；未清DB／cache／SW。正常僅1舊提示、QA63舊提示，無新首答檢查點，不替舊答案補造證據。weekly新增分類摘要與時間線入口；正常原pending連0e1aef73-23a9-4da6-a47f-d8f7f7acfec5，QA連909b78fa-54ee-48a8-b9e0-8ebaa3502d02，未進入個人原題或提交測試答案。

正式時間線翻頁第2／4頁、單字深連結、weekly與weaknesses通過；五寬三頁共15組無橫溢、每頁單一h1、所有可見主內容控制至少44px。console warn/error空。正常及QA由UI匯出升級後備份，parseBackup整份state分別與before深比較完全一致：正常1作答／1輪／0草稿，QA45作答／28輪／10草稿，連optional事件簿都未因唯讀而持久化。ignored證據work/kana-history-normal-before.json／after、kana-history-public-qa-before.json／after與public-layouts.json。

正式截圖work/kana-history-public.png及390px版；已恢復預設viewport，保留正式時間線頁。本機18127驗收server停止，未清學習資料。最後僅[skip ci]補推文件；正式部署仍為上述已驗證merge SHA，文件main與遠端另核對一致。實機OS、教師與長期學習效果仍待外部證據；回退先保留新版完整備份。
