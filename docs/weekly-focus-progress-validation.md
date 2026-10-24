# 七天重點追蹤驗收（v0.44.1）

2026-10-24。實作、修正與正式發布驗證已完成；規劃見[完整規格](weekly-focus-progress.md)。

新增58項核心／UI／控制器回歸，均先RED再GREEN：六軌首答、提示、同日訂正、跨日改善、維持、期間截止／午夜／未來、備份相容／分支衝突、唯讀、候選變動、保存失敗、離頁與重按。首次核心36／36、整合126／126通過。

獨立核心審查71相關測試與45原API邊界案例通過，含較早提示合併可撤銷改善、期間後新答案不改期間結果、再次錯答、容量260與超額／衝突拒絕。獨立整合審查77相關測試通過，修正兩項P2：其他五十音能力等待不擋已到期詞音入口；詞音入口與實際到期追蹤字一致。兩項各有先失敗後通過回歸。

完整test／build／check／audit、本機IAB與正式Pages結果見下列證據；桌面尺寸測試與合成QA不代表手機實機或真人長期成效。

## 本機與資料驗證

- 全套npm test：1,153／1,153，新增58項；npm run build／npm run check／npm audit --audit-level=high通過，0漏洞。208字卡、508筆順與10,947原音訊內容檢查通過。
- 188份shell逐一HTTP200、SHA-256、JS MIME，SW fingerprint與六區10份原音訊抽樣通過，零重試。fingerprint：8f193340f1eb18b2d305a80599b4e7a07042ebaac9f0520ce4cac0ee7922bb7e。
- IAB隔離QA匯入舊45首答／28原輪／10草稿，查看首頁、週報、重點後，完整state與預期合併結果相同，沒有虛構追蹤欄位或新增答案。
- 另建10首答／2原輪／1草稿案例，透過實際按鈕保存5個原題目標，重整與五寬查看後只新增1組固定追蹤及revision，所有原內容逐一相同。
- 從首頁開始2題到期N2原check：第一題無提示正確，重整接同輪；第二題答前提示後正確。完成回週報顯示已練2／5、弱點已改善1、仍需複習2；追蹤的5個原題身份保持，原10首答／2原輪／草稿逐一保留，只增2首答及1輪。首頁顯示目前3項待鞏固／確認，同時保留當日完成休息。
- 新追蹤備份parse往返通過；把原舊備份合回新進度，追蹤與全部內容保持。另一個刻意組合的舊提示分支因與首答衝突遭拒，取消後完整舊state保持，未降低既有保護。
- 320／375／390／768／1440共15頁（首頁、週報、能力重點）無橫向溢出、單一h1，主要操作至少44px。320大字19px通過；Tab有可見外框，console warn／error空。逐題明細收折，摘要只呈現少量成果與下一步。

正式部署與升級後個人／QA庫唯讀比較見後續發布紀錄。新可選欄位儲存後，回退須使用認得weeklyFocusPlans的相容版本並保留完整備份，不直接清空或降版讀取。

## 首次發布與正式驗收

[PR #57](https://github.com/linhercherng/japanese-learning-platform/pull/57)的[同head CI](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40058608321)成功，合併32ff128a215550d159efa1468cdd59af4f9d60ac與測試樹相同。[Pages build／deploy](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40058710729)於2026-10-24 11:33台北成功。正式188shell逐一HTTP／hash／MIME、SW fingerprint與10原音訊通過（1筆重試），與本機相同。既有舊頁下載完成、離開再回後自然顯示追蹤畫面，未清除快取／SW／IndexedDB。

正式首頁／週報／重點五寬共15頁無溢出、單一h1、主要操作44px以上；正常庫1首答／1輪／0草稿和QA庫45首答／28輪／10草稿，升級前後完整state（含revision）深比較相同。另只在正式QA明確保存一組9目標，重整及匯出後完整state等於預期原API結果，只新增1組追蹤與revision，所有原答案、活動及草稿保持；正常庫未新增任何測試答案或追蹤。

正式驗收發現UI把「狀態為未練」的互斥分類數字當成未練總數，9弱題未練時出現0／9已練與未練0；v0.44.1改為total-practiced，並明示完成與記憶狀態分開。新增失敗回歸後51相關測試通過；原核心資料與證據不改，修正版完整測試、部署與再升級結果見末節。

修正版本機完整驗證：1,154／1,154（累計新增59）、build／check／audit通過，0漏洞。188shell與10原音訊HTTP／hash通過；IAB原已保存案例顯示已練2／5、未練原題3、改善1／仍需2，320／390／1440不溢出。獨立覆核51核心與UI回歸通過，無P1／P2；正式修正版部署結果見末節。

## v0.44.1 最終發布與資料保留

- [PR #58](https://github.com/linhercherng/japanese-learning-platform/pull/58)已合併，[同head CI](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40059219324)對0485da0eb593a97521da55fabb04f2a793732658成功；合併f8d467c7d5d429b630e271318c86d09025ef7f35的app與測試樹相同。
- [正式Pages build／deploy](https://github.com/linhercherng/japanese-learning-platform/actions/runs/40059357082)於2026-10-24 11:43台北成功。188shell逐一HTTP200／SHA-256／JS MIME、SW fingerprint與10原音檔通過（1筆重試）；最終fingerprint：d6d4cab46e5460372297fec32fb89845a5a84e23070c21618d00f04b4b841e99。採預設TLS驗證，無跳過憑證。
- 正常分頁完成離線註冊與下載，離開再回後自然啟用修正版，未清除SW／快取／IndexedDB。正式QA顯示已練0／9、尚未練原題9、仍需複習9，完成與記憶狀態分開；320／375／390／768／1440均不溢出、單一h1、主要操作44px以上。console warn／error空。
- 最終正常庫與最初升級前完整state深比較相同（1首答／1輪／0草稿）；最終QA與明確保存追蹤後完整state相同（45首答／28輪／10草稿、1組9目標），原首答、活動、提示事件、草稿及revision都保持，沒有額外測試答案。
- 保留正常正式週報分頁並恢復viewport；18134／18135測試伺服器已停止，0監聽。最後文件補交不改已部署app或素材。

[正式網站](https://linhercherng.github.io/japanese-learning-platform/#weekly)可按「追蹤這組重點」開始。未明確保存的舊建議不捏造追蹤歷史。桌面IAB、合成QA與尺寸證據不代表iPhone／Android實機或真人長期學習成效。
