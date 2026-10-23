# 生活日語記憶第七批驗收（v0.28.0）

日期2026-10-23（Asia/Taipei）。[實作規劃](plans/2026-10-23-life-memory-seventh.md)。本批加入同主題、程度上限內的跨課原題回想；沿用92課436原題，沒有新教材、題目、音訊或依賴。

## 實際範圍

- life-topic及life-topic/<ceiling>：20主題目錄，真實可用課數／練過課數／最多題數。L→N5→N4→N3→N2上限（預設L），主題／上限留URL，刷新及返回不丟選擇。無答案、課名答案線索、個人正文或參考曝光。
- life-topic/<topic>:<ceiling>：只用cutoff內實際練過的原qid，從有效維度attempts重建reviews，最近錯答／提示→到期→其他已練、較早作答／qid穩定排序；去除同unit，最多三課各一題，同主題且不超上限。無歷史不塞新題，單課明示、未知值有復原入口。
- 新source life-topic、reference=topic:ceiling，嚴格驗證1～3唯一qid／不同unit／同主題／程度上限／原題queue；不插訂正變式。raw/canonical共用主題對照，不改原題／schema3。共同pending、lifeHints、首答、備份、筆記／草稿、地圖／每日收尾均延續。
- pending先接同UUID並遮蔽選單／開始控制；連按鎖、過期reference／route epoch、成功才導航、失敗可匯出。結果標實際課／題數，接各原課三句／卡片／能力／線索及原topic URL，原輪回顧及最近輪辨識新source。

## 自動測試與獨立審查

新增17項先紅再綠測試，完整 `npm test` **590/590通過**。涵蓋92課metadata、100種主題上限、只取已練／不同unit／三題上限、cutoff／唯讀／review重建、弱點與到期排序、錯誤reference／qid／queue、共pending／備份／提示／原首答／每日收尾、目錄真數字／單課／無正文、來源路徑與結果／HTML、連按／延遲離頁／quota候選／上限URL。

獨立核心審查：生活138/138，全92課436原題raw/canonical原值一致，43,600組單題主題／程度驗證及100組建立輪次／state／正規化備份往返通過，個人線索與草稿保持。獨立UI/controller審查：17/17，另以貼近main的串行queue、fn後阻塞實際落盤、quota待存候選驗證成功／失敗／離頁返回3情境，皆成功前不導航、連按一輪、失敗可匯出、epoch不拉回。兩者無P2以上阻擋，未操作瀏覽器或修改檔案。

`npm run build` → `npm run check`成功，`npm audit --audit-level=high`為0弱點。208卡／508筆順／10947音檔索引／176生活字串檢查通過。156份shell，fingerprint `871a57eca6b08fff9aeacb2f111c106c40768a547978ee2b22891b39c47a57a2`。

## 本機實際操作

隔離QA `http://127.0.0.1:18124/?qa=1#life-topic`：目錄20主題→N5上限→購物空歷史→刷新保留shopping:N5。用實際UI完成L03聽解原輪 `7bf39b9e-8030-49ff-8f18-5ba25b72ed60`（0正確／0提示），目錄變1已練課，單頁明示只有1課。再完成L08原輪 `967200d2-764e-4f3a-96dc-50ce614f496c`，變2已練課，開始2課各1題。

主題原輪 `80538b7e-7ed6-4330-960a-ad9f504ebd12`：第一題提交後刷新，原選項禁用與原答案保留；暫停主題頁只接同UUID，第二題確為另一課。完成2題／1正確／2提示／0無提示；結果分別接L03／L08卡片／能力／線索，逐題回顧可回shopping:L。切N2上限URL為shopping:N2，真實範圍6課／練過2課／仍2題，沒有更難新題。

L07第六批已保存中日文線索可展開恢復；舊首輪 `f5ec4192-db81-4ebd-8474-bf913ed08530`仍2首答正確／3提示／0無提示，原紀錄未改寫。單頁320／390／768／1024／1440px無橫溢；選單／開始均48px，Tab可見outline、路由main聚焦。20主題目錄320px無橫溢，Tab接主題卡有outline；console warn/error空。截圖ignored `work/life-seventh-local-390.png`。

UTC04:22:16本機156份shell逐檔SHA256／JS MIME／SW fingerprint及146次原音HTTP通過，1次暫時連線重試；紀錄ignored `work/life-seventh-local-http.json`，預設TLS驗證。未清DB／快取／SW、不改時鐘、不注入跨日歷史，所有答題用隔離QA。個人資料與QA不提交Git。

桌面寬度不是iPhone／Android實機或OS日文鍵盤驗收；教師／真人審校、新情境遷移與真實長期記憶效果未由本批推論完成。回退先匯出JSON，舊版可能不認life-topic；保留DB與備份。

## 發布驗證

待同head CI、合併Pages、正式156份shell與146原音HTTP、隔離UI及正常SW驗證後補證據。
