// Save the focused original round before changing routes.
import {lifeUnitIds} from './content/life-memory-ids.mjs';
import {lifeSkills,startLifeSkill} from './core/life-skills.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeSkillView} from './ui/life-skills.mjs';
export function createLifeSkills({getContext,update,render,toast,now,id}){
 let busy=false,lastRoute=null,epoch=0,disposed=false;
 function onRoute(name,param){const key=name+'/'+(param||'');if(key!==lastRoute){lastRoute=key;epoch++;}}
 async function action(d){
  const [name,unitId]=location.hash.slice(1).split('/');if(disposed||busy||d.lifeSkillAction!=='start'||name!=='life-skill'||unitId!==d.lifeSkillUnit||!lifeUnitIds.has(unitId)||!lifeSkills.some(([key])=>key===d.lifeSkill))return;
  busy=true;const origin=location.hash,ticket=epoch,time=now(),sessionId=id();let destination;
  try{await update(s=>{const next=startLifeSkill(s,{unitId,skill:d.lifeSkill,id:sessionId,time});destination=pendingLife(next)?.id;return next;});if(!disposed&&ticket===epoch&&location.hash===origin){if(destination)location.hash='v3-practice/'+destination;else{render(false);toast('目前沒有這種能力的原題，請選另一種練習。');}}}finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeSkillAction)return;const focused=document.activeElement===b;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected){b.disabled=false;if(focused&&document.activeElement===document.body)b.focus({preventScroll:true});}});}
 document.addEventListener('click',click);
 return {views:{'life-skill':unit=>lifeSkillView(getContext(),unit,now())},onRoute,dispose(){disposed=true;document.removeEventListener('click',click);}};
}
