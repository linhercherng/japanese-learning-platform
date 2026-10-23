# 五十音記憶剩餘整合 Implementation Plan（v0.21.0）

> REQUIRED SUB-SKILL：superpowers:executing-plans。使用者授權規劃、實作全部剩餘五十音記憶環節、測試、GitHub及發布；沿用既有視覺與頁面，不另設確認關卡。本清單追蹤任務。

**Goal:** 把前十六批已可用的記憶練習整理成初學者找得到、接得下去、能回找自己線索的完整循環。

**Architecture:** 今日推薦使用唯讀時間快照與既有排程，擴充kana-path；線索簿延伸kana-notes索引、既有草稿／保存與曝光機制；kana-guide以靜態路線解釋既有工具。無新source、題目、能力評分、持久欄位或付費後端，schema3不遷移。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、既有音檔／PWA；無新依賴。

## 盤點與範圍

原A基本字與B音韻／組字均已由208卡訣竅、740加練、家族／行段／平片／拍數交付；C的混淆追蹤、514詞中題、個人線索、跨日／七日證據、小結及口袋循環已交付。缺口是kana-path只接續弱點輪、各工具分散，以及線索索引無搜尋／篩選且草稿難找。本批完成這三項整合與總驗收，不再無限切成相似遊戲。D教師審校／真人聲音、實機與依真人試學調整份量需外部證據，維持待驗證，不能以程式推論。

比較堆更多題、重新做一套App、整合既有循環，選第三項。首頁保留原導航，只增指南／線索簿入口；kana-path首屏只有一個建議動作，其餘選法收進details，完整指南可以自由查看，不鎖關。

## Task 1：今日一小步（先紅後綠）

Files：app/core/kana-next.mjs、app/ui/kana-focus.mjs；tests/kana-next.test.mjs、tests/kana-next-ui.test.mjs。

- [x] 以time為cutoff重建attempts/reviews，過濾未來開始與提示，純函式不寫state。較早開始的pending不因未來更新消失；completion／lock按cutoff判斷。先接kana輪／未完成默寫，不顯示題目／答案／字形。
- [x] 無pending則七日→隔天→弱點三題→口袋→首次三字；當日已完成同source不重複推薦。今天已有練習且無待做項目時提供收尾小結，顯示實際字數，不宣稱熟練。候選不足不造題，未來資料不改今日路徑。
- [x] 紅測試→最小實作→相關綠→提交；測空白、分能力、同日完成／提示、日期邊界、future review與pending、唯讀備份、題目不洩漏、原工具仍可選。

## Task 2：可回找的線索簿（先紅後綠）

Files：app/core/kana-notebook.mjs、app/ui/kana-notebook.mjs、app/ui/kana-lab.mjs、app/kana-lab.mjs；tests/kana-notebook*.test.mjs。

- [x] 搜尋假名／讀音／自己的文字，平片／四種分類／口袋／有草稿篩選；保存與草稿聯集，清楚標示未保存。每頁最多10筆，清除篩選與上下頁，空結果能復原，不改線索／草稿／答案。
- [x] 表單明示提交，IME組字不誤送；路由／過期事件守護，翻頁／篩選焦點保留。曝光只取實際顯示的當頁字形與文字；篩掉或未翻到的文字不預記，明示記為提示。同步七日／默寫cache、失敗可匯出；舊單字編輯／保存機制保留並補齊實際文字曝光。
- [x] 紅→綠、真控制器與備份／編碼／分頁曝光測試→提交。

## Task 3：完整指南與完成矩陣

Files：app/ui/kana-guide.mjs、app/main.mjs、app/ui/navigation.mjs、app/ui/kana-focus.mjs、app/ui/kana-studio.mjs、app/ui/kana-coach.mjs；tests/kana-guide.test.mjs；docs/kana-memory-completion.md、README、規格／課綱／來源、package版本。

- [x] 六段指南：少量認字、同音雙形、標記組字、拍數、生活運用、跨日回想；每段說怎麼練與如何知道下一步，連到已存在工具。保留筆順／默寫、不同生活詞、口袋／雙卡等全部入口，導覽有來源且無答案。
- [x] 文件把A/B/C各原規劃映射實作與驗收，D外部驗證獨立列示；版本0.21.0，無新教材、音檔、依賴或schema。新指南路由測試先紅後綠，提交。

## Task 4：完整測試與發布

- [x] 全npm test→build→check→audit；依requesting-code-review獨立審查，必要修補重驗。
- [x] 本機隔離UI：空白推薦→起輪→接續、線索保存／草稿→搜尋／篩選→空結果／復原、指南連結、原編輯與既有筆順／練習路由；320/390px、44px、鍵盤、console、HTTP shell SHA／音檔；IME事件由Node控制器驗證。
- [x] PR同head CI通過後合併，Pages成功；正式HTTP／隔離瀏覽器、舊資料及新入口、截圖；補驗收及發布文件push、遠端一致、清理QA/server。見[本批驗收](../kana-memory-completion-validation.md)。

## 共同邊界

不增加答對事件、不改原題ID或首答、不自動改口袋、不把同日提示算無提示；手寫及發音獨立。保留本機備份與失敗待存匯出、舊V1/V2/schema3資料。原試用教材與合成音待教師審校、實機依先前決定略過，不寫入個人資料／QA。回退用revert重發，先匯出JSON、不清DB。
