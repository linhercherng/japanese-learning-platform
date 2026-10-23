import {questionById} from '../content/catalog.mjs';
import {isLifeSource} from '../content/life-memory-ids.mjs';
import {lifeHistory,pendingLife} from './life-memory.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
import {studyDay} from './v3-state.mjs';
const ordinal=time=>Date.parse(studyDay(time))/86400000;
const dayLabel=n=>new Date(n*86400000).toISOString().slice(0,10);
function snapshot(state,time){
 const attempts=lifeHistory(state,time),last=new Map(attempts.map(a=>[a.item,a])),reviews=recordAnswers(initialState(),attempts).reviews;
 return [...last.values()].map(a=>{
  const hints=(state.v3.lifeHints?.[a.item]||[]).filter(t=>Date.parse(t)<=Date.parse(time)),lastHint=hints.length?Math.max(...hints.map(ordinal)):-Infinity;
  return {q:questionById.get(a.item),a,checkDay:ordinal(a.time)+1,weekDay:Math.max(ordinal(a.time),lastHint)+7,due:Date.parse(reviews[a.item+':'+a.dimension].due)<=Date.parse(time)};
 });
}
export function lifeWeekSchedule(state,time){
 const rows=snapshot(state,time),today=ordinal(time),eligible=rows.filter(r=>r.weekDay<=today),upcoming=rows.filter(r=>r.weekDay>today);
 eligible.sort((a,b)=>Number(!b.a.correct||b.a.hinted)-Number(!a.a.correct||a.a.hinted)||Number(b.due)-Number(a.due)||Date.parse(a.a.time)-Date.parse(b.a.time)||a.q.id.localeCompare(b.q.id));
 const units=new Set(),questions=[];for(const {q} of eligible)if(!units.has(q.unitId)){units.add(q.unitId);questions.push(q);if(questions.length===3)break;}
 return {questions,eligible:eligible.length,nextDay:upcoming.length?dayLabel(Math.min(...upcoming.map(r=>r.weekDay))):null};
}
export function startLifeWeek(state,{id,time}){
 if(pendingLife(state)||state.v3.sessions.some(s=>s.source==='life-week'&&s.reference===studyDay(time)))return state;
 const ids=lifeWeekSchedule(state,time).questions.map(q=>q.id);return ids.length?beginV3Session(state,ids,{id,time,source:'life-week',reference:studyDay(time)}):state;
}
export function lifeDailyCompleted(state,time){return state.v3.sessions.filter(s=>isLifeSource(s.source)&&s.completedAt&&Date.parse(s.createdAt)<=Date.parse(time)&&Date.parse(s.completedAt)<=Date.parse(time)&&Object.values(s.answers).every(a=>Date.parse(a.time)<=Date.parse(time))&&studyDay(s.completedAt)===studyDay(time)).sort((a,b)=>Date.parse(b.completedAt)-Date.parse(a.completedAt)||a.id.localeCompare(b.id))[0]||null;}
export function lifeForecast(state,time){
 const units=new Map();for(const r of snapshot(state,time)){
  const old=units.get(r.q.unitId);if(!old)units.set(r.q.unitId,{unitId:r.q.unitId,checkDay:r.checkDay,weekDay:r.weekDay});else{old.checkDay=Math.min(old.checkDay,r.checkDay);old.weekDay=Math.min(old.weekDay,r.weekDay);}
 }
 const entries=[...units.values()].sort((a,b)=>a.weekDay-b.weekDay||a.checkDay-b.checkDay||a.unitId.localeCompare(b.unitId)).slice(0,6).map(r=>({...r,checkDay:dayLabel(r.checkDay),weekDay:dayLabel(r.weekDay)}));
 return {entries,total:units.size};
}
