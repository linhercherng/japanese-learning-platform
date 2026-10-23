import test from 'node:test';import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';
import {startJlptRound} from '../app/core/jlpt-memory.mjs';
import {createV3} from '../app/v3.mjs';
const time='2026-10-23T02:00:00.000Z',flush=()=>new Promise(r=>setImmediate(r));
function setup(initial=initialState(),mode='normal'){
 const previous={document:globalThis.document,location:globalThis.location},listeners=new Map(),session={},errors=[];let state=initial,updates=0,renders=0,waiting=null,counter=0;
 globalThis.location={hash:'#home'};globalThis.document={addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:()=>{},querySelector:()=>null};
 const controller=createV3({getState:()=>state,getContext:()=>({state,session}),update:async fn=>{updates++;if(mode==='fail')throw Error('保存失敗');if(mode==='delay')await new Promise(r=>waiting=r);state=fn(structuredClone(state));},toast:x=>errors.push(x),render:()=>renders++,now:()=>time,id:()=>`new-${++counter}`,cacheDraft:()=>{}});
 return {click:action=>listeners.get('click')({target:{closest:()=>({dataset:{v3Action:action},isConnected:true})}}),set:s=>state=s,resume:()=>waiting?.(),get state(){return state;},get updates(){return updates;},get renders(){return renders;},errors,close(){controller.dispose();globalThis.document=previous.document;globalThis.location=previous.location;}};
}
test('refresh recommendation only redraws; it does not write state or create a daily plan',async()=>{const h=setup();try{const before=structuredClone(h.state);h.click('refresh-home');await flush();assert.equal(h.updates,0);assert.equal(h.renders,1);assert.deepEqual(h.state,before);}finally{h.close();}});
test('stale create-plan actions resume a pending original without adding or replacing plans',async()=>{const s=startJlptRound(initialState(),{unitId:'N2-01',mode:'memory',id:'original',time}),h=setup(s);try{const before=structuredClone(s);h.click('create-plan');await flush();assert.equal(globalThis.location.hash,'v3-practice/original');assert.deepEqual(h.state,before);}finally{h.close();}});
test('pending work appearing while a create-plan save is queued is checked inside the transaction',async()=>{const h=setup(initialState(),'delay');try{h.click('extra-plan');await flush();h.set(startJlptRound(h.state,{unitId:'N5-01',mode:'memory',id:'queued-original',time}));h.resume();await flush();assert.equal(globalThis.location.hash,'v3-practice/queued-original');assert.equal(h.state.v3.dailyPlans.length,0);}finally{h.close();}});
test('failed plan save does not navigate or discard original state',async()=>{const h=setup(initialState(),'fail');try{h.click('create-plan');await flush();assert.equal(globalThis.location.hash,'#home');assert.equal(h.state.v3.dailyPlans.length,0);assert.deepEqual(h.errors,['保存失敗']);}finally{h.close();}});
test('leaving home during a save preserves the saved plan without stealing the new route',async()=>{const h=setup(initialState(),'delay');try{h.click('create-plan');await flush();globalThis.location.hash='#courses';h.resume();await flush();assert.equal(h.state.v3.dailyPlans.length,1);assert.equal(globalThis.location.hash,'#courses');}finally{h.close();}});
