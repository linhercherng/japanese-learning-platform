import {initialState,validateState} from './learning.mjs';
// Resolve writes on transaction completion, not request success.
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
export async function openStore(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('hiyori-learning-v1',1);
  request.onupgradeneeded=()=>{request.result.createObjectStore('state');};
  request.onerror=()=>reject(new Error('瀏覽器無法開啟本機儲存'));
  request.onblocked=()=>reject(new Error('請關閉其他舊版本分頁後再試'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
 });
}
export async function readState(db){return new Promise((resolve,reject)=>{const t=db.transaction('state','readonly');const r=t.objectStore('state').get('learning');r.onsuccess=()=>{try{resolve(r.result?validateState(r.result):initialState());}catch{reject(new Error('既有資料格式不正確，請先匯出或恢復備份'));}};r.onerror=()=>reject(r.error);});}
export async function writeState(db,state,expectedRevision){
 validateState(state);
 return new Promise((resolve,reject)=>{
  const t=db.transaction('state','readwrite');const store=t.objectStore('state');let conflict=false;
  const read=store.get('learning');read.onsuccess=()=>{
   const previous=read.result;
   if(expectedRevision!==undefined&&previous&&previous.revision!==expectedRevision){conflict=true;t.abort();return;}
   store.put(state,'learning');
  };
  t.oncomplete=()=>resolve();
  t.onabort=()=>reject(new Error(conflict?'另一個分頁已更新進度。請重新整理後再操作。':'保存失敗，請匯出備份後再試'));
  t.onerror=()=>reject(new Error('儲存空間不足或瀏覽器拒絕保存。請先匯出備份。'));
 });
}
