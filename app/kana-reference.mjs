import {visibleKanaReference} from './core/kana-reference.mjs';
import {recordKanaExposure} from './core/kana-studio.mjs';
export function createKanaReference({getContext,update,now,toast,getRoute=()=>location.hash.slice(1).split('/')[0]}){
 const prepare=(items,ref)=>items.length?update(s=>recordKanaExposure(s,items,now(),{kind:'reference',ref})):Promise.resolve();
 const afterRender=name=>prepare(visibleKanaReference(name,document.querySelector('main')?.innerText||''),'page:'+name).catch(error=>toast(error.message));
 async function toggle(event){const target=event.target;if(target?.tagName!=='DETAILS'||!target.open)return;const name=getRoute();await prepare(visibleKanaReference(name,target.innerText),'details:'+name).catch(error=>toast(error.message));}
 document.addEventListener('toggle',toggle,true);
 return {prepare,afterRender,dispose(){document.removeEventListener('toggle',toggle,true);}};
}
