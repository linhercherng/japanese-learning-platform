import test from 'node:test';
import assert from 'node:assert/strict';
import {practicePool,forms} from '../app/content/catalog.mjs';
test('能力練習限制選定級別，不混入獨立模擬卷',()=>{
 const pool=practicePool({level:'N4',dimension:'listening'});assert.ok(pool.length);assert.ok(pool.every(q=>q.level==='N4'&&q.dimension==='listening'));
 const examIds=new Set(forms.flatMap(f=>f.sections.flatMap(s=>s.questions.map(q=>q.id))));assert.ok(practicePool().every(q=>!examIds.has(q.id)));
});
test('假名認字與聽辨可分開練，沒有符合題目時維持空集合',()=>{
 const recognize=practicePool({level:'K',dimension:'recognition'}),listen=practicePool({level:'K',dimension:'listening'});assert.equal(recognize.length,208);assert.equal(listen.length,208);assert.ok(listen.every(q=>q.kind==='listen'));assert.deepEqual(practicePool({level:'K',dimension:'reading'}),[]);
});
