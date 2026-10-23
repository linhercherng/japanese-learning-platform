# 生活記憶第十二批 Implementation Plan（v0.33.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者明示規劃、實作、測試、GitHub與發布，直接完成清單。

**Goal:** 從目錄直接找到上次留下文字的那一句，也能只挑一句尚未留下文字的內容練習。

**Architecture:** 以既有LR／LD與LB-R／LB-D純衍生逐句狀態；目錄主連結依scope選真正匹配的句子，原課卡下以原生details提供三句直接連結。新增「還沒留下文字」篩選，單句頁加入收起的同課三句導航與aria-current，不增加資料schema或曝光。

**Tech Stack:** Node22 ESM、node:test、原生details／anchors、既有PWA／IndexedDB。

## 取捨與規格

比較更長的每日路線、更多個人統計、找回指定一句。前兩者已多處提供；目前有稿篩選仍固定slot0，找回草稿有具體斷點，因此選逐句導航，不新增新教材或計分。

- lifeTextDraftSentences(state,unitId,recall=false)只回合法92課的三句ref／slot與原稿／再想稿是否存在及是否有非空文字，不含內容／時間，不修改state。字串空白用trim；保留空稿的意圖，不以有draft物件當有文字。
- lifeTextDraftRows保留既有計數，增sentences、unwrittenCount、startReference。all仍slot0；written首個原稿有文字slot；blank首個再想稿有文字slot；unwritten首個原稿與再想稿皆無文字slot。沒有匹配就不列該課。各模式獨立，程度／場景組合有效，不讀LN／作品或另一模式。
- 目錄卡主連結明示「從第N句開始」，真正連到startReference；卡下原生details「逐句練習清單 · 3句」預設收起。展開後顯第1～3句與「原稿有文字／再想稿有文字」或「尚未留下文字」，各可直接進入；不預覽原句／翻譯／個人稿。所有課三句都可選，清楚說明篩選決定主入口、清單可看本課全部三句。
- 單句頁以相同清單提供「本課三句導航」，目前句aria-current=page與文字標記；開啟導航不重繪textarea、不修改buffer／稿／曝光。點句換route先收起編輯器，保持原始ref與既有pending保護。
- 新scope「還沒留下文字」表示本模式原稿及再想稿都沒有非空文字，與未學／不會分開；全部已留文字時有可回復空結果。目錄不保存成績或新增提示；pending只接原輪、全遮蔽。
- 用article包主連結與details，避免巢狀a；新增CSS只限句子清單，summary／links至少48px、可見focus、窄螢幕與sticky避讓。details為暫存UI，刷新／重繪收起，不提供跨裝置推論。

## Task 1：逐句索引

Files: app/core/life-dictation.mjs、tests/life-sentence-navigation.test.mjs。

- [x] RED：552模式句狀態、空稿／空白／原與再想稿union、另一模式／LN／作品排除、無內容預覽與不變性。
- [x] RED：篩選主入口真正匹配slot1／2、全寫滿unwritten空、程度場景／非法unit；GREEN提交。

## Task 2：逐句清單與導航

Files: app/ui/life-dictation.mjs、app/life-dictation.mjs、app/v3.css；tests/life-sentence-navigation-ui.test.mjs、tests/life-sentence-navigation-controller.test.mjs。

- [x] RED：目錄主入口／三句details、原與再稿狀態／範圍說明、無私稿／原句、empty／pending、單句aria-current與48px語意；GREEN。
- [x] RED：新增scope白名單／focus、跨句保持buffer與模式且route先收起、不改首答／pending／曝光；GREEN並獨立核心與UI審查。

## Task 3：測試與發布

- [x] 0.33.0與README／規格／課綱／畫面／來源／驗收更新。npm test→build→check／audit，160 shell與146原音HTTP／SHA／MIME／SW。
- [x] 本機?qa=1從第2／3句有文字稿直接進入、空稿／再稿／兩模式篩選、導航不打斷編輯／日文emoji、pending原UUID／舊首答／線索。320／390／768／1024／1440、48px／Tab／console／截圖。
- [x] PR同head CI通過再合併；Pages build／deploy與正式HTTP、正常SW升級與隔離UI通過。文件證據push／遠端一致，正常入口／恢復viewport／停server。

不清DB／SW／快取、不注入歷史、個人資料不提交Git。沿用276句待教師審校試用教材與原音，不新增語言教材、得分、完成或熟練度。桌面尺寸／IME事件不等於實機日文鍵盤，長期成效不由本次推論。回退先匯出JSON保留資料。
