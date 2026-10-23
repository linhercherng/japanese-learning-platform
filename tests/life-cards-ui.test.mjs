import test from 'node:test';import assert from 'node:assert/strict';
import * as ui from '../app/ui/life-cards.mjs';
import {createLifeCards,revealLifeCard,rateLifeCard} from '../app/core/life-cards.mjs';
import {initialState} from '../app/core/learning.mjs';import {startLifeMemory,memoryPhrases} from '../app/core/life-memory.mjs';
import {lifeMemoryView} from '../app/ui/life-memory.mjs';import {navigationContext} from '../app/ui/navigation.mjs';
import {unitById} from '../app/content/catalog.mjs';
const time='2026-10-23T03:00:00.000Z';
const context=()=>({state:initialState(),session:{},audio:{},strokes:{}});
const active=(ctx,mode)=>{const local=ui.lifeCardsLocal(ctx.session);local.unitId='L07';local.round=createLifeCards('L07',mode);local.run=4;return local;};
test('landing offers two short directions and source breadcrumbs without exposing the phrases',()=>{
 assert.equal(typeof ui.lifeCardsView,'function');const c=context(),html=ui.lifeCardsView(c,'L07');
 assert.match(html,/看中文，想日文/);assert.match(html,/聽日文，想意思/);assert.match(html,/暫存/);for(const line of memoryPhrases('L07'))assert(!html.includes(line.jp));
 const nav=navigationContext(c,'life-cards','L07');assert.equal(nav.section,'practice-hub');assert(nav.trail.some(n=>n.route==='life-memory/L07'));assert.equal(nav.trail.at(-1).label,'逐句回想卡');
 assert.match(lifeMemoryView(c,'L07',time),/#life-cards\/L07/);
});
test('meaning front shows only Chinese, sound front hides both answer languages until comparison',()=>{
 const c=context(),line=memoryPhrases('L07')[0];active(c,'meaning');let html=ui.lifeCardsView(c,'L07');assert(html.includes(line.zh));assert(!html.includes(line.jp));assert(!html.includes('data-life-cards-action="audio"'));assert(!html.includes('data-life-cards-action="rate"'));
 active(c,'sound');html=ui.lifeCardsView(c,'L07');assert(!html.includes(line.zh));assert(!html.includes(line.jp));assert.match(html,/data-life-cards-action="audio"/);assert.match(html,/data-life-cards-rate="0.75"/);
 c.session.lifeCards.round=revealLifeCard(c.session.lifeCards.round);html=ui.lifeCardsView(c,'L07');assert(html.includes(line.zh));assert(html.includes(line.jp));assert.match(html,/這次想起來/);assert.match(html,/還想再練/);assert.match(html,/lang="ja"/);assert.match(html,/tabindex="-1"/);
});
test('pending hides all references including a previously revealed card and invalid units have a recovery path',()=>{
 const c=context();const local=active(c,'meaning');local.round=revealLifeCard(local.round);c.state=startLifeMemory(c.state,{unitId:'L01',id:'pending',time});
 const html=ui.lifeCardsView(c,'L07');assert.match(html,/#v3-practice\/pending/);assert(!html.includes(memoryPhrases('L07')[0].jp));assert(!html.includes('data-life-cards-action='));assert.match(ui.lifeCardsView(c,'bad'),/生活記憶目錄/);
});
test('bounded finish labels self evaluation and offers the original three questions and later review',()=>{
 const c=context(),local=active(c,'meaning');for(const rating of ['remember','remember','again'])local.round=rateLifeCard(revealLifeCard(local.round),rating);
 const html=ui.lifeCardsView(c,'L07');assert.match(html,/2 句這次想起來/);assert.match(html,/1 句留到稍後再想/);assert.match(html,/不增加答對數/);assert.match(html,/data-life-cards-action="practice"/);assert.match(html,/#life-check/);assert.match(html,/#life-schedule/);assert(!html.includes(memoryPhrases('L07')[0].jp));
});
test('original title, phrase and speaker text are HTML encoded in the reference view',()=>{
 const c=context(),unit=unitById.get('L07'),originalTitle=unit.title,line=unit.dialogue[0],original={...line};
 try{unit.title='<img onerror=bad>';line.jp='<script>bad</script>';line.zh='<b>中文</b>';line.speaker='<em>speaker</em>';active(c,'meaning');c.session.lifeCards.round=revealLifeCard(c.session.lifeCards.round);const html=ui.lifeCardsView(c,'L07');assert(!html.includes('<script>'));assert(!html.includes('<img onerror'));assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;b&gt;/);assert.match(html,/&lt;em&gt;/);}finally{unit.title=originalTitle;Object.assign(line,original);}
});
