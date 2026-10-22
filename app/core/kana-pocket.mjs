import {kana} from '../content/kana.mjs';
import {mergePocket} from './kana-pocket-state.mjs';
import {validateState} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
export function setPocket(state,item,active,time){
 const records=mergePocket(state.v3.kanaPocket,{[item]:{active,time}});
 if(JSON.stringify(records)===JSON.stringify(state.v3.kanaPocket))return state;
 const next=structuredClone(state);next.v3.kanaPocket=records;next.revision++;return validateState(next);
}
export function pocketItems(state){return kana.filter(k=>state.v3.kanaPocket?.[k.id]?.active).sort((a,b)=>state.v3.kanaPocket[a.id].time.localeCompare(state.v3.kanaPocket[b.id].time));}
export function newPocketRound(state,key){return {key,queue:pocketItems(state).slice(0,3).map(k=>k.id),cursor:0,revealed:false};}
export function advancePocket(round,{item,index}){
 if(!round.revealed||round.cursor!==index||round.queue[index]!==item)return round;
 return {...round,cursor:round.cursor+1,revealed:false};
}
export function pendingPocketListen(state){return state.v3.sessions.find(s=>s.source==='kana-pocket-listen'&&!s.completedAt);}
export function pocketListeningIds(state,time){
 const items=pocketItems(state).filter(k=>Date.parse(state.v3.kanaPocket[k.id].time)<=Date.parse(time)).slice(0,3);
 return [...items.slice(1),...items.slice(0,1)].map(k=>'kc:check:'+k.id+':listen');
}
export function startPocketListen(state,{id,time}){
 if(pendingPocketListen(state))return state;
 const ids=pocketListeningIds(state,time);return ids.length?beginV3Session(state,ids,{id,time,source:'kana-pocket-listen',reference:ids.map(qid=>qid.split(':')[2]).join(':')}):state;
}
