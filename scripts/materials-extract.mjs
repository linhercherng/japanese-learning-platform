import {readFile,writeFile} from 'node:fs/promises';
const assets=new URL('../app/assets/',import.meta.url);
const manifest=JSON.parse((await readFile(new URL('stroke-manifest.json',assets),'utf8')).replace(/^\uFEFF/,''));
const strokes={};
for(const item of manifest.filter(x=>x.status==='ok')) {
 const xml=await readFile(new URL(`kanjivg/${item.code}.svg`,assets),'utf8');
 const paths=[...xml.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)].map(m=>m[1]);
 if(!paths.length)throw new Error(`No paths for ${item.code}`);
 strokes[item.code]=paths;
}
await writeFile(new URL('strokes.json',assets),JSON.stringify(strokes));
console.log(`Extracted ${Object.keys(strokes).length} stroke diagrams.`);
