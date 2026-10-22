import {kana} from './kana.mjs';import {memoryFor} from './kana-memory.mjs';
const glyphRows=['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','や ゆ よ','らりるれろ','わ   を'];
const byGlyph=new Map(kana.map(k=>[k.glyph,k]));
export const kanaRows=['hira','kata'].flatMap(script=>glyphRows.map((text,i)=>({id:(script==='hira'?'h':'k')+'-'+(i+1),script,number:i+1,cells:[...text].map(g=>g===' '?null:byGlyph.get(script==='hira'?g:String.fromCodePoint(g.codePointAt(0)+0x60)))})));
export const rowById=new Map(kanaRows.map(r=>[r.id,r]));
export const rowRounds=kanaRows.flatMap(r=>{const cells=r.cells.filter(Boolean);return [cells.slice(0,3),cells.slice(3)].filter(part=>part.length).map((part,i)=>({id:r.id+'-'+(i?'b':'a'),rowId:r.id,part:i?'b':'a',questionIds:[part[1],part[0],...part.slice(2)].map(k=>'kc:check:'+k.id+':listen')}));});
export const rowRoundById=new Map(rowRounds.map(r=>[r.id,r]));
export function validRowReference(reference,ids){const r=rowRoundById.get(reference);return Boolean(r&&Array.isArray(ids)&&JSON.stringify(ids)===JSON.stringify(r.questionIds));}
export function rowVisibleItems(rowId,item){const k=rowById.get(rowId)?.cells.find(k=>k?.id===item);if(!k)return [];const text=k.glyph+k.reading+k.word+k.wordReading+memoryFor(item).tip;return kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);}
export function nextRow(id){const row=rowById.get(id);return row?(row.script==='hira'?'h':'k')+'-'+(row.number%10+1):null;}
export function otherScriptRow(id){const row=rowById.get(id);return row?(row.script==='hira'?'k':'h')+'-'+row.number:null;}
