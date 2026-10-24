import {topics} from './content/catalog.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeRoundReview,startLifeRepair} from './core/life-progress.mjs';
import {recordLifeExposure} from './core/life-memory-state.mjs';
import {lifeMapView,lifeRoundView,lifeReviewLocal} from './ui/life-review.mjs';
export function createLifeReview({getContext,update,render,toast,now,id,play=async()=>{}}){
 let saving=false,lastRoute=null;
 const route=()=>location.hash.slice(1).split('/');
 function onRoute(name,param){const key=`${name}/${param||''}`;if(key===lastRoute)return;lastRoute=key;const ui=lifeReviewLocal(getContext().session);ui.revealed=false;if(name==='life-round'){ui.round=param;ui.index=0;}}
 function current(){const [name,sid]=route(),ctx=getContext();if(name!=='life-round'||pendingLife(ctx.state))return null;const r=lifeRoundReview(ctx.state,sid,now());if(!r)return null;const ui=lifeReviewLocal(ctx.session),entry=r.entries[ui.round===sid?ui.index:0];return entry?{sid,ui,entry}:null;}
 const expose=(qid,time)=>update(s=>recordLifeExposure(s,[qid],time,{kind:'reference',ref:'life:round:'+qid}));
 async function action(d){
  if(['reveal','audio'].includes(d.lifeReviewAction)){
   const c=current();if(!c||c.sid!==d.lifeReviewRound||c.entry.q.id!==d.lifeReviewQuestion)return;
   if(d.lifeReviewAction==='audio'){if(c.entry.q.kind!=='listen')return;const origin=location.hash;await expose(c.entry.q.id,now());if(location.hash===origin&&current()?.entry.q.id===c.entry.q.id)await play(c.entry.q.transcript,1);return;}
   const origin=location.hash;if(!c.ui.revealed){await expose(c.entry.q.id,now());if(location.hash!==origin||current()?.entry.q.id!==c.entry.q.id)return;}
   c.ui.revealed=!c.ui.revealed;render(false);document.querySelector(`[data-life-review-action="reveal"][data-life-review-round="${c.sid}"][data-life-review-question="${c.entry.q.id}"]`)?.focus({preventScroll:true});return;
  }
  const [name,param]=route();if(d.lifeReviewAction!=='repair'||saving||name!=='life-map'&&(name!=='life-round'||!lifeRoundReview(getContext().state,param,now())))return;
  saving=true;const origin=location.hash,time=now(),sessionId=id();let destination;
  try{await update(s=>{const next=startLifeRepair(s,{id:sessionId,time});destination=pendingLife(next)?.id;return next;});if(destination&&location.hash===origin)location.hash='v3-practice/'+destination;}finally{saving=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeReviewAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){
  const d=event.target.dataset,value=event.target.value,[name]=route();
  if(Object.hasOwn(d,'lifeReviewPicker')){const c=current();if(!c||d.lifeReviewPicker!==c.sid||!/^\d+$/.test(value)||!lifeRoundReview(getContext().state,c.sid,now()).entries[Number(value)])return;c.ui.index=Number(value);c.ui.revealed=false;render(false);document.querySelector('[data-life-review-picker]')?.focus();return;}
  if(name!=='life-map')return;const ui=lifeReviewLocal(getContext().session);let selector;
  if(Object.hasOwn(d,'lifeMapLevel')&&['L','N5','N4','N3','N2','all'].includes(value)){ui.level=value;selector='[data-life-map-level]';}
  if(Object.hasOwn(d,'lifeMapTopic')&&(value==='all'||topics.some(([id])=>id===value))){ui.topic=value;selector='[data-life-map-topic]';}
  if(Object.hasOwn(d,'lifeMapScope')&&['all','weak','practiced','new'].includes(value)){ui.scope=value;selector='[data-life-map-scope]';}
  if(selector){render(false);document.querySelector(selector)?.focus();}
 }
 function toggle(event){const el=event.target;if(!el.open||!el.dataset?.lifeReviewPassage)return;const c=current();if(c&&c.sid===el.dataset.lifeReviewPassage&&c.entry.q.id===el.dataset.lifeReviewQuestion&&c.entry.q.passage)expose(c.entry.q.id,now()).catch(error=>toast(error.message));}
 function afterRender(){}
 document.addEventListener('click',click);document.addEventListener('change',change);document.addEventListener('toggle',toggle,true);
 return {views:{'life-map':()=>lifeMapView(getContext(),now()),'life-round':sid=>lifeRoundView(getContext(),sid,now())},onRoute,afterRender,dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);document.removeEventListener('toggle',toggle,true);}};
}
