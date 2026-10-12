import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {normalizeText} from '../scripts/text-assets.mjs';
test('Git交付與Windows換行相容：應用SVG統一LF，原KanjiVG與二進位不改',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hiyori-text-'));
 try{
  await mkdir(path.join(root,'kanjivg'));await writeFile(path.join(root,'main.mjs'),'export const ready=true;\r\n');await writeFile(path.join(root,'favicon.svg'),'<svg/>\r\n');await writeFile(path.join(root,'kanjivg','licensed.svg'),'<svg>original</svg>\r\n');const binary=Buffer.from([0,13,10,255]);await writeFile(path.join(root,'icon.png'),binary);
  await normalizeText(root);assert.equal(await readFile(path.join(root,'favicon.svg'),'utf8'),'<svg/>\n');assert.equal(await readFile(path.join(root,'main.mjs'),'utf8'),'export const ready=true;\n');assert.equal(await readFile(path.join(root,'kanjivg','licensed.svg'),'utf8'),'<svg>original</svg>\r\n');assert.deepEqual(await readFile(path.join(root,'icon.png')),binary);
 }finally{if(!path.resolve(root).startsWith(path.resolve(tmpdir())+path.sep)||!path.basename(root).startsWith('hiyori-text-'))throw new Error('Unexpected test cleanup path');await rm(root,{recursive:true,force:true});}
});
