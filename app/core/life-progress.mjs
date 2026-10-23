import {lifeDailyCompleted,lifeWeekSchedule} from './life-retention.mjs';
import {questionById,unitQuestions,unitById} from '../content/catalog.mjs';
import {isLifeSource} from '../content/life-memory-ids.mjs';
import {lifeMemoryUnits,lifeHistory,lifeCheckCandidates,pendingLife} from './life-memory.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
import {studyDay} from './v3-state.mjs';
const latest=attempts=>new Map(attempts.map(a=>[a.item,a]));
function weakEntries(attempts){
 const reviews=recordAnswers(initialState(),attempts).reviews;
 return [...latest(attempts).values()].filter(a=>!a.correct||a.hinted).map(a=>({q:questionById.get(a.item),a,due:reviews[a.item+':'+a.dimension].due})).sort((a,b)=>Number(!b.a.correct)-Number(!a.a.correct)||Date.parse(a.due)-Date.parse(b.due)||Date.parse(a.a.time)-Date.parse(b.a.time)||a.q.id.localeCompare(b.q.id));
}
export function lifeWeakQuestions(state,time){
 const units=new Set(),out=[];for(const {q} of weakEntries(lifeHistory(state,time)))if(!units.has(q.unitId)){units.add(q.unitId);out.push(q);if(out.length===3)break;}return out;
}
export function lifeMemoryMap(state,time){
 const attempts=lifeHistory(state,time),last=latest(attempts),groups=new Map();
 for(const a of attempts){const id=questionById.get(a.item).unitId;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(a);}
 return lifeMemoryUnits.map(unit=>{const list=groups.get(unit.id)||[],ids=new Set(list.map(a=>a.item)),weak=[...ids].filter(id=>!last.get(id).correct||last.get(id).hinted).length;return {id:unit.id,unit,practiced:ids.size,total:unitQuestions(unit).length,days:new Set(list.map(a=>studyDay(a.time))).size,weak,status:!ids.size?'new':weak?'weak':'practiced'};});
}
export function lifeProgressReport(state,time){
 const attempts=lifeHistory(state,time),first=new Map(),report=Object.fromEntries(['listening','productive','understanding'].map(key=>[key,{total:0,independent:0,hinted:0,ambiguous:0}]));
 const collisions=new Map();for(const a of attempts){const key=a.item+':'+studyDay(a.time);if(!first.has(key))first.set(key,a);const stamp=a.item+':'+Date.parse(a.time);collisions.set(stamp,(collisions.get(stamp)||0)+1);}
 for(const a of first.values()){
  const q=questionById.get(a.item),key=q.dimension==='listening'?'listening':['cloze','order'].includes(q.kind)?'productive':'understanding',r=report[key];r.total++;
  if(collisions.get(a.item+':'+Date.parse(a.time))>1){r.ambiguous++;continue;}if(a.hinted)r.hinted++;if(a.correct&&!a.hinted)r.independent++;
 }return report;
}
export function lifeNextStep(state,time){
 const p=pendingLife(state);if(p)return {kind:'pending',title:'接續未完成的生活回想',detail:'先完成原輪，首答與提示會保留。',route:'v3-practice/'+p.id};
 if(lifeDailyCompleted(state,time))return {kind:'done',title:'今天的一小步，完成了。',detail:'先停在這裡也很好；明天再回想，比一直重做更能看清記住了什麼。',route:'life-schedule'};
 if(!state.v3.sessions.some(s=>s.source==='life-week'&&s.reference===studyDay(time))&&lifeWeekSchedule(state,time).questions.length)return {kind:'week',title:'先確認七天後還記不記得',detail:'只回想距離練習與參考都已滿七天的原題。',route:'life-week'};
 if(!state.v3.sessions.some(s=>s.source==='life-check'&&s.reference===studyDay(time))&&lifeCheckCandidates(state,time).length)return {kind:'check',title:'先做隔天生活複習',detail:'較早日期做過的題目，先不看參考想一次。',route:'life-check'};
 if(lifeWeakQuestions(state,time).length)return {kind:'repair',title:'先練最多三題弱點',detail:'從最近錯答或用過提示的原題中，每課挑一題。',route:null};
 const unit=lifeMemoryMap(state,time).find(u=>u.status==='new');return unit?{kind:'new',title:'學一個還沒練過的場景',detail:unit.unit.title,route:'life-memory/'+unit.id}:{kind:'done',title:'今天可以先收尾了',detail:'練過不代表熟練。隔天再確認，也能回原課寫自己的句子。',route:'life-check'};
}
export function startLifeRepair(state,{id,time}){if(pendingLife(state))return state;const qs=lifeWeakQuestions(state,time);return qs.length?beginV3Session(state,qs.map(q=>q.id),{id,time,source:'life-repair',reference:studyDay(time)}):state;}
export function lifeRoundReview(state,sessionId,time){
 const session=state.v3.sessions.find(s=>s.id===sessionId&&isLifeSource(s.source)&&s.completedAt&&Date.parse(s.completedAt)<=Date.parse(time));if(!session)return null;
 const entries=session.questionIds.map(id=>({q:questionById.get(id),answer:structuredClone(session.answers[id]),unit:unitById.get(questionById.get(id)?.unitId)}));
 return entries.every(e=>e.q&&e.answer&&e.unit&&Date.parse(e.answer.time)<=Date.parse(time))?{session,entries}:null;
}
