// 自編入門教材 v0.1；未經獨立日語教師審校，僅供本機第一版驗收。
// 每個 row: 字形、Hepburn 輔助讀音、詞例、假名讀音、繁中詞義。
const hiraRows = `あ|a|あめ|あめ|雨
い|i|いぬ|いぬ|狗
う|u|うみ|うみ|海
え|e|えき|えき|車站
お|o|おと|おと|聲音
か|ka|かさ|かさ|傘
き|ki|き|き|樹
く|ku|くつ|くつ|鞋子
け|ke|けさ|けさ|今天早上
こ|ko|こえ|こえ|聲音
さ|sa|さかな|さかな|魚
し|shi|しお|しお|鹽
す|su|すし|すし|壽司
せ|se|せかい|せかい|世界
そ|so|そら|そら|天空
た|ta|たまご|たまご|雞蛋
ち|chi|ちず|ちず|地圖
つ|tsu|つき|つき|月亮
て|te|て|て|手
と|to|とり|とり|鳥
な|na|なつ|なつ|夏天
に|ni|にく|にく|肉
ぬ|nu|ぬの|ぬの|布
ね|ne|ねこ|ねこ|貓
の|no|のり|のり|海苔
は|ha|はな|はな|花
ひ|hi|ひと|ひと|人
ふ|fu|ふね|ふね|船
へ|he|へや|へや|房間
ほ|ho|ほし|ほし|星星
ま|ma|まど|まど|窗戶
み|mi|みず|みず|水
む|mu|むし|むし|昆蟲
め|me|め|め|眼睛
も|mo|もも|もも|桃子
や|ya|やま|やま|山
ゆ|yu|ゆき|ゆき|雪
よ|yo|よる|よる|夜晚
ら|ra|らいねん|らいねん|明年
り|ri|りんご|りんご|蘋果
る|ru|るす|るす|不在家
れ|re|れきし|れきし|歷史
ろ|ro|ろく|ろく|六
わ|wa|わたし|わたし|我
を|o|みずをのむ|みずをのむ|喝水
ん|n|ほん|ほん|書`.split('\n').map(row => row.split('|'));
const kataWords = `アイス|あいす|冰淇淋
インク|いんく|墨水
ウール|うーる|羊毛
エアコン|えあこん|冷氣
オレンジ|おれんじ|柳橙
カメラ|かめら|相機
キウイ|きうい|奇異果
クラス|くらす|班級
ケーキ|けーき|蛋糕
コーヒー|こーひー|咖啡
サラダ|さらだ|沙拉
シャツ|しゃつ|襯衫
スープ|すーぷ|湯
セーター|せーたー|毛衣
ソファ|そふぁ|沙發
タクシー|たくしー|計程車
チーズ|ちーず|起司
ツアー|つあー|旅行團行程
テレビ|てれび|電視
トマト|とまと|番茄
ナイフ|ないふ|刀子
ニュース|にゅーす|新聞
カヌー|かぬー|獨木舟
ネクタイ|ねくたい|領帶
ノート|のーと|筆記本
ハンカチ|はんかち|手帕
コーヒー|こーひー|咖啡
フォーク|ふぉーく|叉子
ヘルメット|へるめっと|安全帽
ホテル|ほてる|旅館
マスク|ますく|口罩
ミルク|みるく|牛奶
ハム|はむ|火腿
メニュー|めにゅー|菜單
レモン|れもん|檸檬
タイヤ|たいや|輪胎
ユニフォーム|ゆにふぉーむ|制服
ヨーグルト|よーぐると|優格
ラジオ|らじお|收音機
リモコン|りもこん|遙控器
ルール|るーる|規則
レストラン|れすとらん|餐廳
ロボット|ろぼっと|機器人
ワイン|わいん|葡萄酒
ヲ|お|助詞を的片假名字形
パン|ぱん|麵包`.split('\n').map(row => row.split('|'));
const voicedRows = `が|ga|がっこう|がっこう|學校
ぎ|gi|ぎんこう|ぎんこう|銀行
ぐ|gu|ぐあい|ぐあい|狀況
げ|ge|げんき|げんき|精神好
ご|go|ごはん|ごはん|飯
ざ|za|ざっし|ざっし|雜誌
じ|ji|じかん|じかん|時間
ず|zu|ずぼん|ずぼん|褲子
ぜ|ze|ぜんぶ|ぜんぶ|全部
ぞ|zo|ぞう|ぞう|大象
だ|da|だいがく|だいがく|大學
ぢ|ji|はなぢ|はなぢ|鼻血
づ|zu|つづく|つづく|繼續
で|de|でんわ|でんわ|電話
ど|do|どこ|どこ|哪裡
ば|ba|ばしょ|ばしょ|場所
び|bi|びょういん|びょういん|醫院
ぶ|bu|ぶた|ぶた|豬
べ|be|べんきょう|べんきょう|學習
ぼ|bo|ぼうし|ぼうし|帽子
ぱ|pa|ぱん|ぱん|麵包
ぴ|pi|ぴあの|ぴあの|鋼琴
ぷ|pu|ぷりん|ぷりん|布丁
ぺ|pe|ぺん|ぺん|筆
ぽ|po|ぽすと|ぽすと|郵筒`.split('\n').map(row => row.split('|'));
const contractedRows = `きゃ|kya|きゃく|きゃく|客人
きゅ|kyu|きゅう|きゅう|九
きょ|kyo|きょう|きょう|今天
しゃ|sha|しゃしん|しゃしん|照片
しゅ|shu|しゅくだい|しゅくだい|作業
しょ|sho|しょくどう|しょくどう|食堂
ちゃ|cha|おちゃ|おちゃ|茶
ちゅ|chu|ちゅうがく|ちゅうがく|國中
ちょ|cho|ちょっと|ちょっと|稍微
にゃ|nya|にゃあ|にゃあ|喵叫聲
にゅ|nyu|にゅうがく|にゅうがく|入學
にょ|nyo|にょいぼう|にょいぼう|如意棒
ひゃ|hya|ひゃく|ひゃく|一百
ひゅ|hyu|ひゅうひゅう|ひゅうひゅう|風吹的擬聲
ひょ|hyo|ひょう|ひょう|豹
みゃ|mya|みゃく|みゃく|脈搏
みゅ|myu|ミュージック|みゅーじっく|音樂
みょ|myo|みょうじ|みょうじ|姓氏
りゃ|rya|りゃく|りゃく|省略
りゅ|ryu|りゅう|りゅう|龍
りょ|ryo|りょこう|りょこう|旅行
ぎゃ|gya|ぎゃく|ぎゃく|相反
ぎゅ|gyu|ぎゅうにゅう|ぎゅうにゅう|牛奶
ぎょ|gyo|ぎょうざ|ぎょうざ|餃子
じゃ|ja|じゃがいも|じゃがいも|馬鈴薯
じゅ|ju|じゅう|じゅう|十
じょ|jo|じょうず|じょうず|擅長
びゃ|bya|びゃくや|びゃくや|白夜
びゅ|byu|びゅうびゅう|びゅうびゅう|強風吹的擬聲
びょ|byo|びょういん|びょういん|醫院
ぴゃ|pya|ろっぴゃく|ろっぴゃく|六百
ぴゅ|pyu|ぴゅうぴゅう|ぴゅうぴゅう|風吹的擬聲
ぴょ|pyo|ぴょんぴょん|ぴょんぴょん|蹦蹦跳跳`.split('\n').map(row => row.split('|'));
const toKata = text => Array.from(text, c => c >= 'ぁ' && c <= 'ゖ' ? String.fromCodePoint(c.codePointAt(0) + 0x60) : c).join('');
const code = glyph => glyph.codePointAt(0).toString(16).padStart(5, '0');
const idOf = (glyph, script) => `${script === 'hira' ? 'h' : 'k'}-${Array.from(glyph, c => c.codePointAt(0).toString(16)).join('-')}`;
const specialHints = {
  し:'嘴唇放鬆，接近 shi；不要分成兩拍。', ち:'接近 chi；先聽，再整個音跟讀。',
  つ:'接近 tsu；別直接讀成中文的「出」。', ふ:'嘴唇放鬆，輕輕吹氣；不是用牙齒咬下唇的英文 f。',
  ら:'舌尖輕碰上齒齦一次；和中文捲舌 r 不同。', を:'現代助詞を一般讀 o，用詞例一起記。',
  ん:'自己占一拍；依後面的音改變口型，不加母音。', ぢ:'常用詞中的ぢ通常與じ同音；用詞例記字形。',
  づ:'常用詞中的づ通常與ず同音；用つづく記字形。',
  シ:'兩個短點較橫；最後一筆由左下往右上。與ツ一起比。', ツ:'短點較直；最後一筆由上往左下。與シ一起比。',
  ソ:'先一短筆，再長撇向左下。與ン一起看起筆位置。', ン:'短點較橫；最後一筆由左下往右上。與ソ一起比。',
  ヲ:'片假名ヲ在日常外來語中少見，先認識字形即可。',
};
function makeCard(row, script, group, overrideWord) {
  const [base, reading, originalWord, originalReading, originalMeaning] = row;
  const glyph = script === 'kata' ? toKata(base) : base;
  const [word, wordReading, meaning] = overrideWord || [originalWord, originalReading, originalMeaning];
  const hint = specialHints[glyph] || specialHints[base] || (group === 'contracted' ? '後面是小ゃ／ゅ／ょ，兩字合成一拍；先遮住讀音，再回想。' : group === 'voiced' ? '先找原來的字，再注意右上兩點或小圈；和清音成對回想。' : '先看筆順，再遮住字形默寫；把這個字放進詞例一起記。');
  return {id:idOf(glyph,script),glyph,reading,script,group,word,wordReading,meaning,hint,
    ...(glyph.length === 1 ? {strokeCode:code(glyph)} : {componentStrokeCodes:Array.from(glyph, code)})};
}
export const kana = [
  ...hiraRows.map(r => makeCard(r,'hira','basic')),
  ...hiraRows.map((r,i) => makeCard(r,'kata','basic',kataWords[i])),
  ...voicedRows.map(r => makeCard(r,'hira','voiced')),
  ...voicedRows.map(r => makeCard(r,'kata','voiced',[toKata(r[2]),r[3],r[4]])),
  ...contractedRows.map(r => makeCard(r,'hira','contracted')),
  ...contractedRows.map(r => makeCard(r,'kata','contracted',[toKata(r[2]),r[3],r[4]])),
];
const select = (script, glyphs) => Array.from(script==='kata'?toKata(glyphs):glyphs).map(g => idOf(g,script));
const basicSpecs = [
 ['あいうえお','五個母音','認識日文的一拍；讀出並寫出五個母音。'],
 ['かきくけこさしすせそ','か行・さ行','把か行和さ行放進單字，用聽音和默寫回想。'],
 ['たちつてとなにぬねの','た行・な行','聽出ち與つ；讀寫兩行基本字。'],
 ['はひふへほまみむめも','は行・ま行','練習ふ的口型，分清ぬ／め。'],
 ['やゆよらりるれろ','や行・ら行','練習ら行的舌尖輕碰，混合讀寫兩行。'],
 ['わをん','わ・を・ん與總複習','認識ん的一拍和助詞を，回想全部46個平假名。'],
];
const baseLessons = ['hira','kata'].flatMap((script,s) => basicSpecs.map(([glyphs,title,goal],i) => ({
  id:`K${String(s*6+i+1).padStart(2,'0')}`,title:script==='kata'?`${toKata(glyphs)}・片假名`:`${glyphs}・${title}`,
  goal:script==='kata'?goal.replace('平假名','片假名'):goal,items:select(script,glyphs),
  note:i===5?'這課先學三個字，再到字表混合練習已學的46字。':'一次先學五個字；看一次、聽一次，再遮住提示回想。',
  examples:[{jp:script==='kata'?kataWords[hiraRows.findIndex(r=>r[0]===glyphs[0])][0]:hiraRows.find(r=>r[0]===glyphs[0])[2],zh:script==='kata'?kataWords[hiraRows.findIndex(r=>r[0]===glyphs[0])][2]:hiraRows.find(r=>r[0]===glyphs[0])[4]}],
})));
export const kanaLessons = [...baseLessons,
 {id:'K13',title:'濁音・半濁音',goal:'分清清音、濁音與半濁音，記住兩點與小圈。',items:kana.filter(k=>k.group==='voiced').map(k=>k.id),note:'以か／が、は／ば／ぱ成組比較；ぢ和づ用詞例記。',examples:[{jp:'かき／かぎ',zh:'柿子／鑰匙：注意有沒有兩點。'},{jp:'は／ば／ぱ',zh:'比較氣流與右上的標記。'}]},
 {id:'K14',title:'拗音・小ゃゅょ',goal:'分清きゃ的一拍與きや的兩拍。',items:kana.filter(k=>k.group==='contracted').map(k=>k.id),note:'拗音兩字一拍；小字與大字的大小會改變讀音。少見詞例只是聲音練習，不必先背全部詞。',examples:[{jp:'きゃ／きや',zh:'一拍／兩拍'},{jp:'びょういん',zh:'醫院：びょ・う・い・ん，共四拍。'}]},
 {id:'K15',title:'促音・小っッ',goal:'聽見小っ的一拍停頓，分清きて與きって。',items:select('hira','きてつ') ,note:'小っ不讀成つ；先停一拍，再發下一個子音。小ッ用於片假名。',examples:[{jp:'きて／きって',zh:'來（請來）／郵票'},{jp:'カップ',zh:'杯子：カ・ッ・プ，共三拍。'}]},
 {id:'K16',title:'長音・伸長一拍',goal:'聽出長音，多保留一拍；認識片假名長音符號ー。',items:select('hira','おばさ') ,note:'おばさん四拍、おばあさん五拍；只差一拍，意思就不同。おう常作長音，但詞語例外需逐詞聽。',examples:[{jp:'おばさん／おばあさん',zh:'阿姨／奶奶'},{jp:'コーヒー',zh:'咖啡：コ・ー・ヒ・ー，共四拍。'}]},
 {id:'K17',title:'撥音・無聲化與節奏',goal:'保留ん的一拍，認識です中す可能變輕的聲音。',items:select('hira','んすで'),note:'ほん是兩拍。清音環境的い／う可能無聲化，但不是刪掉那一拍；自然語音有差異，先聽再模仿。',examples:[{jp:'ほん',zh:'書：ほ・ん，共兩拍。'},{jp:'です',zh:'禮貌句尾：す的母音在自然發音中常很輕。'}]},
 {id:'K18',title:'相似字・綜合回想',goal:'分清ぬ／め、れ／ね、シ／ツ、ソ／ン，完成生活詞聽寫。',items:[...select('hira','ぬめれね'),...select('kata','シツソン')],note:'不要只看字表；混合聽音選字，遮住提示默寫，再讀出詞例。',examples:[{jp:'ねこ／ぬの',zh:'貓／布'},{jp:'シャツ／ソファ',zh:'襯衫／沙發'}]},
];
// 音韻六課可直接使用的測驗；選項的 value 必須逐字保存。
export const kanaPhonology = [
 {lessonId:'K13',concept:'右上的標記會改變發音',questions:[
  {id:'K13-1',prompt:'「かぎ」（鑰匙）中，第二個字是？',choices:['き','ぎ','ぴ'],answer:'ぎ',explanation:'かぎ的ぎ右上有兩點；かき是柿子。'},
  {id:'K13-2',prompt:'は行加上小圈，會變成哪一組？',choices:['ばびぶべぼ','ぱぴぷぺぽ','まみむめも'],answer:'ぱぴぷぺぽ',explanation:'半濁音用小圈：ぱ・ぴ・ぷ・ぺ・ぽ。'}]},
 {lessonId:'K14',concept:'小ゃゅょ和前字合成一拍',questions:[
  {id:'K14-1',prompt:'きゃ是幾拍？',choices:['一拍','兩拍','三拍'],answer:'一拍',explanation:'き＋小ゃ合成きゃ，只有一拍；きや是兩拍。'},
  {id:'K14-2',prompt:'「醫院」的正確假名是？',choices:['びよういん','びょういん','びょいん'],answer:'びょういん',explanation:'びょういん＝びょ・う・い・ん，四拍。'}]},
 {lessonId:'K15',concept:'小っ是停頓的一拍',questions:[
  {id:'K15-1',prompt:'「郵票」的正確假名是？',choices:['きて','きって','きつて'],answer:'きって',explanation:'きって有小っ，停頓一拍；きて沒有停頓。'},
  {id:'K15-2',prompt:'カップ是幾拍？',choices:['兩拍','三拍','四拍'],answer:'三拍',explanation:'カ・ッ・プ，促音ッ也占一拍。'}]},
 {lessonId:'K16',concept:'長音要多保留一拍',questions:[
  {id:'K16-1',prompt:'「奶奶」的正確假名是？',choices:['おばさん','おばあさん','おばっさん'],answer:'おばあさん',explanation:'おばあさん有長音あ；おばさん是阿姨。'},
  {id:'K16-2',prompt:'コーヒー是幾拍？',choices:['兩拍','三拍','四拍'],answer:'四拍',explanation:'コ・ー・ヒ・ー，兩個長音符號各占一拍。'}]},
 {lessonId:'K17',concept:'ん與輕聲母音也有節奏',questions:[
  {id:'K17-1',prompt:'ほん是幾拍？',choices:['一拍','兩拍','三拍'],answer:'兩拍',explanation:'ほ・ん，ん自己占一拍。'},
  {id:'K17-2',prompt:'です的す聽起來很輕時，應如何練習？',choices:['跟著聲音保留節奏','把す刪掉','加重中文聲調'],answer:'跟著聲音保留節奏',explanation:'母音可能無聲化，但仍保留那一拍的節奏；自然發音會有變體。'}]},
 {lessonId:'K18',concept:'先看起筆與方向，再遮住回想',questions:[
  {id:'K18-1',prompt:'「襯衫」的正確片假名是？',choices:['ツャシ','シャツ','シャシ'],answer:'シャツ',explanation:'シャツ，注意シ與ツ兩短點的方向。'},
  {id:'K18-2',prompt:'「布」的假名是？',choices:['めの','ねの','ぬの'],answer:'ぬの',explanation:'ぬの，ぬ右下有環；め沒有。'}]},
];
