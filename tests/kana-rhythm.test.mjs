import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {rhythmQuestions,rhythmQuestion,rhythmIds,validRhythmReference,rhythmCueSeen} from '../app/content/kana-rhythm.mjs';import {rhythmCards} from '../app/content/kana-focus.mjs';
import {startRhythm,pendingRhythm,recordRhythmExposure} from '../app/core/kana-rhythm.mjs';import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';import {resolveLearningQuestion,knownItems} from '../app/content/catalog.mjs';import {kanaMemoryMap} from '../app/core/kana-coach.mjs';
const time='2026-10-22T13:30:00.000Z';
test('12 whole-word rhythm questions use authored beats, four numeric options and existing packaged audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');assert.equal(rhythmQuestions.length,12);
 for(const c of rhythmCards){const q=rhythmQuestion('kr:'+c.id);assert.equal(q.reviewItem,q.id);assert(knownItems.has(q.id));assert.equal(q.kind,'listen');assert.equal(q.dimension,'listening');assert.equal(q.transcript,c.audio);assert.equal(q.audio,undefined);assert(pack.files.includes(audio[q.transcript]));assert.equal(q.options[q.correct],c.beats.length+'拍');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.options.every(o=>/^\d拍$/.test(o)));assert(q.explanation.includes(c.beats.join('・')));assert.equal(resolveLearningQuestion(q.id).id,q.id);}
});
test('all twelve entry cards have exact fixed three-question rotations within their group',()=>{
 for(const c of rhythmCards){const ids=rhythmIds(c.id);assert.equal(ids.length,3);assert.equal(new Set(ids).size,3);assert(ids.every(id=>rhythmCards.find(k=>k.id===rhythmQuestion(id).rhythmCard).group===c.group));assert(validRhythmReference(c.id,ids));assert(!validRhythmReference(c.id,[...ids].reverse()));assert(!validRhythmReference(c.id,ids.slice(0,2)));}
 assert.deepEqual(rhythmIds('missing'),[]);assert(!validRhythmReference('missing',[]));assert.equal(rhythmQuestion('kr:bad'),null);
});
test('same-group pending resumes original card and fixed questions, distinct groups remain independent',()=>{
 let s=startRhythm(initialState(),{card:'tea',id:'r',time});s=startRhythm(s,{card:'photo',id:'other',time});assert.equal(s.v3.sessions.length,1);assert.equal(pendingRhythm(s,'travel').reference,'tea');s=startRhythm(s,{card:'stamp',id:'stop',time});assert.equal(s.v3.sessions.length,2);assert.equal(startRhythm(s,{card:'bad',id:'bad',time}),s);
 const bad=structuredClone(s);bad.v3.sessions[0].reference='stamp';assert.throws(()=>parseBackup(exportBackup(bad)));
});
test('rhythm exposure is optional, strict, backup-compatible and merged by newest timestamp without changing old answers',()=>{
 const old=initialState();assert(!Object.hasOwn(old.v3,'rhythmHints'));let a=recordRhythmExposure(old,'tea',time),b=recordRhythmExposure(old,'tea','2026-10-21T12:00:00Z');assert.equal(a.v3.rhythmHints.tea,time);assert.equal(a.attempts.length,0);assert(a.v3.kanaHints['h-3061-3083']);assert.equal(mergeStates(parseBackup(exportBackup(a)),b).v3.rhythmHints.tea,time);assert(!Object.hasOwn(old.v3,'rhythmHints'));
 for(const hints of [{bad:time},{tea:'yesterday'},{tea:2},[],null]){const bad=structuredClone(old);bad.v3.rhythmHints=hints;assert.throws(()=>parseBackup(exportBackup(bad)));}
 assert.equal(recordRhythmExposure(old,'bad',time),old);
});
test('target-word cues count today or during the open round, but previous-day, future or another-word cues do not',()=>{
 const q=rhythmQuestion(rhythmIds('tea')[0]);
 for(const [cue,expected] of [['2026-10-22T12:00:00Z',true],['2026-10-21T12:00:00Z',false],['2026-10-23T12:00:00Z',false]]){let s=recordRhythmExposure(initialState(),q.rhythmCard,cue);s=startRhythm(s,{card:'tea',id:'r',time});s=answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'a',time});assert.equal(s.v3.sessions[0].answers[q.id].hinted,expected);assert.equal(s.v3.sessions[0].hints.length,0);}
 assert(!rhythmCueSeen({tea:time},q,time,time));assert(!rhythmCueSeen(null,q,time,time));assert(rhythmCueSeen({[q.rhythmCard]:'2026-10-21T13:00:00Z'},q,'2026-10-21T12:00:00Z',time));
});
test('first answers remain immutable after cues, survive resume/merge, and do not score an individual kana',()=>{
 let s=startRhythm(initialState(),{card:'tea',id:'r',time}),q=rhythmQuestion(s.v3.sessions[0].questionIds[0]),before=structuredClone(s);s=answerV3Session(s,{sessionId:'r',question:q,value:1,eventId:'wrong',time});const first=structuredClone(s.v3.sessions[0].answers);assert.equal(answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'again',time}),s);s=recordRhythmExposure(s,q.rhythmCard,time);assert.deepEqual(s.v3.sessions[0].answers,first);s=mergeStates(before,parseBackup(exportBackup(s)));assert.deepEqual(s.v3.sessions[0].answers,first);assert.equal(s.attempts[0].item,q.id);assert(kanaMemoryMap(s,time).every(k=>!k.listening.total&&!k.recognition.total));
 for(let i=0;i<3;i++){q=rhythmQuestion(s.v3.sessions[0].questionIds[i]);if(i)s=answerV3Session(s,{sessionId:'r',question:q,value:0,eventId:'answer-'+i,time});s=nextV3Question(s,'r',time);}assert(s.v3.sessions[0].completedAt);assert.equal(s.attempts.length,3);assert.equal(pendingRhythm(s,'tea'),undefined);
});
