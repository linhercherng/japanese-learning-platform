import {courseIndex,courseCueSeen,courseAnswerUnknown} from './course-history-state.mjs';
import {lifeUnits,scenarios,unitById,questionById,unitQuestions} from '../content/catalog.mjs';
import {memoryQuestionIds,isLifeSource,lifeQuestionUnits,validLifeReference} from '../content/life-memory-ids.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
import {studyDay} from './v3-state.mjs';
export const lifeMemoryUnits=[...lifeUnits,...scenarios];
export const memoryQuestions=unitId=>memoryQuestionIds(unitId).map(id=>questionById.get(id));
export function memoryPhrases(unitId){const seen=new Set();return (unitById.get(unitId)?.dialogue||[]).filter(p=>{if(seen.has(p.jp))return false;seen.add(p.jp);return true;}).slice(0,3);}
export const pendingLife=state=>state.v3.sessions.find(s=>isLifeSource(s.source)&&!s.completedAt);
export function startLifeMemory(state,{unitId,id,time}){if(pendingLife(state))return state;const qs=memoryQuestionIds(unitId);return qs.length?beginV3Session(state,qs,{id,time,source:'life-memory',reference:unitId}):state;}
export function lifeHistory(state,time){return state.attempts.filter(a=>lifeQuestionUnits.has(a.item)&&questionById.get(a.item)?.dimension===a.dimension&&a.dimension!=='writing'&&Date.parse(a.time)<=Date.parse(time)).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));}
export function lifeCheckCandidates(state,time){
 const attempts=lifeHistory(state,time),reviews=recordAnswers(initialState(),attempts).reviews,latest=new Map();for(const a of attempts)latest.set(a.item,a);
 const ranked=[...latest.values()].filter(a=>studyDay(a.time)<studyDay(time)).map(a=>({q:questionById.get(a.item),a,due:Date.parse(reviews[a.item+':'+a.dimension].due)<=Date.parse(time)}));
 ranked.sort((a,b)=>Number(!b.a.correct||b.a.hinted)-Number(!a.a.correct||a.a.hinted)||Number(b.due)-Number(a.due)||Date.parse(a.a.time)-Date.parse(b.a.time)||a.q.id.localeCompare(b.q.id));
 const units=new Set(),out=[];for(const {q} of ranked)if(!units.has(q.unitId)){units.add(q.unitId);out.push(q);if(out.length===3)break;}return out;
}
export function startLifeCheck(state,{id,time}){if(pendingLife(state)||state.v3.sessions.some(s=>s.source==='life-check'&&s.reference===studyDay(time)))return state;const qs=lifeCheckCandidates(state,time);return qs.length?beginV3Session(state,qs.map(q=>q.id),{id,time,source:'life-check',reference:studyDay(time)}):state;}
export function lifeCheckReport(state,sessionId){
 const s=state.v3.sessions.find(s=>s.id===sessionId&&['life-check','life-week'].includes(s.source)),r={total:0,independent:0,hinted:0,comparable:0,retained:0,excluded:0};if(!s)return r;const index=courseIndex(state,s.updatedAt);
 for(const [qid,a] of Object.entries(s.answers)){
  const hinted=a.hinted||courseCueSeen(state,qid,s.createdAt,a.time,s.source==='life-week'?7:1);r.total++;if(hinted)r.hinted++;if(a.correct&&!hinted)r.independent++;
  const all=lifeHistory(state,a.time).filter(h=>h.item===qid),prior=all.filter(h=>Date.parse(h.time)<Date.parse(s.createdAt)).at(-1);
  const between=all.some(h=>Date.parse(h.time)>=Date.parse(s.createdAt)&&Date.parse(h.time)<Date.parse(a.time)),sameTime=all.filter(h=>Date.parse(h.time)===Date.parse(a.time));
  if(hinted||sameTime.length===1&&courseAnswerUnknown(index,sameTime[0])||!prior||(Date.parse(studyDay(a.time))-Date.parse(studyDay(prior.time)))/86400000<(s.source==='life-week'?7:1)||between||sameTime.length!==1){r.excluded++;continue;}
  r.comparable++;if(a.correct)r.retained++;
 }return r;
}
export function validateLifeCatalog(state){
 for(const s of state.v3.sessions)if(isLifeSource(s.source)&&(!validLifeReference(s.source,s.reference,s.questionIds)||s.questionIds.some(id=>!questionById.has(id))))throw new Error('生活記憶題目與原課不一致。');
 for(const qid of Object.keys(state.v3.lifeHints||{}))if(!questionById.has(qid)||!unitQuestions(unitById.get(lifeQuestionUnits.get(qid))).some(q=>q.id===qid))throw new Error('生活參考題目不存在。');
}
