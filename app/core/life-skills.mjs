// Focused practice uses original life questions and the original recall engine.
import {unitById,unitQuestions,questionById} from '../content/catalog.mjs';
import {lifeUnitIds,lifeAbility} from '../content/life-memory-ids.mjs';
import {lifeHistory,pendingLife} from './life-memory.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
export const lifeSkills=[['listening','聽解','聽原音，理解一句話。'],['productive','自己填空／排序','收起參考，自己填出詞語或排好原句。'],['understanding','字詞／情境理解','用原選擇題理解字詞、文法、情境或短文。']];
function entries(state,unitId,skill,time){
 if(!lifeUnitIds.has(unitId)||!lifeSkills.some(([key])=>key===skill))return [];
 const history=lifeHistory(state,time),last=new Map(history.map(a=>[a.item,a])),reviews=recordAnswers(initialState(),history).reviews;
 return unitQuestions(unitById.get(unitId)).map(q=>questionById.get(q.id)).filter(q=>lifeAbility(q)===skill).map(q=>{const a=last.get(q.id),weak=Boolean(a&&(!a.correct||a.hinted)),due=a&&Date.parse(reviews[a.item+':'+a.dimension].due)<=Date.parse(time);return {q,a,weak,rank:weak?0:!a?1:due?2:3};});
}
export function lifeSkillCandidates(state,unitId,skill,time){
 const ranked=entries(state,unitId,skill,time).sort((a,b)=>a.rank-b.rank||(Date.parse(a.a?.time)||0)-(Date.parse(b.a?.time)||0)||a.q.id.localeCompare(b.q.id)),selected=ranked.slice(0,3),unseen=ranked.find(r=>!r.a);
 if(unseen&&!selected.some(r=>!r.a))selected[selected.length-1]=unseen;
 return selected.map(r=>r.q);
}
export function lifeSkillSummary(state,unitId,skill,time){const rows=entries(state,unitId,skill,time),practiced=rows.filter(r=>r.a).length;return {total:rows.length,practiced,remaining:rows.length-practiced,weak:rows.filter(r=>r.weak).length};}
export function startLifeSkill(state,{unitId,skill,id,time}){if(pendingLife(state))return state;const qs=lifeSkillCandidates(state,unitId,skill,time);return qs.length?beginV3Session(state,qs.map(q=>q.id),{id,time,source:'life-skill',reference:unitId+':'+skill}):state;}
