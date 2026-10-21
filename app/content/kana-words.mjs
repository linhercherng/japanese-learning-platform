import {kana} from './kana.mjs';
import {memoryFor} from './kana-memory.mjs';
const additions=`エプロン|エプロン|圍裙
ソース|ソース|醬汁
ソックス|ソックス|襪子
ヒント|ヒント|提示
ヘアブラシ|ヘアブラシ|髮刷
ヘアドライヤー|ヘアドライヤー|吹風機
ミシン|ミシン|縫紉機
マヨネーズ|マヨネーズ|美乃滋
ヨガ|ヨガ|瑜伽
タイヤ|タイヤ|輪胎
ユニフォーム|ユニフォーム|制服
ユーロ|ユーロ|歐元
モデル|モデル|模特兒／模型
モーター|モーター|馬達
モノレール|モノレール|單軌電車
ゲート|ゲート|登機口／入口閘門
ゲームセンター|ゲームセンター|電子遊樂場
ゴール|ゴール|終點／球門
ゴミ|ゴミ|垃圾
ゾーン|ゾーン|區域
リゾート|リゾート|度假勝地
キュート|キュート|可愛的
チャンネル|チャンネル|頻道
チューブ|チューブ|軟管
インタビュー|インタビュー|採訪／訪談
ピュア|ピュア|純真的／純粹的
ギャラリー|ギャラリー|藝廊
レギュラー|レギュラー|固定的／常規的
フィギュア|フィギュア|公仔
ミュージアム|ミュージアム|博物館
リュックサック|リュックサック|背包
ショッピング|ショッピング|購物`;
export const studioWords=additions.split('\n').map((line,i)=>{const [jp,reading,zh]=line.split('|');return {id:`ksw-${String(i+1).padStart(2,'0')}`,jp,reading,zh,levels:['K'],label:'補充生活詞（未標定檢定必考級別）'};});
const cache=new WeakMap();
function pool(registry){
 if(!cache.has(registry)){
  const base=kana.filter(k=>k.word!==k.glyph&&!(k.script==='kata'&&/轉寫/.test(memoryFor(k.id).wordNote||''))).map(k=>({id:`base-${k.id}`,jp:k.word,reading:k.wordReading,zh:k.meaning,levels:['K'],audio:k.word}));
  cache.set(registry,[...registry,...studioWords,...base]);
 }return cache.get(registry);
}
function practice(k,w){return k.script==='hira'?w.reading:w.jp;}
function usable(k,w){return practice(k,w).includes(k.glyph)&&practice(k,w).length>k.glyph.length;}
function example(k,w){return {...w,practice:practice(k,w),audio:w.audio||`${w.jp}［${w.reading}］`,label:w.label||(k.script==='hira'&&/[ァ-ヿ]/.test(w.jp)?'原詞用片假名，此處練平假名讀音':'生活詞的讀音與意思')};}
export function wordExamples(item,registry,limit=3){
 const k=kana.find(k=>k.id===item);if(!k)return [];
 const rank=w=>Math.min(...(w.levels||['N2']).map(level=>({K:1,N5:1,N4:2,N3:3,N2:4})[level]||4));
 const choices=pool(registry).filter(w=>usable(k,w)).sort((a,b)=>rank(a)-rank(b)||practice(k,a).length-practice(k,b).length||a.id.localeCompare(b.id));
 const seen=new Set();return choices.filter(w=>{const key=practice(k,w);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,limit).map(w=>example(k,w));
}
export function resolveKanaWordQuestion(id,registry){
 const [prefix,item,wordId,...extra]=String(id).split(':');if(prefix!=='kw'||extra.length)return null;
 const k=kana.find(k=>k.id===item),w=pool(registry).find(w=>w.id===wordId);if(!k||!w||!usable(k,w))return null;
 const ex=example(k,w);return {id,reviewItem:item,unitId:k.group==='basic'?'K01':'K14',level:'K',kind:'cloze',dimension:'language',audio:ex.audio,prompt:`${ex.practice.replaceAll(k.glyph,'＿＿')}（${w.zh}）：填入缺少的${k.script==='hira'?'平':'片'}假名；多個空格填同一組一次。`,accepted:[k.glyph],explanation:`${w.jp}（${w.reading}）：${w.zh}。${ex.label}。完整練習詞形：${ex.practice}。`};
}
export function validWordReference(item,ids,registry){return Array.isArray(ids)&&ids.length>0&&ids.length<=3&&new Set(ids).size===ids.length&&ids.every(id=>resolveKanaWordQuestion(id,registry)?.reviewItem===item);}
