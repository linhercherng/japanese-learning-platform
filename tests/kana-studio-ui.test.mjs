import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,parseBackup,exportBackup} from '../app/core/learning.mjs';
import {setHintStage,startDictation,updateDictationPoints,lockDictation} from '../app/core/kana-studio.mjs';
import {kanaFadeView,kanaDictationView,kanaWordsView,studioSelectView} from '../app/ui/kana-studio.mjs';
import {navigationContext,navigationView} from '../app/ui/navigation.mjs';
const time='2026-10-21T06:00:00.000Z',item='h-306c',context=()=>({state:initialState(),session:{},strokes:{'0306c':['M10 10 L90 90','M20 90 Q60 10 90 40']}});
const visible=html=>html.replace(/data-audio="[^"]*"/g,'');
test('four hint stages remove full glyph and tip content, leaving only quarter first-stroke then audio',()=>{
 const c=context();assert.match(kanaFadeView(c,item),/自編輪廓聯想/);assert.match(kanaFadeView(c,item),/ぬ/);
 c.state=setHintStage(c.state,item,1,time);const outline=visible(kanaFadeView(c,item));assert(!outline.includes('ぬ'));assert(!outline.includes('完整字形'));assert.match(outline,/ks-motif/);assert(!outline.includes('stroke-svg'));
 c.state=setHintStage(c.state,item,2,time);const start=visible(kanaFadeView(c,item));assert(!start.includes('ぬ'));assert.match(start,/stroke-dasharray="25 100"/);assert(!start.includes('M20 90'));
 c.state=setHintStage(c.state,item,3,time);const hidden=visible(kanaFadeView(c,item));assert(!hidden.includes('ぬ'));assert(!hidden.includes('ks-motif'));assert(!hidden.includes('stroke-svg'));assert.match(hidden,/只聽聲音/);
});
test('dictation shows no reference before lock unless hint is persisted; locked writing is read-only',()=>{
 const c=context();c.state=startDictation(c.state,{item,id:'one',time});let html=visible(kanaDictationView(c,item));assert(!html.includes('ぬ'));assert.match(html,/studio-canvas/);assert(!html.includes('stroke-svg'));
 c.state=updateDictationPoints(c.state,item,[[{x:.2,y:.2},{x:.7,y:.8}]],time);c.state=lockDictation(c.state,item,time);html=kanaDictationView(c,item);assert(!html.includes('<canvas'));assert.match(html,/已鎖定的原字跡/);assert.match(html,/對照範字/);assert.match(html,/自評/);
 assert.deepEqual(parseBackup(exportBackup(c.state)),c.state);
});
test('a recorded earlier hint does not automatically put the reference back onto the dictation board',()=>{
 const c=context();c.state=setHintStage(c.state,item,0,time);c.state=startDictation(c.state,{item,id:'one',time});
 assert(!visible(kanaDictationView(c,item)).includes('stroke-svg'));c.session.dictationHint='one';assert.match(kanaDictationView(c,item),/stroke-svg/);
});
test('life words teach distinct natural forms and rare katakana gets an honest alternative entrance',()=>{
 const c=context();assert.match(kanaWordsView(c,item),/生活詞/);assert.match(kanaWordsView(c,item),/data-studio-action="words-start"/);
 const rare=kanaWordsView(c,'k-30f2');assert.match(rare,/沒有足夠的自然生活詞/);assert(!rare.includes('data-studio-action="words-start"'));assert.match(rare,/kana-words\/h-3092/);
});
test('studio routes and word recall preserve parents without revealing selected target in navigation',()=>{
 const c=context();for(const name of ['kana-studio','kana-fade','kana-dictation','kana-words']){const n=navigationContext(c,name,item);assert(n.trail.some(t=>t.route==='kana-studio'));assert(!/[ぬヌ]/.test(navigationView(n)));}
 c.state.v3.sessions=[{id:'word-session',source:'kana-words',reference:item}];const nav=navigationContext(c,'v3-practice','word-session');assert(nav.trail.some(t=>t.route==='kana-words'));assert(!/[ぬヌ]/.test(navigationView(nav)));
});

test('studio selector has five semivoiced cards per script and kata examples use the displayed script label',()=>{
 const c=context(),html=studioSelectView(c);for(const name of ['平','片']){const section=html.split('label="'+name+'假名・半濁音">')[1]?.split('</optgroup>')[0];assert(section);assert.equal((section.match(/<option /g)||[]).length,5);}
 assert(!kanaWordsView(c,'k-30df-30e5').includes('這裡轉寫成平假名'));
});
