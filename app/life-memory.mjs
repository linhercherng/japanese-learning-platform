import {unitById,unitQuestions,topics} from './content/catalog.mjs';
import {lifeUnitIds,lifeQuestionUnits} from './content/life-memory-ids.mjs';
import {pendingLife,startLifeMemory,startLifeCheck,validateLifeCatalog,memoryPhrases} from './core/life-memory.mjs';
import {recordLifeExposure} from './core/life-memory-state.mjs';
import {lifeMemoryView,lifeCheckView,lifeMemoryLocal} from './ui/life-memory.mjs';
export function createLifeMemory({getContext,update,render,toast,now,id}){
 let saving=false;
 const route=()=>location.hash.slice(1).split('/');
 const expose=(qids,time)=>update(s=>recordLifeExposure(s,qids,time)).catch(error=>toast(error.message));
 const exposeUnit=(unit,time)=>expose(unitQuestions(unitById.get(unit)).map(q=>q.id),time);
 function currentCard(d){const [name,unit]=route();return name==='life-memory'&&unit===d.lifeUnit&&lifeUnitIds.has(unit)&&!pendingLife(getContext().state)&&/^\d+$/.test(d.lifeCard||'')&&memoryPhrases(unit)[Number(d.lifeCard)]?{unit,index:Number(d.lifeCard)}:null;}
 async function action(d){
  if(['audio','reveal'].includes(d.lifeAction)){
   const card=currentCard(d);if(!card)return;
   if(d.lifeAction==='audio'){await exposeUnit(card.unit,now());return;}
   const ui=lifeMemoryLocal(getContext().session);if(ui.unit!==card.unit){ui.unit=card.unit;ui.revealed=[];}
   ui.revealed=ui.revealed.includes(card.index)?ui.revealed.filter(i=>i!==card.index):[...ui.revealed,card.index];render(false);
   document.querySelector(`[data-life-action="reveal"][data-life-unit="${card.unit}"][data-life-card="${card.index}"]`)?.focus({preventScroll:true});return;
  }
  const [name,unit]=route();if(saving||d.lifeAction==='start'&&(name!=='life-memory'||unit!==d.lifeUnit||!lifeUnitIds.has(unit))||d.lifeAction==='check'&&name!=='life-check'||!['start','check'].includes(d.lifeAction))return;
  saving=true;const origin=location.hash,time=now(),sessionId=id();let destination;
  try{
   await update(s=>{const next=d.lifeAction==='start'?startLifeMemory(s,{unitId:unit,id:sessionId,time}):startLifeCheck(s,{id:sessionId,time});destination=pendingLife(next)?.id||next.v3.sessions.find(p=>p.source==='life-check'&&p.reference===new Date(time).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'}))?.id;return next;});
   if(destination&&location.hash===origin){lifeMemoryLocal(getContext().session).revealed=[];location.hash='v3-practice/'+destination;}
  }finally{saving=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){const [name,param]=route(),d=event.target.dataset,value=event.target.value;if(name!=='life-memory'||param)return;const ui=lifeMemoryLocal(getContext().session);let selector;
  if(Object.hasOwn(d,'lifeLevel')&&['L','N5','N4','N3','N2','all'].includes(value)){ui.level=value;selector='[data-life-level]';}
  if(Object.hasOwn(d,'lifeTopic')&&(value==='all'||topics.some(([id])=>id===value))){ui.topic=value;selector='[data-life-topic]';}
  if(selector){render(false);document.querySelector(selector)?.focus();}
 }
 function toggle(event){const el=event.target,[name,unit]=route();if(el.open&&['study','lesson'].includes(name)&&el.dataset?.lifeReference===unit&&lifeUnitIds.has(unit))exposeUnit(unit,now());}
 function afterRender(name,param){
  const ctx=getContext(),time=now();
  if(name==='life-memory'&&lifeUnitIds.has(param)&&!pendingLife(ctx.state)){const ui=lifeMemoryLocal(ctx.session);if(ui.unit===param&&ui.revealed?.length)exposeUnit(param,time);}
  if(['study','lesson'].includes(name)&&lifeUnitIds.has(param)){const tab=ctx.session.studyTab||'learn';if(['words','read'].includes(tab)||tab==='learn'&&unitById.get(param).grammar.length)exposeUnit(param,time);}
  let qid,answer,hints=[];
  if(name==='v3-practice'){const s=ctx.state.v3.sessions.find(s=>s.id===param);if(s&&!s.completedAt){const entry=s.queue[s.cursor];qid=entry?.questionId;answer=entry?.repeat?s.corrections[s.cursor]:s.answers[qid];hints=s.hints;}}
  if(name==='practice'){const p=ctx.state.practice;if(p&&p.index<p.questionIds.length){qid=p.questionIds[p.index];answer=p.answers[qid];hints=p.hints||[];}}
  if(lifeQuestionUnits.has(qid)&&(answer||hints.includes(qid)))expose([qid],answer?new Date(Math.max(Date.parse(time),Date.parse(answer.time)+1)).toISOString():time);
 }
 document.addEventListener('click',click);document.addEventListener('change',change);document.addEventListener('toggle',toggle,true);
 return {views:{'life-memory':unit=>lifeMemoryView(getContext(),unit,now()),'life-check':()=>lifeCheckView(getContext(),now())},afterRender,validateCatalog:validateLifeCatalog,dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);document.removeEventListener('toggle',toggle,true);}};
}
