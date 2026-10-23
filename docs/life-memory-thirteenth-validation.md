# 生活記憶第十三批驗收（v0.34.0）

2026-10-23（Asia/Taipei）。[規劃](plans/2026-10-23-life-memory-thirteenth.md)。承接已發布第十二批逐句清單，本批補一處差異與對照後空白再想，沿用92課276句，無新教材／音檔／題目／依賴／schema或評分source。

## 範圍與保護

- 相鄰own／original差異分一處，各保留最多4個Unicode碼點共同前後定位；插入／刪除空側明示，不裁掉空白。按需才進一處頁，可上一／下一處、回完整，界限不越過；文字相同沒有無效入口。片段不是詞彙／文法切分，差異不評翻譯或作文；不另外顯完整原句／讀音／音訊，但全句不同時單片段可能涵蓋全文。
- 全部對照狀態可收起答案從空白再想，只改暫存buffer／comparison／hint／index。原LR／LD與舊LB皆不動，輸入才更新該句該模式LB；未輸入退出仍可接回上次LB。差異切換及重想不新增作答／曝光／得分，原compare已durable保存參考。pending原UUID／busy／epoch／ref／IME、latest cache與失敗可匯出保持。

## 自動測試與獨立審查

新增14項：核心4項RED→GREEN；UI/controller初6fail／4pass→10/10。完整 **687/687通過**。核心獨立審查生活235/235，額外6306組全部原句／增刪換／重複字／空側／Unicode／空白及界限通過，前後定位鄰接且各最多4碼點，不改state或保存欄位。

UI獨立審查相關50/50通過，另main-style serialized structuredClone→fn→延遲write／unsaved/cache成功與quota兩情境，確認切差異／重想不改稿，新input只存同模式LB，quota候選保留新LB與原LR可匯出。兩審查無P1/P2。全程唯讀、未操作瀏覽器或發布。

build→check完成，audit **0弱點**；208卡／508筆順／10947音檔索引／176生活字串檢查通過。UTC07:55:23本機160份shell逐檔SHA256／JS MIME／SW與146原音HTTP通過，1次暫時連線重試，預設TLS驗證；fingerprint `9af18b876fd610d9b2329debb1bae6e1e20ec059c8ae90b0ec825458989afb53`。ignored紀錄work/life-thirteenth-local-http.json。276原句全量音檔索引／實體檔案驗證屬自動測試，不宣稱全部做HTTP。

## 本機瀏覽器

只在18124/?qa=1隔離庫操作，不清DB／快取／SW，不改時鐘／注入歷史。

- LR從空白輸入日文／emoji，完整對照→一處視圖實際有4處；第1處為缺少長音，空側與共同前後定位正確。下一處／上一處及回完整保持原文字，focus到差異標題。不是文法判錯。
- 收起答案從空白再想，textarea空、沒有舊文字或答案，focus正確；未輸入收起→接續仍回上一份LB。重新輸入→保存→刷新先收起→接續正確。原LR保持既有字串，原LD也保持。
- LD原稿與原句相同時不出一處入口，仍可收起答案從空白再想，原LB未先刪除。雙模式原稿不覆寫。未完成輪 `bf379d98-7c65-4c3a-8796-a967c5a0da87` 全遮蔽差異／稿，只接同UUID，完成1題／1正確／1提示／0無提示。
- 一處頁320／390／768／1024／1440px無橫溢，重想48px、其他控制49px；標題focus／sticky避讓保持，Tab到提示有solid outline。console warn/error空，ignored截圖work/life-thirteenth-local-390.png。前十二批資料與舊首答／L07線索驗收同輪保持，見第十二批紀錄。

桌面尺寸／IME事件不等於iPhone／Android實機或OS日文鍵盤；教師／真人審校與長期成效仍未由本批推論。個人資料與QA不提交Git，回退先匯出JSON保留DB。

## 發布

待同head CI／合併／Pages、正式HTTP／正常SW及隔離UI通過後補記；尚非發布完成宣告。
