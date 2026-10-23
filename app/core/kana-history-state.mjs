import {kana} from '../content/kana.mjs';
const ids=new Set(kana.map(k=>k.id)),kinds=new Set(['hint','feedback','reference','answer','legacy']);
const stamp=t=>Date.parse(t),day=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v),validTime=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)&&Number.isFinite(stamp(t));
const requireValue=(v,message='五十音提示歷史格式不正確。')=>{if(!v)throw Error(message);};
const key=e=>JSON.stringify([e.item,e.kind,e.ref,stamp(e.time)]);
const order=(a,b)=>stamp(a.time)-stamp(b.time)||key(a).localeCompare(key(b));
export const isKanaItem=item=>ids.has(item);
export function validateKanaHistory(history){
 requireValue(plain(history)&&Object.keys(history).length===2&&history.version===1&&Array.isArray(history.events)&&history.events.length<=60000);
 const seen=new Set();for(const e of history.events){requireValue(plain(e)&&Object.keys(e).length===4&&ids.has(e.item)&&kinds.has(e.kind)&&validTime(e.time)&&typeof e.ref==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_.\/-]{0,239}$/.test(e.ref));const k=key(e);requireValue(!seen.has(k),'五十音提示歷史含重複事件。');seen.add(k);}return history;
}
function known(v3){
 const events=[...(v3.kanaHistory?.events||[])],seen=new Set(events.filter(e=>e.kind!=='answer').map(e=>e.item+':'+stamp(e.time)));
 for(const [item,r] of Object.entries(v3.kanaHints||{}))if(r.lastHintAt&&!seen.has(item+':'+stamp(r.lastHintAt)))events.push({item,time:r.lastHintAt,kind:'legacy',ref:'legacy'});
 return events;
}
function combine(events){const entries=new Map();for(const e of events)entries.set(key(e),{...e,time:new Date(e.time).toISOString()});const out={version:1,events:[...entries.values()].sort(order)};requireValue(out.events.length<=60000,'提示歷史已達上限，未保存；請先匯出完整備份。');return validateKanaHistory(out);}
/** Return an immutable sidecar. Existing attempts and legacy hint records are untouched. */
export function appendKanaHistory(state,events){return combine([...known(state.v3),...events]);}
export function mergeKanaHistory(a,b){return a.kanaHistory||b.kanaHistory?combine([...known(a),...known(b)]):undefined;}
export function kanaEvents(state,item,time=new Date().toISOString()){return known(state.v3).filter(e=>(!item||e.item===item)&&stamp(e.time)<=stamp(time)).sort(order);}
export function hasKanaCheckpoint(state,a){return Boolean(state.v3.kanaHistory?.events.some(e=>e.kind==='answer'&&e.ref===a.id&&e.item===a.item&&stamp(e.time)===stamp(a.time)));}
export function validateKanaCheckpoints(history,attempts){
 if(!history)return;const byId=new Map(attempts.map(a=>[a.id,a]));
 for(const e of history.events)if(e.kind==='answer'){const a=byId.get(e.ref);requireValue(a&&a.item===e.item&&stamp(a.time)===stamp(e.time),'提示歷史與原首答不一致，請保留原備份。');}
}
export function kanaCueSeen(state,items,start,end,windowDays=1){
 const earliest=Math.min(Date.parse(day(start)),Date.parse(day(end))-(windowDays-1)*86400000),wanted=new Set(items);
 return kanaEvents(state,null,end).some(e=>e.kind!=='answer'&&wanted.has(e.item)&&Date.parse(day(e.time))>=earliest);
}

export function legacyKanaUnknown(state,a,time,events=kanaEvents(state,a.item,time)){return !hasKanaCheckpoint(state,a)&&events.some(e=>e.item===a.item&&e.kind==='legacy'&&stamp(e.time)>stamp(a.time)&&stamp(e.time)<=stamp(time));}
