import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
/** Match Git's LF checkout while preserving original licensed SVG and binary bytes. */
export async function normalizeText(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){if(entry.name!=='kanjivg'&&entry.name!=='audio')await normalizeText(file);}
  else if(/\.(mjs|js|css|html|json|webmanifest|svg)$/.test(entry.name)){
   const original=await readFile(file,'utf8'),normalized=original.replaceAll('\r\n','\n');
   if(original!==normalized)await writeFile(file,normalized);
  }
 }
}
