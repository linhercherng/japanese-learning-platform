import {kana} from './kana.mjs';
import {confusionPairs} from './confusions.mjs';
import {memoryFor} from './kana-memory.mjs';
const labels=['兩點與尾筆方向','長筆的起點方向','右下的小圈','伸出還是繞圈','右側橫筆數量','圓弧與外伸尾'];
export const duelPairs=confusionPairs.map((p,i)=>({...p,label:labels[i]}));
export const duelQuestions=duelPairs.flatMap(p=>[p.leftId,p.rightId].map(item=>{
 const target=kana.find(k=>k.id===item),other=kana.find(k=>k.id===(item===p.leftId?p.rightId:p.leftId));
 return {id:'kd:'+p.id+':'+item,pairId:p.id,reviewItem:item,otherItem:other.id,mode:'duel',kind:'listen',dimension:'listening',level:'K',unitId:'K01',transcript:target.glyph,prompt:'先聽聲音，在這兩個字中選一個。',options:[target.glyph,other.glyph],correct:0,explanation:target.glyph+' 的輔助讀音是 '+target.reading+'。'+p.difference+' '+p.memoryTip};
}));
const questions=new Map(duelQuestions.map(q=>[q.id,q]));
export const duelQuestion=id=>questions.get(id)||null;
export function validDuelReference(reference,ids){
 const expected=duelQuestions.filter(q=>q.pairId===reference).map(q=>q.id);
 return expected.length===2&&Array.isArray(ids)&&JSON.stringify(expected)===JSON.stringify(ids);
}
export function flipCards(item){
 const k=kana.find(k=>k.id===item);if(!k)return [];
 const pool=kana.filter(p=>p.script===k.script&&memoryFor(p.id).group===memoryFor(k.id).group),start=pool.findIndex(p=>p.id===item);
 return [...pool.slice(start),...pool.slice(0,start)].slice(0,3);
}
export function nextFlipStart(item){const k=kana.find(k=>k.id===item);if(!k)return null;const pool=kana.filter(p=>p.script===k.script&&memoryFor(p.id).group===memoryFor(k.id).group);return pool[(pool.findIndex(p=>p.id===item)+3)%pool.length].id;}
export function flipCueItems(item,revealed){
 const k=kana.find(k=>k.id===item);if(!k)return [];const visible=k.glyph+(revealed?k.reading+k.word+k.wordReading+memoryFor(item).tip:'');
 return kana.filter(p=>visible.includes(p.glyph)).map(p=>p.id);
}
// Practice cues from today or this still-open round remain distinct from independent recall.
export function duelCueSeen(hints,q,createdAt,time){
 const day=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
 return [q.reviewItem,q.otherItem].some(id=>{const cue=hints?.[id]?.lastHintAt;return cue&&Date.parse(cue)<=Date.parse(time)&&(Date.parse(cue)>=Date.parse(createdAt)||day(cue)===day(time));});
}
