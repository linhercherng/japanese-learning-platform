import test from 'node:test';import assert from 'node:assert/strict';
import * as controller from '../app/life-cards.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';import {pendingLife,startLifeMemory,memoryPhrases} from '../app/core/life-memory.mjs';import {memoryQuestionIds} from '../app/content/life-memory-ids.mjs';
const time='2026-10-23T03:00:00.000Z';
async function run(body){const prev={document:globalThis.document,location:globalThis.location},listeners=new Map(),c={state:initialState(),session:{}},messages=[],plays=[];let hash='#life-cards/L07',held=null,fail=false,cards;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),querySelector:()=>({focus(){}})};
 const flush=()=>new Promise(r=>setImmediate(r));const render=()=>{const [name,param]=hash.slice(1).split('/');cards.onRoute(name,param);cards.views[name]?.(param);cards.afterRender(name,param);};
 const click=async extra=>{const local=c.session.lifeCards||{},dataset={lifeCardsUnit:'L07',lifeCardsRun:String(local.run),lifeCardsCursor:String(local.round?.cursor),...extra};listeners.get('click')?.({target:{closest:()=>({dataset,isConnected:true,disabled:false})}});await flush();};
 try{assert.equal(typeof controller.createLifeCardsController,'function');cards=controller.createLifeCardsController({getContext:()=>c,update:async f=>{c.state=f(c.state);await held;if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'three-original',play:async(text,rate)=>plays.push({text,rate})});render();await body({c,cards,render,click,flush,messages,plays,fail:()=>fail=true,hold:()=>{let release;held=new Promise(r=>release=r);return()=>{held=null;release();};}});}finally{cards?.dispose();globalThis.document=prev.document;globalThis.location=prev.location;}
}
const start=h=>h.click({lifeCardsAction:'start',lifeCardsMode:'meaning'});
const reveal=h=>h.click({lifeCardsAction:'reveal'});
const rate=h=>h.click({lifeCardsAction:'rate',lifeCardsRating:'remember'});
async function finish(h){await start(h);for(let i=0;i<3;i++){await reveal(h);await rate(h);}}
test('showing only the Chinese front creates no exposure; revealing records the original unit once, never attempts',async()=>run(async h=>{
 await start(h);assert.equal(h.c.state.v3.lifeHints,undefined);assert.equal(h.c.state.attempts.length,0);await reveal(h);assert.equal(h.c.session.lifeCards.round.revealed,true);assert.equal(Object.keys(h.c.state.v3.lifeHints).length,8);assert.equal(h.c.state.attempts.length,0);assert.equal(parseBackup(exportBackup(h.c.state)).v3.sessions.length,0);
 await h.click({lifeCardsAction:'audio',lifeCardsRate:'0.75'});assert.deepEqual(h.plays,[{text:memoryPhrases('L07')[0].jp,rate:0.75}]);
}));
test('sound can play the exact original before reveal, while hidden meaning cards cannot play',async()=>run(async h=>{
 await start(h);await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});assert.equal(h.plays.length,0);assert.equal(h.c.state.v3.lifeHints,undefined);await h.click({lifeCardsAction:'reset'});await h.click({lifeCardsAction:'start',lifeCardsMode:'sound'});await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});assert.equal(h.plays[0].text,memoryPhrases('L07')[0].jp);assert.equal(h.c.session.lifeCards.round.revealed,false);assert.equal(Object.keys(h.c.state.v3.lifeHints).length,8);
}));
test('stale run and cursor events cannot reveal or rate a different phrase; leaving and returning hides references',async()=>run(async h=>{
 await start(h);const oldRun=String(h.c.session.lifeCards.run);await reveal(h);await rate(h);await h.click({lifeCardsAction:'reveal',lifeCardsCursor:'0'});assert.equal(h.c.session.lifeCards.round.revealed,false);
 await h.click({lifeCardsAction:'reset'});await start(h);await h.click({lifeCardsAction:'reveal',lifeCardsRun:oldRun});assert.equal(h.c.session.lifeCards.round.revealed,false);location.hash='life-map';h.render();location.hash='life-cards/L07';h.render();assert.equal(h.c.session.lifeCards.round,null);
}));
test('failed exposure stays hidden and does not play, while the unsaved hint candidate remains exportable',async()=>run(async h=>{
 await start(h);h.fail();await reveal(h);assert.equal(h.c.session.lifeCards.round.revealed,false);assert(h.messages.includes('quota'));assert.equal(Object.keys(parseBackup(exportBackup(h.c.state)).v3.lifeHints).length,8);await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});assert.equal(h.plays.length,0);
}));
test('delayed reveal cannot pull a learner back or expose another visit to the same route',async()=>run(async h=>{
 await start(h);const release=h.hold();await reveal(h);location.hash='life-map';h.render();location.hash='life-cards/L07';h.render();release();await h.flush();assert.equal(h.c.session.lifeCards.round,null);assert.equal(location.hash,'#life-cards/L07');assert.equal(h.plays.length,0);
}));
test('finish starts the saved original three-question source, not a self-rating score, and shares pending',async()=>run(async h=>{
 await finish(h);assert.equal(h.c.state.v3.sessions.length,0);await h.click({lifeCardsAction:'practice'});const s=pendingLife(h.c.state);assert.equal(s.source,'life-memory');assert.deepEqual(s.questionIds,memoryQuestionIds('L07'));assert.equal(location.hash,'#v3-practice/three-original');assert.equal(h.c.state.attempts.length,0);
}));
test('another life pending blocks all reference actions and stale practice resumes its original UUID',async()=>run(async h=>{
 await finish(h);h.c.state=startLifeMemory(h.c.state,{unitId:'L01',id:'existing',time});await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});assert.equal(h.plays.length,0);await h.click({lifeCardsAction:'practice'});assert.equal(location.hash,'#v3-practice/existing');assert.equal(h.c.state.v3.sessions.length,1);
}));
test('rapid practice clicks create one pending and a delayed save does not navigate after leaving',async()=>run(async h=>{
 await finish(h);const release=h.hold();await h.click({lifeCardsAction:'practice'});await h.click({lifeCardsAction:'practice'});assert.equal(h.c.state.v3.sessions.length,1);location.hash='life-map';h.render();release();await h.flush();assert.equal(location.hash,'#life-map');
}));
test('practice save failure keeps the source page and an exportable original pending candidate',async()=>run(async h=>{
 await finish(h);h.fail();await h.click({lifeCardsAction:'practice'});assert.equal(location.hash,'#life-cards/L07');assert(h.messages.includes('quota'));const s=pendingLife(parseBackup(exportBackup(h.c.state)));assert.equal(s.source,'life-memory');assert.deepEqual(s.questionIds,memoryQuestionIds('L07'));
}));
test('failed or stale delayed sound exposure cannot start playback',async()=>run(async h=>{
 await h.click({lifeCardsAction:'start',lifeCardsMode:'sound'});const release=h.hold();await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});location.hash='life-map';h.render();release();await h.flush();assert.equal(h.plays.length,0);
 location.hash='life-cards/L07';h.render();await h.click({lifeCardsAction:'start',lifeCardsMode:'sound'});h.fail();await h.click({lifeCardsAction:'audio',lifeCardsRate:'1'});assert.equal(h.plays.length,0);assert(h.messages.includes('quota'));
}));
test('rapid reveal and rating while exposure is saving do not advance the card',async()=>run(async h=>{
 await start(h);const release=h.hold();await reveal(h);await rate(h);await reveal(h);assert.equal(h.c.session.lifeCards.round.cursor,0);assert.equal(h.c.session.lifeCards.round.revealed,false);release();await h.flush();assert.equal(h.c.session.lifeCards.round.revealed,true);assert.equal(h.c.state.attempts.length,0);
}));
