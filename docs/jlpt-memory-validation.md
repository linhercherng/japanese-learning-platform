# N5～N2 檢定課程記憶與複習驗收（v0.37.1）

2026-10-23，Asia/Taipei。[完成矩陣](jlpt-memory-completion.md)、[執行計畫](plans/2026-10-23-jlpt-memory-complete.md)。四級主課一次交付，不另分批。

## 範圍與資料

114主課（N5 24／N4 30／N3 36／N2 24），1,139可靠原題。語彙1,584、文法228、漢字567原課項目（可跨課重複），三張一組可依序遍歷。五能力每課最多三道原題，固定三題含語彙／文法／聽解；不新增語言教材、音檔、依賴、帳號或後端。

新增八種route及五種jlpt作答source，schema3沿用；optional jlptHints保存原題每日最早參考時間，text:JN-*只保存個人160字線索。新參考保存成功才揭露／播放；原學習頁及答後實際顯示內容也記曝光。卡片自評、作文／手寫、原首答、提示與跨日證據各自分開，不回填歷史評分。

## 自動測試與獨立審查

核心先15項RED→GREEN，再補空線索／時間倒流兩項。UI/controller先20項RED→GREEN；整合導航後全部通過。獨立核心審查重現一個P2：原V2／V3無提示首答與新參考曝光可以矛盾合併。新增一項RED→GREEN覆蓋原concept、V2及獨立attempt、兩種合併方向、原狀態不變、首答後曝光合法；驗證延伸所有canonical原題，而不改hinted歷史值。未來資料fixture改成答後+1ms曝光以保持合法。

瀏覽器另發現麵包屑重複課程／路線，新增一項RED→GREEN涵蓋root、單課、path與原輪，依目前頁省略同route父節點；練習仍用ID避免課名提示。最終本次新增39項，完整 **758／758通過**。導航及相關UI定點29項通過。

兩個獨立唯讀審查完成。核心另遍歷114課×固定三題／五能力共684輪、1,481作答與JSON往返；跨日／七日台北邊界正常。P2修正複查62項及22個多日V2／V3／舊schema2情境通過：輪內先曝光雙向拒絕，首答後與起輪日前曝光允許，原首答不變。UI/controller獨立以序列化update／clone／待存狀態驗證延遲保存、離頁回同route不揭舊卡、失敗不播放／揭露且保留候選稿；busy、epoch、run/cursor、IME及pointerdown→blur→compositionend→click均檢查。兩者最終無P1/P2阻擋，未操作瀏覽器／寫檔／提交／發布。

## 瀏覽器隔離驗收

localhost:18124/?qa=1保留既有庫，沒有清DB/cache/SW或注入歷史。語彙卡「我」先隱藏，展開原詞／例句與原音；「想再練」在姓名、學生兩張後第4次回到「我」。文法卡按需顯接續／差異／易混淆，漢字卡接原筆順手寫。三類選擇與分組正常。

N5-01個人線索實際輸入「自我介紹先想身分，再想對方。私は学生です。🍵」，收起、刷新、主動開啟仍同文字。N3主課36課每頁10課，第二頁從N3-11起；搜尋<img src=x>🍵空結果、main無img，focus到結果標題。N5有線索篩選只得1課，列表不預覽個人文字。

原三題輪7df99f2e-be83-4a58-8898-1773197aaafa在轉N2卡頁時只提供原UUID接續；完成2正確／3提示／0無提示。日文填空實際輸入、正常／慢速聽解可用，原輪逐題回顧保持錯答與提示。N2-24讀解輪2f31a0c6-369e-4175-bbfb-fc752c691212完成2正確／1提示／1無提示，原長文按需展開；N4-01漢字輪c09b9d73-ba72-4e1d-beae-92fb16e400b1完成1正確／0提示。未偽造隔天／七日作答，跨日靠合成日期測試驗證。

透過UI匯出JSON，以parseBackup／exportBackup往返完全一致；新JN稿、原LR「コーヒーを一つ。🍵」、原LB-R「コーヒーを二つ🍵」、原生活線索保留。舊生活首輪f5ec4192-db81-4ebd-8474-bf913ed08530仍2正確3提示。正常本機profile仍0完成／0首答／0作品，沒有混入隔離測試紀錄。截圖與下載備份只留ignored work。

