/* Local app shell and explicitly downloaded audio packs. No user-data or third-party cache. */
const BUILD_ID = '95721e7b3c960f87ada0fcaba79ba9e485592ccb052525f33d047288720241e3';
const SHELL_PREFIX='hiyori-shell-',SHELL_NAME=SHELL_PREFIX+BUILD_ID;
const BASE=new URL(self.registration.scope),MANIFEST=new URL('assets/shell-manifest.json',BASE).href;
const PACK_MARKER=new URL('__hiyori_pack_info__',BASE).href;
const local=path=>new URL(path,BASE).href;
const sha=async body=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',body)),byte=>byte.toString(16).padStart(2,'0')).join('');
const failure=(message,status=503)=>new Response(message,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
function validPath(path){return typeof path==='string'&&/^[A-Za-z0-9_./-]+$/.test(path)&&!path.startsWith('/')&&!path.split('/').includes('..')&&!path.split('/').includes('.');}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 let opened=false;
 try{
  const response=await fetch(MANIFEST,{cache:'no-store'});if(!response.ok||response.status!==200)throw new Error('應用索引未能下載');
  const manifest=await response.clone().json();
  if(manifest.fingerprint!==BUILD_ID||!Array.isArray(manifest.files)||!manifest.files.includes('index.html')||new Set(manifest.files).size!==manifest.files.length||manifest.files.some(path=>!validPath(path)||!/^([a-f0-9]{64})$/.test(manifest.hashes?.[path]||'')))throw new Error('應用版本或索引不正確');
  const cache=await caches.open(SHELL_NAME);opened=true;
  for(const path of manifest.files){const item=await fetch(local(path),{cache:'no-store'});if(!item.ok||item.status!==200||item.type==='opaque')throw new Error('應用資源未能完整下載');if(await sha(await item.clone().arrayBuffer())!==manifest.hashes[path])throw new Error('應用資源校驗失敗');await cache.put(local(path),item);}
  await cache.put(MANIFEST,response);
 }catch(error){if(opened)await caches.delete(SHELL_NAME);throw error;}
})()));
// The normal waiting lifecycle keeps existing tabs on their own coherent version.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(SHELL_PREFIX)&&name!==SHELL_NAME)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
async function rangeResponse(response,range){
 const body=await response.arrayBuffer(),length=body.byteLength,headers=new Headers(response.headers);headers.set('Accept-Ranges','bytes');headers.delete('Content-Encoding');
 const match=range.match(/^bytes=(\d*)-(\d*)$/);
 let start,end;
 if(match&&(match[1]||match[2])){if(!match[1]){const suffix=Number(match[2]);if(Number.isSafeInteger(suffix)&&suffix>0){start=Math.max(0,length-suffix);end=length-1;}}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),length-1):length-1;}}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=length||end<start){headers.set('Content-Range',`bytes */${length}`);headers.set('Content-Length','0');return new Response(null,{status:416,headers});}
 const part=body.slice(start,end+1);headers.set('Content-Range',`bytes ${start}-${end}/${length}`);headers.set('Content-Length',String(part.byteLength));return new Response(part,{status:206,statusText:'Partial Content',headers});
}
async function cachedAudio(request){
 for(const name of(await caches.keys()).reverse()){
  if(!/^hiyori-pack-(?:K|L|N[2345])-/.test(name))continue;
  const cache=await caches.open(name);if(!await cache.match(PACK_MARKER))continue;
  const response=await cache.match(request.url);if(!response||response.status!==200||!/^audio\/(?:mpeg|mp3)(?:;|$)/i.test(response.headers.get('Content-Type')||''))continue;
  return request.headers.get('Range')?rangeResponse(response,request.headers.get('Range')):response;
 }
 return null;
}
async function audioRequest(request){
 // Explicit download verification must fetch fresh bytes, not an older completed pack.
 if(!['no-cache','reload','no-store'].includes(request.cache)){const cached=await cachedAudio(request);if(cached)return cached;}
 try{const response=await fetch(request);if(response.ok&&!/^audio\/(?:mpeg|mp3)(?:;|$)/i.test(response.headers.get('Content-Type')||''))return failure('音訊格式不正確',502);return response;}catch{return failure('此音檔尚未下載，連線後可播放');}
}
async function navigation(request){
 const cache=await caches.open(SHELL_NAME),cached=await cache.match(local('index.html'));
 // A controlled tab always receives the matching cached shell to avoid mixing new HTML and old modules.
 if(cached)return cached;
 try{return await fetch(request);}catch{return failure('應用尚未完整離線下載，請連線後重試');}
}
async function assetRequest(request){const cache=await caches.open(SHELL_NAME),url=new URL(request.url);url.search='';const cached=await cache.match(url.href);if(cached)return cached;try{return await fetch(request);}catch{return failure('離線資源尚未準備完成');}}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(/^assets\/audio\/[A-Za-z0-9_-]+\.mp3$/.test(url.pathname.slice(BASE.pathname.length))){event.respondWith(audioRequest(request));return;}
 if(request.mode==='navigate'){event.respondWith(navigation(request));return;}
 event.respondWith(assetRequest(request));
});
