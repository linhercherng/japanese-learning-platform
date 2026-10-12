import test from 'node:test';import assert from 'node:assert/strict';
import {downloadPack,packStatus} from '../app/core/offline.mjs';
function fakeStorage(){const caches=new Map();return {caches,async keys(){return [...caches.keys()];},async delete(name){return caches.delete(name);},async open(name){if(!caches.has(name))caches.set(name,new Map());const values=caches.get(name);return {async put(key,response){values.set(String(key),response.clone());},async match(key){return values.get(String(key))?.clone();},async keys(){return [...values.keys()].map(url=>({url}));}};}};}
const pack={id:'N5',fingerprint:'abc123',files:['assets/audio/a.mp3','assets/audio/b.mp3'],bytes:8};
const audioResponse=(status=200)=>new Response(Uint8Array.from([73,68,51,...new Array(1021).fill(0)]),{status,headers:{'Content-Type':'audio/mpeg'}});
test('離線包只有全部成功才標示完成，重新讀取能驗證實際檔案',async()=>{
 const storage=fakeStorage();await downloadPack(pack,{storage,fetcher:async()=>audioResponse(),origin:'http://localhost:18090/'});const status=await packStatus(pack,{storage,origin:'http://localhost:18090/'});assert.equal(status.ready,true);assert.equal(status.files,2);
 const values=[...storage.caches.values()][0];values.delete('http://localhost:18090/assets/audio/b.mp3');assert.equal((await packStatus(pack,{storage,origin:'http://localhost:18090/'})).ready,false);
});
test('失敗與取消清理本次下載，不動既有其他快取',async()=>{
 const storage=fakeStorage();await storage.open('unrelated');let calls=0;
 await assert.rejects(downloadPack(pack,{storage,origin:'http://localhost:18090/',fetcher:async()=>audioResponse(++calls===2?500:200)}));assert.deepEqual(await storage.keys(),['unrelated']);
 const controller=new AbortController();await assert.rejects(downloadPack(pack,{storage,origin:'http://localhost:18090/',signal:controller.signal,fetcher:async()=>audioResponse(),onProgress:()=>controller.abort()}));assert.deepEqual(await storage.keys(),['unrelated']);
});
test('200回應若其實是HTML或假音檔，不得標示離線完成',async()=>{
 const storage=fakeStorage();await assert.rejects(downloadPack(pack,{storage,origin:'http://localhost:18090/',fetcher:async()=>new Response('<html>fallback</html>',{headers:{'Content-Type':'text/html'}})}));
 await assert.rejects(downloadPack(pack,{storage,origin:'http://localhost:18090/',fetcher:async()=>new Response('<html>fallback</html>',{headers:{'Content-Type':'audio/mpeg'}})}));assert.equal((await storage.keys()).length,0);
});
test('不能以離線包下載外部來源或穿越路徑',async()=>{
 const storage=fakeStorage();for(const file of ['https://example.com/a.mp3','../private.json','assets/audio/../../index.html'])await assert.rejects(downloadPack({...pack,files:[file]},{storage,origin:'http://localhost:18090/',fetcher:async()=>new Response('data')}));assert.equal((await storage.keys()).length,0);
});
