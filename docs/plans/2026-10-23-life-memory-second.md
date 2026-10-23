# 生活日語記憶第二批 Implementation Plan（v0.23.0）

> REQUIRED SUB-SKILL: superpowers:executing-plans。使用者已授權規劃、實作、測試、GitHub及發布，沿用既有畫面／教材，直接執行；本清單追蹤工作。

**Goal:** 用「生活記憶地圖 → 原輪逐題回顧 → 弱點最多三題 → 隔天確認」讓學習者知道如何接續，容易學、容易記。

**Architecture:** 新增life-map與life-round/<sessionId>，重用V3首答、題目與lifeHints。life-repair新source與life-memory/check共一pending；無新schema欄位、依賴、素材或語言教材。

**Tech Stack:** Node22 ESM、node:test、原IndexedDB與PWA。

## 設計與取捨

比較新增口袋收藏狀態、七日固定測驗、從真實首答導向弱點，選第三項。第一批已提供隔天一輪；本批先解決「不知卡在哪裡、答後看懂卻不知接著練什麼」。避免再加一套收藏／自評計分。新日語題與記憶規則仍需教師審校，因此本批只重用原題與原解說。

- **記憶地圖 `#life-map`**：92課，程度／場景／範圍篩選。顯示練過幾道原題、幾個台北日期、最近需加練題數；小結按聽解、自主填空／排序、理解選擇分開，以同題同日首筆統計，時間重疊另列，手寫／自由作文不混入。沒有熟練百分比。cutoff先篩attempts，再重建reviews／排序，不使用未來紀錄。推薦優先共用pending、今天可做隔天複習、弱點三題、未練課；皆是可點的穩定路徑。
- **逐題回顧 `#life-round/<原輪ID>`**：只顯示已完成的新生活來源原輪，保留原題序、原值與正誤／提示，不重評或寫attempt。預設只看題目回想，展開後才看原首答／正解／原解說；選題與刷新收起。回顧音檔與實際揭開解說記原qid曝光；正常練習聽解刺激音仍不當答案提示。若任一生活來源pending，整個回顧先遮蔽並提供接續。可回原課少量參考或寫自己的句子。日文與使用者答案皆HTML編碼。
- **弱點三題**：從cutoff內已做過、最近仍錯答／用提示的原題，先錯答再提示、較早到期／原時間／ID排序，每課最多一題、最多三題。不湊未練題。新source `life-repair` reference台北日期；共用一pending，刷新續同UUID；已完成可再加練，明示同日加練非跨日成功。來源日期／qid歸屬／無重複三課／無訂正插題納入validator／備份。結果連原輪回顧、地圖與隔天。
- **控制器**：namespace `data-life-review-action`，start保存後才導航，busy／過期路由／ID／題序守護，延遲保存離頁不拉回。實際展開後記曝光，焦點回原按鈕；曝光矛盾先拒絕，失敗保留合法原資料／可匯出待存資料。原V2完整輪與舊V3不取消。

## Task 1：核心與資料

Files: `app/core/life-progress.mjs`、`app/core/life-memory.mjs`、`app/content/life-memory-ids.mjs`、`app/core/v3-state.mjs`；`tests/life-progress.test.mjs`。

- [x] 先紅：未練／錯答／提示／cutoff／重疊首答／能力分開、弱點三課／不湊新題、共享pending／來源日期與備份衝突、只回顧完成原輪且不改寫首答。
- [x] 實作純函式，`node --test tests/life-progress.test.mjs tests/life-memory*.test.mjs`綠；提交。

## Task 2：手機介面與控制器

Files: `app/life-review.mjs`、`app/ui/life-review.mjs`、`app/main.mjs`、`app/ui/life-memory.mjs`、`app/ui/v3.mjs`、`app/ui/navigation.mjs`、`app/ui/courses.mjs`、`app/v3.css`；`tests/life-review-ui.test.mjs`、`tests/life-review-controller.test.mjs`。

- [x] 先紅：篩選／空狀態／下一步、原輪編碼／首答／隱藏提示、pending遮蔽／單一返回路徑、弱點三題入口。
- [x] 控制器逐題／刷新／實際曝光／音／焦點／連按／過期／延遲／失敗匯出測試綠；整合首頁／練習／第一批入口及結果；提交。

## Task 3：驗收與發布

- [x] 版本0.23.0、規格／課綱／README／來源／驗收文件；npm test → npm run build → npm run check、audit零high。
- [x] requesting-code-review獨立核心／UI審查與修補複核。本機隔離QA完成地圖／回顧遮蔽揭開／弱點三題／刷新／首答提示／320與390px、44px／鍵盤、console與既有輪保留。
- [x] 同head成功CI合併、Pages成功；正式136+新增模組shell SHA／JS MIME／SW與146+原音檔HTTP、隔離UI／截圖，補發布證據push、遠端一致，關QA／本機server。

跨日規則用固定時間測試，不注入虛構歷史或修改實機時鐘；真實隔日學習效果、iPhone／Android、教師／真人審校仍分開。回退先匯出JSON，舊版可能不認life-repair；不清資料。個人答案、草稿、QA截圖不進Git。
