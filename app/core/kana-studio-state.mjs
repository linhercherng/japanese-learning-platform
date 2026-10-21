import {kana} from '../content/kana.mjs';
const ids=new Set(kana.map(k=>k.id)),plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const time=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&Number.isFinite(Date.parse(v));
const requireValue=(v,message='五十音練習資料不正確')=>{if(!v)throw new Error(message);};
export const dictationKey=item=>`write:KS-${item}`;
export function validateHintRecords(records){
 requireValue(plain(records)&&Object.keys(records).length<=208);
 for(const [item,r] of Object.entries(records))requireValue(ids.has(item)&&plain(r)&&Object.keys(r).length===3&&Number.isInteger(r.stage)&&r.stage>=0&&r.stage<=3&&time(r.updatedAt)&&(r.lastHintAt===null||time(r.lastHintAt)));
}
export function parseDictation(key,draft){
 const m=JSON.parse(draft.text);
 requireValue(plain(m)&&Object.keys(m).length===7&&m.version===1&&typeof m.id==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,59}$/.test(m.id)&&ids.has(m.item)&&key===dictationKey(m.item)&&['writing','locked'].includes(m.stage)&&typeof m.hinted==='boolean'&&time(m.createdAt)&&(m.lockedAt===null?m.stage==='writing':m.stage==='locked'&&time(m.lockedAt)));
 return m;
}
export function validateStudioDraft(key,draft){if(key.startsWith('write:KS-'))parseDictation(key,draft);if(key.startsWith('text:KN-'))requireValue(ids.has(key.slice(8))&&typeof draft.text==='string'&&draft.text.length<=160&&Array.isArray(draft.points)&&draft.points.length===0,'記憶線索草稿不正確');}
export function mergeHintRecords(a,b){
 const out=structuredClone(a||{});for(const [id,r] of Object.entries(b||{})){
  const old=out[id];if(!old){out[id]=structuredClone(r);continue;}
  const newest=r.updatedAt>old.updatedAt?r:old;
  out[id]={...newest,stage:r.updatedAt===old.updatedAt?Math.min(r.stage,old.stage):newest.stage,lastHintAt:[r.lastHintAt,old.lastHintAt].filter(Boolean).sort().at(-1)||null};
 }validateHintRecords(out);return out;
}
export function mergeDictationDraft(key,a,b){
 const x=parseDictation(key,a),y=parseDictation(key,b);requireValue(x.id===y.id&&x.createdAt===y.createdAt,'兩份備份有不同的默寫草稿，請先保存目前作品再合併。');
 if(x.stage==='locked'&&y.stage==='locked')requireValue(JSON.stringify(a.points)===JSON.stringify(b.points),'鎖定默寫原跡衝突，未匯入。');
 if(x.stage==='writing'&&y.stage==='writing'&&a.time===b.time)requireValue(JSON.stringify(a.points)===JSON.stringify(b.points),'同時修改的默寫草稿衝突，未匯入。');
 const chosen=x.stage==='locked'?a:y.stage==='locked'?b:b.time>a.time?b:a,meta=parseDictation(key,chosen);
 return {...structuredClone(chosen),text:JSON.stringify({...meta,hinted:x.hinted||y.hinted}),time:a.time>b.time?a.time:b.time};
}

export function reconcileDictationDrafts(state){
 for(const [key,draft] of Object.entries(state.drafts)){if(!key.startsWith('write:KS-'))continue;const meta=parseDictation(key,draft),answer=state.attempts.find(a=>a.id==='ksw-'+meta.id);if(!answer)continue;
  requireValue(answer.item===meta.item&&answer.dimension==='writing'&&answer.hinted===meta.hinted,'默寫首答與提示紀錄衝突，未匯入。');
  const artifact=state.artifacts.find(a=>a.id==='ks-'+meta.id);requireValue(artifact&&artifact.item===meta.item&&JSON.stringify(artifact.points)===JSON.stringify(draft.points),'默寫原跡與作品衝突，未匯入。');delete state.drafts[key];
 }return state;
}

export function validateKanaNotes(notes){
 requireValue(plain(notes)&&Object.keys(notes).length<=208,'記憶線索格式不正確');
 for(const [item,n] of Object.entries(notes))requireValue(ids.has(item)&&plain(n)&&Object.keys(n).length===2&&typeof n.text==='string'&&n.text.length<=160&&time(n.updatedAt),'記憶線索格式不正確');
}
export function mergeKanaNotes(a={},b={}){
 const out=structuredClone(a);for(const [item,n] of Object.entries(b)){const old=out[item];if(!old){out[item]=structuredClone(n);continue;}const x=Date.parse(old.updatedAt),y=Date.parse(n.updatedAt);requireValue(x!==y||old.text===n.text,'同時修改的記憶線索衝突，未匯入。');if(y>x)out[item]=structuredClone(n);}
 validateKanaNotes(out);return out;
}
export function mergeNoteDraft(a,b){requireValue(Date.parse(a.time)!==Date.parse(b.time)||a.text===b.text,'同時修改的記憶線索草稿衝突，未匯入。');return structuredClone(Date.parse(b.time)>Date.parse(a.time)?b:a);}

export function reconcileNoteDrafts(state){for(const [key,draft] of Object.entries(state.drafts)){if(!key.startsWith('text:KN-'))continue;const note=state.v3.kanaNotes?.[key.slice(8)];if(!note)continue;const x=Date.parse(note.updatedAt),y=Date.parse(draft.time);requireValue(x!==y||note.text===draft.text.trim(),'記憶線索與同時草稿衝突，未匯入。');if(x>=y)delete state.drafts[key];}return state;}
