# 五十音記憶剩餘整合驗收（v0.21.0）

日期：2026-10-23（台北）。[完整規劃／完成矩陣](kana-memory-completion.md)、[實作清單](plans/2026-10-23-kana-memory-completion.md)。

## 交付

1. 今日一小步：kana-path從全部kana來源及未完成默寫中先接最早原輪，再依既有七日／隔天／弱點／口袋提供一個建議；當日同來源已完成不重複推，已有回想可收尾。只讀紀錄與cutoff快照，不自動開題、移出口袋或造掌握分數。
2. 線索簿：kana-notes索引搜尋假名／輔助讀音／自己的文字，平片、分類、口袋／草稿篩選，保存與草稿聯集、草稿優先、每頁10字。明示搜尋、IME guard、清除／翻頁焦點、空結果復原；舊單字編輯／保存、備份與失敗待存不變。當頁與編輯頁的實際文字才記曝光，同步七日與默寫cache。
3. 六段指南：kana-guide、首頁／工坊／字卡入口、自由工具details；原A/B/C需求映射至前十六批及本批實作，D外部驗證另列。無新題庫、素材、音檔、source、持久欄位或依賴，schema3及原ID不變。

## 自動測試與獨立審查

新增24項行為測試，主要功能先紅後綠：下一步核心10＋UI1、線索簿核心／UI4＋控制器5、指南／首頁3、原編輯頁曝光1。涵蓋cutoff及未來更新／完成、所有kana來源與默寫pending、當日完成、手寫分開、備份唯讀、搜尋正規化／聯集／篩選／分頁／編碼、實際顯示曝光、七日／默寫cache、IME／路由／焦點、延遲／失敗匯出與原編輯回歸。完整npm test **452/452**通過；npm run build後npm run check通過，npm audit --audit-level=high為0 vulnerabilities。

核心與UI各獨立唯讀審查，原相關18項各通過。核心發現P2：用updatedAt／draft.time排除整輪，未來更新會令較早pending消失。補2項真core API測試先紅（8/10）後綠（10/10），改依createdAt保留、completedAt／lockedAt按cutoff判斷；獨立複核20項全通過，未見剩餘確定P1/P2。UI核對實際曝光／表單／IME／草稿／導航及舊入口無P1/P2。既有lab索引曝光移至專用notebook控制器，舊回歸改為同時裝載兩控制器，保留原斷言。

曾在建置後繼續修cutoff，check正確拒絕過期shell；最終停止程式修改，重新完整test→build→check→audit後通過。沒有以過期建置當成發布版本。

## 本機瀏覽器與HTTP

127.0.0.1:18123/?qa=1隔離庫，全程可見UI，不注入DB。空白推薦三字；六段指南與線索簿空結果正常。從地圖あ卡進原編輯頁保存聯想，再建立ガ線索含100字連續X驗換行，依片假名／濁音篩出一字。搜尋不存在顯示空結果，清除恢復；焦點回搜尋輸入。

い只輸入未按保存，索引清楚列草稿、只看草稿篩出一筆；刷新清除篩選但文字與未保存狀態保留，接續原編輯保存後列為已保存。從推薦開三字9題，尚未作答即離開回kana-path，推薦接續同UUID、不露字形／題目；刷新仍同輪。另以UI建立11筆線索，確認1/2頁10筆、2/2頁1筆、上一頁與焦點正常。

390px：空白推薦／指南／空簿／空搜尋／長文字／草稿篩選；320px：刷新索引／草稿保存／pending推薦／指南／實際第二頁，共11個量測狀態，無橫溢；主要button/select/search input/primary/summary至少44px。console warn/error空。ignored work/completion-qa/local-layout.json。儲存失敗與IME組字事件以真控制器測試驗證，非系統日文鍵盤實機操作。未驗證的項目不推論已完成。

本機131份shell SHA-256、JS MIME與SW fingerprint一致，128次既有音檔HTTP抽查通過，2026-10-23 00:34:44 UTC（台北08:34）。fingerprint `8c46fc6f547e55a8e6bb1a8260a3d382c3db16347a62d3e7cc6a1bd018681fb9`，ignored work/completion-local-http.json。

## GitHub與正式發布

已經[PR #33](https://github.com/linhercherng/japanese-learning-platform/pull/33)發布。head `3cd663bc9934d1874d132fb06bc83dd8b0583c12` 的[CI run39879186673](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39879186673)整體completed/success，測試／build／check／audit通過，PR deploy依設計略過。同head合併為 `6c40290587313f2e226aeb1b029aa3fcaa26990d`（2026-10-23 00:38:10 UTC，台北08:38）；[Pages run39879287506](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39879287506)整體completed/success，build/deploy皆success，deploy job於00:39:22 UTC（台北08:39）完成。

正式HTTPS 131份shell SHA-256、JS MIME及SW fingerprint一致，128次既有音檔抽查通過，2026-10-23 00:40:32 UTC（台北08:40），fingerprint與本機相同；ignored work/completion-public-http.json。正常重載觸發離線更新後，同站分頁導離、再重開取得新版，沒有刪SW／cache／DB。

正式隔離QA的較早未完成詞語輪（1/3）由今日推薦接續同UUID，刷新仍同輪，不新增作答；原路線先前僅推薦弱點三題。指南與首頁三入口存在。線索簿原為空，用可見UI保存あ線索，搜尋自身文字／口袋範圍可找回；切片假名得空結果，清除復原。ガ只寫草稿，索引及只看草稿正確，刷新後文字保留且篩選重置；接續原編輯按保存後標為已保存，筆順連結進入該字4筆示範。

原第十五批兩題仍0/2無提示首答、2題提示；原三題仍0/3、3題提示，未被新線索或導覽改寫。正式390px推薦／指南／空簿／搜尋／草稿篩選、320px刷新索引／草稿保存／指南，共8個量測狀態，無橫溢，主要控制項至少44px，console warn/error空。ignored work/completion-qa/public-layout.json與public-390-path.jpg保存量測及正式頁截圖。實際跨頁操作另由本機11筆驗收，IME及儲存失敗由Node真控制器驗證，不冒稱實機系統輸入測試。

本機server已停止，QA分頁關閉、尺寸重置；正常個人資料未寫入，正式新版kana-path分頁保留。QA、HTTP明細及截圖未提交公開Git。

## 邊界與回退

本次完成原記憶規劃A～C可程式交付的功能與整合；D教師審校、真人聲音、iPhone／Android實機與真人試學成效仍待外部證據。208卡、508筆順、10947音檔索引及K包668檔不變；合成音及原創試用教材仍有原標示。手寫自評、真人發音、當天回顧、跨日首答分開。可revert後走同Pages流程回退，先匯出JSON，不清DB。個人資料、QA、HTTP明細與截圖不提交公開Git。
