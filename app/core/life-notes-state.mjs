// Raw IDs keep backup validation independent of the rendered lesson catalog.
import {lifeUnitIds} from '../content/life-memory-ids.mjs';
const requireValue=(ok,message='生活線索格式不正確。')=>{if(!ok)throw new Error(message);};
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const time=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT/.test(x)&&Number.isFinite(Date.parse(x));
export const lifeNoteKey=id=>'text:LN-'+id;
export function validateLifeNotes(notes){requireValue(plain(notes)&&Object.keys(notes).length<=lifeUnitIds.size);for(const [id,n] of Object.entries(notes))requireValue(lifeUnitIds.has(id)&&plain(n)&&Object.keys(n).length===2&&typeof n.text==='string'&&n.text.length<=160&&time(n.updatedAt));return notes;}
export function validateLifeNoteDraft(key,d){if(!key.startsWith('text:LN-'))return;requireValue(lifeUnitIds.has(key.slice(8))&&plain(d)&&Object.keys(d).every(k=>['text','time','points'].includes(k))&&typeof d.text==='string'&&d.text.length<=160&&time(d.time)&&Array.isArray(d.points)&&d.points.length===0);}
export function mergeLifeNotes(a={},b={}){const next=structuredClone(a);for(const [id,n] of Object.entries(b)){const old=next[id];if(old)requireValue(Date.parse(old.updatedAt)!==Date.parse(n.updatedAt)||old.text===n.text,'同時修改的生活線索衝突，請保留原備份。');if(!old||Date.parse(n.updatedAt)>Date.parse(old.updatedAt))next[id]=structuredClone(n);}return validateLifeNotes(next);}
export function mergeLifeNoteDraft(a,b){requireValue(Date.parse(a.time)!==Date.parse(b.time)||a.text===b.text,'同時修改的生活草稿衝突，請保留原備份。');return structuredClone(Date.parse(b.time)>Date.parse(a.time)?b:a);}
export function reconcileLifeNoteDrafts(state){for(const [key,d] of Object.entries(state.drafts)){if(!key.startsWith('text:LN-'))continue;const n=state.v3.lifeNotes?.[key.slice(8)];if(!n)continue;const x=Date.parse(n.updatedAt),y=Date.parse(d.time);requireValue(x!==y||n.text===d.text.trim(),'生活線索與同時草稿衝突，請保留原備份。');if(x>=y)delete state.drafts[key];}return state;}
