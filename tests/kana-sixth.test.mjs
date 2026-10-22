import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {kana} from '../app/content/kana.mjs';
import {duelPairs,duelQuestions,duelQuestion,validDuelReference,flipCards,flipCueItems} from '../app/content/kana-sixth.mjs';
import {newFlip,advanceFlip,startDuel} from '../app/core/kana-sixth.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {pairExposure} from '../app/content/kana-recall.mjs';
const time='2026-10-22T02:00:00.000Z';
test('every card starts a bounded same-script same-group flip group with existing cues and audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');
 for(const k of kana){const cards=flipCards(k.id);assert(cards.length>=1&&cards.length<=3);assert.equal(cards[0].id,k.id);assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);assert(cards.every(c=>c.script===k.script&&c.group===k.group));assert(flipCueItems(k.id,false).includes(k.id));assert(pack.files.includes(audio[k.glyph]));}
 assert.deepEqual(flipCards('unknown'),[]);assert.deepEqual(flipCueItems('unknown',true),[]);
});
test('twelve duel questions preserve two same-script choices, stable target IDs and offline audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');assert.equal(duelPairs.length,6);assert.equal(duelQuestions.length,12);
 for(const pair of duelPairs){const qs=duelQuestions.filter(q=>q.pairId===pair.id);assert.equal(qs.length,2);assert(validDuelReference(pair.id,qs.map(q=>q.id)));assert(!validDuelReference(pair.id,qs.slice().reverse().map(q=>q.id)));for(const q of qs){assert.equal(q.options.length,2);assert.equal(q.options[q.correct],kana.find(k=>k.id===q.reviewItem).glyph);assert.equal(q.dimension,'listening');assert(resolveLearningQuestion(q.id));assert(pack.files.includes(audio[q.audio]));assert.equal(pairExposure(q.id),q.otherItem);}}
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
