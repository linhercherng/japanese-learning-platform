import test from 'node:test';import assert from 'node:assert/strict';
import * as skills from '../app/core/life-skills.mjs';
import {lifeMemoryUnits,pendingLife,startLifeMemory} from '../app/core/life-memory.mjs';import * as ids from '../app/content/life-memory-ids.mjs';const {validLifeReference,isLifeSource}=ids;const lifeAbility=q=>ids.lifeAbility(q);
import {questionById,unitQuestions,unitById} from '../app/content/catalog.mjs';import {initialState,recordAnswer,validateState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';import {recordLifeExposure} from '../app/core/life-memory-state.mjs';import {lifeDailyCompleted} from '../app/core/life-retention.mjs';
const today='2026-10-23T03:00:00.000Z',old='2026-10-01T03:00:00.000Z';
const add=(s,qid,{time=old,correct=true,hinted=false,id=qid}={})=>recordAnswer(s,{id,item:qid,dimension:questionById.get(qid).dimension,correct,hinted,time});
test('all 92 life units partition original questions into three abilities without adding questions',()=>{
 assert.equal(typeof skills.lifeSkillCandidates,'function');for(const unit of lifeMemoryUnits){const all=unitQuestions(unit),out=[];for(const key of ['listening','productive','understanding']){const qs=skills.lifeSkillCandidates(initialState(),unit.id,key,today);assert(qs.length>0&&qs.length<=3);assert(qs.every(q=>q.unitId===unit.id&&lifeAbility(q)===key));const report=skills.lifeSkillSummary(initialState(),unit.id,key,today);assert.equal(report.practiced,0);assert.equal(report.remaining,report.total);out.push(...all.filter(q=>lifeAbility(q)===key));}assert.equal(out.length,all.length);}
 assert.equal(lifeAbility({kind:'choice',dimension:'writing'}),null);
});
test('priority is recent weakness, unseen originals, then due and other known originals, with at most three',()=>{
 let s=initialState();for(const q of ['L07-q0','L07-q1','L07-v2-q4'])s=add(s,q);s=add(s,'L07-q1',{correct:false,time:'2026-10-22T03:00:00.000Z',id:'wrong'});
 const qs=skills.lifeSkillCandidates(s,'L07','understanding',today);assert.deepEqual(qs.map(q=>q.id),['L07-q1','L07-v2-r1','L07-v2-r2']);assert.deepEqual(skills.lifeSkillSummary(s,'L07','understanding',today),{total:5,practiced:3,remaining:2,weak:1});
});
test('cutoff ignores future attempts and poisoned current reviews and summaries are read only',()=>{
 let s=add(initialState(),'L07-q0',{correct:false});s=add(s,'L07-q0',{time:'2026-11-01T03:00:00.000Z',id:'future'});s.reviews={};const before=structuredClone(s);assert.equal(skills.lifeSkillCandidates(s,'L07','understanding',today)[0].id,'L07-q0');assert.equal(skills.lifeSkillSummary(s,'L07','understanding',today).weak,1);assert.deepEqual(s,before);
 assert.deepEqual(skills.lifeSkillCandidates(s,'bad','listening',today),[]);assert.deepEqual(skills.lifeSkillCandidates(s,'L07','bad',today),[]);
});
test('focused source preserves exact ability, backup and a single common life pending',()=>{
 const s=skills.startLifeSkill(initialState(),{unitId:'L07',skill:'productive',id:'skill',time:today}),p=pendingLife(s);assert.equal(p.source,'life-skill');assert.equal(p.reference,'L07:productive');assert.equal(p.questionIds.length,2);assert(p.questionIds.every(id=>lifeAbility(questionById.get(id))==='productive'));validateState(s);assert.deepEqual(parseBackup(exportBackup(s)),s);
 assert.equal(skills.startLifeSkill(s,{unitId:'L01',skill:'listening',id:'second',time:today}),s);assert.equal(startLifeMemory(s,{unitId:'L01',id:'other',time:today}),s);assert.equal(isLifeSource('life-skill'),true);
});
test('source validation rejects wrong unit, mixed ability, duplicate ids, too many questions and inserted repeats',()=>{
 assert(validLifeReference('life-skill','L07:productive',['L07-v2-q2','L07-v2-q3']));for(const [ref,ids] of [['L01:productive',['L07-v2-q2']],['L07:bad',['L07-q0']],['L07:productive',['L07-v2-q2','L07-q0']],['L07:productive',['L07-v2-q2','L07-v2-q2']],['L07:understanding',['L07-q0','L07-q1','L07-v2-r1','L07-v2-r2']]])assert(!validLifeReference('life-skill',ref,ids));
 const s=skills.startLifeSkill(initialState(),{unitId:'L07',skill:'productive',id:'skill',time:today}),bad=structuredClone(s);bad.v3.sessions[0].queue.push({questionId:'L07-v2-q2',repeat:true,sourceId:'L07-v2-q2'});assert.throws(()=>validateState(bad),/生活/);
 assert.throws(()=>beginV3Session(initialState(),['L07-q0'],{id:'bad',source:'life-skill',reference:'L07:productive',time:today}),/生活/);
});
test('original answers and hint grading survive completion, merge and daily closure without variants',()=>{
 let s=recordLifeExposure(initialState(),['L07-v2-q1'],'2026-10-23T02:00:00.000Z');s=skills.startLifeSkill(s,{unitId:'L07',skill:'listening',id:'skill',time:today});const before=structuredClone(s),q=questionById.get('L07-v2-q1');s=answerV3Session(s,{sessionId:'skill',question:q,value:q.correct,eventId:'a',time:today,variants:[{...q,id:'other',conceptId:q.conceptId}]});s=nextV3Question(s,'skill',today);
 assert.equal(s.v3.sessions[0].answers[q.id].hinted,true);assert.equal(s.v3.sessions[0].queue.length,1);assert.equal(lifeDailyCompleted(s,today).id,'skill');const merged=mergeStates(before,parseBackup(exportBackup(s)));assert.deepEqual(merged.v3.sessions[0].answers,s.v3.sessions[0].answers);
 const conflict=structuredClone(s);conflict.v3.sessions[0].answers[q.id].value=1-q.correct;assert.throws(()=>mergeStates(s,conflict),/首次答案/);
});
