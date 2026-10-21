import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,recordAnswer} from '../app/core/learning.mjs';
import {pathView,repairView,rhythmView,beatState} from '../app/ui/kana-focus.mjs';
import {startKanaRepair} from '../app/core/kana-focus.mjs';
import {navigationContext} from '../app/ui/navigation.mjs';
import {practiceV3View} from '../app/ui/v3.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const now='2026-10-21T13:00:00Z',ctx=()=>({state:initialState(),session:{}});
test('rhythm hides readings and segmentation until an explicit reveal, no score is claimed',()=>{
 const c=ctx(),hidden=rhythmView(c,'coffee'),visible=hidden.replace(/<[^>]*>/g,'');assert(visible.includes('咖啡'));assert(!visible.includes('コーヒー'));assert(!visible.includes('コ・ー'));assert.match(hidden,/不會自動評分/);
 beatState(c.session,'coffee').revealed=true;beatState(c.session,'coffee').taps=3;
 const shown=rhythmView(c,'coffee');assert.match(shown,/コーヒー/);assert.match(shown,/參考分拍：4拍/);assert.match(shown,/你數了3拍/);assert(!shown.includes('答錯'));
 assert.match(rhythmView(c,'unknown'),/這張節奏卡無法開啟/);assert(!rhythmView(c,'unknown').includes('コーヒー'));
});
test('goal guide preserves concrete routes, pending repair hides target glyphs on every entry',()=>{
 const c=ctx();assert.match(pathView(c,now),/剛開始/);assert.match(repairView(c,now),/目前沒有已知/);
 c.state=recordAnswer(c.state,{id:'wrong',item:'h-306c',dimension:'recognition',correct:false,hinted:false,time:now});c.state=startKanaRepair(c.state,{id:'saved',time:now});
 for(const html of [pathView(c,now),repairView(c,now)]){assert(html.includes('v3-practice/saved'));assert(!html.includes('ぬ'));}
 const p=navigationContext(c,'v3-practice','saved');assert(p.trail.some(x=>x.route==='kana-repair'));assert.equal(p.section,'practice-hub');assert(!JSON.stringify(p).includes('ぬ'));
 const practice=practiceV3View(c,'saved',resolveLearningQuestion);assert(practice.includes('href="#kana-repair"'));
 for(const name of ['kana-path','kana-repair','kana-beats']){const n=navigationContext(c,name,name==='kana-beats'?'coffee':undefined);assert(n.trail.some(x=>x.route==='kana-studio'));assert.equal(n.section,'practice-hub');}
});
