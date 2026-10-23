import {startLifeWeek} from './core/life-retention.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {studyDay} from './core/v3-state.mjs';
import {lifeWeekView,lifeScheduleView} from './ui/life-retention.mjs';
export function createLifeRetention({getContext,update,render,toast,now,id}){
 let saving=false;
 async function action(d){
  if(d.lifeRetentionAction!=='week'||saving||location.hash.slice(1).split('/')[0]!=='life-week')return;
  saving=true;const origin=location.hash,time=now(),sessionId=id();let destination;
  try{
   await update(s=>{const next=startLifeWeek(s,{id:sessionId,time});destination=pendingLife(next)?.id||next.v3.sessions.find(s=>s.source==='life-week'&&s.reference===studyDay(time))?.id;return next;});
   if(location.hash===origin){if(destination)location.hash='v3-practice/'+destination;else{render(false);toast('目前沒有符合七日間隔的原題，看看複習預告再接續。');}}
  }finally{saving=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeRetentionAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 document.addEventListener('click',click);
 return {views:{'life-week':()=>lifeWeekView(getContext(),now()),'life-schedule':()=>lifeScheduleView(getContext(),now())},dispose(){document.removeEventListener('click',click);}};
}
