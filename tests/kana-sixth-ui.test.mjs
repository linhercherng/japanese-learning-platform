import test from 'node:test';import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';
import {flipView,duelView,flipLocal} from '../app/ui/kana-sixth.mjs';
import {navigationContext} from '../app/ui/navigation.mjs';
import {startDuel} from '../app/core/kana-sixth.mjs';
import {practiceV3View} from '../app/ui/v3.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {recordKanaExposure} from '../app/core/kana-studio.mjs';
test('flip shows the glyph first, reveals cue/audio only on request and labels self-check without score',()=>{
 const c={state:initialState(),session:{}},hidden=flipView(c,'h-3042');assert(hidden.includes('あ'));assert(!hidden.includes('data-audio='));assert(!hidden.includes('あめ'));assert.match(hidden,/刷新會重新開始/);
 flipLocal(c.session,'h-3042').revealed=true;const shown=flipView(c,'h-3042');assert(shown.includes('data-audio="あ"'));assert(shown.includes('あめ'));assert.match(shown,/還不熟/);
 const r=flipLocal(c.session,'h-3042');r.cursor=r.queue.length;r.needs=['h-3042'];const end=flipView(c,'h-3042');assert.match(end,/這輪曾選「還不熟」/);assert(!end.includes('答對率'));assert.match(flipView(c,'bad'),/無法開啟/);
});
test('duel directory and pending intro do not reveal target, routes return to the selected pair',()=>{
 const c={state:initialState(),session:{}},root=duelView(c);assert(!root.includes('シ'));assert(root.includes('兩點與尾筆方向'));
 const hidden=duelView(c,'shi-tsu');assert(!hidden.includes('シ'));c.session.sixCompare='shi-tsu';assert(duelView(c,'shi-tsu').includes('シ'));
 c.state=startDuel(c.state,{pair:'shi-tsu',id:'round',time:'2026-10-22T02:00:00Z'});assert(!duelView(c,'shi-tsu').includes('シ'));assert.match(duelView(c,'shi-tsu'),/接續原來的二選一/);
 const n=navigationContext(c,'v3-practice','round');assert(n.trail.some(x=>x.route==='kana-duel/shi-tsu'));assert(!JSON.stringify(n).includes('シ'));
 assert(practiceV3View(c,'round',resolveLearningQuestion).includes('href="#kana-duel/shi-tsu"'));
 for(const name of ['kana-flip','kana-duel']){const n=navigationContext(c,name);assert.equal(n.section,'practice-hub');assert(n.trail.some(x=>x.route==='kana-studio'));}
 assert.match(duelView(c,'unknown'),/無法開啟/);
});
test('duel has exactly two valid normal/slow audio controls and labels recent cues without revealing the explanation',()=>{
 const c={state:initialState(),session:{}},time='2026-10-22T02:00:00Z';c.state=recordKanaExposure(c.state,['k-30b7','k-30c4'],time);c.state=startDuel(c.state,{pair:'shi-tsu',id:'round',time});
 const html=practiceV3View(c,'round',resolveLearningQuestion,time),keys=[...html.matchAll(/data-audio="([^"]*)"/g)].map(m=>m[1]);assert.deepEqual(keys,['シ','シ']);assert.match(html,/今日或本輪看過對照/);assert(!html.includes('最後一筆由左下往右上'));
});
