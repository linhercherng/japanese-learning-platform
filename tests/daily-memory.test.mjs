import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,recordAnswer,mergeStates,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';
import {recordLifeExposure} from '../app/core/life-memory-state.mjs';
import {recordJlptExposure} from '../app/core/jlpt-memory-state.mjs';
import {lifeQuestionUnits} from '../app/content/life-memory-ids.mjs';
import {jlptQuestionUnits,jlptUnitMeta} from '../app/content/jlpt-memory-ids.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {unifiedReview} from '../app/core/unified-review.mjs';
const mod=await import('../app/core/daily-memory.mjs').catch(()=>({}));
const old='2026-10-10T01:00:00.000Z',at='2026-10-23T01:00:00.000Z',now='2026-10-24T02:00:00.000Z';
const goals=['K','L','N5','N4','N3','N2'];
const items=g=>g==='K'?['h-3042','h-3044','h-3046','h-3048']:g==='L'?[...lifeQuestionUnits.keys()]:[...jlptQuestionUnits].filter(([,u])=>jlptUnitMeta.get(u).level===g).map(([id])=>id);
const add=(s,g,time=at,correct=true,hinted=false,item=items(g)[0],id=time+item)=>recordAnswer(s,{id:id.replaceAll('.',''),item,dimension:g==='K'?'recognition':resolveLearningQuestion(item).dimension,correct,hinted,time});
const expose=(s,g,time,kind='feedback',item=items(g)[0])=>(g==='K'?recordKanaExposure:g==='L'?recordLifeExposure:recordJlptExposure)(s,[item],time,{kind,ref:'daily:test'});
const daily=(s,g,time=now,options)=>{assert.equal(typeof mod.dailyMemory,'function');return mod.dailyMemory(s,g,time,options);};

for(const g of goals){
 test(g+' uses before-answer cues without rewriting immutable answer flags',()=>{let s=add(initialState(),g);s=mergeStates(s,expose(initialState(),g,'2026-10-23T00:30:00.000Z','hint'));const r=daily(s,g);assert.equal(r.mode,'check');assert.equal(r.items[0].status,'review');assert.equal(r.priority,2);assert.equal(s.attempts[0].hinted,false);assert.equal(r.history.hint,1);});
 test(g+' feedback preserves proven memory and changes next review interval only',()=>{let s=add(add(initialState(),g,old),g);s=expose(s,g,'2026-10-23T01:00:00.001Z');const r=daily(s,g);assert.equal(r.summary.week,1);assert.equal(r.mode,'wait');assert.equal(r.priority,0);assert.equal(r.history.feedback,1);assert.equal(r.summary.week,1);assert.equal(daily(s,g,'2026-10-29T02:00:00Z').mode,'wait');assert.equal(daily(s,g,'2026-10-30T02:00:00Z').mode,'week');});
 test(g+' a reference today waits until Taipei tomorrow for automatic delayed recall',()=>{let s=add(initialState(),g);s=expose(s,g,'2026-10-24T00:30:00Z','reference');const r=daily(s,g);assert.equal(r.mode,'wait');assert.deepEqual(r.questionIds,[]);assert.equal(r.nextDay,'2026-10-25');assert.equal(daily(s,g,'2026-10-24T16:00:00Z').mode,'check');});
 test(g+' same-day correction cannot erase the daily first failure',()=>{let s=add(initialState(),g,'2026-10-23T01:00:00Z',false);s=add(s,g,'2026-10-23T01:01:00Z');assert.equal(daily(s,g).items[0].status,'review');assert.equal(daily(s,g).priority,2);});
 test(g+' legacy phase-unknown history is prioritized without creating a checkpoint',()=>{let s=add(initialState(),g);delete s.v3[g==='K'?'kanaHistory':'courseHistory'];if(g==='K')s.v3.kanaHints={[items(g)[0]]:{stage:0,updatedAt:'2026-10-23T02:00:00Z',lastHintAt:'2026-10-23T02:00:00Z'}};else s.v3[g==='L'?'lifeHints':'jlptHints']={[items(g)[0]]:['2026-10-23T02:00:00Z']};const before=structuredClone(s),r=daily(s,g);assert.equal(r.items[0].status,'uncertain');assert.equal(r.priority,1);assert.deepEqual(s,before);});
 test(g+' future cue events cannot change a past recommendation',()=>{let s=add(initialState(),g);const before=daily(s,g);s=expose(s,g,'2026-10-30T02:00:00Z');assert.deepEqual(daily(s,g),before);});
 test(g+' timeline, daily recommendation and weekly evidence agree and are read-only',()=>{let s=add(add(initialState(),g,old),g);s=expose(s,g,'2026-10-23T01:00:00.001Z');s.drafts['text:keep']={text:'原草稿🍵',points:[],time:at};const before=structuredClone(s),r=daily(s,g),report=unifiedReview(s,now).tracks.find(t=>t.goal===g);assert.deepEqual(r.summary,report.current);assert.deepEqual(s,before);const restored=parseBackup(exportBackup(s));assert.deepEqual(daily(restored,g),r);if(r.items[0])r.items[0].status='changed';else r.summary.week=999;assert.deepEqual(s,before);});
}

