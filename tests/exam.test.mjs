import test from 'node:test';
import assert from 'node:assert/strict';
import {startExam,answerExam,advanceExam,remainingSeconds,examReport} from '../app/core/exam.mjs';
import {transitionExamState} from '../app/core/exam-progress.mjs';
import {initialState,mergeStates} from '../app/core/learning.mjs';
const form={id:'N5-A',level:'N5',sections:['vocabulary','grammar-reading','listening'].map((id,i)=>({id,title:id,minutes:1,questions:[{id:`ex-${i}`,kind:'choice',dimension:i===2?'listening':'grammar',prompt:'question',options:['wrong','correct'],correct:1,explanation:'because'}]}))};
const at=s=>new Date(Date.UTC(2026,9,12,8,0,s)).toISOString();
test('續考倒數沿用原期限，重新讀取不增加時間',()=>{
 const exam=startExam(form,{id:'session',mode:'full',time:at(0)});assert.equal(remainingSeconds(exam,at(35)),25);assert.equal(remainingSeconds(structuredClone(exam),at(59)),1);
});
test('期限後作答拒絕，跨區逾時不重新開始下一區',()=>{
 let exam=startExam(form,{id:'session',mode:'full',time:at(0)});assert.throws(()=>answerExam(exam,form,'ex-0',1,at(61)),/時間/);
 exam=advanceExam(exam,form,at(125));assert.equal(exam.sectionIndex,2);assert.equal(remainingSeconds(exam,at(125)),55);assert.equal(Object.keys(exam.answers).length,0);
});
test('模擬作答只保存首次答案，不接受其他區題目',()=>{
 let exam=startExam(form,{id:'session',time:at(0)});assert.throws(()=>answerExam(exam,form,'ex-2',1,at(1)));
 exam=answerExam(exam,form,'ex-0',0,at(2));exam=answerExam(exam,form,'ex-0',1,at(3));assert.equal(exam.answers['ex-0'].value,0);
});
test('全部逾時交卷以原時間結束，未答不算正確',()=>{
 let exam=startExam(form,{id:'session',time:at(0),seen:['ex-0']});exam=answerExam(exam,form,'ex-0',1,at(2));exam=advanceExam(exam,form,at(190));
 assert.equal(exam.status,'completed');assert.equal(exam.finishedAt,at(180));const report=examReport(exam,form);assert.equal(report.correct,1);assert.equal(report.total,3);assert.equal(report.unanswered,2);assert.equal(report.seen,1);assert.equal(report.officialScore,undefined);
});
test('縮時模式明確標记且不改原試卷',()=>{
 const exam=startExam(form,{id:'session',mode:'short',time:at(0)});assert.equal(exam.mode,'short');assert.equal(exam.sectionSeconds[0],300);assert.equal(form.sections[0].minutes,1);
});
test('背景區已逾時才手動交區，不給下一區額外時間',()=>{
 const exam=startExam(form,{id:'session',time:at(0)});const next=advanceExam(exam,form,at(125),{submit:true});assert.equal(next.sectionIndex,2);assert.equal(remainingSeconds(next,at(125)),55);
});
test('交區在交易內用最新答案，不能被舊畫面快照覆寫',()=>{
 const initial=initialState();initial.activeExam=startExam(form,{id:'session',time:at(0)});
 const latest={...initial,activeExam:answerExam(initial.activeExam,form,'ex-0',1,at(2))};
 const next=transitionExamState(latest,form,at(3),{sessionId:'session',sectionIndex:0,submit:true});assert.equal(next.activeExam.answers['ex-0'].value,1);assert.equal(next.activeExam.sectionIndex,1);
 const staleClick=transitionExamState(next,form,at(4),{sessionId:'session',sectionIndex:0,submit:true});assert.equal(staleClick.activeExam.sectionIndex,1);
});
test('相同進行中模擬備份合併保留兩邊首答，分歧首答明示拒絕',()=>{
 const local=initialState(),incoming=initialState();local.activeExam=startExam(form,{id:'same',time:at(0)});
 incoming.activeExam=answerExam(local.activeExam,form,'ex-0',1,at(1));assert.equal(mergeStates(local,incoming).activeExam.answers['ex-0'].value,1);
 local.activeExam=answerExam(local.activeExam,form,'ex-0',0,at(2));assert.throws(()=>mergeStates(local,incoming),/答案.*衝突/);
});
test('合併不同考區分支不得補進交區後的首答',()=>{
 const local=initialState(),incoming=initialState();const started=startExam(form,{id:'same',time:at(0)});
 local.activeExam=advanceExam(started,form,at(5),{submit:true});incoming.activeExam=answerExam(started,form,'ex-0',1,at(10));assert.throws(()=>mergeStates(local,incoming),/跨考區/);
});
