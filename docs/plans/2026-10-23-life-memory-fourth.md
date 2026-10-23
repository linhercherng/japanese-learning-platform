# 生活記憶第四批 Implementation Plan（v0.25.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃、實作、測試及發布，直接按本清單執行。

**Goal:** 把既有每課三句變成一次一句、先想再看、隔句再想的短循環。

**Architecture:** life-cards/<unit>重用92課的memoryPhrases與原音，純函式暫存輪次＋獨立controller；參考沿用lifeHints，三題回想沿用life-memory source。無新schema、材料或成績來源。

**Tech Stack:** Node22 ESM、node:test、原生DOM／IndexedDB／PWA。

## 設計與取捨

比較新增更多統計、收藏線索與逐句回想，選逐句回想。前三批已能選課、練三題、看弱點和安排日期；本批減少同屏內容，增加自己提取的機會。個人線索持久化另有備份及資料衝突負擔，這次不加。

- 從既有單課、生活目錄、原輪回顧與首頁進入。新頁先選「看中文，想日文」或「聽日文，想意思」，每次一張，不自動播放。前者顯中文、日文及讀音收起；後者先有聲音按鈕，中文、日文、讀音均隱藏。揭開後才可自評，聽音可正常／慢速、明示合成音。
- 最多3句，語料與原課完全相同。每句先回想→主動揭參考→自評「這次想起來／還想再練」。再練僅在之後至少還有兩句不同卡時排隊一次；同句最多2次、整輪最多6次。若間隔不足或已重想一次，留到之後，不強迫連續翻同一句。
- 自評、方向、隊列只在當頁session暫存。換方向／離頁／刷新收起並重新開始；不寫attempt、自評成績、完成課程或熟練度。結尾明示是最後一次自評、尚想再練句數及下一步，接原課三題、寫一句、隔天與預告。
- 揭日文／中文答案與按音皆記本課原題lifeHints（例句沒有唯一qid映射，保守記整課），當日三題仍另列提示；隔天／七日原規則保留。只看中文（中文模式）及尚未按音不產生曝光。self-eval不算跨日。
- 任一生活pending時整頁卡片遮蔽並優先接續原UUID。新三題需保存成功才導航；過期route／run／cursor事件、連按、延遲儲存離頁皆守護。參考曝光寫入失敗不揭答案，待存資料沿用既有可匯出機制；不清DB。
- 保持現有暖色、字體與按鈕樣式，無翻轉動畫或滑動捷徑；使用清楚文字按鈕與可見鍵盤焦點。卡片切換聚焦卡片標題，模式／返回路徑可辨；320/390px至少44px。

## Task 1：純回想循環

Files: create app/core/life-cards.mjs；tests/life-cards.test.mjs。

- [ ] 先紅：92課三句原值、錯誤unit/mode、先揭再評、隔兩句且最多一次重排、尾卡不連刷、最長六次、方向／重新開始隱藏、自評不改學習state。
- [ ] 實作create/reveal/rate/summary純函式；node --test tests/life-cards.test.mjs通過，提交。

## Task 2：介面、曝光與接續

Files: create app/life-cards.mjs、app/ui/life-cards.mjs、tests/life-cards-ui.test.mjs、tests/life-cards-controller.test.mjs；modify app/main.mjs、app/ui/navigation.mjs、app/ui/life-memory.mjs、app/ui/life-review.mjs、app/ui/v3.mjs、app/v3.css。

- [ ] 先紅：兩方向預設隱藏／原參考／音檔、pending／錯誤路徑、結尾、HTML編碼、原輪返回；曝光、刷新／離頁／舊事件、連按、失敗可匯出、共pending及三題原source測試。
- [ ] 最小實作→生活測試全綠→提交。聲音由原media.play明示調用，成功保存曝光後才播放，避免舊事件的聲音副作用。

## Task 3：驗收與發布

- [ ] 獨立核心／UI審查及必要修補；本機隔離QA兩方向、隔句重想、結尾三題、原輪保留、pending遮蔽、離頁／刷新／鍵盤／320/390px／console。
- [ ] 版本0.25.0，README／規格／課綱／畫面／來源／驗收；npm test→build→check、audit、shell SHA／JS MIME／SW及146原音HTTP。
- [ ] PR同head CI成功合併、Pages成功、正式HTTP與隔離UI／截圖、正常SW接手、補發布證據push遠端一致；關QA／server。

真實記憶成效、實機、教師／真人語音審校保留為未完成。所有QA實際點擊，不注入虛構跨日歷史；答案／草稿／截圖留ignored work。沿用schema3／V1／V2及原首答／備份。
