import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {kana} from '../app/content/kana.mjs';
import {kanaMemory,memoryFor} from '../app/content/kana-memory.mjs';
import {kanaDrills,selectKanaDrills,validKanaReference} from '../app/content/kana-drills.mjs';
import {gradeQuestion} from '../app/core/study.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,hintV3Question,nextV3Question} from '../app/core/v3-learning.mjs';
const time='2026-10-13T12:00:00.000Z';
test('92 basic kana have distinct original shape tips, paired scripts and meaningful recall prompts',()=>{
 assert.equal(kanaMemory.length,92);assert.equal(new Set(kanaMemory.map(c=>c.id)).size,92);assert.equal(new Set(kanaMemory.map(c=>c.tip)).size,92);
 for(const k of kana.filter(k=>k.group==='basic')){const m=memoryFor(k.id);assert(m.tip.length>12);assert(m.anchor.length);assert(m.recall.length);assert.equal(kana.find(c=>c.id===m.partnerId).reading,k.reading);}
});
test('Three drill modes cover all basic kana, choices are unambiguous and audio exists',()=>{
 assert.equal(kanaDrills.length,276);const audio=JSON.parse(readFileSync(new URL('../app/assets/audio.json',import.meta.url),'utf8'));assert.equal(new Set(kanaDrills.map(q=>q.id)).size,276);
 for(const q of kanaDrills){assert(kana.some(k=>k.id===q.reviewItem));assert(gradeQuestion(q,q.kind==='cloze'?q.accepted[0]:q.correct));if(q.kind==='listen'){assert(audio[q.transcript]);assert.equal(new Set(q.options.map(g=>{const k=kana.find(k=>k.glyph===g);return k.reading==='wo'?'o':k.reading;})).size,q.options.length);}if(q.kind==='cloze')assert(!gradeQuestion(q,'錯字'));}
});
test('Small random snapshots filter rows and modes, prioritize due mistakes and validate reference',()=>{
 const state=initialState(),qs=selectKanaDrills(state,{script:'hira',mode:'listen',row:'a',count:5,seed:'x',time});assert.equal(qs.length,5);assert(qs.every(q=>q.mode==='listen'&&q.row==='a'&&q.script==='hira'));assert.deepEqual(qs,selectKanaDrills(state,{script:'hira',mode:'listen',row:'a',count:5,seed:'x',time}));
 assert(validKanaReference('hira:listen:a',qs.map(q=>q.id)));assert(!validKanaReference('hira:listen:a',[kanaDrills.find(q=>q.script==='kata').id]));assert.throws(()=>selectKanaDrills(state,{script:'invalid',mode:'listen',row:'a',count:5,seed:'x',time}));
});
test('Kana drills retain glyph ability, hints and session snapshot in V3 backups',()=>{
 const qs=selectKanaDrills(initialState(),{script:'hira',mode:'listen',row:'a',count:5,seed:'x',time});let s=beginV3Session(initialState(),qs.map(q=>q.id),{id:'kana-one',source:'kana',reference:'hira:listen:a',time});s=hintV3Question(s,'kana-one',time);s=answerV3Session(s,{sessionId:'kana-one',question:qs[0],value:qs[0].correct,eventId:'kana-answer',time,variants:kanaDrills});s=nextV3Question(s,'kana-one',time);
 const restored=parseBackup(exportBackup(s));assert.equal(restored.attempts[0].item,qs[0].reviewItem);assert(restored.attempts[0].hinted);assert.deepEqual(restored.v3.sessions[0],s.v3.sessions[0]);
});

test('Due weak kana are selected before well practised kana without changing the requested ability',()=>{
 const s=initialState(),weak=kanaDrills.find(q=>q.script==='hira'&&q.mode==='listen'&&q.row==='ra');s.reviews[weak.reviewItem+':listening']={due:time,history:[{correct:false,hinted:false,time}]};
 assert.equal(selectKanaDrills(s,{script:'hira',mode:'listen',row:'all',count:5,seed:'different',time})[0].id,weak.id);
});

test('Word mistakes remain retrievable by both daily and legacy review routes',async()=>{
 const {resolveLearningQuestion,reviewQuestions}=await import('../app/content/catalog.mjs');const {recordAnswer,dueReviews}=await import('../app/core/learning.mjs');
 const q=kanaDrills.find(q=>q.id==='km-h-3042-word'),s=recordAnswer(initialState(),{id:'word-wrong',item:q.reviewItem,dimension:q.dimension,correct:false,hinted:false,time});
 assert.equal(resolveLearningQuestion(q.reviewItem,q.dimension).id,q.id);assert.equal(reviewQuestions(dueReviews(s,time))[0].id,q.id);
});
