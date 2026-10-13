import{readFile,writeFile,readdir}from'node:fs/promises';
import{resolve,join,relative}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import{wordAudioKey}from'../app/ui/shared.mjs';
const ids=['K','L','N5','N4','N3'];
const titles={K:'假名與聲音',L:'生活起步',N5:'N5 基礎完整教材',N4:'N4 進階完整教材',N3:'N3 中級完整教材'};
const hash=body=>createHash('sha256').update(body).digest('hex');
const serialize=value=>JSON.stringify(value,null,2)+'\n';
/** Build against a frozen local audio index; safe to rerun after more audio is generated. */
export async function buildManifests({appDir,audioIndex,kana=[],kanaLessons=[],kanaPhonology=[],allUnits=[],words=[],kanjiItems=[],forms=[],v3Questions=[],deepLessons=[]}){
 const texts=new Map(ids.map(id=>[id,new Set()])),optional=new Map(ids.map(id=>[id,new Set()]));
 function add(level,text,required=true){if(text&&texts.has(level))(required?texts:optional).get(level).add(text);}
 function word(level,w){add(level,w.jp);add(level,wordAudioKey(w));add(level,w.example);}
 for(const item of kana){add('K',item.glyph);add('K',item.word);add('K',item.wordReading,false);}
 for(const lesson of kanaLessons)for(const ex of lesson.examples||[]){add('K',ex.jp);for(const part of ex.jp.split('／'))add('K',part,false);}
 for(const section of kanaPhonology)for(const q of section.questions||[]){add('K',q.transcript);for(const choice of q.choices||[])add('K',choice,false);}
 for(const u of allUnits){
  for(const w of u.vocabulary||[])word(u.level,w);
  for(const g of u.grammar||[])for(const ex of g.examples||[])add(u.level,ex.jp);
  for(const d of u.dialogue||[])add(u.level,d.jp);
  add(u.level,u.reading?.jp);add(u.level,u.writing?.sample);
  for(const q of [...(u.questions||[]),...(u.reading?.questions||[])])add(u.level,q.transcript);
 }
 for(const w of words)for(const level of w.levels||[w.level])word(level,w);
 for(const k of kanjiItems)for(const level of k.levels||[])for(const w of k.words||[])word(level,w);
 for(const form of forms)for(const section of form.sections||[])for(const q of section.questions||[])add(form.level,q.transcript);
 for(const q of v3Questions)add(q.level,q.transcript);
 for(const u of deepLessons)for(const x of u.listening)add(u.level,x.jp);
 const fileInfo=new Map(),used=new Set();
 for(const path of [...new Set(Object.values(audioIndex))]){
  if(!/^assets\/audio\/[A-Za-z0-9_-]+\.mp3$/.test(path))throw new Error(`音訊路徑不正確：${path}`);
  try{const body=await readFile(join(appDir,path));if(body.length<512||!((body[0]===73&&body[1]===68&&body[2]===51)||(body[0]===255&&(body[1]&224)===224)))throw new Error(`音檔未完成：${path}`);fileInfo.set(path,{bytes:body.length,hash:hash(body)});}catch(error){if(error.code!=='ENOENT')throw error;}
 }
 const packs=ids.map(id=>{
  const required=[...texts.get(id)].sort(),all=[...new Set([...required,...optional.get(id)])].sort(),missingAudio=required.filter(text=>!audioIndex[text]||!fileInfo.has(audioIndex[text]));
  const files=[...new Set(all.map(text=>audioIndex[text]).filter(path=>fileInfo.has(path)))].sort();files.forEach(path=>used.add(path));
  const hashes=Object.fromEntries(files.map(path=>[path,fileInfo.get(path).hash])),bytes=files.reduce((n,path)=>n+fileInfo.get(path).bytes,0);
  const fingerprint=hash(JSON.stringify({id,hashes,required,missingAudio}));
  return{id,title:titles[id],files,bytes,hashes,fingerprint,complete:missingAudio.length===0&&files.length>0,missingAudioCount:missingAudio.length,missingAudio};
 });
 const offline={schema:1,packs,unassignedFiles:[...fileInfo.keys()].filter(path=>!used.has(path)).sort()};
 const shellBodies=new Map([['assets/offline-manifest.json',Buffer.from(serialize(offline))]]);
 async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const full=join(dir,entry.name),path=relative(appDir,full).replaceAll('\\','/');if(entry.isDirectory()){if(!['assets/audio','assets/strokes','assets/kanjivg'].includes(path))await walk(full);}else if(entry.isFile()&&!['service-worker.js','assets/offline-manifest.json','assets/shell-manifest.json'].includes(path)&&/\.(?:mjs|js|css|html|json|webmanifest|png|jpe?g|webp|svg)$/i.test(path))shellBodies.set(path,await readFile(full));}}
 await walk(appDir);
 const files=[...shellBodies.keys()].sort(),hashes=Object.fromEntries(files.map(path=>[path,hash(shellBodies.get(path))]));
 // Worker and its own manifest bootstrap are intentionally excluded from precache files.
 // Normalize the stamped build ID so the worker implementation participates without a self-hash cycle.
 const worker=await readFile(join(appDir,'service-worker.js'),'utf8');
 const workerHash=hash(worker.replace(/const BUILD_ID = '[a-f0-9]+';/,"const BUILD_ID = 'BUILD';"));
 const fingerprint=hash(JSON.stringify({hashes,workerHash}));
 const shell={schema:1,fingerprint,files,hashes,bytes:[...shellBodies.values()].reduce((n,body)=>n+body.length,0)};
 return{offline,shell};
}
export async function writeManifests(){
 const appDir=fileURLToPath(new URL('../app/',import.meta.url));
 const[{kana,kanaLessons,kanaPhonology},catalog]=await Promise.all([import('../app/content/kana.mjs'),import('../app/content/catalog.mjs')]);
 const audioIndex=JSON.parse((await readFile(join(appDir,'assets/audio.json'),'utf8')).replace(/^\uFEFF/,''));
 const{offline,shell}=await buildManifests({appDir,audioIndex,kana,kanaLessons,kanaPhonology,...catalog});
 await writeFile(join(appDir,'assets/offline-manifest.json'),serialize(offline));
 await writeFile(join(appDir,'assets/shell-manifest.json'),serialize(shell));
 const workerPath=join(appDir,'service-worker.js'),source=await readFile(workerPath,'utf8');
 await writeFile(workerPath,source.replace(/const BUILD_ID = '[a-f0-9]+';/,`const BUILD_ID = '${shell.fingerprint}';`));
 console.log(JSON.stringify({shell:{files:shell.files.length,bytes:shell.bytes,fingerprint:shell.fingerprint},packs:offline.packs.map(({id,files,bytes,missingAudioCount,complete})=>({id,files:files.length,bytes,missingAudioCount,complete})),unassignedFiles:offline.unassignedFiles.length},null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await writeManifests();
