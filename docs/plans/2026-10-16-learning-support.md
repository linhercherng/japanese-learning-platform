# 日語網站比較與學習補給實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement and review the tasks.

**Goal:** 比較9個網站後，直接補上原創知識單元、分級閱讀與資源導覽，能沿用首答、複習、作品與離線流程。

**Architecture:** 新增supportLessons 24課及readingLessons 8篇，標示kind=support、category、memoryTip、relatedUnitIds、sourceIds、contentVersion、reviewStatus；加入allUnits及既有題目／備份索引，主線114課與模擬卷不改。使用現有五步單課介面，在課程／練習新增#support入口及分類。沿用schema3，無帳號、付費服務或外站內容轉載。

**Tech Stack:** 原生ES modules、Node22、IndexedDB、Haruka本機音訊、既有PWA與GitHub Pages。

## T1 比較與內容（先規格再程式審查）

- 來源：Marugoto、Irodori、Bunpro、WaniKani、Satori Reader、Tadoku、Tae Kim、OJAD、時雨の町的實際官方功能頁，2026-10-16查核。記錄功能、本站已有、缺口、本次採用及尚未完成的進階功能；不比較未查證價格、不宣稱排名或相同品質。
- 新建app/content/learning-support.mjs、tests/learning-support-content.test.mjs。24原創補充單元：發音6（拍、長音、促音撥音、拗音、助詞讀法、重音與無聲化），文法8（動詞分組、て形、否定過去、場所助詞、はが、授受、自他、四條件），字詞4（部件詞族、日文字形、日中同形異義、數字量詞），語境6（敬語、請求拒絕、聽不懂時修復、郵件、普通形與敬體切換、資訊核對與讀通知）。每課4詞、1詳細教學點含2原創例句、3題且逐項解析、記憶法、寫作與3自查；日文和繁中分開，特殊發音不得以TTS當重音標準。
- 新建app/content/support-readings.mjs：N5～N2各2篇，共8篇原創閱讀；最少字數80／160／260／450；每篇4詞、3讀解題含逐選項解析、句子線索註解與寫作。資料／公告題明示日期、條件，N2有一篇雙文本比較。原生單課支援無對話閱讀文章。
- 原創例句／題目，不複製各站課文、圖片、付費內容或音檔；平台標示公開試用／待教師審校。

## T2 整合

- 新建app/content/support-resources.mjs、app/ui/support.mjs及tests/learning-support-platform.test.mjs；修改catalog／v2／courses／study。先寫紅測試：入口、分類與找不到時fallback、32課題目可解析、首答及備份、教學註解不預露測驗答案。
- 分類用hash可返回，沿用既有手機樣式；補充課返回自己的分類，閱讀「聽讀」呈閱讀與可展開線索，文法說明有記憶提示、相關主課及明確參考。
- 加入單字搜尋、能力練習及offline required索引；主線與舊題ID／素材不覆寫。常態check獨立檢查補充課，不降低主課品質門檻。

## T3 素材、驗收、發布

- 只生成缺少Haruka音檔並完整解碼，生成shell／音檔包雜湊；不加入未授權外站素材。npm test → build → check → audit。
- 隔離QA驗收分類／單課／讀解／首次錯答重整／草稿、320／390px、下載包與離線。兩階段獨立審查，修正後複查。
- 更新README／規格／課綱／來源及網站比較交付文件。PR／CI／合併／部署；正式端點雜湊、代表音檔及手機截圖驗證後才稱發布。

## 邊界

使用者本輪明示「直接補上」，授權這批內容與既有流程整合；不再等另一輪樣稿批准。此前第四版的雲端同步、AI評分、真人聲音、完整診斷／分支對話仍另行規劃，不用本次內容新增冒稱已完成。教師審校與實體手機驗收仍分列。

## 完成狀態

- [x] T1 9站比較、24補充課與8閱讀
- [x] T2 入口、題庫、保存與離線整合
- [x] T3 素材、審查、驗收與正式發布