## 邊界

九類頁面（今日路線、分級目錄、單課、卡片、線索、地圖、指南、隔天、原輪）在320／390／768／1024／1440px逐一驗收，共45組，實際innerWidth正確、無橫向溢出，控制最小44px；textarea18px，Tab移動至收起按鈕有solid outline。正常PWA註冊／reload後暫離舊client，新版麵包屑單課只出現一次；未清資料或強制skipWaiting。console warn/error空，截圖work/jlpt-local-path-390.png。

最終test→build→check成功，audit 0弱點；208字卡、508筆順、10,947音檔索引、176生活字串檢查通過。170份shell fingerprint `fff84599c4c805555cbefe71b2449494255376c168728932590f1f8fb85262ea`。UTC10:27:12本機170 shell逐檔SHA256／JS MIME／SW與424原音抽樣HTTP通過，1次暫時重試，PowerShell預設TLS。抽樣含114主課三類卡首項及聽解原音，去重424；不將抽樣HTTP稱為全量真人審音。ignored證據work/jlpt-local-http.json。

## 驗證限制

教師審校、真人音訊評估、iPhone／Android實機OS鍵盤與手勢、真人長期學習效果仍未驗證。桌面瀏覽器的手機尺寸與合成事件測試不取代實機；原題原始正確率不是JLPT換算分數或合格機率。回退先匯出JSON，舊版未必識別新source／hint／note；不刪資料回退。

## GitHub 與正式發布

PR [#49](https://github.com/linhercherng/japanese-learning-platform/pull/49) head `80808934184c675cb53db9056905c848437960fa`，CI [39939444776](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39939444776) success。UTC10:31:00合併為 `fa568ee3c569760d691378d6f10040bd20515cea`。Pages [39939662208](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39939662208) 同merge SHA，整體／build／deploy success，deploy UTC10:32:39完成。

正式URL https://linhercherng.github.io/japanese-learning-platform/ ，UTC10:35:02以PowerShell預設TLS驗證170 shell逐檔SHA256／JS MIME／SW fingerprint與424音檔抽樣HTTP通過，0重試；fingerprint為上述fff84599。ignored證據work/jlpt-public-http.json。原音抽樣不是全量真人音質驗證。

## 正式回顧順序修正（v0.37.1）

v0.37.0正式操作發現回顧選項／詞塊雖同原題，隨機呈現seed卻不同於原作答畫面。改用與questionView相同的原輪ID＋qid seed，詞塊含tokens後綴；填空不額外顯示原作答未展示的raw options。首答、值、原題與曝光規則不變。新增一項RED→GREEN，用真正已完成文法輪的cloze／order／choice及questionView畫面作基線比較，12項UI測試通過；後續重新全測、建置與部署。

v0.37.0正常profile初始化／reload，保留頁面等待UI顯示「課程文字與筆順已準備離線使用」，再暫離舊client，正式新route出現；沒有清DB/cache/SW或強制skipWaiting。正式隔離庫三類卡、原音、間隔再想正常；新JN「介紹自己先想人，再想身分。私は学生です。🍵」收起、刷新與展開保持。N3漢字輪f901e9cd-dea4-428a-ac77-425eb1c98631轉N2線索只顯原輪接續，刷新續答後1正確／0提示，逐題回顧原值保持。

升級前後UI匯出JSON比較：原44筆attempts、9份drafts、27輪sessions、作品、模擬、settings及lifeNotes逐筆深比對相同；新增1次N3漢字作答與1份JN稿。新備份parse/export往返相同。個人正式資料仍與?qa=1分離。

順序修正再經獨立唯讀審查12項UI測試、四級28題choice／listen／order／cloze，與真正questionView相同，回顧前後state與備份不變。v0.37.1完整759／759通過（本次新增40項）。

v0.37.1 build→check、audit 0弱點；170 shell fingerprint `57b732a2d8c6f93c0e9014608200c6f5e292da90f7e9b8bc4b723ab3bdc8afbc`。UTC10:41:43本機170 shell SHA256／JS MIME／SW HTTP通過、0重試；音檔與索引未修改，沿用v0.37.0已完成424原音HTTP驗證，不重複抽樣。ignored記錄work/jlpt-final-local-http.json。
