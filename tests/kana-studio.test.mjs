import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {setHintStage,startDictation,updateDictationPoints,lockDictation,revealDictationHint,finishDictation,readDictation,dictationKey} from '../app/core/kana-studio.mjs';
const item='h-306c',time='2026-10-21T04:00:00.000Z',later='2026-10-21T05:00:00.000Z',points=[[{x:.2,y:.2},{x:.8,y:.8}]];
test('hint stages persist, merge with old schema3 backups and never create mastery attempts',()=>{
 const old=initialState(),shown=setHintStage(old,item,0,time),hidden=setHintStage(shown,item,3,later);
 assert.equal(hidden.v3.kanaHints[item].stage,3);assert.equal(hidden.v3.kanaHints[item].lastHintAt,time);assert.equal(hidden.attempts.length,0);
 assert.deepEqual(parseBackup(exportBackup(hidden)),hidden);assert.equal(mergeStates(old,hidden).v3.kanaHints[item].stage,3);
 assert.equal(mergeStates(hidden,shown).v3.kanaHints[item].stage,3);assert.throws(()=>setHintStage(old,item,4,time));
});
test('dictation isolates tracing drafts, freezes original strokes and keeps hints across reload',()=>{
 let s=initialState();s.drafts[`write:${item}`]={text:'',points,time};s=startDictation(s,{item,id:'one',time});
 assert.deepEqual(readDictation(s,item).points,[]);assert.deepEqual(s.drafts[`write:${item}`].points,points);
 s=updateDictationPoints(s,item,points,time);s=revealDictationHint(s,item,time);s=lockDictation(s,item,later);
 const restored=parseBackup(exportBackup(s));assert.equal(readDictation(restored,item).meta.hinted,true);assert.equal(readDictation(restored,item).meta.stage,'locked');
 assert.deepEqual(updateDictationPoints(restored,item,[],later),restored);assert.deepEqual(readDictation(restored,item).points,points);
});
test('comparison requires a committed original and self-rating saves once without claiming automatic recognition',()=>{
 let s=startDictation(initialState(),{item,id:'one',time});assert.throws(()=>lockDictation(s,item,time));
 s=updateDictationPoints(s,item,points,time);assert.throws(()=>finishDictation(s,{item,taskId:'one',shape:true,order:true,confirmed:true,time}));
 s=lockDictation(s,item,time);s=finishDictation(s,{item,taskId:'one',shape:false,order:false,confirmed:true,time:later});
 assert.equal(s.artifacts.length,1);assert.deepEqual(s.artifacts[0].points,points);assert.equal(s.attempts.length,1);assert.equal(s.attempts[0].correct,false);assert.equal(s.attempts[0].hinted,false);assert.equal(s.attempts[0].dimension,'writing');assert.match(s.artifacts[0].text,/自評/);
 assert(!s.drafts[dictationKey(item)]);assert.deepEqual(finishDictation(s,{item,taskId:'one',shape:true,order:true,confirmed:true,time:later}),s);
});
test('same-day visual hints carry into dictation while next-day unhinted self checks remain separate',()=>{
 let s=setHintStage(initialState(),item,0,time);s=setHintStage(s,item,3,later);s=startDictation(s,{item,id:'one',time:later});assert.equal(readDictation(s,item).meta.hinted,true);
 let next=startDictation(s,{item:'h-3081',id:'other',time:later});assert.equal(readDictation(next,'h-3081').meta.hinted,false);
 next=setHintStage(next,'h-3081',1,later);assert.equal(readDictation(next,'h-3081').meta.hinted,true);
});
test('malformed studio draft metadata and unknown hint cards are rejected without overwriting legacy progress',()=>{
 const s=startDictation(initialState(),{item,id:'one',time});const bad=structuredClone(s);bad.drafts[dictationKey(item)].text='{"stage":"locked"}';assert.throws(()=>parseBackup(exportBackup(bad)));
 assert.throws(()=>setHintStage(s,'unknown',0,time));assert.equal(readDictation(s,item).meta.stage,'writing');
});
test('merging a newer unlocked branch cannot replace a locked original or erase hint history',()=>{
 let base=startDictation(initialState(),{item,id:'one',time});base=updateDictationPoints(base,item,points,time);
 const locked=lockDictation(base,item,time);let branch=revealDictationHint(base,item,later);branch=updateDictationPoints(branch,item,[[{x:.1,y:.9}]],later);
 const joined=mergeStates(locked,branch);assert.equal(readDictation(joined,item).meta.stage,'locked');assert.equal(readDictation(joined,item).meta.hinted,true);assert.deepEqual(readDictation(joined,item).points,points);
 assert.throws(()=>mergeStates(base,startDictation(initialState(),{item,id:'other',time:later})),/不同.*默寫/);
});

test('completed dictation cannot import a hinted branch as an unhinted first answer',()=>{
 let base=startDictation(initialState(),{item,id:'one',time});base=updateDictationPoints(base,item,points,time);
 const locked=lockDictation(base,item,time),saved=finishDictation(locked,{item,taskId:'one',shape:true,order:true,confirmed:true,time});
 assert.throws(()=>mergeStates(saved,revealDictationHint(base,item,later)),/提示.*衝突/);
 assert.throws(()=>mergeStates(revealDictationHint(base,item,later),saved),/提示.*衝突/);
 assert(!mergeStates(saved,locked).drafts[dictationKey(item)]);
});
