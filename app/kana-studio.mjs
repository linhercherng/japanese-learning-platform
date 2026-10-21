import {kana} from './content/kana.mjs';
import {words} from './content/catalog.mjs';
import {wordExamples,validWordReference} from './content/kana-words.mjs';
import {setHintStage,startDictation,updateDictationPoints,lockDictation,revealDictationHint,finishDictation,readDictation,dictationKey} from './core/kana-studio.mjs';
import {beginV3Session} from './core/v3-learning.mjs';
import {studioSelectView,kanaFadeView,kanaDictationView,kanaWordsView} from './ui/kana-studio.mjs';
import {attachWriting} from './ui/writing.mjs';
export function createKanaStudio({getState,getContext,update,render,toast,now,id,cacheDraft,attachPad=attachWriting}){
 let pad=null,attachedItem=null;
 const ctx=()=>getContext();
 function beforeRender(){pad?.dispose();pad=null;attachedItem=null;}
 function afterRender(name,item){
  if(name==='kana-fade'&&kana.some(k=>k.id===item)){
   const stage=ctx().state.v3.kanaHints?.[item]?.stage||0;if(stage<3)mutate(item,(s,time)=>setHintStage(s,item,stage,time),false).catch(error=>toast(error.message));return;
  }
  if(name!=='kana-dictation')return;const active=readDictation(ctx().state,item),canvas=document.querySelector('#studio-canvas');if(!canvas||active?.meta.stage!=='writing')return;
  attachedItem=item;pad=attachPad(canvas,active.points,points=>{
   const current=readDictation(ctx().state,item);if(!current||current.meta.id!==active.meta.id||current.meta.stage!=='writing')return;
   const time=now(),draft={text:JSON.stringify(current.meta),points,time};cacheDraft(current.key,draft);update(s=>updateDictationPoints(s,item,points,time)).catch(()=>{});
  });
 }
 async function mutate(item,fn,refresh=true){
  const snapshot=attachedItem===item?pad?.points():null,time=now(),hash=location.hash;let draft;
  let applied=false;try{
   await update(s=>{let next=snapshot?updateDictationPoints(s,item,snapshot,time):s;next=fn(next,time);draft=next.drafts[dictationKey(item)]||null;cacheDraft(dictationKey(item),draft);applied=true;return next;});
  }finally{if(applied&&refresh&&location.hash===hash)render(false);}
 }
 async function action(d){
  const item=d.studioItem;
  if(d.studioAction==='undo'){pad?.undo();return;}if(d.studioAction==='clear'){pad?.clear();return;}
  if(d.studioAction==='overlay'){ctx().session.studioOverlay=!ctx().session.studioOverlay;render(false);return;}
  if(d.studioAction==='hide-hint'){ctx().session.dictationHint=null;render(false);return;}
  if(!kana.some(k=>k.id===item))throw new Error('請先選擇有效的字卡。');
  if(d.studioAction==='stage'){await mutate(item,(s,time)=>setHintStage(s,item,Number(d.studioStage),time));return;}
  if(d.studioAction==='start'||d.studioAction==='open-dictation'){
   const taskId=id();ctx().session.dictationHint=null;
   await mutate(item,(s,time)=>{if(d.studioAction==='open-dictation'){const stage=s.v3.kanaHints?.[item]?.stage||0;if(stage<3)s=setHintStage(s,item,stage,time);}return startDictation(s,{item,id:taskId,time});},d.studioAction==='start');
   if(d.studioAction==='open-dictation')location.hash=`kana-dictation/${item}`;return;
  }
  if(d.studioAction==='hint'){await mutate(item,(s,time)=>{const next=revealDictationHint(s,item,time);ctx().session.dictationHint=readDictation(next,item).meta.id;return next;});return;}
  if(d.studioAction==='lock'){await mutate(item,(s,time)=>lockDictation(s,item,time));return;}
  if(d.studioAction==='save'){
   const shape=Boolean(document.querySelector('#studio-shape')?.checked),order=Boolean(document.querySelector('#studio-order')?.checked),confirmed=Boolean(document.querySelector('#studio-confirm')?.checked);
   await mutate(item,(s,time)=>finishDictation(s,{item,taskId:d.studioTask,shape,order,confirmed,time}),false);toast('原字跡與這次自評已保存。');location.hash='profile';return;
  }
  if(d.studioAction==='words-start'){
   const questions=wordExamples(item,words),questionIds=questions.map(w=>`kw:${item}:${w.id}`);if(!questionIds.length)throw new Error('這張字卡目前沒有自然生活詞，請先用字形與聲音練習。');
   const sessionId=id(),time=now();let destination;
   await update(s=>{const next=beginV3Session(s,questionIds,{id:sessionId,source:'kana-words',reference:item,time});destination=next.v3.sessions.find(p=>p.source==='kana-words'&&p.reference===item&&!p.completedAt&&JSON.stringify(p.questionIds)===JSON.stringify(questionIds)).id;return next;});location.hash=`v3-practice/${destination}`;
  }
 }
 function click(event){const button=event.target.closest('button');if(!button?.dataset.studioAction)return;const d={...button.dataset};button.disabled=true;action(d).catch(error=>toast(error.message)).finally(()=>{if(button.isConnected)button.disabled=false;});}
 function change(event){if(event.target.dataset.studioSelect===undefined)return;const value=event.target.value;if(kana.some(k=>k.id===value)){ctx().session.studioItem=value;render(false);}}
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-studio':()=>studioSelectView(ctx()),'kana-fade':item=>kanaFadeView(ctx(),item),'kana-dictation':item=>kanaDictationView(ctx(),item),'kana-words':item=>kanaWordsView(ctx(),item)},beforeRender,afterRender,validateCatalog(state){for(const s of state.v3.sessions)if(s.source==='kana-words'&&!validWordReference(s.reference,s.queue.map(q=>q.questionId),words))throw new Error('備份含不一致的生活詞回想。');},dispose(){beforeRender();document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
