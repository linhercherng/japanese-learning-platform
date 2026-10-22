import test from 'node:test';import assert from 'node:assert/strict';
import {kana} from '../app/content/kana.mjs';
import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {validatePocket,mergePocket} from '../app/core/kana-pocket-state.mjs';
import {setPocket,pocketItems,newPocketRound,advancePocket} from '../app/core/kana-pocket.mjs';
const time='2026-10-22T14:00:00.000Z',later='2026-10-23T14:00:00.000Z';
test('all 208 legal cards can be bookmarked without adding attempts or changing schema; old backups still work',()=>{
 let s=initialState();assert(!s.v3.kanaPocket);assert.deepEqual(pocketItems(parseBackup(exportBackup(s))),[]);
 for(const k of kana)s=setPocket(s,k.id,true,time);
 assert.equal(pocketItems(s).length,208);assert.equal(s.schema,3);assert.equal(s.attempts.length,0);assert.deepEqual(parseBackup(exportBackup(s)).v3.kanaPocket,s.v3.kanaPocket);
});
test('strict pocket validation rejects unknown IDs, extra fields, non-boolean activity and invalid timestamps',()=>{
 for(const bad of [null,[],{'fake':{active:true,time}},{'h-3042':{active:1,time}},{'h-3042':{active:true,time:'2026-02-30T14:00:00.000Z'}},{'h-3042':{active:true,time,score:1}},{'h-3042':{active:true,time:'yesterday'}}]){
  assert.throws(()=>validatePocket(bad));const s=initialState();s.v3.kanaPocket=bad;assert.throws(()=>parseBackup(exportBackup(s)));
 }
});
test('explicit removal survives stale backup merges; later add wins and equal-time conflicts conservatively retain a card',()=>{
 const added=setPocket(initialState(),'h-3042',true,time),removed=setPocket(added,'h-3042',false,later);
 for(const [a,b]of [[added,removed],[removed,added]]){const merged=mergeStates(a,b);assert.equal(pocketItems(merged).length,0);assert.equal(merged.v3.kanaPocket['h-3042'].active,false);}
 const readded=setPocket(removed,'h-3042',true,'2026-10-24T14:00:00.000Z');assert.equal(pocketItems(mergeStates(removed,readded)).length,1);
 const x={'h-3042':{active:true,time}},y={'h-3042':{active:false,time}};assert.deepEqual(mergePocket(x,y),mergePocket(y,x));assert(mergePocket(x,y)['h-3042'].active);assert.deepEqual(mergePocket(x,x),x);
 assert.deepEqual(setPocket(removed,'h-3042',true,time),removed);
});
test('oldest retained cards first, at most three distinct mixed cards; a running round stays fixed as the pocket changes',()=>{
 let s=initialState();for(const id of ['k-30a2','h-3042','h-304c','h-304d'])s=setPocket(s,id,true,time);
 s=setPocket(s,'h-3042',true,later);const ids=pocketItems(s).map(k=>k.id);assert.equal(ids.at(-1),'h-3042');
 const r=newPocketRound(s,'round');assert.equal(r.queue.length,3);assert.equal(new Set(r.queue).size,3);assert.deepEqual(r.queue,ids.slice(0,3));
 const fixed=r.queue.slice();s=setPocket(s,r.queue[0],false,later);assert.deepEqual(r.queue,fixed);assert.notDeepEqual(newPocketRound(s,'next').queue,r.queue);
 assert.equal(newPocketRound(initialState(),'empty').queue.length,0);
});
test('a pocket round requires reveal before self-assessment, ignores stale cursor and has no automatic repeats',()=>{
 let s=initialState();for(const k of kana.slice(0,3))s=setPocket(s,k.id,true,time);let r=newPocketRound(s,'round');
 assert.equal(advancePocket(r,{item:r.queue[0],index:0}),r);
 for(let i=0;i<3;i++){r={...r,revealed:true};const old=r;r=advancePocket(r,{item:r.queue[i],index:i});assert.equal(r.cursor,i+1);assert.equal(r.revealed,false);assert.equal(advancePocket(r,{item:old.queue[i],index:i}),r);}
 assert.equal(r.queue.length,3);assert.equal(s.attempts.length,0);
});
