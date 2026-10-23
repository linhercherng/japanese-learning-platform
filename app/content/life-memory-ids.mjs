import {lifeIntroTopics,lifeTopicLevels,topics} from './life-topics.mjs';
// Raw content only: state validation must not import the catalog/learning cycle.
import {lifeLessons} from './life.mjs';
import {additionalLifeLessons} from './life-expanded.mjs';
import {supplements} from './life-v2-supplement.mjs';
import {scenarios as n5} from './n5-scenarios.mjs';
import {scenarios as n4} from './n4-scenarios.mjs';
import {scenarios as n3} from './n3-scenarios.mjs';
import {scenarios as n2} from './n2-scenarios.mjs';
const entries=[...[...lifeLessons,...additionalLifeLessons].map(u=>[u.id,[...u.quiz.map((q,i)=>({...q,id:`${u.id}-q${i}`,kind:'choice',dimension:'language'})),...supplements[u.id].additionalQuestions,...supplements[u.id].reading.questions]]),...[...n5,...n4,...n3,...n2].map(u=>[u.id,u.questions])];
export const lifeUnitMeta=new Map([...lifeIntroTopics].map(([id,topic])=>[id,{topic,level:'L'}]).concat([...n5,...n4,...n3,...n2].map(u=>[u.id,{topic:u.topic,level:u.level}])));
export function lifeTopicFits(unitId,topic,ceiling){const meta=lifeUnitMeta.get(unitId),max=lifeTopicLevels.indexOf(ceiling);return Boolean(meta&&max>=0&&topics.some(([id])=>id===topic)&&meta.topic===topic&&lifeTopicLevels.indexOf(meta.level)<=max);}
export const lifeUnitIds=new Set(entries.map(([id])=>id));
export const lifeQuestionUnits=new Map(entries.flatMap(([unit,qs])=>qs.map(q=>[q.id,unit])));
export function lifeAbility(q){return q.dimension==='writing'?null:q.dimension==='listening'||q.kind==='listen'?'listening':['cloze','order'].includes(q.kind)?'productive':q.kind==='choice'?'understanding':null;}
const abilities=new Map(entries.flatMap(([,qs])=>qs.map(q=>[q.id,lifeAbility(q)])));
export function selectMemoryQuestions(questions){
 const selected=[];
 for(const predicate of [q=>q.dimension==='listening',q=>['cloze','order'].includes(q.kind),q=>q.kind==='choice'&&['language','reading'].includes(q.dimension)]){
  const q=questions.find(q=>!selected.includes(q)&&predicate(q));if(q)selected.push(q);
 }
 for(const q of questions)if(selected.length<3&&!selected.includes(q))selected.push(q);
 return selected.slice(0,3);
}
const fixed=new Map(entries.map(([unit,qs])=>[unit,selectMemoryQuestions(qs).map(q=>q.id)]));
export const memoryQuestionIds=unit=>fixed.get(unit)||[];
export const isLifeSource=source=>['life-memory','life-check','life-repair','life-week','life-skill','life-topic'].includes(source);
export function validLifeReference(source,reference,ids){
 if(typeof reference!=='string'||!Array.isArray(ids)||ids.some(id=>!lifeQuestionUnits.has(id)))return false;
 if(source==='life-memory')return lifeUnitIds.has(reference)&&JSON.stringify(ids)===JSON.stringify(memoryQuestionIds(reference));
 if(source==='life-topic'){const [topic,ceiling,...extra]=reference.split(':');return !extra.length&&ids.length>=1&&ids.length<=3&&new Set(ids.map(id=>lifeQuestionUnits.get(id))).size===ids.length&&ids.every(id=>lifeTopicFits(lifeQuestionUnits.get(id),topic,ceiling));}
 if(source==='life-skill'){const [unit,skill,...extra]=reference.split(':');return !extra.length&&lifeUnitIds.has(unit)&&['listening','productive','understanding'].includes(skill)&&ids.length>=1&&ids.length<=3&&new Set(ids).size===ids.length&&ids.every(id=>lifeQuestionUnits.get(id)===unit&&abilities.get(id)===skill);}
 if(['life-check','life-repair','life-week'].includes(source))return /^\d{4}-\d\d-\d\d$/.test(reference)&&Number.isFinite(Date.parse(reference))&&new Date(reference).toISOString().slice(0,10)===reference&&ids.length>=1&&ids.length<=3&&new Set(ids.map(id=>lifeQuestionUnits.get(id))).size===ids.length;
 return false;
}
