import {escapeHtml as e} from './shared.mjs';
import {downloadPack,packStatus} from '../core/offline.mjs';
export function createOffline({render,toast}){
 let manifest=null,workerReady=false,installEvent=null,active=null,controller=null,disposed=false;
 const statuses=new Map(),labels={K:'假名與聲音',L:'生活起步',N5:'N5 入門與生活',N4:'N4 基礎與生活',N3:'N3 中級與生活',N2:'N2 中高級與生活'};
 const refresh=()=>{if(location.hash==='#profile'&&!disposed)render(false);};
 const installed=event=>{event.preventDefault();installEvent=event;refresh();};
 addEventListener('beforeinstallprompt',installed);
 const loaded=(async()=>{
  if(!('serviceWorker' in navigator)||!globalThis.caches)return;
  const query=new URL(location.href).searchParams;if(query.get('qa')==='1'&&query.get('offlineQa')!=='1')return;
  try{const response=await fetch('assets/offline-manifest.json',{cache:'no-cache'});if(!response.ok)throw new Error();manifest=await response.json();
   await navigator.serviceWorker.register('service-worker.js',{scope:'./'});await navigator.serviceWorker.ready;workerReady=true;
   await Promise.all(manifest.packs.map(async pack=>statuses.set(pack.id,await packStatus(pack))));refresh();
  }catch{workerReady=false;refresh();}
 })();
 function view(){return `<section class="self-check"><h2>離線學習與安裝</h2><p>${workerReady?'課程文字與筆順已準備離線使用。':'正在準備離線課程；需要首次連線完成安裝。'}音檔依級別下載，全部通過校驗才標示完成。</p>${manifest?manifest.packs.map(pack=>{const status=statuses.get(pack.id),progress=active?.id===pack.id?active:null;return `<div class="offline-pack"><div><strong>${e(labels[pack.id])}</strong><p>${pack.files.length} 音檔 · ${(pack.bytes/1048576).toFixed(1)} MiB</p><small role="status">${progress?`下載 ${progress.completed} / ${pack.files.length}`:pack.complete===false?`素材生成中，尚缺 ${pack.missingAudioCount} 個音檔`:status?.ready?'已完成，音檔可離線播放':'尚未下載完整音檔'}</small></div><button class="secondary" data-offline="${e(pack.id)}" ${active||!workerReady||pack.complete===false?'disabled':''}>${status?.ready?'重新校驗下載':'下載音檔'}</button></div>`;}).join(''):'<p>離線素材清單尚未載入，連線後重新整理即可再試。</p>'}${active?'<button class="text-button" data-offline-cancel>取消這次下載</button>':''}${installEvent?'<button class="primary" data-offline-install>安裝到手機或桌面</button>':'<p>可從瀏覽器選單「安裝應用程式」；iPhone 可用 Safari 分享選單加入主畫面。</p>'}<p>離線包只保存教材，學習備份仍請另行匯出。</p></section>`;}
 async function click(event){const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-offline-cancel')){controller?.abort();return;}
  if(button.hasAttribute('data-offline-install')&&installEvent){await installEvent.prompt();installEvent=null;refresh();return;}
  const pack=manifest?.packs.find(p=>p.id===button.dataset.offline);if(!pack||active||pack.complete===false)return;
  controller=new AbortController();active={id:pack.id,completed:0};refresh();
  try{const result=await downloadPack(pack,{signal:controller.signal,onProgress:p=>{active={id:pack.id,...p};const label=document.querySelector(`[data-offline="${pack.id}"]`)?.parentElement.querySelector('[role="status"]');if(label)label.textContent=`下載 ${p.completed} / ${p.total}`;}});statuses.set(pack.id,result);toast('全部音檔已校驗，離線包準備完成。');}
  catch(error){toast(controller.signal.aborted?'下載已取消；既有離線包仍保留。':error.message);}
  finally{active=null;controller=null;refresh();}
 }
 document.addEventListener('click',click);
 return {view,loaded,dispose(){disposed=true;controller?.abort();removeEventListener('beforeinstallprompt',installed);document.removeEventListener('click',click);}};
}
