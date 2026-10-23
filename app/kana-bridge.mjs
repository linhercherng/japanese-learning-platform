import {kana} from './content/kana.mjs';import {bridgeCueItems,validBridgeReference} from './content/kana-bridge.mjs';
import {startBridge,pendingBridge} from './core/kana-bridge.mjs';import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
import {bridgeView} from './ui/kana-bridge.mjs';
export function createKanaBridge({getContext,update,render,toast,now,id,cacheDraft}){
 async function action(d){
  const [name,param]=location.hash.slice(1).split('/'),item=param||'h-3042',ctx=getContext();if(name!=='kana-bridge'||item!==d.bridgeItem||!kana.some(k=>k.id===item))return;
  if(d.bridgeAction==='start'){let destination;const origin=location.hash,sessionId=id(),time=now();await update(s=>{const next=startBridge(s,{item,id:sessionId,time});destination=pendingBridge(next,item)?.id;return next;});if(location.hash===origin)location.hash='v3-practice/'+destination;return;}
  if(d.bridgeAction!=='compare'||pendingBridge(ctx.state,item))return;ctx.session.bridgeCompare=ctx.session.bridgeCompare===item?null:item;render(false);document.querySelector('[data-bridge-action="compare"]')?.focus();
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.bridgeAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){if(event.target.dataset.bridgeFamily!==undefined&&location.hash.startsWith('#kana-bridge')&&kana.some(k=>k.id===event.target.value))location.hash='kana-bridge/'+event.target.value;}
 function afterRender(name,param){
  const ctx=getContext(),item=param||'h-3042';if(name!=='kana-bridge'||ctx.session.bridgeCompare!==item||pendingBridge(ctx.state,item))return;const items=bridgeCueItems(item);if(!items.length)return;
  const time=now();update(s=>{const next=recordKanaExposure(s,items,time,{kind:'reference',ref:'kana-bridge'});for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-bridge':item=>bridgeView(getContext(),item)},afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-bridge'&&(!validBridgeReference(s.reference,s.questionIds)||s.queue.some(q=>!s.questionIds.includes(q.questionId))))throw Error('備份含不一致的平片互換。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
