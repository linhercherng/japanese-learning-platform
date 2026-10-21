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
export function validateStudioDraft(key,draft){if(key.startsWith('write:KS-'))parseDictation(key,draft);}
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
