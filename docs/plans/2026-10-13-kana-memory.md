# 五十音記憶加練 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 補齊92個基本假名的原創記憶提示與可續作的少量加練，並更新公開網站。
**Architecture:** 原生ES modules，重用現有字卡、音檔、筆順及V3首答/提示/續作/備份機制。新增kana來源及教材索引，保留schema3與舊ID；不修改原作答。
**Tech Stack:** Node22、IndexedDB、GitHub Pages。

使用者已要求增加五十音練習與小訣竅，本次在既有核准手機介面內直接擴充。採用逐字提示＋聽辨／配對／詞中補字；遊戲排行榜、單純大題量、中文諧音背誦不作為主要路線。聯想明示為原創想像、非字源；音檔與筆順優先。

- [x] T1 教材與測試：新增app/content/kana-memory.mjs、kana-drills.mjs及tests/kana-memory.test.mjs。先測試缺模組失敗，再補92tips、276題、音檔與答案校驗；同音字不作聽辨干擾。
- [x] T2 練習整合：catalog登錄題目，v3-state接受kana來源，v3控制器生成5/10題快照、弱項優先、續作入口，備份驗證來源與題庫匹配。測試答案、提示、合併及舊備份相容。
- [x] T3 記憶畫面：kana-memory新頁、原字卡提示、10行分類、3種練習、遮字聽寫、6個音韻重點與下一日建議。新題目只在提交後展示訣竅，記錄提示。
- [ ] T4 驗收發布：npm test→build→check，320/390手機畫面、音檔、首答續作、備份與離線索引驗證；code review，PR及Pages成功後核對正式URL。

參考官方字表：[文化廳假名字表](https://www.bunka.go.jp/seisaku/kokugo_nihongo/kyoiku/seikatsusha/h24_nihongo_program_a/pdf/a_56.pdf)、[國際交流基金Irodori資源](https://www.irodori.jpf.go.jp/en/resources.html)。只連結，沒有複製題文、圖像或音檔。教材與合成聲音仍待獨立教師審校。
