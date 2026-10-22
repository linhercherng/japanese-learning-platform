import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaBridge} from '../app/kana-bridge.mjs';import {createV3} from '../app/v3.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {startWeekCheck} from '../app/core/kana-recall.mjs';import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
const time='2026-10-22T04:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-bridge/h-3042',counter=0,bridge,v3,fail=false,held=null;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:()=>null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');v3.onRoute(name,param);(bridge.views[name]||v3.views[name])?.(param);bridge.afterRender(name,param);v3.afterRender(name,param);};
 const options={getState:()=>c.state,getContext:()=>c,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'bridge-'+(++counter),cacheDraft:(k,v)=>cache[k]=v};
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));render();await new Promise(r=>setImmediate(r));};
 try{bridge=createKanaBridge(options);v3=createV3(options);await body({c,bridge,v3,cache,messages,click,render,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return ()=>{held=null;release();};},change:value=>{for(const f of listeners.get('change')||[])f({target:{dataset:{bridgeFamily:''},value}});}});}finally{bridge?.dispose();v3?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
test('only shown comparison records exposure and updates outstanding week/dictation drafts without inventing answers',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'k-30a2',dimension:'listening',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'k-30a2',id:'ink',time});h.render();assert.equal(Object.keys(h.c.state.v3.kanaHints||{}).length,0);
 await h.click({bridgeAction:'compare',bridgeItem:'h-3042'});assert(h.c.state.v3.kanaHints['h-3042']);assert(h.c.state.v3.kanaHints['k-30a2']);assert(h.c.state.v3.sessions[0].hints.includes('kc:check:k-30a2:listen'));assert(readDictation(h.c.state,'k-30a2').meta.hinted);assert(Object.keys(h.cache).length);assert.equal(h.c.state.attempts.length,1);
 await h.click({bridgeAction:'compare',bridgeItem:'h-3042'});assert.equal(h.c.session.bridgeCompare,null);
}));
test('stale actions cannot start another group, pending resume hides cues and valid direction selection changes route',async()=>run(async h=>{
 await h.click({bridgeAction:'start',bridgeItem:'k-30a2'});assert.equal(h.c.state.v3.sessions.length,0);await h.click({bridgeAction:'start',bridgeItem:'h-3042'});const round=h.c.state.v3.sessions[0];assert.equal(round.source,'kana-bridge');assert(location.hash.includes(round.id));
 location.hash='kana-bridge/h-3042';h.c.session.bridgeCompare='h-3042';const before=JSON.stringify(h.c.state.v3.kanaHints);await h.click({bridgeAction:'compare',bridgeItem:'h-3042'});assert.equal(JSON.stringify(h.c.state.v3.kanaHints),before);await h.click({bridgeAction:'start',bridgeItem:'h-3042'});assert.equal(h.c.state.v3.sessions.length,1);
 location.hash='kana-bridge/h-3042';h.change('bad');assert.equal(location.hash,'#kana-bridge/h-3042');h.change('k-30d1');assert.equal(location.hash,'#kana-bridge/k-30d1');
}));
test('storage failure keeps comparison exposure exportable and does not create a round or score',async()=>run(async h=>{
 h.fail();await h.click({bridgeAction:'compare',bridgeItem:'h-3042'});assert(h.messages.includes('quota'));assert(parseBackup(exportBackup(h.c.state)).v3.kanaHints['k-30a2']);assert.equal(h.c.state.attempts.length,0);assert.equal(h.c.state.v3.sessions.length,0);
}));
test('finishing a delayed save keeps the round resumable without hijacking a newer route',async()=>run(async h=>{
 const release=h.hold(),pending=h.click({bridgeAction:'start',bridgeItem:'h-3042'});location.hash='kana-path';release();await pending;
 assert.equal(location.hash,'#kana-path');assert.equal(h.c.state.v3.sessions.length,1);assert(h.bridge.views['kana-bridge']('h-3042').includes('接續原來的三題'));
}));
