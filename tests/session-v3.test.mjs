import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,parseBackup,exportBackup,mergeStates,recordAnswer} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,nextV3Question,hintV3Question,saveTextRevision,adjustDailyPlan,saveDeepWriting} from '../app/core/v3-learning.mjs';
import {makeDailyPlan} from '../app/core/daily-plan.mjs';
import {v3Questions} from '../app/content/practice-v3.mjs';
import {concepts} from '../app/content/concepts.mjs';
import {deepLessons} from '../app/content/deep-lessons.mjs';
import {confusionPairs} from '../app/content/confusions.mjs';
import {allUnits} from '../app/content/catalog.mjs';
import {kanaLessons} from '../app/content/kana.mjs';
const time='2026-10-13T01:00:00.000Z';
const qs=[0,1,2,3].map(i=>({id:`q${i}`,conceptId:'c1',dimension:'recognition',kind:'choice',options:['a','b'],correct:0,explanation:'選a'}));
const begin=()=>beginV3Session(initialState(),['q0','q1','q2'],{id:'session1',source:'concept',reference:'c1',time});
const submit=(s,index,value=0)=>answerV3Session(s,{sessionId:'session1',question:qs[index],value,eventId:`event${index}`,time,variants:qs});

for(const source of ['daily','lesson','confusion'])test(`${source} 真實題庫無未曝光變式時延後訂正，不重問原題`,()=>{
 let state=initialState(),reference,questionIds,planId=null,stepId=null;
 if(source==='daily'){
  state.settings.dailyMinutes=30;
  for(const [i,q] of v3Questions.filter(q=>q.conceptId==='c-k-shi-tsu').entries())state=recordAnswer(state,{id:`prior-${i}`,item:q.id,dimension:q.dimension,correct:false,hinted:false,time:'2026-10-12T01:00:00.000Z'});
  const plan=makeDailyPlan(state,{concepts,questions:v3Questions,units:[...allUnits,...kanaLessons.map(k=>({...k,level:'K'}))],resolveQuestion:id=>v3Questions.find(q=>q.id===id),time,id:'real-plan'});
  state.v3.dailyPlans.push(plan);const step=plan.steps.find(s=>s.kind==='practice');
  reference=planId=plan.id;stepId=step.id;questionIds=step.questionIds;
 }else if(source==='lesson'){const lesson=deepLessons.find(l=>l.id==='K18');reference=lesson.id;questionIds=lesson.questionIds;}
 else{const pair=confusionPairs.find(p=>p.id==='shi-tsu');reference=pair.id;questionIds=v3Questions.filter(q=>q.conceptId===pair.conceptId).map(q=>q.id);}
 const question=v3Questions.find(q=>q.id===questionIds[0]);assert(questionIds.length>=3);
 assert.equal(v3Questions.filter(q=>q.conceptId===question.conceptId&&q.dimension===question.dimension&&!questionIds.includes(q.id)).length,0);
 const base=beginV3Session(state,questionIds,{id:'real-session',source,reference,time,planId,stepId}),snapshot=structuredClone(base);
 for(const hinted of [false,true]){
  const pending=hinted?hintV3Question(base,'real-session',time):base;
  const next=answerV3Session(pending,{sessionId:'real-session',question,value:hinted?question.correct:(question.correct+1)%question.options.length,eventId:'real-answer',time,variants:v3Questions});
  assert.deepEqual(next.v3.sessions[0].queue,base.v3.sessions[0].queue);
  assert.deepEqual(next.v3.sessions[0].deferred,[question.id]);
  assert.equal(next.attempts.length,base.attempts.length+1);assert.equal(next.attempts.at(-1).hinted,hinted);assert.equal(next.attempts.at(-1).correct,hinted);
  assert.deepEqual(parseBackup(exportBackup(next)),next);assert.deepEqual(base,snapshot);
 }
});
test('首答訂正至少隔兩題，訂正不寫入首次作答與跨日排程',()=>{
 let s=submit(begin(),0,1);assert.equal(s.attempts.length,1);assert.equal(s.attempts[0].correct,false);assert.equal(s.v3.sessions[0].queue[3].repeat,true);
 s=nextV3Question(s,'session1',time);s=submit(s,1);s=nextV3Question(s,'session1',time);s=submit(s,2);s=nextV3Question(s,'session1',time);s=submit(s,3);s=nextV3Question(s,'session1',time);
 assert.equal(s.attempts.length,3);assert.equal(s.reviews['q0:recognition'].total,1);assert.equal(s.v3.sessions[0].corrections[3].correct,true);assert.equal(s.v3.sessions[0].completedAt,time);
});
test('刷新與備份保留提示及首答，重送不增加紀錄',()=>{
 let s=hintV3Question(begin(),'session1',time);s=parseBackup(exportBackup(s));s=submit(s,0);assert.equal(s.attempts[0].hinted,true);assert.deepEqual(submit(s,0,1),s);assert.equal(s.v3.sessions[0].cursor,0);
 assert.deepEqual(mergeStates(s,parseBackup(exportBackup(s))),s);
});
test('未答不可下一題，舊輪次或不屬當前題的答案不可寫入',()=>{
 const s=begin();assert.deepEqual(nextV3Question(s,'session1',time),s);assert.throws(()=>submit(s,2));assert.throws(()=>answerV3Session(s,{sessionId:'absent',question:qs[0],value:0,eventId:'e',time}));
});
test('題目不足先留待對照與跨日複習，訂正錯誤不產生無限佇列',()=>{
 let s=beginV3Session(initialState(),['q0'],{id:'session1',source:'concept',reference:'c1',time});s=submit(s,0,1);assert.equal(s.v3.sessions[0].queue.length,1);assert.deepEqual(s.v3.sessions[0].deferred,['q0']);
});
test('修改文字作品保留原稿與修訂關係，空白修訂拒絕',()=>{
 const s=initialState();s.artifacts=[{id:'old-work',item:'L07',kind:'text',text:'お茶をください。',points:[],time}];
 const next=saveTextRevision(s,{parentId:'old-work',id:'new-work',text:'お茶を一つください。',time});assert.equal(next.artifacts[0].text,s.artifacts[0].text);assert.equal(next.v3.artifactParents['new-work'],'old-work');assert.throws(()=>saveTextRevision(s,{parentId:'old-work',id:'new-work',text:' ',time}));
});
test('調整每日份量保留已答輪次，只縮小尚未開始的回想',()=>{
 const s=initialState();s.v3.dailyPlans=[{id:'plan1',day:'2026-10-13',minutes:30,goal:'K',unitId:'K01',conceptIds:['c1'],newConceptIds:['c1'],newCount:1,dueTotal:0,remainingDue:0,reason:'一小步',steps:[{id:'recall',kind:'practice',title:'先回想',questionIds:['q0','q1','q2'],sessionId:null,startedAt:null,completedAt:null},{id:'transfer',kind:'practice',title:'換個情境',questionIds:['q0','q1','q2'],sessionId:null,startedAt:null,completedAt:null},{id:'write',kind:'write',title:'自己寫',questionIds:[],sessionId:null,startedAt:null,completedAt:null}],createdAt:time,updatedAt:time}];
 const begun=beginV3Session(s,['q0','q1','q2'],{id:'session1',source:'daily',reference:'plan1',time,planId:'plan1',stepId:'recall'});
 const next=adjustDailyPlan(begun,'plan1',5,time);assert.equal(next.v3.dailyPlans[0].minutes,5);assert.equal(next.v3.dailyPlans[0].steps[0].questionIds.length,3);assert.equal(next.v3.dailyPlans[0].steps[1].questionIds.length,2);assert.equal(next.v3.sessions[0].questionIds.length,3);
});
test('深入課成果必須有完成回想，不能略過作答假稱完成',()=>{
 const s=initialState();assert.throws(()=>saveDeepWriting(s,{unitId:'N5-01',questionIds:['q0'],id:'work',text:'私は学生です。',time}));
});
test('尚未開始30分鐘新知縮成5分鐘時，新概念也減至一個',()=>{
 const s=initialState();s.settings.dailyMinutes=30;
 const concepts=Array.from({length:6},(_,i)=>({id:`c${i}`,title:`c${i}`,level:'K',unitIds:['K01'],itemIds:[],dimensions:['recognition']}));
 const questions=concepts.flatMap(c=>[0,1,2].map(n=>({id:`${c.id}-q${n}`,conceptId:c.id,level:'K',dimension:'recognition'})));
 s.v3.dailyPlans.push(makeDailyPlan(s,{concepts,questions,units:[{id:'K01',level:'K'}],resolveQuestion:()=>null,time,id:'plan1'}));
 const next=adjustDailyPlan(s,'plan1',5,time,{questions});assert.equal(next.v3.dailyPlans[0].newCount,1);assert.equal(next.v3.dailyPlans[0].newConceptIds.length,1);
});
test('純弱點安排縮成5分鐘仍有可開始的回想',()=>{
 let s=answerV3Session(beginV3Session(initialState(),['q0'],{id:'s-q0',source:'concept',reference:'c1',time}),{sessionId:'s-q0',question:qs[0],value:1,eventId:'a-q0',time});
 const concepts=[{id:'c1',title:'一個弱點',level:'K',unitIds:['K01'],itemIds:[],dimensions:['recognition']}];
 s.v3.dailyPlans.push(makeDailyPlan(s,{concepts,questions:qs,units:[{id:'K01',level:'K'}],resolveQuestion:id=>qs.find(q=>q.id===id),time,id:'plan1'}));
 const next=adjustDailyPlan(s,'plan1',5,time,{questions:qs}),transfer=next.v3.dailyPlans[0].steps.find(step=>step.id==='transfer');assert(transfer.questionIds.length>0);assert.equal(next.v3.dailyPlans[0].conceptIds[0],'c1');
});
