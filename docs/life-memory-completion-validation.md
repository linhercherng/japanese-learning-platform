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

PR CI／合併／Pages、正式HTTP／正常SW及隔離UI尚待完成後補記，未提前宣告發布。
