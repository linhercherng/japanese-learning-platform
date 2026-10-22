# 日和｜日語學習平台

繁體中文、手機優先的日語學習平台，從五十音到生活日語，再循序練習 N5、N4、N3、N2。每課先理解、聽讀，收起提示回想，最後寫自己的句子。

**五十音練習工坊公開試用程式 v0.19.0，2026-10-23。** 已依使用者確認的畫面實作，並依「直接公開」指示設定 GitHub Pages。`prototype/` 保留原樣稿，第一版可從版本歷史與原交付包回溯。

新增[記憶地圖](https://linhercherng.github.io/japanese-learning-platform/#kana-map)、[混淆字專練](https://linhercherng.github.io/japanese-learning-platform/#kana-confusions)、[隔天檢查](https://linhercherng.github.io/japanese-learning-platform/#kana-check)：分能力查看208張卡，依實際首答補強混淆，每日最多10題檢查較早學過的字。手寫仍為作品與自評；備份沿用現有格式，詳見[本批驗收與限制](docs/kana-coach-validation.md)。

第二批新增[圖像提示退場](https://linhercherng.github.io/japanese-learning-platform/#kana-fade)、[聽音默寫](https://linhercherng.github.io/japanese-learning-platform/#kana-dictation)、[不同生活詞](https://linhercherng.github.io/japanese-learning-platform/#kana-words)：208卡循序收起提示，獨立默寫原稿鎖定後再對照，190卡提供514個詞中回想題。另18個少見片假名字形明示沒有自然詞例，提供平假名對照；不把練字轉寫當成常用詞。新增32個生活詞合成音，提示與原稿可隨舊schema3備份合併。見[第二批驗收與限制](docs/kana-studio-validation.md)。

v0.6.1補做手機版驗收：320／390px各15類頁面、320px大字6頁與畫板尺寸切換，修正生活詞來源導覽、活動筆畫清除／撤銷及44px切換按鈕。210項測試通過；已完成內建瀏覽器畫面與拖曳流程，本輪依使用者指示略過iPhone／Android實機鍵盤與手勢驗收，狀態保留為未驗證。詳見[手機驗收](docs/mobile-kana-validation.md)。

第三批新增[三字小循環](https://linhercherng.github.io/japanese-learning-platform/#kana-mini)、[生活詞拼拼看](https://linhercherng.github.io/japanese-learning-platform/#kana-build)、[我的記憶線索](https://linhercherng.github.io/japanese-learning-platform/#kana-notes)：一次3字、6～9題，先認字再聽辨與拼詞；509道生活詞字塊題沿用K包音檔。每張卡可寫160字個人聯想，草稿與保存內容隨備份保留。實際展示的提示會留下紀錄；詳細規劃與驗收見[第三批驗收](docs/kana-third-validation.md)。

第四批新增[聽音打字回想](https://linhercherng.github.io/japanese-learning-platform/#kana-type)、[七日回想](https://linhercherng.github.io/japanese-learning-platform/#kana-week)、[回想小結](https://linhercherng.github.io/japanese-learning-platform/#kana-recall)：509題改用日文鍵盤自主輸入，七日檢查依真實作答日期與提示挑最多10題，小結以同字同能力每日首筆分開呈現認字／聽辨／詞語運用。IME選字中與空白不誤送，既有首答、草稿與備份保留；詳見[第四批規劃](docs/plans/2026-10-21-kana-fourth.md)與[驗收](docs/kana-fourth-validation.md)。

第五批新增[今天怎麼練](https://linhercherng.github.io/japanese-learning-platform/#kana-path)、[弱點三題](https://linhercherng.github.io/japanese-learning-platform/#kana-repair)、[一拍一格](https://linhercherng.github.io/japanese-learning-platform/#kana-beats)：依四種學習目的選練法，從真實弱項挑最多三字三題；12個生活詞先聽、數拍，再展開拍格與訣竅。拍格為引導對照，不自動評分拍點或發音；首答、提示曝光、續作及舊資料保留。詳見[第五批規劃](docs/plans/2026-10-21-kana-fifth.md)與[驗收](docs/kana-fifth-validation.md)。

第六批新增[看字想聲翻卡](https://linhercherng.github.io/japanese-learning-platform/#kana-flip)、[混淆字二選一](https://linhercherng.github.io/japanese-learning-platform/#kana-duel)：208卡一次最多三張，不熟卡至少隔兩張再想；六組混淆共12題，正常／慢速聽音與主動差異對照。翻卡為暫存自評不計分，二選一的同日／本輪對照列為提示，原首答與備份保留；入口整合到「今天怎麼練」。詳見[第六批規劃](docs/plans/2026-10-22-kana-sixth.md)與[驗收](docs/kana-sixth-validation.md)。

第七批新增[平片互換三題](https://linhercherng.github.io/japanese-learning-platform/#kana-bridge)：104對、208個雙向題，每輪同類三字，按需展開同音雙形與既有記憶訣竅，再換方向回想。兩種方向保留各自首答，同日／輪內提示另列；刷新續作與合併備份保留。只練字形辨認，不代替聽辨、書寫或跨日證據。詳見[第七批規劃](docs/plans/2026-10-22-kana-seventh.md)與[驗收](docs/kana-seventh-validation.md)。

第八批新增[清濁聲音家族](https://linhercherng.github.io/japanese-learning-platform/#kana-family)：58組、132題，將原字、兩點與小圈放進同一家族記。按需展開家族卡、切換標記與既有訣竅，再完成2／3題正常／慢速聽辨；答後全家族曝光、提示、首答與續作均保留。詳見[第八批規劃](docs/plans/2026-10-22-kana-eighth.md)與[驗收](docs/kana-eighth-validation.md)。

第九批新增[行段記憶導航](https://linhercherng.github.io/japanese-learning-platform/#kana-row)：20行、90個既有清音，一次一行、逐格回想，保留や／わ行空格。36組離序小輪沿用既有聽辨題，每輪2／3題、正常／慢速音；原首答、提示、刷新續作與備份保留。詳見[第九批規劃](docs/plans/2026-10-22-kana-ninth.md)與[驗收](docs/kana-ninth-validation.md)。

第十批深化[一拍一格](https://linhercherng.github.io/japanese-learning-platform/#kana-beats)：12個既有生活詞可先自行估拍、看差異對照，再做同類聽音數拍三題。新12題沿用完整詞音，拍數辨認獨立記錄；同日／本輪看過該詞拍格另記提示，原首答／續作／備份保留，也涵蓋每日及到期複習。詳見[第十批規劃](docs/plans/2026-10-22-kana-tenth.md)與[驗收](docs/kana-tenth-validation.md)。

第十一批新增[不熟字口袋](https://linhercherng.github.io/japanese-learning-platform/#kana-pocket)：翻卡選「還不熟」可留下字卡，之後每輪最多三個不同字，先回想再展開原讀音／訣竅，主動保留或移出。清單隨本機資料與備份保存；展示進度暫存，自評不增加答對或熟練數。詳見[第十一批規劃](docs/plans/2026-10-22-kana-eleventh.md)與[驗收](docs/kana-eleventh-validation.md)。

第十五批加入「錯字雙向聽辨」：從自己的錯字雙卡收起線索，做同一對字的兩題聽音選字，各當一次目標。原輪／首答／提示與中斷保存，新一輪不改原錯答或自評口袋；同日看過的兩字提示另列。[規劃](docs/plans/2026-10-23-kana-fifteenth.md)與[驗收](docs/kana-fifteenth-validation.md)。

第十四批接上「錯字雙卡對照」：只用原錯答的參考字與原選字，各聽字音、看既有例詞與訣竅；再遮住字形自己回想、揭開核對，不新增答對數或改寫原首答。對照按需展開、切字／刷新收起。[規劃](docs/plans/2026-10-23-kana-fourteenth.md)與[驗收](docs/kana-fourteenth-validation.md)。

第十三批加入「逐字回顧與記憶線索」：口袋聽辨完成後，逐字看原首答、提示狀態及原選字；訣竅按需展開，已移出的字可主動留回口袋。回顧不重算成績，實際顯示的字同步記提示。[規劃](docs/plans/2026-10-22-kana-thirteenth.md)與[驗收](docs/kana-thirteenth-validation.md)。

第十二批深化[不熟字口袋](https://linhercherng.github.io/japanese-learning-platform/#kana-pocket)：可直接收起字卡做最多三題聽音選字，原輪／首答／提示／結果與備份保存。聽辨答對不自動移出自評清單；解說與個人線索實際顯示的假名同步記提示，避免把看過答案算成無提示回想。[規劃](docs/plans/2026-10-22-kana-twelfth.md)與[驗收](docs/kana-twelfth-validation.md)。

保留固定於頁頂的「目前位置」路徑，可直接返回分類或來源課程；練習、深連結與重新整理保留可辨識的所屬層級。生活任務切換分類會同步網址。

## 開始使用

直接開啟 **[日和線上學習平台](https://linhercherng.github.io/japanese-learning-platform/)**，不需安裝 Node.js 或登入 GitHub。公開試用教材與合成語音尚待獨立教師審校。

若尚未顯示練習工坊入口，請先關閉所有日和分頁，再重新開啟網站，讓已下載的新離線版本接手；不需要清除瀏覽器資料。

學習進度與作品仍只存於目前瀏覽器，沒有雲端同步。從本機版搬到線上版，請先在本機「我的」匯出 JSON 備份，再於線上版同頁選擇「合併匯入備份」。新網址不會自動取得舊網址的進度。

已安裝 Node.js 22 以上時，執行 `npm run dev`，開啟 [本機日和](http://127.0.0.1:18090/)。Windows 可雙擊 `start-hiyori.cmd`，不需安裝 npm 執行依賴。到「課程」選程度，「練習」回想到期項目，「我的」保存備份與離線包。

若已開啟同一來源的服務，直接使用同一網址即可。若18090被其他服務占用，執行 `node scripts/serve.mjs 18091`。進度依瀏覽器及網址來源保存；換連接埠前先匯出 JSON，再於新來源合併匯入。

## 學習補給新增（2026-10-16）

比較9個網站的公開功能後，新增24個知識單元（發音6、文法8、字詞4、生活語境6）與8篇N5～N2分級閱讀，合計96道原創回想題。首頁、課程與練習可進入[學習補給](https://linhercherng.github.io/japanese-learning-platform/#support)，沿用首答、提示、錯題複習、作品與備份；補充詞進詞庫，8個文法補給亦可在文法詞庫查找。

每篇閱讀都有可展開的原文線索；作答後才出現逐選項解析。教材均為原創試用稿，待教師審校；僅連結外站資源，不轉載課文或音檔，也不把合成音當作東京重音標準。比較與取捨見[9站比較](docs/learning-sites-comparison.md)，實際驗收見[補給驗收](docs/learning-support-validation.md)。主線114課、80情境與8套模擬保留，這32個補充單元另列。

## N2 首批新增

24 主課、48 文法重點、543 個詞形／讀音組合、71 個 N2 漢字、20 個生活／職場情境。每課有 503～581 字自編閱讀、聽讀與寫作；每日安排新增 8 概念、24 回想題。兩套自編卷各 70 題，語言知識・讀解 105 分鐘＋聽解 50 分鐘；短練為 15＋5 題、各區 5 分鐘。時間依 [JLPT 官方科目表](https://www.jlpt.jp/guideline/testsections.html)，題數是平台編排。

這是 N2 第一批原創試用材料，並非完整官方必考詞表、教師審定教材或合格保證。分級、目標、搜尋、筆順、能力練習、備份與約 62.7 MiB 的 N2 可選音檔包已整合。見 [N2 驗收](docs/n2-validation.md)；進一步網站豐富化見 [第四版完整規劃](docs/website-v4-plan.md)，該規劃的新功能尚未實作。

## 第三版學習循環

- 每日5／15／30分鐘、五十音／生活／N5／N4／N3／N2目標，推薦理由與中途接續。
- 38個概念、129道變式題、6組相似假名、12個六步深化單元。
- 概念與能力弱點、首次答案與提示保留；當天訂正與跨日回想分開。
- 每週回顧、文字原稿與修訂稿、完整schema3備份；V1／V2資料可保留升級。

本次交付V3.0；V3.1全量教材深化、V3.2試學效果調整仍為後續規劃，沒有聲稱已完成實證。

## 五十音記憶加練

208張字卡皆有原創字形／組字提示：基本字92、濁音40、半濁音10、拗音66。三種聽辨／平片配對／詞中補字覆蓋全部字卡，共624題；進階116卡另有組字與拍數題，合計740題。可選分類、逐行或分類混合，每輪最多5／10題，拗音小組維持3題，弱項優先並可續作。遮字默寫不在標題或畫板重顯範字；錯題與提示延續既有複習。じ／ぢ、ず／づ同音選項不互作聽辨干擾項。常用片假名詞與字形轉寫用途分開標示。驗收見`docs/kana-advanced-validation.md`。

[完整規劃](docs/kana-memory-design.md)、[進階驗收](docs/kana-advanced-validation.md)、[基本字歷史驗收](docs/kana-memory-validation.md)。記憶聯想不是字源；已補齊既有208卡，教材教師審校與實機驗收仍待完成。

## 延續第二版內容

| 內容 | 已完成範圍 |
| --- | --- |
| 假名入門 | 208字卡、18單元；認字、發音、逐筆示範、描寫、默寫、自評 |
| 生活起步 | 12課，各12詞、6句對話、2文法、短文、8題與文字任務 |
| 分級主線 | N5 24課、N4 30課、N3 36課、N2 24課，共114課；每課至少12詞、2文法、3漢字、6句對話、8題＋2讀解題 |
| 生活情境 | 20分類 × 4級，共80任務，各有詞句、對話、4～5題及寫作 |
| 詞庫 | 跨級去重3,441詞；N5標籤1277、N4標籤1519、N3標籤1740、N2標籤551，含銜接與生活擴充詞；主課詞附例句 |
| 漢字／文法 | 360個不同漢字、228個主課文法重點，另有24生活文法重點與8個文法補給 |
| 模擬練習 | 各級A／B，共8卷、560個獨立題；完整時間或每區5分鐘、續考、首答、錯題解析 |
| 素材 | 10,947份本機合成MP3索引；508份原始SVG及筆順資料；新增音檔解碼證據見N2驗收 |

主課、場景、生活、模擬與補給共2,232個固定自編題，另有假名及詞卡回想。分級是平台教材編排，並非官方固定必考詞表。每卷70題是平台編排，結果呈現原始答對率，不換算官方尺度分數或保證合格。

## 保存、複習與離線

- 每輪只記首次提交，提示使用跨刷新保存，不計為無提示成功；填空接受明示字形／讀音變體，排序用詞塊。
- 可依級別、能力抽最多10題，或練收藏詞卡；獨立模擬卷不混入這個題池。
- IndexedDB保存作品、草稿、進度、收藏、回想、模擬。第一版資料與備份可升級，原ID／作品保留；不同進行中模擬及分歧首答明示拒絕合併。
- 回想歷史最多100輪；先下載完整備份、確認已保存，再整理完成輪次。首次作答、作品、複習、未完成輪次保留，舊結果可合併備份恢復。
- 首次連線完成SW安裝後，文字與筆順可離線。K／生活／N5／N4／N3／N2音檔包約3.2／6.8／35.4／59.3／82.5／62.7 MiB，全檔SHA-256通過才標完成；失敗和取消保留既有完成包。
- 可用瀏覽器安裝功能加入桌面；iPhone可用Safari分享選單加入主畫面。仍需實機驗收；本機網址不能直接供另一支手機連線。

語音為 Microsoft Haruka Desktop（ja-JP）合成聲音；自編試用教材與音訊尚待獨立日語教師審校。文字與手寫採自評。使用者主動允許麥克風後可錄音回放，音訊僅留當次頁面，離開即釋放；不保存、上傳或自動評分。

## 開發與檢查

```sh
npm test
npm run build
npm run check
```

建置統一文字換行、重產離線包與shell雜湊、清理並輸出`dist/`。改內容或介面後先build再check。靜態版須透過HTTP開啟，不能用`file://`取代服務。

`?qa=1`使用獨立QA資料庫並略過SW；`?qa=1&offlineQa=1`可驗收離線。QA資料、個人作品／錄音／備份及憑證不得提交。第二版的既有測試與素材檢查保留；第三版驗收記錄見[第三版驗證](docs/v3-validation.md)；實際瀏覽器驗證單課、寫作、收藏、分科模擬、續作、備份，以及停止伺服器後離線播放。詳見[第二版驗證](docs/v2-validation.md)。

## 文件

- [第三版設計](docs/plans/2026-10-13-learning-v3-design.md)、[實作清單](docs/plans/2026-10-13-learning-v3-implementation.md)、[新增教材](docs/v3-content-review.md)
- [第二版設計](docs/plans/2026-10-12-learning-v2-design.md)、[實作清單](docs/plans/2026-10-12-learning-v2.md)
- [產品規格](docs/product-specification.md)、[完整課綱](docs/curriculum.md)、[畫面流程](docs/screens.md)
- [來源與授權](docs/material-sources.md)、[N5審查](docs/n5-content-review.md)、[N4審查](docs/n4-content-review.md)、[生活審查](docs/life-v2-supplement-review.md)
- [第一版驗證](docs/v1-validation.md)、[原樣稿](prototype/README.md)

`main` 更新時，GitHub Actions 先執行測試、建置、完整內容與素材檢查，再將 `dist/` 部署到 GitHub Pages；PR 只檢查、不發布。部署設定、線上驗收與回退方法見 [公開部署紀錄](docs/pages-deployment.md)。

後續需獨立教師逐課文字／審音、真實iOS／Android觸控與麥克風驗收，以及另行設定帳號與供應商的雲端同步。這些不由單一桌面瀏覽器測試推論已完成。
