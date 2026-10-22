import {familyById,familyVisibleItems,validFamilyReference} from './content/kana-family.mjs';import {startFamily,pendingFamily} from './core/kana-family.mjs';
import {familyView,familyLocal} from './ui/kana-family.mjs';import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
export function createKanaFamily({getContext,update,render,toast,now,id,cacheDraft}){
 async function action(d){
  const [name,param]=location.hash.slice(1).split('/'),key=param||'h-306f',f=familyById.get(key),ctx=getContext();if(name!=='kana-family'||!f||key!==d.familyId)return;
  if(d.familyAction==='start'){let destination;const origin=location.hash,sessionId=id(),time=now();await update(s=>{const next=startFamily(s,{family:key,id:sessionId,time});destination=pendingFamily(next,key)?.id;return next;});if(location.hash===origin)location.hash='v3-practice/'+destination;return;}
  if(pendingFamily(ctx.state,key))return;const ui=familyLocal(ctx.session,key);
  if(d.familyAction==='compare')ui.revealed=!ui.revealed;
  else if(d.familyAction==='select'&&ui.revealed&&f.members.some(k=>k.id===d.familyTarget))ui.selected=d.familyTarget;
  else return;render(false);document.querySelector(d.familyAction==='select'?'[data-family-target="'+ui.selected+'"]':'[data-family-action="compare"]')?.focus();
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.familyAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){if(event.target.dataset.familyPicker!==undefined&&location.hash.startsWith('#kana-family')&&familyById.has(event.target.value))location.hash='kana-family/'+event.target.value;}
 function afterRender(name,param){const ctx=getContext(),key=param||'h-306f';if(name!=='kana-family'||!familyById.has(key)||pendingFamily(ctx.state,key))return;const ui=familyLocal(ctx.session,key);if(!ui.revealed)return;const items=familyVisibleItems(key,ui.selected),time=now();
  update(s=>{const next=recordKanaExposure(s,items,time);for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-family':key=>familyView(getContext(),key)},afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-family'&&(!validFamilyReference(s.reference,s.questionIds)||s.queue.some(q=>!s.questionIds.includes(q.questionId))))throw Error('備份含不一致的聲音家族。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
