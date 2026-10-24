# 每日成果與下一週重點 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將六區每日路線的原輪成果、提示使用及跨日結果整合到週報，產生接下來七天最多三項可執行重點，讓每日挑題同步優先本週未記穩的能力。

**Architecture:** 沿用 schema3 與所有原資料，新增唯讀 weekly-learning 分析；memoryEvidence 補每原題能力最近七日首答與可比較失敗摘要，與原成功證據共用同一間隔判定。週報整理已保存的學習／複習原輪，下一週重點依提示及跨日結果排序；共用原 dailyMemory 的1／3／7日間隔與原題開始流程，不建立另一份排程。

**Tech Stack:** Node 22 ES modules、HTML/CSS、IndexedDB、GitHub Pages，沒有新依賴或教材。

## 驗收規則

- 現有週報是最近七個台北日期；下一週明示為接下來七天，不假裝是週一開始的固定曆週。
- 原輪學習與複習分開：kana-mini／life-memory／jlpt-memory 與三區 check／week／repair，包含從原工具手動進入，舊資料不推測入口來源。四步每日安排的已完成步驟另列，不與客觀回想混算。
- 完成原輪需逐題連回唯一、能力及時間與正誤／提示值一致的原首答；未完成、未來、時間矛盾、無原答案或歸屬重疊另列。完成時間在本週與本週作答數分開，跨週原輪不挪動答案日期。
- 提示／回饋不混算；同日訂正不抹掉每日首答。只有有較早原題、足夠間隔、無同日線索、無碰撞且舊歷史可判定的失敗才算「跨日未想起」，沒有證據不推論遺忘。
- 六區原題 × 能力最近七日摘要接入每日同類原題排序：目前需複習／待確認優先，再依本週跨日失敗、提示與錯答，保留原單字／每課／題量限制及未完成優先。
- 下一週最多三個能力重點（5分鐘只取一項），依可靠弱點、待確認、尚待跨日及維持排序。新內容建議依本週提示與弱點給少量／暫緩，不自動升級或換目標。
- 重點頁只顯示原課metadata、原因與最早日期，實際按開始時只選今天已到期的原題；未到期便等或回原頁。沿用交易內重算、保存失敗備份與路由世代保護，不生成未來作答或完成。
- 所有報表／預覽唯讀，原首答、題序、進度、提示側錄、草稿、作品與備份保持。

## Tasks

- [ ] 1. RED→GREEN：tests/weekly-learning.test.mjs、memory-evidence 跨日失敗與首答摘要，app/core/weekly-learning.mjs 原輪核對／本週成果／下週重點，舊證據回歸後提交。
- [ ] 2. RED→GREEN：每日挑題優先、週報與 weekly-focus 頁、開始流程測試；app/core/daily-memory.mjs、app/core/unified-review.mjs、app/ui/unified-review.mjs、app/ui/weekly-learning.mjs、app/v3.mjs、app/ui/navigation.mjs。覆蓋到期／未到期／原輪／失敗／排隊改變與午夜，提交。
- [ ] 3. 依 code review 技能獨立審查，修正重要問題。完整test／build／check／audit；維護規格、課綱、畫面、路線、來源及版本。
- [ ] 4. IAB本機QA備份匯入與唯讀比對、原輪結果／下一步實際操作、五寬／大字／Tab／44px／console及全shell HTTP；私人與測試資料只放忽略work。
- [ ] 5. 正常與QA正式升級前備份；PR同head CI → 合併 → Pages → 正式HTTP、自然SW升級、畫面與完整state比對。文件、截圖與遠端一致，恢復viewport並停server。

沿用既有原創試用教材與自評／客觀證據邊界；不宣稱教師、實機、長期學習或官方檢定成效驗收。
