import {questionById} from '../content/catalog.mjs';
import {lifeUnitMeta,lifeTopicFits} from '../content/life-memory-ids.mjs';
import {lifeHistory,pendingLife} from './life-memory.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
function entries(state,topic,ceiling,time){const history=lifeHistory(state,time),last=new Map(history.map(a=>[a.item,a])),reviews=recordAnswers(initialState(),history).reviews;return [...last.values()].map(a=>({a,q:questionById.get(a.item),rank:!a.correct||a.hinted?0:Date.parse(reviews[a.item+':'+a.dimension].due)<=Date.parse(time)?1:2})).filter(r=>lifeTopicFits(r.q.unitId,topic,ceiling)).sort((a,b)=>a.rank-b.rank||Date.parse(a.a.time)-Date.parse(b.a.time)||a.q.id.localeCompare(b.q.id));}
export function lifeTopicCandidates(state,topic,ceiling,time){const units=new Set(),out=[];for(const {q} of entries(state,topic,ceiling,time))if(!units.has(q.unitId)){units.add(q.unitId);out.push(q);if(out.length===3)break;}return out;}
export function lifeTopicSummary(state,topic,ceiling,time){const rows=entries(state,topic,ceiling,time),practicedUnits=new Set(rows.map(r=>r.q.unitId)).size;return {availableUnits:[...lifeUnitMeta.keys()].filter(id=>lifeTopicFits(id,topic,ceiling)).length,practicedUnits,questions:Math.min(3,practicedUnits)};}
export function startLifeTopic(state,{topic,ceiling,id,time}){if(pendingLife(state))return state;const qs=lifeTopicCandidates(state,topic,ceiling,time);return qs.length?beginV3Session(state,qs.map(q=>q.id),{id,time,source:'life-topic',reference:topic+':'+ceiling}):state;}
