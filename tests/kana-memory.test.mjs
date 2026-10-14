import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {kana} from '../app/content/kana.mjs';
import {kanaMemory,memoryFor} from '../app/content/kana-memory.mjs';
import {kanaDrills,selectKanaDrills,validKanaReference} from '../app/content/kana-drills.mjs';
import {gradeQuestion} from '../app/core/study.mjs';
import {createHash} from 'node:crypto';
import {initialState,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,hintV3Question,nextV3Question} from '../app/core/v3-learning.mjs';
const time='2026-10-13T12:00:00.000Z';
const scriptPairs=[['h-3092','k-30f2','を','ヲ'],['h-304a','k-30aa','お','オ']];
for(const [hiraId,kataId,hira,kata] of scriptPairs)test(`${hira} ↔ ${kata} uses matching glyphs even when readings coincide`,()=>{
 assert.equal(memoryFor(hiraId).partnerId,kataId);assert.equal(memoryFor(kataId).partnerId,hiraId);
 assert.match(memoryFor(hiraId).recall,new RegExp(`再和${kata}配對`));assert.match(memoryFor(kataId).recall,new RegExp(`再和${hira}配對`));
 for(const [id,expected] of [[hiraId,kata],[kataId,hira]]){
  const q=kanaDrills.find(q=>q.id===`km-${id}-pair`);
  assert.equal(q.options[q.correct],expected);assert.equal(q.options.filter(g=>g===expected).length,1);
  assert(gradeQuestion(q,q.options.indexOf(expected)));
 }
});
test('All 92 basic kana script partners are reciprocal and match the Unicode glyph correspondence',()=>{
 for(const k of kana.filter(k=>k.group==='basic')){
  const expected=String.fromCodePoint(k.glyph.codePointAt(0)+(k.script==='hira'?0x60:-0x60)),partner=kana.find(p=>p.id===memoryFor(k.id).partnerId);
  assert.equal(partner.glyph,expected,k.glyph);assert.equal(partner.script,k.script==='hira'?'kata':'hira');
  assert.equal(memoryFor(partner.id).partnerId,k.id,k.glyph);
 }
});
test('Basic pairing options contain exactly one correct glyph, with unique opposite-script choices',()=>{
 for(const k of kana.filter(k=>k.group==='basic')){
  const q=kanaDrills.find(q=>q.id===`km-${k.id}-pair`),expected=String.fromCodePoint(k.glyph.codePointAt(0)+(k.script==='hira'?0x60:-0x60));
  assert.equal(q.options[q.correct],expected,q.id);assert.equal(q.options.filter(g=>g===expected).length,1,q.id);
  assert.equal(new Set(q.options).size,q.options.length,q.id);
  for(const [i,g] of q.options.entries()){assert.equal(kana.find(p=>p.glyph===g).script,k.script==='hira'?'kata':'hira',q.id);assert.equal(gradeQuestion(q,i),g===expected,q.id);}
 }
});
test('Pair correction preserves every drill ID and restores old answers, hints, drafts and reviews without regrading',()=>{
 assert.equal(createHash('sha256').update(JSON.stringify(kanaDrills.map(q=>q.id))).digest('hex'),'3aac4a8eb64417014fb7e9b2c14a01a811c27d8fd315a765f9a472876beb1adb');
 let s=initialState();s.completed.K06=time;s.artifacts.push({id:'legacy-work',item:'L07',kind:'text',text:'みずをのむ。',points:[],time});
 for(const [script,id,oldGlyph] of [['hira','h-3092','オ'],['kata','k-30f2','お']]){
  const q=kanaDrills.find(q=>q.id===`km-${id}-pair`),sid=`legacy-${script}`;
  s=beginV3Session(s,[q.id],{id:sid,source:'kana',reference:`${script}:pair:wa`,time});s=hintV3Question(s,sid,time);
  const oldQuestion={...q,options:[oldGlyph,...(script==='hira'?['ア','イ','ウ']:['あ','い','う'])],correct:0};
  s=answerV3Session(s,{sessionId:sid,question:oldQuestion,value:0,eventId:`legacy-answer-${script}`,time});
  s.drafts[`text:${sid}`]={text:'合成草稿',points:[],time};
 }
 const before=structuredClone(s),restored=parseBackup(exportBackup(s));
 assert.deepEqual(restored,before);assert.deepEqual(mergeStates(s,restored),s);
 for(const session of restored.v3.sessions){assert(validKanaReference(session.reference,session.questionIds));assert.equal(session.answers[session.questionIds[0]].value,0);assert.equal(session.answers[session.questionIds[0]].hinted,true);assert.equal(session.answers[session.questionIds[0]].correct,true);}
 assert.deepEqual(s,before);assert.deepEqual(restored.reviews,before.reviews);
});
test('92 basic kana have distinct original shape tips, paired scripts and meaningful recall prompts',()=>{
 const basicMemory=kanaMemory.filter(m=>m.group==='basic');assert.equal(basicMemory.length,92);assert.equal(new Set(basicMemory.map(c=>c.id)).size,92);assert.equal(new Set(basicMemory.map(c=>c.tip)).size,92);
 for(const k of kana.filter(k=>k.group==='basic')){const m=memoryFor(k.id);assert(m.tip.length>12);assert(m.anchor.length);assert(m.recall.length);assert.equal(kana.find(c=>c.id===m.partnerId).reading,k.reading);}
});
test('Three drill modes cover all basic kana, choices are unambiguous and audio exists',()=>{
 const basicDrills=kanaDrills.filter(q=>memoryFor(q.reviewItem).group==='basic');assert.equal(basicDrills.length,276);const audio=JSON.parse(readFileSync(new URL('../app/assets/audio.json',import.meta.url),'utf8'));assert.equal(new Set(basicDrills.map(q=>q.id)).size,276);
 for(const q of basicDrills){assert(kana.some(k=>k.id===q.reviewItem));assert(gradeQuestion(q,q.kind==='cloze'?q.accepted[0]:q.correct));if(q.kind==='listen'){assert(audio[q.transcript]);assert.equal(new Set(q.options.map(g=>{const k=kana.find(k=>k.glyph===g);return k.reading==='wo'?'o':k.reading;})).size,q.options.length);}if(q.kind==='cloze')assert(!gradeQuestion(q,'錯字'));}
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
