// Feature comparison verified from the providers' own pages; no third-party teaching material is reproduced.
export const supportCategories=[
 {id:'pronunciation',title:'發音與拍感',description:'長音、促音、拗音與助詞讀法，先分清節奏再開口。'},
 {id:'grammar',title:'文法與易混用法',description:'從動詞變化到助詞、授受、自他與條件，理解選擇的理由。'},
 {id:'words',title:'漢字與詞彙記憶',description:'部件、詞族、日中同形異義與量詞，連結意思與用法。'},
 {id:'culture',title:'語氣與生活文化',description:'請求、婉拒、敬語、郵件與確認資訊，依場合選說法。'},
 {id:'reading',title:'分級閱讀與線索',description:'N5～N2各兩篇原創文章，練找時間、條件、主張與限制。'}
];
const checkedDate='2026-10-16';
export const resources=[
 {id:'marugoto',title:'Marugoto／まるごと',url:'https://www.marugoto-online.jp/info/',strength:'以能完成的溝通任務組織學習，連結語言結構、生活與文化。',existing:'日和已有生活任務、單課目標與作品自評。',gap:'日和需要更多語氣選擇與場合差異的說明。',applied:'補上敬語、請求婉拒、說不懂與郵件的原創單元。',note:'JF級別與JLPT分級不是一對一對照；此為方法比較，並非基金會審校或背書。',category:'culture',checkedDate},
 {id:'irodori',title:'Irodori／いろどり',url:'https://www.irodori-online.jpf.go.jp/about/',strength:'依《生活の日本語》課綱與素材設計線上生活日語課程。',existing:'日和已有20類生活情境與對話。',gap:'生活任務還需要辨認通知條件、重新確認資訊等橋接材料。',applied:'新增資訊確認單元，以及公告、預約與活動通知閱讀。',note:'僅參考生活導向的編排方式；未轉載課本、題目或音檔。',category:'culture',checkedDate},
 {id:'bunpro',title:'Bunpro',url:'https://bunpro.jp/grammar_points',strength:'提供依程度查找的文法資料庫，網站亦設讀解練習入口。',existing:'日和已有文法詞庫與到期複習。',gap:'分散的句型仍需共通的變化規則與易混項比較。',applied:'補上動詞分組、て形、否定過去、助詞及四種條件的對照。',note:'比較限公開功能頁，沒有轉用該站解說或付費題庫，也未驗證所有會員功能。',category:'grammar',checkedDate},
 {id:'wanikani',title:'WaniKani',url:'https://www.wanikani.com/',strength:'以部件、漢字、詞彙、記憶聯想與間隔複習串接認讀。',existing:'日和已有筆順、字卡記憶法、詞卡及跨日複習。',gap:'漢字還需要由單字形走向部件觀察與詞族關係。',applied:'新增部件詞族、日文字形與日中同形異義的原創說明。',note:'聯想輔助記憶，不能冒稱字源；未複製該站部件命名或故事。',category:'words',checkedDate},
 {id:'satori',title:'Satori Reader',url:'https://www.satorireader.com/how-it-works',strength:'故事附語境詞義、句子註解及音訊，協助讀懂句子在篇章中的意思。',existing:'日和已有課內閱讀、中文展開與合成音訊。',gap:'原有閱讀缺少可逐一查看的篇章線索說明。',applied:'8篇新閱讀都附可展開的原文線索與理由，題目解析指回本文。',note:'本站仍使用合成語音；未實作該站的逐詞點查、個人化漢字顯示或真人錄音。',category:'reading',checkedDate},
 {id:'tadoku',title:'にほんごたどく／Tadoku',url:'https://tadoku.org/japanese/en/free-books-en/',strength:'提供可按程度與主題尋找的免費閱讀作品，部分附朗讀。',existing:'日和已有分級主課，閱讀多附屬於單課。',gap:'需要獨立的閱讀入口，讓學習者選容易讀完的短篇。',applied:'新增N5～N2共8篇原創閱讀；另提供官方書庫連結供自主延伸。',note:'Tadoku自有分級不等於JLPT；免費可讀不等於可轉載，本站未收錄其書籍。',category:'reading',checkedDate},
 {id:'taekim',title:'Tae Kim’s Guide',url:'https://guidetojapanese.org/learn/grammar',strength:'依日語本身的結構與前置概念建立文法說明。',existing:'日和已有句型接續、例句與常見誤用。',gap:'需要把分組、時態與句子成分連成可回查的基本規則。',applied:'以繁體中文原創對照與小練習補強動詞、形容詞及助詞。',note:'未翻譯、改寫或收錄原站文章；外站授權條款不代表本平台整體授權。',category:'grammar',checkedDate},
 {id:'ojad',title:'OJAD 日語重音辭典',url:'https://www.gavo.t.u-tokyo.ac.jp/ojad/',strength:'提供東京式重音與用言活用查詢，亦有韻律顯示工具。',existing:'日和已有合成音檔、跟讀與錄音自評。',gap:'需要解釋拍、重音、無聲化的差別與示範音的使用界線。',applied:'新增發音6單元，提供查核重音的資源及可操作的自查方法。',note:'OJAD不是發音自動評分；本站合成音不作東京重音唯一依據，亦未下載其語音。',category:'pronunciation',checkedDate},
 {id:'sigure',title:'時雨の町',url:'https://www.sigure.tw/learn-japanese/',strength:'以中文學習入口整理基礎入門、單字、文法與綜合學習。',existing:'日和已用繁體中文呈現主課與詞庫。',gap:'需要讓華語使用者一眼找到易受中文影響的詞義與字形。',applied:'新增日中同形異義、日文字形與中文母語者常見誤用。',note:'僅比較公開分類入口；未取用會員內容、文章、例句或測驗。',category:'words',checkedDate}
];
