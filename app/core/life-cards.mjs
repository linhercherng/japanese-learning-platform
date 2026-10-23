// Guided self-recall is transient; no attempts, scores or completion are written here.
import {memoryPhrases} from './life-memory.mjs';
import {lifeUnitIds} from '../content/life-memory-ids.mjs';
export function createLifeCards(unitId,mode){
 if(!lifeUnitIds.has(unitId)||!['meaning','sound'].includes(mode))return null;
 const lines=memoryPhrases(unitId);if(!lines.length)return null;
 return {unitId,mode,queue:lines.map((_,i)=>i),cursor:0,revealed:false,ratings:lines.map(()=>null)};
}
export function currentLifeCard(round){return round&&round.cursor<round.queue.length?memoryPhrases(round.unitId)[round.queue[round.cursor]]||null:null;}
export function revealLifeCard(round){return currentLifeCard(round)&&!round.revealed?{...round,revealed:true}:round;}
export function rateLifeCard(round,rating){
 if(!currentLifeCard(round)||!round.revealed||!['remember','again'].includes(rating))return round;
 const index=round.queue[round.cursor],queue=[...round.queue],remaining=new Set(queue.slice(round.cursor+1).filter(i=>i!==index));
 if(rating==='again'&&remaining.size>=2&&queue.filter(i=>i===index).length<2)queue.push(index);
 const ratings=[...round.ratings];ratings[index]=rating;
 return {...round,queue,ratings,cursor:round.cursor+1,revealed:false};
}
export function lifeCardSummary(round){return {total:round.ratings.length,remember:round.ratings.filter(r=>r==='remember').length,again:round.ratings.filter(r=>r==='again').length,visits:round.cursor,done:round.cursor===round.queue.length};}
