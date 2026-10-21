import {kana} from '../content/kana.mjs';
import {coachQuestion} from '../content/kana-coach.mjs';
import {studyDay} from './v3-state.mjs';
import {beginV3Session} from './v3-learning.mjs';
import {kanaMemoryMap} from './kana-coach.mjs';
const known=new Set(kana.map(k=>k.id)),ordinal=time=>Date.parse(studyDay(time))/86400000,dayLabel=n=>new Date(n*86400000).toISOString().slice(0,10);
function history(state,time){
 const map=new Map();for(const a of state.attempts){if(!known.has(a.item)||!['recognition','listening','language','writing'].includes(a.dimension)||Date.parse(a.time)>Date.parse(time))continue;const key=a.item+':'+a.dimension;if(!map.has(key))map.set(key,[]);map.get(key).push(a);}
 for(const list of map.values())list.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));return map;
}
export function weekSchedule(state,time){
 const today=ordinal(time),histories=history(state,time),eligible=[],upcoming=[];
 for(const k of kana)for(const dimension of ['recognition','listening']){
  const last=histories.get(k.id+':'+dimension)?.at(-1);if(!last)continue;
  const hint=state.v3.kanaHints?.[k.id]?.lastHintAt,hintDay=hint&&Date.parse(hint)<=Date.parse(time)?ordinal(hint):-Infinity,ready=Math.max(ordinal(last.time),hintDay)+7;
  if(ready>today){upcoming.push(ready);continue;}
  eligible.push({q:coachQuestion('kc:check:'+k.id+':'+(dimension==='recognition'?'pair':'listen')),weak:!last.correct||last.hinted,time:last.time});
 }
 eligible.sort((a,b)=>Number(b.weak)-Number(a.weak)||Date.parse(a.time)-Date.parse(b.time)||a.q.id.localeCompare(b.q.id));
 return {questions:eligible.slice(0,10).map(x=>x.q),eligible:eligible.length,nextDay:upcoming.length?dayLabel(Math.min(...upcoming)):null};
}
export function startWeekCheck(state,{id,time}){
 if(state.v3.sessions.some(s=>s.source==='kana-week'&&(!s.completedAt||s.reference===studyDay(time))))return state;
 const ids=weekSchedule(state,time).questions.map(q=>q.id);return ids.length?beginV3Session(state,ids,{id,source:'kana-week',reference:studyDay(time),time}):state;
}
export function weekEvidence(state,session){
 const histories=history(state,session.updatedAt),result={total:0,correct:0,hinted:0,excluded:0};
 for(const [id,a] of Object.entries(session.answers)){
  const q=coachQuestion(id);if(!q){result.excluded++;continue;}
  if(a.hinted){result.hinted++;result.excluded++;continue;}
  const list=histories.get(q.reviewItem+':'+q.dimension)||[],before=list.filter(h=>Date.parse(h.time)<Date.parse(session.createdAt)),last=before.at(-1);
  const between=list.some(h=>Date.parse(h.time)>=Date.parse(session.createdAt)&&Date.parse(h.time)<Date.parse(a.time)),sameTime=list.filter(h=>Date.parse(h.time)===Date.parse(a.time));
  const hint=state.v3.kanaHints?.[q.reviewItem]?.lastHintAt,recentBefore=hint&&Date.parse(hint)<Date.parse(session.createdAt)&&Date.parse(hint)<=Date.parse(a.time)&&ordinal(a.time)-ordinal(hint)<7;
  if(!last||ordinal(a.time)-ordinal(last.time)<7||recentBefore||between||sameTime.length!==1){result.excluded++;continue;}
  result.total++;if(a.hinted)result.hinted++;if(a.correct&&!a.hinted)result.correct++;
 }return result;
}
export function kanaRecallReport(state,time){
 const end=ordinal(time),start=end-6,histories=history(state,time),abilities=Object.fromEntries(['recognition','listening','language'].map(d=>[d,{total:0,correct:0,hinted:0,needsReview:0,ambiguous:0}]));let writing=0;
 for(const [key,list] of histories){const dimension=key.slice(key.lastIndexOf(':')+1),first=new Map();for(const a of list){const day=ordinal(a.time);if(day>=start&&day<=end&&!first.has(day))first.set(day,a);}
  if(dimension==='writing'){writing+=[...first.values()].length;continue;}
  const stats=abilities[dimension];for(const a of first.values()){stats.total++;if(list.filter(h=>Date.parse(h.time)===Date.parse(a.time)).length>1){stats.ambiguous++;continue;}if(a.hinted)stats.hinted++;if(a.correct&&!a.hinted)stats.correct++;else stats.needsReview++;}
 }
 const recommendations=kanaMemoryMap(state,time).filter(k=>k.recognition.weak||k.listening.weak).sort((a,b)=>Math.max(Date.parse(b.recognition.lastTime||0)||0,Date.parse(b.listening.lastTime||0)||0)-Math.max(Date.parse(a.recognition.lastTime||0)||0,Date.parse(a.listening.lastTime||0)||0)).slice(0,3);
 return {start:dayLabel(start),end:dayLabel(end),abilities,writing,recommendations,week:weekSchedule(state,time)};
}
