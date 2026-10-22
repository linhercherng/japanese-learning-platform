import {kana} from '../content/kana.mjs';
const ids=new Set(kana.map(k=>k.id)),plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const validTime=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
export function validatePocket(records){
 if(!plain(records)||Object.keys(records).length>ids.size)throw Error('不熟字口袋格式不正確。');
 for(const [id,r]of Object.entries(records))if(!ids.has(id)||!plain(r)||Object.keys(r).length!==2||typeof r.active!=='boolean'||!validTime(r.time))throw Error('不熟字口袋格式不正確。');
 return records;
}
export function mergePocket(a={},b={}){
 validatePocket(a);validatePocket(b);const out=structuredClone(a);
 for(const [id,r]of Object.entries(b)){const old=out[id];if(!old||r.time>old.time)out[id]=structuredClone(r);else if(r.time===old.time)out[id].active=old.active||r.active;}
 return validatePocket(out);
}
