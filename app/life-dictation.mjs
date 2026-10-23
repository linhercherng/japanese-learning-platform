import {topics} from './content/catalog.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeDictationPhrase,lifeDictationKey,lifeRecallKey,storeLifeRecallDraft,storeLifeDictationDraft,exposeLifeDictation} from './core/life-dictation.mjs';
import {lifeDictationView,lifeDictationFilters} from './ui/life-dictation.mjs';
export function createLifeDictation({getContext,update,render,toast,now,play,cacheDraft}){
 let lastRoute='',epoch=0,open=false,comparison=null,busy=false,disposed=false,composing=false,version=0;
 function onRoute(name,param){const next=name+'/'+(param||'');if(next!==lastRoute){lastRoute=next;epoch++;open=false;comparison=null;composing=false;}}
 function current(ref){const [name,param]=location.hash.slice(1).split('/'),p=lifeDictationPhrase(param);return !disposed&&['life-dictation','life-recall'].includes(name)&&p?.reference===ref&&!pendingLife(getContext().state)?{...p,recall:name==='life-recall'}:null;}
 const focus=selector=>document.querySelector(selector)?.focus?.({preventScroll:false});
 async function action(d){const ref=d.lifeDictationReference,p=current(ref),kind=d.lifeDictationAction;if(!p||busy)return;const ticket=epoch,origin=location.hash,fresh=()=>current(ref)&&ticket===epoch&&location.hash===origin;
  if(kind==='close'){open=false;comparison=null;render(false);focus('[data-life-dictation-action="start"]');return;}
  if(kind==='edit'&&open&&comparison){comparison=null;render(false);focus('[data-life-dictation-input]');return;}
  if(kind==='start'){if(open)return;busy=true;try{const draft=getContext().state.drafts[(p.recall?lifeRecallKey:lifeDictationKey)(ref)];if(p.recall||draft?.text.trim())await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()){open=true;render(false);focus('[data-life-dictation-input]');}}finally{busy=false;}return;}
  if(!open)return;
  if(kind==='audio'){if((p.recall&&!comparison)||!['1','0.75'].includes(d.lifeDictationRate))return;busy=true;try{await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()&&open)await play(p.jp,Number(d.lifeDictationRate));}finally{busy=false;}return;}
  if(kind!=='compare'||comparison||composing||typeof d.text!=='string'||!d.text.trim())return;if(d.text.length>300)throw Error('句子請限制在 300 字內。');busy=true;const capturedVersion=version;
  try{await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()&&open&&!composing&&capturedVersion===version){comparison={own:d.text};render(false);focus('#life-dictation-comparison');}}finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeDictationAction)return;const focused=document.activeElement===b;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected){b.disabled=false;if(focused&&document.activeElement===document.body)b.focus?.({preventScroll:true});}});}
 function input(event){const field=event.target,ref=field.dataset?.lifeDictationInput;const p=current(ref);if(!ref||!open||comparison||!p)return;const text=field.value,time=now();if(text.length>300){toast('句子請限制在 300 字內。');return;}version++;const submit=field.form?.querySelector('button[type="submit"]');if(submit)submit.disabled=!text.trim();cacheDraft((p.recall?lifeRecallKey:lifeDictationKey)(ref),{text,points:[],time});update(s=>{const next=(p.recall?storeLifeRecallDraft:storeLifeDictationDraft)(s,ref,text,time);return text.trim()?exposeLifeDictation(next,ref,time):next;}).catch(()=>{});}
 function submit(event){const form=event.target,ref=form.dataset?.lifeDictationForm;if(!ref)return;event.preventDefault();if(event.isComposing||composing)return;action({lifeDictationAction:'compare',lifeDictationReference:ref,text:form.querySelector('[data-life-dictation-input]').value}).catch(error=>toast(error.message));}
 function change(event){const field=event.target,key=field.dataset?.lifeDictationFilter;if(disposed||!['#life-dictation','#life-recall'].includes(location.hash)||pendingLife(getContext().state)||!['level','topic'].includes(key))return;const allowed=key==='level'?['L','N5','N4','N3','N2','all']:['all',...topics.map(([id])=>id)];if(!allowed.includes(field.value))return;lifeDictationFilters(getContext().session,location.hash==='#life-recall')[key]=field.value;render(false);focus(`[data-life-dictation-filter="${key}"]`);}
 const compositionStart=event=>{if(open&&!comparison&&current(event.target.dataset?.lifeDictationInput)){composing=true;version++;}},compositionEnd=event=>{if(current(event.target.dataset?.lifeDictationInput))composing=false;};
 const listeners=[['click',click],['input',input],['submit',submit],['change',change],['compositionstart',compositionStart],['compositionend',compositionEnd]];for(const [name,fn] of listeners)document.addEventListener(name,fn);
 return {views:{'life-dictation':ref=>lifeDictationView(getContext(),ref,{open,comparison}),'life-recall':ref=>lifeDictationView(getContext(),ref,{open,comparison,recall:true})},onRoute,dispose(){disposed=true;for(const [name,fn] of listeners)document.removeEventListener(name,fn);}};
}
