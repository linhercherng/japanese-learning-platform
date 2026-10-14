import test from 'node:test';import assert from 'node:assert/strict';
import {startExam,answerExam,advanceExam,remainingSeconds,examReport} from '../app/core/exam.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {setLearningGoal} from '../app/core/v3-learning.mjs';
const time='2026-10-14T12:00:00.000Z';
const questions=(prefix,n)=>Array.from({length:n},(_,i)=>({id:`${prefix}-${i}`,kind:'choice',dimension:'grammar',prompt:'選擇',options:['正確','錯誤','其他'],correct:0,explanation:'說明'}));
const n2={id:'N2-test',level:'N2',sections:[{id:'language-reading',title:'語言知識・讀解',minutes:105,questions:questions('N2-test-a',50)},{id:'listening',title:'聽解',minutes:50,questions:questions('N2-test-b',20)}]};

test('N2 has two timed areas and expiry resumes into listening without resetting the deadline',()=>{
 const started=startExam(n2,{id:'N2-run',time});assert.deepEqual(started.sectionSeconds,[6300,3000]);
 const resumed=advanceExam(started,n2,'2026-10-14T13:46:00.000Z');assert.equal(resumed.sectionIndex,1);assert.equal(resumed.sectionEndsAt,'2026-10-14T14:35:00.000Z');assert.equal(remainingSeconds(resumed,'2026-10-14T13:46:00.000Z'),2940);
 const finished=advanceExam(resumed,n2,'2026-10-14T14:36:00.000Z');assert.equal(finished.sectionIndex,2);assert.equal(finished.status,'completed');assert.equal(examReport(finished,n2).unanswered,70);
});

test('N2 short practice has 15 plus 5 questions and immutable first answers survive backup',()=>{
 let exam=startExam(n2,{id:'N2-short',mode:'short',time});assert.deepEqual(exam.questionIds.map(q=>q.length),[15,5]);assert.deepEqual(exam.sectionSeconds,[300,300]);
 exam=answerExam(exam,n2,exam.questionIds[0][0],1,time);assert.deepEqual(answerExam(exam,n2,exam.questionIds[0][0],0,time),exam);
 const state=initialState();state.activeExam=exam;assert.deepEqual(parseBackup(exportBackup(state)).activeExam,exam);
 exam=advanceExam(exam,n2,time,{submit:true});assert.equal(exam.sectionIndex,1);assert.throws(()=>answerExam(exam,n2,exam.questionIds[0][0],0,time));exam=advanceExam(exam,n2,time,{submit:true});assert.equal(exam.status,'completed');assert.equal(examReport(exam,n2).correct,0);
});

test('N2 learning goal roundtrips while existing goals and progress remain',()=>{
 let state=initialState();state.completed.K01=time;state=setLearningGoal(state,'N2');const restored=parseBackup(exportBackup(state));assert.equal(restored.v3.goal,'N2');assert.equal(restored.completed.K01,time);assert.equal(setLearningGoal(restored,'N3').v3.goal,'N3');
});

test('N2 is discoverable through course, library, ability practice and daily goal selectors',async()=>{
 const {levels}=await import('../app/content/catalog.mjs');assert(levels.includes('N2'));
 const {coursesView,practiceHubView}=await import('../app/ui/courses.mjs'),{libraryView}=await import('../app/ui/library.mjs'),{goalLabels}=await import('../app/ui/v3.mjs');const ctx={state:initialState(),session:{},kana:[]};
 assert.match(coursesView(ctx),/href="#level\/N2"/);assert.match(practiceHubView(ctx),/value="N2"/);assert.match(libraryView(ctx,'words'),/value="N2"/);assert(goalLabels.N2);
});

test('N2 imported exams must exactly match two-area question and timer snapshots',async()=>{
 const {validateExamForm}=await import('../app/core/exam.mjs');const s=startExam(n2,{id:'N2-import',mode:'short',time});assert.doesNotThrow(()=>validateExamForm(s,n2));
 const truncated=structuredClone(s);truncated.questionIds[0].pop();assert.throws(()=>validateExamForm(truncated,n2));const changed=structuredClone(s);changed.sectionSeconds[0]=600;assert.throws(()=>validateExamForm(changed,n2));assert.throws(()=>validateExamForm(s,{...n2,id:'other'}));
});

test('N2 daily learning and unpracticed concepts link to the selected main course',async()=>{
 const {makeDailyPlan}=await import('../app/core/daily-plan.mjs'),{storeDailyPlan,startDailyStep}=await import('../app/core/v3-learning.mjs');
 const {concepts}=await import('../app/content/concepts.mjs'),{v3Questions}=await import('../app/content/practice-v3.mjs'),{allUnits}=await import('../app/content/catalog.mjs');
 const {dailyView,weaknessesView}=await import('../app/ui/v3.mjs');
 const raw=setLearningGoal(initialState(),'N2');const plan=makeDailyPlan(raw,{concepts,questions:v3Questions,units:allUnits,resolveQuestion:id=>v3Questions.find(q=>q.id===id),time,id:'n2-daily'});
 assert.equal(plan.unitId,'N2-01');let state=startDailyStep(storeDailyPlan(raw,plan),plan.id,'recall',time);
 const ctx={state,session:{},allUnits};assert.match(dailyView(ctx,plan.id),/href="#study\/N2-01"/);assert.doesNotMatch(dailyView(ctx,plan.id),/href="#deep\/N2-/);
 const restored=parseBackup(exportBackup(state));assert.deepEqual(restored.v3.dailyPlans,state.v3.dailyPlans);
 const weak=weaknessesView(ctx);for(const c of concepts.filter(c=>c.level==='N2'))assert(weak.includes(`href="#study/${c.unitIds[0]}"`));assert.doesNotMatch(weak,/href="#deep\/"/);
});

test('N2 concept examples have generated audio and are required by their offline pack',async()=>{
 const fs=await import('node:fs/promises');const {concepts}=await import('../app/content/concepts.mjs');
 const records=JSON.parse(await fs.readFile(new URL('../app/assets/audio-records-v2.json',import.meta.url),'utf8'));
 const audio=JSON.parse(await fs.readFile(new URL('../app/assets/audio.json',import.meta.url),'utf8'));
 const {buildManifests}=await import('../scripts/offline-index.mjs');const {fileURLToPath}=await import('node:url');
 const {offline}=await buildManifests({appDir:fileURLToPath(new URL('../app/',import.meta.url)),audioIndex:audio,concepts});const pack=offline.packs.find(p=>p.id==='N2');
 for(const c of concepts.filter(c=>c.level==='N2')){assert(records.some(r=>r.text===c.example.jp));assert(audio[c.example.jp]);assert(pack.files.includes(audio[c.example.jp]));}
 const missing=await buildManifests({appDir:fileURLToPath(new URL('../app/',import.meta.url)),audioIndex:{},concepts});assert.equal(missing.offline.packs.find(p=>p.id==='N2').missingAudioCount,8);
});
