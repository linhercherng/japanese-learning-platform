import {kana} from './content/kana.mjs';
import {words} from './content/catalog.mjs';
import {buildExamples} from './content/kana-lab.mjs';
import {validRecallReference} from './content/kana-recall.mjs';
import {startWeekCheck} from './core/kana-recall.mjs';
import {beginV3Session} from './core/v3-learning.mjs';
import {studyDay} from './core/v3-state.mjs';
import {typingView,weekView,recallView} from './ui/kana-recall.mjs';
export function createKanaRecall({getContext,update,toast,now,id}){
 async function action(d){
  const sessionId=id(),time=now();let destination;
  if(d.recallAction==='week-start'){
   await update(s=>{const next=startWeekCheck(s,{id:sessionId,time}),sessions=next.v3.sessions.filter(p=>p.source==='kana-week');destination=(sessions.find(p=>!p.completedAt)||sessions.find(p=>p.reference===studyDay(time)))?.id;return next;});
   if(!destination){toast('目前沒有符合七日條件的項目，先做少量練習就好。');return;}
  }else if(d.recallAction==='type-start'){
   const item=d.recallItem;if(!kana.some(k=>k.id===item))throw Error('請先選有效字卡。');
   await update(s=>{const pending=s.v3.sessions.find(p=>p.source==='kana-type'&&p.reference===item&&!p.completedAt);if(pending){destination=pending.id;return s;}const ids=buildExamples(item,words).map(w=>'kt:'+item+':'+w.id),next=beginV3Session(s,ids,{id:sessionId,source:'kana-type',reference:item,time});destination=sessionId;return next;});
  }else return;
  location.hash='v3-practice/'+destination;
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.recallAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 document.addEventListener('click',click);
 return {views:{'kana-type':item=>typingView(getContext(),item),'kana-week':()=>weekView(getContext(),now()),'kana-recall':()=>recallView(getContext(),now())},validateCatalog(state){for(const s of state.v3.sessions)if(['kana-type','kana-week'].includes(s.source)&&(!validRecallReference(s.source,s.reference,s.questionIds,words)||s.queue.some(q=>!s.questionIds.includes(q.questionId))||s.source==='kana-week'&&s.reference!==studyDay(s.createdAt)))throw Error('備份含不一致的打字／七日回想。');},dispose(){document.removeEventListener('click',click);}};
}
