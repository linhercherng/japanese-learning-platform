import {memoryTarget} from './memory-evidence.mjs';
import {studyDay} from './v3-state.mjs';
const stamp=t=>Date.parse(t),validTime=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)&&Number.isFinite(stamp(t));
const requireValue=(ok,message='七天重點資料格式不正確。')=>{if(!ok)throw Error(message);};
const shape=(o,keys)=>requireValue(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k)));
export const focusTargetKey=t=>JSON.stringify([t.item,t.dimension]);
export const focusEnd=start=>new Date(Date.parse(start)+6*86400000).toISOString().slice(0,10);
const signature=p=>JSON.stringify([p.id,p.createdAt,p.start,p.end,p.minutes,p.targets.map(t=>[t.goal,t.ability,t.item,t.dimension,t.baselineAt])]);
/** Optional schema3 records: immutable identities, never answer or mastery copies. */
export function validateWeeklyFocusPlans(plans){
 requireValue(Array.isArray(plans)&&plans.length<=260&&new Set(plans.map(p=>p?.id)).size===plans.length);
 for(const p of plans){
  shape(p,['id','createdAt','start','end','minutes','targets']);requireValue(validTime(p.createdAt)&&p.start===studyDay(p.createdAt)&&p.id==='focus-'+p.start&&p.end===focusEnd(p.start)&&[5,15,30].includes(p.minutes));
  requireValue(Array.isArray(p.targets)&&p.targets.length>0&&p.targets.length<=(p.minutes===5?1:9)&&new Set(p.targets.map(focusTargetKey)).size===p.targets.length);
  const abilities=new Map();for(const t of p.targets){shape(t,['goal','ability','item','dimension','baselineAt']);const m=memoryTarget(t);requireValue(m&&m.goal===t.goal&&m.ability===t.ability&&validTime(t.baselineAt)&&stamp(t.baselineAt)<=stamp(p.createdAt));const key=t.goal+':'+t.ability;abilities.set(key,(abilities.get(key)||0)+1);}
  requireValue(abilities.size<=(p.minutes===5?1:3)&&[...abilities.values()].every(n=>n<=3));
 }
 const sorted=[...plans].sort((a,b)=>a.start.localeCompare(b.start));for(let i=1;i<sorted.length;i++)requireValue(sorted[i].start>sorted[i-1].end,'七天重點追蹤期間重疊，請保留原備份。');
 return plans;
}
export function mergeWeeklyFocusPlans(a=[],b=[]){
 validateWeeklyFocusPlans(a);validateWeeklyFocusPlans(b);const rows=new Map(a.map(p=>[p.id,structuredClone(p)]));
 for(const p of b){const old=rows.get(p.id);requireValue(!old||signature(old)===signature(p),'七天重點追蹤分支衝突，未匯入。');if(!old)rows.set(p.id,structuredClone(p));}
 return validateWeeklyFocusPlans([...rows.values()].sort((a,b)=>a.start.localeCompare(b.start)));
}
