import {heading,back,primary,note,escapeHtml as e} from './shared.mjs';
export const kanaGuideSteps=[
 {title:'少量認字，先建立一個線索',how:'先選一行或三個字，聽字音、看筆順，挑一處容易想起來的輪廓。再把圖像逐步收起。',next:'換個順序仍想得起字形，再往下一步；忘記時可以多看一點提示。',links:[['一次三字','kana-mini'],['行段記憶導航','kana-row'],['圖像提示退場','kana-fade']]},
 {title:'同一個聲音，認出兩套字形',how:'把平假名與片假名配成同音的一對，收起對照後換方向辨認。',next:'練兩個方向，不靠固定表格位置；某個字不熟就放入口袋。',links:[['平片互換三題','kana-bridge'],['看字想聲翻卡','kana-flip'],['不熟字口袋','kana-pocket']]},
 {title:'看標記、聽家族，分清混淆',how:'把清音、兩點與小圈成組比較。相似字先找一處差異，再收起字卡聽音；原錯答雙卡可接上兩題及逐字回顧。',next:'兩選一只是當天補強，不算跨日熟練；看過線索的答案會另列提示。',links:[['清濁聲音家族','kana-family'],['混淆字二選一','kana-duel'],['我的實際混淆','kana-confusions'],['弱點三題','kana-repair']]},
 {title:'把聲音長度留下來',how:'先聽完整生活詞、自己數拍，再展開拍格對照。留意小字、停頓與拉長的聲音。',next:'數拍與拼詞字塊不同；不確定時再聽正常或慢速音，不用搶快。',links:[['一拍一格','kana-beats'],['原有音韻小課','kana']]},
 {title:'換生活詞，自己拼、打、寫',how:'同一字換到不同詞，先拼詞，再試日文鍵盤；手寫先鎖定原稿，才對照筆順與範字。自己的聯想可存在線索簿。',next:'不只背固定答案；少見片假名沒有自然詞時改用同音平假名。手寫仍為自評，與聽辨分開。',links:[['不同生活詞','kana-words'],['生活詞拼拼看','kana-build'],['聽音打字回想','kana-type'],['聽音默寫','kana-dictation'],['我的線索簿','kana-notes']]},
 {title:'隔天與七天後，先自己想',how:'先開今天怎麼練，依實際日期接續或檢查；符合條件才做隔天／七日回想，不為湊題補新字。',next:'看認字、聽辨、詞語與手寫的各自紀錄。當天看懂和跨日想起分開；今天已練過，也可以先收尾。',links:[['今日一小步','kana-path'],['隔天檢查','kana-check'],['七日回想','kana-week'],['回想小結','kana-recall'],['記憶地圖','kana-map']]}
];
export function kanaGuideView(){return back('今天怎麼練','kana-path')+heading('容易學，也留時間記住。','六段學習路線，每次只選一小步；不必全部做完，也不用重新學一套操作。')+primary('依我的紀錄選下一步','kana-path')+kanaGuideSteps.map((s,i)=>'<section class="v3-section"><span class="tag">'+(i+1)+' / 6</span><h2>'+e(s.title)+'</h2><p>'+e(s.how)+'</p><p><strong>何時往下走：</strong>'+e(s.next)+'</p><nav class="ks-links" aria-label="'+e(s.title)+'">'+s.links.map(([label,route])=>primary(label,route)).join('')+'</nav></section>').join('')+note('原有208張卡與記憶工具均已接入這條路線；題庫、筆順與作品沿用。教師審校、真人聲音與實機驗收仍待各自完成，不保證固定幾天學會。進度只存目前瀏覽器，請在「我的」匯出JSON備份。');}
