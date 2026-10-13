import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,recordAnswer} from '../app/core/learning.mjs';
import {makeDailyPlan,conceptProgress,weeklyReport} from '../app/core/daily-plan.mjs';
const time='2026-10-13T01:00:00.000Z';
const concepts=Array.from({length:6},(_,i)=>({id:`c${i}`,title:`概念${i}`,level:'K',unitIds:['K01'],itemIds:[`old${i}`],dimensions:['recognition'],explanation:'先理解',example:{jp:'あ',zh:'啊'},memoryTip:'收起字形'}));
const questions=concepts.flatMap(c=>[0,1,2].map(n=>({id:`${c.id}-q${n}`,conceptId:c.id,level:'K',unitId:'K01',kind:'choice',dimension:'recognition',prompt:`${c.id} ${n}`,options:['a','b'],correct:0,explanation:'a'})));
const units=[{id:'K01',level:'K',title:'母音'}];const input={concepts,questions,units,resolveQuestion:id=>questions.find(q=>q.id===id)||{id,dimension:'recognition'},time,id:'plan-1'};
test('每日份量5／15／30分鐘限制新概念，題目快照可重現',()=>{
 for(const [minutes,cap]of [[5,1],[15,3],[30,5]]){const s=initialState();s.settings.dailyMinutes=minutes;const p=makeDailyPlan(s,input);assert.equal(p.newCount,cap);assert.deepEqual(makeDailyPlan(s,input),p);assert.equal(p.steps.at(-1).kind,'write');}
});
test('到期积壓先複習，未選項仍顯示且可明示加新內容',()=>{
 let s=initialState();for(let i=0;i<15;i++)s=recordAnswer(s,{id:`a${i}`,item:`old${i%5}`,dimension:'recognition',correct:false,hinted:false,time});
 for(let i=5;i<15;i++)s=recordAnswer(s,{id:`extra${i}`,item:`unmapped${i}`,dimension:'recognition',correct:false,hinted:false,time});
 const p=makeDailyPlan(s,input);assert.equal(p.newCount,0);assert.equal(p.dueTotal,15);assert(p.remainingDue>0);assert(makeDailyPlan(s,{...input,allowNew:true}).newCount>0);
});
test('已建立當日計畫刷新後不因新作答重新換題',()=>{
 const s=initialState(),p=makeDailyPlan(s,input);s.v3.dailyPlans.push(p);const next=recordAnswer(s,{id:'new-a',item:'c0-q0',dimension:'recognition',correct:true,hinted:false,time});
 assert.deepEqual(makeDailyPlan(next,{...input,id:'other-id'}),p);
});
test('同日多次成功不是跨日熟練，提示成功仍需提示',()=>{
 let s=initialState();for(let i=0;i<3;i++)s=recordAnswer(s,{id:`a${i}`,item:`c0-q${i}`,dimension:'recognition',correct:true,hinted:i===0,time});
 const progress=conceptProgress(s,concepts,questions);assert.equal(progress.find(p=>p.conceptId==='c0').days,1);assert.equal(progress.find(p=>p.conceptId==='c0').weak,true);
});
test('每週回顧同概念每天只計首次回想，訂正與作文自評不灌分',()=>{
 let s=initialState();for(const a of [{id:'a1',item:'c0-q0',time,correct:false},{id:'a2',item:'c0-q1',time,correct:true},{id:'a3',item:'c0-q2',time:'2026-10-14T01:00:00.000Z',correct:true}])s=recordAnswer(s,{dimension:'recognition',hinted:false,...a});
 const report=weeklyReport(s,concepts,questions,'2026-10-14T01:10:00.000Z');assert.equal(report.recall.total,1);assert.equal(report.recall.correct,1);assert.equal(report.firstAnswers,3);
 const empty=weeklyReport(initialState(),concepts,questions,time);assert.equal(empty.recall.total,0);assert.equal(empty.recall.rate,null);
});
test('切換目標不被其他級別的到期題塞滿，也不因此停止新內容',()=>{
 let s=initialState();for(let i=0;i<12;i++)s=recordAnswer(s,{id:`n3-${i}`,item:`n3q${i}`,dimension:'grammar',correct:false,hinted:false,time});
 const p=makeDailyPlan(s,{...input,resolveQuestion:id=>({id,level:'N3',dimension:'grammar'})});assert.equal(p.dueTotal,0);assert.equal(p.newCount,3);
});
test('完成今日安排刷新仍保持完成，只有明示額外學習才另建',()=>{
 const s=initialState(),p=makeDailyPlan(s,input);p.steps.forEach(step=>{step.completedAt=time;});s.v3.dailyPlans.push(p);
 assert.deepEqual(makeDailyPlan(s,{...input,id:'new-id'}),p);assert.equal(makeDailyPlan(s,{...input,id:'new-id',allowNew:true}).id,'new-id');
});
test('無概念對應的積壓不藉fallback偷塞新題',()=>{
 let s=initialState();for(let i=0;i<12;i++)s=recordAnswer(s,{id:`a-${i}`,item:`unmapped-${i}`,dimension:'recognition',correct:false,hinted:false,time});
 const p=makeDailyPlan(s,input);assert.equal(p.newCount,0);assert.equal(p.conceptIds.length,0);assert(!p.steps.some(step=>step.id==='transfer'));
});
test('混合弱點與新知時，標題與最後選定的新概念數一致',()=>{
 const s=recordAnswer(initialState(),{id:'old',item:'old0',dimension:'recognition',correct:false,hinted:false,time});
 const p=makeDailyPlan(s,input),step=p.steps.find(step=>step.id==='learn');assert.equal(step.title,`理解 ${p.newCount} 個新重點`);
});

test('跨日首答按实际時間排序，接受有時區的ISO備份時間',()=>{
 let s=initialState();for(const [i,t,correct]of [[0,'2026-10-11T23:00:00Z',true],[1,'2026-10-12T23:00:00-03:00',false],[2,'2026-10-13T01:00:00+08:00',true]])s=recordAnswer(s,{id:'offset-'+i,item:'c0-q'+i,dimension:'recognition',correct,hinted:false,time:t});
 const report=weeklyReport(s,concepts,questions,'2026-10-13T12:00:00Z');assert.deepEqual(report.recall,{correct:1,total:1,rate:100});
});
test('Five minute plans with due work still teach any new concept before transfer',()=>{
 let s=initialState();s.settings.dailyMinutes=5;s=recordAnswer(s,{id:'prior',item:'c0-q0',dimension:'recognition',correct:false,hinted:false,time:'2026-10-11T00:00:00Z'});
 const plan=makeDailyPlan(s,input);assert.equal(plan.newCount,1);assert.equal(plan.steps[0].kind,'practice');assert(plan.steps.some(s=>s.id==='learn'&&s.kind==='learn'));
});
