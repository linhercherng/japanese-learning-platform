import {kana} from './kana.mjs';
import {coachQuestion} from './kana-coach.mjs';
export const rhythmGroups=[
 {id:'small',title:'拗音合一拍',tip:'ゃ／ゅ／ょ和前字合成一拍，不另外數一拍。'},
 {id:'stop',title:'促音留一拍',tip:'小っ佔一拍，維持下一個子音的準備；不要另外讀成つ。'},
 {id:'nasal',title:'撥音留一格',tip:'ん佔一拍，不加a等母音；口形會隨後面的聲音調整。'},
 {id:'long',title:'長音多留一格',tip:'ー佔一拍，延續前面的母音，不另起一個新音。'}
];
// Authored segmentation of these twelve examples only, not a general pronunciation parser.
export const rhythmCards=[
 ['tea','small','お茶','おちゃ','茶',['お','ちゃ'],'ちゃ牽手一拍，所以是兩拍。'],
 ['photo','small','写真','しゃしん','照片',['しゃ','し','ん'],'しゃ是一拍；最後的ん也要留一拍。'],
 ['travel','small','旅行','りょこう','旅行',['りょ','こ','う'],'りょ是一拍；こ・う是兩拍的長音，連成こー，不另外起u音。'],
 ['stamp','stop','切手','きって','郵票',['き','っ','て'],'中間的小っ留一拍，先準備て的子音，再接て。'],
 ['magazine','stop','雑誌','ざっし','雜誌',['ざ','っ','し'],'小っ留一拍，延續し前的子音準備，不讀成つ。'],
 ['school','stop','学校','がっこう','學校',['が','っ','こ','う'],'っ自己一拍；こ・う的長音也有兩拍，全詞四拍。'],
 ['book','nasal','本','ほん','書',['ほ','ん'],'不要把ん吞掉，也不要加成な；兩格都要留時間。'],
 ['phone','nasal','電話','でんわ','電話',['で','ん','わ'],'ん在で和わ之間，自己保留一格。'],
 ['walk','nasal','散歩','さんぽ','散步',['さ','ん','ぽ'],'ん在ぽ前會閉唇準備，仍然只佔一拍。'],
 ['coffee','long','コーヒー','コーヒー','咖啡',['コ','ー','ヒ','ー'],'コー兩拍、ヒー兩拍；長音格延續前面的母音。'],
 ['cake','long','ケーキ','ケーキ','蛋糕',['ケ','ー','キ'],'ケー延長成兩拍，再接キ，一共三拍。'],
 ['market','long','スーパー','スーパー','超市',['ス','ー','パ','ー'],'スー兩拍、パー兩拍；小圈留在パ，長音另留格。']
].map(([id,group,jp,reading,zh,beats,tip])=>({id,group,jp,reading,zh,beats,tip,audio:jp}));
export function exposedRhythmItems(card){
 if(!card)return [];const visible=card.jp+card.reading+card.tip+(rhythmGroups.find(g=>g.id===card.group)?.tip||'');
 return kana.filter(k=>visible.includes(k.glyph)).map(k=>k.id);
}
export function validRepairReference(reference,ids){
 if(!Array.isArray(ids)||ids.length<1||ids.length>3||new Set(ids).size!==ids.length)return false;
 const items=String(reference).split(':');
 return items.length===ids.length&&new Set(items).size===items.length&&ids.every((id,i)=>/^kc:check:/.test(id)&&coachQuestion(id)?.reviewItem===items[i]);
}
