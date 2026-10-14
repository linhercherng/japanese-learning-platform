import {kana} from './kana.mjs';
import {memoryFor,kanaRows} from './kana-memory.mjs';
import {presentationOrder} from '../core/study.mjs';
export const kanaModes=[{id:'listen',title:'聽音選字',description:'先聽聲音，再選字形；不顯示羅馬字。'},{id:'pair',title:'平片假名配對',description:'同一個聲音，換另一套字形。'},{id:'word',title:'詞中補字',description:'用詞音與詞義，自己打出缺少的假名。'}];
const basic=kana.filter(k=>k.group==='basic');
const sound=k=>k.reading==='wo'?'o':k.reading;
const alternatives=(target,script,auditory)=>basic.filter(k=>k.script===script&&k.id!==target.id&&(!auditory||sound(k)!==sound(target))).sort((a,b)=>Number(memoryFor(b.id).row===memoryFor(target.id).row)-Number(memoryFor(a.id).row===memoryFor(target.id).row));
export const kanaDrills=basic.flatMap(k=>{
 const m=memoryFor(k.id),partner=basic.find(p=>p.id===m.partnerId);
 const make=(mode,extra)=>({id:`km-${k.id}-${mode}`,reviewItem:k.id,level:'K',unitId:k.script==='hira'?'K01':'K07',script:k.script,row:m.row,mode,explanation:`${m.anchor}。${m.tip} 這是記憶聯想；筆順請對照示範。`,...extra});
 const listenOptions=[k,...alternatives(k,k.script,true).slice(0,3)].map(c=>c.glyph);
 const pairOptions=[partner,...alternatives(partner,partner.script,false).slice(0,3)].map(c=>c.glyph);
 const blank=k.word.replace(k.glyph,'＿＿');
 return [make('listen',{kind:'listen',dimension:'listening',transcript:k.glyph,prompt:'先聽音檔，選出對應的假名。',options:listenOptions,correct:0}),make('pair',{kind:'choice',dimension:'recognition',prompt:`「${k.glyph}」換成${k.script==='hira'?'片':'平'}假名是哪一個？`,options:pairOptions,correct:0}),make('word',{kind:'cloze',dimension:'language',prompt:`${blank}（${k.meaning}）：請填缺少的${k.script==='hira'?'平':'片'}假名。可先聽完整詞音。`,audio:k.word,accepted:[k.glyph]})];
});
const byId=new Map(kanaDrills.map(q=>[q.id,q]));
export function validKanaReference(reference,questionIds){
 const [script,mode,row,...rest]=String(reference).split(':');
 return !rest.length&&['hira','kata'].includes(script)&&kanaModes.some(m=>m.id===mode)&&(row==='all'||kanaRows.some(r=>r.id===row))&&questionIds.length>0&&questionIds.every(id=>{const q=byId.get(id);return q&&q.script===script&&q.mode===mode&&(row==='all'||q.row===row);});
}
export function selectKanaDrills(state,{script,mode,row,count=5,seed,time}){
 if(!validKanaReference(`${script}:${mode}:${row}`,[kanaDrills.find(q=>q.script===script&&q.mode===mode&&(row==='all'||q.row===row))?.id])||![5,10].includes(count))throw new Error('請選擇有效的假名與練習');
 const pool=kanaDrills.filter(q=>q.script===script&&q.mode===mode&&(row==='all'||q.row===row));
 const shuffled=presentationOrder(pool.length,seed).map(i=>pool[i]);
 const priority=q=>{const r=state.reviews[`${q.reviewItem}:${q.dimension}`],last=r?.history.at(-1);return r&&Date.parse(r.due)<=Date.parse(time)&&(!last.correct||last.hinted)?0:!r?1:2;};
 return shuffled.sort((a,b)=>priority(a)-priority(b)).slice(0,count);
}
