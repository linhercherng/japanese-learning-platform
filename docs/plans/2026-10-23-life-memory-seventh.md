# 生活記憶第七批 Implementation Plan（v0.28.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃、實作、測試、GitHub與發布，依本清單直接完成。

**Goal:** 同一主題換到不同已學場景，練習分辨情境，每次最多三題。

**Architecture:** life-topic目錄與topic:ceiling單頁，從cutoff內真實已練原題挑同主題／程度上限內最多三個不同單元，一課一題。life-topic source接原V3引擎、lifeHints、pending、結果／回顧／每日收尾，維持schema3及既有筆記與備份。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原生select、PWA。

## 設計與取捨

比較更多單課卡片、成績圖表與同主題跨課回想，選第三者。前六批已有原課三句、逐句卡、能力專練、跨日與個人線索，本批幫助從一課走向不同場合。只重組既有436原題，不新增語言教材、題目、音檔或依賴。

- 20個既有主題，各顯示程度上限內總課數、實際練過課數與可回想題數；以L→N5→N4→N3→N2為上限，預設L，選擇與返回都留URL（life-topic/N5與life-topic/food:N5）。初始沒有歷史顯示0，回原課學習。
- 選題：cutoff內有效維度生活attempts重建reviews與每qid最近首答；只用已做過的原題。同主題且不超過上限，最近錯答／提示→到期→其他已練；各組較早作答及qid穩定排序，依次去除重複unit，最多三題，不拿新題或其他主題湊數。只有一課就明示本次單課，不宣稱跨課。
- 開始前不顯示原題、例句、筆記或課名答案線索，只顯示程度／主題／數量；主頁查詢不記提示。pending先接同UUID、原qid／答案／草稿不換題。當日看過本課參考，沿用lifeHints另列提示。
- 新source=life-topic，reference=topic:ceiling；1～3個唯一qid、不同unit、同主題、程度上限內，queue只含原題。raw metadata與catalog共用主題對照，避免驗證循環／映射漂移；舊sources與schema3保持。
- 結果說明實際題數／課數、同日加練非跨日記住；接逐題原輪回顧、原課卡片／能力／線索、每日收尾、隔天與七日。來源路徑、最近五輪與舊資料辨識新source。
- Controller只接目前route／reference，連按鎖、保存成功才導航、route epoch防延遲拉回；無題數變動可復原，有pending優先接續。select留URL、未知topic／level有復原入口，表單標籤／焦點／48px觸控、HTML編碼沿用手機規則。

## Task 1：選題與來源驗證

Files: create app/content/life-topics.mjs、app/core/life-topics.mjs；modify app/content/catalog.mjs、app/content/life-memory-ids.mjs、app/core/v3-state.mjs；tests/life-topics.test.mjs。

- [x] RED：92課raw/catalog一致、20主題×5程度、cutoff／review重建、弱點→到期順序、不同unit最多3、沒歷史／未知值／空集合、一課少量、來源qid／topic／ceiling／queue驗證、共同pending、備份／衝突／原首答／提示／每日收尾。
- [x] 最小實作，測試GREEN並提交。

## Task 2：手機主題回想與流程整合

Files: create app/life-topics.mjs、app/ui/life-topics.mjs；modify main／navigation／v3結果、life-memory／life-review／life-skills／courses入口、v3.css；tests/life-topics-ui.test.mjs、tests/life-topics-controller.test.mjs。

- [x] RED：目錄真數字、上限／topic URL、無正文曝光、pending／未知／空狀態、單課與跨課文案、結果與原輪、HTML、連按／失敗候選／延遲離頁／舊reference／select路由。
- [x] GREEN，獨立核心及UI審查；必要修補先RED再GREEN。

## Task 3：驗收與發布

- [x] 隔離QA原題作答、刷新／原UUID／草稿、舊首答／筆記保留、主題與上限／空狀態；320／390px觸控尺寸、鍵盤／路徑／console；不清資料或偽造跨日紀錄。
- [x] 版本0.28.0與README／規格／課綱／畫面／來源／驗收；npm test→build→check、audit，逐檔shell SHA／JS MIME／SW及146原音HTTP。
- [ ] push／PR同head CI通過／merge／Pages完成，正式HTTP與隔離UI／截圖、正常SW更新、文件證據push遠端一致，關QA／server。

教材／教師與真人審校、OS日文鍵盤／實機與長期記憶效果未由本次推論完成。回退先匯出JSON，舊版可能不認life-topic source；保留DB／備份，個人資料不進Git。
