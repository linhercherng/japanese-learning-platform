import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {kanaRows,rowById,rowRounds,rowRoundById,rowVisibleItems,validRowReference} from '../app/content/kana-row.mjs';
import {startRow,pendingRow} from '../app/core/kana-row.mjs';import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';import {recordKanaExposure} from '../app/core/kana-studio.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-22T13:00:00.000Z';
test('20 rows cover 90 existing clear kana without inventing empty cells or placing the nasal in a vowel column',()=>{
 assert.equal(kanaRows.length,20);const items=kanaRows.flatMap(r=>r.cells.filter(Boolean));assert.equal(items.length,90);assert.equal(new Set(items.map(k=>k.id)).size,90);assert(items.every(k=>k.group==='basic'&&!['ん','ン'].includes(k.glyph)));
 assert.deepEqual(rowById.get('h-8').cells.map(k=>k?.glyph||null),['や',null,'ゆ',null,'よ']);assert.deepEqual(rowById.get('k-10').cells.map(k=>k?.glyph||null),['ワ',null,null,null,'ヲ']);assert.equal(rowById.get('h-10').cells[4].reading,'o');
 for(const r of kanaRows){assert.equal(r.cells.length,5);assert(r.cells.filter(Boolean).every(k=>k.script===r.script));}
});
test('36 fixed rounds reuse canonical listening questions with normal audio and 2/3 distinct targets in a non-chant order',()=>{
 assert.equal(rowRounds.length,36);assert.equal(new Set(rowRounds.flatMap(r=>r.questionIds)).size,90);const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');
 for(const round of rowRounds){assert([2,3].includes(round.questionIds.length));assert(validRowReference(round.id,round.questionIds));const row=rowById.get(round.rowId),members=row.cells.filter(Boolean).slice(round.part==='a'?0:3,round.part==='a'?3:5);assert.notEqual(round.questionIds[0],'kc:check:'+members[0].id+':listen');
  for(const id of round.questionIds){const q=resolveLearningQuestion(id);assert.equal(q.kind,'listen');assert.equal(q.dimension,'listening');assert.equal(q.options.length,4);assert(members.some(k=>k.id===q.reviewItem));assert(audio[q.transcript]);assert(pack.files.includes(audio[q.transcript]));}
 }
});
test('row reference, complete original order and queue reject forged or unavailable rounds',()=>{
 const round=rowRoundById.get('h-2-a');assert(!validRowReference('h-2-b',round.questionIds));assert(!validRowReference('h-8-b',round.questionIds));assert(!validRowReference('h-2-a',[...round.questionIds].reverse()));assert(!validRowReference('h-2-a',round.questionIds.slice(0,2)));
 const state=startRow(initialState(),{round:round.id,id:'r',time});const bad=structuredClone(state);bad.v3.sessions[0].reference='h-3-a';assert.throws(()=>parseBackup(exportBackup(bad)));const repeat=structuredClone(state);repeat.v3.sessions[0].queue[0].questionId='kc:check:k-30ab:listen';assert.throws(()=>parseBackup(exportBackup(repeat)));
});
test('an unfinished row resumes the same fixed round even when the other half is requested, while other rows are independent',()=>{
 let s=startRow(initialState(),{round:'h-2-a',id:'r',time});s=startRow(s,{round:'h-2-b',id:'other',time});assert.equal(s.v3.sessions.length,1);assert.equal(pendingRow(s,'h-2').id,'r');assert.equal(pendingRow(s,'h-2').reference,'h-2-a');assert.equal(startRow(s,{round:'bad',id:'bad',time}),s);s=startRow(s,{round:'h-8-a',id:'sparse',time});assert.equal(s.v3.sessions.length,2);
});
test('today and open-round target cues count as hints without rewriting original answers, future and previous-day cues do not',()=>{
 const q=resolveLearningQuestion(rowRoundById.get('h-2-a').questionIds[0]);
 for(const [cue,expected] of [['2026-10-22T12:00:00Z',true],['2026-10-21T12:00:00Z',false],['2026-10-23T12:00:00Z',false]]){
  let s=recordKanaExposure(initialState(),[q.reviewItem],cue);s=startRow(s,{round:'h-2-a',id:'r',time});s=answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'a',time});assert.equal(s.v3.sessions[0].answers[q.id].hinted,expected);assert.equal(s.v3.sessions[0].hints.length,0);const after=recordKanaExposure(s,[q.reviewItem],'2026-10-23T13:00:00Z');assert.deepEqual(after.v3.sessions[0].answers,s.v3.sessions[0].answers);
 }
 let s=startRow(initialState(),{round:'h-2-a',id:'r',time:'2026-10-21T12:00:00Z'});s=recordKanaExposure(s,[q.reviewItem],'2026-10-21T13:00:00Z');s=answerV3Session(s,{sessionId:'r',question:q,value:1,eventId:'a',time});assert.equal(s.v3.sessions[0].answers[q.id].hinted,true);assert.equal(s.v3.sessions[0].answers[q.id].correct,false);
});
test('selected cell exposure includes only actual visible text, and excludes nonmembers and blank columns',()=>{
 assert.deepEqual(rowVisibleItems('h-8','h-3044'),[]);assert.deepEqual(rowVisibleItems('bad','h-304b'),[]);const ids=rowVisibleItems('h-2','h-304b');assert(ids.includes('h-304b'));assert(!ids.includes('h-3051'));assert(!ids.includes('k-30ab'));
});
test('first answers survive refresh, merge and completion; later practice does not replace them',()=>{
 let s=startRow(initialState(),{round:'h-10-a',id:'r',time}),q=resolveLearningQuestion(s.v3.sessions[0].questionIds[0]);const empty=structuredClone(s);s=answerV3Session(s,{sessionId:'r',question:q,value:1,eventId:'wrong',time});const first=structuredClone(s.v3.sessions[0].answers);assert.equal(answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'again',time}),s);s=mergeStates(empty,parseBackup(exportBackup(s)));assert.deepEqual(s.v3.sessions[0].answers,first);s=nextV3Question(s,'r',time);q=resolveLearningQuestion(s.v3.sessions[0].questionIds[1]);s=answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'right',time});s=nextV3Question(s,'r',time);assert(s.v3.sessions[0].completedAt);assert.equal(s.attempts.length,2);assert.equal(pendingRow(s,'h-10'),undefined);assert.equal(s.v3.sessions[0].answers[Object.keys(first)[0]].correct,false);
});
