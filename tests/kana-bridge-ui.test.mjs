import test from 'node:test';import assert from 'node:assert/strict';
import {bridgeView} from '../app/ui/kana-bridge.mjs';import {startBridge} from '../app/core/kana-bridge.mjs';
import {initialState} from '../app/core/learning.mjs';import {recordKanaExposure} from '../app/core/kana-studio.mjs';
import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-22T04:00:00Z';
test('bridge hides pairs until requested and offers eight groups, reverse and next group without previewing answers',()=>{
 const c={state:initialState(),session:{}},html=bridgeView(c,'h-3042');assert(!html.includes('あ'));assert(!html.includes('ア'));assert.equal((html.match(/<option /g)||[]).length,8);assert(html.includes('href="#kana-bridge/k-30a2"'));assert(html.includes('href="#kana-bridge/h-3048"'));assert(!html.includes('data-audio='));
 c.session.bridgeCompare='h-3042';const shown=bridgeView(c,'h-3042');assert(shown.includes('あ'));assert(shown.includes('ア'));assert.equal((shown.match(/data-audio=/g)||[]).length,3);assert(shown.includes('雨傘'));assert(shown.includes('收起雙形對照'));assert.match(bridgeView(c,'bad'),/無法開啟/);
});
test('bridge pending and source navigation preserve the original round and do not leak comparison',()=>{
 const c={state:startBridge(initialState(),{item:'h-3042',id:'round',time}),session:{bridgeCompare:'h-3042'}};const html=bridgeView(c,'h-3042');assert(html.includes('接續原來的三題'));assert(!html.includes('ア'));assert(!html.includes('data-audio='));
 const n=navigationContext(c,'v3-practice','round');assert.equal(n.section,'practice-hub');assert(n.trail.some(x=>x.route==='kana-bridge/h-3042'));assert.equal(navigationContext(c,'kana-bridge','h-3042').trail.at(-1).label,'平片互換三題');assert(practiceV3View(c,'round',resolveLearningQuestion,time).includes('href="#kana-bridge/h-3042"'));
});
test('recent bridge cues show a warning while explanation stays hidden; completed results offer reverse recall',()=>{
 const c={state:recordKanaExposure(initialState(),['k-30a2'],time),session:{}};c.state=startBridge(c.state,{item:'h-3042',id:'round',time});const q=resolveLearningQuestion(c.state.v3.sessions[0].questionIds[0]),hidden=practiceV3View(c,'round',resolveLearningQuestion,time);assert.match(hidden,/今日或本輪看過對照/);assert(!hidden.includes(q.explanation));
 c.state.v3.sessions[0].completedAt=time;const end=practiceV3View(c,'round',resolveLearningQuestion,time);assert(end.includes('href="#kana-bridge/k-30a2"'));assert.match(end,/同日換方向/);
});
