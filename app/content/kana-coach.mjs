import {kana} from './kana.mjs';
import {kanaDrills} from './kana-drills.mjs';
import {memoryFor} from './kana-memory.mjs';
const byId=new Map(kana.map(k=>[k.id,k])),byGlyph=new Map(kana.map(k=>[k.glyph,k]));
const drills=new Map(kanaDrills.map(q=>[`${q.reviewItem}:${q.mode}`,q]));
const sound=k=>k.reading==='wo'?'o':k.reading;
export const coachSources=['kana-check','kana-confusion','kana-map'];
export function confusedKana(question,value){
 if(!['choice','listen'].includes(question.kind)||!Number.isInteger(value)||value===question.correct)return null;
 const target=byGlyph.get(question.options?.[question.correct]),chosen=byGlyph.get(question.options?.[value]);
 return target&&chosen&&target.id!==chosen.id&&target.script===chosen.script?{target:target.id,chosen:chosen.id}:null;
}
export function coachQuestion(id){
 const [prefix,left,right,mode,...extra]=String(id).split(':');
 if(prefix!=='kc'||extra.length||!['listen','pair','word'].includes(mode))return null;
 const check=left==='check',target=byId.get(check?right:left),other=check?null:byId.get(right);
 if(!target||check&&mode==='word'||!check&&(!other||target.id===other.id||target.script!==other.script)||other&&mode==='listen'&&sound(target)===sound(other))return null;
 const base=drills.get(`${target.id}:${mode}`);if(!base)return null;
 const q={...base,id};
 if(mode!=='word'){
  const partner=k=>byId.get(memoryFor(k.id).partnerId),shown=mode==='pair'?partner(target):target;
  const wrong=other?(mode==='pair'?partner(other):other):null;
  const pool=kana.filter(k=>k.script===shown.script&&k.group===shown.group&&k.id!==shown.id&&(mode!=='listen'||sound(k)!==sound(shown)));
  const offset=[...target.id].reduce((n,c)=>n+c.codePointAt(0),0)%pool.length;
  const options=[shown,...(wrong?[wrong]:[]),...pool.slice(offset),...pool.slice(0,offset)];
  q.options=[...new Set(options.map(k=>k.glyph))].slice(0,4);q.correct=0;
 }
 return q;
}
export function confusionQuestions(reference){
 const [left,right,...rest]=String(reference).split(':');if(rest.length)return [];
 return [[left,right],[right,left]].flatMap(([a,b])=>['pair','listen','word'].map(mode=>coachQuestion(`kc:${a}:${b}:${mode}`)).filter(Boolean));
}
export function validCoachReference(source,reference,questionIds){
 if(!Array.isArray(questionIds)||!questionIds.length||new Set(questionIds).size!==questionIds.length)return false;
 if(source==='kana-map')return byId.has(reference)&&questionIds.length<=2&&questionIds.every(id=>id.startsWith('kc:check:')&&coachQuestion(id)?.reviewItem===reference);
 if(source==='kana-confusion'){
  const allowed=new Set(confusionQuestions(reference).map(q=>q.id));
  return questionIds.length<=6&&questionIds.every(id=>allowed.has(id));
 }
 return source==='kana-check'&&/^\d{4}-\d\d-\d\d$/.test(reference)&&questionIds.length<=10&&questionIds.every(id=>id.startsWith('kc:check:')&&coachQuestion(id));
}
