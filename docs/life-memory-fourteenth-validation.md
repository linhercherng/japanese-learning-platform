# 生活記憶第十四批驗收（v0.35.0）

2026-10-23，Asia/Taipei。[規劃](plans/2026-10-23-life-memory-fourteenth.md)。差異小補練沿用276原句與已展開的Unicode差異，先補一小段再接整句回想。無新教材／音檔／題目／外部服務／依賴／schema或作答source。

## 範圍與保護

只在一處差異提供遮住補回，同時收起原／己片段，只留前後最多4碼點定位。片段input/form/IME分流，300字、保留空白，輸入不重繪、不寫DB／latest cache／曝光／作答，離開／刷新清暫存並明示整句草稿保持。主動核對才揭兩側，空側明示，字元相同或差異不是文法／翻譯評分。空submit停用，永遠提供明示「這裡不需要文字」，不因空正解而透露線索。

可再遮試一次／回同一處差異／整句從空白再想；重開整句不先改原稿或舊LB。pending全遮蔽接原UUID，busy／ref／epoch／IME與原首答／備份／失敗可匯出保持。沒有共同定位時提醒該處可能含整句，片段不是詞彙／文法切分。

## 自動測試與獨立審查

新增15項。最初13項10fail／3pass→13/13；完整700/700通過後獨立審查抓到一項P2：IME中pointerdown可能觸發blur→compositionend，隨後click／submit因composing已false而誤核對。新增回歸先RED1/10fail；pointerdown記當刻狀態，click（含原生submit）preventDefault或直接submit消耗鎖，pointercancel／下一次pointerdown／route清除，修後相關20/20、獨立複核25/25通過。覆蓋核對submit／native click、空回答、返回、整句重想五情境，以及後續明確操作與取消指標後正常submit。不是OS鍵盤實機驗收。

最終完整 **702/702通過**；build→check、audit **0弱點**。208卡／508筆順／10947音檔索引／176生活字串檢查通過。最終160份shell fingerprint `f41750c08143511c0f8067051da2c95cc65ba6c59349f6a27c3b8f50590b55b2`。UTC08:33:51本機逐檔SHA256／JS MIME／SW與146原音HTTP通過，1次暫時重試、預設TLS驗證，ignored紀錄work/life-fourteenth-local-http.json。276原句全量音檔索引／檔案驗證屬自動測試，不宣稱全部做HTTP。

資料獨立審查生活248/248，LR／LD各四種文字／異文／空白／300字邊界，補練／核對／重試／返回均零DB/cache寫入，備份保持；原LR／LD／LB／LN／作品／首答及pending保護通過。UI審查重現P2後定點複核解除，另main-style structuredClone串行update驗證IME本次按壓不揭不重繪、下次明確操作正常，state及writes不增加。兩審查無剩餘阻擋，全程唯讀、無瀏覽器操作／改檔／發布。

## 本機瀏覽器

全部新文字／作答只在18124/?qa=1隔離庫，不清DB／快取／SW、不改時鐘或注入歷史。

- LR沿既有再想稿對照→一處→遮住，原／己片段均收起。輸入異文→核對顯差異，再遮→補回原字顯相同；核對前不露原字，核對後focus至結果標題。展開三句導航不重繪input，日文／emoji保持。
- 片段有字時刷新先收起，不恢復暫存；再想稿原文字完全保持。重進補練為空，接整句空白時仍空；未輸入整句退出不改舊LB，原LR也保持。
- LD原稿保持。另以整句前方多字製造空原片段，遮住時不透露空答案，明示空回答核對相同；輸入一個空白字元可核對並顯文字不同，不被trim或混為空回答。console warn/error空。
- 補練編輯器320／390／768／1024／1440px無橫溢，textarea18px，核對48px、其他控制49px；Tab至核對有solid outline，focus／sticky避讓正確。ignored截圖work/life-fourteenth-local-390.png。
- 未完成輪 `20ece471-0061-49e4-a525-96e65a3d8ad7` 全遮蔽新控制，只接同UUID，完成1題／1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2正確／3提示／0無提示，第六批L07中日文線索保持。

實機iPhone／Android、OS日文鍵盤、教師／真人審校與長期成效仍未由本批推論。個人資料與QA不提交Git，回退先匯出JSON保留DB。

## 發布

待同head CI／合併／Pages、正式HTTP／正常SW與隔離UI通過後補記；尚非發布完成宣告。
