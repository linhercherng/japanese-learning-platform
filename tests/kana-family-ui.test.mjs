import test from 'node:test';import assert from 'node:assert/strict';
import {familyView,familyLocal} from '../app/ui/kana-family.mjs';import {startFamily} from '../app/core/kana-family.mjs';import {initialState} from '../app/core/learning.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-22T12:00:00Z';
test('family selection hides answer glyphs/readings and guide reveals only the selected member with valid controls',()=>{
 const c={state:initialState(),session:{}},hidden=familyView(c,'h-306f');assert(!hidden.includes('は'));assert(!hidden.includes('ぱ'));assert(!hidden.includes('data-audio='));assert.equal((hidden.match(/<option /g)||[]).length,58);assert(hidden.includes('href="#kana-family/k-30cf"'));
 const ui=familyLocal(c.session,'h-306f');ui.revealed=true;const shown=familyView(c,'h-306f');assert(shown.includes('data-audio="は"'));assert(shown.includes('加兩點'));assert(shown.includes('加小圈'));ui.selected='h-3071';assert(familyView(c,'h-306f').includes('data-audio="ぱ"'));
 familyLocal(c.session,'h-304b').revealed=true;assert(!familyView(c,'h-304b').includes('>加小圈<'));assert.match(familyView(c,'bad'),/無法開啟/);
});
test('pending family rounds hide comparison and preserve source breadcrumbs and return route',()=>{
 const c={state:startFamily(initialState(),{family:'h-306f',id:'round',time}),session:{}},ui=familyLocal(c.session,'h-306f');ui.revealed=true;const html=familyView(c,'h-306f');assert(html.includes('接續原來的聽辨'));assert(!html.includes('data-audio='));assert(!html.includes('は'));
 const n=navigationContext(c,'v3-practice','round');assert(n.trail.some(x=>x.route==='kana-family/h-306f'));assert.equal(navigationContext(c,'kana-family','h-306f').section,'practice-hub');assert(practiceV3View(c,'round',resolveLearningQuestion,time).includes('href="#kana-family/h-306f"'));
});
test('family listening has exactly normal/slow audio, warns about the third member cue without revealing answers and labels small-set practice',()=>{
 const c={state:recordKanaExposure(initialState(),['h-3071'],time),session:{}};c.state=startFamily(c.state,{family:'h-306f',id:'round',time});const q=resolveLearningQuestion(c.state.v3.sessions[0].questionIds[0]),html=practiceV3View(c,'round',resolveLearningQuestion,time);assert.deepEqual([...html.matchAll(/data-audio="([^"]*)"/g)].map(m=>m[1]),['は','は']);assert.match(html,/今日或本輪看過對照/);assert(!html.includes(q.explanation));c.state.v3.sessions[0].completedAt=time;assert.match(practiceV3View(c,'round',resolveLearningQuestion,time),/家族只有2～3個選項/);
});
