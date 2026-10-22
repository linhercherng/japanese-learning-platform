import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {kana} from '../app/content/kana.mjs';import {memoryFor} from '../app/content/kana-memory.mjs';
import {bridgePairs,bridgeQuestions,bridgeQuestion,bridgePartner,bridgeCards,bridgeIds,validBridgeReference,bridgeCueItems} from '../app/content/kana-bridge.mjs';
import {startBridge} from '../app/core/kana-bridge.mjs';
import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';import {recordKanaExposure} from '../app/core/kana-studio.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';import {pairExposure} from '../app/content/kana-recall.mjs';
const time='2026-10-22T04:00:00.000Z';
test('104 cross-script pairs cover all 208 cards without conflating same-reading glyphs',()=>{
 assert.equal(bridgePairs.length,104);assert.equal(new Set(bridgePairs.flatMap(p=>[p.hira.id,p.kata.id])).size,208);
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');
 for(const k of kana){const other=bridgePartner(k.id);assert(other&&other.script!==k.script);assert.equal(bridgePartner(other.id).id,k.id);assert.equal(other.reading,k.reading);assert(pack.files.includes(audio[k.glyph]));}
 assert.equal(bridgePartner('h-3062').glyph,'ヂ');assert.equal(bridgePartner('h-3058').glyph,'ジ');assert.equal(bridgePartner('h-3065').glyph,'ヅ');assert.equal(bridgePartner('bad'),null);
});
test('208 stable questions offer three unique opposite-script choices and one unambiguous mapping',()=>{
 assert.equal(bridgeQuestions.length,208);assert.equal(new Set(bridgeQuestions.map(q=>q.id)).size,208);
 for(const q of bridgeQuestions){const source=kana.find(k=>k.id===q.otherItem),target=bridgePartner(source.id);assert.equal(q.reviewItem,target.id);assert(q.id.startsWith('kx:'));assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert.equal(q.options[q.correct],target.glyph);assert(q.options.every(g=>kana.some(k=>k.glyph===g&&k.script===target.script&&memoryFor(k.id).group===memoryFor(target.id).group)));assert.equal(q.options.filter(g=>kana.find(k=>k.glyph===g).reading===target.reading).length,1);assert.equal(q.dimension,'recognition');assert(q.prompt.includes(source.glyph));assert.equal(pairExposure(q.id),source.id);assert(resolveLearningQuestion(q.id));}
 assert.equal(bridgeQuestion('kx:bad'),null);
});
test('three-card selections wrap within normalized category, reverse to the same group and reject mixed sources',()=>{
 for(const k of kana){const cards=bridgeCards(k.id);assert.equal(cards.length,3);assert.equal(cards[0].id,k.id);assert.equal(new Set(cards.map(c=>c.id)).size,3);assert(cards.every(c=>c.script===k.script&&memoryFor(c.id).group===memoryFor(k.id).group));assert.deepEqual(bridgeCards(bridgePartner(k.id).id).map(c=>bridgePartner(c.id).id),cards.map(c=>c.id));assert(validBridgeReference(k.id,bridgeIds(k.id)));assert(!validBridgeReference(k.id,bridgeIds(k.id).slice().reverse()));assert(!validBridgeReference(k.id,bridgeIds(bridgePartner(k.id).id)));}
 assert.deepEqual(bridgeIds('bad'),[]);assert(!validBridgeReference('bad',[]));assert(bridgeCards('h-3071').every(k=>memoryFor(k.id).group==='semivoiced'));
});
test('fixed three-question rounds preserve first answers, pending direction and backup merges',()=>{
 let s=startBridge(initialState(),{item:'h-3042',id:'bridge',time}),q=bridgeQuestion(s.v3.sessions[0].questionIds[0]);s=answerV3Session(s,{sessionId:'bridge',question:q,value:q.correct,eventId:'a',time});const first=structuredClone(s.v3.sessions[0].answers);
 s=answerV3Session(s,{sessionId:'bridge',question:q,value:1,eventId:'b',time});assert.deepEqual(s.v3.sessions[0].answers,first);s=parseBackup(exportBackup(s));assert.equal(startBridge(s,{item:'h-3042',id:'again',time}).v3.sessions.length,1);
 const restored=mergeStates(initialState(),s);assert.deepEqual(restored.v3.sessions[0].answers,first);const bad=structuredClone(s);bad.v3.sessions[0].reference='k-30a2';assert.throws(()=>parseBackup(exportBackup(bad)));
 s=nextV3Question(s,'bridge',time);assert.equal(s.v3.sessions[0].cursor,1);s=startBridge(s,{item:'k-30a2',id:'reverse',time});assert.equal(s.v3.sessions.length,2);assert.equal(startBridge(initialState(),{item:'bad',id:'bad',time}).v3.sessions.length,0);
});
test('same-day or in-round pair cues mark new bridge answers hinted without rewriting prior answers',()=>{
 const q=bridgeQuestion(bridgeIds('h-3042')[0]);
 for(const item of [q.reviewItem,q.otherItem])for(const [cue,expected]of [['2026-10-22T03:00:00Z',true],['2026-10-21T03:00:00Z',false],['2027-01-01T00:00:00Z',false]]){let s=recordKanaExposure(initialState(),[item],cue);s=startBridge(s,{item:'h-3042',id:'round',time});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time});assert.equal(s.attempts[0].hinted,expected);assert.equal(s.attempts[0].item,q.reviewItem);assert.equal(s.attempts[0].dimension,'recognition');assert(parseBackup(exportBackup(s)));}
 let s=startBridge(initialState(),{item:'h-3042',id:'round',time});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time});s=recordKanaExposure(s,[q.reviewItem],time);s=answerV3Session(s,{sessionId:'round',question:q,value:1,eventId:'b',time});assert.equal(s.attempts.length,1);assert.equal(s.v3.sessions[0].answers[q.id].hinted,false);
});
test('comparison exposure covers visible pairs and mnemonic text but no hidden comparison',()=>{
 assert.deepEqual(bridgeCueItems('bad'),[]);for(const k of bridgeCards('h-3042')){assert(bridgeCueItems('h-3042').includes(k.id));assert(bridgeCueItems('h-3042').includes(bridgePartner(k.id).id));}
});
