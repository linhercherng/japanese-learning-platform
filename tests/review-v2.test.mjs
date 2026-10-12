import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewQuestions,resolveQuestion,words} from '../app/content/catalog.mjs';
import {initialState,recordAnswer,recordAnswers} from '../app/core/learning.mjs';
test('分級題、詞卡與舊假名都能進入真正可作答的到期複習',()=>{
 const ids=['N5-01-v',`${words[0].id}-read`,'h-3042','K13-p0'];
 const questions=reviewQuestions(ids.map((item,i)=>({item,dimension:i===2?'listening':i===3?'language':'vocabulary'})));
 assert.equal(questions.length,4);for(const q of questions)assert.ok(resolveQuestion(q.id));assert.equal(questions[2].reviewItem,'h-3042');assert.equal(questions[2].kind,'listen');
 assert.deepEqual(reviewQuestions([{item:'unknown',dimension:'reading'}]),[]);
});
test('整卷作答批次保存與逐題保存的複習結果一致，重送不倍增',()=>{
 const attempts=Array.from({length:70},(_,i)=>({id:`event-${i}`,item:`question-${i}`,dimension:'reading',correct:i%2===0,hinted:false,time:'2026-10-13T08:00:00.000Z'}));
 const batch=recordAnswers(initialState(),attempts),single=attempts.reduce(recordAnswer,initialState());assert.deepEqual(batch,single);assert.deepEqual(recordAnswers(batch,attempts),batch);
});
