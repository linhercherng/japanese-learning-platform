import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState,recordAnswer,exportBackup,parseBackup,mergeStates,organizeCompletedPractice} from '../app/core/learning.mjs';
import {gradeQuestion,createPractice,answerPractice,hintPractice} from '../app/core/study.mjs';
const time='2026-10-12T08:00:00.000Z';
const legacy=()=>({schema:1,settings:{dailyMinutes:30,roman:false,ruby:true,fontSize:17},attempts:[{id:'old-answer',item:'h-3042',dimension:'recognition',correct:true,hinted:false,time}],reviews:{},completed:{K01:time},artifacts:[{id:'old-work',item:'L07',kind:'text',text:'お茶を一つお願いします。',points:[],time}],drafts:{'text:L07':{text:'コーヒー',points:[],time}},lastLesson:'L07',revision:4});
test('第一版資料升級保留作品、草稿、設定及穩定作答ID',()=>{
 const before=legacy(),next=upgradeState(before);
 assert.equal(next.schema,3);assert.deepEqual(next.artifacts,before.artifacts);assert.deepEqual(next.drafts,before.drafts);assert.deepEqual(next.settings,before.settings);assert.equal(next.attempts[0].id,'old-answer');assert.equal(next.reviews['h-3042:recognition'].total,1);assert.equal(before.schema,1);
});
test('第一版備份可匯入第二版，新增能力及收藏可往返',()=>{
 const v1=JSON.stringify({format:'hiyori-backup',version:1,state:legacy()});let next=parseBackup(v1);
 next=recordAnswer(next,{id:'new-answer',item:'N5-01-q1',dimension:'grammar',correct:false,hinted:false,time});next.bookmarks=['word-n5-001'];
 const exported=JSON.parse(exportBackup(next));assert.equal(exported.version,3);
 assert.deepEqual(parseBackup(JSON.stringify(exported)).bookmarks,next.bookmarks);assert.equal(parseBackup(JSON.stringify(exported)).attempts.length,2);
});
test('合併第二版收藏去重且保留本機進行中練習',()=>{
 const current=initialState(),incoming=initialState();current.bookmarks=['a'];incoming.bookmarks=['a','b'];current.revision=1;
 current.practice=createPractice({id:'local',unitId:'N5-01',questionIds:['q1'],time});incoming.practice=createPractice({id:'other',unitId:'N5-02',questionIds:['q2'],time});
 const next=mergeStates(current,incoming);assert.deepEqual(next.bookmarks,['a','b']);assert.equal(next.practice.id,'local');assert.equal(mergeStates(next,incoming).bookmarks.length,2);
});
test('填空接受明示變體與全形字，不將羅馬字誤當日文',()=>{
 const q={kind:'cloze',accepted:['コーヒー','珈琲']};assert.equal(gradeQuestion(q,' 珈琲 '),true);assert.equal(gradeQuestion(q,'coffee'),false);assert.equal(gradeQuestion({kind:'cloze',accepted:['ABC']},'ＡＢＣ'),true);
});
test('句子排序允許相同詞塊交換，但拒絕重用索引或缺詞',()=>{
 const q={kind:'order',tokens:['私','は','私','です'],answerOrder:[0,1,2,3]};assert.equal(gradeQuestion(q,[2,1,0,3]),true);assert.equal(gradeQuestion(q,[0,1,0,3]),false);assert.equal(gradeQuestion(q,[0,1,3]),false);
});
test('同題首次提交後不能改選刷對，提示使用紀錄保留',()=>{
 const p=createPractice({id:'p',unitId:'N5-01',questionIds:['q1'],time});const q={id:'q1',kind:'choice',options:['a','b'],correct:1};
 const first=answerPractice(p,q,0,{time,hinted:true});const second=answerPractice(first,q,1,{time});assert.equal(second.answers.q1.correct,false);assert.equal(second.answers.q1.hinted,true);assert.equal(Object.keys(second.answers).length,1);
});
test('備份拒絕非法第二版欄位，不能以收藏陣列污染物件',()=>{
 const s=initialState();s.bookmarks=['__proto__'];assert.throws(()=>parseBackup(JSON.stringify({format:'hiyori-backup',version:3,state:s})));s.bookmarks=['safe'];s.examAttempts=[{id:'invalid',status:'completed'}];assert.throws(()=>exportBackup(s));
});
test('看提示後刷新與備份還原，仍不能計為無提示成功',()=>{
 const s=initialState();s.practice=hintPractice(createPractice({id:'p',unitId:'N5-01',questionIds:['q1'],time}),'q1',time);
 const restored=parseBackup(exportBackup(s));const answered=answerPractice(restored.practice,{id:'q1',kind:'choice',options:['a','b'],correct:1},1,{time});assert.equal(answered.answers.q1.hinted,true);
});
test('本機已完成練習時恢復可續練者，两個不同續練都保留',()=>{
 const current=initialState(),incoming=initialState(),q={id:'q1',kind:'choice',options:['a'],correct:0};
 current.practice=answerPractice(createPractice({id:'done',unitId:'N5-01',questionIds:['q1'],time}),q,0,{time});current.practice.index=1;
 incoming.practice=createPractice({id:'resume',unitId:'N5-02',questionIds:['q2'],time});const merged=mergeStates(current,incoming);assert.equal(merged.practice.id,'resume');assert.ok(merged.practiceHistory.some(p=>p.id==='done'));
 const another=initialState();another.practice=createPractice({id:'another',unitId:'N5-03',questionIds:['q3'],time});const all=mergeStates(merged,another);assert.equal(all.practice.id,'resume');assert.ok(all.practiceHistory.some(p=>p.id==='another'));
});
test('整理完成輪次保留首次作答與未完成續作，匯出的備份可恢復結果',()=>{
 const s=initialState();s.practice=createPractice({id:'continue',unitId:'N5-01',questionIds:['q1'],time});const done=answerPractice(createPractice({id:'done',unitId:'N5-01',questionIds:['q1'],time}),{id:'q1',kind:'choice',options:['a'],correct:0},0,{time});done.index=1;s.practiceHistory=[done];
 const backup=exportBackup(s),organized=organizeCompletedPractice(s);assert.equal(organized.practice.id,'continue');assert.equal(organized.practiceHistory.length,0);assert.deepEqual(organized.attempts,s.attempts);assert.equal(mergeStates(organized,parseBackup(backup)).practiceHistory[0].id,'done');
});
