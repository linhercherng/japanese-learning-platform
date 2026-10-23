import {appendKanaHistory} from './kana-history-state.mjs';
import {kana} from '../content/kana.mjs';
import {validateState,recordAnswer,saveArtifact} from './learning.mjs';
import {studyDay} from './v3-state.mjs';
import {dictationKey,parseDictation} from './kana-studio-state.mjs';
export {dictationKey} from './kana-studio-state.mjs';
const requireValue=(v,message)=>{if(!v)throw new Error(message);};
const validItem=item=>requireValue(kana.some(k=>k.id===item),'請選擇有效的五十音字卡。');
const changed=state=>{state.revision++;return validateState(state);};
export function readDictation(state,item){const key=dictationKey(item),draft=state.drafts[key];return draft?{key,meta:parseDictation(key,draft),points:draft.points}:null;}
function store(state,item,meta,points,time){state.drafts[dictationKey(item)]={text:JSON.stringify(meta),points:structuredClone(points),time};return changed(state);}
function markWeekHints(state,item,time){
 for(const session of state.v3.sessions)if(session.source==='kana-week'&&!session.completedAt&&Date.parse(time)>=Date.parse(session.createdAt))for(const qid of session.questionIds)if(qid.startsWith('kc:check:'+item+':')&&!session.answers[qid]&&!session.hints.includes(qid)){session.hints.push(qid);session.updatedAt=time;}
}
export function setHintStage(state,item,stage,time,exposed=stage<3){
 validItem(item);requireValue(Number.isInteger(stage)&&stage>=0&&stage<=3,'提示階段不正確。');const next=structuredClone(state),old=next.v3.kanaHints?.[item];
 if(exposed)next.v3.kanaHistory=appendKanaHistory(next,[{item,time,kind:'hint',ref:'stage'}]);
 next.v3.kanaHints??={};next.v3.kanaHints[item]={stage,updatedAt:time,lastHintAt:[old?.lastHintAt,exposed?time:null].filter(Boolean).sort((a,b)=>Date.parse(a)-Date.parse(b)).at(-1)||null};
 const active=readDictation(next,item);if(exposed&&active?.meta.stage==='writing'){next.drafts[active.key].text=JSON.stringify({...active.meta,hinted:true});next.drafts[active.key].time=time;}
 if(exposed)markWeekHints(next,item,time);
 return changed(next);
}
export function recordKanaExposure(state,items,time,{kind='reference',ref='reference'}={}){
 const ids=[...new Set(items)];if(!ids.length)return state;ids.forEach(validItem);const next=structuredClone(state);next.v3.kanaHistory=appendKanaHistory(next,ids.map(item=>({item,time,kind,ref})));next.v3.kanaHints??={};
 for(const item of ids){markWeekHints(next,item,time);const old=next.v3.kanaHints[item];next.v3.kanaHints[item]={stage:old?.stage??0,updatedAt:time,lastHintAt:old?.lastHintAt&&Date.parse(old.lastHintAt)>Date.parse(time)?old.lastHintAt:time};const active=readDictation(next,item);if(active?.meta.stage==='writing'){next.drafts[active.key].text=JSON.stringify({...active.meta,hinted:true});next.drafts[active.key].time=time;}}
 return changed(next);
}
export function startDictation(state,{item,id,time}){
 validItem(item);const active=readDictation(state,item);
 if(active&&!state.attempts.some(a=>a.id===`ksw-${active.meta.id}`))return state;
 const next=structuredClone(state),lastHint=next.v3.kanaHints?.[item]?.lastHintAt;
 const hinted=Boolean(lastHint&&Date.parse(lastHint)<=Date.parse(time)&&studyDay(lastHint)===studyDay(time));
 return store(next,item,{version:1,id,item,stage:'writing',hinted,createdAt:time,lockedAt:null},[],time);
}
export function updateDictationPoints(state,item,points,time){
 const active=readDictation(state,item);if(!active||active.meta.stage!=='writing')return state;
 return store(structuredClone(state),item,active.meta,points,time);
}
export function revealDictationHint(state,item,time){
 const active=readDictation(state,item);requireValue(active?.meta.stage==='writing','本輪已鎖定，請使用對照區。');
 return store(recordKanaExposure(state,[item],time),item,{...active.meta,hinted:true},active.points,time);
}
export function lockDictation(state,item,time){
 const active=readDictation(state,item);requireValue(active,'請先開始這輪默寫。');if(active.meta.stage==='locked')return state;
 requireValue(active.points.some(stroke=>stroke.length),'先寫下一點字跡，再鎖定這次原稿。');
 return store(structuredClone(state),item,{...active.meta,stage:'locked',lockedAt:time},active.points,time);
}
export function finishDictation(state,{item,taskId,shape,order,confirmed,time}){
 if(state.attempts.some(a=>a.id===`ksw-${taskId}`))return state;
 const active=readDictation(state,item);requireValue(active?.meta.id===taskId&&active.meta.stage==='locked','先鎖定本輪原字跡，再對照自評。');
 requireValue(confirmed===true&&typeof shape==='boolean'&&typeof order==='boolean','請先對照範字，確認完成自查。');
 let next=saveArtifact(state,{id:`ks-${taskId}`,item,kind:'handwriting',points:active.points,text:`聽音默寫自評：字形${shape?'符合':'需再對照'}、筆順${order?'符合':'需再對照'}；${active.meta.hinted?'本輪或同日使用過記憶提示':'本輪未顯示提示'}。非自動辨識。`,time});
 next=recordAnswer(next,{id:`ksw-${taskId}`,item,dimension:'writing',correct:shape&&order,hinted:active.meta.hinted,time});delete next.drafts[active.key];return changed(next);
}
