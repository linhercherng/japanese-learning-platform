import {kana} from './kana.mjs';
import {memoryFor} from './kana-memory.mjs';
import {flipCards} from './kana-sixth.mjs';
const byGlyph=new Map(kana.map(k=>[k.glyph,k]));
export const bridgePairs=kana.filter(k=>k.script==='hira').map(hira=>({hira,kata:byGlyph.get([...hira.glyph].map(c=>String.fromCodePoint(c.codePointAt(0)+0x60)).join(''))}));
const partners=new Map(bridgePairs.flatMap(p=>[[p.hira.id,p.kata],[p.kata.id,p.hira]]));
export const bridgePartner=item=>partners.get(item)||null;
export const bridgeCards=flipCards;
export const bridgeQuestions=kana.map(source=>{
 const target=bridgePartner(source.id),others=kana.filter(k=>k.script===target.script&&memoryFor(k.id).group===memoryFor(target.id).group&&k.reading!==target.reading).slice(0,2);
 return {id:'kx:'+source.id,otherItem:source.id,reviewItem:target.id,kind:'choice',dimension:'recognition',level:'K',unitId:'K01',prompt:'「'+source.glyph+'」對應哪個'+(target.script==='hira'?'平':'片')+'假名？',options:[target.glyph,...others.map(k=>k.glyph)],correct:0,explanation:'平假名 '+(source.script==='hira'?source.glyph:target.glyph)+' 對應片假名 '+(source.script==='kata'?source.glyph:target.glyph)+'，輔助讀音 '+target.reading+'。這裡練字形連結；發音與書寫要另外練。'};
});
const questions=new Map(bridgeQuestions.map(q=>[q.id,q]));
export const bridgeQuestion=id=>questions.get(id)||null;
export const bridgeIds=item=>bridgeCards(item).map(k=>'kx:'+k.id);
export function validBridgeReference(item,ids){const expected=bridgeIds(item);return expected.length===3&&Array.isArray(ids)&&JSON.stringify(expected)===JSON.stringify(ids);}
export function bridgeCueItems(item){
 const text=bridgeCards(item).map(k=>{const p=bridgePartner(k.id);return k.glyph+p.glyph+k.reading+memoryFor(k.id).tip+memoryFor(p.id).tip;}).join('');
 return kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);
}
