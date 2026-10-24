import {kanaCueSeen,legacyKanaUnknown} from './kana-history-state.mjs';
import {kana} from '../content/kana.mjs';
import {coachQuestion,confusedKana} from '../content/kana-coach.mjs';
import {resolveLearningQuestion} from '../content/catalog.mjs';
import {studyDay} from './v3-state.mjs';
import {beginV3Session} from './v3-learning.mjs';
const ids=new Set(kana.map(k=>k.id)),dimensions=['recognition','listening','writing'];
function histories(state,time){
 const map=new Map();for(const a of state.attempts){if(!ids.has(a.item)||!dimensions.includes(a.dimension)||Date.parse(a.time)>Date.parse(time))continue;const key=`${a.item}:${a.dimension}`;if(!map.has(key))map.set(key,[]);map.get(key).push(a);}
 for(const list of map.values())list.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));return map;
}
function ability(state,list=[],dimension,time){
 const first=new Map();for(const a of list)if(!first.has(studyDay(a.time)))first.set(studyDay(a.time),a);
 const hinted=a=>a.hinted||dimension!=='writing'&&kanaCueSeen(state,[a.item],a.time,a.time),uncertain=a=>dimension!=='writing'&&legacyKanaUnknown(state,a,time);
 const independentDays=[...first.values()].filter(a=>a.correct&&!hinted(a)&&!uncertain(a)&&list.filter(h=>Date.parse(h.time)===Date.parse(a.time)).length===1).length,last=list.at(-1);
 const latestFirst=[...first.values()].at(-1);
 const ambiguous=last&&(list.filter(h=>Date.parse(h.time)===Date.parse(last.time)).length>1||list.filter(h=>Date.parse(h.time)===Date.parse(latestFirst.time)).length>1),unknown=last&&uncertain(latestFirst);
 const weak=last&&(!last.correct||hinted(last)||!latestFirst.correct||hinted(latestFirst)||ambiguous||unknown);
 const label=dimension==='writing'?(last?(weak?'自評需再對照':'已有手寫自評'):'未留下自評'):!last?'未練習':ambiguous||unknown?'紀錄待確認':weak?'需要複習':independentDays>=2?'已有跨日回想':'已獨立答對';
 return {label,total:list.length,days:first.size,independentDays,weak:Boolean(weak),lastTime:last?.time||null};
}
export function kanaMemoryMap(state,time=new Date().toISOString()){
 const map=histories(state,time);return kana.map(k=>({...k,...Object.fromEntries(dimensions.map(d=>[d,{...ability(state,map.get(`${k.id}:${d}`),d,time),due:Boolean(state.reviews[`${k.id}:${d}`]&&Date.parse(state.reviews[`${k.id}:${d}`].due)<=Date.parse(time))}]))}));
}
export function kanaConfusions(state){
 const events=new Map();
 function include(c,time,dimension,item){if(!c||!ids.has(c.target)||!ids.has(c.chosen))return;events.set(`${time}:${dimension}:${item}:${c.target}:${c.chosen}`,{...c,time,dimension});}
 for(const a of state.attempts)if(!a.correct)include(a.kanaConfusion,a.time,a.dimension,a.item);
 const saved=[...state.v3.sessions,...(state.practiceHistory||[]),...(state.practice?[state.practice]:[])];
 for(const s of saved)for(const [qid,a] of Object.entries(s.answers)){
  if(a.correct)continue;const q=resolveLearningQuestion(qid);if(q)include(confusedKana(q,a.value),a.time,q.dimension,q.reviewItem||qid);
 }
 const pairs=new Map();for(const a of events.values()){
  const [left,right]=[a.target,a.chosen].sort(),reference=`${left}:${right}`;
  const p=pairs.get(reference)||{left,right,reference,count:0,recognition:0,listening:0,lastTime:a.time};
  p.count++;if(a.dimension==='recognition'||a.dimension==='listening')p[a.dimension]++;
  if(a.time>p.lastTime)p.lastTime=a.time;pairs.set(reference,p);
 }
 return [...pairs.values()].sort((a,b)=>b.lastTime.localeCompare(a.lastTime)||b.count-a.count||a.reference.localeCompare(b.reference));
}
export function nextDayCandidates(state,time=new Date().toISOString()){
 const today=studyDay(time),map=histories(state,time),candidates=[];
 for(const k of kana)for(const dimension of ['recognition','listening']){
  const history=map.get(`${k.id}:${dimension}`)||[];
  if(!history.some(a=>studyDay(a.time)<today)||history.some(a=>studyDay(a.time)===today))continue;
  const last=history.at(-1),q=coachQuestion(`kc:check:${k.id}:${dimension==='recognition'?'pair':'listen'}`);
  candidates.push({q,weak:!last.correct||last.hinted,due:state.reviews[`${k.id}:${dimension}`]?.due||last.time});
 }
 return candidates.sort((a,b)=>Number(b.weak)-Number(a.weak)||a.due.localeCompare(b.due)||a.q.id.localeCompare(b.q.id)).slice(0,10).map(c=>c.q);
}
export function startKanaCheck(state,{id,time}){
 const reference=studyDay(time);if(state.v3.sessions.some(s=>s.source==='kana-check'&&s.reference===reference))return state;
 const questions=nextDayCandidates(state,time);return questions.length?beginV3Session(state,questions.map(q=>q.id),{id,source:'kana-check',reference,time}):state;
}
export function checkEvidence(state,session){
 const map=histories(state,session.updatedAt),result={total:0,correct:0,hinted:0,excluded:0};
 for(const [qid,a] of Object.entries(session.answers)){
  const q=coachQuestion(qid);if(!q)continue;const history=map.get(`${q.reviewItem}:${q.dimension}`)||[],day=studyDay(a.time);
  const first=history.find(h=>studyDay(h.time)===day),sameTime=history.filter(h=>h.time===a.time);
  if(!history.some(h=>studyDay(h.time)<day)||first?.time!==a.time||sameTime.length!==1||!a.hinted&&kanaCueSeen(state,[q.reviewItem],session.createdAt,a.time)||first&&legacyKanaUnknown(state,first,session.updatedAt)){result.excluded++;continue;}
  result.total++;if(a.correct&&!a.hinted)result.correct++;if(a.hinted)result.hinted++;
 }return result;
}
