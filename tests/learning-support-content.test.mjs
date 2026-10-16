import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeQuestion} from '../app/core/study.mjs';

const load=()=>import('../app/content/learning-support.mjs');
test('support curriculum supplies 24 distinct original lessons in four useful categories',async()=>{
 const {supportLessons}=await load();
 assert.equal(supportLessons.length,24);
 const counts=Object.fromEntries(['pronunciation','grammar','words','culture'].map(c=>[c,supportLessons.filter(l=>l.category===c).length]));
 assert.deepEqual(counts,{pronunciation:6,grammar:8,words:4,culture:6});
 assert.equal(new Set(supportLessons.map(l=>l.title)).size,24);
 assert.deepEqual(supportLessons.map(l=>l.id),Array.from({length:24},(_,i)=>`SUP-${String(i+1).padStart(2,'0')}`));
 const unitIds=new Set((await Promise.all(['n5','n4','n3','n2'].map(async name=>(await import(`../app/content/${name}.mjs`)).units))).flat().map(l=>l.id));
 const sources=new Set(['marugoto','irodori','bunpro','wanikani','satori','tadoku','taekim','ojad','sigure']);
 const topics=new Set(['greetings','family','schedule','food','shopping','transport','travel','weather','health','help','routine','school','work','hobbies','sport','home','mail','public','technology','culture']);
 for(const lesson of supportLessons){
  assert(['N5','N4','N3','N2'].includes(lesson.level),lesson.id);
  assert.equal(lesson.kind,'support');assert.equal(lesson.minutes,15);
  assert.equal(lesson.reviewStatus,'trial');assert.equal(lesson.contentVersion,'2026-10-16.1');
  assert(topics.has(lesson.topic),lesson.id);
  assert(lesson.goal.length>20&&lesson.memoryTip.includes('非字源'),lesson.id);
  assert(lesson.relatedUnitIds.length&&lesson.relatedUnitIds.every(id=>unitIds.has(id)),lesson.id);
  assert(lesson.sourceIds.length&&lesson.sourceIds.every(id=>sources.has(id)),lesson.id);
  assert(lesson.vocabulary.length>=4&&lesson.grammar.length>=1,lesson.id);
  for(const word of lesson.vocabulary)for(const field of ['jp','reading','zh','example','exampleZh'])assert(word[field]?.trim(),`${lesson.id} ${field}`);
  for(const grammar of lesson.grammar){for(const field of ['pattern','meaning','formation','explanation','contrast','pitfall'])assert(grammar[field]?.length>3,`${lesson.id} ${field}`);assert(grammar.examples.length>=2);for(const ex of grammar.examples)assert(ex.jp&&ex.zh);}
  assert(Array.isArray(lesson.kanji)&&Array.isArray(lesson.dialogue));
  assert(lesson.writing.prompt&&lesson.writing.sample&&lesson.writing.checklist.length>=3,lesson.id);
 }
});

test('support questions have unique answers, actionable explanations and grade correctly',async()=>{
 const {supportLessons}=await load();const seen=new Set();
 for(const lesson of supportLessons){assert.equal(lesson.questions.length,3,lesson.id);
  for(const q of lesson.questions){
   assert(!seen.has(q.id),q.id);seen.add(q.id);assert(q.id.startsWith(lesson.id+'-'));
   assert(q.explanation.length>15&&q.prompt.length>8,q.id);
   assert(['choice','cloze','order'].includes(q.kind));
   const answer=q.kind==='choice'?q.correct:q.kind==='cloze'?q.accepted[0]:q.answerOrder;
   assert(gradeQuestion(q,answer),q.id);
   if(q.kind==='choice'){
    assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.optionReasons.length,q.options.length);
    assert(q.optionReasons.every(reason=>reason.length>8));
    for(let i=0;i<q.options.length;i++)assert.equal(gradeQuestion(q,i),i===q.correct,q.id);
   }else if(q.kind==='cloze')assert(!gradeQuestion(q,'完全不相關的錯誤答案'));
   else assert(!gradeQuestion(q,[...answer].reverse()));
  }
 }
 assert.equal(seen.size,72);
});

test('support content preserves important exceptions, register and pronunciation boundaries',async()=>{
 const {supportLessons}=await load();const byId=new Map(supportLessons.map(l=>[l.id,l]));
 const text=id=>JSON.stringify(byId.get(id));
 for(const verb of ['入る','走る','帰る'])assert(text('SUP-07').includes(verb));
 assert(text('SUP-08').includes('行って')&&text('SUP-08').includes('例外'));
 for(const form of ['よくない','よかった','よくなかった'])assert(text('SUP-09').includes(form));
 for(const ending of ['と','ば','たら','なら'])assert(text('SUP-14').includes(ending));
 assert(text('SUP-14').includes('重疊'));
 for(const word of ['手紙','勉強','大丈夫'])assert(text('SUP-17').includes(word));
 assert(text('SUP-06').includes('OJAD')&&text('SUP-06').includes('合成音')&&text('SUP-06').includes('東京'));
 assert(text('SUP-19').includes('いらっしゃる')&&text('SUP-19').includes('伺う'));
});
