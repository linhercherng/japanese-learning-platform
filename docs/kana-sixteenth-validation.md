# 五十音記憶第十六批驗收（v0.20.0）

日期：2026-10-23（台北）。[規劃](plans/2026-10-23-kana-sixteenth.md)。

## 交付與資料

雙向聽辨結果新增兩字逐一回顧入口。既有kana-pocket-review同時接受已完成口袋與kana-contrast，後者以contrastQuestion解析原kp題，依原題序呈現兩字、原選字與首答狀態。單字展開只重用目標memoryFor.tip與個人線索；錯答雙卡、遮住／揭開沿用既有控制器。從未加入與已移出口袋分開說明，僅明示keep更動當前目標；原題／首答／hinted、attempt與其他字不重評或自動異動。來源麵包屑保留原字對入口，返回原輪結果。

schema3、舊source／ID、口袋與備份格式不變；沒有新素材、依賴或資料遷移。兩類pending均遮蔽舊回顧。實際呈現的字與展開文字才記提示，同步七日未答題、默寫草稿及cache；遮住不新增曝光。切字／刷新收起線索與雙卡；舊事件、連按、延遲離頁、保存失敗仍由共用控制器守護，失敗資料可匯出，不宣告已保存。

## 自動測試與獨立審查

新增13項：核心／UI 7項先寫紅（0/7），補最小整合後43項相關測試綠；6項真控制器測試對照新source實際執行，共用控制器已滿足，直接綠而無不必要改碼。涵蓋原題序／原選字與四種狀態、未完成／其他來源拒絕、備份往返／合併、單目標訣竅與個人文字編碼、來源路徑、未留／移出、pending、切字／焦點／遮住、曝光同步七日／默寫cache、主動keep、連按／離頁／保存失敗匯出。最終npm test **428/428**通過，npm run build後npm run check通過，npm audit --audit-level=high為0 vulnerabilities。

獨立唯讀審查base 5ad3ccc→5040251，另跑15檔94項相關測試全通過，未發現確定P1/P2；覆蓋resolver、首答、訣竅／曝光、既有控制器、備份、來源路徑與焦點。無瀏覽器／Git異動。

## 本機驗收

127.0.0.1:18122/?qa=1隔離庫，從已知合法あ／ゆ字對入口經UI建立新輪，先ゆ正確、再あ選ゆ錯答；結果1/2無提示首答、1題提示（第一題回饋已顯示兩字），沒有repeat。從結果點新逐字回顧，第一字ゆ一處訣竅／音鈕按需展開，空白鍵可操作，從未放入口袋文字正確，明示keep後僅ゆ加入且焦點回選字器。

切第二字關閉第一字線索，保留あ／原選字ゆ／首答答錯；雙卡展開、遮住字形及解說／音鈕、空白鍵揭開核對正常。刷新回第一字且線索／雙卡收起，ゆ仍在口袋；原輪結果仍1/2無提示首答、1題提示，口袋仍1字。再起原口袋聽辨，舊雙向輪回顧深連結遮蔽，只提供接續原pending。

320/390px共8個初始／單字線索／keep／雙卡／遮住／揭開／刷新／pending狀態無橫溢，main button/select/primary至少44px；console warn/error空。ignored work/sixteenth-qa/local-layout.json。保存失敗、備份衝突與跨日同步用Node控制器驗證，未注入瀏覽器DB或製造容量失敗。

本機126份shell SHA-256、JS MIME及SW fingerprint一致，128次既有音檔HTTP抽查通過，2026-10-23 00:09:40 UTC（台北08:09）。fingerprint `9e3247b6b90e2f43787ec0437bc13cd6b8d3a693631339adcf185743ebfa5724`；ignored work/sixteenth-local-http.json。

## GitHub與正式發布

已經[PR #32](https://github.com/linhercherng/japanese-learning-platform/pull/32)發布。head `ffcb3cb8491edfc46460ad301643a768c392ba3f` 的[CI run39876635874](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39876635874)整體completed/success，測試／build／check／audit皆通過，PR deploy依設計略過；同head合併為 `ade003dc89dfa177d06395bf2a94120fd72639e3`（2026-10-23 00:12:49 UTC，台北08:12）。[Pages run39876749540](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39876749540)整體completed/success，build/deploy皆success，deploy job於00:13:56 UTC完成（台北08:13）。

正式HTTPS 126份shell SHA-256、JS MIME及SW fingerprint相符，128次既有音檔抽查通過，2026-10-23 00:15:10 UTC（台北08:15），fingerprint與本機相同；ignored work/sixteenth-public-http.json。已開分頁先仍沿用舊離線版本；正常載入後把同站分頁導離再重開，完成waiting lifecycle切換，不刪SW／cache／DB。重開後既有第十五批兩題結果直接出現新回顧入口，資料未重建。

正式隔離QA沿用原パ／ベ雙向輪：第一字ベ仍提示後答對、第二字パ仍首答選ベ答錯，結果仍0/2無提示首答、2題提示。展開ベ僅該字訣竅／音鈕，空白鍵操作正常；原未加入口袋文字正確，明示keep後焦點回選字器，ベ保存且其他字不異動。切字收起線索；パ／ベ雙卡可展開、遮住再想與空白鍵揭開。刷新回第一字、線索及對照收起，ベ仍保留。

原口袋三題輪仍0/3無提示首答、3題提示，パ仍原選字ベ且首答答錯；最終口袋由3字增至4字，只有明示新增ベ。正式390px單字／線索／keep／雙卡／刷新，以及實際320px另開分頁的回顧／雙卡／遮住，均無橫溢，main button/select/primary至少44px，console warn/error空。尺寸override曾未套用原分頁，採另開分頁並讀DOM實際innerWidth=320確認，不把請求尺寸當成驗收尺寸。ignored work/sixteenth-qa/public-layout.json保存實際尺寸，public-390-review.jpg為正式手機截圖。

QA分頁已關閉、尺寸重置、本機server停止，正常個人資料未寫入，正式網站分頁保留；QA、HTTP明細與截圖不提交公開Git。

## 邊界與回退

沿用208卡、508筆順、10947音檔索引及K包668檔。既有試用訣竅與合成音仍待獨立教師審校；回顧、雙卡自查及兩選一當天練習不等於跨日掌握、手寫或真人發音評分，實機依先前決定略過。可用revert及同發布流程回退；先匯出JSON保留備份，不清IndexedDB。個人資料、QA紀錄與截圖不提交公開Git。
