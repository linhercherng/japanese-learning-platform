import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaRow} from '../app/kana-row.mjs';import {createV3} from '../app/v3.mjs';import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';import {startWeekCheck} from '../app/core/kana-recall.mjs';import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
const time='2026-10-22T13:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-row/h-2',counter=0,row,v3,fail=false,held=null;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:()=>null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');v3.onRoute(name,param);(row.views[name]||v3.views[name])?.(param);row.afterRender(name,param);v3.afterRender(name,param);};
 const options={getState:()=>c.state,getContext:()=>c,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'row-'+(++counter),cacheDraft:(k,v)=>cache[k]=v};
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));render();await new Promise(r=>setImmediate(r));};
 try{row=createKanaRow(options);v3=createV3(options);await body({c,row,cache,messages,click,render,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return ()=>{held=null;release();};},change:value=>{for(const f of listeners.get('change')||[])f({target:{dataset:{rowPicker:''},value}});}});}finally{row?.dispose();v3?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
test('visible cell cues update week and dictation draft/cache without attempts; refresh closes just the guide',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-304d',dimension:'recognition',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'h-304d',id:'ink',time});h.render();assert(!h.c.state.v3.kanaHints);
 await h.click({rowAction:'select',rowId:'h-2',rowTarget:'h-304d'});assert(h.c.state.v3.kanaHints['h-304d']);assert(readDictation(h.c.state,'h-304d').meta.hinted);assert(Object.keys(h.cache).length);assert(h.c.state.v3.sessions[0].hints.includes('kc:check:h-304d:pair'));assert.equal(h.c.state.attempts.length,1);
 h.c.state=parseBackup(exportBackup(h.c.state));h.c.session={};h.render();assert.equal(h.c.session.kanaRow.revealed,false);assert.equal(h.c.state.attempts.length,1);
}));
test('stale row/cell/round actions are ignored; pending resumes the original half and hides the grid',async()=>run(async h=>{
 await h.click({rowAction:'start',rowId:'h-3',rowRound:'h-3-a'});await h.click({rowAction:'select',rowId:'h-2',rowTarget:'h-3055'});assert.equal(h.c.state.v3.sessions.length,0);assert.equal(h.c.session.kanaRow.revealed,false);
 await h.click({rowAction:'start',rowId:'h-2',rowRound:'h-3-a'});assert.equal(h.c.state.v3.sessions.length,0);await h.click({rowAction:'start',rowId:'h-2',rowRound:'h-2-b'});assert(location.hash.includes('row-1'));location.hash='kana-row/h-2';await h.click({rowAction:'select',rowId:'h-2',rowTarget:'h-304d'});assert.equal(h.c.session.kanaRow.revealed,false);await h.click({rowAction:'start',rowId:'h-2',rowRound:'h-2-a'});assert.equal(h.c.state.v3.sessions.length,1);assert.equal(h.c.state.v3.sessions[0].reference,'h-2-b');
 location.hash='kana-row/h-2';h.change('bad');assert.equal(location.hash,'#kana-row/h-2');h.change('k-8');assert.equal(location.hash,'#kana-row/k-8');
}));
test('close guide changes no score and failures retain exportable exposure; delayed start cannot hijack another page',async()=>run(async h=>{
 await h.click({rowAction:'select',rowId:'h-2',rowTarget:'h-304d'});await h.click({rowAction:'hide',rowId:'h-2'});assert.equal(h.c.session.kanaRow.revealed,false);assert.equal(h.c.state.attempts.length,0);
 const release=h.hold(),pending=h.click({rowAction:'start',rowId:'h-2',rowRound:'h-2-a'});location.hash='kana-path';release();await pending;assert.equal(location.hash,'#kana-path');assert.equal(h.c.state.v3.sessions.length,1);
 location.hash='kana-row/h-3';h.fail();await h.click({rowAction:'select',rowId:'h-3',rowTarget:'h-3055'});assert(h.messages.includes('quota'));assert(parseBackup(exportBackup(h.c.state)).v3.kanaHints['h-3055']);
}));
