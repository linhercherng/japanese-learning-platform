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

待CI／PR／Pages及正式HTTP與隔離瀏覽器驗收後補上。

## 邊界與回退

本次完成原記憶規劃A～C可程式交付的功能與整合；D教師審校、真人聲音、iPhone／Android實機與真人試學成效仍待外部證據。208卡、508筆順、10947音檔索引及K包668檔不變；合成音及原創試用教材仍有原標示。手寫自評、真人發音、當天回顧、跨日首答分開。可revert後走同Pages流程回退，先匯出JSON，不清DB。個人資料、QA、HTTP明細與截圖不提交公開Git。
