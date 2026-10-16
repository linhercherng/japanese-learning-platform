import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,exportBackup,parseBackup,recordAnswer} from '../app/core/learning.mjs';
import {createPractice,answerPractice} from '../app/core/study.mjs';
const time='2026-10-16T04:00:00.000Z';

test('Nine source comparisons distinguish existing capabilities and applied content with dated official links',async()=>{
 const {resources,supportCategories}=await import('../app/content/support-resources.mjs');
 assert.equal(resources.length,9);assert.equal(new Set(resources.map(r=>r.id)).size,9);
 for(const r of resources){assert.match(r.url,/^https:\/\//);assert.equal(r.checkedDate,'2026-10-16');assert(r.title?.length>=2);for(const k of ['strength','existing','gap','applied','note'])assert(r[k]?.length>=8,`${r.id} ${k}`);}
 assert.deepEqual(supportCategories.map(c=>c.id),['pronunciation','grammar','words','culture','reading']);
});

test('Eight original readings cover N5 to N2 with contextual clues and unambiguous answer data',async()=>{
 const {readingLessons}=await import('../app/content/support-readings.mjs');assert.equal(readingLessons.length,8);
 for(const level of ['N5','N4','N3','N2']){const list=readingLessons.filter(u=>u.level===level);assert.equal(list.length,2);for(const u of list){assert([...u.reading.jp].length>={N5:80,N4:160,N3:260,N2:450}[level]);assert.equal(u.reading.questions.length,3);assert(u.annotations.length>=3);assert(u.annotations.every(a=>u.reading.jp.includes(a.quote)&&a.explanation.length>10));assert.equal(u.reviewStatus,'trial');for(const q of u.reading.questions){assert.equal(q.dimension,'reading');assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.optionReasons.length,q.options.length);assert(q.correct>=0&&q.correct<q.options.length);}}}
});

test('Supplements enter the existing question, backup and first-answer loop while main courses remain distinct',async()=>{
 const {supportLessons}=await import('../app/content/learning-support.mjs'),{readingLessons}=await import('../app/content/support-readings.mjs');
 const {allUnits,units,forms,resolveQuestion,unitQuestions,knownLessons}=await import('../app/content/catalog.mjs');assert.equal(units.length,114);assert.equal(forms.length,8);
 assert.equal(allUnits.length,238);const ids=new Set();for(const u of [...supportLessons,...readingLessons]){assert(knownLessons.has(u.id));for(const q of unitQuestions(u)){assert(!ids.has(q.id));ids.add(q.id);assert(resolveQuestion(q.id));if(q.dimension==='reading')assert.equal(resolveQuestion(q.id).passage,u.reading.jp);}}
 const u=supportLessons[0],q=unitQuestions(u)[0],p=createPractice({id:'support-test',unitId:u.id,questionIds:unitQuestions(u).map(q=>q.id),time});
 const answer=q.kind==='cloze'?'不正確':q.kind==='order'?[]:(q.correct+1)%q.options.length;const answered=answerPractice(p,q,answer,{time});assert.deepEqual(answerPractice(answered,q,q.correct,{time}),answered);
 let state=recordAnswer(initialState(),{id:'support-answer',item:q.id,dimension:q.dimension,correct:false,hinted:false,time});state.practice=answered;state.drafts[`text:${u.id}`]={text:'練習草稿',points:[],time};const restored=parseBackup(exportBackup(state));assert.deepEqual(restored.practice,answered);assert.equal(restored.drafts[`text:${u.id}`].text,'練習草稿');
});

test('Support navigation and unit details preserve safe rendering and keep reading clues out of unanswered questions',async()=>{
 const {supportView}=await import('../app/ui/support.mjs'),{coursesView,practiceHubView}=await import('../app/ui/courses.mjs'),{studyView,questionView}=await import('../app/ui/study.mjs');
 const {readingLessons}=await import('../app/content/support-readings.mjs');const ctx={state:initialState(),session:{},writingItems:[]};
 assert.match(coursesView(ctx),/href="#support"/);assert.match(practiceHubView(ctx),/href="#support"/);
 for(const category of ['pronunciation','grammar','words','culture','reading'])assert.match(supportView(ctx),new RegExp(`href="#support/${category}"`));
 assert.match(supportView(ctx,'reading'),/READ-N2-02/);assert.match(supportView(ctx,'missing'),/href="#support"/);assert.match(supportView(ctx,'<img src=x>'),/找不到/);
 const u=readingLessons[0],html=studyView({...ctx,session:{studyTab:'read'}},u.id);assert.match(html,/閱讀線索/);assert.match(html,/summary/);assert.match(html,/#support\/reading/);assert(!questionView({...u.reading.questions[0],passage:u.reading.jp},{}).includes(u.annotations[0].explanation));
});
