import test from 'node:test';import assert from 'node:assert/strict';
import {lifeMemoryMap,lifeWeakQuestions,lifeProgressReport,lifeNextStep,startLifeRepair,lifeRoundReview} from '../app/core/life-progress.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {startLifeMemory,startLifeCheck,pendingLife,memoryQuestions} from '../app/core/life-memory.mjs';
import {beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {questionById} from '../app/content/catalog.mjs';
const yesterday='2026-10-22T02:00:00.000Z',today='2026-10-23T02:00:00.000Z',future='2026-10-24T02:00:00.000Z';
const add=(s,qid,{id=qid,time=yesterday,correct=false,hinted=false,dimension=questionById.get(qid).dimension}={})=>recordAnswer(s,{id,item:qid,dimension,correct,hinted,time});
test('92-course map separates unpracticed, actual questions, days and current weaknesses; ignores writing and future data',()=>{
 let s=initialState();assert.equal(lifeMemoryMap(s,today).length,92);assert(lifeMemoryMap(s,today).every(u=>u.status==='new'));
 s=add(s,'L07-v2-q1');s=add(s,'L07-v2-q2',{hinted:true,correct:true});s=add(s,'L07-q0',{id:'writing',dimension:'writing'});
 const m=lifeMemoryMap(s,today).find(u=>u.id==='L07');assert.equal(m.practiced,2);assert.equal(m.days,1);assert.equal(m.weak,2);assert.equal(m.status,'weak');assert.equal(m.total,8);
 const before=lifeMemoryMap(s,today);s=add(s,'L07-v2-q1',{id:'future',time:future,correct:true});assert.deepEqual(lifeMemoryMap(s,today),before);
});
test('daily first-answer report separates listening, productive input, understanding and ambiguous times',()=>{
 let s=add(initialState(),'L07-v2-q1',{correct:false});s=add(s,'L07-v2-q1',{id:'later',time:'2026-10-22T03:00:00.000Z',correct:true});s=add(s,'L07-v2-q1',{id:'day2',time:today,correct:true});
 s=add(s,'L07-v2-q2',{correct:true,hinted:true});s=add(s,'L07-q0',{correct:true});s=add(s,'L07-q0',{id:'collision',correct:false});
 const r=lifeProgressReport(s,today);assert.equal(r.listening.total,2);assert.equal(r.listening.independent,1);assert.equal(r.productive.hinted,1);assert.equal(r.understanding.ambiguous,1);assert.equal(r.understanding.independent,0);assert.equal(s.attempts.length,6);
});
test('weak practice picks max three original attempted questions from distinct courses, wrong before hinted; no new fillers',()=>{
 let s=initialState();for(const unit of ['L01','L02','L03','L04'])for(const q of memoryQuestions(unit))s=add(s,q.id,{correct:unit==='L01',hinted:unit==='L01'});
 const qs=lifeWeakQuestions(s,today);assert.equal(qs.length,3);assert.equal(new Set(qs.map(q=>q.unitId)).size,3);assert.equal(qs[0].unitId,'L02');assert.deepEqual(lifeWeakQuestions(initialState(),today),[]);
 const before=qs.map(q=>q.id);s=add(s,'L04-q0',{id:'future',time:future,correct:true});assert.deepEqual(lifeWeakQuestions(s,today).map(q=>q.id),before);
});
test('repair resumes the common pending UUID, records original answers and roundtrips schema3 without replacing history',()=>{
 let s=add(initialState(),'L07-v2-q1');s=startLifeRepair(s,{id:'repair',time:today});assert.equal(pendingLife(s).source,'life-repair');assert.equal(pendingLife(parseBackup(exportBackup(s))).id,'repair');
 const frozen=structuredClone(s);assert.deepEqual(startLifeMemory(s,{unitId:'L01',id:'other',time:today}),frozen);assert.deepEqual(startLifeCheck(s,{id:'check',time:today}),frozen);assert.deepEqual(startLifeRepair(s,{id:'again',time:today}),frozen);
 s=answerV3Session(s,{sessionId:'repair',question:questionById.get('L07-v2-q1'),value:0,eventId:'a',time:today,variants:[{id:'fake',conceptId:'fake'}]});s=nextV3Question(s,'repair',today);assert(s.v3.sessions[0].completedAt);assert.equal(s.attempts.length,2);assert.equal(s.attempts[0].correct,false);
});
test('repair validates dates, course ownership, exact nonrepeat queue and conflicting pending backups',()=>{
 const s=startLifeRepair(add(initialState(),'L07-v2-q1'),{id:'repair',time:today});
 for(const mutation of [x=>x.reference='2026-02-31',x=>x.reference='2026-10-22',x=>x.questionIds=['L07-fake'],x=>x.queue.push({questionId:'L07-v2-q1',repeat:true,sourceId:'L07-v2-q1'})]){const bad=structuredClone(s);mutation(bad.v3.sessions[0]);assert.throws(()=>validateState(bad));}
 const other=startLifeMemory(initialState(),{unitId:'L01',id:'other',time:today});assert.throws(()=>mergeStates(s,other),/生活/);
 assert.throws(()=>beginV3Session(initialState(),['L07-q0','L07-q1'],{id:'duplicate-course',time:today,source:'life-repair',reference:'2026-10-23'}));
});
test('next-step priority uses current pending, daily check, weaknesses and unpracticed lesson without creating progress',()=>{
 let s=initialState();assert.equal(lifeNextStep(s,today).route,'life-memory/L01');s=add(s,'L07-v2-q1');assert.equal(lifeNextStep(s,today).route,'life-check');
 const sameDay=add(initialState(),'L07-v2-q1',{time:today});assert.equal(lifeNextStep(sameDay,today).kind,'repair');
 s=startLifeRepair(s,{id:'pending',time:today});assert.equal(lifeNextStep(s,today).route,'v3-practice/pending');assert.equal(s.attempts.length,1);
});
test('only completed original life rounds can be reviewed; question order, own first values and hint flags stay unchanged',()=>{
 let s=startLifeMemory(initialState(),{unitId:'L07',id:'round',time:today});assert.equal(lifeRoundReview(s,'round',today),null);
 for(const q of memoryQuestions('L07')){s=answerV3Session(s,{sessionId:'round',question:q,value:q.kind==='cloze'?'wrong':0,eventId:q.id,time:today});s=nextV3Question(s,'round',today);}
 const before=structuredClone(s),r=lifeRoundReview(s,'round',today);assert.deepEqual(r.entries.map(x=>x.q.id),memoryQuestions('L07').map(q=>q.id));assert.equal(r.entries[1].answer.value,'wrong');assert.equal(lifeRoundReview(s,'missing',today),null);assert.deepEqual(s,before);
});
test('equivalent ISO timestamps remain an ambiguous first answer even with different timezone notation',()=>{
 let s=add(initialState(),'L07-q0',{correct:true});s=add(s,'L07-q0',{id:'same-instant',time:'2026-10-22T10:00:00+08:00',correct:false});assert.equal(lifeProgressReport(s,today).understanding.ambiguous,1);
});
