import {kana} from '../content/kana.mjs';
import {mergePocket} from './kana-pocket-state.mjs';
import {validateState} from './learning.mjs';
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
