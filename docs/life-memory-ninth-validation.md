# 生活記憶第九批驗收（v0.30.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-ninth.md)。新增中文到日文整句回想，沿用92課276句原中文／日文／讀音／合成原音，沒有新教材、題目、音檔、依賴或評分來源。

## 實際範圍

- life-recall目錄及unit:slot單句頁，程度／場景篩選、真實課數與LR草稿句數；預設不出中文、日文或個人草稿。
- 主動開始先保存本課原qid參考曝光，成功才顯示原中文意思與300字編輯器。對照前沒有原日文、讀音或音訊，控制器也拒絕提前audio action。空字不能對照。
- 對照後唯讀雙文與原字形Unicode差異，附讀音／中文及原音／0.75慢速；收起回中文與最新草稿重想。同意思可能有不同說法，字元差異不判同義句、自由翻譯、文法自然度或分數；完全相同僅敘述相同。
- text:LR-<unit>:<0..2>與LD聽寫、LN、原課寫作、作品各自保留。300字／合法ref／欄位／時間／空points驗證、實際時間合併、同時異文衝突、較新空稿不復活。schema3及V1/V2不變。
- 共用控制器保留mode／route／ref／epoch／busy／composition版本／latest cache，input不重繪；失敗可匯出，延遲對照不覆寫新input、不打斷IME。換模式、換句及刷新收起，草稿保留。pending全遮蔽並接同UUID，舊首答不變，沒有新增attempts／完成／熟練度。
- 生活目錄／練習總覽／原課／能力／卡片／線索及聽寫相互連接，路徑顯示原課。手機48px、鍵盤焦點／sticky避讓及HTML編碼延續。

## 自動測試與獨立審查

新增16項測試，完整npm test **628/628通過**，LR／LD切片 **38/38通過**。核心RED為四項缺少LR功能；UI/controller RED為10項失敗（兩項既有共用行為原先即通過），實作後全綠。

測試涵蓋276中文同源與分句獨立、300字與非法ref／日期／欄位／points、時間merge／空稿／同時衝突、備份及舊首答／線索／作品保留、中文先提示且原日文／讀音／音訊延後、唯讀對照／編碼／pending／篩選／導航、quota-start不顯示、串行寫入與latest cache、模式切換／連按／新input／IME版本取消延遲對照。276原句沿用既有有效音檔索引與實體檔案。

核心獨立審查：生活176/176通過，276句中文／日文與原材料一致；552筆LD／LR獨立草稿備份往返，雙向空稿merge與LD／LN／寫作／作品／首答保留，V1/V2仍升schema3，未發現P1/P2。UI獨立審查：38/38及貼近main的structuredClone→fn→延遲落盤／unsaved／latest cache harness通過，先曝光才顯示、quota-start、held-start跨模式與newer LR輸入不重繪可匯出均正確。全程唯讀、未操作瀏覽器。

UI審查指出life-recall尚未套用life-dictation專屬CSS；本機證實scrollMarginTop=0px，改共用:is兩模式selector。重載後textarea及對照標題scroll margin為119.375px，Tab有outline，控制與上下句皆至少48px。另精簡LR說明與三列輸入，方便窄螢幕閱讀。

build→check與audit通過，audit 0弱點；208卡／508筆順／10947音檔索引／176生活字串通過。160份shell，fingerprint `fe09aed5fdd728a8e13d3de670fe19bddfd3b8db73ffd857acf88137249869f8`。

## 本機實際操作

所有新輸入／音訊／作答僅在 `http://127.0.0.1:18124/?qa=1` 隔離庫；不清DB／快取／SW，不改時鐘或注入歷史。

- 目錄12課0草稿→L07第1句開始後中文與空編輯器，空字不能對照；原日文／讀音／音訊不在DOM。日文草稿刷新先收起，再開始恢復原稿。
- 少一個長音的稿對照只標「ー」，唯讀無textarea，原音與慢速實際回報播放合成日語；收起回最新草稿與編輯器焦點。聽寫LD原稿與LR不同，切模式分別恢復；第2句中日文／emoji另存，回前句仍原稿。目錄真實2草稿句，N2／food為1課，L／health為0課可復原至12，焦點留同select。
- 原輪 `38dbb7b4-6fd9-428a-82c0-588860f99895` 未完成時中文回想全遮蔽，只接同UUID；完成1題／1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2正確／3提示／0無提示，第六批L07中日文線索可恢復。
- 編輯器320／390／768／1024／1440px無橫溢，對照390px差異及焦點正常。主要控制48px／收起49px，Tab接對照有outline；console warn/error空。ignored截圖 `work/life-ninth-local-390.png`。
- UTC05:46:12本機160份shell逐檔SHA256／JS MIME／SW及146原音HTTP通過，2次暫時連線重試，預設TLS；ignored紀錄 `work/life-ninth-local-http.json`。初次helper誤讀上一批驗證plan而fingerprint拒絕，重新將本版plan輸出至JSON後通過，未放寬hash驗證。

桌面寬度／IME事件不等於iPhone／Android實機或OS日文鍵盤驗收；教師／真人審校與長期效果未由本批推論完成。回退先匯出JSON並保留DB／備份，舊版可能不辨LR草稿入口；個人資料及QA不提交公開Git。

## 發布驗證

待同head CI、merge、Pages、正式HTTP及隔離UI、正常SW更新與遠端一致後補證據。
