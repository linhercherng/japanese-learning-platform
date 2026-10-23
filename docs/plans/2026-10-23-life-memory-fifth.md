# 生活記憶第五批 Implementation Plan（v0.26.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃→實作→測試→GitHub→發布，沿用既有教材直接執行。

**Goal:** 每次只練一種能力，補到三題起步以外尚未練過的原題。

**Architecture:** life-skill/<unit>分聽解、自主填空／排序、情境／短文理解。純函式從cutoff內原題歷史排序最多三題；新life-skill source接原V3引擎，reference=unit:skill。原lifeHints、pending、回顧、小結及備份延續，無新schema欄位。

**Tech Stack:** Node22原生ESM、node:test、IndexedDB與PWA。

## 設計與取捨

前三批已建立三題、弱點與跨日節奏；第四批提供逐句雙向回想。比較再加翻卡、個人筆記與原題能力專練，選能力專練：讓學習者能自主選聽解、填空／排序或理解，也能練到原先固定三題之外的題。每次仍最多三題，避免擴充成長測驗。

- `#life-skill/<unit>`：92課，顯示每種能力的原題總數、實際練過題數、尚未練過與最近錯答／提示題數。題數是紀錄，非熟練。每能力一個明示按鈕，空能力禁用；缺unit回生活目錄。頁面不展示題目答案／音檔，不記參考。
- 選題只在同課同能力：最近錯答／提示→未練原題→到期→其他已練；若有未練原題，至少留一題給未練，避免弱點塞滿而永遠碰不到新原題；每組依較早作答及原ID穩定排序，最多三題，不湊別課／別能力或虛構變式。先按cutoff過濾attempts，再重建reviews；未來作答不能影響今日。
- 新source life-skill，reference為原unit與三種skill之一；原qid必須全部屬同課同能力、唯一、1～3題，queue只含原題不可加訂正。驗證／備份合併與生命週期涵蓋。所有生活來源共一pending，手動可再練，但不當隔日記住或重寫原首答。
- 結果標明能力專練及實際題數，回能力頁／原輪回顧／原課寫作／隔天及預告；地圖最近輪、路徑、每日收尾皆辨識新source。當天參考提示按原lifeHints判斷，正常聽解刺激不當額外提示。
- Controller只接受目前unit／skill、連按鎖定、保存成功才導航；延遲離頁不拉回、失敗候選可匯出、原pending回同UUID。無新教材、音檔或依賴，不改V1／V2／schema3。

## Task 1：選題、來源與備份

Files: app/core/life-skills.mjs、app/content/life-memory-ids.mjs、app/core/v3-state.mjs；tests/life-skills.test.mjs。

- [x] 先紅：92課能力分類完整、同課／同能力／最多三題、弱點／未練／到期順序、cutoff、唯讀摘要、合法與錯誤reference／來源／qid／queue、共享pending／備份、提示與原首答。
- [x] 最小實作，node --test tests/life-skills.test.mjs綠並提交。

## Task 2：手機介面與接續

Files: app/life-skills.mjs、app/ui/life-skills.mjs、main／navigation／life-memory／life-review／life-cards／v3 UI與CSS；tests/life-skills-ui.test.mjs、tests/life-skills-controller.test.mjs。

- [x] 先紅：三能力／真數字／pending／無答案與錯誤路徑、結果與原輪／來源導覽、連按／過期／失敗匯出／延遲離頁／舊pending。
- [x] 實作、生活測試通過，提交；獨立核心與UI審查及必要修補。

## Task 3：驗收與發布

- [x] 隔離QA每種能力原題、未練題補齊、提示與三題／單題文案、pending／刷新、日文填空／原排序、320/390px／鍵盤／console與原首答；跨日用固定時間自動測試。
- [x] 版本0.26.0及README／規格／課綱／畫面／來源／驗收，npm test→build→check、audit與shell SHA／JS MIME／SW、146原音HTTP。
- [ ] 同head CI成功合併、Pages成功、正式HTTP與隔離UI／截圖、正常SW更新，補證據push遠端一致並關QA／server。

回退先匯出JSON，舊版可能不認life-skill，不清DB／快取／SW。個人答案／草稿／QA不進Git。實機、真人／教師審校及真實長期學習成效不由本次自動或桌面測試推論完成。
