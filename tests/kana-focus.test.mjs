import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {rhythmCards,rhythmGroups,exposedRhythmItems,validRepairReference} from '../app/content/kana-focus.mjs';
import {selectRepairQuestions,startKanaRepair} from '../app/core/kana-focus.mjs';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {coachQuestion} from '../app/content/kana-coach.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {words} from '../app/content/catalog.mjs';
const now='2026-10-21T13:00:00.000Z';
function add(s,id,item,dimension,time,{correct=false,hinted=false}={}){return recordAnswer(s,{id,item,dimension,time,correct,hinted});}

test('twelve authored rhythm cards preserve full readings, mora groups and existing audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json','utf8'));
 assert.equal(rhythmCards.length,12);assert.equal(new Set(rhythmCards.map(c=>c.id)).size,12);
 for(const group of rhythmGroups)assert.equal(rhythmCards.filter(c=>c.group===group.id).length,3);
 for(const c of rhythmCards){assert.equal(c.beats.join(''),c.reading);assert(audio[c.audio]);assert(words.some(w=>w.jp===c.jp&&w.reading===c.reading));assert(exposedRhythmItems(c).length>0);}
 assert.deepEqual(rhythmCards.find(c=>c.reading==='おちゃ').beats,['お','ちゃ']);
 assert.deepEqual(rhythmCards.find(c=>c.reading==='がっこう').beats,['が','っ','こ','う']);
 assert.deepEqual(rhythmCards.find(c=>c.reading==='コーヒー').beats,['コ','ー','ヒ','ー']);
 assert(exposedRhythmItems(rhythmCards.find(c=>c.reading==='しゃしん')).includes('h-3057-3083'));
 assert.deepEqual(exposedRhythmItems(null),[]);
});
test('repair references accept only matching ordered unique kana and one check ability each',()=>{
 const ids=['kc:check:h-3042:pair','kc:check:k-30a4:listen'];
 assert(validRepairReference('h-3042:k-30a4',ids));
 for(const [ref,q] of [['h-3042:k-30a4',ids.slice().reverse()],['h-3042:h-3042',['kc:check:h-3042:pair','kc:check:h-3042:listen']],['h-3042',['kc:h-3042:h-3044:pair']],['missing',[ids[0]]],['h-3042',[ids[0],ids[0]]],['',[]]])assert(!validRepairReference(ref,q));
 assert(!validRepairReference('h-3042:h-3044:h-3046:h-3048',['3042','3044','3046','3048'].map(x=>'kc:check:h-'+x+':pair')));
});
test('repair picks at most three distinct weak cards without filling unseen or self-rated abilities',()=>{
 let s=initialState();assert.deepEqual(selectRepairQuestions(s,now),[]);
 for(const [i,item] of ['h-3042','h-3044','h-3046','h-3048'].entries())s=add(s,'wrong-'+i,item,'recognition','2026-10-20T0'+i+':00:00Z');
 s=add(s,'listen','h-3042','listening','2026-10-20T05:00:00Z');
 s=add(s,'ink','h-304a','writing','2026-10-19T00:00:00Z');
 s=add(s,'future','k-30a2','listening','2027-01-01T00:00:00Z');
 const q=selectRepairQuestions(s,now);assert.equal(q.length,3);assert.equal(new Set(q.map(q=>q.reviewItem)).size,3);assert.deepEqual(q.map(q=>q.reviewItem),['h-3042','h-3044','h-3046']);assert(q.every(q=>q.dimension==='recognition'));
});
test('same-day retry never erases a weak daily first; new-day independent first can clear it',()=>{
 let s=add(initialState(),'wrong','h-3042','listening','2026-10-20T01:00:00Z');
 s=add(s,'retry','h-3042','listening','2026-10-20T02:00:00Z',{correct:true});
 assert.equal(selectRepairQuestions(s,now).length,1);
 s=add(s,'next-day','h-3042','listening','2026-10-21T02:00:00Z',{correct:true});assert.equal(selectRepairQuestions(s,now).length,0);
 s=add(s,'hint','h-3044','recognition','2026-10-21T03:00:00Z',{correct:true,hinted:true});assert.equal(selectRepairQuestions(s,now)[0].reviewItem,'h-3044');
});
test('repair preserves the pending round, first answers and backup while later history changes',()=>{
 let s=add(initialState(),'wrong','h-3042','listening','2026-10-20T01:00:00Z');
 s=startKanaRepair(s,{id:'repair',time:now});const original=s.v3.sessions[0];assert.equal(original.source,'kana-repair');assert(validRepairReference(original.reference,original.questionIds));
 const q=coachQuestion(original.questionIds[0]);s=answerV3Session(s,{sessionId:'repair',question:q,value:q.correct,eventId:'first',time:now});
 s=answerV3Session(s,{sessionId:'repair',question:q,value:(q.correct+1)%q.options.length,eventId:'overwrite',time:now});assert(s.v3.sessions[0].answers[q.id].correct);
 s=add(s,'other','h-3044','recognition',now);s=parseBackup(exportBackup(s));
 const invalid=structuredClone(s);invalid.v3.sessions[0].reference='h-3044';assert.throws(()=>parseBackup(exportBackup(invalid)));
 assert.equal(startKanaRepair(s,{id:'new',time:now}).v3.sessions.length,1);assert.deepEqual(s.v3.sessions[0].questionIds,original.questionIds);
 assert.deepEqual(mergeStates(s,s).v3.sessions[0].answers,s.v3.sessions[0].answers);
 s=nextV3Question(s,'repair',now);assert(s.v3.sessions[0].completedAt);assert.equal(startKanaRepair(initialState(),{id:'empty',time:now}).v3.sessions.length,0);
});
