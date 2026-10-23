# 五十音記憶第十五批驗收（v0.19.0）

日期：2026-10-23（台北）。[規劃](plans/2026-10-23-kana-fifteenth.md)。

## 交付

錯字雙卡接上新一輪雙向聽辨，兩字各做一次目標，先問原選字再問原參考字，兩選一首答／提示／中斷保存。入口不預覽字音與線索；同字、異script、同音或未知字不出題。兩種口袋聽辨合計最多一輪pending，未完成口袋聽辨也先接續。新輪不依賴原session持續存在，返回同一雙字入口再回口袋；原錯答與自評不改。

source=kana-contrast，reference=兩個kana ID，kp動態題兩方向；strict題序、queue剛好兩題無repeat。schema3延續，舊source與ID不改。兩字同日／本輪任一提示會另列hinted；答後／明示提示的實際解說與個人線索同步曝光、七日未答題、默寫草稿及cache。新聽辨pending時原回顧整頁遮蔽。

## 驗證

本批新增19項核心、UI、真控制器測試；主要流程與共用pending先紅後綠，並補驗全新起輪保存失敗，覆蓋有效配對／208字字音、同音拒絕、單pending／strict queue、備份合併與衝突、原首答／自評不變、兩字提示時間界線、入口與無預覽、來源路徑、刷新／連按／過期／延遲離頁／失敗匯出、七日與默寫快取。最終完整npm test **415/415**通過，npm run build後npm run check通過，npm audit --audit-level=high為0 vulnerabilities。

核心獨立審查78項相關回歸無確定P1/P2，提出兩類pending的規格歧義；收斂為合計一輪，補反向start與備份合併／原口袋UI回歸先紅後綠。共用pendingPocketActivity供原口袋控制器與視圖使用，兩種start雙向守護、validateV3合計限制；獨立複核59項通過。UI獨立審查32項相關回歸無P1/P2，原首答、提示曝光與七日／默寫cache整合確認。

## 瀏覽器與發布

本機內建瀏覽器127.0.0.1:18121/?qa=1獨立QA庫，只用可見UI留下あ一字，原口袋聽辨刻意選ゆ錯答。由原結果逐字回顧展開あ／ゆ雙卡，進入不含字音／線索的雙向聽辨入口，空白鍵可開始新輪。

新兩題固定先ゆ再あ，每題正常／慢速兩音鈕與兩選項。剛看過雙卡的兩字均顯示同日提示警語，解說答前收起。第一題ゆ正確，刷新後同UUID／首答與disabled選項保留；2/2暫停返回入口，再回原口袋只提供接續錯字雙向聽辨，字卡／音鈕與另起口袋輪入口收起。原逐字回顧深連結也遮蔽，只接續同輪。第二題明示提示後刻意選ゆ錯答，完成0/2無提示、2題提示，沒有repeat。

完成回同字對入口，最近結果保留；口袋仍1字。原回顧依然あ、原選字ゆ、首答答錯／用過提示，沒有被新輪答案改寫。320/390px共9個入口、題目、pending、原回顧遮蔽、錯答回饋與結果狀態，無橫溢，main button/select/primary至少44px，console warn/error空。ignored work/fifteenth-qa/local-layout.json；保存失敗、備份衝突、七日與默寫cache以Node真控制器驗證，未注入瀏覽器DB或製造容量失敗。

本機126份shell SHA-256、JS MIME與SW fingerprint一致，128次既有音檔HTTP抽查通過；2026-10-22 23:51:30 UTC（台北10/23 07:51）。fingerprint `bc45fc2a0a60ea7ea5b4622bc94057fb43c567c3eb6c70af09ecb11d7d8df5d6`，ignored work/fifteenth-local-http.json。

已經[PR #31](https://github.com/linhercherng/japanese-learning-platform/pull/31)發布。PR head `0362b82b6fd22c9477f4a79cb7d12bd1c92d087a` 的[CI run39874695588](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39874695588)整體completed/success，build的測試／建置／校驗／audit通過，PR deploy依設計略過；按同head合併為 `377b776b02698dc20d2ecfe283632d3d44132aa5`。[Pages run39874860680](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39874860680)整體completed/success，build/deploy皆success，部署完成2026-10-22 23:56:05 UTC（台北10/23 07:56）。

正式HTTPS 126份shell SHA-256、JS MIME與SW fingerprint一致，128次既有音檔抽查通過；2026-10-22 23:57:11 UTC（台北10/23 07:57）。fingerprint與上述本機版本相同；ignored work/fifteenth-public-http.json保存結果。

正式隔離QA從既有原錯答「パ選成ベ」展開雙卡，再進入無字音預覽入口，空白鍵起輪。先ベ、後パ，每題兩音鈕及兩選項。第一題正常／慢速播放後選ベ，顯示提示後答對；刷新保留同UUID、首答與disabled選項。第二題暫停回同字對，再回口袋只提供接續同輪；原逐字回顧深連結也遮蔽字卡與解說。從此接續仍是同UUID的2/2，明示提示後刻意選ベ錯答，完成0/2無提示首答、2題提示且沒有repeat。

完成回同一字對入口可看最近結果；口袋仍3字。原回顧仍為パ、原選字ベ、首答答錯／用過提示，原輪結果仍0/3無提示首答、3題提示。正式320/390px共9個入口／題目／刷新回饋／pending／原回顧遮蔽／錯答／結果狀態無橫溢，main button/select/primary至少44px，console warn/error空。ignored work/fifteenth-qa/public-layout.json與public-390-listen.jpg保存測量和正式頁截圖；QA分頁關閉、尺寸重置，正常個人資料未寫入，正式網站分頁保留。本機server已停止，QA資料及截圖未提交公開Git。

## 邊界與回退

沿用208卡、508筆順、10947音檔索引及K包668檔，無新依賴或外部素材。既有試用訣竅／合成音仍待獨立教師審校；兩選一當天加練不是跨日掌握，不推論手寫／真人發音。實機依先前決定略過。舊版可能不識別新source與kp題，回退前匯出JSON，保留備份等新版，不清IndexedDB。個人資料與QA紀錄不提交。
