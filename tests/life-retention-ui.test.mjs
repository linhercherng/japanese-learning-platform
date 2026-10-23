import test from 'node:test';import assert from 'node:assert/strict';
import {lifeWeekView,lifeScheduleView} from '../app/ui/life-retention.mjs';
import {lifeMapView} from '../app/ui/life-review.mjs';
import {initialState,recordAnswer} from '../app/core/learning.mjs';
import {startLifeWeek} from '../app/core/life-retention.mjs';import {startLifeMemory,memoryQuestions} from '../app/core/life-memory.mjs';
import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {questionById} from '../app/content/catalog.mjs';import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';
const old='2026-10-16T02:00:00.000Z',today='2026-10-23T02:00:00.000Z',qid='L07-v2-q1';
const ctx=()=>({state:initialState(),session:{}}),add=(c,time=old)=>{const q=questionById.get(qid);c.state=recordAnswer(c.state,{id:'old',item:qid,dimension:q.dimension,correct:false,hinted:false,time});return c;};
test('weekly page separates empty history, waiting date and eligible original questions without revealing answers',()=>{
 const c=ctx();assert.match(lifeWeekView(c,today),/先練|還沒有/);add(c,'2026-10-22T02:00:00.000Z');let html=lifeWeekView(c,today);assert.match(html,/2026-10-29/);assert.doesNotMatch(html,/data-life-retention-action="week"/);c.state=add(ctx()).state;html=lifeWeekView(c,today);assert.match(html,/1 題/);assert.match(html,/data-life-retention-action="week"/);assert.doesNotMatch(html,/コーヒー|data-audio|參考答案/);
});
test('all life pending rounds provide one resume link and completed weekly round cannot restart today',()=>{
 const c=add(ctx());c.state=startLifeWeek(c.state,{id:'week',time:today});assert.match(lifeWeekView(c,today),/#v3-practice\/week/);assert.doesNotMatch(lifeWeekView(c,today),/data-life-retention-action="week"/);const q=questionById.get(qid);c.state=answerV3Session(c.state,{sessionId:'week',question:q,value:q.correct,eventId:'a',time:today});c.state=nextV3Question(c.state,'week',today);const html=lifeWeekView(c,today);assert.match(html,/今天的七日回想已完成/);assert.match(html,/#v3-practice\/week/);assert.doesNotMatch(html,/data-life-retention-action="week"/);
});
test('forecast gives real course dates and honest no-history explanation, never plays audio or reveals questions',()=>{
 const c=ctx();assert.match(lifeScheduleView(c,today),/先完成|還沒有/);add(c,today);const html=lifeScheduleView(c,today);assert.match(html,/2026-10-24/);assert.match(html,/2026-10-30/);assert.match(html,/日期會隨|會隨/);assert.match(html,/不是通知|不會自動通知/);assert.doesNotMatch(html,/data-audio|參考答案/);
});
test('daily closure leaves manual weak practice available and routes to preview instead of repeating the same recommendation',()=>{
 const c=ctx();c.state=startLifeMemory(c.state,{unitId:'L07',id:'memory',time:today});for(const q of memoryQuestions('L07')){c.state=answerV3Session(c.state,{sessionId:'memory',question:q,value:q.kind==='cloze'?'wrong':1,eventId:q.id,time:today});c.state=nextV3Question(c.state,'memory',today);}const html=lifeMapView(c,today);assert.match(html,/今天的一小步/);assert.match(html,/#life-schedule/);assert.match(html,/自行加練/);assert.match(html,/data-life-review-action="repair"/);
});
test('weekly result reports seven-day evidence separately and keeps original review and neutral navigation paths',()=>{
 const c=add(ctx());c.state=startLifeWeek(c.state,{id:'week',time:today});const q=questionById.get(qid);c.state=answerV3Session(c.state,{sessionId:'week',question:q,value:q.correct,eventId:'a',time:today});c.state=nextV3Question(c.state,'week',today);const html=practiceV3View(c,'week',id=>questionById.get(id),today);assert.match(html,/#life-week/);assert.match(html,/#life-round\/week/);assert.match(html,/七日可比較首答：1 \/ 1/);assert.match(html,/#life-schedule/);assert(navigationContext(c,'v3-practice','week').trail.some(t=>t.route==='life-week'));assert.equal(navigationContext(c,'life-schedule').trail.at(-1).label,'生活複習預告');
});
