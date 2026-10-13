import {dueReviews} from './learning.mjs';
import {studyDay,validateDailyPlan} from './v3-state.mjs';
function conceptLookup(concepts,questions){
 const map=new Map();for(const c of concepts)for(const id of c.itemIds)map.set(id,c.id);
 for(const q of questions)map.set(q.id,q.conceptId);return map;
}
export function conceptProgress(state,concepts,questions){
 const lookup=conceptLookup(concepts,questions),events=new Map();
 for(const a of state.attempts){const conceptId=lookup.get(a.item);if(!conceptId||a.dimension==='writing')continue;const key=`${conceptId}:${a.dimension}`;if(!events.has(key))events.set(key,[]);events.get(key).push(a);}
 const result=[];
 for(const c of concepts)for(const dimension of c.dimensions){
  const history=(events.get(`${c.id}:${dimension}`)||[]).slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));
  const days=[...new Set(history.map(a=>studyDay(a.time)))],latestDay=days.at(-1),last=history.filter(a=>studyDay(a.time)===latestDay);
  const weak=last.some(a=>!a.correct||a.hinted),goodDays=days.filter(day=>history.filter(a=>studyDay(a.time)===day).every(a=>a.correct&&!a.hinted)).length;
  const label=!history.length?'還沒獨立練習':weak?'需要再回想':goodDays>=3?'跨日較穩定':goodDays>=2?'跨日想起來':'今日答對，跨日待觀察';
  result.push({conceptId:c.id,title:c.title,level:c.level,dimension,total:history.length,independent:history.filter(a=>a.correct&&!a.hinted).length,days:days.length,goodDays,weak,label,lastTime:history.at(-1)?.time||null});
 }return result;
}
export function makeDailyPlan(state,{concepts,questions,units,resolveQuestion,time,id,allowNew=false}){
 const day=studyDay(time),goal=state.v3.goal,minutes=state.settings.dailyMinutes;
 const existing=state.v3.dailyPlans.slice().reverse().find(p=>p.day===day&&p.goal===goal);
 if(existing&&!allowNew)return structuredClone(existing);
 const progress=conceptProgress(state,concepts,questions),lookup=conceptLookup(concepts,questions);
 const eligibleConcepts=concepts.filter(c=>goal==='L'?c.level==='N5'&&c.unitIds.some(id=>/^(S-|L)/.test(id)):c.level===goal);
 const eligibleIds=new Set(eligibleConcepts.map(c=>c.id));
 const due=dueReviews(state,time).filter(r=>{const q=resolveQuestion(r.item,r.dimension);return !q?.level||q.level===goal||(goal==='L'&&q.level==='N5'&&q.unitId?.startsWith('S-'));}),budget={5:3,15:6,30:10}[minutes],selected=[];
 // A due item is kept visible even if it lacks an automatic question (for example self-rated writing).
 const prioritized=due.slice().sort((a,b)=>{
  const aWeak=progress.some(p=>p.conceptId===lookup.get(a.item)&&p.dimension===a.dimension&&p.weak);
  const bWeak=progress.some(p=>p.conceptId===lookup.get(b.item)&&p.dimension===b.dimension&&p.weak);
  return Number(bWeak)-Number(aWeak)||a.due.localeCompare(b.due);
 });
 for(const r of prioritized){const q=resolveQuestion(r.item,r.dimension)||questions.find(q=>q.conceptId===lookup.get(r.item)&&q.dimension===r.dimension);if(q&&r.dimension!=='writing'&&!selected.some(x=>x.id===q.id)){selected.push(q);if(selected.length>=budget)break;}}
 const cap=minutes===5?1:minutes===15?3:5;
 const newCount=due.length>=10&&!allowNew?0:cap;
 const freshCandidates=eligibleConcepts.filter(c=>!progress.some(p=>p.conceptId===c.id&&p.total)).slice(0,newCount);
 const weak=progress.filter(p=>p.weak&&eligibleIds.has(p.conceptId));
 const candidateUnits=units.filter(u=>goal==='L'?u.level==='L'||u.id.startsWith('S-N5'):u.level===goal);
 const focus=freshCandidates[0]||eligibleConcepts.find(c=>c.id===weak[0]?.conceptId);
 const unit=candidateUnits.find(u=>focus?.unitIds.includes(u.id))||candidateUnits.find(u=>!state.completed[u.id])||candidateUnits[0]||units[0];
 if(!unit)throw new Error('沒有適合此目標的課程');
 const fresh=freshCandidates.filter(c=>c.unitIds.includes(unit.id));
 const focusIds=[...new Set([...weak.slice(0,fresh.length?(cap>1?1:0):cap).map(p=>p.conceptId),...fresh.map(c=>c.id)])].slice(0,Math.max(cap,1));
 const learned=eligibleConcepts.find(c=>progress.some(p=>p.conceptId===c.id&&p.total));
 if(!focusIds.length&&learned)focusIds.push(learned.id);
 const variants=[];
 const newConceptIds=fresh.filter(c=>focusIds.includes(c.id)).map(c=>c.id);
 for(const conceptId of focusIds){const pool=questions.filter(q=>q.conceptId===conceptId&&!selected.some(s=>s.id===q.id));variants.push(...pool.slice(0,minutes===30?3:2));}
 const steps=[
  {id:'recall',kind:selected.length?'practice':'learn',title:selected.length?`先回想 ${selected.length} 題`:'先看看今天的目標',questionIds:selected.map(q=>q.id),sessionId:null,completedAt:null},
  ...((minutes===5&&!selected.length)||!newConceptIds.length?[]:[{id:'learn',kind:'learn',title:`理解 ${newConceptIds.length} 個新重點`,questionIds:[],sessionId:null,completedAt:null}]),
  ...(variants.length?[{id:'transfer',kind:'practice',title:`換個情境回想 ${variants.length} 題`,questionIds:variants.map(q=>q.id),sessionId:null,completedAt:null}]:[]),
  {id:'write',kind:'write',title:'寫一句自己的日文',questionIds:[],sessionId:null,completedAt:null}
 ];
 const reason=due.length>=10&&!allowNew?'到期項目較多，今天先鞏固，新的內容可以稍後再學。':weak.length?`「${weak[0].title}」還不穩，先用不同問法再想一次。`:selected.length?'先回想已到期的內容，再學一小步。':'從一小組重點開始，接著收起提示自己回想。';
 return validateDailyPlan({id,day,minutes,goal,unitId:unit.id,conceptIds:focusIds,newConceptIds,newCount:newConceptIds.length,dueTotal:due.length,remainingDue:Math.max(0,due.length-selected.length),reason,steps:steps.map(s=>({...s,startedAt:null})),createdAt:time,updatedAt:time});
}
export function weeklyReport(state,concepts,questions,time){
 const end=studyDay(time),start=new Date(Date.parse(end+'T00:00:00Z')-6*86400000).toISOString().slice(0,10);
 const lookup=conceptLookup(concepts,questions),previous=new Set(),dailyFirst=new Set(),recall={correct:0,total:0,rate:null};
 const ordered=state.attempts.slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));
 let firstAnswers=0;const studied=new Set();
 for(const a of ordered){const day=studyDay(a.time),conceptId=lookup.get(a.item);if(day>=start&&day<=end){studied.add(day);if(a.dimension!=='writing')firstAnswers++;}
  if(!conceptId||a.dimension==='writing')continue;const key=`${conceptId}:${a.dimension}`,daily=`${key}:${day}`;
  if(dailyFirst.has(daily))continue;
  if(day>=start&&day<=end&&previous.has(key)){recall.total++;if(a.correct&&!a.hinted)recall.correct++;}
  dailyFirst.add(daily);previous.add(key);
 }if(recall.total)recall.rate=Math.round(recall.correct/recall.total*100);
 const sessions=state.v3.sessions.filter(s=>studyDay(s.updatedAt)>=start&&studyDay(s.updatedAt)<=end);
 const corrections=sessions.flatMap(s=>Object.values(s.corrections)).filter(a=>studyDay(a.time)>=start&&studyDay(a.time)<=end);
 const weaknesses=conceptProgress(state,concepts,questions).filter(p=>p.weak).slice(0,3);
 return {start,end,studyDays:studied.size,firstAnswers,recall,corrections:{total:corrections.length,correct:corrections.filter(a=>a.correct).length},artifacts:state.artifacts.filter(a=>studyDay(a.time)>=start&&studyDay(a.time)<=end),recommendations:weaknesses};
}
