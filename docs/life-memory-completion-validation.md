# 生活日語記憶完整整合驗收（v0.36.0）

2026-10-23，Asia/Taipei。[完成矩陣](life-memory-completion.md)、[計畫](plans/2026-10-23-life-memory-completion.md)。一次收尾生活記憶程式功能，不再分批。

## 範圍

life-path重用lifeNextStep；life-guide六段路線；life-workspace從LR／LD／LB／LN／lifeNotes唯讀建立metadata索引。搜尋原稿、再想稿、已保存／待存線索但不回傳其文字，按需搜尋、四種篩選與10筆分頁，空白稿保持。所有舊編輯頁仍先收起，無DB／cache／曝光／作答寫入。IME與pointerdown→blur/compositionend→click/submit保護，過期route／pending／dispose不操作。

無新教材／音檔／題目／依賴／保存欄位／schema／作答source；schema3／原首答／提示／作品／草稿／備份保持。教師／真人／實機／OS鍵盤及長期成效仍另列未驗證。

## 測試與審查

核心6項先RED6fail，GREEN時發現測試誤將兩次exportedAt當成資料差異，修正為比較備份state，再6/6通過。UI與controller11項先RED11fail→11/11；合計新增17項，最終完整 **719/719通過**。build→check成功、audit **0弱點**。208卡／508筆順／10947音檔索引／176生活字串檢查通過。164份shell fingerprint `95721e7b3c960f87ada0fcaba79ba9e485592ccb052525f33d047288720241e3`。

核心獨立唯讀審查67/67通過，另全量合法並深度凍結92課、276句雙模式與再想稿、92份線索／空白草稿，644筆65頁無遺漏／重複；搜索與修改回傳metadata不改原state，前後備份state相同。UI獨立唯讀審查17/17通過；另獨立驗證reset／page／原生submit的compositionstart→pointerdown→compositionend→click同次手勢被阻擋，下次明確指標操作正常，state不變。QA後兩個返回連結定點複核通過，pending仍先return、無新連結或內容曝光。兩審查均無P1／P2阻擋、未操作瀏覽器／寫檔／發布。

## 本機與正式發布

本機18125空隔離庫0筆空狀態正常，之後回18124原隔離庫驗證舊資料，未清DB/cache/SW。原有10筆metadata，搜索「コーヒーを二つ🍵」找到原LB-R L07:0，點進去仍收起，主動接續恢復同文；LR原稿仍「コーヒーを一つ。🍵」。待保存線索篩選找到L08空白草稿。N2空結果可清除復原；<img src=x>🍵只當文字，main沒有img，focus移結果標題。搜尋前輸入不重繪原結果。

只新增一份L01:0實際輸入稿「分頁驗收：あいさつ🍵」，11筆每頁10筆、下一頁1筆、上一頁回原10筆，刷新仍11筆。原生活線索可搜「午休買飲料」找回，沒有預覽文字。新增pending `0c283347-ae25-42d2-b6b9-57120137c6d0` 時練習簿無form／metadata，今日路線接原UUID，完成1題1正確1提示0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2正確3提示0無提示。

首頁三入口可用、今日已完成顯收尾、六段指南及刷新麵包屑保持；句子頁回練習簿連結實際通過。練習簿320／390／768／1024／1440px實際innerWidth確認、無橫溢；input18px、input/select/搜索48px、清除與分頁49px；Tab到程度有solid outline。今日路線320／390／1440px及指南320／1440px無橫溢，console warn/error空。ignored截圖work/life-completion-local-path-390.png。

最終UTC09:25:21本機164 shell SHA256／JS MIME／SW及146音檔抽樣HTTP通過，0重試、PowerShell預設TLS；ignored記錄work/life-completion-local-http.json。全量素材測試不冒稱全量HTTP或真人審音。所有QA文字／截圖留ignored work，不混入正常資料。

PR [#48](https://github.com/linhercherng/japanese-learning-platform/pull/48) head `431f18233f812c0df2cad4739d3935e8525532d4`，CI [39931939209](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39931939209) success。UTC09:28:18合併為 `73716b7a872a7299212f7149f44fc12f7796faec`。Pages [39932099508](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39932099508) 同merge SHA，整體／build／deploy success，deploy UTC09:29:33完成。

正式URL https://linhercherng.github.io/japanese-learning-platform/ ，UTC09:31:21預設TLS驗證164 shell逐檔SHA256／JS MIME／SW fingerprint及146音檔抽樣HTTP通過，1次暫時重試；ignored證據work/life-completion-public-http.json。正式fingerprint為上述95721e。正常profile初始化、正常reload等待SW安裝、暫離舊client後進隔離庫，實際三個新route與返回連結出現，沒有清DB/cache/SW或強制skipWaiting。

正式?qa=1索引原有8筆，搜索原LB-R「コーヒーを二つ🍵」命中同句、主動接續仍同文字、返回清除恢復8筆。聽寫＋有文字再想稿篩出2筆；開原LD仍「コーヒを一つお願いします。」。搜索「午休點飲料」命中原LN，展開仍「午休點飲料，先想一杯與外帶。コーヒーを一つ。」；兩模式與線索返回練習簿均正常，沒有新增或改整句稿。N2空結果清除復原，刷新仍8筆。正式本批未新增客觀作答；舊首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3正確2無提示1提示。

正式練習簿320／390／768／1024／1440px無橫溢，input18px，最小控制48px；完整指南6段與刷新麵包屑保持，隔離今日路線正確顯已完成可收尾。正常資料庫練習簿仍0筆，首頁入口進今日路線為未練新場景，未填寫個人資料。console warn/error空，ignored正式正常入口截圖work/life-completion-public-path-390.png。最後保留正常life-path、恢復viewport、停止18124 server；此後只補文件，不改已發布app，文件push後以Git確認本機與遠端一致。
