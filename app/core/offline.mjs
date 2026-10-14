const marker='__hiyori_pack_info__';
function validPack(pack){if(!pack||!['K','L','N5','N4','N3','N2'].includes(pack.id)||!/^[-a-zA-Z0-9]{3,64}$/.test(pack.fingerprint)||!Array.isArray(pack.files)||!pack.files.length||pack.files.length>20000||new Set(pack.files).size!==pack.files.length||pack.files.some(path=>!/^assets\/audio\/[A-Za-z0-9_-]+\.mp3$/.test(path)))throw new Error('離線包資料不正確');}
const baseName=pack=>`hiyori-pack-${pack.id}-`;
const url=(path,origin)=>new URL(path,origin).href;
async function verifiedAudio(response,expectedHash){
 if(!response||!response.ok||response.status!==200||response.type==='opaque'||!/^audio\/(mpeg|mp3)(;|$)/i.test(response.headers.get('Content-Type')||''))throw new Error('素材格式不正確，離線包未完成');
 const body=await response.clone().arrayBuffer(),bytes=new Uint8Array(body);
 if(bytes.length<512||!((bytes[0]===73&&bytes[1]===68&&bytes[2]===51)||(bytes[0]===255&&(bytes[1]&224)===224)))throw new Error('音檔未完整下載，離線包未完成');
 if(expectedHash){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',body)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==expectedHash)throw new Error('素材校驗失敗，離線包未完成');}
 return bytes.length;
}
export async function packStatus(pack,{storage=globalThis.caches,origin=globalThis.location?.href}={}){
 validPack(pack);
 if(pack.complete===false)return {ready:false,files:0,bytes:0};
 for(const name of await storage.keys()){
  if(!name.startsWith(baseName(pack)))continue;const cache=await storage.open(name),response=await cache.match(url(marker,origin));if(!response)continue;
  let metadata;try{metadata=await response.json();}catch{continue;}
  if(metadata.fingerprint!==pack.fingerprint||metadata.files!==pack.files.length)continue;
  const matches=await Promise.all(pack.files.map(file=>cache.match(url(file,origin))));
  try{await Promise.all(matches.map((response,i)=>verifiedAudio(response,pack.hashes?.[pack.files[i]])));return {ready:true,files:pack.files.length,bytes:metadata.bytes,cacheName:name};}catch{continue;}
 }
 return {ready:false,files:0,bytes:0};
}
export async function downloadPack(pack,{storage=globalThis.caches,fetcher=globalThis.fetch,origin=globalThis.location?.href,signal,onProgress=()=>{}}={}){
 if(pack?.complete===false)throw new Error('這個級別的素材尚未完整生成，不能下載為完成的離線包');
 validPack(pack);const name=`${baseName(pack)}${pack.fingerprint}-${crypto.randomUUID()}`,cache=await storage.open(name);let bytes=0;
 try{
  for(let i=0;i<pack.files.length;i++){
   if(signal?.aborted)throw new Error('已取消下載');const response=await fetcher(url(pack.files[i],origin),{signal,cache:'no-cache'});
   bytes+=await verifiedAudio(response,pack.hashes?.[pack.files[i]]);await cache.put(url(pack.files[i],origin),response);onProgress({completed:i+1,total:pack.files.length,bytes});
  }
  if(signal?.aborted)throw new Error('已取消下載');
  await cache.put(url(marker,origin),new Response(JSON.stringify({fingerprint:pack.fingerprint,files:pack.files.length,bytes}),{headers:{'Content-Type':'application/json'}}));
  for(const old of await storage.keys())if(old!==name&&old.startsWith(baseName(pack)))await storage.delete(old);
  return {ready:true,files:pack.files.length,bytes,cacheName:name};
 }catch(error){await storage.delete(name);throw error;}
}
