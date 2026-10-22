import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {kana} from '../app/content/kana.mjs';
import {memoryFor} from '../app/content/kana-memory.mjs';
import {duelPairs,duelQuestions,duelQuestion,validDuelReference,flipCards,flipCueItems} from '../app/content/kana-sixth.mjs';
import {newFlip,advanceFlip,startDuel} from '../app/core/kana-sixth.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question,organizeV3} from '../app/core/v3-learning.mjs';
import {startWeekCheck,weekEvidence} from '../app/core/kana-recall.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {pairExposure} from '../app/content/kana-recall.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';
const time='2026-10-22T02:00:00.000Z';
test('every card starts a bounded same-script same-group flip group with existing cues and audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');
 for(const k of kana){const cards=flipCards(k.id);assert(cards.length>=1&&cards.length<=3);assert.equal(cards[0].id,k.id);assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);assert(cards.every(c=>c.script===k.script&&c.group===k.group));assert(flipCueItems(k.id,false).includes(k.id));assert(pack.files.includes(audio[k.glyph]));}
 assert.deepEqual(flipCards('unknown'),[]);assert.deepEqual(flipCueItems('unknown',true),[]);
 assert(flipCards('h-3071').every(k=>memoryFor(k.id).group==='semivoiced'));
});
test('duel partner feedback cannot turn into independent week evidence after organizing old rounds',()=>{
 let s=recordAnswer(initialState(),{id:'old',item:'h-3081',dimension:'listening',correct:true,hinted:false,time:'2026-09-01T00:00:00Z'});s=startWeekCheck(s,{id:'week',time:'2026-10-01T00:00:00Z'});
 s=startDuel(s,{pair:'nu-me',id:'duel',time:'2026-10-02T00:00:00Z'});const qs=duelQuestions.filter(q=>q.pairId==='nu-me');
 for(const [i,q]of qs.entries()){s=answerV3Session(s,{sessionId:'duel',question:q,value:q.correct,eventId:'duel-'+i,time:'2026-10-02T00:0'+i+':00Z'});s=nextV3Question(s,'duel','2026-10-02T00:02:00Z');}
 const q=resolveLearningQuestion(s.v3.sessions.find(s=>s.id==='week').questionIds[0]);s=answerV3Session(s,{sessionId:'week',question:q,value:q.correct,eventId:'check',time:'2026-10-20T00:00:00Z'});s=nextV3Question(s,'week','2026-10-20T00:01:00Z');
 const before=weekEvidence(s,s.v3.sessions.find(s=>s.id==='week'));assert.equal(before.total,0);assert.equal(before.excluded,1);const organized=organizeV3(s,time);assert(organized.v3.sessions.some(s=>s.id==='duel'));assert.deepEqual(weekEvidence(organized,organized.v3.sessions.find(s=>s.id==='week')),before);
});
test('twelve duel questions preserve two same-script choices, stable target IDs and offline audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');assert.equal(duelPairs.length,6);assert.equal(duelQuestions.length,12);
 for(const pair of duelPairs){const qs=duelQuestions.filter(q=>q.pairId===pair.id);assert.equal(qs.length,2);assert(validDuelReference(pair.id,qs.map(q=>q.id)));assert(!validDuelReference(pair.id,qs.slice().reverse().map(q=>q.id)));for(const q of qs){assert.equal(q.options.length,2);assert.equal(q.options[q.correct],kana.find(k=>k.id===q.reviewItem).glyph);assert.equal(q.dimension,'listening');assert(resolveLearningQuestion(q.id));assert(pack.files.includes(audio[q.transcript]));assert.equal(pairExposure(q.id),q.otherItem);}}
 assert.equal(duelQuestion('kd:unknown:h-3042'),null);assert(!validDuelReference('shi-tsu',[duelQuestions[0].id]));
});
test('flip retries need two intervening cards, happen once per card and never exceed six views',()=>{
 let r=newFlip('h-3042');const original=r.queue.slice();assert.equal(advanceFlip(r,{item:r.queue[0],index:0,again:true}),r); // reveal first
 for(let i=0;i<6;i++){const current=r.queue[r.cursor];if(!current)break;r={...r,revealed:true};const next=advanceFlip(r,{item:current,index:r.cursor,again:true});assert.equal(advanceFlip(next,{item:current,index:r.cursor,again:true}),next);r=next;}
 assert.deepEqual(r.queue.slice(0,3),original);assert.equal(r.queue.length,6);assert.equal(r.cursor,6);assert.equal(new Set(r.repeated).size,3);assert.equal(r.needs.length,3);
 let late=newFlip('h-3042');for(let i=0;i<3;i++){late={...late,revealed:true};late=advanceFlip(late,{item:late.queue[late.cursor],index:late.cursor,again:i===2});}assert.equal(late.queue.length,3);assert.equal(late.needs.length,1);
});
test('duel keeps first answers and the original pending round across backup, rejects mixed references',()=>{
 let s=startDuel(initialState(),{pair:'shi-tsu',id:'duel',time});const ids=s.v3.sessions[0].questionIds,q=duelQuestion(ids[0]);s=answerV3Session(s,{sessionId:'duel',question:q,value:q.correct,eventId:'first',time});
 s=answerV3Session(s,{sessionId:'duel',question:q,value:1,eventId:'second',time});assert(s.v3.sessions[0].answers[q.id].correct);s=parseBackup(exportBackup(s));assert.equal(startDuel(s,{pair:'shi-tsu',id:'again',time}).v3.sessions.length,1);
 const bad=structuredClone(s);bad.v3.sessions[0].reference='nu-me';assert.throws(()=>parseBackup(exportBackup(bad)));
 s=nextV3Question(s,'duel',time);assert.equal(s.v3.sessions[0].cursor,1);assert.equal(startDuel(initialState(),{pair:'invalid',id:'none',time}).v3.sessions.length,0);
});
test('same-day or in-round duel exposure is hinted at answer time, older/future cues are ignored and first answers stay immutable',()=>{
 const pair='shi-tsu',q=duelQuestions[0];
 for(const [cue,expected]of [['2026-10-22T01:00:00Z',true],['2026-10-21T01:00:00Z',false],['2027-01-01T00:00:00Z',false]]){let s=recordKanaExposure(initialState(),[q.reviewItem,q.otherItem],cue);s=startDuel(s,{pair,id:'round',time});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time});assert.equal(s.v3.sessions[0].answers[q.id].hinted,expected);assert.equal(s.attempts[0].hinted,expected);assert(parseBackup(exportBackup(s)));}
 let s=startDuel(initialState(),{pair,id:'round',time});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'first',time});const first=structuredClone(s.v3.sessions[0].answers[q.id]);s=recordKanaExposure(s,[q.otherItem],'2026-10-22T02:01:00Z');s=answerV3Session(s,{sessionId:'round',question:q,value:1,eventId:'overwrite',time:'2026-10-22T02:02:00Z'});assert.deepEqual(s.v3.sessions[0].answers[q.id],first);s=nextV3Question(s,'round','2026-10-22T02:02:00Z');const second=duelQuestions[1];s=answerV3Session(s,{sessionId:'round',question:second,value:second.correct,eventId:'second',time:'2026-10-23T02:00:00Z'});assert(s.v3.sessions[0].answers[second.id].hinted);
});
