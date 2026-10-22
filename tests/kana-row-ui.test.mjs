import test from 'node:test';import assert from 'node:assert/strict';
import {rowView,rowLocal} from '../app/ui/kana-row.mjs';import {startRow} from '../app/core/kana-row.mjs';import {initialState} from '../app/core/learning.mjs';import {recordKanaExposure} from '../app/core/kana-studio.mjs';
import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-22T13:00:00Z';
test('row explorer hides all answers until a cell is selected and never offers empty cells as buttons',()=>{
 const c={state:initialState(),session:{}},hidden=rowView(c,'h-2');assert(!hidden.includes('か'));assert(!hidden.includes('data-audio='));assert.equal((hidden.match(/<option /g)||[]).length,20);assert(hidden.includes('href="#kana-row/k-2"'));assert(hidden.includes('href="#kana-row/h-3"'));
 const ui=rowLocal(c.session,'h-2');ui.revealed=true;const shown=rowView(c,'h-2');assert(shown.includes('data-audio="か"'));assert(!shown.includes('data-audio="き"'));ui.selected='h-304d';assert(rowView(c,'h-2').includes('data-audio="き"'));
 const sparse=rowView(c,'h-8');assert.equal((sparse.match(/data-row-target=/g)||[]).length,3);assert.equal((sparse.match(/此段留空/g)||[]).length,2);assert.equal((sparse.match(/data-row-action="start"/g)||[]).length,1);assert.match(rowView(c,'bad'),/無法開啟/);
});
test('pending row hides glyphs/audio and original half is used for breadcrumbs and return route',()=>{
 const c={state:startRow(initialState(),{round:'h-2-b',id:'r',time}),session:{}};rowLocal(c.session,'h-2').revealed=true;const html=rowView(c,'h-2');assert(html.includes('接續原來的聽辨'));assert(!html.includes('data-audio='));assert(!html.includes('data-row-target='));assert(!html.includes('か'));
 assert(navigationContext(c,'v3-practice','r').trail.some(t=>t.route==='kana-row/h-2'));assert.equal(navigationContext(c,'kana-row','h-2').section,'practice-hub');assert(practiceV3View(c,'r',resolveLearningQuestion,time).includes('href="#kana-row/h-2"'));
});
test('listening warns only for the actual target cue, keeps explanation hidden and uses exactly two audio buttons',()=>{
 const c={state:recordKanaExposure(initialState(),['h-304d'],time),session:{}};c.state=startRow(c.state,{round:'h-2-a',id:'r',time});const html=practiceV3View(c,'r',resolveLearningQuestion,time),q=resolveLearningQuestion(c.state.v3.sessions[0].questionIds[0]);assert.match(html,/今日或本輪看過對照/);assert(!html.includes(q.explanation));assert.deepEqual([...html.matchAll(/data-audio="([^"]*)"/g)].map(m=>m[1]),['き','き']);
 const other={state:startRow(recordKanaExposure(initialState(),['h-3051'],time),{round:'h-2-a',id:'r',time}),session:{}};assert(!practiceV3View(other,'r',resolveLearningQuestion,time).includes('今日或本輪看過對照'));
});
