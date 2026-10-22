import test from 'node:test';import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';import {setPocket,newPocketRound} from '../app/core/kana-pocket.mjs';
import {pocketView,flipView} from '../app/ui/kana-sixth.mjs';import {navigationContext} from '../app/ui/navigation.mjs';
const time='2026-10-22T14:00:00.000Z';
const context=()=>({state:setPocket(setPocket(initialState(),'h-3042',true,time),'k-30a2',true,time),session:{}});
test('empty pocket guides back to original flip; menu hides glyphs until starting a short round',()=>{
 const empty=pocketView({state:initialState(),session:{}});assert.match(empty,/還沒有留下不熟字/);assert.match(empty,/#kana-flip/);assert(!empty.includes('data-six-action="pocket-start"'));
 const c=context(),menu=pocketView(c);assert.match(menu,/口袋裡有2字/);assert(!menu.includes('class="k6-glyph'));assert.match(menu,/data-six-action="pocket-start"/);assert.match(flipView(c),/不熟字口袋（2字）/);
});
test('round hides readings and self-assessment before reveal, exposes original cues only after reveal, ends without scores',()=>{
 const c=context();c.session.kanaPocketRound=newPocketRound(c.state,'round');let html=pocketView(c);
 assert.match(html,/1 \/ 2/);assert.match(html,/data-six-action="pocket-reveal"/);assert(!html.includes('data-six-action="pocket-remove"'));assert(!html.includes('輔助讀音'));assert(!html.includes('data-audio='));
 c.session.kanaPocketRound.revealed=true;html=pocketView(c);assert.match(html,/輔助讀音：a/);assert.match(html,/data-six-action="pocket-remove"/);assert.match(html,/data-six-action="pocket-keep"/);assert.match(html,/data-audio="あ"/);
 c.session.kanaPocketRound.cursor=2;html=pocketView(c);assert.match(html,/這輪已對照2字/);assert.match(html,/不是答對或熟練證明/);assert(!html.includes('class="k6-glyph'));
});
test('pocket deep-link breadcrumbs identify practice and contain no answers',()=>{
 const nav=navigationContext(context(),'kana-pocket');assert.equal(nav.section,'practice-hub');assert.equal(nav.trail.at(-1).label,'不熟字口袋');assert(nav.trail.some(t=>t.route==='kana-flip'));assert(!JSON.stringify(nav).includes('あ'));
});
