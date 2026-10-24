import {lifeQuestionUnits} from '../content/life-memory-ids.mjs';
import {jlptQuestionUnits,jlptUnitMeta} from '../content/jlpt-memory-ids.mjs';
const kinds=new Set(['hint','feedback','reference','answer','legacy']),stamp=t=>Date.parse(t),formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei'}),day=t=>formatter.format(new Date(t));
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v),validTime=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)&&Number.isFinite(stamp(t));
const requireValue=(v,message='生活與檢定提示歷史格式不正確。')=>{if(!v)throw Error(message);};
export const courseGoal=item=>lifeQuestionUnits.has(item)?'L':jlptUnitMeta.get(jlptQuestionUnits.get(item))?.level||null;
const key=e=>JSON.stringify([e.item,e.kind,e.ref,stamp(e.time)]),order=(a,b)=>stamp(a.time)-stamp(b.time)||key(a).localeCompare(key(b));
export function validateCourseHistory(history){
 requireValue(plain(history)&&Object.keys(history).length===2&&history.version===1&&Array.isArray(history.events)&&history.events.length<=60000);
 const seen=new Set();for(const e of history.events){requireValue(plain(e)&&Object.keys(e).length===4&&courseGoal(e.item)&&kinds.has(e.kind)&&validTime(e.time)&&typeof e.ref==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_.\/-]{0,239}$/.test(e.ref));const k=key(e);requireValue(!seen.has(k),'提示歷史含重複事件。');seen.add(k);}return history;
}
function known(v3){
 const events=[...(v3.courseHistory?.events||[])],seen=new Set(events.filter(e=>e.kind!=='answer').map(e=>e.item+':'+stamp(e.time)));
 for(const name of ['lifeHints','jlptHints'])for(const [item,times] of Object.entries(v3[name]||{}))for(const time of times)if(!seen.has(item+':'+stamp(time)))events.push({item,time,kind:'legacy',ref:'legacy'});
 return events;
}
function combine(events){const map=new Map();for(const e of events)map.set(key(e),{...e,time:new Date(e.time).toISOString()});requireValue(map.size<=60000,'提示歷史已達上限，未保存；請先匯出完整備份。');return validateCourseHistory({version:1,events:[...map.values()].sort(order)});}
export const appendCourseHistory=(state,events)=>combine([...known(state.v3),...events]);
export const mergeCourseHistory=(a,b)=>a.courseHistory||b.courseHistory?combine([...known(a),...known(b)]):undefined;
export const courseEvents=(state,item,time=new Date().toISOString())=>known(state.v3).filter(e=>(!item||e.item===item)&&stamp(e.time)<=stamp(time)).sort(order);
export function validateCourseCheckpoints(history,attempts){if(!history)return;const byId=new Map(attempts.map(a=>[a.id,a]));for(const e of history.events)if(e.kind==='answer'){const a=byId.get(e.ref);requireValue(a&&a.item===e.item&&stamp(a.time)===stamp(e.time),'提示歷史與原首答不一致，請保留原備份。');}}
export const courseCheckpointTimes=history=>new Set((history?.events||[]).filter(e=>e.kind==='answer').map(e=>e.item+':'+stamp(e.time)));
export function courseCueSeen(state,item,start,end,windowDays=1){const earliest=Math.min(Date.parse(day(start)),Date.parse(day(end))-(windowDays-1)*86400000);return courseEvents(state,item,end).some(e=>e.kind!=='answer'&&Date.parse(day(e.time))>=earliest);}
/** Build once per report, keeping private answer values out of the event index. */
export function courseIndex(state,time){const out=new Map();for(const e of courseEvents(state,null,time)){if(!out.has(e.item))out.set(e.item,{events:[],days:new Map(),checkpoints:new Map(),legacy:-Infinity});const row=out.get(e.item),t=stamp(e.time);row.events.push(e);if(e.kind==='answer')row.checkpoints.set(e.ref,t);else{const d=day(e.time);if(!row.days.has(d))row.days.set(d,t);if(e.kind==='legacy')row.legacy=Math.max(row.legacy,t);}}return out;}
export const courseAnswerHinted=(index,a)=>a.hinted||(index.get(a.item)?.days.get(day(a.time))??Infinity)<=stamp(a.time);
export const courseAnswerUnknown=(index,a)=>index.get(a.item)?.checkpoints.get(a.id)!==stamp(a.time)&&(index.get(a.item)?.legacy??-Infinity)>stamp(a.time);
export const courseLastCue=(index,item)=>Math.max(-Infinity,...(index.get(item)?.events||[]).filter(e=>e.kind!=='answer').map(e=>stamp(e.time)));
