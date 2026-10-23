import {words} from './content/catalog.mjs';
import {noteEditorExposure} from './core/kana-notebook.mjs';
import {kana} from './content/kana.mjs';
import {buildExamples,miniQuestions,validLabReference} from './content/kana-lab.mjs';
import {saveKanaNote,storeNoteDraft,noteKey,selectMiniCards,pendingMini} from './core/kana-lab.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
import {beginV3Session} from './core/v3-learning.mjs';
import {miniView,miniFilter,notesView,buildView} from './ui/kana-lab.mjs';
export function createKanaLab({getContext,update,render,toast,now,id,cacheDraft}){
 const ctx=()=>getContext(),valid=item=>kana.some(k=>k.id===item);
 function input(event){const item=event.target.dataset.labNote;if(!valid(item))return;const text=event.target.value,time=now();if(text.length>160){toast('記憶線索最多160字。');return;}cacheDraft(noteKey(item),{text,points:[],time});update(s=>storeNoteDraft(s,item,text,time)).catch(()=>{});}
 async function action(d){
  const item=d.labItem;
  if(d.labAction==='mini-start'){
   const f=miniFilter(ctx().session),sessionId=id(),time=now();let destination;
   await update(s=>{const pending=pendingMini(s,f);if(pending){destination=pending.id;return s;}const cards=selectMiniCards(s,{...f,time}),items=cards.map(k=>k.id),qs=miniQuestions(items,words);const next=beginV3Session(s,qs.map(q=>q.id),{id:sessionId,source:'kana-mini',reference:items.join(':'),time});destination=next.v3.sessions.find(p=>p.source==='kana-mini'&&p.reference===items.join(':')&&!p.completedAt).id;return next;});location.hash='v3-practice/'+destination;return;
  }
  if(!valid(item))throw Error('請先選擇有效的字卡。');
  if(d.labAction==='build-start'){
   const ids=buildExamples(item,words).map(w=>'kb:'+item+':'+w.id),sessionId=id(),time=now();let destination;
   await update(s=>{const next=beginV3Session(s,ids,{id:sessionId,source:'kana-build',reference:item,time});destination=next.v3.sessions.find(p=>p.source==='kana-build'&&p.reference===item&&!p.completedAt&&JSON.stringify(p.questionIds)===JSON.stringify(ids)).id;return next;});location.hash='v3-practice/'+destination;return;
  }
  if(d.labAction==='clear-note'){const field=document.querySelector('#kana-note');field.value='';input({target:field});return;}
  if(d.labAction==='save-note'){
   const text=document.querySelector('#kana-note')?.value||'',time=now(),hash=location.hash;let applied=false;
   try{await update(s=>{const next=saveKanaNote(s,item,text,time);cacheDraft(noteKey(item),null);applied=true;return next;});toast('記憶線索已保存。');}finally{if(applied&&location.hash===hash)render(false);}return;
  }
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.labAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){const key=event.target.dataset.labFilter;if(!['script','group'].includes(key))return;ctx().session.kanaMini={...miniFilter(ctx().session),[key]:event.target.value};render(false);}
 function afterRender(name,item){
  const context=ctx(),time=now();let items=[];
  if(name==='kana-notes')items=noteEditorExposure(context.state,item);
  if(name==='kana-mini'&&!pendingMini(context.state,miniFilter(context.session)))items=selectMiniCards(context.state,{...miniFilter(context.session),time}).map(k=>k.id);
  if(!items.length)return;
  update(s=>{const next=recordKanaExposure(s,items,time);for(const id of items){const active=readDictation(next,id);if(active)cacheDraft(active.key,next.drafts[active.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('input',input);document.addEventListener('change',change);
 return {views:{'kana-mini':()=>miniView(ctx(),now()),'kana-notes':item=>notesView(ctx(),item),'kana-build':item=>buildView(ctx(),item)},afterRender,validateCatalog(s){for(const p of s.v3.sessions)if(['kana-mini','kana-build'].includes(p.source)&&(!validLabReference(p.source,p.reference,p.questionIds,words)||p.queue.some(q=>!p.questionIds.includes(q.questionId))))throw Error('備份含不一致的三字／拼詞練習。');},dispose(){document.removeEventListener('click',click);document.removeEventListener('input',input);document.removeEventListener('change',change);}};
}
