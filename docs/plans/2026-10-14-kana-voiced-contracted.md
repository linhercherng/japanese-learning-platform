# 濁音、半濁音與拗音記憶加練實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 依使用者確認的五十音強化規劃，補齊既有208張字卡的訣竅與練習，更新GitHub並發布。

**Architecture:** 延續原記憶卡及V3首答、提示、訂正、備份流程。新增濁音40卡、半濁音10卡、拗音66卡，保留基本字92卡與既有題目語意。選擇分類後只顯示相關行；三種既有練習全量覆盖，進階字另加組字辨認題。

**Tech Stack:** Node.js 22、原生ES modules、IndexedDB schema3、靜態PWA、GitHub Pages。

## 設計取捨

直接在既有工作坊補教材與分類，讓學習者延續熟悉操作。另開進階頁會分散入口；一次加入語音評分或自適應系統超出本次需求。

- 濁音：原字形＋右上兩點＋對照詞；半濁音：は行＋小圈，與兩點比較。
- 拗音：前字＋小ゃ／ゅ／ょ，一組一拍；對照大字兩拍。卡片提示以「兩字牽手走一拍」作辅助聯想。
- じ／ぢ、ず／づ同音，聽辨題排除同音干擾項。拼字題提供詞義及詞例，不要求只靠聲音選同音字。
- 既有拗音範圍為11組×3×2套字形；少見詞及片假名轉寫標示用途。ひゅ／びゅ／ぴゅ等擬聲詞仍可練聲音，不強迫背成常用詞。
- 每輪5／10題上限、整組3字不湊數；遮字模式隱藏構成式、訣竅與詞形。
- 基本字舊reference（如hira:listen:all）仍只指基本46字。新進階混合reference使用分類前綴，避免舊備份範圍漂移。

## Task 1：教材與題库

Files: `app/content/kana-memory.mjs`, `app/content/kana-drills.mjs`, `tests/kana-memory.test.mjs`, `tests/kana-advanced.test.mjs`。

1. 寫失敗測試：208卡唯一、624三模式＋116組字題、詞中確有缺字、音檔與K離線包存在、同音選項不衝突。
2. Run `node --test tests/kana-advanced.test.mjs`，確認因進階內容缺失失敗。
3. 補全原創字形／組字提示、行與分類、詞例轉寫註記；原基本題保持內容相同。
4. 新增組字題：濁點／小圈、原字形、拗音小字與拍數。
5. 重跑focused tests、更新原測試全量數，通過後提交。

## Task 2：手機入口與續作

Files: `app/ui/kana-memory.mjs`, `app/v3.mjs`, `app/v3.css`, `tests/kana-memory-ui.test.mjs`。

1. 寫失敗測試：分類與行連動、三字小輪、進階卡文字與遮字、備份reference正確／錯誤範圍。
2. 補四分類、分類混合與逐組选择、進階組字模式、卡片構成與詞例用途。
3. 保持舊未完成輪次接續，分類變更只影響下一輪。
4. 拗音筆順展示兩個字的大小，手機320／390px不溢出。

## Task 3：審查、驗收與發布

Files: `scripts/materials-check.mjs`, `README.md`, `docs/kana-advanced-validation.md`, package版本與生成離線索引。

1. 跑 `npm test`、`npm run build`、`npm run check`，新增題庫素材納入常態檢查。
2. QA庫實際測試三分類、平片、四模式、重整續作、首答／提示、默寫及手機尺寸；不操作正式個人資料。
3. 使用requesting-code-review技能進行獨立程式與教材審查，修正阻擋項。
4. 提交／推送／PR，CI通過後合併；等待Pages成功，核對公開雜湊、代表音檔及公開頁畫面。
5. 報告已交付範圍與未完成教師／實機審校；不宣稱全平台V3.1深化完成。

## 來源

2026-10-14查核：國際交流基金[假名字表資源](https://www.kyozai.jpf.go.jp/)及[音韻表](https://www.jpf.go.jp/j/project/japanese/survey/area/country/syllabus/pdf/sy_honyaku_4china.pdf)、東京都[Hepburn表](https://www.seikatubunka.metro.tokyo.lg.jp/passport/documents/0000000485)。只參照字表與規則；聯想、說明與題文原創，音檔及筆順重用既有授權素材。仍為待獨立教師審校的公開試用教材。

## 執行紀錄

- [x] Task 1 教材與題庫
- [x] Task 2 手機入口與續作
- [x] Task 3 審查、驗收與發布（PR #7；Pages run 38562289969成功，65個公開shell雜湊及6個代表音檔核對通過）
