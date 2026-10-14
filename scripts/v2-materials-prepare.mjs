import {readFile,writeFile} from 'node:fs/promises';
import {allUnits,units,words,kanjiItems,forms,lifeLessons,v3Questions,deepLessons} from '../app/content/catalog.mjs';
import {concepts} from '../app/content/concepts.mjs';
import {wordAudioKey} from '../app/ui/shared.mjs';
import {kanaLessons} from '../app/content/kana.mjs';
const assets=new URL('../app/assets/',import.meta.url);
const records=new Map();
const add=(text,speech=text)=>{if(text&&speech)records.set(text,{text,speech});};
const old=JSON.parse((await readFile(new URL('audio-texts.json',assets),'utf8')).replace(/^\uFEFF/,''));old.forEach(text=>add(text));
for(const lesson of kanaLessons)for(const ex of lesson.examples||[])add(ex.jp,ex.jp.replaceAll('／','、'));
for(const lesson of lifeLessons){add(lesson.pattern.sample);add(lesson.sample);}
for(const word of words){add(word.jp);add(wordAudioKey(word),word.reading);add(word.example);}
for(const unit of allUnits){
 for(const w of unit.vocabulary){add(w.jp);add(wordAudioKey(w),w.reading);add(w.example);}
 for(const g of unit.grammar)for(const ex of g.examples)add(ex.jp);
 for(const d of unit.dialogue)add(d.jp);
 add(unit.reading?.jp);add(unit.writing.sample);
 for(const q of [...unit.questions,...(unit.reading?.questions||[])])if(q.transcript)add(q.transcript);
}
for(const k of kanjiItems)for(const word of k.words){add(word.jp);add(wordAudioKey(word),word.reading);}
for(const form of forms)for(const section of form.sections)for(const q of section.questions)if(q.transcript)add(q.transcript);
for(const c of concepts)for(const text of c.example.jp.split('／'))add(text);
for(const q of v3Questions)if(q.transcript)add(q.transcript);
for(const unit of deepLessons)for(const item of unit.listening)add(item.jp);
await writeFile(new URL('audio-records-v2.json',assets),JSON.stringify([...records.values()],null,2));
const oldCodes=JSON.parse(await readFile(new URL('stroke-codes.json',assets),'utf8'));
await writeFile(new URL('stroke-codes.json',assets),JSON.stringify([...new Set([...oldCodes,...kanjiItems.map(k=>k.strokeCode)])].sort(),null,2));
console.log(`Prepared ${records.size} real speech records, ${kanjiItems.length} kanji diagrams, ${units.length} level units.`);
