import {lifeUnitIds} from './content/life-memory-ids.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifeNoteKey,storeLifeNoteDraft,saveLifeNote,exposeLifeNote} from './core/life-notes.mjs';
import {lifeNotesView} from './ui/life-notes.mjs';
export function createLifeNotes({getContext,update,render,toast,now,cacheDraft}){
 let route='',epoch=0,open=false,busy=false,disposed=false,composing=false;const versions=new Map(),filters={};
 const current=unit=>!disposed&&location.hash==='#life-notes/'+unit&&lifeUnitIds.has(unit)&&!pendingLife(getContext().state);
 function onRoute(name,param){const next=name+'/'+(param||'');if(next!==route){route=next;epoch++;open=false;composing=false;}}
 const focus=selector=>document.querySelector(selector)?.focus?.({preventScroll:false});
 const fresh=(ticket,origin)=>!disposed&&ticket===epoch&&location.hash===origin;
 async function action(d){if(disposed||busy||!location.hash.startsWith('#life-notes'))return;const unit=d.lifeNoteUnit;
  if(!unit&&location.hash==='#life-notes'){if(d.lifeNoteAction==='reset'){for(const key of Object.keys(filters))delete filters[key];render(false);focus('#life-note-results');}if(d.lifeNoteAction==='page'){filters.page=Number(d.lifeNotePage);render(false);focus('#life-note-results');}return;}
  if(!current(unit))return;
  if(d.lifeNoteAction==='close'){open=false;render(false);focus('[data-life-note-action="open"]');return;}
  if(d.lifeNoteAction!=='open')return;busy=true;const ticket=epoch,origin=location.hash;
  try{await update(s=>exposeLifeNote(s,unit,now()));if(fresh(ticket,origin)){open=true;render(false);document.querySelector('[data-life-note-input]')?.focus?.({preventScroll:true});}}finally{busy=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.lifeNoteAction)return;action({...b.dataset}).catch(error=>toast(error.message));}
 function input(event){const field=event.target,unit=field.dataset?.lifeNoteInput;if(!unit||!open||!current(unit))return;const text=field.value,time=now();if(text.length>160){toast('生活線索請限制在 160 字內。');return;}const key=lifeNoteKey(unit);versions.set(unit,(versions.get(unit)||0)+1);cacheDraft(key,{text,points:[],time});update(s=>exposeLifeNote(storeLifeNoteDraft(s,unit,text,time),unit,time)).catch(()=>{});}
 async function save(form,event){const unit=form.dataset.lifeNoteForm;if(!current(unit)||!open||busy||composing||event.isComposing)return;const text=form.querySelector('[data-life-note-input]').value,time=now(),key=lifeNoteKey(unit),version=versions.get(unit)||0,ticket=epoch,origin=location.hash;busy=true;
  try{await update(s=>{const d=s.drafts[key],changed=(versions.get(unit)||0)!==version;let next=saveLifeNote(s,unit,text,time);if(changed&&d)next.drafts[key]=d;return exposeLifeNote(next,unit,time);});if((versions.get(unit)||0)===version)cacheDraft(key,null);if(fresh(ticket,origin)){if((versions.get(unit)||0)===version){open=false;render(false);focus('[data-life-note-action="open"]');}toast('生活線索已保存。');}}finally{busy=false;}
 }
 function submit(event){const form=event.target;if(!form.dataset?.lifeNoteForm&&!form.hasAttribute?.('data-life-notes-search'))return;event.preventDefault();if(form.dataset.lifeNoteForm){save(form,event).catch(error=>toast(error.message));return;}if(location.hash!=='#life-notes'||composing||event.isComposing)return;const data=new FormData(form);for(const key of ['query','level','topic','scope'])filters[key]=String(data.get(key)||'');filters.page=1;render(false);focus('#life-note-results');}
 const compositionStart=event=>{if(event.target.dataset?.lifeNoteInput)composing=true;},compositionEnd=event=>{if(event.target.dataset?.lifeNoteInput)composing=false;};
 for(const [name,fn] of [['click',click],['input',input],['submit',submit],['compositionstart',compositionStart],['compositionend',compositionEnd]])document.addEventListener(name,fn);
 return {views:{'life-notes':unit=>lifeNotesView(getContext(),unit,{...filters,open})},onRoute,dispose(){disposed=true;for(const [name,fn] of [['click',click],['input',input],['submit',submit],['compositionstart',compositionStart],['compositionend',compositionEnd]])document.removeEventListener(name,fn);}};
}
