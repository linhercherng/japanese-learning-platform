# 生活記憶第六批 Implementation Plan（v0.27.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃、實作、測試與發布，按本清單直接執行。

**Goal:** 用自己的生活情境與短線索幫助回想，仍然先自己想、需要時才看。

**Architecture:** life-notes目錄與單課編輯頁，92課各160字。schema3 optional lifeNotes及text:LN-<unit>草稿，依時間合併且同時衝突拒絕；個人文字展開／輸入沿用lifeHints，原首答與來源不改。

**Tech Stack:** Node22 ESM、node:test、IndexedDB、原生表單／IME／PWA。

## 設計與取捨

比較再加練習模式、成績圖表與個人線索，選個人線索。前五批已有原句回想、分能力、弱點及跨日路線，本批讓學習者記一個自己的情境或提醒，不新增未審校教材，也不自動評作文自然度。

- 每課一則最多160字，提示可寫「在哪裡用、跟誰說、先抓哪個詞、哪裡常忘」。個人聯想與原教材分開，不當正式文法解說。保存需明示按鈕，打字只存草稿；空白保存以有時間的空文字保留移除意圖，不復活舊已保存線索。
- `#life-notes/<unit>`預設收起個人文字／草稿，顯示有無線索／草稿狀態。主動展開才出textarea，保存／收起後回想原課三題、逐句卡或能力專練；離頁、刷新換課皆收起。任一生活pending時，個人文字及表單全遮蔽，接續原UUID。
- 非空個人文字／草稿實際展開、輸入、保存時保守記本課全體原qid的lifeHints（線索與題目沒有唯一映射）。空編輯器不記；目錄不展示線索正文／預覽，不造成參考。原提示／隔天／七日規則延續，線索不是作答或熟練度。
- `#life-notes`索引合併已保存線索與草稿，以程度、場景、已保存／待保存篩選，查原課標題或自己的文字，最多10課一頁；草稿空字也可找到。只顯示課名／程度／狀態／日期，不預覽文字。沒有線索時可回目錄選課，不顯示假資料。
- 儲存：optional lifeNotes最大92筆，每筆text／updatedAt；text:LN-草稿限制160字、無points、unit合法。備份舊schema維持；新舊note按實際時間較新者，同一時刻不同文字拒絕合併，空note是墓碑。草稿同時衝突亦拒絕；已保存較新／同內容的舊草稿去除，較新草稿保留。失敗候選及最新輸入可匯出。
- Controller明示form保存、IME選字不誤送；input不重繪避免丟選字；保存期間繼續輸入不清新草稿。單課／索引各有namespace、route epoch與延遲離頁守護，連按鎖、保存成功才顯已保存。未知unit、空索引、清除篩選與頁碼都可復原；HTML編碼與鍵盤焦點可見。

## Task 1：資料、草稿、合併與索引

Files: create app/core/life-notes-state.mjs、app/core/life-notes.mjs；modify app/core/learning.mjs、app/core/v3-state.mjs；tests/life-notes.test.mjs。

- [x] 先紅：92合法unit、長度／時間／欄位／草稿驗證、明示保存／空墓碑、舊備份／新合併／同時衝突、草稿對消／新草稿、保存不改首答／提示與pending守護、索引搜尋／篩選／10筆／空草稿／不曝光。
- [x] 實作純函式與原備份接合，測試綠後提交。

## Task 2：提示退場與手機操作

Files: create app/life-notes.mjs、app/ui/life-notes.mjs；modify main、navigation、life-memory／life-review／life-cards／life-skills UI；tests/life-notes-ui.test.mjs、tests/life-notes-controller.test.mjs。

- [x] 先紅：正文預設隱藏、pending全遮蔽、原課返回、HTML編碼、真實狀態與空結果、輸入／IME／保存／延遲離頁／連按／失敗匯出／新草稿保留、索引不曝光與表單翻頁。
- [x] 實作、生活測試通過，獨立核心／介面審查及必要修補。

## Task 3：驗收與發布

- [x] 隔離QA中文／日文線索、草稿刷新／保存、收起／提示與原輪、索引搜尋篩選、pending／原首答、320/390px／鍵盤／console；保留原資料。
- [x] 版本0.27.0及README／規格／課綱／畫面／來源／驗收，npm test→build→check、audit、shell SHA／JS MIME／SW與146原音HTTP。
- [ ] 同head CI成功合併、Pages成功、正式HTTP／隔離UI及截圖、正常SW更新；補證據push遠端一致、關QA／server。

不清DB／快取／SW。回退先匯出JSON，舊版可能不認lifeNotes，保留原備份；個人線索／答案／草稿／QA不進公開Git。實機、真人／教師審校及長期記憶效果另列未驗證。
