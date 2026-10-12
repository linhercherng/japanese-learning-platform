import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../app/',import.meta.url));
const destination=fileURLToPath(new URL('../dist/',import.meta.url));
await mkdir(destination,{recursive:true});await cp(source,destination,{recursive:true});console.log('靜態版已輸出至 dist/；需以 HTTP 伺服器開啟。');
