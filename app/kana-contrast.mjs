import {contrastPair} from './content/kana-contrast.mjs';
import {startContrast,pendingContrast} from './core/kana-contrast.mjs';
import {pendingPocketListen} from './core/kana-pocket.mjs';
import {contrastView} from './ui/kana-contrast.mjs';
export function createKanaContrast({getContext,update,toast,now,id}){
 let saving=false;
 async function action(d){
  const [name,reference]=location.hash.slice(1).split('/');
  if(saving||name!=='kana-contrast'||reference!==d.contrastReference||d.contrastAction!=='start'||!contrastPair(reference))return;
  saving=true;const origin=location.hash,time=now(),sessionId=id();let destination;
  try{await update(s=>{const next=startContrast(s,{reference,id:sessionId,time});destination=(pendingContrast(next)||pendingPocketListen(next))?.id;return next;});if(destination&&location.hash===origin)location.hash='v3-practice/'+destination;}finally{saving=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.contrastAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 document.addEventListener('click',click);
 return {views:{'kana-contrast':ref=>contrastView(getContext(),ref)},dispose(){document.removeEventListener('click',click);}};
}
