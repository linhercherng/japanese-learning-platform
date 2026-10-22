import test from 'node:test';import assert from 'node:assert/strict';
import {createKanaSixth} from '../app/kana-sixth.mjs';import {createV3} from '../app/v3.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {startWeekCheck} from '../app/core/kana-recall.mjs';import {startDictation,readDictation} from '../app/core/kana-studio.mjs';
import {duelQuestions} from '../app/content/kana-sixth.mjs';
const time='2026-10-22T02:00:00.000Z';
async function run(body){const old={document:globalThis.document,location:globalThis.location},listeners=new Map(),cache={},c={state:initialState(),session:{}},messages=[];let hash='#kana-flip/h-3042',counter=0,six,v3,fail=false;
 globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:()=>null};
 const render=()=>{const [name,param]=hash.slice(1).split('/');v3.onRoute(name,param);(six.views[name]||v3.views[name])?.(param);six.afterRender(name,param);v3.afterRender(name,param);};
 const options={getState:()=>c.state,getContext:()=>c,update:async f=>{c.state=f(c.state);if(fail)throw Error('quota');},render,toast:m=>messages.push(m),now:()=>time,id:()=>'six-'+(++counter),cacheDraft:(k,v)=>cache[k]=v};
 const click=async dataset=>{for(const f of listeners.get('click')||[])f({target:{closest:()=>({dataset,disabled:false,isConnected:true})}});await new Promise(r=>setImmediate(r));render();await new Promise(r=>setImmediate(r));};
 try{six=createKanaSixth(options);v3=createV3(options);await body({c,six,v3,cache,messages,click,render,fail:()=>fail=true});}finally{six?.dispose();v3?.dispose();globalThis.document=old.document;globalThis.location=old.location;}
}
test('flip reveals are guided exposure, stale buttons cannot skip a new card, and refresh drops only the transient round',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-3042',dimension:'listening',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});h.c.state=startDictation(h.c.state,{item:'h-3042',id:'ink',time});h.render();
 assert(h.c.state.v3.sessions[0].hints.includes('kc:check:h-3042:listen'));assert(readDictation(h.c.state,'h-3042').meta.hinted);assert(Object.keys(h.cache).length);
 await h.click({sixAction:'flip-next',sixItem:'h-3042',sixIndex:'0'});assert.equal(h.c.session.kanaFlip.cursor,0);
 await h.click({sixAction:'flip-reveal',sixItem:'h-3042',sixIndex:'0'});await h.click({sixAction:'flip-again',sixItem:'h-3042',sixIndex:'0'});assert.equal(h.c.session.kanaFlip.queue.length,4);assert.equal(h.c.session.kanaFlip.cursor,1);
 await h.click({sixAction:'flip-next',sixItem:'h-3042',sixIndex:'0'});assert.equal(h.c.session.kanaFlip.cursor,1);assert.equal(h.c.state.attempts.length,1);
 const backup=parseBackup(exportBackup(h.c.state));h.c.state=backup;h.c.session={};h.render();assert.equal(h.c.session.kanaFlip.cursor,0);assert.equal(h.c.state.attempts.length,1);
}));
test('duel feedback exposes the other glyph in an outstanding week round and preserves first answers',async()=>run(async h=>{
 h.c.state=recordAnswer(h.c.state,{id:'old',item:'h-3081',dimension:'listening',correct:true,hinted:false,time:'2026-10-01T00:00:00Z'});h.c.state=startWeekCheck(h.c.state,{id:'week',time});location.hash='kana-duel/nu-me';await h.click({sixAction:'duel-start',sixPair:'nu-me'});
 const s=h.c.state.v3.sessions.find(s=>s.source==='kana-duel'),q=duelQuestions.find(q=>q.id===s.questionIds[0]);await h.click({v3Choice:String(q.correct)});
 assert(h.c.state.v3.sessions.find(s=>s.id==='week').hints.includes('kc:check:h-3081:listen'));assert(h.c.state.v3.kanaHints['h-3081']);assert.equal(h.c.state.v3.sessions.find(p=>p.id===s.id).answers[q.id].hinted,false);
 assert(h.c.state.v3.sessions.find(p=>p.id===s.id).answers[q.id].correct);h.c.state=parseBackup(exportBackup(h.c.state));location.hash='kana-duel/nu-me';await h.click({sixAction:'duel-start',sixPair:'nu-me'});assert.equal(h.c.state.v3.sessions.filter(s=>s.source==='kana-duel').length,1);
}));
test('comparison exposure remains exportable on failed storage and never invents an answer',async()=>run(async h=>{
 location.hash='kana-duel/shi-tsu';h.fail();await h.click({sixAction:'duel-compare',sixPair:'shi-tsu'});assert(h.messages.includes('quota'));assert(h.c.state.v3.kanaHints['k-30b7']);assert(h.c.state.v3.kanaHints['k-30c4']);assert.equal(h.c.state.attempts.length,0);assert(parseBackup(exportBackup(h.c.state)).v3.kanaHints['k-30b7']);
}));
test('completed flip can restart the same first card directly, while a stale result button cannot reset a new round',async()=>run(async h=>{
 h.render();const r=h.c.session.kanaFlip;r.cursor=r.queue.length;r.needs=['h-3042'];await h.click({sixAction:'flip-review',sixStart:'h-3042'});assert.equal(h.c.session.kanaFlip.cursor,0);assert.equal(h.c.session.kanaFlip.key,'h-3042');
 await h.click({sixAction:'flip-reveal',sixItem:'h-3042',sixIndex:'0'});await h.click({sixAction:'flip-next',sixItem:'h-3042',sixIndex:'0'});await h.click({sixAction:'flip-review',sixStart:'h-3042'});assert.equal(h.c.session.kanaFlip.cursor,1);
}));
