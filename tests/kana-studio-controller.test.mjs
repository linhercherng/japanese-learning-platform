import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {createKanaStudio} from '../app/kana-studio.mjs';
import {readDictation,dictationKey} from '../app/core/kana-studio.mjs';
import {createV3} from '../app/v3.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const item='h-306c',time='2026-10-21T06:00:00.000Z',points=[[{x:.2,y:.3},{x:.6,y:.8}]];
async function harness(run){
 const oldDoc=globalThis.document,oldLocation=globalThis.location,listeners=new Map(),cached={},errors=[],c={state:initialState(),session:{},strokes:{'0306c':['M10 10 L90 90']}},inputs={};let count=0,controller,v3,padChange,padPoints=[],fail=false;
 let hash='#kana-studio';globalThis.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;}};globalThis.document={addEventListener:(n,f)=>listeners.set(n,[...(listeners.get(n)||[]),f]),removeEventListener:(n,f)=>listeners.set(n,(listeners.get(n)||[]).filter(x=>x!==f)),querySelector:s=>s==='#studio-canvas'?{}:inputs[s]||null};
 const context=()=>({...c,state:{...c.state,drafts:{...c.state.drafts,...cached}}});
 const options={getState:()=>c.state,getContext:context,update:async fn=>{c.state=fn(structuredClone(c.state));if(fail)throw Error('quota failure');},render:()=>{},toast:m=>errors.push(m),now:()=>time,id:()=>`test-${++count}`,cacheDraft:(k,v)=>{if(v===null)delete cached[k];else cached[k]=v;},attachPad:(canvas,initial,onChange)=>{padPoints=initial;padChange=onChange;return {points:()=>padPoints,dispose:()=>{},undo:()=>{},clear:()=>{padPoints=[];onChange([]);}};}};
 const click=async dataset=>{const button={dataset,disabled:false,isConnected:true};for(const f of listeners.get('click')||[])f({target:{closest:()=>button}});await new Promise(r=>setImmediate(r));};
 try{controller=createKanaStudio(options);v3=createV3(options);await run({c,context,controller,v3,click,inputs,errors,fail:()=>{fail=true;},ink:()=>{padPoints=points;padChange(points);}});}finally{controller?.dispose();v3?.dispose();globalThis.document=oldDoc;globalThis.location=oldLocation;}
}
test('passively viewed fading cues stay hinted after switching directly to audio-only',async()=>harness(async h=>{
 h.controller.views['kana-fade'](item);h.controller.afterRender('kana-fade',item);await new Promise(r=>setImmediate(r));
 await h.click({studioAction:'stage',studioItem:item,studioStage:'3'});await h.click({studioAction:'start',studioItem:item});
 assert.equal(readDictation(h.c.state,item).meta.hinted,true);
}));
test('dictation lock and hint survive failed storage in the exact export context',async()=>harness(async h=>{
 await h.click({studioAction:'start',studioItem:item});h.controller.afterRender('kana-dictation',item);h.ink();await new Promise(r=>setImmediate(r));
 h.fail();await h.click({studioAction:'hint',studioItem:item});assert.equal(readDictation(parseBackup(exportBackup(h.context().state)),item).meta.hinted,true);
 await h.click({studioAction:'lock',studioItem:item});const restored=parseBackup(exportBackup(h.context().state));assert.equal(readDictation(restored,item).meta.stage,'locked');assert.deepEqual(readDictation(restored,item).points,points);assert(h.errors.includes('quota failure'));
}));
test('controller locks in-progress ink, saves once and runs three stable life-word questions through backup',async()=>harness(async h=>{
 h.c.state.drafts[`write:${item}`]={text:'',points,time};await h.click({studioAction:'start',studioItem:item});h.controller.afterRender('kana-dictation',item);h.ink();
 await h.click({studioAction:'lock',studioItem:item});assert.equal(readDictation(h.context().state,item).meta.stage,'locked');
 for(const s of ['#studio-shape','#studio-order','#studio-confirm'])h.inputs[s]={checked:true};
 await h.click({studioAction:'save',studioItem:item,studioTask:'test-1'});assert.equal(h.c.state.artifacts.length,1);assert.equal(h.c.state.attempts.length,1);assert(!h.context().state.drafts[dictationKey(item)]);assert.deepEqual(h.c.state.drafts[`write:${item}`].points,points);
 await h.click({studioAction:'words-start',studioItem:item});let session=h.c.state.v3.sessions[0];assert.equal(session.source,'kana-words');assert.equal(session.questionIds.length,3);
 await h.click({studioAction:'words-start',studioItem:item});assert.equal(h.c.state.v3.sessions.length,1);
 let steps=0;while(!session.completedAt){assert(steps++<8);const q=resolveLearningQuestion(session.queue[session.cursor].questionId);if(!session.answers[q.id]){h.inputs['#v3-answer']={value:q.accepted[0]};await h.click({v3Action:'submit-text'});}await h.click({v3Action:'next'});h.c.state=parseBackup(exportBackup(h.c.state));h.controller.validateCatalog(h.c.state);h.v3.validateCatalog(h.c.state);session=h.c.state.v3.sessions[0];}
 assert.equal(Object.keys(session.answers).length,3);assert.match(h.v3.views['v3-practice'](session.id),/kana-words/);assert.equal(h.errors.length,1);assert.match(h.errors[0],/自評已保存/);
}));
