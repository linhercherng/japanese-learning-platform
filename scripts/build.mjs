import {cp,mkdir,rm,readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {writeManifests} from './offline-index.mjs';
const source=fileURLToPath(new URL('../app/',import.meta.url));
const destination=fileURLToPath(new URL('../dist/',import.meta.url));
async function normalizeText(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory()){if(entry.name!=='kanjivg'&&entry.name!=='audio')await normalizeText(file);}else if(/\.(mjs|js|css|html|json|webmanifest)$/.test(entry.name)){const original=await readFile(file,'utf8'),normalized=original.replaceAll('\r\n','\n');if(original!==normalized)await writeFile(file,normalized);}}}
await normalizeText(source);await writeManifests();
const root=fileURLToPath(new URL('../',import.meta.url));
if(path.resolve(destination)!==path.join(path.resolve(root),'dist'))throw new Error('建置目標超出專案');
await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});await cp(source,destination,{recursive:true});console.log('靜態版已輸出至 dist/；需以 HTTP 伺服器開啟。');
