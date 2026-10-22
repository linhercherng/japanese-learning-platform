import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {kana} from '../app/content/kana.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {validPocketListenReference} from '../app/content/kana-pocket-listen.mjs';
import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {setPocket,pocketItems,pocketListeningIds,startPocketListen,pendingPocketListen} from '../app/core/kana-pocket.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
const time='2026-10-22T15:00:00.000Z',ids=['h-3042','k-30a2','h-3071','k-30ac'];
function seed(n=4){let s=initialState();for(const [i,id]of ids.slice(0,n).entries())s=setPocket(s,id,true,new Date(Date.parse(time)-1000+i).toISOString());return s;}
test('all 208 cards reuse canonical four-choice listening questions and existing K audio, without a new question registry',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');
 for(const k of kana){const s=setPocket(initialState(),k.id,true,time),qids=pocketListeningIds(s,time);assert.deepEqual(qids,['kc:check:'+k.id+':listen']);const q=resolveLearningQuestion(qids[0]);assert.equal(q.reviewItem,k.id);assert.equal(q.dimension,'listening');assert.equal(q.options.length,4);assert.equal(q.options[q.correct],k.glyph);assert(pack.files.includes(audio[q.transcript]));assert(validPocketListenReference(k.id,qids));}
});
test('selection takes at most three oldest active cards, excludes future or removed marks and rotates their fixed order',()=>{
 assert.deepEqual(pocketListeningIds(initialState(),time),[]);for(const [n,expected]of [[1,[ids[0]]],[2,[ids[1],ids[0]]],[4,[ids[1],ids[2],ids[0]]]])assert.deepEqual(pocketListeningIds(seed(n),time),expected.map(id=>'kc:check:'+id+':listen'));
 let s=setPocket(seed(),ids[1],false,time);s=setPocket(s,ids[2],true,'2026-10-23T15:00:00.000Z');assert.deepEqual(pocketListeningIds(s,time),[ids[3],ids[0]].map(id=>'kc:check:'+id+':listen'));
});
test('pending round survives pocket edits, backup and merge; an empty pocket never creates filler questions',()=>{
 assert.equal(startPocketListen(initialState(),{id:'empty',time}).v3.sessions.length,0);let s=startPocketListen(seed(),{id:'listen',time}),r=pendingPocketListen(s),original=r.questionIds.slice();
 for(const id of ids)s=setPocket(s,id,false,'2026-10-22T15:01:00.000Z');s=parseBackup(exportBackup(s));s=startPocketListen(s,{id:'again',time});assert.equal(s.v3.sessions.length,1);assert.deepEqual(pendingPocketListen(s).questionIds,original);assert.deepEqual(pendingPocketListen(mergeStates(s,s)),pendingPocketListen(s));assert.equal(pocketItems(s).length,0);
});
test('backup rejects mismatched references, modes, reordering, extra queue entries and multiple pending rounds',()=>{
 const s=startPocketListen(seed(),{id:'listen',time}),r=pendingPocketListen(s);
 for(const mutate of [r=>r.reference='invalid',r=>r.questionIds.reverse(),r=>r.reference=ids[0]+':'+ids[0],r=>r.questionIds[0]=r.questionIds[0].replace('listen','pair'),r=>r.queue.push({...r.queue[0]})]){const bad=structuredClone(s);mutate(bad.v3.sessions[0]);assert.throws(()=>parseBackup(exportBackup(bad)));}
 const bad=structuredClone(s);bad.v3.sessions.push({...structuredClone(r),id:'second'});assert.throws(()=>parseBackup(exportBackup(bad)));
 assert(!validPocketListenReference(r.reference,r.questionIds.slice(0,1)));assert(!validPocketListenReference(r.reference,[]));
});
test('answers only record listening, keep the self-assessment pocket and immutable first answer, with no extra retries',()=>{
 let s=startPocketListen(seed(),{id:'listen',time});const pocket=structuredClone(s.v3.kanaPocket),r=pendingPocketListen(s),q=resolveLearningQuestion(r.questionIds[0]);
 s=answerV3Session(s,{sessionId:r.id,question:q,value:1,eventId:'first',time});const first=structuredClone(pendingPocketListen(s).answers[q.id]);s=answerV3Session(s,{sessionId:r.id,question:q,value:q.correct,eventId:'overwrite',time});assert.deepEqual(pendingPocketListen(s).answers[q.id],first);assert.equal(s.attempts.length,1);assert.equal(s.attempts[0].dimension,'listening');assert(!s.attempts[0].correct);assert.deepEqual(s.v3.kanaPocket,pocket);assert.equal(pendingPocketListen(s).queue.length,3);
});
test('same-day and in-round cues mark hints; older and future cues do not, and later exposure never rewrites an original answer',()=>{
 for(const [cue,expected]of [['2026-10-22T14:00:00.000Z',true],['2026-10-21T14:00:00.000Z',false],['2026-10-23T14:00:00.000Z',false]]){let s=startPocketListen(seed(1),{id:'listen',time});const q=resolveLearningQuestion(pendingPocketListen(s).questionIds[0]);s=recordKanaExposure(s,[q.reviewItem],cue);s=answerV3Session(s,{sessionId:'listen',question:q,value:q.correct,eventId:'first',time});assert.equal(s.attempts[0].hinted,expected);const first=structuredClone(s.v3.sessions[0].answers[q.id]);s=recordKanaExposure(s,[q.reviewItem],'2026-10-22T15:01:00.000Z');assert.deepEqual(s.v3.sessions[0].answers[q.id],first);assert(parseBackup(exportBackup(s)));}
 let s=startPocketListen(seed(1),{id:'listen',time});const q=resolveLearningQuestion(pendingPocketListen(s).questionIds[0]);s=recordKanaExposure(s,[q.reviewItem],'2026-10-22T15:01:00.000Z');s=answerV3Session(s,{sessionId:'listen',question:q,value:q.correct,eventId:'nextday',time:'2026-10-23T15:00:00.000Z'});assert(s.attempts[0].hinted);
});
test('completion preserves all original answers, allows a new round and does not automatically remove cards',()=>{
 let s=startPocketListen(seed(2),{id:'listen',time});for(const qid of pendingPocketListen(s).questionIds){const q=resolveLearningQuestion(qid);s=answerV3Session(s,{sessionId:'listen',question:q,value:q.correct,eventId:qid,time});s=nextV3Question(s,'listen',time);}
 assert(!pendingPocketListen(s));assert.equal(pocketItems(s).length,2);s=startPocketListen(parseBackup(exportBackup(s)),{id:'next',time});assert.equal(pendingPocketListen(s).id,'next');assert.equal(s.attempts.length,2);
});
