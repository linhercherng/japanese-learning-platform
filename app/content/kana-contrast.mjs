import {kana} from './kana.mjs';
import {memoryFor} from './kana-memory.mjs';
export function contrastPair(reference){
 const ids=String(reference||'').split(':');if(ids.length!==2)return null;
 const pair=ids.map(id=>kana.find(k=>k.id===id));
 return pair.every(Boolean)&&pair[0].id!==pair[1].id&&pair[0].script===pair[1].script&&pair[0].reading!==pair[1].reading?pair:null;
}
export function contrastQuestion(id){
 const [prefix,target,other,...extra]=String(id).split(':'),pair=contrastPair(target+':'+other);
 if(prefix!=='kp'||extra.length||!pair)return null;const [a,b]=pair;
 return {id,reviewItem:a.id,otherItem:b.id,cueItems:[a.id,b.id],kind:'listen',dimension:'listening',level:'K',unitId:'K01',transcript:a.glyph,prompt:'先聽聲音，從這兩個字選一個。',options:[a.glyph,b.glyph],correct:0,explanation:a.glyph+' 的輔助讀音是 '+a.reading+'。'+memoryFor(a.id).tip+' '+b.glyph+' 的輔助讀音是 '+b.reading+'。'+memoryFor(b.id).tip};
}
export function contrastIds(reference){const pair=contrastPair(reference);return pair?['kp:'+pair[1].id+':'+pair[0].id,'kp:'+pair[0].id+':'+pair[1].id]:[];}
export function validContrastReference(reference,ids){const expected=contrastIds(reference);return expected.length===2&&Array.isArray(ids)&&JSON.stringify(expected)===JSON.stringify(ids);}