test('three items maximum, one question per kana or original unit, and one with 5 minutes',()=>{let s=initialState();for(const item of items('K'))s=add(s,'K',at,true,false,item);assert.equal(daily(s,'K').questionIds.length,3);s.settings.dailyMinutes=5;assert.equal(daily(s,'K').questionIds.length,1);});
test('weak daily first precedes stable memory even after a same-day successful correction',()=>{let s=add(add(initialState(),'K',old), 'K');s=add(s,'K',at,false,false,'h-3044');s=add(s,'K','2026-10-23T01:01:00Z',true,false,'h-3044');assert.equal(daily(s,'K').items[0].item,'h-3044');});
test('reference-only, self-rated writing and unknown sources never invent daily recall questions',()=>{let s=expose(initialState(),'K',at,'reference');s=recordAnswer(s,{id:'ink',item:'h-3042',dimension:'writing',correct:true,hinted:false,time:at});assert.equal(daily(s,'K').mode,null);assert.deepEqual(daily(s,'K').questionIds,[]);});
test('a today mistake is practice, not independent cross-day proof',()=>{const s=add(initialState(),'N2',now,false);assert.equal(daily(s,'N2').mode,'repair');assert.equal(daily(s,'N2').summary.review,1);});
test('proven cross-day recall earns a three-day interval instead of daily overpractice',()=>{let s=add(initialState(),'K','2026-10-21T01:00:00Z');s=add(s,'K','2026-10-23T01:00:00Z');const r=daily(s,'K');assert.equal(r.mode,'wait');assert.equal(r.nextDay,'2026-10-26');assert.equal(daily(s,'K','2026-10-26T02:00:00Z').mode,'check');});
test('seven-day memory earns seven days even after subsequent feedback',()=>{let s=add(add(initialState(),'N2',old),'N2');s=expose(s,'N2','2026-10-23T01:00:00.001Z');assert.equal(daily(s,'N2').mode,'wait');assert.equal(daily(s,'N2').nextDay,'2026-10-30');});
for(const g of goals)for(const mode of ['week','check','repair'])test(g+' '+mode+' starts original questions under the existing validated source and backup format',()=>{const s=add(initialState(),g,mode==='week'?old:mode==='repair'?now:at,false),r=daily(s,g,now,{mode});assert.equal(r.mode,mode);const next=mod.startDailyMemory(s,{goal:g,mode,id:'daily-original',time:now});assert.equal(next.v3.sessions.length,1);assert.deepEqual(next.v3.sessions[0].questionIds,r.questionIds);assert.deepEqual(next.attempts,s.attempts);assert.deepEqual(parseBackup(exportBackup(next)),next);});
