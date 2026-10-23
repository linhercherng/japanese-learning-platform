import {kana} from './content/kana.mjs';
import {duelPairs,flipCueItems,validDuelReference} from './content/kana-sixth.mjs';
import {newFlip,advanceFlip,startDuel} from './core/kana-sixth.mjs';
import {setPocket,newPocketRound,advancePocket,startPocketListen,pendingPocketActivity} from './core/kana-pocket.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
import {flipView,duelView,flipLocal,pendingDuel,pocketView} from './ui/kana-sixth.mjs';
export function createKanaSixth({getContext,update,render,toast,now,id,cacheDraft}){
 let busy=false;
 async function action(d){
  const [name,param]=location.hash.slice(1).split('/'),ctx=getContext();
  if(name==='kana-pocket'){
   const r=ctx.session.kanaPocketRound;
   if(d.sixAction==='pocket-listen'){
    if(!pendingPocketActivity(ctx.state)&&r&&r.cursor<r.queue.length)return;
    const origin=location.hash,sessionId=id(),time=now();let destination;
    await update(s=>{const next=startPocketListen(s,{id:sessionId,time});destination=pendingPocketActivity(next)?.id;return next;});
    if(destination&&location.hash===origin)location.hash='v3-practice/'+destination;return;
   }
   if(pendingPocketActivity(ctx.state))return;
   if(d.sixAction==='pocket-start'){if(r&&r.cursor<r.queue.length)return;ctx.session.kanaPocketRound=newPocketRound(ctx.state,id());}
   else {if(!r||r.key!==d.pocketRound||r.cursor!==Number(d.sixIndex)||r.queue[r.cursor]!==d.sixItem)return;
    if(d.sixAction==='pocket-reveal')r.revealed=true;
    else if(['pocket-keep','pocket-remove'].includes(d.sixAction)&&r.revealed){const origin=location.hash,time=now();await update(s=>setPocket(s,d.sixItem,d.sixAction==='pocket-keep',time));if(location.hash!==origin||ctx.session.kanaPocketRound!==r)return;ctx.session.kanaPocketRound=advancePocket(r,{item:d.sixItem,index:Number(d.sixIndex)});}
    else return;
   }
  }else if(name==='kana-duel'){
   const pair=duelPairs.find(p=>p.id===param);if(!pair||pair.id!==d.sixPair)return;
   if(d.sixAction==='duel-start'){let destination;const sessionId=id(),time=now();await update(s=>{const next=startDuel(s,{pair:pair.id,id:sessionId,time});destination=pendingDuel(next,pair.id)?.id;return next;});location.hash='v3-practice/'+destination;return;}
   if(d.sixAction!=='duel-compare'||pendingDuel(ctx.state,pair.id))return;ctx.session.sixCompare=ctx.session.sixCompare===pair.id?null:pair.id;
  }else if(name==='kana-flip'){
   const item=param||'h-3042';if(!kana.some(k=>k.id===item))return;const r=flipLocal(ctx.session,item);
   if(d.sixAction==='flip-review'){if(r.cursor!==r.queue.length||!r.needs.includes(d.sixStart))return;ctx.session.kanaFlip=newFlip(d.sixStart);location.hash='kana-flip/'+d.sixStart;}
   else if(d.sixAction==='flip-reset')ctx.session.kanaFlip=newFlip(item);
   else {if(r.cursor!==Number(d.sixIndex)||r.queue[r.cursor]!==d.sixItem)return;
    if(d.sixAction==='flip-reveal')r.revealed=true;
    else if(['flip-next','flip-again'].includes(d.sixAction)){if(!r.revealed)return;if(d.sixAction==='flip-again'){const origin=location.hash,time=now();await update(s=>setPocket(s,d.sixItem,true,time));if(location.hash!==origin||ctx.session.kanaFlip!==r)return;}ctx.session.kanaFlip=advanceFlip(r,{item:d.sixItem,index:Number(d.sixIndex),again:d.sixAction==='flip-again'});}
    else return;
   }
  }else return;
  render(false);const focus=name==='kana-pocket'?(ctx.session.kanaPocketRound?.revealed?'#main [data-audio]':'[data-six-action="pocket-reveal"]'):name==='kana-duel'?'[data-six-action="duel-compare"]':ctx.session.kanaFlip.revealed?'#main [data-audio]':'[data-six-action="flip-reveal"]';(document.querySelector(focus)||document.querySelector('#main'))?.focus();
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.sixAction||busy)return;busy=true;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{busy=false;if(b.isConnected)b.disabled=false;});}
 function change(event){if(event.target.dataset.sixFamily!==undefined&&kana.some(k=>k.id===event.target.value))location.hash='kana-flip/'+event.target.value;}
 function afterRender(name,param){
  const ctx=getContext();let items=[];
  if(name==='kana-flip'){const r=flipLocal(ctx.session,param||'h-3042');items=r.cursor<r.queue.length?flipCueItems(r.queue[r.cursor],r.revealed):r.needs;}
  if(name==='kana-pocket'&&!pendingPocketActivity(ctx.state)){const r=ctx.session.kanaPocketRound;if(r&&r.cursor<r.queue.length)items=flipCueItems(r.queue[r.cursor],r.revealed);}
  if(name==='kana-duel'){const p=duelPairs.find(p=>p.id===param);if(p&&ctx.session.sixCompare===p.id&&!pendingDuel(ctx.state,p.id)){const text=p.left+p.right+p.difference+p.memoryTip;items=kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);}}
  if(!items.length)return;const time=now();update(s=>{const next=recordKanaExposure(s,items,time,{kind:'reference',ref:'kana-sixth'});for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-pocket':()=>pocketView(getContext(),now()),'kana-flip':item=>flipView(getContext(),item),'kana-duel':pair=>duelView(getContext(),pair)},afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-duel'&&(!validDuelReference(s.reference,s.questionIds)||s.queue.some(q=>!s.questionIds.includes(q.questionId))))throw Error('備份含不一致的二選一。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
