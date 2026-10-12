# 教材與素材紀錄

## 第二版增量（2026-10-13）

現版保留第一版資料，擴充為90分級主課、60情境與12生活起步，使用詞中讀音索引避免同字異音共用。Haruka音訊9,540份全部ffmpeg解碼成功，460份KanjiVG原始SVG固定相同commit、原bytes與SHA-256；含312不同漢字。完整5包皆缺檔0，容量與驗收見 `v2-validation.md`。

重製第二版：`node scripts/v2-materials-prepare.mjs`，再執行 `pwsh -File scripts/v2-audio-local.ps1`／`pwsh -File scripts/materials-strokes.ps1`，最後 `npm run build` 與 `npm run check`。本機語音使用單一序列SpeechSynthesizer；不並行呼叫Haruka原生引擎。MP3只是可解碼與播放驗證，教師審音尚未完成。以下第一版紀錄保留作來源歷史。

查核日期：2026-10-12。版本：自編教材 v0.1，本機驗收用途。

## 假名與音韻

`app/content/kana.mjs` 收錄 208 張字卡：92 個基本平／片假名、50 個濁音／半濁音、66 個常用拗音組合。每張卡有讀音輔助、詞例、假名讀音、繁體中文詞義與記憶提示。`kanaLessons` 對應規劃的 K01–K18；`kanaPhonology` 為 K13–K18 的可測概念，每課兩題附解析。

教材、中文提示與測驗均為本專案自編 AI 草稿；已做內部文字與資料結構自檢，**尚未經獨立日語教師審校**。這些課程不是 JLPT 官方課程或官方級別字詞表。少見拗音的詞例用於音韻辨識，不要求初學者先背熟全部詞。

編排參考的官方入門方向：[日本國際交流基金《いろどり》入門](https://www.irodori.jpf.go.jp/en/starter/pdf.html)。本專案未複製該教材的課文、題庫或音檔；參考連結不代表基金會審校、背書或授權本教材。

## 筆順

來源：[KanjiVG 官方專案](https://kanjivg.tagaini.net/)，作者 Ulrich Apel 與貢獻者。148 個 SVG 對應全部 92 個基本字、50 個濁音／半濁音及 6 個小ゃゅょ／ャュョ。

固定來源 Git commit：`70a0b7ae0c18ceb5cb358274b029cce0234a43bc`。`app/assets/stroke-manifest.json` 提供每個原始 URL 及 SHA-256；`app/assets/kanjivg/` 保留原檔與原有版權段落。`app/assets/strokes.json` 依原檔順序擷取 path d，不更改筆畫幾何。

原始 SVG 與衍生 `strokes.json` 採 **CC BY-SA 3.0**，授權與署名見 `app/assets/KANJIVG-LICENSE.md`。畫布以原始 SVG 的 109×109 座標等比例縮放。筆順資料提供示範，字跡相似或描到指定範圍不等同書法評鑑或日語教師認證。

## 語音

`app/assets/audio/` 為 Windows **Microsoft Haruka Desktop（ja-JP）本機合成語音**，速率 -1，轉存 MP3；`app/assets/audio.json` 以原始日文字串索引檔案。相同文字只保留一份。範圍包含字卡字形、詞例、音韻對照及六課生活教材的完整單字／句子。`audio-provenance.json` 記錄聲音與審校狀態。

它不是真人或教師錄音，也**尚待獨立日語教師審音**；特別需要確認單字重音、孤立假名及促音／長音／母音無聲化的自然性。播放本機 MP3 不需連外；用戶錄音不會交給此合成流程。

原先驗證 edge-tts 7.2.8／ja-JP-NanamiNeural 時，服務 WebSocket 多次回應 403，未取得有效音檔，因此正式第一版採可用的本機 Haruka。保留 `scripts/materials-audio.py` 作明確選用的維護工具；它需要網路且只讀自編教材文字。TLS 驗證維持啟用，使用 Windows 系統 CA，不使用 ssl=False。執行網站與建置不會自動呼叫此服務。

重製本機素材：先執行 `node scripts/materials-prepare.mjs`，再使用 PowerShell 執行 `scripts/materials-strokes.ps1`（下載來源）或 `scripts/materials-audio-local.ps1`（本機語音）。本機語音工具需已安裝 Haruka Desktop 與 ffmpeg；不以其他語言語音冒充日文。

素材驗證：`node scripts/materials-check.mjs` 已確認 208 張字卡全部字形及詞例的語音、148 份筆順、18 課與 6 音韻測驗，以及生活課 52 個唯一文字的完整語音覆蓋。`scripts/materials-decode.ps1` 使用 ffmpeg 成功完整解碼全部 **465 份 MP3**；總容量 2,526,566 bytes，最小檔案 2,698 bytes。這證明音檔存在且可解碼，不代表發音已由教師審聽。瀏覽器實際播放、離線與裝置行為由平台驗收另行紀錄。

## 審校與發布界線

這批素材可供私人 GitHub 專案與本機功能驗收。依 AGENTS.md，獨立教師文字與音訊審校、版本紀錄完成前，不能以正式審定教材公開發布或承諾發音完全正確。這項限制不阻止既已授權的第一版本機功能開發。
