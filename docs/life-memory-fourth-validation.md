# 生活日語記憶第四批驗收（v0.25.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-fourth.md)。重用92生活單元的原三句、原音檔，新增單句操作與短循環，不新增語言教材或計分題。

## 實際範圍

- `#life-cards/<unit>`：先選看中文想日文，或聽日文想意思。一次一句，中文模式日文／讀音預設收起，聲音模式中文／日文／讀音都收起，需主動播放或揭開。正常／0.75慢速使用原合成音。
- 揭開原句核對後才可自評。還想再練且後面至少有兩句不同卡時，排回隊尾一次；不足間隔則留到稍後。每句最多兩次、整輪最多六次，結尾只列最後自評與次數，不當成答對或熟練。
- 自評／方向／隊列只在當頁session暫存，離頁／刷新／換方向重置。參考曝光按原課全體qid保存lifeHints；只見中文提示不算曝光，聲音按鈕先保存參考再調用原media.play。失敗不揭答案或播音，待存資料沿用可匯出機制。
- 任一生活pending時整頁參考遮蔽，先回原UUID。結尾原課三題沿用life-memory及原題序，保存成功才導航；原首答、V1／V2／schema3、草稿及JSON備份保留，無新schema欄位或source。
- 入口整合每課三句、目錄、首頁及完成原輪的回顧。路徑列可回原課；寫一句／隔天／預告入口保留。

## 自動測試與獨立審查

新增23項：92課兩方向原句、先揭再評、不同卡間隔／六次上限／尾句不連刷、模式重置、預設隱藏／pending／結尾、HTML編碼、route/run/cursor過期事件、連按、延遲離頁、曝光與播放先後、保存失敗候選可匯出、原課三題來源、共pending與鍵盤焦點。

核心與介面獨立審查均無阻擋項。初審實跑22新測試／核心另跑86項生活測試。瀏覽器發現音訊按鈕因繼承column flex及130px basis而過高，改為專屬兩欄grid；播放保存期間disabled造成焦點掉到body，新增RED→GREEN回歸，僅在原按鈕仍連線且焦點沒移至其他控制項時復原。`3e4a7cf`經介面獨立複核23/23通過。

完整 `npm test` 539/539通過，`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點；208卡／508筆順／10947音檔索引與176生活字串檢查通過。

## 本機瀏覽器與資料界線

`http://127.0.0.1:18124/?qa=1`沿用前三批實際QA資料，沒有注入歷史、改時鐘或清DB。L07看中文模式先只有中文，第一句自評再練後依序第二／第三句，再回第一句，四次後收尾。聲音模式先無中文／日文／讀音，正常及慢速播放均顯示合成音正在播放，揭開才出原值。第三句自評再練時直接留到稍後，不連刷；結尾2句這次想起／1句稍後。刷新回到選方向，重新遮蔽。

結尾建立原課三題UUID `edcb263f-d87d-44bc-a549-f7e840a3daee`，中途直接開卡片頁顯示pending遮蔽，回同UUID。實際聽解外帶、填空「で」、理解選項提交後3題正確／3提示／0無提示，沒有把剛看過的參考算成獨立回想。完成後原L07三能力每日首筆仍各1筆、各1提示，不被同日重做灌高。

320px音訊按鈕修正後各48px，其他新按鈕48px以上；Tab可見，播放後保留原按鈕焦點，切卡聚焦卡片標題。N2飲食限制長句揭開在320/390/768/1024/1440px均無橫溢，新按鈕最小48px。console warn/error空。ignored截圖 `work/life-fourth-local-320.png`／`work/life-fourth-local-390.png`。

桌面寬度驗收不能替代iPhone／Android實機或真人語音審校；自評不表示發音正確、自由口說能力、正式JLPT成績或已驗證長期效果。原試用教材／教師審校邊界不變。個人答案／QA／草稿／截圖不提交公開Git。

## 發布驗證進度

本機HTTP UTC02:55:20通過145份shell逐檔SHA256／JS MIME／SW fingerprint及146次原音檔抽查，1次暫時連線重試。fingerprint `ba84bb13fdbc1c63344edf29635dc7943430435f7b7252b760ece1b501ce3bfa`，預設TLS驗證，紀錄ignored `work/life-fourth-local-http.json`。

- [PR #37](https://github.com/linhercherng/japanese-learning-platform/pull/37) head `6df8a9891d1cfe995c2430594dbc5ddaba3c359f`，同head [CI39892303731](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39892303731) completed/success後以match-head合併。
- merge `5d45a046cd85563b21aaf6135daa630cfce2ace9`；[Pages39892412038](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39892412038)整體completed/success，build/deploy皆success；deploy UTC02:58:56（台北10:58）完成。
- 正式[逐句回想卡](https://linhercherng.github.io/japanese-learning-platform/#life-cards/L07)與首頁／原課入口可用。UTC03:00:11正式145份shell SHA／JS MIME／SW及146次原音HTTP通過，1次暫時連線重試，fingerprint與本機相同；紀錄ignored `work/life-fourth-public-http.json`。
- 正式隔離QA走完中文先隱日文、第一句卡住→隔第二／第三句後重想→四次收尾。聲音方向先隱中日文／讀音，正常及慢速合成音可播、播放後保持按鈕焦點，揭開才顯原句；尾卡留到稍後，2句想起／1句稍後／3次收尾。320/390px無橫溢、新按鈕48px以上、console warn/error空。
- 原課三題UUID `8cd30859-f695-47cd-927a-a82409f57a89`保存後開始；卡片頁遇pending全遮蔽，回同UUID完成聽解／填空「で」／選擇。每日三能力仍各1筆原首答，聽解／理解各1無提示、填空1提示；原第一輪仍3答對／2無提示／1提示，未被加練改寫。
- ignored截圖`work/life-fourth-public-320.png`／`work/life-fourth-public-390.png`／`work/life-fourth-public-entry-390.png`。正常分頁載入至新shell下載後暫離網站，循SW正常生命週期接手，沒有清DB／快取／SW。正常庫僅驗首頁與卡片入口，未播放／揭參考／答題；所有新練習用隔離QA。QA與18124伺服器已關，正式入口保留。
- 實機、教師／真人審校及實際長期記憶成效未由本批推論完成。
