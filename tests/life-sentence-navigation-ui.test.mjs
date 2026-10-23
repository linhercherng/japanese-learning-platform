import test from 'node:test';
import assert from 'node:assert/strict';
import {lifeDictationView} from '../app/ui/life-dictation.mjs';
import {initialState} from '../app/core/learning.mjs';
import {storeLifeRecallDraft,storeLifeBlankDraft,lifeDictationPhrase} from '../app/core/life-dictation.mjs';
import {startLifeMemory} from '../app/core/life-memory.mjs';
const time='2026-10-23T07:00:00.000Z',ctx=()=>({state:initialState(),session:{}}),view=(c,ref,ui={})=>lifeDictationView(c,ref,{recall:true,...ui});
test('directory main entry targets the actual matching sentence and disclosure offers all three without nested links',()=>{
 const c=ctx();c.state=storeLifeRecallDraft(c.state,'L07:2','原稿秘密',time);c.state=storeLifeBlankDraft(c.state,'L07:1','再稿秘密',time,true);c.session.lifeRecallFilters={level:'L',topic:'all',scope:'written'};let html=view(c);
 assert.match(html,/<a class="life-map-unit" href="#life-recall\/L07:2"/);assert(html.includes('從第 3 句開始'));assert(html.includes('逐句練習清單 · 3 句'));assert.match(html,/<\/a><details class="life-sentence-navigation"/);for(const slot of [0,1,2])assert(html.includes('href="#life-recall/L07:'+slot+'"'));assert(html.includes('原稿有文字'));assert(html.includes('再想稿有文字'));assert(!html.includes('秘密'));assert(!html.includes(lifeDictationPhrase('L07:0').jp));assert(!html.includes(' open'));assert(html.includes('篩選決定主入口；展開清單可選本課三句。'));
 c.session.lifeRecallFilters.scope='blank';html=view(c);assert.match(html,/<a class="life-map-unit" href="#life-recall\/L07:1"/);assert(html.includes('從第 2 句開始'));
});
test('unwritten scope has an honest status and recoverable empty state',()=>{
 const c=ctx();for(const slot of [0,1,2])c.state=storeLifeRecallDraft(c.state,'L07:'+slot,'text',time);c.session.lifeRecallFilters={level:'L',topic:'food',scope:'unwritten'};const html=view(c);assert(html.includes('還沒留下文字'));assert(html.includes('目前範圍每句都已留下文字'));assert(html.includes('改看全部課程'));assert(html.includes('不代表沒學過或不會'));assert(!html.includes('#life-recall/L07:0'));assert(!html.includes('未學會'));
});
test('single-sentence navigation marks current ref without showing stored text or course answers',()=>{
 const c=ctx();c.state=storeLifeRecallDraft(c.state,'L07:1','私稿秘密',time);const html=view(c,'L07:1');assert(html.includes('本課三句導航 · 3 句'));assert.match(html,/href="#life-recall\/L07:1" aria-current="page"/);assert(html.includes('第 2 句 · 目前這句'));assert(!html.includes('秘密'));assert(!html.includes(lifeDictationPhrase('L07:1').jp));assert(!html.includes(' open'));
 const ld=view(c,'L07:1',{recall:false});assert(ld.includes('href="#life-dictation/L07:2"'));assert(!ld.includes('原稿有文字'));
});
test('navigation survives editor rendering without exposing other drafts and pending hides every sentence link',()=>{
 const c=ctx();c.state=storeLifeRecallDraft(c.state,'L07:1','別句秘密',time);let html=view(c,'L07:0',{open:true,blank:true,blankText:'當次&lt;'});assert(html.includes('當次&amp;lt;</textarea>'));assert(!html.includes('別句秘密'));assert(html.includes('本課三句導航'));c.state=startLifeMemory(c.state,{unitId:'L01',id:'original-round',time});for(const ref of [undefined,'L07:0']){html=view(c,ref,{open:true,blank:true,blankText:'當次'});assert(html.includes('#v3-practice/original-round'));assert(!html.includes('life-sentence-navigation'));assert(!html.includes('data-life-dictation-filter'));assert(!html.includes('當次'));}
});
