import test from 'node:test';
import assert from 'node:assert/strict';
import {makeKanaQuiz} from '../app/core/quiz.mjs';
test('同音假名不被放進互斥選項，避免聽辨不可能判斷',()=>{
 const all=[{id:'h-o',glyph:'お',reading:'o',script:'hira'},{id:'h-wo',glyph:'を',reading:'o',script:'hira'},...['a','i','u','e'].map(x=>({id:`h-${x}`,glyph:x,reading:x,script:'hira'}))];
 const questions=makeKanaQuiz([all[1]],all);
 assert.equal(questions.length,2);
 for(const q of questions){assert.equal(new Set(q.options.map(o=>o.label)).size,q.options.length);assert.equal(q.options.filter(o=>['お','を'].includes(o.label)).length,q.dimension==='listening'?1:0);}
});
test('無可用干擾項時不產生只有一個選項的假測驗',()=>{assert.deepEqual(makeKanaQuiz([{id:'h-a',glyph:'あ',reading:'a',script:'hira'}],[{id:'h-a',glyph:'あ',reading:'a',script:'hira'}]),[]);});
