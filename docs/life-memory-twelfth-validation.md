# 生活記憶第十二批驗收（v0.33.0）

2026-10-23，Asia/Taipei。[規劃](plans/2026-10-23-life-memory-twelfth.md)。逐句草稿導航完全沿用92課276句，無新教材／音檔／題目／依賴／schema或評分source。

## 範圍與自動驗證

三句狀態只回ref／slot及原稿／再想稿存在／有文字booleans，不讀出正文。目錄主入口真正匹配scope，unwritten表示本模式原稿與再想稿都無非空白文字，不推論未學會；課卡及單句原生details可直接選三句，無私稿／答案預覽、無新增曝光／作答。pending遮蔽並接原UUID，原首答及備份保持。

新增12項測試：核心5項RED→GREEN；UI/controller初6fail／1pass→7/7。完整 **673/673通過**，build→check成功、audit **0弱點**；208卡／508筆順／10947音檔索引／176生活字串檢查通過。160份shell SHA256／JS MIME／SW與146原音本機HTTP驗證通過，最終fingerprint與時間見本批發布紀錄。

核心獨立審查生活221/221、552模式句與1008組篩選一致性通過，純函式不修改資料或曝光。UI獨立審查63/63，article／主連結與details同層、aria-current／scope／48px／pending保護通過，無P1/P2。

本機發現目前句status在input不重繪時可過時，改為固定「目前這句請在上方練習」，其他句與目錄仍列草稿狀態；新增斷言先RED1/4fail→GREEN7/7，獨立定點複核通過，不用input重繪解決。

## 本機瀏覽器

全部新文字與作答只在18124/?qa=1隔離庫，不清DB／快取／SW、不注入歷史。LR L03第3句新再想稿使blank/shopping主入口真實指向L03:2，非固定slot0；主入口接續恢復原文字，清單三句狀態無正文。另第2句新稿使LR第一個有稿slot變1；LD第2句獨立新稿目錄亦指向slot1。展開單句導航不重繪input／不中斷日文emoji，換句／刷新先收起；目前句有aria-current與固定導引。

unwritten/shopping主入口指向L03:0；health無此課範圍為可復原空結果。L07三句都有原稿或再想稿後，unwritten/food顯全有文字的可復原空結果。scope focus保持；原生summary以DOM locator操作（AX列button但role locator不匹配），不是產品控制失效。

展開目錄320／390／768／1024／1440px均無橫溢，summary48px、句子links73.75px，Tab至句連結有solid outline。console warn/error空。未完成輪 `fe653bb3-50b4-474c-8ddc-d0cc9ecc079c` 遮蔽新清單／篩選，只接同UUID，完成1題／1正確／1提示／0無提示。

桌面尺寸／IME事件不等於實機或OS日文鍵盤，教師／真人審校與長期成效未由本批推論。個人資料／QA不提交Git，回退先匯出JSON保留DB。

## 發布

- [PR #45](https://github.com/linhercherng/japanese-learning-platform/pull/45) head `1ac987a8e93411d240163ccf8ee9c6e034a00320`，同head [CI39919534414](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39919534414) completed/success後按match-head合併，merge `b3bae68f141b5fe08a956ec033dc3bdadee1ea9e`。
- [Pages39919708025](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39919708025)整體／build／deploy均success，deploy UTC07:45:42（台北15:45）完成。
- 最終fingerprint `c6d377aa5a0dbd14df07c80c7d7af7ab8d3d2ee358383ee9417e1b112072602e`。本機UTC07:41:39、正式UTC07:47:55的160份shell SHA256／JS MIME／SW與146原音HTTP皆通過，分別1／0重試，預設TLS驗證。紀錄為ignored work/life-twelfth-local-http.json及life-twelfth-public-http.json；276句全量音檔索引／檔案驗證屬自動測試，不宣稱全部做HTTP。
- 本機舊首輪仍2正確／3提示／0無提示，第六批L07線索保持，截圖work/life-twelfth-local-390.png。

- 正常正式分頁reload下載新版，暫離後依SW正常生命週期接手，未清DB／快取／SW或強制啟用。所有新文字／作答只在正式?qa=1。LR L03第三句新LB使blank/shopping主入口指L03:2，點進主動接續恢復原字；單句details展開不重繪input／不中斷日文emoji，目前句固定導引與aria-current正確。LD L03第二句新LB使其主入口指slot1，與LR分開。
- 正式unwritten/food顯全有文字，health無課可回復，未預覽私人文。展開目錄320／390／768／1024／1440px無溢出，summary48px、links73.75px。console warn/error空。
- 正式未完成輪 `254f0a1e-25bc-403a-b771-ad047783d479` 全遮蔽新scope／清單，接同UUID，完成1題／1正確／1提示／0無提示；舊首輪仍3正確／2無提示／1提示，第六批L07線索保持。
- 回正常單句頁只讀展開導航，沒有混入QA草稿；截圖work/life-twelfth-public-entry-390.png。第十三批依使用者接續指示開發中，兩批共用本輪18124測試服務與viewport，待第十三批交付時統一恢復／停止；本批發布證據隨第十三批PR同步提交。
