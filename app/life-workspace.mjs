import {topics} from './content/catalog.mjs';
import {pendingLife} from './core/life-memory.mjs';
import {lifePathView,lifeWorkspaceView,workspaceOptions} from './ui/life-workspace.mjs';
import {lifeGuideView} from './ui/life-guide.mjs';

export function createLifeWorkspace({getContext,render,now=()=>new Date().toISOString()}){
 let disposed=false,composing=false,pointerBlocked=false,lastRoute='';
 const filters={};
 const current=()=>!disposed&&location.hash==='#life-workspace'&&!pendingLife(getContext().state);
 const focus=()=>document.querySelector('#life-workspace-results')?.focus({preventScroll:false});
 function onRoute(name,param){const route=name+'/'+(param||'');if(route!==lastRoute){lastRoute=route;composing=false;pointerBlocked=false;}}
 function pointerdown(event){const b=event.target.closest('button');pointerBlocked=Boolean(current()&&composing&&b&&(b.dataset.lifeWorkspaceAction||b.form?.hasAttribute('data-life-workspace-search')));}
 const pointercancel=()=>{pointerBlocked=false;};
 function click(event){
  if(!current())return;
  const b=event.target.closest('button');
  if(pointerBlocked){pointerBlocked=false;event.preventDefault();return;}
  if(!b?.dataset.lifeWorkspaceAction||composing)return;
  if(b.dataset.lifeWorkspaceAction==='reset'){for(const key of Object.keys(filters))delete filters[key];}
  else if(b.dataset.lifeWorkspaceAction==='page'){const page=Number(b.dataset.lifeWorkspacePage);if(!Number.isInteger(page)||page<1)return;filters.page=page;}
  else return;
  render(false);focus();
 }
 function submit(event){
  if(!event.target.hasAttribute?.('data-life-workspace-search'))return;
  event.preventDefault();if(!current())return;
  if(pointerBlocked){pointerBlocked=false;return;}
  if(composing||event.isComposing)return;
  const data=new FormData(event.target),query=String(data.get('query')||'');if(query.length>160)return;
  filters.query=query;
  for(const key of ['level','kind','scope']){const value=String(data.get(key)||'all');filters[key]=workspaceOptions[key].some(([id])=>id===value)?value:'all';}
  const topic=String(data.get('topic')||'all');filters.topic=topics.some(([id])=>id===topic)?topic:'all';filters.page=1;
  render(false);focus();
 }
 const compositionstart=event=>{if(current()&&Object.hasOwn(event.target.dataset||{},'lifeWorkspaceQuery'))composing=true;};
 const compositionend=event=>{if(Object.hasOwn(event.target.dataset||{},'lifeWorkspaceQuery'))composing=false;};
 const listeners={click,submit,pointerdown,pointercancel,compositionstart,compositionend};
 for(const [name,fn] of Object.entries(listeners))document.addEventListener(name,fn);
 return {views:{'life-path':()=>lifePathView(getContext(),now()),'life-guide':lifeGuideView,'life-workspace':()=>lifeWorkspaceView(getContext(),filters)},onRoute,dispose(){disposed=true;for(const [name,fn] of Object.entries(listeners))document.removeEventListener(name,fn);}};
}
