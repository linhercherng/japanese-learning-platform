# 生活與 N5～N2 提示歷史驗收（v0.41.0）

2026-10-24，Asia/Taipei。[完整規劃](course-hint-history.md)。

## 邏輯與複核

事件資料13項先RED9／既有守門4，再13GREEN；五區證據初26項RED16→GREEN，增加map／ability、舊原輪legacy報表時間等回歸；V2／V3真實控制器8項RED→GREEN，含quota／容量／返回重試／非同步提示時間去重。V1舊生活畫面以原source及實際UI函式驗證失敗遮住回饋與重試不改首答。時間線8項、卡片／原輪保存失敗及音訊路由回歸先RED再GREEN。

獨立核心審查發現舊原輪用updatedAt漏掉之後legacy，新增五區RED5→GREEN；UI明確傳報表時間。127相關測試與另編30情境複核通過：未來截止、新checkpoint回饋保留證據、雙向合併早期cue保留答案、備份還原及直接時鐘倒退拒絕。

整合審查發現卡片afterRender雙寫、V1回想頁誤記參考、共用audio繞過專屬保存。以毫秒遞增時鐘、原main listener與createLifeMemory整合、原輪play callback補回歸後修正；54相關測試複核無剩餘P1/P2。原每日聚合不再代表同日後續事件去重；舊矛盾合併測試明確去除新checkpoint模擬舊備份，舊守門仍保留。harness補實際V3 afterRender屏障，V2回饋由共用V2 controller負責，避免重複曝光。

新增76項，全站958／958通過；build→check通過，audit0弱點。208字卡／508筆順／10947音訊索引／176生活字串檢查通過。180 shell fingerprint `4ef32728afa853e288bca92f7706bd7fd18cb88a3d61227ebd2eb7e7c088c847`，本機逐檔SHA256／JS MIME／SW與10原音HTTP抽樣通過（1次重試），不是全量真人審音。

## 本機實際流程與資料

18128隔離QA由網站介面合併v0.40舊備份（45答案／28輪／10草稿）。匯入後attempts／v3／drafts與來源相等；時間線翻頁第2／2、N5篩選、weekly分類摘要後匯出，整份state完全相等，沒有因唯讀建立courseHistory。

實際完成生活隔天三題（中文助詞填空／兩題聽解）及N5～N2各一輪三題：明示提示、無提示作答、文字輸入、選項、下一題與完整小結。生活結果1／2可比較首答答對、1題提示另列，答後回饋沒有抹除已取得的跨日證據。四級各2提示／3feedback／3answer；新課當日小測不當作跨日記住。總計只新增15答案與5輪，所有原45答案／28輪／10草稿與作品逐筆保持。新簿hint9／feedback15／answer15／legacy28。

其後實際揭開生活L07逐句卡、N2三張卡之一及L01完整例句音訊，新增reference26（8＋10＋8題），L07-q0單次揭卡僅1筆reference；無新作答或自評分數。再次匯出比較原答案／sessions／drafts保持。時間線、週回顧與弱點五寬15組後匯出整份state與參考後基準完全相等。19px大字測後恢復15px，僅設定操作revision+2，其餘全state相等。

320／390／768／1024／1440 × course-history／weekly／N2弱點，15組皆無橫溢、main h1各1、所有可見主內容控制至少44px；390px實看原題時間線，Tab第一返回按鈕solid outline且在可見範圍。320px 19px大字無溢出。console warn/error空。恢復預設viewport；本機測試資料、備份與截圖留ignored work/，不提交GitHub。

## 正式發布

已經網站匯出正常與QA升級前備份。PR／CI／Pages／正式HTTP及升級後完整資料核對待發布後補入實際證據；尚未完成前不宣稱已發布。
