import {kana} from './kana.mjs';
import {wordExamples,kanaWordExample} from './kana-words.mjs';
import {coachQuestion} from './kana-coach.mjs';
export function splitKanaBlocks(text){const out=[];for(const c of Array.from(text)){if(/[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/.test(c)&&out.length)out[out.length-1]+=c;else out.push(c);}return out;}
function buildable(item,w){const k=kana.find(k=>k.id===item);if(!k||!w)return false;const tokens=splitKanaBlocks(w.practice);return (k.script==='hira'?/^[ぁ-ゖー]+$/:/^[ァ-ヺー]+$/).test(w.practice)&&tokens.length>=2&&tokens.length<=10;}
export function buildExamples(item,registry){return wordExamples(item,registry).filter(w=>buildable(item,w));}
export function buildQuestion(id,registry){
 const [prefix,item,wordId,...rest]=String(id).split(':');if(prefix!=='kb'||rest.length)return null;const k=kana.find(k=>k.id===item),w=kanaWordExample(item,wordId,registry);if(!buildable(item,w))return null;const tokens=splitKanaBlocks(w.practice);
 return {id,reviewItem:item,unitId:k.group==='basic'?'K01':'K14',level:'K',dimension:'language',kind:'order',audio:w.audio,prompt:'先聽詞音，拼出「'+w.zh+'」的'+(k.script==='hira'?'平假名讀音':'片假名詞形')+'。',tokens,answerOrder:tokens.map((_,i)=>i),explanation:w.jp+'（'+w.reading+'）：'+w.zh+'。'+w.label+'。完整詞形：'+w.practice+'。小字和前字合成字塊；字塊不等同發音拍數。'};
}
export function miniQuestions(items,registry){
 if(items.length!==3||new Set(items).size!==3||items.some(id=>!kana.some(k=>k.id===id)))return [];
 return [...['pair','listen'].flatMap(mode=>items.map(item=>coachQuestion('kc:check:'+item+':'+mode))),...items.flatMap(item=>{const w=buildExamples(item,registry)[0];return w?[buildQuestion('kb:'+item+':'+w.id,registry)]:[];})];
}
export function validLabReference(source,reference,ids,registry){
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)return false;
 if(source==='kana-build')return ids.length<=3&&ids.every(id=>buildQuestion(id,registry)?.reviewItem===reference);
 if(source!=='kana-mini')return false;const items=String(reference).split(':'),cards=items.map(id=>kana.find(k=>k.id===id));if(items.length!==3||new Set(items).size!==3||cards.some(k=>!k)||new Set(cards.map(k=>k.script)).size!==1||ids.length<6||ids.length>9)return false;
 const first=miniQuestions(items,registry).slice(0,6).map(q=>q.id);if(JSON.stringify(ids.slice(0,6))!==JSON.stringify(first))return false;const tail=ids.slice(6).map(id=>buildQuestion(id,registry));return tail.every(q=>q&&items.includes(q.reviewItem))&&new Set(tail.map(q=>q.reviewItem)).size===tail.length;
}
