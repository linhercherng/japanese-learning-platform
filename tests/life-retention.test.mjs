import test from 'node:test';import assert from 'node:assert/strict';
import {lifeWeekSchedule,startLifeWeek,lifeForecast,lifeDailyCompleted} from '../app/core/life-retention.mjs';
import {lifeNextStep} from '../app/core/life-progress.mjs';
import {pendingLife,startLifeMemory,lifeCheckReport,memoryQuestions} from '../app/core/life-memory.mjs';
import {recordLifeExposure,lifeCueSeen} from '../app/core/life-memory-state.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {questionById} from '../app/content/catalog.mjs';
const old='2026-10-16T02:00:00.000Z',today='2026-10-23T02:00:00.000Z',future='2026-10-30T02:00:00.000Z',qid='L07-v2-q1';
const add=(s,id=qid,{time=old,event=id,correct=true,hinted=false,dimension=questionById.get(id).dimension}={})=>recordAnswer(s,{id:event,item:id,dimension,correct,hinted,time});
function finish(s,sid,time){const p=s.v3.sessions.find(s=>s.id===sid);for(const id of p.questionIds){const q=questionById.get(id);s=answerV3Session(s,{sessionId:sid,question:q,value:q.kind==='cloze'?'wrong':q.correct,eventId:sid+id,time});s=nextV3Question(s,sid,time);}return s;}
test('seven-day selection uses Taipei calendar boundary and only actually attempted original questions',()=>{
 let s=add(initialState());assert.equal(lifeWeekSchedule(s,today).questions[0].id,qid);assert.equal(lifeWeekSchedule(s,'2026-10-22T02:00:00.000Z').questions.length,0);assert.equal(lifeWeekSchedule(s,'2026-10-22T02:00:00.000Z').nextDay,'2026-10-23');
 s=add(initialState(),qid,{time:'2026-10-16T15:59:00.000Z'});assert.equal(lifeWeekSchedule(s,'2026-10-22T16:00:00.000Z').questions.length,1);assert.equal(lifeWeekSchedule(initialState(),today).questions.length,0);
});
test('last same-question practice or visible reference postpones readiness; future data does not reorder today',()=>{
 let s=add(initialState());const original=lifeWeekSchedule(s,today);s=add(s,qid,{time:future,event:'future',correct:false});s=recordLifeExposure(s,[qid],future);assert.deepEqual(lifeWeekSchedule(s,today),original);
 s=recordLifeExposure(s,[qid],'2026-10-17T02:00:00.000Z');assert.equal(lifeWeekSchedule(s,today).questions.length,0);assert.equal(lifeWeekSchedule(s,today).nextDay,'2026-10-24');
 s=add(initialState());s=add(s,qid,{event:'recent',time:'2026-10-18T02:00:00.000Z'});assert.equal(lifeWeekSchedule(s,today).nextDay,'2026-10-25');
});
test('weekly round uses max three distinct courses, prioritizes weaknesses and excludes writing self-assessment',()=>{
 let s=initialState();for(const unit of ['L01','L02','L03','L04'])for(const q of memoryQuestions(unit))s=add(s,q.id,{correct:unit!=='L03'});s=add(s,qid,{event:'writing',dimension:'writing',correct:false});const qs=lifeWeekSchedule(s,today).questions;assert.equal(qs.length,3);assert.equal(qs[0].unitId,'L03');assert.equal(new Set(qs.map(q=>q.unitId)).size,3);assert(!qs.some(q=>q.unitId==='L07'));
});
test('weekly session is one per day, shares pending, preserves backup and rejects conflicting merged rounds',()=>{
 let s=startLifeWeek(add(initialState()),{id:'week',time:today});assert.equal(pendingLife(s).source,'life-week');assert.deepEqual(parseBackup(exportBackup(s)),s);assert.deepEqual(startLifeMemory(s,{unitId:'L01',id:'other',time:today}),s);
 s=finish(s,'week',today);assert.deepEqual(startLifeWeek(s,{id:'again',time:today}),s);const b=startLifeWeek(add(initialState()),{id:'branch',time:today});assert.throws(()=>mergeStates(s,b),/同日|生活/);
 assert.deepEqual(startLifeWeek(initialState(),{id:'empty',time:today}),initialState());
 for(const change of [p=>p.reference='2026-02-31',p=>p.reference='2026-10-22',p=>p.questionIds=['L07-fake'],p=>p.queue.push({questionId:qid,repeat:true,sourceId:qid})]){const bad=structuredClone(b);change(bad.v3.sessions[0]);assert.throws(()=>validateState(bad));}
});
test('week answers include recent seven-day references and whole pending interval, without changing old daily-source rules',()=>{
 const hints={[qid]:['2026-10-20T02:00:00.000Z']};assert(lifeCueSeen(hints,qid,today,today,7));assert(!lifeCueSeen(hints,qid,today,today));assert(lifeCueSeen({[qid]:[today]},qid,today,'2026-11-02T02:00:00.000Z',7));
 let s=beginV3Session(initialState(),[qid],{id:'week',time:today,source:'life-week',reference:'2026-10-23'});s=recordLifeExposure(s,[qid],'2026-10-20T02:00:00.000Z');s=answerV3Session(s,{sessionId:'week',question:questionById.get(qid),value:0,eventId:'a',time:today});assert(s.v3.sessions[0].answers[qid].hinted);
});
test('earlier imported week references reject conflicting independent first answers before storage, keeping original export legal',()=>{
 let s=startLifeWeek(add(initialState()),{id:'week',time:today});s=finish(s,'week',today);const first=structuredClone(s),b=recordLifeExposure(initialState(),[qid],'2026-10-20T02:00:00.000Z');assert.throws(()=>mergeStates(s,b),/生活提示/);assert.throws(()=>recordLifeExposure(s,[qid],'2026-10-20T02:00:00.000Z'),/生活提示/);assert.deepEqual(s,first);assert.deepEqual(parseBackup(exportBackup(s)),s);
});
test('weekly report requires a real seven-day earlier record and excludes intervening attempts, overlap and hints',()=>{
 let s=finish(startLifeWeek(add(initialState()),{id:'week',time:today}),'week',today);assert.equal(lifeCheckReport(s,'week').comparable,1);assert.equal(lifeCheckReport(s,'week').retained,1);
 for(const kind of ['recent','between','overlap','hint']){
  let x=beginV3Session(add(initialState(),qid,{time:kind==='recent'?'2026-10-22T02:00:00.000Z':old}),[qid],{id:'test',source:'life-week',reference:'2026-10-23',time:today});
  if(kind==='between'||kind==='overlap')x=add(x,qid,{event:'extra',time:kind==='between'?'2026-10-23T02:01:00.000Z':'2026-10-23T02:02:00.000Z'});
  if(kind==='hint')x=recordLifeExposure(x,[qid],'2026-10-23T02:01:00.000Z');x=finish(x,'test','2026-10-23T02:02:00.000Z');assert.equal(lifeCheckReport(x,'test').comparable,0,kind);assert.equal(lifeCheckReport(x,'test').excluded,1,kind);
 }
});
test('daily closure counts only completed life rounds at cutoff; pending always wins and manual new rounds remain possible',()=>{
 let s=startLifeMemory(initialState(),{unitId:'L07',id:'memory',time:today});assert.equal(lifeDailyCompleted(s,today),null);s=finish(s,'memory',today);assert.equal(lifeDailyCompleted(s,today).id,'memory');assert.equal(lifeNextStep(s,today).route,'life-schedule');assert.equal(lifeNextStep(s,today).kind,'done');
 const early='2026-10-23T01:00:00.000Z';assert.equal(lifeDailyCompleted(s,early),null);s=startLifeMemory(s,{unitId:'L01',id:'extra',time:today});assert.equal(lifeNextStep(s,today).route,'v3-practice/extra');assert.equal(lifeNextStep(add(initialState()),today).route,'life-week');
});
test('forecast is per real practiced course, capped at six, postpones weekly after reference and never changes state',()=>{
 let s=add(initialState());s=recordLifeExposure(s,[qid],'2026-10-22T02:00:00.000Z');const before=structuredClone(s),f=lifeForecast(s,today);assert.equal(f.entries.length,1);assert.equal(f.entries[0].unitId,'L07');assert.equal(f.entries[0].checkDay,'2026-10-17');assert.equal(f.entries[0].weekDay,'2026-10-29');assert.deepEqual(s,before);
 assert.deepEqual(lifeForecast(initialState(),today).entries,[]);for(const unit of ['L01','L02','L03','L04','L05','L06','L08'])s=add(s,memoryQuestions(unit)[0].id);assert.equal(lifeForecast(s,today).entries.length,6);assert.equal(lifeForecast(s,today).total,8);
});
test('a clock-inconsistent future answer cannot count as a completed daily step at the current cutoff',()=>{
 let s=finish(startLifeMemory(initialState(),{unitId:'L07',id:'memory',time:today}),'memory',future);s.v3.sessions[0].completedAt=today;validateState(s);assert.equal(lifeDailyCompleted(s,today),null);
});
