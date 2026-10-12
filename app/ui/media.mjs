/** Local packaged audio only; learner data is never sent to a speech service. */
export function createMedia(index,onStatus){
 let audio=null,recorder=null,stream=null,url=null,sequence=0;
 async function play(text,rate=1){
  if(!index[text]){onStatus('此項音檔尚未提供，請先閱讀文字。');return false;}
  audio?.pause();audio=new Audio(index[text]);audio.playbackRate=rate;
  audio.addEventListener('error',()=>onStatus('音檔未能播放，請重新整理或重試。'),{once:true});
  try{await audio.play();onStatus('正在播放日語合成語音');return true;}catch{onStatus('播放未成功，請再按一次播放。');return false;}
 }
 async function toggleRecord(container,button){
  if(recorder?.state==='recording'){recorder.stop();stream?.getTracks().forEach(t=>t.stop());button.textContent='錄下自己的跟讀';return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){onStatus('此瀏覽器不支援錄音，仍可繼續聽音與跟讀。');return;}
  const token=++sequence;
  try{
   const next=await navigator.mediaDevices.getUserMedia({audio:true});if(sequence!==token){next.getTracks().forEach(t=>t.stop());return;}
   stream=next;const thisRecorder=new MediaRecorder(next);recorder=thisRecorder;const chunks=[];
   thisRecorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
   thisRecorder.onstop=()=>{next.getTracks().forEach(t=>t.stop());if(sequence!==token)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob(chunks,{type:thisRecorder.mimeType}));const playback=document.createElement('audio');playback.controls=true;playback.src=url;container.replaceChildren(playback);button.textContent='重新錄一次';};
   thisRecorder.start();button.textContent='停止錄音';onStatus('錄音中，僅在裝置內處理；最多 30 秒。');
   setTimeout(()=>{if(sequence===token&&thisRecorder.state==='recording')thisRecorder.stop();},30000);
  }catch{stream?.getTracks().forEach(t=>t.stop());onStatus('未取得麥克風權限。可以不錄音，繼續聽音與跟讀。');}
 }
 function stop(){sequence++;audio?.pause();if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());if(url){URL.revokeObjectURL(url);url=null;}}
 return {play,toggleRecord,stop};
}
