import test from 'node:test';import assert from 'node:assert/strict';
import {presentationOrder} from '../app/core/study.mjs';
test('選項洗牌保留原索引、續練順序穩定，不讓正解永遠在第一個',()=>{
 const first=presentationOrder(4,'session-a:q1');assert.deepEqual([...first].sort(),[0,1,2,3]);assert.deepEqual(presentationOrder(4,'session-a:q1'),first);
 const positions=new Set(Array.from({length:20},(_,i)=>presentationOrder(4,`session-${i}:q1`).indexOf(0)));assert.ok(positions.size>=3);
});
