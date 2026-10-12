import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {units,scenarios,allUnits,forms,words,kanjiItems,grammarItems,unitQuestions,resolveQuestion,levels} from '../app/content/catalog.mjs';
const required=(text,label)=>assert.ok(typeof text==='string'&&text.trim(),label);
assert.equal(units.length,90);assert.equal(scenarios.length,60);assert.equal(allUnits.length,162);assert.equal(forms.length,6);
const expected={N5:24,N4:30,N3:36},wordTargets={N5:800,N4:1000,N3:1400},readTargets={N5:100,N4:180,N3:300};
const ids=new Set();
function question(q){
 assert.ok(!ids.has(q.id),`重複題目 ${q.id}`);ids.add(q.id);required(q.prompt,q.id);required(q.explanation,q.id);
 assert.ok(['choice','cloze','order','listen'].includes(q.kind));
 if(['choice','listen'].includes(q.kind)){assert.ok(q.options.length>=3);assert.equal(new Set(q.options).size,q.options.length,`重複選項 ${q.id}`);assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length);q.options.forEach(o=>required(o,q.id));}
 if(q.kind==='listen')required(q.transcript,`無聽解 ${q.id}`);
 if(q.kind==='cloze'){assert.ok(Array.isArray(q.accepted)&&q.accepted.length);q.accepted.forEach(a=>required(a,q.id));}
 if(q.kind==='order'){assert.ok(q.tokens.length>=2&&q.answerOrder.length===q.tokens.length);assert.equal(new Set(q.answerOrder).size,q.tokens.length);assert.ok(q.answerOrder.every(i=>Number.isInteger(i)&&i>=0&&i<q.tokens.length));}
 if(q.dimension==='reading')required(resolveQuestion(q.id)?.passage||q.passage,`無讀解本文 ${q.id}`);
}
for(const level of levels){assert.equal(units.filter(u=>u.level===level).length,expected[level]);assert.equal(scenarios.filter(u=>u.level===level).length,20);assert.ok(words.filter(w=>w.levels.includes(level)).length>=wordTargets[level]);}
for(const unit of allUnits){
 required(unit.title,unit.id);required(unit.goal,unit.id);assert.ok(unit.vocabulary.length>=4);assert.ok(unit.dialogue.length>=4);
 unit.vocabulary.forEach(w=>{for(const k of ['jp','reading','zh'])required(w[k],unit.id);});unit.dialogue.forEach(d=>{for(const k of ['jp','reading','zh'])required(d[k],unit.id);});
 required(unit.writing.prompt,unit.id);required(unit.writing.sample,unit.id);assert.ok(unit.writing.checklist.length>=3);
 if(units.includes(unit)){assert.ok(unit.vocabulary.length>=12&&unit.grammar.length>=2&&unit.kanji.length>=3&&unit.dialogue.length>=6);assert.equal(unit.questions.length,8);assert.equal(unit.reading.questions.length,2);assert.ok([...unit.reading.jp].length>=readTargets[unit.level]);}
 for(const g of unit.grammar){for(const key of ['pattern','meaning','formation','explanation','contrast','pitfall'])required(g[key],unit.id);assert.ok(g.examples.length>=2);g.examples.forEach(ex=>{required(ex.jp,unit.id);required(ex.zh,unit.id);});}
 unitQuestions(unit).forEach(question);
}
for(const form of forms){assert.equal(form.sections.length,3);assert.deepEqual(form.sections.map(s=>s.questions.length),[20,30,20]);assert.deepEqual(form.sections.map(s=>s.minutes),{N5:[20,40,30],N4:[25,55,35],N3:[30,70,40]}[form.level]);form.sections.forEach(s=>s.questions.forEach(question));}
assert.equal(new Set(words.map(w=>`${w.jp}\n${w.reading}`)).size,words.length);
const load=async path=>JSON.parse((await readFile(new URL(`../app/${path}`,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
const shell=await load('assets/shell-manifest.json'),offline=await load('assets/offline-manifest.json');
for(const file of shell.files){const bytes=await readFile(new URL(`../app/${file}`,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),shell.hashes[file],`離線shell雜湊已過期 ${file}，請先 npm run build`);}
assert.ok(offline.packs.every(pack=>pack.complete&&pack.missingAudioCount===0),'離線音檔尚未完整生成');
console.log(JSON.stringify({units:units.length,scenarios:scenarios.length,life:12,words:words.length,wordsByLevel:Object.fromEntries(levels.map(l=>[l,words.filter(w=>w.levels.includes(l)).length])),kanji:kanjiItems.length,grammar:grammarItems.length,questions:ids.size,forms:forms.length,shellFiles:shell.files.length,packs:offline.packs.map(p=>({id:p.id,files:p.files.length,bytes:p.bytes}))},null,2));
