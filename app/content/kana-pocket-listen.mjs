import {kana} from './kana.mjs';
const legal=new Set(kana.map(k=>k.id));
export function validPocketListenReference(reference,questionIds){
 const items=typeof reference==='string'?reference.split(':'):[];
 return items.length>=1&&items.length<=3&&items.every(id=>legal.has(id))&&new Set(items).size===items.length&&Array.isArray(questionIds)&&JSON.stringify(questionIds)===JSON.stringify(items.map(id=>'kc:check:'+id+':listen'));
}
