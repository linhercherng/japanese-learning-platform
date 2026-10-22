import {flipCards,duelQuestions} from '../content/kana-sixth.mjs';
import {beginV3Session} from './v3-learning.mjs';
export function newFlip(item){return {key:item,queue:flipCards(item).map(k=>k.id),cursor:0,revealed:false,repeated:[],needs:[]};}
export function advanceFlip(round,{item,index,again=false}){
 if(!round.revealed||round.cursor!==index||round.queue[index]!==item)return round;
 const next=structuredClone(round);
 if(again){if(!next.needs.includes(item))next.needs.push(item);if(!next.repeated.includes(item)&&next.queue.length-index-1>=2){next.queue.push(item);next.repeated.push(item);}}
 next.cursor++;next.revealed=false;return next;
}
export function startDuel(state,{pair,id,time}){
 const ids=duelQuestions.filter(q=>q.pairId===pair).map(q=>q.id);if(!ids.length)return state;
 return beginV3Session(state,ids,{id,source:'kana-duel',reference:pair,time});
}
