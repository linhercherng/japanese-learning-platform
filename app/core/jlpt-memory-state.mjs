import {jlptQuestionUnits,jlptUnitMeta,isJlptSource} from '../content/jlpt-memory-ids.mjs';
const day=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
const validTime=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)&&Number.isFinite(Date.parse(t));
const requireValue=(v,message='檢定課程記憶資料不正確，請保留備份。')=>{if(!v)throw Error(message);};
export function validateJlptHints(records){
 requireValue(records&&typeof records==='object'&&!Array.isArray(records));let count=0;
 for(const [id,dates] of Object.entries(records)){requireValue(jlptQuestionUnits.has(id)&&Array.isArray(dates)&&dates.length>0&&dates.every(validTime));count+=dates.length;requireValue(new Set(dates.map(day)).size===dates.length&&dates.every((t,i)=>!i||Date.parse(t)>Date.parse(dates[i-1])));}
 requireValue(count<=20000,'檢定參考紀錄已達上限，請先匯出備份。');return records;
}
export function mergeJlptHints(a={},b={}){
 const out={};for(const id of new Set([...Object.keys(a),...Object.keys(b)])){const days=new Map();for(const t of [...a[id]||[],...b[id]||[]]){const key=day(t);if(!days.has(key)||Date.parse(t)<Date.parse(days.get(key)))days.set(key,t);}out[id]=[...days.values()].sort((x,y)=>Date.parse(x)-Date.parse(y));}return validateJlptHints(out);
}
export function jlptCueSeen(records,id,start,end,windowDays=1){const cutoff=Math.min(Date.parse(day(start)),Date.parse(day(end))-(windowDays-1)*86400000);return Boolean(records?.[id]?.some(t=>Date.parse(t)<=Date.parse(end)&&Date.parse(day(t))>=cutoff));}
export function validateJlptExposure(sessions,records){for(const s of sessions)if(isJlptSource(s.source))for(const [id,a] of Object.entries(s.answers))requireValue(a.hinted||!jlptCueSeen(records,id,s.createdAt,a.time,s.source==='jlpt-week'?7:1),'檢定參考曝光與原首答衝突，請保留備份。');}
export function recordJlptExposure(state,ids,time){
 requireValue(validTime(time));const additions={};for(const id of new Set(ids)){requireValue(jlptQuestionUnits.has(id));additions[id]=[time];}if(!Object.keys(additions).length)return state;
 const records=mergeJlptHints(state.v3.jlptHints,additions);if(JSON.stringify(records)===JSON.stringify(state.v3.jlptHints))return state;validateJlptExposure(state.v3.sessions,records);const next=structuredClone(state);next.v3.jlptHints=records;next.revision++;return next;
}
export const jlptNoteKey=unit=>'text:JN-'+unit;
export function validateJlptNoteDraft(key,draft){if(!key.startsWith('text:JN-'))return;requireValue(jlptUnitMeta.has(key.slice(8))&&draft&&typeof draft.text==='string'&&draft.text.length<=160&&validTime(draft.time)&&Array.isArray(draft.points)&&draft.points.length===0,'檢定個人線索請限制在160字內，並保留原稿。');}
