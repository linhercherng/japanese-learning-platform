import {notebookPage,notebookExposure} from './core/kana-notebook.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
export function createKanaNotebook({getContext,update,render,toast,now,cacheDraft}){
 let composing=false;
 const current=()=>{const [name,item]=location.hash.slice(1).split('/');return name==='kana-notes'&&!item;};
 const focus=()=>document.querySelector('#notebook-query')?.focus();
 function submit(event){
  if(!event.target.matches?.('[data-notebook-form]'))return;event.preventDefault();if(!current()||composing||event.isComposing)return;
  const raw=Object.fromEntries(['query','script','group','scope'].map(k=>[k,document.querySelector('#notebook-'+k)?.value||'']));
  getContext().session.kanaNotebook={...notebookPage(getContext().state,raw).filters,page:0};render(false);focus();
 }
 function click(event){
  const name=event.target.closest('button')?.dataset.notebookAction;if(!current()||!['clear','previous','next'].includes(name)||composing)return;
  const c=getContext(),p=notebookPage(c.state,c.session.kanaNotebook);
  c.session.kanaNotebook=name==='clear'?{...notebookPage(c.state,{}).filters,page:0}:{...p.filters,page:Math.max(0,Math.min(p.pages-1,p.page+(name==='next'?1:-1)))};
  render(false);focus();
 }
 function start(event){if(current()&&event.target.closest?.('[data-notebook-form]'))composing=true;}
 function end(){composing=false;}
 function afterRender(name,item){
  if(name!=='kana-notes'||item)return;const c=getContext(),items=notebookExposure(notebookPage(c.state,c.session.kanaNotebook));if(!items.length)return;
  const time=now();update(s=>{const next=recordKanaExposure(s,items,time);for(const id of items){const d=readDictation(next,id);if(d)cacheDraft(d.key,next.drafts[d.key]);}return next;}).catch(error=>toast(error.message));
 }
 const events={submit,click,compositionstart:start,compositionend:end};for(const [name,fn] of Object.entries(events))document.addEventListener(name,fn);
 return {afterRender,dispose(){for(const [name,fn] of Object.entries(events))document.removeEventListener(name,fn);}};
}
