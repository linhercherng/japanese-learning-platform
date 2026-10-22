import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaFamily} from '../app/kana-family.mjs';import {createV3} from '../app/v3.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';import {startWeekCheck} from '../app/core/kana-recall.mjs';import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
const time='2026-10-22T12:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-family/h-306f',counter=0,family,v3,fail=false,held=null;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:()=>null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');v3.onRoute(name,param);(family.views[name]||v3.views[name])?.(param);family.afterRender(name,param);v3.afterRender(name,param);};
 const options={getState:()=>c.state,getContext:()=>c,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'family-'+(++counter),cacheDraft:(k,v)=>cache[k]=v};
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));render();await new Promise(r=>setImmediate(r));};
 try{family=createKanaFamily(options);v3=createV3(options);await body({c,family,cache,messages,click,render,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return ()=>{held=null;release();};},change:value=>{for(const f of listeners.get('change')||[])f({target:{dataset:{familyPicker:''},value}});}});}finally{family?.dispose();v3?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
test('selected ring member exposure updates week and dictation cache without scoring, and reload drops only local guide state',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-3071',dimension:'recognition',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'h-3071',id:'ink',time});h.render();assert(!h.c.state.v3.kanaHints);
 await h.click({familyAction:'compare',familyId:'h-306f'});await h.click({familyAction:'select',familyId:'h-306f',familyTarget:'h-3071'});assert(h.c.state.v3.kanaHints['h-3071']);assert(readDictation(h.c.state,'h-3071').meta.hinted);assert(Object.keys(h.cache).length);assert(h.c.state.v3.sessions[0].hints.includes('kc:check:h-3071:pair'));assert.equal(h.c.state.attempts.length,1);
 h.c.state=parseBackup(exportBackup(h.c.state));h.c.session={};h.render();assert.equal(h.c.session.kanaFamily.revealed,false);assert.equal(h.c.state.attempts.length,1);
}));
test('stale and unavailable member selections are ignored, and pending round resumes without revealing its guide',async()=>run(async h=>{
 await h.click({familyAction:'start',familyId:'k-30cf'});assert.equal(h.c.state.v3.sessions.length,0);await h.click({familyAction:'select',familyId:'h-306f',familyTarget:'h-3071'});assert.equal(h.c.session.kanaFamily.selected,'h-306f');await h.click({familyAction:'compare',familyId:'h-306f'});await h.click({familyAction:'select',familyId:'h-306f',familyTarget:'h-3042'});assert.equal(h.c.session.kanaFamily.selected,'h-306f');
 await h.click({familyAction:'start',familyId:'h-306f'});assert(location.hash.includes('family-1'));location.hash='kana-family/h-306f';await h.click({familyAction:'select',familyId:'h-306f',familyTarget:'h-3071'});assert.equal(h.c.session.kanaFamily.selected,'h-306f');await h.click({familyAction:'start',familyId:'h-306f'});assert.equal(h.c.state.v3.sessions.length,1);
 location.hash='kana-family/h-306f';h.change('bad');assert.equal(location.hash,'#kana-family/h-306f');h.change('k-30cf');assert.equal(location.hash,'#kana-family/k-30cf');
}));
test('family answer feedback exposes every member, including the third, while first answers remain immutable',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-3071',dimension:'recognition',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});await h.click({familyAction:'start',familyId:'h-306f'});await h.click({v3Choice:'0'});
 for(const item of ['h-306f','h-3070','h-3071'])assert(h.c.state.v3.kanaHints[item]);assert(h.c.state.v3.sessions.find(s=>s.id==='week').hints.includes('kc:check:h-3071:pair'));const round=h.c.state.v3.sessions.find(s=>s.source==='kana-family');assert.equal(Object.values(round.answers)[0].hinted,false);assert.equal(Object.values(round.answers)[0].correct,true);await h.click({v3Choice:'1'});assert.equal(h.c.state.attempts.length,2);
}));
test('failed and delayed saves retain exportable data and do not hijack a newer route',async()=>run(async h=>{
 const release=h.hold(),pending=h.click({familyAction:'start',familyId:'h-306f'});location.hash='kana-path';release();await pending;assert.equal(location.hash,'#kana-path');assert.equal(h.c.state.v3.sessions.length,1);
 location.hash='kana-family/h-304b';h.fail();await h.click({familyAction:'compare',familyId:'h-304b'});assert(h.messages.includes('quota'));assert(parseBackup(exportBackup(h.c.state)).v3.kanaHints['h-304b']);assert.equal(h.c.state.attempts.length,0);
}));
