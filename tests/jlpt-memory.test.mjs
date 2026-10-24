import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {units,unitQuestions,questionById,forms} from '../app/content/catalog.mjs';
import {beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {createPractice,answerPractice} from '../app/core/study.mjs';
const core=await import('../app/core/jlpt-memory.mjs').catch(()=>({})),ids=await import('../app/content/jlpt-memory-ids.mjs').catch(()=>({})),hints=await import('../app/core/jlpt-memory-state.mjs').catch(()=>({}));
const call=(name,...args)=>{const fn=core[name]||ids[name]||hints[name];assert.equal(typeof fn,'function',name+' missing');return fn(...args);};
const old='2026-10-16T02:00:00.000Z',today='2026-10-23T02:00:00.000Z',later='2026-10-23T02:01:00.000Z';
const add=(s,item=first().id,time=old,correct=true,hinted=false,event=(item+time).replaceAll('.',''))=>{const q=questionById.get(item);return recordAnswer(s,{id:event,item,dimension:q.dimension,correct,hinted,time});};
const qids=()=>unitQuestions(units[0]).map(q=>q.id);
const first=()=>unitQuestions(units[0])[0];
function finish(s,id,time){for(const qid of s.v3.sessions.find(x=>x.id===id).questionIds){const q=questionById.get(qid);s=answerV3Session(s,{sessionId:id,question:q,value:q.kind==='cloze'?q.accepted[0]:q.kind==='order'?q.answerOrder:q.correct,eventId:id+'-'+qid,time});s=nextV3Question(s,id,time);}return s;}

test('all 114 courses resolve canonical IDs, excluding ambiguous and exam-only questions',()=>{
 assert.equal(ids.jlptUnitMeta?.size,114);assert.equal(ids.jlptQuestionUnits?.size,1139);
 for(const u of units){const qs=call('jlptMemoryQuestions',u.id);assert.equal(qs.length,3);assert.deepEqual(qs.map(q=>q.dimension),['vocabulary','grammar','listening']);for(const [ability] of ids.jlptAbilities){const pool=call('jlptSkillQuestions',u.id,ability);assert(pool.length>=1&&pool.length<=3);assert(pool.every(q=>q.dimension===ability&&q.unitId===u.id));}}
 assert(!ids.jlptQuestionUnits.has('N4-12-G2'));for(const f of forms)for(const s of f.sections)for(const q of s.questions)assert(!ids.jlptQuestionUnits.has(q.id));
});
test('source references enforce course, level, ability, date and single original queue',()=>{
 let s=call('startJlptRound',initialState(),{unitId:'N5-01',mode:'memory',id:'unit',time:today});assert.equal(s.v3.sessions[0].source,'jlpt-memory');
 for(const mutate of [x=>x.reference='N4-01',x=>x.questionIds.reverse(),x=>x.queue.push({questionId:x.questionIds[0],repeat:true,sourceId:x.questionIds[0]})]){const broken=structuredClone(s);mutate(broken.v3.sessions[0]);assert.throws(()=>validateState(broken));}
 assert.throws(()=>beginV3Session(initialState(),[first().id],{id:'bad',source:'jlpt-week',reference:'N4:2026-10-23',time:today}));
});
test('one pending round survives duplicate start, grade changes, backup and refresh',()=>{
 const s=call('startJlptRound',initialState(),{unitId:'N2-01',mode:'skill',ability:'kanji',id:'original',time:today});
 const next=call('startJlptRound',s,{unitId:'N5-01',mode:'memory',id:'other',time:later});assert.deepEqual(next,s);assert.equal(call('pendingJlpt',s).id,'original');assert.deepEqual(parseBackup(exportBackup(s)),s);assert.throws(()=>mergeStates(s,call('startJlptRound',initialState(),{unitId:'N5-01',mode:'memory',id:'branch',time:today})));
});
test('exposure stores earliest daily time, merges days and preserves original first answers',()=>{
 const q=first(),s=call('recordJlptExposure',initialState(),[q.id],today),next=call('recordJlptExposure',s,[q.id],later);assert.deepEqual(next.v3.jlptHints,s.v3.jlptHints);assert.equal(next.v3.courseHistory.events.length,2);
 const extra=call('recordJlptExposure',initialState(),[q.id],old),merged=mergeStates(s,extra);assert.deepEqual(merged.v3.jlptHints[q.id],[old,today]);assert.deepEqual(parseBackup(exportBackup(merged)),merged);
});
test('reference exposure marks answers, is rejected on contradictory backdated merges and has no new score',()=>{
 const q=first();let s=call('startJlptRound',initialState(),{unitId:'N5-01',mode:'skill',ability:q.dimension,id:'one',time:today});s=call('recordJlptExposure',s,[q.id],today);s=answerV3Session(s,{sessionId:'one',question:q,value:q.correct,eventId:'first',time:later});assert(s.v3.sessions[0].answers[q.id].hinted);assert.equal(s.attempts.length,1);
 let plain=call('startJlptRound',initialState(),{unitId:'N5-01',mode:'skill',ability:q.dimension,id:'plain',time:today});plain=answerV3Session(plain,{sessionId:'plain',question:q,value:q.correct,eventId:'plain-answer',time:later});delete plain.v3.courseHistory;const saved=structuredClone(plain);assert.throws(()=>call('recordJlptExposure',plain,[q.id],today));assert.throws(()=>mergeStates(plain,call('recordJlptExposure',initialState(),[q.id],today)));assert.deepEqual(plain,saved);
});
test('invalid hints and notes reject bad IDs, dates, duplicate days and oversized text',()=>{
 for(const records of [{unknown:[today]},{[first().id]:[today,later]},{[first().id]:['not-date']},{[first().id]:[]}]){const s=initialState();s.v3.jlptHints=records;assert.throws(()=>validateState(s));}
 for(const key of ['text:JN-unknown','text:JN-N5-01']){const s=initialState();s.drafts[key]={text:'a'.repeat(161),points:[],time:today};assert.throws(()=>validateState(s));}
});
test('next-day and week candidates use real earlier attempts, Taipei dates and last references',()=>{
 const q=first(),s=add(initialState(),q.id);assert.equal(call('jlptCandidates',s,'N5','check',today)[0].id,q.id);assert.equal(call('jlptCandidates',s,'N5','week',today)[0].id,q.id);assert.equal(call('jlptCandidates',s,'N4','check',today).length,0);
 assert.equal(call('jlptCandidates',add(s,q.id,today),'N5','check',today).length,0);
 const exposed=call('recordJlptExposure',s,[q.id],'2026-10-17T02:00:00.000Z');assert.equal(call('jlptCandidates',exposed,'N5','week',today).length,0);assert.equal(call('jlptCandidates',initialState(),'N5','week',today).length,0);
});
test('weak reviews rank mistakes then hints, at most three distinct courses and no new IDs',()=>{
 let s=initialState();for(const [i,u] of units.filter(u=>u.level==='N5').slice(0,5).entries())s=add(s,unitQuestions(u)[0].id,old,i>1,i===2);
 const qs=call('jlptCandidates',s,'N5','repair',today);assert.equal(qs.length,3);assert.equal(new Set(qs.map(q=>q.unitId)).size,3);assert(qs.every(q=>s.attempts.some(a=>a.item===q.id)));assert.equal(qs[0].unitId,'N5-01');
});
test('future attempts and references never influence current eligibility or stats',()=>{
 const q=first(),base=add(initialState(),q.id),future=call('recordJlptExposure',add(base,q.id,'2026-10-30T02:00:00.000Z',false),[q.id],'2026-10-30T02:00:00.001Z');
 assert.deepEqual(call('jlptCandidates',future,'N5','week',today),call('jlptCandidates',base,'N5','week',today));assert.deepEqual(call('jlptMap',future,'N5',today),call('jlptMap',base,'N5',today));
});
test('check and week are once per level per day; another level remains available',()=>{
 let s=initialState();for(const level of ['N5','N4'])s=add(s,unitQuestions(units.find(u=>u.level===level))[0].id);
 s=call('startJlptRound',s,{level:'N5',mode:'check',id:'check',time:today});s=finish(s,'check',later);const same=call('startJlptRound',s,{level:'N5',mode:'check',id:'repeat',time:later});assert.deepEqual(same,s);assert.equal(call('startJlptRound',s,{level:'N4',mode:'check',id:'different',time:later}).v3.sessions.length,2);
});
test('completed results preserve original answers and classify comparable cross-day evidence',()=>{
 const q=first();let s=add(initialState(),q.id);s=call('startJlptRound',s,{level:'N5',mode:'week',id:'week',time:today});s=finish(s,'week',later);assert.deepEqual(call('jlptEvidence',s,'week'),{total:1,hinted:0,comparable:1,retained:1,excluded:0});const before=structuredClone(s);const r=call('jlptRoundReview',s,'week',later);r.entries[0].answer.correct=false;assert.deepEqual(s,before);
});
test('intervening or overlapping attempts are excluded from cross-day comparison',()=>{
 const q=first();let s=add(initialState(),q.id);s=call('startJlptRound',s,{level:'N5',mode:'check',id:'check',time:today});s=add(s,q.id,today,true,false,'intervening');s=finish(s,'check',later);assert.equal(call('jlptEvidence',s,'check').comparable,0);
});
test('daily path and map do not score cards, notes, writing or mock exam answers',()=>{
 let s=initialState();const note=call('storeJlptNote',s,'N5-01','先想人與身分🍵',today);assert.equal(note.attempts.length,0);assert.equal(call('jlptNextStep',note,'N5',today).kind,'new');assert.equal(call('jlptMap',note,'N5',today)[0].practiced,0);assert(!call('jlptCandidates',note,'N5','check',today).length);
 s=call('startJlptRound',s,{unitId:'N5-01',mode:'memory',id:'done',time:today});s=finish(s,'done',later);assert.equal(call('jlptNextStep',s,'N5',later).kind,'done');assert.equal(call('jlptNextStep',s,'N4',later).kind,'new');
});
test('personal note is separate from original writing and concurrent conflicting merge is refused',()=>{
 const s=initialState();s.drafts['text:N5-01']={text:'私の作文',points:[],time:old};const next=call('storeJlptNote',s,'N5-01','個人聯想🍵',today);assert.equal(next.drafts['text:N5-01'].text,'私の作文');assert.equal(next.drafts['text:JN-N5-01'].text,'個人聯想🍵');assert.deepEqual(parseBackup(exportBackup(next)),next);const branch=call('storeJlptNote',s,'N5-01','不同聯想',today);assert.throws(()=>mergeStates(next,branch));
});
test('every source and hint fixture round trips while original V1/V2/kana/life data remains intact',()=>{
 const s=initialState();s.drafts['text:LR-L07:0']={text:'原生活草稿',points:[],time:old};s.drafts['text:KN-h-3042']={text:'原假名線索',points:[],time:old};const next=call('startJlptRound',s,{unitId:'N2-24',mode:'skill',ability:'reading',id:'n2',time:today});assert.deepEqual(next.drafts,s.drafts);assert.deepEqual(parseBackup(exportBackup(next)),next);assert.deepEqual(mergeStates(next,s).v3.sessions,next.v3.sessions);
});
test('an empty personal reminder does not claim reference exposure',()=>{const s=call('storeJlptNote',initialState(),'N5-01','',today);assert(!s.v3.jlptHints);assert.equal(s.drafts['text:JN-N5-01'].text,'');});
test('original V2, V3 and standalone first answers reject contradictory exposure in both merge directions',()=>{
 const q=first(),exposed=call('recordJlptExposure',initialState(),[q.id],today),states=[];
 let v3=beginV3Session(initialState(),[q.id],{id:'original-v3',source:'concept',reference:'original',time:today});v3=answerV3Session(v3,{sessionId:'original-v3',question:q,value:q.correct,eventId:'original-answer',time:later});states.push(v3);
 const v2=initialState();v2.practice=answerPractice(createPractice({id:'original-v2',unitId:'N5-01',questionIds:[q.id],time:today}),q,q.correct,{time:later});states.push(v2);
 states.push(add(initialState(),q.id,later));
 for(const state of states){delete state.v3.courseHistory;const original=structuredClone(state);for(const pair of [[state,exposed],[exposed,state]])assert.throws(()=>mergeStates(...pair),/曝光.*首答衝突/);assert.throws(()=>call('recordJlptExposure',state,[q.id],today),/曝光.*首答衝突/);assert.deepEqual(state,original);const corrupt=structuredClone(state);corrupt.v3.jlptHints=exposed.v3.jlptHints;assert.throws(()=>validateState(corrupt),/曝光.*首答衝突/);assert.doesNotThrow(()=>call('recordJlptExposure',state,[q.id],'2026-10-23T02:02:00.000Z'));}
});
test('new rounds reject time-travel answer and completion timestamps in backup',()=>{let s=call('startJlptRound',initialState(),{unitId:'N5-01',mode:'memory',id:'chronology',time:today});s=finish(s,'chronology',later);for(const mutate of [x=>x.createdAt='2026-10-24T02:00:00.000Z',x=>x.updatedAt=old,x=>x.completedAt=old,x=>Object.values(x.answers)[0].time=old]){const broken=structuredClone(s);mutate(broken.v3.sessions[0]);assert.throws(()=>validateState(broken));}});
