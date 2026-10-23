# 生活日語記憶第五批驗收（v0.26.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-fifth.md)。本批從原課三題進一步按能力練習，全部使用既有92課436道原題，不新增語言教材或題目。

## 實際範圍

- life-skill/<unit>：聽解、自己填空／排序、字詞／情境理解。每能力顯示原題總數、實際練過／未練、最近錯答／提示題數，不當成熟練度。頁面沒有答案或音檔，不記參考。
- 同課同能力最多三題，錯答／提示→未練→到期→其他已練。若仍有未練原題，至少留一題給它，避免三個弱點永遠佔滿。cutoff內attempts重建reviews，忽略未來紀錄，原qid與題型／詞塊／答案保留。
- life-skill來源reference=unit:skill，1～3道唯一同課同能力原題；queue不得插入訂正。沿用schema3、lifeHints、原引擎，五種生活來源共一pending。正常聽解刺激不當額外提示，今日看過參考另列提示。
- 結果標明實際能力與題數，不誤稱固定三題；接原輪回顧、能力頁、原課寫作、每日收尾／隔天。卡片、原課與回顧均有入口及來源路徑。保存成功才導航，失敗候選可匯出，連按／舊unit／skill／route及延遲離頁epoch守護。

## 測試與獨立審查

新增16項先紅再綠測試：92課分類、cutoff／唯讀、弱點／未練優先與保留一格、同能力三題上限、來源與qid／queue驗證、共pending／備份與合併衝突、原首答與提示、每日收尾、真題數／結果／來源／HTML編碼、連按／延遲離頁／失敗匯出。

獨立核心與UI初審通過，生活102/102及新15/15通過。核心額外遍歷92課436原題，分類與catalog一致；276組能力輪皆通過state及備份往返。另以RED→GREEN補上三個弱點佔滿會排除未練題的反例，`bacd718`保留一格；獨立核心複核16/16，額外1,136組弱點／未練組合皆同課同能力、不重複、不超量、有未練必留一格。

完整 `npm test` 555/555通過，`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點；208卡／508筆順／10947音檔索引與176生活字串檢查通過。

## 本機實際操作

隔離QA `http://127.0.0.1:18124/?qa=1`沿用前四批實際資料。L07起始聽解1／填空排序2／理解5題，分別練過1／1／1題。完成能力2題UUID `31bcf135-4162-4da3-8d66-d9badc5223ef`：填空「で」、未練排序原詞塊。排序選「コーヒーを」後刷新仍同UUID及原草稿，直接回能力頁顯示pending並接原輪，排完「一つ／お願いします。」後完成。

聽解UUID `d61e4f1a-4b9a-4d39-a1fc-aedd8239633f`實際播放、選外帶，結果明示聽解1題，沒有固定三題文案。理解UUID `7c06968e-b672-450e-babd-542d9c5b4104`三題含原先未練q1／v2-q4，完成後能力統計變成練過1／2／3題，理解尚有2未練。各輪今日參考提示保留。保留未練一格的三弱點分支以固定資料自動測試與1,136組獨立遍歷驗證。

舊原輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2首答正確／3提示／0無提示，未被加練改寫。新增不同原題可增加實際已練題數；L07地圖從3/8增為6/8，不能把合法新增的題數誤稱資料不變。最近五輪清單僅顯示最新五輪，較早原輪仍可由原網址查看。

320/390px與N2能力頁320/390/768/1024/1440px無橫溢；新按鈕48px，返回44px，其他連結58px，鍵盤Tab焦點可見，路由main聚焦，console warn/error空。截圖ignored `work/life-fifth-local-320.png`／`work/life-fifth-local-390.png`。

所有答題用隔離QA，不清DB／快取／SW、不改時鐘、不注入虛構跨日歷史。桌面寬度不能替代iPhone／Android實機；教師／真人審校與真實長期效果仍未由本批驗證。回退先匯出JSON，舊版可能不認life-skill，保留原DB與備份。個人答案／草稿／QA不提交公開Git。

## 發布驗證進度

本機HTTP UTC03:31:31逐檔校驗148份shell SHA256／JS MIME／SW fingerprint與146次既有音檔通過，1次暫時連線重試。fingerprint `eb5364758a4578f6c8eb26a353a64f49e14632f4092260e628d905da3184d01e`，預設TLS驗證，紀錄ignored `work/life-fifth-local-http.json`。

- [PR #38](https://github.com/linhercherng/japanese-learning-platform/pull/38) head `c97267b59179a410b2bf01d4c0af227fd5d78b5c`，同head [CI39895550016](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39895550016) completed/success後按match-head合併。
- merge `f5993ecc0fcfa0c7dbc558681a483dcb01d9709c`；[Pages39895640748](https://github.com/linhercherng/japanese-learning-platform/actions/runs/39895640748)整體completed/success，build/deploy皆success，deploy UTC03:34:18（台北11:34）完成。
- 正式[生活能力專練](https://linhercherng.github.io/japanese-learning-platform/#life-skill/L07)及原課上／下方、逐句卡與原輪回顧入口可用。UTC03:35:56正式148份shell逐檔SHA／JS MIME／SW及146次音檔HTTP通過，1次暫時連線重試，fingerprint與本機相同；預設TLS驗證，紀錄ignored `work/life-fifth-public-http.json`。
- 正式隔離QA能力輪：填空／排序 `0b7e82f9-aa92-4be3-8821-3e6b0d305325`，聽解 `4ade6822-0034-48f7-92ea-eb0d31277713`，理解 `7a3e9e7f-f17a-42c0-bc71-5a0afbf0b200`。排序選第一詞後刷新及回能力頁pending，回同UUID保留草稿；兩題／單題結果正確說明能力及實際題數，今日參考分別2提示／1提示。理解三題含未練原題、皆保存原首答與提示。
- 能力統計從練過1／1／1變成1／2／3，理解還有2未練原題。舊原輪 `7a5971bf-9045-4345-85b3-b80dad5bf171`仍3首答正確／2無提示／1提示，未被加練改寫。
- 正式320/390px無橫溢，新按鈕各48px；Tab焦點可見，console warn/error空。截圖ignored `work/life-fifth-public-320.png`／`work/life-fifth-public-390.png`／`work/life-fifth-public-entry-390.png`。
- 正常分頁等新shell下載後暫離網站，循正常SW生命週期接手，沒有清DB／快取／SW；正常庫只驗原課新入口、能力頁與0練習的真實空歷史，沒有答題或開教材參考。所有新練習用隔離QA。QA與18124伺服器已關閉，正式能力頁保留。
- 實機、教師／真人審校及實際長期效果仍未由本批推論完成；第四批逐句回想功能保留且已一同整合。
