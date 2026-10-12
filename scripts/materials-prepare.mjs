import {kana,kanaLessons} from '../app/content/kana.mjs';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
const assets = new URL('../app/assets/',import.meta.url);
await mkdir(assets,{recursive:true});
const codes=[...new Set(kana.flatMap(k=>k.strokeCode?[k.strokeCode]:k.componentStrokeCodes))];
await writeFile(new URL('stroke-codes.json',assets),JSON.stringify(codes,null,2));
const texts=new Set(kana.flatMap(k=>[k.glyph,k.word]));
for(const lesson of kanaLessons) for(const ex of lesson.examples) for(const text of ex.jp.split('／')) texts.add(text);
// Explicit sound contrasts and natural phrases; only self-authored instructional text.
for(const text of ['かき','かぎ','きや','きて','きって','おばさん','おばあさん','カップ','です']) texts.add(text);
try {
 const {lifeLessons}=await import('../app/content/life.mjs');
 for(const l of lifeLessons) {
  for(const w of l.words||[]) texts.add(w.jp);
  for(const d of l.dialogue||[]) texts.add(d.jp);
  for(const p of l.patterns||[]) if(p.sample) texts.add(p.sample);
  if(l.pattern?.sample) texts.add(l.pattern.sample);
  if(l.sample) texts.add(l.sample);
 }
} catch(error) {if(error.code!=='ERR_MODULE_NOT_FOUND') throw error;}
await writeFile(new URL('audio-texts.json',assets),JSON.stringify([...texts].filter(Boolean),null,2));
console.log(`Prepared ${codes.length} stroke codes and ${texts.size} audio texts.`);
