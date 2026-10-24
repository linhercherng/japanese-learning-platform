import {rowById,rowRoundById,rowVisibleItems,validRowReference} from './content/kana-row.mjs';import {startRow,pendingRow} from './core/kana-row.mjs';import {rowView,rowLocal} from './ui/kana-row.mjs';import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
export function createKanaRow({getContext,update,render,toast,now,id,cacheDraft}){
 async function action(d){const [name,param]=location.hash.slice(1).split('/'),key=param||'h-2',row=rowById.get(key),ctx=getContext();if(name!=='kana-row'||!row||key!==d.rowId)return;
  if(d.rowAction==='start'){if(rowRoundById.get(d.rowRound)?.rowId!==key)return;let destination;const origin=location.hash,sessionId=id(),time=now();await update(s=>{const next=startRow(s,{round:d.rowRound,id:sessionId,time});destination=pendingRow(next,key)?.id;return next;});if(location.hash===origin)location.hash='v3-practice/'+destination;return;}
  if(pendingRow(ctx.state,key))return;const ui=rowLocal(ctx.session,key);
  if(d.rowAction==='select'&&row.cells.some(k=>k?.id===d.rowTarget)){ui.selected=d.rowTarget;ui.revealed=true;}
  else if(d.rowAction==='hide')ui.revealed=false;else return;
  render(false);document.querySelector('[data-row-target="'+ui.selected+'"]')?.focus();
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.rowAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){if(event.target.dataset.rowPicker!==undefined&&location.hash.startsWith('#kana-row')&&rowById.has(event.target.value))location.hash='kana-row/'+event.target.value;}
 function afterRender(name,param){const ctx=getContext(),key=param||'h-2';if(name!=='kana-row'||!rowById.has(key)||pendingRow(ctx.state,key))return;const ui=rowLocal(ctx.session,key);if(!ui.revealed)return;const items=rowVisibleItems(key,ui.selected),time=now();update(s=>{const next=recordKanaExposure(s,items,time,{kind:'reference',ref:'kana-row'});for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));}
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-row':key=>rowView(getContext(),key)},afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-row'&&(!validRowReference(s.reference,s.questionIds)||s.queue.some(q=>!s.questionIds.includes(q.questionId))))throw Error('備份含不一致的行段小輪。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
