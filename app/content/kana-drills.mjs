import {kana} from './kana.mjs';
import {memoryFor,kanaRows,kanaGroups,kanaRowMatches} from './kana-memory.mjs';
import {presentationOrder} from '../core/study.mjs';
export const kanaModes=[{id:'listen',title:'聽音選字',description:'先聽聲音，再選字形；不顯示羅馬字。'},{id:'pair',title:'平片假名配對',description:'同一個聲音，換另一套字形。'},{id:'word',title:'詞中補字',description:'用詞音與詞義，自己打出缺少的假名。'},{id:'build',title:'組字與拍數',description:'比較原字、兩點、小圈，或小字／大字與一拍／兩拍。'}];
const basic=kana.filter(k=>k.group==='basic');
const sound=k=>k.reading==='wo'?'o':k.reading;
const alternatives=(target,script,auditory)=>(target.group==='basic'?basic:kana.filter(k=>k.group===target.group)).filter(k=>k.script===script&&k.id!==target.id&&(!auditory||sound(k)!==sound(target))).sort((a,b)=>Number(memoryFor(b.id).row===memoryFor(target.id).row)-Number(memoryFor(a.id).row===memoryFor(target.id).row));
function construction(k,m){
 let correct,wrong;
 if(k.group==='contracted'){
  const [front,small]=Array.from(k.glyph),large=String.fromCodePoint(small.codePointAt(0)+1);
  correct=`${front}＋小${small}，合成一拍`;
  wrong=[`${front}＋大${large}，合成一拍`,`${front}＋小${small}，分成兩拍`,`${front}＋大${large}，分成兩拍`];
 }else{
  const base=k.glyph.normalize('NFD')[0],mark=m.group==='semivoiced'?'小圈':'兩點';
  correct=`${base}＋${mark}`;wrong=[`${base}＋${mark==='兩點'?'小圈':'兩點'}`,`${base}，不加標記`,`${basic.find(p=>p.script===k.script&&p.glyph!==base).glyph}＋${mark}`];
 }
 return {kind:'choice',dimension:'language',prompt:`要寫出「${k.glyph}」，哪個組字${k.group==='contracted'?'與拍數':''}正確？`,options:[correct,...wrong],correct:0};
}
export const kanaDrills=kana.flatMap(k=>{
 const m=memoryFor(k.id),partner=kana.find(p=>p.id===m.partnerId);
 const make=(mode,extra)=>({id:`km-${k.id}-${mode}`,reviewItem:k.id,level:'K',unitId:k.group==='basic'?(k.script==='hira'?'K01':'K07'):k.group==='contracted'?'K14':'K13',script:k.script,row:m.row,mode,explanation:`${m.anchor}。${m.tip} 這是記憶聯想；筆順請對照示範。${m.wordNote?' '+m.wordNote:''}`,...extra});
 const listenOptions=[k,...alternatives(k,k.script,true).slice(0,3)].map(c=>c.glyph);
 const pairOptions=[partner,...alternatives(partner,partner.script,false).slice(0,3)].map(c=>c.glyph);
 const blank=k.group==='basic'?k.word.replace(k.glyph,'＿＿'):m.practiceWord.replaceAll(k.glyph,'＿＿');
 const wordPrompt=`${blank}（${k.meaning}）：請填缺少的${k.script==='hira'?'平':'片'}假名。可先聽完整詞音。${k.group==='basic'?'':` ${k.group==='contracted'?'填完整兩字組合；':''}多個空格填同一組字一次。本題按指定字形練拼字，常用寫法答後對照。`}`;
 const drills=[make('listen',{kind:'listen',dimension:'listening',transcript:k.glyph,prompt:'先聽音檔，選出對應的假名。',options:listenOptions,correct:0}),make('pair',{kind:'choice',dimension:'recognition',prompt:`「${k.glyph}」換成${k.script==='hira'?'片':'平'}假名是哪一個？`,options:pairOptions,correct:0}),make('word',{kind:'cloze',dimension:'language',prompt:wordPrompt,audio:k.word,accepted:[k.glyph]})];
 return k.group==='basic'?drills:[...drills,make('build',construction(k,m))];
});
const byId=new Map(kanaDrills.map(q=>[q.id,q]));
export function validKanaReference(reference,questionIds){
 const [script,mode,row,...rest]=String(reference).split(':');
 return !rest.length&&['hira','kata'].includes(script)&&kanaModes.some(m=>m.id===mode)&&(kanaGroups.some(g=>g.mixed===row)||kanaRows.some(r=>r.id===row))&&questionIds.length>0&&questionIds.every(id=>{const q=byId.get(id);return q&&q.script===script&&q.mode===mode&&kanaRowMatches(q.reviewItem,row);});
}
export function selectKanaDrills(state,{script,mode,row,count=5,seed,time}){
 if(!validKanaReference(`${script}:${mode}:${row}`,[kanaDrills.find(q=>q.script===script&&q.mode===mode&&kanaRowMatches(q.reviewItem,row))?.id])||![5,10].includes(count))throw new Error('請選擇有效的假名與練習');
 const pool=kanaDrills.filter(q=>q.script===script&&q.mode===mode&&kanaRowMatches(q.reviewItem,row));
 const shuffled=presentationOrder(pool.length,seed).map(i=>pool[i]);
 const priority=q=>{const r=state.reviews[`${q.reviewItem}:${q.dimension}`],last=r?.history.at(-1);return r&&Date.parse(r.due)<=Date.parse(time)&&(!last.correct||last.hinted)?0:!r?1:2;};
 return shuffled.sort((a,b)=>priority(a)-priority(b)).slice(0,count);
}
