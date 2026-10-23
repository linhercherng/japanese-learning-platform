import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {lifeMemoryUnits,memoryQuestions,memoryPhrases,pendingLife,startLifeMemory,lifeCheckCandidates,startLifeCheck,lifeCheckReport,validateLifeCatalog} from '../app/core/life-memory.mjs';
import {recordLifeExposure,lifeCueSeen} from '../app/core/life-memory-state.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question,beginV3Session} from '../app/core/v3-learning.mjs';
import {questionById} from '../app/content/catalog.mjs';
const yesterday='2026-10-21T02:00:00.000Z',today='2026-10-22T02:00:00.000Z',later='2026-10-23T02:00:00.000Z';
function answer(state,qid,{time=yesterday,correct=true,hinted=false,id=qid}={}){const q=questionById.get(qid);return recordAnswer(state,{id,item:qid,dimension:q.dimension,correct,hinted,time});}
test('all 92 existing life units have three unique original questions and up to three unique audible phrases',async()=>{
 const audio=JSON.parse(await readFile(new URL('../app/assets/audio.json',import.meta.url)));
 assert.equal(lifeMemoryUnits.length,92);
 for(const unit of lifeMemoryUnits){const qs=memoryQuestions(unit.id),phrases=memoryPhrases(unit.id);assert.equal(qs.length,3,unit.id);assert.equal(new Set(qs.map(q=>q.id)).size,3);assert(qs.some(q=>q.dimension==='listening'));assert(qs.some(q=>['cloze','order'].includes(q.kind)));assert(phrases.length>0&&phrases.length<=3);assert.equal(new Set(phrases.map(p=>p.jp)).size,phrases.length);for(const p of phrases)assert(audio[p.jp],unit.id+': '+p.jp);}
 assert.deepEqual(memoryQuestions('bad'),[]);assert.deepEqual(memoryPhrases('bad'),[]);
});
test('short memory and next-day review share one resumable pending round and preserve backup',()=>{
 let s=startLifeMemory(initialState(),{unitId:'L07',id:'one',time:today});const original=structuredClone(s);
 s=startLifeMemory(s,{unitId:'S-N5-food',id:'two',time:today});assert.deepEqual(s,original);assert.equal(pendingLife(parseBackup(exportBackup(s))).id,'one');
 assert.throws(()=>beginV3Session(s,memoryQuestions('L01').map(q=>q.id),{id:'other',source:'life-memory',reference:'L01',time:today}),/生活/);
 assert.throws(()=>beginV3Session(initialState(),memoryQuestions('L07').map(q=>q.id),{id:'wrong',source:'life-memory',reference:'L01',time:today}),/生活/);
 const bad=structuredClone(s);bad.v3.sessions[0].queue.push({questionId:'L07-q0',repeat:true,sourceId:'L07-q0'});assert.throws(()=>validateState(bad),/生活/);
 validateLifeCatalog(s);
});
test('reference exposure keeps earliest per Taipei day, future dates and old schema backups merge safely',()=>{
 const base=initialState();let a=recordLifeExposure(base,['L07-v2-q1'],today);a=recordLifeExposure(a,['L07-v2-q1'],later);a=recordLifeExposure(a,['L07-v2-q1'],'2026-10-22T01:00:00.000Z');
 assert.deepEqual(a.v3.lifeHints['L07-v2-q1'],['2026-10-22T01:00:00.000Z',later]);assert.deepEqual(base,initialState());
 assert(lifeCueSeen(a.v3.lifeHints,'L07-v2-q1',today,today));assert(!lifeCueSeen(a.v3.lifeHints,'L07-v2-q1',yesterday,yesterday));
 assert(lifeCueSeen(a.v3.lifeHints,'L07-v2-q1',today,'2026-10-22T17:00:00.000Z'));
 const b=recordLifeExposure(initialState(),['L07-v2-q1'],'2026-10-22T00:00:00.000Z');assert.deepEqual(mergeStates(a,b).v3.lifeHints['L07-v2-q1'],['2026-10-22T00:00:00.000Z',later]);
 assert.equal(parseBackup(exportBackup(base)).v3.lifeHints,undefined);assert.deepEqual(parseBackup(exportBackup(a)).v3.lifeHints,a.v3.lifeHints);
 assert.throws(()=>recordLifeExposure(base,['N5-01-G1'],today));assert.throws(()=>recordLifeExposure(base,['L07-fake'],today));
});
test('visible reference affects only new life first answers and never retroactively rewrites an answer',()=>{
 let s=recordLifeExposure(initialState(),memoryQuestions('L07').map(q=>q.id),today);s=startLifeMemory(s,{unitId:'L07',id:'round',time:today});const q=memoryQuestions('L07')[0];
 s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time:today});assert(s.v3.sessions[0].answers[q.id].hinted);const first=structuredClone(s.attempts);
 s=recordLifeExposure(s,[q.id],later);assert.deepEqual(s.attempts,first);
 let no=startLifeMemory(initialState(),{unitId:'L07',id:'plain',time:today});no=recordLifeExposure(no,[q.id],later);no=answerV3Session(no,{sessionId:'plain',question:q,value:q.correct,eventId:'plain-a',time:today});assert.equal(no.v3.sessions[0].answers[q.id].hinted,false);
});
test('next-day uses only earlier-day attempted questions, max three distinct units, excluding today and future attempts',()=>{
 let s=initialState();for(const [i,u] of ['L01','L02','L03','L04'].entries()){for(const q of memoryQuestions(u))s=answer(s,q.id,{correct:i!==0,hinted:i===1});}
 const before=lifeCheckCandidates(s,today);assert.equal(before.length,3);assert.equal(new Set(before.map(q=>q.unitId)).size,3);assert.equal(before[0].unitId,'L01');
 const qid=before[0].id;s=answer(s,qid,{time:today,id:'today'});assert(!lifeCheckCandidates(s,today).some(q=>q.id===qid));
 const frozen=lifeCheckCandidates(s,today).map(q=>q.id);s=answer(s,'L04-q0',{time:later,id:'future',correct:false});assert.deepEqual(lifeCheckCandidates(s,today).map(q=>q.id),frozen);
 assert.deepEqual(lifeCheckCandidates(initialState(),today),[]);assert.deepEqual(startLifeCheck(initialState(),{id:'empty',time:today}),initialState());
});
test('daily check is once per Taipei day; actual cross-day first answers stay separate from corrections and references',()=>{
 let s=answer(initialState(),'L07-v2-q1');s=startLifeCheck(s,{id:'check',time:today});const q=questionById.get('L07-v2-q1');s=answerV3Session(s,{sessionId:'check',question:q,value:q.correct,eventId:'today-answer',time:today});s=nextV3Question(s,'check',today);
 assert.equal(lifeCheckReport(s,'check').independent,1);assert.equal(lifeCheckReport(s,'check').comparable,1);assert.deepEqual(startLifeCheck(s,{id:'duplicate',time:today}),s);
 const other=startLifeCheck(answer(initialState(),'L07-v2-q1'),{id:'other',time:today});assert.throws(()=>mergeStates(s,other),/同日|生活/);
 const malicious=structuredClone(s);malicious.v3.sessions[0].reference='2026-02-31';assert.throws(()=>validateState(malicious));
});
test('next-day report excludes intervening same-question practice, same-time ambiguity and reference-assisted answers',()=>{
 const q=questionById.get('L07-v2-q1');
 for(const kind of ['between','same-time','hint']){
  let s=startLifeCheck(answer(initialState(),q.id),{id:'check-'+kind,time:today});
  if(kind==='between')s=answer(s,q.id,{id:'between',time:'2026-10-22T02:01:00.000Z'});
  if(kind==='same-time')s=answer(s,q.id,{id:'overlap',time:'2026-10-22T02:02:00.000Z'});
  if(kind==='hint')s=recordLifeExposure(s,[q.id],'2026-10-22T02:01:00.000Z');
  s=answerV3Session(s,{sessionId:'check-'+kind,question:q,value:q.correct,eventId:'check-answer',time:'2026-10-22T02:02:00.000Z'});
  const r=lifeCheckReport(s,'check-'+kind);assert.equal(r.comparable,0,kind);assert.equal(r.excluded,1,kind);
 }
});
test('merging earlier visible references rejects contradictory independent first answers without modifying either backup',()=>{
 const q=memoryQuestions('L07')[0];let a=startLifeMemory(initialState(),{unitId:'L07',id:'round',time:today});a=answerV3Session(a,{sessionId:'round',question:q,value:q.correct,eventId:'a',time:'2026-10-22T02:03:00.000Z'});
 const b=recordLifeExposure(initialState(),[q.id],'2026-10-22T02:01:00.000Z'),before=structuredClone(a);assert.throws(()=>mergeStates(a,b),/生活提示/);assert.deepEqual(a,before);
});
test('reference validator rejects malformed arrays, unknown question ids and noncanonical duplicate days',()=>{
 for(const hints of [{'L07-fake':[today]},{'L07-q0':[]},{'L07-q0':[later,today]},{'L07-q0':[today,'2026-10-22T03:00:00.000Z']},{'L07-q0':['no-date']}]){const s=initialState();s.v3.lifeHints=hints;assert.throws(()=>validateState(s));}
});
test('clock rollback rejects contradictory reference before storage and keeps the original backup importable',()=>{
 const q=memoryQuestions('L07')[0];let s=startLifeMemory(initialState(),{unitId:'L07',id:'round',time:today});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'future-answer',time:'2026-10-22T04:00:00.000Z'});
 const before=structuredClone(s);assert.throws(()=>recordLifeExposure(s,[q.id],'2026-10-22T03:00:00.000Z'),/生活提示/);assert.deepEqual(s,before);assert.deepEqual(parseBackup(exportBackup(s)),s);
});
