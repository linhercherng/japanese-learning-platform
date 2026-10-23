import {lifeUnitIds} from '../content/life-memory-ids.mjs';
export function parseLifeDictationRef(ref){if(typeof ref!=='string')return null;const [unitId,part,...extra]=ref.split(':'),slot=part===undefined?0:/^[0-2]$/.test(part)?Number(part):-1;return !extra.length&&lifeUnitIds.has(unitId)&&slot>=0?{unitId,slot,reference:unitId+':'+slot}:null;}
export const lifeDictationKey=ref=>'text:LD-'+ref;
export const lifeRecallKey=ref=>'text:LR-'+ref;
export function lifeBlankKey(ref,recall=false){if(typeof recall!=='boolean')throw new Error('再想稿模式不正確。');return 'text:LB-'+(recall?'R':'D')+'-'+ref;}
const requireValue=(ok,message='生活句子草稿格式不正確。')=>{if(!ok)throw new Error(message);};
export function validateLifeDictationDraft(key,d){if(!/^text:(?:L[DR]-|LB-)/.test(key))return;const blank=key.startsWith('text:LB-'),ref=blank?key.slice(10):key.slice(8),parsed=(!blank||/^text:LB-[RD]-/.test(key))&&parseLifeDictationRef(ref);requireValue(parsed&&parsed.reference===ref&&d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).every(k=>['text','points','time'].includes(k))&&typeof d.text==='string'&&d.text.length<=300&&Array.isArray(d.points)&&d.points.length===0&&typeof d.time==='string'&&/^\d{4}-\d\d-\d\dT/.test(d.time)&&Number.isFinite(Date.parse(d.time)));}
export function mergeLifeDictationDraft(a,b){requireValue(Date.parse(a.time)!==Date.parse(b.time)||a.text===b.text,'同時修改的生活句子草稿衝突，請保留原備份。');return structuredClone(Date.parse(b.time)>Date.parse(a.time)?b:a);}
