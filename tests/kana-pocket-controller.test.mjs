import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaSixth} from '../app/kana-sixth.mjs';import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {setPocket,pocketItems} from '../app/core/kana-pocket.mjs';import {startWeekCheck} from '../app/core/kana-recall.mjs';import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
const time='2026-10-22T14:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-flip/h-3042',tick=0,controller,held=null,fail=false;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:()=>null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');controller.views[name]?.(param);controller.afterRender(name,param);};
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));};
 try{controller=createKanaSixth({getContext:()=>c,render,toast:m=>messages.push(m),now:()=>new Date(Date.parse(time)+tick++).toISOString(),id:()=>'pocket-'+tick,cacheDraft:(k,v)=>cache[k]=v,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');}});await body({c,controller,cache,messages,click,render,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return ()=>{held=null;release();};}});}finally{controller?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
const pocketAction=(r,action)=>({sixAction:action,pocketRound:r.key,sixIndex:String(r.cursor),sixItem:r.queue[r.cursor]});
test('original flip only saves still-unfamiliar cards after reveal; backup refresh preserves membership but closes the pocket round',async()=>run(async h=>{
 h.render();await h.click({sixAction:'flip-again',sixIndex:'0',sixItem:'h-3042'});assert.equal(pocketItems(h.c.state).length,0);
 await h.click({sixAction:'flip-reveal',sixIndex:'0',sixItem:'h-3042'});await h.click({sixAction:'flip-again',sixIndex:'0',sixItem:'h-3042'});assert.equal(pocketItems(h.c.state)[0].id,'h-3042');assert.equal(h.c.state.attempts.length,0);
 h.c.state=parseBackup(exportBackup(h.c.state));h.c.session={};location.hash='kana-pocket';h.render();assert(!h.c.session.kanaPocketRound);await h.click({sixAction:'pocket-start'});assert.deepEqual(h.c.session.kanaPocketRound.queue,['h-3042']);assert.equal(h.c.session.kanaPocketRound.revealed,false);
}));
test('pocket reveal synchronizes real cue exposures to week and writing cache; explicit removal leaves first-answer history intact',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-3042',dimension:'recognition',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'h-3042',id:'ink',time});h.c.state=setPocket(h.c.state,'h-3042',true,time);
 location.hash='kana-pocket';await h.click({sixAction:'pocket-start'});let r=h.c.session.kanaPocketRound;assert(h.c.state.v3.kanaHints['h-3042']);assert(readDictation(h.c.state,'h-3042').meta.hinted);assert(Object.keys(h.cache).length);assert(h.c.state.v3.sessions[0].hints.includes('kc:check:h-3042:pair'));
 await h.click(pocketAction(r,'pocket-remove'));assert.equal(pocketItems(h.c.state).length,1);await h.click(pocketAction(r,'pocket-reveal'));r=h.c.session.kanaPocketRound;await h.click(pocketAction(r,'pocket-remove'));assert.equal(pocketItems(h.c.state).length,0);assert.equal(h.c.session.kanaPocketRound.cursor,1);assert.equal(h.c.state.attempts.length,1);assert.equal(h.c.state.attempts[0].hinted,false);
}));
test('stale round, item and cursor actions are ignored; choices cannot race and delayed save does not advance after leaving',async()=>run(async h=>{
 for(const item of ['h-3042','k-30a2'])h.c.state=setPocket(h.c.state,item,true,time);location.hash='kana-pocket';await h.click({sixAction:'pocket-start'});const r=h.c.session.kanaPocketRound;
 await h.click({...pocketAction(r,'pocket-reveal'),pocketRound:'old'});await h.click({...pocketAction(r,'pocket-reveal'),sixItem:'h-3044'});assert.equal(r.revealed,false);await h.click(pocketAction(r,'pocket-reveal'));
 const release=h.hold(),saving=h.click(pocketAction(r,'pocket-keep'));await h.click(pocketAction(r,'pocket-remove'));location.hash='kana-path';release();await saving;assert.equal(location.hash,'#kana-path');assert.equal(r.cursor,0);assert(h.c.state.v3.kanaPocket['h-3042'].active);
}));
test('failed original-flip save remains exportable and does not advance or report completion',async()=>run(async h=>{
 h.render();await h.click({sixAction:'flip-reveal',sixIndex:'0',sixItem:'h-3042'});h.fail();await h.click({sixAction:'flip-again',sixIndex:'0',sixItem:'h-3042'});assert(h.messages.includes('quota'));assert(parseBackup(exportBackup(h.c.state)).v3.kanaPocket['h-3042'].active);assert.equal(h.c.session.kanaFlip.cursor,0);
}));
test('failed pocket removal retains an exportable tombstone and keeps the current card open',async()=>run(async h=>{
 h.c.state=setPocket(h.c.state,'h-3042',true,time);location.hash='kana-pocket';await h.click({sixAction:'pocket-start'});const r=h.c.session.kanaPocketRound;await h.click(pocketAction(r,'pocket-reveal'));h.fail();await h.click(pocketAction(r,'pocket-remove'));
 assert(h.messages.includes('quota'));assert.equal(h.c.session.kanaPocketRound.cursor,0);assert(h.c.session.kanaPocketRound.revealed);assert.equal(parseBackup(exportBackup(h.c.state)).v3.kanaPocket['h-3042'].active,false);assert.equal(h.c.state.attempts.length,0);
}));
