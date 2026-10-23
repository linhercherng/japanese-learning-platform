import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';
import {startLifeMemory} from '../app/core/life-memory.mjs';
const mod=await import('../app/life-workspace.mjs').catch(()=>({}));
function run(body){
 assert.equal(typeof mod.createLifeWorkspace,'function','workspace controller missing');
 const old={document:globalThis.document,location:globalThis.location,FormData:globalThis.FormData},events=new Map(),c={state:initialState(),session:{}},focused=[];
 let renders=0,control;globalThis.location={hash:'#life-workspace'};
 globalThis.document={addEventListener:(n,fn)=>events.set(n,fn),removeEventListener:n=>events.delete(n),querySelector:s=>({focus:()=>focused.push(s)})};
 globalThis.FormData=class{constructor(form){this.values=form.values;}get(k){return this.values[k];}};
 const form={hasAttribute:n=>n==='data-life-workspace-search',values:{query:'找不到',level:'all',topic:'all',kind:'all',scope:'all'}};
 const field={dataset:{lifeWorkspaceQuery:''}},button={dataset:{},form};
 const render=()=>{renders++;control.onRoute(location.hash.slice(1));return control.views['life-workspace']();};
 const submit=(isComposing=false)=>events.get('submit')({target:form,isComposing,preventDefault(){}});
 const click=action=>events.get('click')({target:{closest:()=>({dataset:{lifeWorkspaceAction:action,lifeWorkspacePage:'2'}})},preventDefault(){}});
 try{control=mod.createLifeWorkspace({getContext:()=>c,render});render();body({c,control,events,form,field,button,render,submit,click,count:()=>renders,focused});}finally{control?.dispose();Object.assign(globalThis,old);}
}
test('typing search does not render; only explicit submit changes results and focus',()=>run(h=>{const before=structuredClone(h.c.state),n=h.count();h.events.get('input')?.({target:h.field});assert.equal(h.count(),n);h.submit();assert(h.render().includes('value="找不到"'));assert(h.focused.includes('#life-workspace-results'));assert.deepEqual(h.c.state,before);}));
test('reset clears filters and page while stale route and disposed handlers cannot render',()=>run(h=>{h.submit();h.click('reset');assert(h.render().includes('value=""'));location.hash='#home';h.render();const count=h.count();h.submit();h.click('page');assert.equal(h.count(),count);h.control.dispose();assert.equal(h.events.size,0);}));
test('composition blocks Enter and all workspace redraws',()=>run(h=>{h.events.get('compositionstart')({target:h.field});const count=h.count();h.submit(true);h.submit();h.click('reset');h.click('page');assert.equal(h.count(),count);h.events.get('compositionend')({target:h.field});h.submit();assert(h.count()>count);}));
test('pointer started composing remains blocked after blur and native submit click',()=>run(h=>{h.events.get('compositionstart')({target:h.field});h.events.get('pointerdown')({target:{closest:()=>h.button}});h.events.get('compositionend')({target:h.field});const count=h.count();let prevented=false;h.events.get('click')({target:{closest:()=>h.button},preventDefault(){prevented=true;}});assert(prevented);assert.equal(h.count(),count);h.events.get('pointerdown')({target:{closest:()=>h.button}});h.submit();assert(h.count()>count);}));
test('direct submit consumes pointer latch and pending hides query without state changes',()=>run(h=>{h.events.get('compositionstart')({target:h.field});h.events.get('pointerdown')({target:{closest:()=>h.button}});h.events.get('compositionend')({target:h.field});const count=h.count();h.submit();assert.equal(h.count(),count);h.events.get('pointercancel')({});h.submit();assert(h.count()>count);h.c.state=startLifeMemory(h.c.state,{unitId:'L07',id:'original',time:'2026-10-23T08:00:00.000Z'});const before=structuredClone(h.c.state),n=h.count();h.submit();h.click('reset');assert.equal(h.count(),n);assert(h.render().includes('#v3-practice/original'));assert.deepEqual(h.c.state,before);}));
