import {appendCourseHistory,courseCueSeen,courseCheckpointTimes} from './course-history-state.mjs';
import {lifeQuestionUnits,isLifeSource} from '../content/life-memory-ids.mjs';
const day=time=>new Date(time).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
const validTime=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&Number.isFinite(Date.parse(v));
const requireValue=(v,message='生活參考紀錄不正確，請保留備份。')=>{if(!v)throw new Error(message);};
export function validateLifeHints(records){
 requireValue(records&&typeof records==='object'&&!Array.isArray(records));let total=0;
 for(const [qid,list] of Object.entries(records)){
  requireValue(lifeQuestionUnits.has(qid)&&Array.isArray(list)&&list.length>0&&list.every(validTime));total+=list.length;
  requireValue(new Set(list.map(day)).size===list.length&&list.every((t,i)=>!i||Date.parse(t)>Date.parse(list[i-1])));
 }requireValue(total<=20000,'生活參考紀錄已達上限，請先匯出備份。');return records;
}
export function mergeLifeHints(a={},b={}){
 const out={};for(const qid of new Set([...Object.keys(a),...Object.keys(b)])){
  const dates=new Map();for(const t of [...a[qid]||[],...b[qid]||[]]){const key=day(t),old=dates.get(key);if(!old||Date.parse(t)<Date.parse(old))dates.set(key,t);}
  out[qid]=[...dates.values()].sort((x,y)=>Date.parse(x)-Date.parse(y));
 }return validateLifeHints(out);
}
export function lifeCueSeen(hints,qid,start,end,windowDays=1){if(hints?.v3)return courseCueSeen(hints,qid,start,end,windowDays);const earliest=Math.min(Date.parse(day(start)),Date.parse(day(end))-(windowDays-1)*86400000);return Boolean(hints?.[qid]?.some(t=>Date.parse(t)<=Date.parse(end)&&Date.parse(day(t))>=earliest));}
export function validateLifeExposure(sessions,hints,history){
 const checkpoints=courseCheckpointTimes(history);
 for(const s of sessions)if(isLifeSource(s.source))for(const [qid,a] of Object.entries(s.answers))requireValue(checkpoints.has(qid+':'+Date.parse(a.time))||a.hinted||!lifeCueSeen(hints,qid,s.createdAt,a.time,s.source==='life-week'?7:1),'生活提示曝光與原首答衝突，未合併，請保留備份。');
}
export function recordLifeExposure(state,questionIds,time,{kind='reference',ref='life:reference'}={}){
 requireValue(validTime(time));const addition={};for(const qid of new Set(questionIds)){requireValue(lifeQuestionUnits.has(qid));addition[qid]=[time];}
 if(!Object.keys(addition).length)return state;
 const hints=mergeLifeHints(state.v3.lifeHints,addition);
 // Check before handing state to storage: a clock rollback must not create an
 // invalid unsaved snapshot that cannot be exported and imported again.
 validateLifeExposure(state.v3.sessions,addition);
 const next=structuredClone(state);next.v3.courseHistory=appendCourseHistory(state,Object.keys(addition).map(item=>({item,time,kind,ref})));next.v3.lifeHints=hints;next.revision++;return next;
}
