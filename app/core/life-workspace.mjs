import {topics} from '../content/catalog.mjs';
import {lifeMemoryUnits} from './life-memory.mjs';
import {lifeRecallKey,lifeDictationKey,lifeBlankKey} from './life-dictation-state.mjs';
import {lifeNoteKey} from './life-notes-state.mjs';

const hasText=value=>Boolean(value?.text.trim());
const newest=values=>values.filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a))[0];

// Search privately in memory; only metadata leaves this function. No exposure or writes.
export function lifeWorkspaceIndex(state,{query='',level='all',topic='all',kind='all',scope='all',page=1}={}){
 const search=String(query).trim().toLocaleLowerCase(),rows=[];
 for(const unit of lifeMemoryUnits){
  if(level!=='all'&&unit.level!==level||topic!=='all'&&unit.topic!==topic)continue;
  const common={unitId:unit.id,title:unit.title,level:unit.level,topic:unit.topic};
  const matches=text=>!search||(unit.title+' '+(topics.find(([id])=>id===unit.topic)?.[1]||'')+' '+text).toLocaleLowerCase().includes(search);
  for(const mode of ['recall','dictation']){
   if(kind!=='all'&&kind!==mode)continue;
   for(let slot=0;slot<3;slot++){
    const reference=unit.id+':'+slot,recall=mode==='recall',original=state.drafts[(recall?lifeRecallKey:lifeDictationKey)(reference)],retry=state.drafts[lifeBlankKey(reference,recall)];
    if(!original&&!retry||!matches((original?.text||'')+' '+(retry?.text||'')))continue;
    const written=hasText(original),retryWritten=hasText(retry);
    if(scope==='written'&&!written||scope==='retry'&&!retryWritten||scope==='note-drafts')continue;
    rows.push({...common,id:mode+':'+reference,kind:mode,reference,slot,route:'life-'+mode+'/'+reference,original:Boolean(original),retry:Boolean(retry),written,retryWritten,updatedAt:newest([original?.time,retry?.time])});
   }
  }
  if(kind!=='all'&&kind!=='notes'||scope==='written'||scope==='retry')continue;
  const saved=state.v3.lifeNotes?.[unit.id],draft=state.drafts[lifeNoteKey(unit.id)];
  if(!saved?.text&&!draft||scope==='note-drafts'&&!draft||!matches((saved?.text||'')+' '+(draft?.text||'')))continue;
  rows.push({...common,id:'notes:'+unit.id,kind:'notes',route:'life-notes/'+unit.id,saved:Boolean(saved?.text),draft:Boolean(draft),updatedAt:newest([saved?.updatedAt,draft?.time])});
 }
 rows.sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)||a.id.localeCompare(b.id));
 const pages=Math.max(1,Math.ceil(rows.length/10)),current=Math.min(pages,Math.max(1,Number.isInteger(page)?page:1));
 return {total:rows.length,pages,page:current,rows:rows.slice((current-1)*10,current*10)};
}
