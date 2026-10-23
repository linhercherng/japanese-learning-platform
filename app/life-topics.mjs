import {parseLifeTopicRoute,lifeTopicLevels} from './content/life-topics.mjs';
import {startLifeTopic} from './core/life-topics.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeTopicView} from './ui/life-topics.mjs';
export function createLifeTopics({getContext,update,toast,now,id}){
 let busy=false,disposed=false,lastRoute='',epoch=0;
 function onRoute(name,param){const key=name+'/'+(param||'');if(key!==lastRoute){lastRoute=key;epoch++;}}
 const current=()=>{const [name,param]=location.hash.slice(1).split('/');return name==='life-topic'?parseLifeTopicRoute(param):null;};
 async function action(d){const route=current();if(disposed||busy||!route?.topic||d.lifeTopicAction!=='start'||d.lifeTopicReference!==route.topic+':'+route.ceiling)return;busy=true;const origin=location.hash,ticket=epoch,time=now(),sessionId=id();let destination;
  try{await update(s=>{const next=startLifeTopic(s,{...route,id:sessionId,time});destination=pendingLife(next)?.id;return next;});if(!disposed&&ticket===epoch&&location.hash===origin){if(destination)location.hash='v3-practice/'+destination;else toast('目前沒有可回想的原題，請先練一課或調整程度上限。');}}finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeTopicAction)return;const focused=document.activeElement===b;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected){b.disabled=false;if(focused&&document.activeElement===document.body)b.focus?.({preventScroll:true});}});}
 function change(event){const field=event.target,route=current();if(disposed||!route||!field.dataset?.lifeTopicCeiling||!lifeTopicLevels.includes(field.value)||pendingLife(getContext().state))return;const key=route.topic?route.topic+':'+route.ceiling:route.ceiling;if(field.dataset.lifeTopicCeiling!==key)return;location.hash='life-topic/'+(route.topic?route.topic+':':'')+field.value;}
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'life-topic':param=>lifeTopicView(getContext(),param,now())},onRoute,dispose(){disposed=true;document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
