import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaFocus} from '../app/kana-focus.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {startWeekCheck} from '../app/core/kana-recall.mjs';
import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
const time='2026-10-21T13:00:00Z';
async function run(body){
 const previous={document:globalThis.document,location:globalThis.location},events=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-beats/tea',renders=0,fail=false,count=0,controller;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};
 globalThis.document={addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),querySelector:()=>null};
 const render=()=>{renders++;const [name,param]=hash.slice(1).split('/');controller.views[name]?.(param);controller.afterRender(name,param);};
 const click=async dataset=>{events.get('click')({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));};
 try{controller=createKanaFocus({getContext:()=>c,update:async fn=>{c.state=fn(c.state);if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'focus-'+(++count),cacheDraft:(k,v)=>cache[k]=v});await body({c,controller,cache,messages,click,render,fail:()=>fail=true,get renders(){return renders;}});}finally{controller?.dispose();globalThis.document=previous.document;globalThis.location=previous.location;}
}
test('rhythm taps are bounded, ephemeral and never counted as recall answers; stale buttons do nothing',async()=>run(async h=>{
 h.render();for(let i=0;i<15;i++)await h.click({focusAction:'tap',focusCard:'tea'});assert.equal(h.c.session.kanaBeat.taps,12);assert.equal(h.c.state.attempts.length,0);
 location.hash='kana-beats/coffee';h.render();assert.equal(h.c.session.kanaBeat.taps,0);await h.click({focusAction:'reveal',focusCard:'tea'});assert.equal(h.c.session.kanaBeat.revealed,false);
 await h.click({focusAction:'tap',focusCard:'coffee'});await h.click({focusAction:'reset',focusCard:'coffee'});assert.equal(h.c.session.kanaBeat.taps,0);
 assert.equal(Object.keys(parseBackup(exportBackup(h.c.state)).v3.kanaHints||{}).length,0);
}));
test('revealed rhythm records visible glyph exposure in pending week and dictation, even on quota failure',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'prior',item:'h-304a',dimension:'listening',correct:true,hinted:false,time:'2026-10-01T01:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'h-304a',id:'ink',time});h.render();
 assert(!h.c.state.v3.kanaHints);h.fail();await h.click({focusAction:'reveal',focusCard:'tea'});
 assert(h.c.state.v3.sessions[0].hints.includes('kc:check:h-304a:listen'));assert(readDictation(h.c.state,'h-304a').meta.hinted);assert(h.cache['dictation:h-304a']||Object.values(h.cache).some(d=>d.text.includes('"hinted":true')));
 assert(h.c.state.v3.kanaHints['h-3061-3083']);assert(h.messages.includes('quota'));assert.equal(h.c.state.attempts.length,1);
 const backup=parseBackup(exportBackup(h.c.state));assert(backup.v3.kanaHints['h-304a']);
}));
test('repair start uses current state then resumes the fixed saved round after backup',async()=>run(async h=>{
 location.hash='kana-repair';await h.click({focusAction:'repair-start'});assert.equal(h.c.state.v3.sessions.length,0);
 h.c.state=recordAnswer(h.c.state,{id:'wrong',item:'h-3042',dimension:'listening',correct:false,hinted:false,time});await h.click({focusAction:'repair-start'});const s=h.c.state.v3.sessions[0];assert.equal(location.hash,'#v3-practice/'+s.id);
 h.c.state=parseBackup(exportBackup(h.c.state));location.hash='kana-repair';await h.click({focusAction:'repair-start'});assert.equal(h.c.state.v3.sessions.length,1);assert.equal(location.hash,'#v3-practice/'+s.id);
 h.controller.validateCatalog(h.c.state);const bad=structuredClone(h.c.state);bad.v3.sessions[0].queue[0].questionId='kc:check:h-3044:listen';assert.throws(()=>h.controller.validateCatalog(bad));
}));
