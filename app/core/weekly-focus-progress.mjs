import {memoryEvidence} from './memory-evidence.mjs';
import {studyDay} from './v3-state.mjs';
import {focusTargetKey,focusEnd,validateWeeklyFocusPlans} from './weekly-focus-state.mjs';
const stamp=t=>Date.parse(t),remembered=r=>['retained','week'].includes(r?.status),rows=e=>e.tracks.flatMap(t=>t.items);
const original=(state,t,p)=>state.attempts.some(a=>a.item===t.item&&a.dimension===t.dimension&&stamp(a.time)===stamp(t.baselineAt)&&stamp(a.time)<=stamp(p.createdAt));
export function focusCandidates(focus,minutes){return focus.slice(0,minutes===5?1:3).flatMap(f=>f.items.slice(0,minutes===5?1:3).map(r=>({goal:f.goal,ability:f.ability,item:r.item,dimension:r.dimension,baselineAt:r.lastAt})));}
export const focusCandidateKey=targets=>JSON.stringify(targets.map(t=>[t.goal,t.ability,t.item,t.dimension,t.baselineAt]));
function latestPlan(state,time){return [...(state.v3.weeklyFocusPlans||[])].filter(p=>stamp(p.createdAt)<=stamp(time)).sort((a,b)=>stamp(b.createdAt)-stamp(a.createdAt))[0]||null;}
/** Current original needs drive priority even after a closed period; old success never overrides new failure. */
export function weeklyFocusPriority(state,time,evidence=memoryEvidence(state,time)){
 const p=latestPlan(state,time);if(!p)return [];const index=new Map(rows(evidence).map(r=>[focusTargetKey(r),r]));
 return p.targets.filter(t=>original(state,t,p)).map(t=>index.get(focusTargetKey(t))).filter(r=>r&&['review','uncertain','waiting'].includes(r.status)).map(r=>({...r}));
}
export function saveWeeklyFocus(state,focus,time){
 const plans=state.v3.weeklyFocusPlans||[];if(plans.some(p=>stamp(p.createdAt)>stamp(time)))throw Error('原重點時間在未來，請先確認裝置日期。');
 const existing=latestPlan(state,time);if(existing&&studyDay(time)<=existing.end)return state;
 if(plans.length>=260)throw Error('已保存260組七天重點，請先匯出備份再整理。');
 const targets=focusCandidates(focus,state.settings.dailyMinutes);if(!targets.length)return state;
 const start=studyDay(time),plan={id:'focus-'+start,createdAt:time,start,end:focusEnd(start),minutes:state.settings.dailyMinutes,targets};
 const index=new Map(rows(memoryEvidence(state,time)).map(r=>[focusTargetKey(r),r]));
 if(targets.some(t=>index.get(focusTargetKey(t))?.lastAt!==t.baselineAt))throw Error('原題重點已更新，請重新確認。');
 validateWeeklyFocusPlans([...plans,plan]);return {...state,v3:{...state.v3,weeklyFocusPlans:[...plans,plan]},revision:state.revision+1};
}
function progress(state,p,time,evidence){
 const cutoff=new Date(Math.min(stamp(time),Date.parse(p.end+'T16:00:00Z')-1)).toISOString(),baseline=new Map(rows(memoryEvidence(state,p.createdAt)).map(r=>[focusTargetKey(r),r])),current=new Map(rows(cutoff===time?evidence:memoryEvidence(state,cutoff)).map(r=>[focusTargetKey(r),r]));
 const counts={improved:0,maintained:0,review:0,confirm:0,waiting:0,unpracticed:0};
 const targets=p.targets.map(t=>{
  const key=focusTargetKey(t),before=baseline.get(key),r=current.get(key),valid=before&&before.lastAt===t.baselineAt&&original(state,t,p);
  const attempts=state.attempts.filter(a=>a.item===t.item&&a.dimension===t.dimension&&stamp(a.time)>stamp(p.createdAt)&&stamp(a.time)<=stamp(cutoff)),unique=attempts.filter(a=>attempts.filter(b=>stamp(a.time)===stamp(b.time)).length===1).sort((a,b)=>stamp(a.time)-stamp(b.time)),practiced=Boolean(valid&&unique.length),proof=practiced&&remembered(r)&&stamp(r.proof?.time)>stamp(p.createdAt);
  const status=!valid||!r||r.status==='uncertain'?'confirm':r.status==='review'?'review':proof?remembered(before)?'maintained':'improved':practiced?'waiting':'unpracticed';counts[status]++;
  return {...t,title:r?.title||before?.title||'原題紀錄待確認',abilityLabel:r?.abilityLabel||before?.abilityLabel||t.ability,route:r?.route||before?.route||'weekly',baselineStatus:before?.status||null,status,practiced,lastAt:unique.at(-1)?.time||null,proof:proof?{...r.proof}:null};
 });
 return {id:p.id,start:p.start,end:p.end,createdAt:p.createdAt,active:studyDay(time)<=p.end,total:targets.length,practiced:targets.filter(t=>t.practiced).length,counts,targets};
}
/** Historical seven-day outcomes are bounded; home uses current evidence, not these frozen cutoffs. */
export function weeklyFocusProgress(state,time,{evidence=memoryEvidence(state,time),limit=4}={}){
 const plans=state.v3.weeklyFocusPlans||[],visible=plans.filter(p=>stamp(p.createdAt)<=stamp(time)).sort((a,b)=>stamp(b.createdAt)-stamp(a.createdAt)),recent=visible.slice(0,limit).map(p=>progress(state,p,time,evidence));
 return {latest:recent[0]||null,recent,totalPlans:plans.length,future:plans.length-visible.length,priority:weeklyFocusPriority(state,time,evidence)};
}
