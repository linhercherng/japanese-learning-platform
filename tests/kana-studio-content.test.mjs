import test from 'node:test';import assert from 'node:assert/strict';
import {kana} from '../app/content/kana.mjs';import {words,resolveLearningQuestion} from '../app/content/catalog.mjs';
import {wordExamples,resolveKanaWordQuestion,studioWords,validWordReference} from '../app/content/kana-words.mjs';
import {mnemonicMotif} from '../app/content/kana-visuals.mjs';
test('all 208 cards have original visual motifs and common cards offer distinct existing or curated word forms',()=>{
 for(const k of kana){const m=mnemonicMotif(k.id);assert(m.paths.length);assert(m.label.length>1);assert(!/[ぁ-ヿ]/.test(m.label));}
 for(const glyph of ['あ','ぬ','ア','ヒ','ミ','ヨ','きゃ']){const k=kana.find(k=>k.glyph===glyph),examples=wordExamples(k.id,words);assert(examples.length>=2,glyph);assert.equal(new Set(examples.map(w=>w.practice)).size,examples.length);}
 assert.equal(wordExamples(kana.find(k=>k.glyph==='ヲ').id,words).length,0);
});
test('word recall masks every target and never reproduces the whole target in prompts or choices',()=>{
 let total=0;for(const k of kana)for(const w of wordExamples(k.id,words)){
  const q=resolveKanaWordQuestion(`kw:${k.id}:${w.id}`,words);assert(q,k.id);assert.equal(q.reviewItem,k.id);assert.equal(q.kind,'cloze');assert(!q.prompt.includes(k.glyph),`${k.glyph} ${q.prompt}`);assert(q.prompt.includes('＿＿'));assert.deepEqual(q.accepted,[k.glyph]);assert.equal(q.audio,w.audio);assert(q.explanation.includes(w.jp));assert(resolveLearningQuestion(q.id));total++;
 }assert(total>400);
});
test('word source validation rejects unrelated words and makes no artificial everyday katakana for rare glyphs',()=>{
 const k=kana.find(k=>k.glyph==='ぬ'),list=wordExamples(k.id,words),ids=list.map(w=>`kw:${k.id}:${w.id}`);assert(validWordReference(k.id,ids,words));assert(!validWordReference('h-3042',ids,words));assert.equal(resolveKanaWordQuestion('kw:h-306c:unknown',words),null);assert.equal(new Set(studioWords.map(w=>w.id)).size,studioWords.length);
});

test('rare katakana pages never present artificial transcription as natural vocabulary',()=>{
 for(const glyph of ['ヂ','ヅ','ビャ','ビュ','ピュ','ニョ','ギャ','ジュ']){const k=kana.find(k=>k.glyph===glyph);for(const w of wordExamples(k.id,words))assert(!['ハナヂ','ツヅク','ビャクヤ','ビュウビュウ','ピュウ','ニョロニョロ','ギャク','ジュウ'].includes(w.jp),w.jp);}
});
