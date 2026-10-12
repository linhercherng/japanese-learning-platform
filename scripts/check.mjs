import {readdir,stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {kana,kanaLessons,kanaPhonology} from '../app/content/kana.mjs';
import {lifeLessons} from '../app/content/life.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const requireValue=(condition,message)=>{if(!condition)throw new Error(message);};
async function syntax(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await syntax(file);else if(/\.m?js$/.test(file)){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});requireValue(result.status===0,result.stderr);}}}
await syntax(path.join(root,'app'));await syntax(path.join(root,'scripts'));
const ids=new Set(kana.map(k=>k.id));requireValue(ids.size===kana.length,'字卡 ID 重複');requireValue(kana.filter(k=>k.group==='basic').length===92,'基本假名應為92字');
const strokeData=JSON.parse(await readFile(path.join(root,'app/assets/strokes.json'),'utf8'));
const audio=JSON.parse(await readFile(path.join(root,'app/assets/audio.json'),'utf8'));
for(const item of kana){for(const code of item.componentStrokeCodes||[item.strokeCode])requireValue(strokeData[code]?.length,`缺筆順：${item.id}`);requireValue(audio[item.glyph]&&audio[item.word],`缺讀音：${item.id}`);}
requireValue(kanaLessons.length===18,'應有18課');for(const lesson of kanaLessons)for(const id of lesson.items)requireValue(ids.has(id),`未知字卡 ${id}`);
for(const p of kanaPhonology)for(const q of p.questions)requireValue(q.choices.includes(q.answer),`音韻答案不在選項 ${q.id}`);
requireValue(lifeLessons.length===6,'應有六生活課');for(const lesson of lifeLessons){for(const q of lesson.quiz)requireValue(q.correct>=0&&q.correct<q.options.length,'生活題答案錯誤');for(const text of [...lesson.words.map(w=>w.jp),...lesson.dialogue.map(d=>d.jp),lesson.pattern.sample,lesson.sample])requireValue(audio[text],`缺生活音檔 ${text}`);}
for(const asset of Object.values(audio)){requireValue(/^assets\/audio\/[A-Za-z0-9._-]+\.mp3$/.test(asset),'不安全音檔路徑');requireValue((await stat(path.join(root,'app',asset))).size>1000,`無效音檔 ${asset}`);}
console.log(`語法與內容檢查通過：${kana.length} 字卡、${kanaLessons.length} 假名課、${lifeLessons.length} 生活課、${Object.keys(audio).length} 音檔。`);
