import {kanaMemoryMap} from './kana-coach.mjs';
import {coachQuestion} from '../content/kana-coach.mjs';
import {beginV3Session} from './v3-learning.mjs';
export function selectRepairQuestions(state,time){
 const candidates=kanaMemoryMap(state,time).flatMap(k=>['recognition','listening'].filter(d=>k[d].weak).map(d=>({item:k.id,dimension:d,...k[d]})));
 candidates.sort((a,b)=>Number(b.due)-Number(a.due)||Date.parse(a.lastTime)-Date.parse(b.lastTime)||a.item.localeCompare(b.item)||a.dimension.localeCompare(b.dimension));
 const used=new Set(),questions=[];
 for(const c of candidates){if(used.has(c.item))continue;used.add(c.item);questions.push(coachQuestion('kc:check:'+c.item+':'+(c.dimension==='recognition'?'pair':'listen')));if(questions.length===3)break;}
 return questions;
}
export function pendingRepair(state){return state.v3.sessions.find(s=>s.source==='kana-repair'&&!s.completedAt);}
export function startKanaRepair(state,{id,time}){
 if(pendingRepair(state))return state;
 const questions=selectRepairQuestions(state,time);return questions.length?beginV3Session(state,questions.map(q=>q.id),{id,source:'kana-repair',reference:questions.map(q=>q.reviewItem).join(':'),time}):state;
}
