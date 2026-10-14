import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {kana} from '../app/content/kana.mjs';
import {kanaMemory,memoryFor} from '../app/content/kana-memory.mjs';
import {kanaDrills,selectKanaDrills,validKanaReference} from '../app/content/kana-drills.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,hintV3Question,nextV3Question} from '../app/core/v3-learning.mjs';
import {gradeQuestion} from '../app/core/study.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
const time='2026-10-14T12:00:00.000Z';
const audio=JSON.parse(readFileSync(new URL('../app/assets/audio.json',import.meta.url),'utf8'));
const pack=JSON.parse(readFileSync(new URL('../app/assets/offline-manifest.json',import.meta.url),'utf8')).packs.find(p=>p.id==='K');

test('Released 274 unaffected basic questions retain their content and distractor ordering',()=>{
 const corrected=new Set(['km-h-3092-pair','km-k-30f2-pair']);
 const basic=kanaDrills.filter(q=>memoryFor(q.reviewItem).group==='basic'&&!corrected.has(q.id));assert.equal(basic.length,274);
 assert.equal(createHash('sha256').update(JSON.stringify(basic)).digest('hex'),'5cd96d9ff7fee1f7f875a18b10f7b0b9c862836a8f53cc6d3ca701616d54a844');
});

test('All existing kana receive individual memory cards, 40 voiced, 10 semi-voiced and 66 contracted',()=>{
 assert.equal(kanaMemory.length,208);assert.equal(new Set(kanaMemory.map(m=>m.tip)).size,208);
 for(const [group,count] of [['basic',92],['voiced',40],['semivoiced',10],['contracted',66]])assert.equal(kanaMemory.filter(m=>m.group===group).length,count);
 for(const k of kana){const m=memoryFor(k.id);assert(m.tip.length>12);assert(m.recall);assert.equal(kana.find(p=>p.id===m.partnerId).script,k.script==='hira'?'kata':'hira');if(k.group!=='basic'){assert(m.formula);assert(m.practiceWord.includes(k.glyph));assert(m.wordNote);}}
 assert.match(memoryFor('h-3074').tip,/小圈/);assert.match(memoryFor('h-3062').tip,/同音/);assert.match(memoryFor('h-304d-3083').tip,/一拍/);
});

test('Three full recall modes and advanced construction mode have unique answers and offline audio',()=>{
 assert.equal(kanaDrills.length,740);assert.equal(new Set(kanaDrills.map(q=>q.id)).size,740);
 const sound=g=>{const k=kana.find(k=>k.glyph===g);assert(k,g);return k.reading==='wo'?'o':k.reading;};
 for(const k of kana){const qs=kanaDrills.filter(q=>q.reviewItem===k.id);assert.deepEqual(qs.map(q=>q.mode),k.group==='basic'?['listen','pair','word']:['listen','pair','word','build']);
 for(const q of qs){assert(gradeQuestion(q,q.kind==='cloze'?q.accepted[0]:q.correct));assert(q.explanation);if(q.options)assert.equal(new Set(q.options).size,q.options.length);if(q.kind==='listen'){assert.equal(new Set(q.options.map(sound)).size,q.options.length);assert(pack.files.includes(audio[q.transcript]));}if(q.kind==='cloze'){assert.match(q.prompt,/＿＿/);assert(!gradeQuestion(q,'錯字'));assert(pack.files.includes(audio[q.audio]));}}}
});

test('Advanced scopes stay separate, three-character rounds stay small and old all still means basic',()=>{
 const state=initialState();
 for(const [row,group,n] of [['ga','voiced',5],['pa','semivoiced',5],['kya','contracted',3],['contracted-all','contracted',10]]){
 const qs=selectKanaDrills(state,{script:'kata',mode:'word',row,count:10,seed:'advanced',time});assert.equal(qs.length,n);assert(qs.every(q=>memoryFor(q.reviewItem).group===group));assert(validKanaReference(`kata:word:${row}`,qs.map(q=>q.id)));assert(!validKanaReference(`hira:word:${row}`,qs.map(q=>q.id)));assert.deepEqual(qs,selectKanaDrills(state,{script:'kata',mode:'word',row,count:10,seed:'advanced',time}));}
 const old=selectKanaDrills(state,{script:'hira',mode:'listen',row:'all',count:10,seed:'old',time});assert(old.every(q=>memoryFor(q.reviewItem).group==='basic'));
 assert(!validKanaReference('hira:listen:all',[kanaDrills.find(q=>q.reviewItem==='h-304c'&&q.mode==='listen').id]));
 assert.throws(()=>selectKanaDrills(state,{script:'hira',mode:'build',row:'a',count:5,seed:'x',time}));
});

test('Advanced hints, first answers and backups preserve old sessions and resolve weak word items',()=>{
 const old=selectKanaDrills(initialState(),{script:'hira',mode:'pair',row:'a',count:5,seed:'old',time});let state=beginV3Session(initialState(),old.map(q=>q.id),{id:'old-kana',source:'kana',reference:'hira:pair:a',time});
 const qs=selectKanaDrills(state,{script:'hira',mode:'word',row:'kya',count:5,seed:'new',time});state=beginV3Session(state,qs.map(q=>q.id),{id:'new-kana',source:'kana',reference:'hira:word:kya',time});state=hintV3Question(state,'new-kana',time);state=answerV3Session(state,{sessionId:'new-kana',question:qs[0],value:'錯字',eventId:'new-first',time,variants:kanaDrills});state=nextV3Question(state,'new-kana',time);
 const restored=parseBackup(exportBackup(state));assert.deepEqual(restored.v3.sessions,state.v3.sessions);assert.equal(restored.attempts[0].correct,false);assert.equal(restored.attempts[0].hinted,true);assert.equal(resolveLearningQuestion(qs[0].reviewItem,'language').reviewItem,qs[0].reviewItem);
});

test('Word usage labels distinguish real katakana loanwords from kana transcription practice',()=>{
 for(const glyph of ['パ','ピ','プ','ペ','ポ']){const k=kana.find(k=>k.glyph===glyph),m=memoryFor(k.id);assert.match(m.wordNote,/常用片假名詞/);assert.doesNotMatch(m.wordNote,/不把轉寫當外來語/);}
 assert.match(memoryFor('h-3071').wordNote,/パン/);assert.match(memoryFor('k-30ac').wordNote,/轉寫/);assert.match(memoryFor('h-307f-3085').wordNote,/ミュージック/);
});

test('Word recall blanks every repeated target and does not reveal the full loanword spelling before a hint',()=>{
 const repeat=kanaDrills.find(q=>q.id==='km-h-3074-3087-word');assert.equal(repeat.prompt.split('＿＿').length-1,2);assert(!repeat.prompt.includes('ぴょ'));
 const music=kanaDrills.find(q=>q.id==='km-h-307f-3085-word');assert(!music.prompt.includes('ミュージック'));assert(music.explanation.includes('ミュージック'));
});
