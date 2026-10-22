import test from 'node:test';import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';import {setPocket,newPocketRound,startPocketListen,pendingPocketListen} from '../app/core/kana-pocket.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';import {answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';import {pocketView} from '../app/ui/kana-sixth.mjs';import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';
const time='2026-10-22T15:00:00.000Z';const context=()=>({state:setPocket(initialState(),'h-3042',true,time),session:{}});
test('listening entry appears only at the pocket menu or completed self-round, with no filler for empty pockets',()=>{
 const c=context();assert.match(pocketView(c,time),/data-six-action="pocket-listen"/);c.session.kanaPocketRound=newPocketRound(c.state,'local');assert(!pocketView(c,time).includes('data-six-action="pocket-listen"'));c.session.kanaPocketRound.cursor=1;assert.match(pocketView(c,time),/data-six-action="pocket-listen"/);assert(!pocketView({state:initialState(),session:{}},time).includes('data-six-action="pocket-listen"'));
});
test('pending listening hides any local self-round and blocks preview even if pocket is emptied later',()=>{
 const c=context();c.session.kanaPocketRound={...newPocketRound(c.state,'local'),revealed:true};c.state=startPocketListen(c.state,{id:'listen',time});c.state=setPocket(c.state,'h-3042',false,'2026-10-22T15:01:00.000Z');const html=pocketView(c,time);assert.match(html,/接續口袋聽音回想/);assert.match(html,/#v3-practice\/listen/);assert(!html.includes('k6-glyph'));assert(!html.includes('輔助讀音'));assert(!html.includes('data-six-action="pocket-start"'));assert(!html.includes('data-audio'));
});
test('question has only normal and slow audio, cue warning hides explanation, completion returns to pocket without automatic removal',()=>{
 const c=context();c.state=recordKanaExposure(c.state,['h-3042'],time);c.state=startPocketListen(c.state,{id:'listen',time});const q=resolveLearningQuestion(pendingPocketListen(c.state).questionIds[0]);let html=practiceV3View(c,'listen',resolveLearningQuestion,time);assert.match(html,/#kana-pocket/);assert.equal((html.match(/data-audio=/g)||[]).length,2);assert.match(html,/作答會記為使用提示/);assert(!html.includes(q.explanation));assert(!html.includes('輔助讀音'));
 c.state=answerV3Session(c.state,{sessionId:'listen',question:q,value:q.correct,eventId:'first',time});c.state=nextV3Question(c.state,'listen',time);html=practiceV3View(c,'listen',resolveLearningQuestion,time);assert.match(html,/不會自動移出口袋/);assert.match(html,/不是跨日掌握/);assert.match(pocketView(c,time),/這輪口袋聽辨結果/);
 const nav=navigationContext(c,'v3-practice','listen');assert(nav.trail.some(t=>t.route==='kana-pocket'));assert(!JSON.stringify(nav).includes('あ'));
});
