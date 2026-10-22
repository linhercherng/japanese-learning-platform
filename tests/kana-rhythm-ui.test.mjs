import test from 'node:test';import assert from 'node:assert/strict';
import {rhythmView,beatState} from '../app/ui/kana-focus.mjs';import {startRhythm,recordRhythmExposure} from '../app/core/kana-rhythm.mjs';import {initialState} from '../app/core/learning.mjs';import {practiceV3View} from '../app/ui/v3.mjs';import {navigationContext} from '../app/ui/navigation.mjs';import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-22T13:30:00Z';
test('estimate comparison appears only with the guide; taps remain self-estimates and all cards offer their group round',()=>{
 const c={state:initialState(),session:{}},hidden=rhythmView(c,'tea');assert.match(hidden,/這組聽音數拍3題/);assert(!hidden.includes('參考分拍'));assert(!hidden.includes('おちゃ'));const ui=beatState(c.session,'tea');ui.revealed=true;assert.match(rhythmView(c,'tea'),/還沒記錄估拍/);ui.taps=3;assert.match(rhythmView(c,'tea'),/你估計3拍，參考2拍/);ui.taps=2;assert.match(rhythmView(c,'tea'),/這次估計與參考拍數相同/);assert.equal(c.state.attempts.length,0);
});
test('pending group hides all counter, guide and audio and returns to original source card after refresh',()=>{
 const c={state:startRhythm(initialState(),{card:'photo',id:'r',time}),session:{}};beatState(c.session,'tea').revealed=true;const html=rhythmView(c,'tea');assert.match(html,/接續原來的數拍三題/);assert(!html.includes('data-audio='));assert(!html.includes('data-focus-action="tap"'));assert(!html.includes('おちゃ'));assert.match(practiceV3View(c,'r',resolveLearningQuestion,time),/href="#kana-beats\/photo"/);assert(navigationContext(c,'v3-practice','r').trail.some(t=>t.route==='kana-beats/photo'));
});
test('rhythm quiz hides written answer before reply, shows numeric choices/two sounds and precise cue warning',()=>{
 const c={state:recordRhythmExposure(initialState(),'photo',time),session:{}};c.state=startRhythm(c.state,{card:'tea',id:'r',time});const html=practiceV3View(c,'r',resolveLearningQuestion,time);assert.match(html,/拍數辨認/);assert.match(html,/看過這個詞的拍格/);assert(!html.includes('しゃしん'));assert.equal((html.match(/data-audio=/g)||[]).length,2);assert(html.includes('>3拍</button>'));c.state.v3.sessions[0].completedAt=time;assert.match(practiceV3View(c,'r',resolveLearningQuestion,time),/完整詞拍數/);
});
