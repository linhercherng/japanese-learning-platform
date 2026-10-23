// Controller for transient phrase recall and durable reference exposure.
import {unitById,unitQuestions} from './content/catalog.mjs';
import {lifeUnitIds} from './content/life-memory-ids.mjs';
import {createLifeCards,currentLifeCard,revealLifeCard,rateLifeCard,lifeCardSummary} from './core/life-cards.mjs';
import {pendingLife,startLifeMemory} from './core/life-memory.mjs';
import {recordLifeExposure} from './core/life-memory-state.mjs';
import {lifeCardsLocal,lifeCardsView} from './ui/life-cards.mjs';
export function createLifeCardsController({getContext,update,render,toast,now,id,play}){
 let busy=false,lastRoute=null,disposed=false;
 const route=()=>location.hash.slice(1).split('/');
 function onRoute(name,param){const key=name+'/'+(param||'');if(lastRoute===key)return;lastRoute=key;const ui=lifeCardsLocal(getContext().session);ui.unitId=name==='life-cards'?param:null;ui.round=null;ui.run++;}
 function current(d){const [name,unitId]=route(),ctx=getContext(),ui=lifeCardsLocal(ctx.session);if(disposed||name!=='life-cards'||!lifeUnitIds.has(unitId)||ui.unitId!==unitId||d.lifeCardsUnit!==unitId||d.lifeCardsRun!==String(ui.run))return null;return {ctx,ui,unitId};}
 const sameCard=(d,c)=>current(d)?.ui.round===c.ui.round&&d.lifeCardsCursor===String(c.ui.round?.cursor)&&!pendingLife(getContext().state);
 const focus=()=>document.querySelector('#life-card-heading')?.focus();
 const exposure=(unit,time)=>update(s=>pendingLife(s)?s:recordLifeExposure(s,unitQuestions(unitById.get(unit)).map(q=>q.id),time));
 async function action(d){
  const c=current(d);if(!c||busy)return;const {ui,unitId}=c,kind=d.lifeCardsAction;
  if(kind==='practice'){
   if(!ui.round||!lifeCardSummary(ui.round).done)return;
   busy=true;const origin=location.hash;let destination;
   try{await update(s=>{const next=startLifeMemory(s,{unitId,id:id(),time:now()});destination=pendingLife(next)?.id;return next;});if(destination&&current(d)&&location.hash===origin)location.hash='v3-practice/'+destination;}finally{busy=false;}return;
  }
  if(pendingLife(c.ctx.state))return;
  if(kind==='reset'){ui.round=null;ui.run++;render();return;}
  if(kind==='start'){if(ui.round)return;const round=createLifeCards(unitId,d.lifeCardsMode);if(!round)return;ui.round=round;ui.run++;render(false);focus();return;}
  if(!sameCard(d,c)||!currentLifeCard(ui.round))return;
  if(kind==='rate'){const next=rateLifeCard(ui.round,d.lifeCardsRating);if(next===ui.round)return;ui.round=next;render(false);focus();return;}
  if(kind==='reveal'&&ui.round.revealed){ui.round={...ui.round,revealed:false};render(false);focus();return;}
  if(!['reveal','audio'].includes(kind)||kind==='audio'&&(!['1','0.75'].includes(d.lifeCardsRate)||ui.round.mode!=='sound'&&!ui.round.revealed))return;
  busy=true;const original=ui.round,line=currentLifeCard(original);
  try{await exposure(unitId,now());if(current(d)?.ui.round!==original||!sameCard(d,c))return;
   if(kind==='audio')await play(line.jp,Number(d.lifeCardsRate));else{ui.round=revealLifeCard(original);render(false);focus();}
  }finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeCardsAction)return;const focused=document.activeElement===b;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected){b.disabled=false;if(focused&&document.activeElement===document.body)b.focus({preventScroll:true});}});}
 function afterRender(name,param){if(name!=='life-cards')return;const ui=lifeCardsLocal(getContext().session);if(ui.unitId===param&&ui.round?.revealed&&!pendingLife(getContext().state))exposure(param,now()).catch(error=>toast(error.message));}
 document.addEventListener('click',click);
 return {views:{'life-cards':unit=>lifeCardsView(getContext(),unit)},onRoute,afterRender,dispose(){disposed=true;document.removeEventListener('click',click);}};
}
