# 生活記憶第十一批驗收（v0.32.0）

日期2026-10-23（Asia/Taipei）。[規劃](plans/2026-10-23-life-memory-eleventh.md)。本批在中文回想與生活聽寫加入「不看舊稿，從空白再想」、接續最新再想稿及獨立目錄篩選；沿用92課276句，無新教材／音檔／題目／依賴／評分source。

## 範圍與保護

- 空白開始只開空編輯器，不顯示原LR／LD或上次LB，不改任何稿；輸入才更新本句本模式最新再想稿。原稿保留，一般開始仍接續／更新原稿，介面各別說明。每句每模式一份最新再想稿，不是歷史版本。
- buffer獨立於舊LB，提示／退場／比較／返回維持當次文字；刷新／換句／模式先收起，主動接續才恢復LB。LR先保存中文參考曝光；LD空白開始不曝光，聽音／輸入／展開非空稿／對照沿用既有規則。pending全部遮蔽並接原UUID；原首答不改、不新增分數／完成／熟練度。
- schema3 drafts新增552個合法LB-R／LB-D key；嚴格模式／canonical ref、300字／空points／合法時間及欄位，共用實際時間合併、同時異文衝突、較新空稿不復活舊文。原LR／LD／LN／作品及V1/V2備份保留。mode／ref／epoch／busy／IME、latest cache與失敗候選可匯出沿用。
- 兩目錄scope=blank只計同模式LB非空白文字，原written只看原LR／LD；分列再想稿句數，不預覽私人文字、不記曝光或推論記住。空結果可換全部。

## 自動測試與獨立審查

新增17項：核心5項先RED後GREEN；UI/controller初跑11fail／1pass，實作後相關十二檔71/71通過。核心獨立審查生活209/209、552key與1106筆新舊稿備份往返、756組模式／程度／場景／scope驗證通過；UI獨立審查71/71及main-style串行保存／quota／cache／延遲提示／取消IME五情境通過。

UI審查發現一項P2：收起頁共用「原草稿保留」說明，可能誤導一般開始。新增文案範圍斷言先RED（1fail／2pass），修正為空白／接續再想稿保留原稿、一般開始更新原稿，複核3/3通過，兩審查無剩餘阻擋。

完整npm test **661/661通過**；build→check成功、audit **0弱點**。208卡／508筆順／10947音檔索引／176生活字串通過。160份shell，fingerprint `77fcf4aa1dd97e5a8268ffa61a30c46e2b607e9817aa6f0a69ab4716c6b854e5`。

## 本機實際操作

所有新輸入／提示／作答只在 `http://127.0.0.1:18124/?qa=1` 隔離庫，不清DB／快取／SW，不改時鐘或注入歷史。

- 開始原LR確認舊稿，收起→空白開始無舊文字。輸入日文／emoji→提示→收起→比較→返回，buffer維持；刷新先收起／無預覽。再從空白開始仍空，未輸入收起後接續上次再想稿，先前LB仍在。原LR與原LD均保持原字串。
- LD空白無中文提示控制，原音可播；新稿只存聽寫再想稿。首次立即reload被既有未保存防離頁保護留在編輯器，待已保存後正常reload／接續恢復。兩模式各有L07一課、一句有文字再想稿，原LR／LD各兩稿兩有文字，私人稿不預覽；health組合0課，可換全部，focus留篩選。
- 編輯器320／390／768／1024／1440px皆無橫溢，對照48px、提示／關閉49px；收起頁空白48px、一般／接續49px。Tab到提示有solid outline，收起回空白開始焦點。ignored截圖 `work/life-eleventh-local-390.png`。
- 未完成輪 `e6df0271-0cb5-4b81-9e25-14d1d955b3cb` 時中文／原稿／LB及控制全遮蔽，接續同UUID，完成1題／1正確／1提示／0無提示。舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2正確／3提示／0無提示，第六批L07生活線索中日文保持。console warn/error空。
- UTC06:51:59本機160份shell逐檔SHA256／JS MIME／SW及146原音HTTP通過，0重試；預設TLS驗證，ignored紀錄 `work/life-eleventh-local-http.json`。276原句全量音檔索引／實體檔案驗證屬自動測試，不宣稱全部做HTTP。

桌面尺寸與IME事件不等於iPhone／Android實機或OS日文鍵盤。教師／真人審校、長期效果仍未由本批推論；個人資料／QA不提交Git。回退先匯出JSON並保留DB，舊版可能不辨LB入口，避免以舊版重新匯出覆蓋新備份。

## 發布驗證

- [PR #44](https://github.com/linhercherng/japanese-learning-platform/pull/44) head `fee4f6ed373823b4d4e6f6f668e42f571bf7bb8f`；同head [CI39914463639](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39914463639) completed/success後按match-head合併，merge `2866a8b750488278ed337670c741ee44ca7b826e`。
- [Pages39914584747](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39914584747)整體completed/success，build與deploy均success；deploy UTC06:57:52（台北14:57）完成。
- UTC06:59:30正式160份shell逐檔SHA256／JS MIME／SW及146次原音HTTP通過，1次暫時連線重試；fingerprint與本機相同，預設TLS驗證，ignored紀錄 `work/life-eleventh-public-http.json`。276句全量索引／檔案通過屬自動測試，不宣稱276皆做正式HTTP。

- 更新前展開正式隔離LR原稿作比對。正常分頁reload下載新版shell，暫離釋放舊client後依正常SW生命週期接手；序列160檔下載期間保持完整舊版，完成後出現空白再想與新scope。沒有清DB／快取／SW、強制啟用或注入歷史；所有新輸入／提示／作答仍僅?qa=1。
- 正式LR空白開始無舊稿，輸入日文／emoji→一字／開頭提示→收起→比較→返回維持當次buffer與編輯器焦點；刷新先收起。再開空白仍空，不輸入收起後接續恢復先前LB，原LR與升級前完全相同。LD原草稿缺少長音的原文字亦保持，空白無hint控制，原音可播，新LB-D刷新接續正確，與LB-R獨立。
- 正式LB篩選LR／LD各L07一課1句再想稿、1句有文字；原LR仍3稿3有文字、LD仍2稿2有文字。scope焦點保留，不預覽私人文字，health組合0課可換全部。
- 正式未完成輪 `9d7f1bd7-17bf-4fe5-8e3b-cadda7b53b9d` 全遮蔽中文、原／再想稿及控制，只接原UUID；完成1題／1正確／1提示／0無提示。舊首輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3正確／2無提示／1提示，第六批L07中日文生活線索保持。
- 正式再想編輯器及收起入口320／390／768／1024／1440px無橫溢，主要控制最小48px；Tab到提示有solid outline。console warn/error空，ignored隔離截圖 `work/life-eleventh-public-390.png`。
- 回正常正式目錄只讀，12課原稿皆0且沒有LB，新增scope可見，沒有混入QA文字／答案。正常單句收起頁截圖 `work/life-eleventh-public-entry-390.png`；保留正式分頁、離開QA、恢復viewport，18124本輪伺服器已停止。第一至第十批一同保留；實機／OS日文鍵盤、教師／真人審校與長期成效仍未由本批推論完成。

發布後僅補文件，採skip-ci提交；app與已驗證Pages fingerprint保持相同。
