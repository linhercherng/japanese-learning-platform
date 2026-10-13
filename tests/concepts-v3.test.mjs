import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {concepts,conceptById} from '../app/content/concepts.mjs';
import {v3Questions,v3QuestionById,questionsForConcept} from '../app/content/practice-v3.mjs';
import {deepLessons,deepLessonById} from '../app/content/deep-lessons.mjs';
import {confusionPairs} from '../app/content/confusions.mjs';
import {kana,kanaLessons} from '../app/content/kana.mjs';
import {allUnits,grammarItems,questionById} from '../app/content/catalog.mjs';
import {gradeQuestion} from '../app/core/study.mjs';
const audio=JSON.parse(readFileSync(new URL('../app/assets/audio.json',import.meta.url)));
const unitIds=new Set([...allUnits,...kanaLessons].map(u=>u.id));
const itemIds=new Set([...kana,...grammarItems].map(i=>i.id).concat([...questionById.keys()]));

test('V3 concepts cover kana and three levels with usable teaching and existing references',()=>{
 assert.equal(concepts.length,30);
 assert.deepEqual(Object.fromEntries(['K','N5','N4','N3'].map(l=>[l,concepts.filter(c=>c.level===l).length])),{K:8,N5:14,N4:4,N3:4});
 assert.equal(conceptById.size,30);
 for(const c of concepts){
  assert.match(c.id,/^c-[a-z0-9-]+$/);
  assert.ok(c.unitIds.length&&c.unitIds.every(id=>unitIds.has(id)),`${c.id} lesson reference`);
  assert.ok(c.itemIds.length&&c.itemIds.every(id=>itemIds.has(id)),`${c.id} item reference`);
  assert.equal(new Set(c.itemIds).size,c.itemIds.length);
  if(c.level!=='K')assert.ok(c.itemIds.some(id=>questionById.has(id)&&!id.startsWith('v3q-')),`${c.id} existing V2 question`);
  assert.ok(c.title.length>=3&&c.explanation.length>=30&&c.memoryTip.length>=15);
  assert.ok(c.example.jp&&c.example.zh);
  assert.ok(c.dimensions.length>=2);
 }
});

test('concept retrieval supports dimension filters without leaking unrelated questions',()=>{
 assert.deepEqual(questionsForConcept('missing'),[]);
 const all=questionsForConcept('c-k-shi-tsu');
 assert.ok(all.length>=3);
 const listening=questionsForConcept('c-k-shi-tsu','listening');
 assert.ok(listening.length>0&&listening.length<all.length);
 assert.ok(listening.every(q=>q.conceptId==='c-k-shi-tsu'&&q.dimension==='listening'));
 assert.deepEqual(questionsForConcept('c-k-shi-tsu','not-a-dimension'),[]);
 assert.deepEqual(questionsForConcept('c-k-shi-tsu'),all);
});

test('V3 has at least ninety individually contextualized questions with valid grading and reasons',()=>{
 assert.ok(v3Questions.length>=90);
 assert.equal(v3QuestionById.size,v3Questions.length);
 assert.equal(new Set(v3Questions.map(q=>q.prompt)).size,v3Questions.length,'unique prompts');
 for(const c of concepts){
  const qs=questionsForConcept(c.id);
  assert.ok(qs.length>=3,`${c.id} variants`);
  assert.ok(new Set(qs.map(q=>q.kind)).size>=2,`${c.id} retrieval variety`);
  assert.ok(new Set(qs.map(q=>q.dimension)).size>=2,`${c.id} dimensions`);
 }
 for(const q of v3Questions){
  assert.match(q.id,/^v3q-[a-z0-9-]{1,74}$/);
  assert.ok(conceptById.has(q.conceptId)&&unitIds.has(q.unitId));
  assert.ok(conceptById.get(q.conceptId).unitIds.includes(q.unitId));
  assert.ok(conceptById.get(q.conceptId).dimensions.includes(q.dimension));
  assert.ok(q.prompt.length>=8&&q.explanation.length>=15,`${q.id} teaching`);
  if(q.kind==='choice'||q.kind==='listen'){
   assert.ok(q.options.length>=3&&new Set(q.options).size===q.options.length);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length);
   assert.equal(q.optionReasons.length,q.options.length);
   assert.ok(q.optionReasons.every(r=>r.length>=8));
   assert.equal(new Set(q.optionReasons).size,q.options.length,'individual reasons');
   assert.ok(gradeQuestion(q,q.correct));
   assert.ok(!gradeQuestion(q,(q.correct+1)%q.options.length));
  }else if(q.kind==='cloze'){
   assert.ok(q.accepted.length&&q.accepted.every(a=>a.trim()));
   assert.ok(gradeQuestion(q,q.accepted[0]));
   assert.ok(!gradeQuestion(q,'完全無關的答案'));
  }else{
   assert.equal(q.kind,'order');
   assert.equal(new Set(q.answerOrder).size,q.tokens.length);
   assert.ok(gradeQuestion(q,q.answerOrder));
  }
  if(q.kind==='listen'){
   assert.ok(audio[q.transcript],`${q.id} audio index`);
   assert.ok(existsSync(new URL(`../app/${audio[q.transcript]}`,import.meta.url)),`${q.id} audio file`);
  }
 }
});

test('six confusion pairs reference real kana and identify actual distinguishing details',()=>{
 assert.deepEqual(confusionPairs.map(p=>`${p.left}/${p.right}`),['シ/ツ','ソ/ン','ぬ/め','れ/ね','は/ほ','わ/れ']);
 const byId=new Map(kana.map(k=>[k.id,k]));
 for(const p of confusionPairs){
  assert.equal(byId.get(p.leftId)?.glyph,p.left);
  assert.equal(byId.get(p.rightId)?.glyph,p.right);
  assert.ok(conceptById.has(p.conceptId));
  assert.ok(p.difference.length>=25&&p.memoryTip.length>=15);
 }
});

test('twelve deep lessons provide all six learning stages and covered listening materials',()=>{
 const expected=['K01','K07','K13','K18','N5-01','N5-02','N5-03','N5-04','S-N5-greetings','S-N5-food','S-N5-shopping','S-N5-transport'];
 assert.deepEqual(deepLessons.map(l=>l.id),expected);
 assert.equal(deepLessonById.size,12);
 const deepQuestionIds=deepLessons.flatMap(l=>l.questionIds);
 assert.equal(new Set(deepQuestionIds).size,deepQuestionIds.length,'deep lessons use separate transfer question refs');
 for(const l of deepLessons){
  assert.ok(unitIds.has(l.id)&&l.canDo.length>=20&&l.prerequisite.length>=10);
  assert.ok(l.point.explanation.length>=50&&l.point.formation.length>=10&&l.point.useWhen.length>=15);
  assert.ok(l.examples.length>=3&&l.examples.every(e=>e.jp&&e.zh&&e.note));
  assert.ok(l.contrast.correct&&l.contrast.wrong&&l.contrast.reason.length>=25);
  assert.ok(l.listening.length>=2&&l.listening.every(a=>audio[a.jp]&&a.zh&&existsSync(new URL(`../app/${audio[a.jp]}`,import.meta.url))),`${l.id} listening`);
  assert.ok(l.questionIds.length>=3&&new Set(l.questionIds).size===l.questionIds.length);
  assert.ok(l.questionIds.every(id=>v3QuestionById.has(id)),`${l.id} question refs`);
  assert.ok(l.writing.prompt.length>=30&&l.writing.sample&&l.writing.checklist.length>=3);
  assert.ok(l.nextReviewTip.length>=20);
 }
});
