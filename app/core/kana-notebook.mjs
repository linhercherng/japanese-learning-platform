import {kana} from '../content/kana.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
import {noteKey} from './kana-lab.mjs';
const normalize=v=>String(v||'').normalize('NFKC').toLocaleLowerCase('ja');
export function notebookPage(state,raw={}){
 const filters={query:typeof raw.query==='string'?raw.query.slice(0,80):'',script:['hira','kata'].includes(raw.script)?raw.script:'all',group:['basic','voiced','semivoiced','contracted'].includes(raw.group)?raw.group:'all',scope:['pocket','drafts'].includes(raw.scope)?raw.scope:'all'};
 const query=normalize(filters.query.trim());
 const all=kana.flatMap(k=>{const saved=state.v3.kanaNotes?.[k.id],draft=state.drafts[noteKey(k.id)];if(!saved?.text&&!draft)return [];return [{id:k.id,glyph:k.glyph,reading:k.reading,script:k.script,group:memoryFor(k.id).group,text:draft?.text??saved.text,draft:Boolean(draft),pocket:Boolean(state.v3.kanaPocket?.[k.id]?.active),time:draft?.time||saved.updatedAt}];}).filter(k=>(filters.script==='all'||k.script===filters.script)&&(filters.group==='all'||k.group===filters.group)&&(filters.scope==='all'||filters.scope==='pocket'&&k.pocket||filters.scope==='drafts'&&k.draft)&&(!query||normalize(k.glyph+' '+k.reading+' '+k.text).includes(query)));
 all.sort((a,b)=>Date.parse(b.time)-Date.parse(a.time)||a.id.localeCompare(b.id));
 const pages=Math.max(1,Math.ceil(all.length/10)),page=Math.min(pages-1,Number.isSafeInteger(raw.page)&&raw.page>=0?raw.page:0);
 return {filters,entries:all.slice(page*10,page*10+10),total:all.length,page,pages};
}
export function notebookExposure(page){const text=page.entries.map(n=>n.glyph+n.text).join('');return kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);}
export function noteEditorExposure(state,item){const k=kana.find(k=>k.id===item);if(!k)return [];const text=k.glyph+memoryFor(item).tip+(state.drafts[noteKey(item)]?.text??state.v3.kanaNotes?.[item]?.text??'');return kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);}
