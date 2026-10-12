import test from 'node:test';
import assert from 'node:assert/strict';
import {createMedia} from '../app/ui/media.mjs';
test('舊錄音停止回呼不關閉新一輪錄音資源',async()=>{
 const names=['navigator','MediaRecorder','window','document','setTimeout'];const original=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const callbacks=[],streams=[];let stopped=0;
 class Recorder{constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';}start(){this.state='recording';}stop(){this.state='inactive';callbacks.push(()=>this.onstop?.());}}
 const globals={navigator:{mediaDevices:{getUserMedia:async()=>{const track={stop(){track.stopped=true;stopped++;},stopped:false};const stream={getTracks:()=>[track]};streams.push(stream);return stream;}}},MediaRecorder:Recorder,window:{MediaRecorder:Recorder},document:{createElement:()=>({})},setTimeout:()=>0};
 for(const [name,value] of Object.entries(globals))Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
 try{const media=createMedia({},()=>{}),container={replaceChildren(){}},button={textContent:''};await media.toggleRecord(container,button);await media.toggleRecord(container,button);await media.toggleRecord(container,button);callbacks[0]();assert.equal(streams[1].getTracks()[0].stopped,false);media.stop();}
 finally{for(const [name,descriptor] of original){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
});
