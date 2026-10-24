import test from 'node:test';import assert from 'node:assert/strict';
import {createLifeMemory} from '../app/life-memory.mjs';import {createV3} from '../app/v3.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {pendingLife,memoryQuestions,startLifeMemory} from '../app/core/life-memory.mjs';
import {lifeCueSeen} from '../app/core/life-memory-state.mjs';
const time='2026-10-22T02:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),c={state:initialState(),session:{}},messages=[],cache={},focused=[];let hash='#life-memory/L07',tick=0,counter=0,held=null,fail=false,life,v3;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};
 globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:selector=>selector.startsWith('[data-life-')?{focus:options=>focused.push({selector,options})}:null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');v3.onRoute(name,param);(life.views[name]||v3.views[name])?.(param);life.afterRender(name,param);v3.afterRender(name,param);};
 const options={getState:()=>c.state,getContext:()=>c,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>new Date(Date.parse(time)+tick++).toISOString(),id:()=>'life-'+(++counter),cacheDraft:(k,v)=>cache[k]=v};
 const flush=()=>new Promise(r=>setImmediate(r));
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await flush();render();await flush();};
 const emit=async(n,target)=>{for(const f of listeners.get(n)||[])f({target});await flush();};
 try{life=createLifeMemory(options);v3=createV3(options);await body({c,life,v3,messages,focused,render,click,emit,flush,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return()=>{held=null;release();};}});}finally{life?.dispose();v3?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
const start={lifeAction:'start',lifeUnit:'L07'},card={lifeAction:'reveal',lifeUnit:'L07',lifeCard:'0'};
test('Chinese-only cards and normal listening replay do not count as reference; reveal and phrase audio do',async()=>run(async h=>{
 h.render();await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);await h.click({...card,lifeUnit:'L01'});assert.equal(h.c.state.v3.lifeHints,undefined);
 await h.click(card);assert(h.c.state.v3.lifeHints['L07-v2-q1']);assert.equal(h.c.state.attempts.length,0);
 h.c.state=initialState();h.c.session={};await h.click({...card,lifeAction:'audio'});assert(h.c.state.v3.lifeHints['L07-v2-q2']);
 h.c.state=initialState();h.c.session={};await h.click(start);await h.click({audio:'normal question stimulus'});assert.equal(h.c.state.v3.lifeHints,undefined);
}));
test('one first answer persists through refresh, feedback does not rewrite it, next question retains the fixed V3 queue',async()=>run(async h=>{
 await h.click(start);const p=pendingLife(h.c.state),q=memoryQuestions('L07')[0];await h.click({v3Choice:String(q.correct)});assert.equal(h.c.state.attempts.length,1);assert.equal(h.c.state.attempts[0].hinted,false);const first=structuredClone(h.c.state.attempts[0]);assert(h.c.state.v3.lifeHints[q.id]);assert(!lifeCueSeen(h.c.state.v3.lifeHints,q.id,p.createdAt,first.time));
 h.c.state=parseBackup(exportBackup(h.c.state));h.c.session={};h.render();await h.click({v3Choice:'1'});assert.deepEqual(h.c.state.attempts[0],first);assert.equal(h.c.state.attempts.length,1);await h.click({v3Action:'next'});assert.equal(pendingLife(h.c.state).cursor,1);assert.equal(pendingLife(h.c.state).queue.length,3);
}));
test('same-day preparation and explicit question hints remain separate from original first answers',async()=>run(async h=>{
 await h.click(card);await h.click(start);await h.click({v3Action:'hint'});const q=memoryQuestions('L07')[0];await h.click({v3Choice:String(q.correct)});assert(h.c.state.attempts[0].hinted);assert.equal(h.c.state.attempts.length,1);assert.equal(pendingLife(h.c.state).questionIds.length,3);
}));
test('rapid starts share a pending round; stale routes/cards and delayed navigation cannot change the current page',async()=>run(async h=>{
 const release=h.hold();await h.click(start);await h.click(start);assert.equal(h.c.state.v3.sessions.length,1);location.hash='topics';release();await h.flush();assert.equal(location.hash,'#topics');await h.click(start);assert.equal(location.hash,'#topics');await h.click(card);assert.equal(h.c.state.v3.lifeHints,undefined);
 location.hash='life-memory/L01';await h.click({lifeAction:'start',lifeUnit:'L01'});assert.equal(location.hash,'#v3-practice/life-1');assert.equal(h.c.state.v3.sessions.length,1);
}));
test('failed new start stays on source route and remains exportable without fake saved success',async()=>run(async h=>{
 h.fail();await h.click(start);assert.equal(location.hash,'#life-memory/L07');assert(h.messages.includes('quota'));assert.equal(pendingLife(parseBackup(exportBackup(h.c.state))).reference,'L07');
}));
test('original study exposure marks only visible references; writing requires opened sample, recall tab stays clean',async()=>run(async h=>{
 location.hash='study/L07';h.c.session.studyTab='recall';h.life.afterRender('study','L07');await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);
 h.c.session.studyTab='write';h.life.afterRender('study','L07');await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);
 await h.emit('toggle',{open:false,dataset:{lifeReference:'L07'}});assert.equal(h.c.state.v3.lifeHints,undefined);
 await h.emit('toggle',{open:true,dataset:{lifeReference:'L01'}});assert.equal(h.c.state.v3.lifeHints,undefined);
 await h.emit('toggle',{open:true,dataset:{lifeReference:'L07'}});assert(h.c.state.v3.lifeHints['L07-v2-q1']);
 h.c.state=initialState();h.c.session.studyTab='read';h.life.afterRender('study','L07');await h.flush();assert(h.c.state.v3.lifeHints['L07-q0']);
 h.c.state=initialState();location.hash='study/S-N5-food';h.c.session.studyTab='learn';h.life.afterRender('study','S-N5-food');await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);
}));
test('life controller delegates V2 feedback to the shared save-before-reveal barrier',async()=>run(async h=>{
 const q=memoryQuestions('L07')[0];h.c.state.practice={questionIds:[q.id],index:0,answers:{[q.id]:{value:0,correct:true,hinted:false,time}},hints:[]};location.hash='practice';h.life.afterRender('practice');await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);
}));
test('revealing and covering a card restores the same keyboard focus without scrolling',async()=>run(async h=>{
 await h.click(card);assert(h.focused.at(-1).selector.includes('[data-life-card="0"]'));assert.deepEqual(h.focused.at(-1).options,{preventScroll:true});await h.click(card);assert(h.focused.at(-1).selector.includes('[data-life-action="reveal"]'));assert.deepEqual(h.c.session.lifeMemory.revealed,[]);
}));

test('failed life card reference remains covered and preserves first answers',async()=>run(async h=>{const before=structuredClone(h.c.state.attempts);h.fail();await h.click(card);assert(!h.c.session.lifeMemory?.revealed?.includes(0));assert.deepEqual(h.c.state.attempts,before);}));

test('returning directly to the V1 think tab does not count necessary question text as reference',()=>run(async h=>{h.c.session.lessonTab='想一想';location.hash='lesson/L01';h.life.afterRender('lesson','L01');await h.flush();assert.equal(h.c.state.v3.lifeHints,undefined);}));
