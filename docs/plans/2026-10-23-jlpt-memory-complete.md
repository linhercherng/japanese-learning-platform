# N5～N2 記憶與複習完整實作 Implementation Plan（v0.37.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者要求一次規劃、實作、測試與發布，不分批，不另設樣稿或合併確認關卡。

**Goal:** 讓114分級主課都有少量主動回想、五能力補強、個人線索、跨日確認與可回找的紀錄。

**Architecture:** 沿既有原題／V3作答、IndexedDB schema3及原課素材，新增jlpt來源與optional jlptHints。新route共用一個控制器；參考按需保存後才揭露。五十音／生活／V1/V2與獨立模擬卷保持。

**Tech Stack:** Node22 ESM、node:test、原生form／textarea、現有PWA；無新依賴、帳號或語言教材。

## 決策與範圍

重造題庫需要教師審校；另造遊戲會增加學習負擔。本版選擇原課知識卡＋原題少量回想＋跨日證據，所有N5/N4/N3/N2主課一次覆蓋。原1140道主課題排除既有不可靠N4-12-G2，共1139題；不混入模擬卷、生活情境題或詞庫自動題，不宣稱官方固定詞表或檢定合格評量。

- jlpt-path/<level>：先接activeExam、未完成新原輪或目前V2主課練習；今天本級已有完成輪可收尾。再七日→隔天→弱點→新課；不自動起輪或改完成度。
- jlpt-memory[/<level|unit>]：級別、課名／目標搜尋與已練／弱點／有個人線索篩選，10課分頁；單課三題（語彙／文法／聽解）與五能力各最多三題，實際不足即少量、不湊新題。導航保留級別、課名、步驟。
- jlpt-cards/<unit>：語彙／文法／漢字三類，原教材每次三張、看意思想日文／看字想詞例，主動翻開才見讀音／例句／接續／差異。想再練的暫存排到至少兩張之後；每張最多重現一次，沒有足夠間隔留下一輪。自評不新增attempt或熟練度；下一組涵蓋所有原項目。音訊沿原索引，保存參考成功才播放。刷新／離頁收起。
- jlpt-review/<level>:check|week|repair：原題最多三題、每課最多一題；較早日期且今天未練才隔天；七日自最後實際練習與參考相隔7個台北日期。錯答／提示與到期優先。隔天／七日每級每日一輪，新來源全級共一pending。
- jlpt-map/<level>：114課各自原題練習／弱點／日期、五能力每日首答、最近輪次；首答、提示、自評、作品與模擬分開。jlpt-round/<id>預設不露原答案／解說，按需逐題回顧，原值與時間保持；回原課輸出／手寫。
- jlpt-note/<unit>：160字個人聯想，自動保存於text:JN-<unit>，不覆蓋文字作品稿；預設收起、主動開啟保存參考。可在課程目錄篩有線索，JSON保留；同時戳異文合併拒絕、空稿保持，失敗可匯出。
- jlpt-guide：完整六段指南與各工具何時用；首頁、主線、單課、練習、模擬首頁有入口，保留所有舊深連結。

## 保存與公平性契約

來源jlpt-memory／jlpt-skill／jlpt-check／jlpt-week／jlpt-repair使用原qid。raw content IDs模組避免catalog／learning循環；合法reference／級別／能力／題序／最多3題／無插入訂正／日期及單pending嚴格驗證。jlptHints每日每題最早時間、總20000，合併保留不同日期較早值，曝光若與無提示首答矛盾則拒絕，不改歷史評分。

新翻卡／音訊／原輪解說先await保存再展示，失敗不揭；原study學重點／詞與字／聽讀及展開寫作參考、V2/V3原主課題提示／答後沿實際可見內容記曝光。V2/V3原題答題納入已保存同日／本輪曝光；七日來源另看前7日期。正常聽解刺激音不當答案提示。跨日比較排除提示、沒有較早記錄、中間先練與相同時間重疊；cutoff重建reviews，不被未來紀錄影響。

控制器busy、ref／route epoch、過期按鈕／離頁等待、IME／pointerdown→blur/compositionend→click保護；選字中不重繪，個人文字編碼、input不重繪、最新稿cache與待存匯出保留。activeExam與未完成原輪時所有新參考／線索／回顧收起，只提供接續；不得取代原輪。

## Task 1：原題、狀態與排程

Files: app/content/jlpt-memory-ids.mjs、app/core/jlpt-memory-state.mjs、app/core/jlpt-memory.mjs、app/core/v3-state.mjs、app/core/v3-learning.mjs、app/core/learning.mjs；tests/jlpt-memory.test.mjs。
- [ ] RED→GREEN：114課／1139原題、五能力、固定三題、strict來源與hint／note／backup、cutoff／跨日／七日／弱點／每日唯一／pending／原首答不變，分次提交。

## Task 2：完整路線與記憶介面

Files: app/jlpt-memory.mjs、app/ui/jlpt-memory.mjs、app/ui/jlpt-guide.mjs、app/main.mjs、app/ui/navigation.mjs、app/ui/v3.mjs、app/ui/study.mjs、app/v2.mjs、app/ui/courses.mjs、app/ui/exam.mjs、app/v3.css；tests/jlpt-memory-ui.test.mjs、tests/jlpt-memory-controller.test.mjs。
- [ ] RED→GREEN：六種路線／級別搜尋／地圖／卡組／個人線索／原輪回顧、IME／延遲保存與失敗／ref與epoch／雙擊、V2/V3提示與原study曝光、48px控制／18px輸入／focus／HTML安全／返回與刷新。

## Task 3：整包驗收與發布

- [ ] 完成矩陣、README／規格／課綱／畫面／來源／路線與0.37.0；完整test→build→check／audit。
- [ ] 獨立唯讀核心與UI審查，必要修補複核；本機隔離QA四級、三題／五能力／卡組／線索／回顧／pending同UUID／舊資料／備份，320／390／768／1024／1440、Tab／console／截圖；HTTP shell SHA及原音抽樣。
- [ ] 同head PR CI→merge→Pages build/deploy→正式HTTP／正常SW與隔離UI／原資料；記錄證據並push遠端一致，恢復正常入口／viewport／停server。

不清DB／cache／SW、不注入瀏覽器歷史或虛構跨日作答。回退先匯出JSON，舊版可能不識新source／hint／note，保留資料。教師／真人／實機OS鍵盤與跨日真人學習成效另需外部證據；本版不改正式檢定規則或新增未審校教材。
