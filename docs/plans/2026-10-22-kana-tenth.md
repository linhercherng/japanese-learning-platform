# 五十音記憶第十批 Implementation Plan（v0.14.0）

> 執行流程：superpowers:executing-plans；使用者已授權規劃、實作、測試及GitHub／Pages公開發布。延續已驗收介面，直接完成。

**Goal:** 深化既有一拍一格，把自行數拍、對照與同類三題接成可保存的小循環，練記拗音、促音、撥音與長音。

**Architecture:** 沿用 `kana-beats/<card>` 12張卡與4組既有拍格，不另加導覽入口。新增12個穩定 `kr:<card>` 聽音選拍數題、source=kana-rhythm、reference=原來源card，按同組固定輪轉三題。每組只留一個pending，其他同組卡接續原來源與題目。optional v3.rhythmHints保存12詞拍格曝光時間，不遷移schema3、舊ID或個人資料；與字卡聽辨能力分開。

**Tech Stack:** Node22 ES modules、node:test、既有IndexedDB／合成音與PWA；無新依賴、圖片或錄音。

## 設計與邊界

在「再加逐字隨機題」「新計時遊戲」「深化既有節奏卡」中選第三項。每次只做三題、無倒數與連勝；先讓使用者自己估拍，再看差異。點按只是自行估計，不偵測點拍時間或自動評分發音。

1. 拍格對照新增「你數了X拍／參考Y拍」差異說明；0次時請先聽數，收起與重置仍可使用，數拍不新增attempt。
2. 聽音數拍三題：完整詞音、正常／慢速各一鈕，四個拍數選項；無提示不顯示詞形、讀音或拍格。首答之後顯示完整分拍與既有說明。題目reviewItem為自身kr ID，dimension=listening，不能提高單一假名的認字／聽辨記憶地圖分數。來源頁有同組pending時只接續，收起對照、估拍與音鈕。
3. 首答／提示／續作及最近結果：看過該詞拍格或答案，記錄rhythmHints[card]最新時間；同日／本輪內曝光使新首答hinted，不提前開解說、不回寫原答案。個別字卡線索不等於看過整詞分拍；這裡無提示只指沒有本輪／同日拍格答案提示，不宣稱跨日掌握。備份驗證12個合法card與ISO時間，合併保留較晚時間。看拍格／答後回饋的實際假名曝光仍同步七日未答題及默寫草稿／快取。

題目與三題原順序嚴格驗證；queue不接受別組／別題。刷新收起暫存數拍與對照，保存原輪與答案。等待保存離頁不強制跳回，保存失敗保留待存匯出。導覽／返回至原始kana-beats/card，不回到不相干入口。共用的每日與到期複習依實際kr題識別套提示，不只限定專屬source；V2／V3答後與明示提示才記拍格及假名曝光，不能漏記或回寫原首答。

只沿用12詞既有人工編排的分拍，不做任意詞的自動斷拍。規則於2026-10-22重查[東京外國語大學拍感覚基礎](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/01-10-01.php)、[促音](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/02-01-01.php)、[長音](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/02-02-01.php)與[撥音](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/02-03-01.php)。僅核對概念，不轉載錄音或圖片。新題目是既有試用拍格的衍生編排，仍待教師審校。

## Task 1：拍數題與保存核心

Files：新增app/content/kana-rhythm.mjs、app/core/kana-rhythm.mjs、tests/kana-rhythm.test.mjs；修改catalog、v3-state、v3-learning。

- [x] 先失敗：12題／4組／12來源固定三題、正確拍數／完整詞音／K包、嚴格reference／queue、同組續作、獨立reviewItem、同日／前日／未來／跨日輪內提示、首答不回寫、optional曝光驗證／合併與備份。
- [x] 實作rhythmQuestions／rhythmIds／validRhythmReference／rhythmCueSeen、startRhythm／pendingRhythm／recordRhythmExposure及來源；先綠新測試，再完整test、build後check，提交。

## Task 2：既有卡片與三題整合

Files：修改app/kana-focus.mjs、app/ui/kana-focus.mjs、app/v3.mjs、app/ui/v3.mjs、app/v2.mjs、app/ui/study.mjs、app/main.mjs、app/ui/navigation.mjs；新增UI／controller測試。

- [x] 先失敗：猜拍比較、隱藏詞形與恰好兩音鈕、來源回返、pending整組卡收起、刷新／過期動作／延遲與失敗保存、拍格／回饋曝光同步七日與默寫草稿快取。
- [x] 實作數拍對照、三題開始與最近結果、V3拍格曝光／警語／專屬結果說明；test、build／check、版本v0.14.0，提交。

## Task 3：驗收與發布

- [x] 隔離瀏覽器4組／12卡、估拍／對照／三題正錯提示、刷新／同組續作與原來源、正常慢速音；320／390px與44px／鍵盤焦點／console，既有行段與家族回歸。
- [x] 獨立審查、完整test／build／check／audit、shell hash／JS MIME／SW與音檔HTTP；同步README／課綱／規格／素材／驗收。
- [ ] PR、CI、相同head合併、Pages、正式HTTPS與瀏覽器驗證／截圖、發布紀錄、remote一致；清理QA頁、server及尺寸。

實機依先前決定略過，不宣稱系統IME、真人發音或手寫驗收。QA資料／音檔與個人資料不可提交，證據放ignored work。回退前匯出JSON，舊版可能不識別新來源／optional rhythmHints，保留備份等新版，不清IndexedDB。
