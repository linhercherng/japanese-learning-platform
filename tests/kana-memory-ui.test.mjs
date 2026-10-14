import test from 'node:test';import assert from 'node:assert/strict';
import {kanaMemoryView} from '../app/ui/kana-memory.mjs';import {initialState} from '../app/core/learning.mjs';import {kana} from '../app/content/kana.mjs';
const ctx=()=>({state:initialState(),session:{},kana,strokes:{}});
test('Memory workshop offers small three-mode drills, individual tips and resume without overwriting earlier sessions',()=>{
 const c=ctx(),html=kanaMemoryView(c);assert.match(html,/聽音選字/);assert.match(html,/平片假名配對/);assert.match(html,/詞中補字/);assert.match(html,/不是字源/);assert.match(html,/雨傘柄/);assert.match(html,/data-v3-action="kana-start"/);
 c.state.v3.sessions=[{id:'pending',source:'kana',completedAt:null,reference:'hira:listen:a',cursor:1,queue:[{},{}]}];assert(kanaMemoryView(c).includes('href="#v3-practice/pending"'));
});
test('Hiding cards removes glyphs, tips and word spellings while retaining audio and recall routes',()=>{
 const c=ctx();c.session.kanaMemory={script:'hira',row:'a',mode:'listen',count:5,hidden:true};const html=kanaMemoryView(c);assert.doesNotMatch(html,/雨傘柄/);assert.doesNotMatch(html,/class="km-glyph jp" lang="ja">あ</);assert.match(html,/data-audio="あ"/);assert.match(html,/data-recall-write/);
});

test('Recall handwriting hides the target glyph in text while preserving audio and explicit comparison',async()=>{
 const {writingView}=await import('../app/ui/kana.mjs');const c=ctx();c.session.guide=false;const html=writingView(c,'h-3042');assert.doesNotMatch(html,/寫一次 あ|あ · 字跡/);assert.match(html,/data-audio="あ"/);assert.match(html,/對照示範/);
});

test('Kana imports reject unknown sources and mismatched drill rows',async()=>{
 const {createV3}=await import('../app/v3.mjs'),{beginV3Session}=await import('../app/core/v3-learning.mjs'),{kanaDrills}=await import('../app/content/kana-drills.mjs');const beforeDocument=globalThis.document;globalThis.document={addEventListener:()=>{},removeEventListener:()=>{}};
 const q=kanaDrills.find(q=>q.script==='hira'&&q.row==='a'&&q.mode==='listen'),c=ctx();c.state=beginV3Session(c.state,[q.id],{id:'kana-validate',source:'kana',reference:'hira:listen:a',time:'2026-10-13T12:00:00Z'});
 const controller=createV3({getState:()=>c.state,getContext:()=>c,update:()=>{},toast:()=>{},render:()=>{},now:()=>'',id:()=>'',cacheDraft:()=>{}});try{assert.doesNotThrow(()=>controller.validateCatalog(c.state));c.state.v3.sessions[0].reference='kata:listen:a';assert.throws(()=>controller.validateCatalog(c.state),/不一致/);}finally{controller.dispose();globalThis.document=beforeDocument;}
});
