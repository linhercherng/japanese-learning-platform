import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {kana,kanaLessons,kanaPhonology} from '../app/content/kana.mjs';
import {lifeLessons,allUnits,kanjiItems,forms,words} from '../app/content/catalog.mjs';
import {wordAudioKey} from '../app/ui/shared.mjs';
const load=async name=>JSON.parse((await readFile(new URL(`../app/assets/${name}`,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
const strokes=await load('strokes.json');
const audio=await load('audio.json');
const sourceManifest=await load('stroke-manifest.json');
assert.ok(sourceManifest.length>=148);
for(const source of sourceManifest){
 const original=await readFile(new URL(`../app/assets/kanjivg/${source.code}.svg`,import.meta.url));
 assert.equal(createHash('sha256').update(original).digest('hex').toUpperCase(),source.sha256,`Original SVG hash mismatch ${source.code}`);
}
assert.equal(kana.filter(k=>k.group==='basic').length,92);
assert.equal(new Set(kana.map(k=>k.id)).size,kana.length);
assert.equal(kanaLessons.length,18);
assert.equal(kanaPhonology.length,6);
for(const k of kana) {
 assert.ok(k.word && k.wordReading && k.meaning && k.hint);
 for(const code of k.strokeCode?[k.strokeCode]:k.componentStrokeCodes) assert.ok(strokes[code]?.length,`Missing strokes ${code}`);
 for(const text of [k.glyph,k.word]) assert.ok(audio[text],`Missing audio ${text}`);
}
for(const lesson of kanaLessons) for(const item of lesson.items) assert.ok(kana.some(k=>k.id===item));
for(const lesson of kanaPhonology) for(const q of lesson.questions) assert.ok(q.choices.includes(q.answer) && q.explanation);
const lifeTexts=new Set(lifeLessons.flatMap(l=>[...l.words.map(w=>w.jp),...l.dialogue.map(d=>d.jp),l.pattern.sample,l.sample]));
for(const text of lifeTexts) assert.ok(audio[text],`Missing life audio ${text}`);
for(const lesson of kanaLessons)for(const ex of lesson.examples||[])assert.ok(audio[ex.jp],`Missing kana comparison ${ex.jp}`);
for(const item of kanjiItems)assert.ok(strokes[item.strokeCode]?.length,`Missing kanji strokes ${item.glyph}`);
for(const word of words)assert.ok(audio[wordAudioKey(word)],`Missing word reading ${wordAudioKey(word)}`);
for(const unit of allUnits){
 const texts=[...unit.vocabulary.flatMap(w=>[wordAudioKey(w),w.example]),...unit.grammar.flatMap(g=>g.examples.map(ex=>ex.jp)),...unit.dialogue.map(d=>d.jp),unit.reading?.jp,unit.writing.sample,...unit.questions.map(q=>q.transcript)].filter(Boolean);
 for(const text of texts)assert.ok(audio[text],`Missing v2 audio ${unit.id}: ${text}`);
}
for(const form of forms)for(const section of form.sections)for(const q of section.questions)if(q.transcript)assert.ok(audio[q.transcript],`Missing exam audio ${q.id}`);
for(const [text,path] of Object.entries(audio)) assert.ok((await stat(new URL(`../app/${path}`,import.meta.url))).size>512,`Empty audio ${text}`);
console.log(`Materials checked: ${kana.length} cards, ${Object.keys(strokes).length} strokes, ${Object.keys(audio).length} audio, ${lifeTexts.size} life strings.`);
