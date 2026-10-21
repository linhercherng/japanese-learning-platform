import {rhythmCards,exposedRhythmItems,validRepairReference} from './content/kana-focus.mjs';
import {startKanaRepair,pendingRepair} from './core/kana-focus.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
import {pathView,repairView,rhythmView,beatState} from './ui/kana-focus.mjs';
export function createKanaFocus({getContext,update,render,toast,now,id,cacheDraft}){
 async function action(d){
  const [name,param]=location.hash.slice(1).split('/');
  if(d.focusAction==='repair-start'){
   if(!['kana-path','kana-repair'].includes(name))return;
   const sessionId=id(),time=now();let destination;
   await update(s=>{const next=startKanaRepair(s,{id:sessionId,time});destination=pendingRepair(next)?.id;return next;});
   if(destination)location.hash='v3-practice/'+destination;else toast('目前沒有已知弱項，先做少量三字練習就好。');return;
  }
  const card=rhythmCards.find(c=>c.id===(param||'tea'));if(name!=='kana-beats'||!card||card.id!==d.focusCard)return;
  const ui=beatState(getContext().session,card.id);
  if(d.focusAction==='tap'){if(ui.taps<12)ui.taps++;else toast('這組最多先數12拍；可以重新聽、重新數。');}
  else if(d.focusAction==='reveal')ui.revealed=!ui.revealed;
  else if(d.focusAction==='reset'){ui.taps=0;ui.revealed=false;}
  else return;
  render(false);document.querySelector('[data-focus-action="'+d.focusAction+'"]')?.focus();
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.focusAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){if(event.target.dataset.focusWord===undefined||!rhythmCards.some(c=>c.id===event.target.value))return;location.hash='kana-beats/'+event.target.value;}
 function afterRender(name,param){
  if(name!=='kana-beats')return;const card=rhythmCards.find(c=>c.id===(param||'tea'));if(!card||!beatState(getContext().session,card.id).revealed)return;
  update(s=>{const next=recordKanaExposure(s,exposedRhythmItems(card),now());for(const item of exposedRhythmItems(card)){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-path':()=>pathView(getContext(),now()),'kana-repair':()=>repairView(getContext(),now()),'kana-beats':param=>rhythmView(getContext(),param)},afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-repair'&&(!validRepairReference(s.reference,s.questionIds)||s.queue.some(q=>!s.questionIds.includes(q.questionId))))throw Error('備份含不一致的弱點三題。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
