import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {kanaMemoryMap,kanaConfusions,nextDayCandidates,startKanaCheck,checkEvidence} from '../app/core/kana-coach.mjs';
import {coachQuestion,confusedKana,confusionQuestions,validCoachReference} from '../app/content/kana-coach.mjs';
import {kana} from '../app/content/kana.mjs';
const yesterday='2026-10-20T02:00:00.000Z',today='2026-10-21T02:00:00.000Z';
const add=(s,{id=String(s.attempts.length+1),item='h-306c',dimension='recognition',correct=true,hinted=false,time=yesterday,...rest}={})=>recordAnswer(s,{id,item,dimension,correct,hinted,time,...rest});

test('map covers 208 cards and separates independent first days from hints, retries and writing self checks',()=>{
 let s=add(initialState(),{correct:false});s=add(s,{time:'2026-10-20T03:00:00.000Z'});s=add(s,{time:today});
 s=add(s,{dimension:'listening',hinted:true,time:today});s=add(s,{dimension:'writing',time:today});
 const rows=kanaMemoryMap(s,today);assert.equal(rows.length,208);const r=rows.find(r=>r.id==='h-306c');
 assert.equal(r.recognition.independentDays,1);assert.notEqual(r.recognition.label,'已有跨日回想');assert.equal(r.listening.label,'需要複習');assert.match(r.writing.label,/自評/);assert.equal(r.writing.total,1);
});
test('two successful days can show cross-day recall but the latest failure still needs review',()=>{
 let s=add(add(initialState()),{time:today});assert.equal(kanaMemoryMap(s,today).find(r=>r.id==='h-306c').recognition.label,'已有跨日回想');
 s=add(s,{correct:false,time:'2026-10-21T03:00:00.000Z'});assert.equal(kanaMemoryMap(s,'2026-10-21T04:00:00.000Z').find(r=>r.id==='h-306c').recognition.label,'需要複習');
 s=add(s,{time:'2026-10-21T04:00:00.000Z'});assert.equal(kanaMemoryMap(s,'2026-10-21T05:00:00.000Z').find(r=>r.id==='h-306c').recognition.independentDays,2);
});
test('Taipei midnight defines the study date; today-only and future records are not next-day candidates',()=>{
 const s=add(initialState(),{time:'2026-10-20T15:59:00.000Z'});assert(nextDayCandidates(s,'2026-10-20T16:01:00.000Z').some(q=>q.reviewItem==='h-306c'));
 assert.equal(nextDayCandidates(add(initialState(),{time:today}),today).length,0);
 assert.equal(nextDayCandidates(add(initialState(),{time:'2026-10-22T00:00:00.000Z'}),today).length,0);
});
test('a daily check is capped, persisted, resumes the same snapshot and excludes abilities already answered today',()=>{
 let s=add(initialState());s=add(s,{dimension:'listening'});s=add(s,{time:today});
 assert.deepEqual(nextDayCandidates(s,today).map(q=>q.dimension),['listening']);
 const started=startKanaCheck(s,{id:'check-one',time:today});assert.equal(started.v3.sessions.length,1);assert.equal(started.v3.sessions[0].reference,'2026-10-21');
 const again=startKanaCheck(started,{id:'another',time:today});assert.deepEqual(again,started);assert.deepEqual(parseBackup(exportBackup(started)),started);
 assert.equal(startKanaCheck(initialState(),{id:'empty',time:today}).v3.sessions.length,0);
});
test('confusion questions include the actual wrong glyph in both directions and never use homophones as listening distractors',()=>{
 const qs=confusionQuestions('h-306c:h-3081');assert.equal(qs.length,6);
 const listen=qs.find(q=>q.reviewItem==='h-306c'&&q.mode==='listen');assert(listen.options.includes('め'));assert.deepEqual(confusedKana(listen,listen.options.indexOf('め')),{target:'h-306c',chosen:'h-3081'});
 assert.equal(new Set(listen.options).size,listen.options.length);
 const homophones=confusionQuestions('h-3058:h-3062');assert(!homophones.some(q=>q.mode==='listen'));
 for(const q of qs){assert.deepEqual(coachQuestion(q.id),q);assert(q.explanation.length>10);}
 assert.equal(coachQuestion('kc:invalid:unsafe:listen'),null);
 assert(!validCoachReference('kana-confusion','h-306c:h-3081',['km-h-3042-listen']));
 assert(validCoachReference('kana-confusion','h-306c:h-3081',qs.map(q=>q.id)));
});
test('actual first-answer confusions survive backup, merge and removal of completed session history',()=>{
 const q=confusionQuestions('h-306c:h-3081').find(q=>q.mode==='listen');
 let s=beginV3Session(initialState(),[q.id],{id:'confusion-one',source:'kana-confusion',reference:'h-306c:h-3081',time:yesterday});
 s=answerV3Session(s,{sessionId:'confusion-one',question:q,value:q.options.indexOf('め'),eventId:'first-one',time:yesterday});
 assert.deepEqual(s.attempts[0].kanaConfusion,{target:'h-306c',chosen:'h-3081'});
 assert.deepEqual(answerV3Session(s,{sessionId:'confusion-one',question:q,value:q.correct,eventId:'retry',time:yesterday}),s);
 s=nextV3Question(s,'confusion-one',yesterday);s.v3.sessions=[];
 const restored=mergeStates(initialState(),parseBackup(exportBackup(s)));const pairs=kanaConfusions(restored);assert.equal(pairs.length,1);assert.equal(pairs[0].count,1);assert.equal(pairs[0].reference,'h-306c:h-3081');
 assert.throws(()=>add(initialState(),{kanaConfusion:{target:'h-306c',chosen:'h-306c'}}));
});
test('wrong-without-choice history is not treated as a known confused pair',()=>{assert.equal(kanaConfusions(add(initialState(),{correct:false})).length,0);});
test('a hinted or wrong daily first answer is not relabelled independent after a same-day retry',()=>{
 let s=add(initialState(),{hinted:true});s=add(s,{time:'2026-10-20T03:00:00.000Z'});
 const r=kanaMemoryMap(s,today).find(r=>r.id==='h-306c');assert.equal(r.recognition.independentDays,0);assert.equal(r.recognition.label,'需要複習');
});
test('pair confusion records the actual answer script and does not double count its retained session',()=>{
 const q=coachQuestion('kc:h-306c:h-3081:pair');assert.deepEqual(confusedKana(q,q.options.indexOf('メ')),{target:'k-30cc',chosen:'k-30e1'});
 let s=beginV3Session(initialState(),[q.id],{id:'pair-one',source:'kana-confusion',reference:'h-306c:h-3081',time:yesterday});
 s=answerV3Session(s,{sessionId:'pair-one',question:q,value:q.options.indexOf('メ'),eventId:'pair-error',time:yesterday});assert.equal(kanaConfusions(s)[0].count,1);
});
test('check caps at ten and both daily results and backup merges cannot create a second check that date',()=>{
 let s=initialState();for(const k of kana.slice(0,12))s=add(s,{item:k.id});assert.equal(nextDayCandidates(s,today).length,10);
 const a=startKanaCheck(s,{id:'branch-a',time:today}),b=startKanaCheck(s,{id:'branch-b',time:today});assert.throws(()=>mergeStates(a,b),/同日隔天檢查/);
 let one=startKanaCheck(add(initialState()),{id:'one',time:today});const q=coachQuestion(one.v3.sessions[0].questionIds[0]);
 one=answerV3Session(one,{sessionId:'one',question:q,value:q.correct,eventId:'one-answer',time:today});one=nextV3Question(one,'one',today);assert.deepEqual(startKanaCheck(one,{id:'again',time:today}),one);
});
test('check evidence counts only today first answers after earlier learning, not a later retry or hinted success',()=>{
 const q=coachQuestion('kc:check:h-306c:pair');let s=startKanaCheck(add(initialState()),{id:'check',time:today});
 s=answerV3Session(s,{sessionId:'check',question:q,value:q.correct,eventId:'check-answer',time:today});
 assert.deepEqual(checkEvidence(s,s.v3.sessions[0]),{total:1,correct:1,hinted:0,excluded:0});
 let other=startKanaCheck(add(initialState()),{id:'check',time:today});other=add(other,{time:'2026-10-21T01:59:00.000Z',correct:false});
 other=answerV3Session(other,{sessionId:'check',question:q,value:q.correct,eventId:'later-check',time:today});assert.equal(checkEvidence(other,other.v3.sessions[0]).total,0);assert.equal(checkEvidence(other,other.v3.sessions[0]).excluded,1);
});
