import {topics} from './content/catalog.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeDictationPhrase,lifeDictationKey,lifeRecallKey,lifeBlankKey,storeLifeBlankDraft,storeLifeRecallDraft,storeLifeDictationDraft,exposeLifeDictation,lifeTextDifferenceSteps} from './core/life-dictation.mjs';
import {lifeDictationView,lifeDictationFilters} from './ui/life-dictation.mjs';
export function createLifeDictation({getContext,update,render,toast,now,play,cacheDraft}){
 let lastRoute='',epoch=0,open=false,comparison=null,busy=false,disposed=false,composing=false,version=0,hintLevel=0,blank=false,blankText='',differenceIndex=null,fragment=null;
 function onRoute(name,param){const next=name+'/'+(param||'');if(next!==lastRoute){lastRoute=next;epoch++;open=false;comparison=null;composing=false;hintLevel=0;blank=false;blankText='';differenceIndex=null;fragment=null;}}
 function current(ref){const [name,param]=location.hash.slice(1).split('/'),p=lifeDictationPhrase(param);return !disposed&&['life-dictation','life-recall'].includes(name)&&p?.reference===ref&&!pendingLife(getContext().state)?{...p,recall:name==='life-recall'}:null;}
 const focus=selector=>document.querySelector(selector)?.focus?.({preventScroll:false});
 async function action(d){const ref=d.lifeDictationReference,p=current(ref),kind=d.lifeDictationAction;if(!p||busy)return;const ticket=epoch,origin=location.hash,fresh=()=>current(ref)&&ticket===epoch&&location.hash===origin;
  if(fragment&&composing)return;
  if(kind==='close'){const startAction=blank?'start-blank':'start';open=false;comparison=null;hintLevel=0;blank=false;blankText='';differenceIndex=null;fragment=null;render(false);focus(`[data-life-dictation-action="${startAction}"]`);return;}
  if(kind==='edit'&&open&&comparison){comparison=null;hintLevel=0;differenceIndex=null;fragment=null;render(false);focus('[data-life-dictation-input]');return;}
  if(kind==='restart-blank'&&open&&comparison){comparison=null;hintLevel=0;differenceIndex=null;fragment=null;blank=true;blankText='';render(false);focus('[data-life-dictation-input]');return;}
  if(kind.startsWith('fragment-')){
   if(!open||!comparison||!Number.isInteger(differenceIndex)||!lifeTextDifferenceSteps(comparison.own,p.jp)[differenceIndex]||composing)return;
   if(kind==='fragment-start'&&!fragment)fragment={text:'',checked:false};
   else if(!fragment)return;
   else if(kind==='fragment-back')fragment=null;
   else if(kind==='fragment-retry'&&fragment.checked)fragment={text:'',checked:false};
   else if(kind==='fragment-empty'&&!fragment.checked)fragment={text:'',checked:true};
   else if(kind==='fragment-check'&&!fragment.checked&&typeof d.text==='string'&&d.text.length){if(d.text.length>300)throw Error('片段請限制在 300 字內。');fragment={text:d.text,checked:true};}
   else return;
   render(false);focus(!fragment?'#life-dictation-difference':fragment.checked?'#life-fragment-result':'#life-fragment-input');return;
  }
  if(kind.startsWith('difference-')){
   if(!open||!comparison||fragment)return;const steps=lifeTextDifferenceSteps(comparison.own,p.jp);
   if(kind==='difference-full')differenceIndex=null;
   else if(kind==='difference-start'&&steps.length)differenceIndex=0;
   else if(kind==='difference-next'&&Number.isInteger(differenceIndex)&&differenceIndex<steps.length-1)differenceIndex++;
   else if(kind==='difference-previous'&&Number.isInteger(differenceIndex)&&differenceIndex>0)differenceIndex--;
   else return;
   render(false);focus(differenceIndex===null?'#life-dictation-comparison':'#life-dictation-difference');return;
  }
  if(['start','start-blank','resume-blank'].includes(kind)){if(open)return;const nextBlank=kind!=='start',key=nextBlank?lifeBlankKey(ref,p.recall):(p.recall?lifeRecallKey:lifeDictationKey)(ref),draft=getContext().state.drafts[key];if(kind==='resume-blank'&&!draft?.text.trim())return;const nextText=kind==='start-blank'?'':draft?.text||'';busy=true;
   try{if(p.recall||nextText.trim())await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()){blank=nextBlank;blankText=nextText;open=true;hintLevel=0;differenceIndex=null;fragment=null;render(false);focus('[data-life-dictation-input]');}}finally{busy=false;}return;
  }
  if(!open)return;
  if(kind==='hide-hint'){if(!p.recall||comparison||composing)return;hintLevel=0;render(false);focus('[data-life-dictation-input]');return;}
  if(kind==='hint'){if(!p.recall||comparison||composing||hintLevel>=2)return;busy=true;const capturedVersion=version,nextLevel=hintLevel+1;
   try{await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()&&open&&!comparison&&!composing&&capturedVersion===version){hintLevel=nextLevel;render(false);focus('#life-recall-hint');}}finally{busy=false;}return;
  }
  if(kind==='audio'){if((p.recall&&!comparison)||!['1','0.75'].includes(d.lifeDictationRate))return;busy=true;try{await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()&&open)await play(p.jp,Number(d.lifeDictationRate));}finally{busy=false;}return;}
  if(kind!=='compare'||comparison||composing||typeof d.text!=='string'||!d.text.trim())return;if(d.text.length>300)throw Error('句子請限制在 300 字內。');busy=true;const capturedVersion=version;
  try{await update(s=>exposeLifeDictation(s,ref,now()));if(fresh()&&open&&!composing&&capturedVersion===version){comparison={own:d.text};hintLevel=0;differenceIndex=null;fragment=null;render(false);focus('#life-dictation-comparison');}}finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeDictationAction)return;const focused=document.activeElement===b;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected){b.disabled=false;if(focused&&document.activeElement===document.body)b.focus?.({preventScroll:true});}});}
 function input(event){const field=event.target,fragmentRef=field.dataset?.lifeFragmentInput;
  if(fragmentRef){if(!current(fragmentRef)||!open||!comparison||!fragment||fragment.checked)return;const text=field.value;if(text.length>300){toast('片段請限制在 300 字內。');return;}fragment.text=text;version++;const submit=field.form?.querySelector('button[type="submit"]');if(submit)submit.disabled=!text.length;return;}
  const ref=field.dataset?.lifeDictationInput,p=current(ref);if(!ref||!open||comparison||!p)return;const text=field.value,time=now(),asBlank=blank;if(text.length>300){toast('句子請限制在 300 字內。');return;}version++;if(asBlank)blankText=text;const submit=field.form?.querySelector('button[type="submit"]');if(submit)submit.disabled=!text.trim();cacheDraft(asBlank?lifeBlankKey(ref,p.recall):(p.recall?lifeRecallKey:lifeDictationKey)(ref),{text,points:[],time});update(s=>{const next=asBlank?storeLifeBlankDraft(s,ref,text,time,p.recall):(p.recall?storeLifeRecallDraft:storeLifeDictationDraft)(s,ref,text,time);return text.trim()?exposeLifeDictation(next,ref,time):next;}).catch(()=>{});}
 function submit(event){const form=event.target,fragmentRef=form.dataset?.lifeFragmentForm,ref=fragmentRef||form.dataset?.lifeDictationForm;if(!ref)return;event.preventDefault();if(event.isComposing||composing)return;action({lifeDictationAction:fragmentRef?'fragment-check':'compare',lifeDictationReference:ref,text:form.querySelector(fragmentRef?'[data-life-fragment-input]':'[data-life-dictation-input]').value}).catch(error=>toast(error.message));}
 function change(event){const field=event.target,key=field.dataset?.lifeDictationFilter;if(disposed||!['#life-dictation','#life-recall'].includes(location.hash)||pendingLife(getContext().state)||!['level','topic','scope'].includes(key))return;const allowed=key==='scope'?['all','written','blank','unwritten']:key==='level'?['L','N5','N4','N3','N2','all']:['all',...topics.map(([id])=>id)];if(!allowed.includes(field.value))return;lifeDictationFilters(getContext().session,location.hash==='#life-recall')[key]=field.value;render(false);focus(`[data-life-dictation-filter="${key}"]`);}
 const compositionStart=event=>{const d=event.target.dataset;if(open&&((!comparison&&current(d?.lifeDictationInput))||(comparison&&fragment&&!fragment.checked&&current(d?.lifeFragmentInput)))){composing=true;version++;}},compositionEnd=event=>{if(current(event.target.dataset?.lifeDictationInput||event.target.dataset?.lifeFragmentInput))composing=false;};
 const listeners=[['click',click],['input',input],['submit',submit],['change',change],['compositionstart',compositionStart],['compositionend',compositionEnd]];for(const [name,fn] of listeners)document.addEventListener(name,fn);
 return {views:{'life-dictation':ref=>lifeDictationView(getContext(),ref,{open,comparison,blank,blankText,differenceIndex,fragment}),'life-recall':ref=>lifeDictationView(getContext(),ref,{open,comparison,recall:true,hintLevel,blank,blankText,differenceIndex,fragment})},onRoute,dispose(){disposed=true;for(const [name,fn] of listeners)document.removeEventListener(name,fn);}};
}
