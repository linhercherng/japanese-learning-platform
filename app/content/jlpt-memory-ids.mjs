// Raw content only: validators cannot import the catalog/learning cycle.
import {units as n5} from './n5.mjs';
import {units as n4} from './n4.mjs';
import {units as n3} from './n3.mjs';
import {units as n2} from './n2.mjs';
export const jlptLevels=['N5','N4','N3','N2'];
export const jlptAbilities=[['vocabulary','語彙'],['kanji','漢字'],['grammar','文法'],['reading','讀解'],['listening','聽解']];
const raw=[...n5,...n4,...n3,...n2];
export const jlptUnitMeta=new Map(raw.map(u=>[u.id,{level:u.level,title:u.title}]));
const questions=new Map(raw.map(u=>[u.id,[...u.questions,...u.reading?.questions||[]].filter(q=>q.id!=='N4-12-G2')]));
export const jlptQuestionUnits=new Map([...questions].flatMap(([uid,qs])=>qs.map(q=>[q.id,uid])));
const dimensions=new Map([...questions.values()].flatMap(qs=>qs.map(q=>[q.id,q.dimension])));
export const jlptUnitQuestionIds=uid=>(questions.get(uid)||[]).map(q=>q.id);
export const jlptMemoryIds=uid=>['vocabulary','grammar','listening'].map(d=>questions.get(uid)?.find(q=>q.dimension===d)?.id).filter(Boolean);
export const jlptSkillIds=(uid,ability)=>(questions.get(uid)||[]).filter(q=>q.dimension===ability).slice(0,3).map(q=>q.id);
export const isJlptSource=source=>['jlpt-memory','jlpt-skill','jlpt-check','jlpt-week','jlpt-repair'].includes(source);
const validDay=day=>/^\d{4}-\d\d-\d\d$/.test(day)&&Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day;
export function validJlptReference(source,reference,ids){
 if(typeof reference!=='string'||!Array.isArray(ids)||ids.length<1||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!jlptQuestionUnits.has(id)))return false;
 if(source==='jlpt-memory')return JSON.stringify(ids)===JSON.stringify(jlptMemoryIds(reference));
 if(source==='jlpt-skill'){const [uid,ability,...extra]=reference.split(':');return !extra.length&&jlptAbilities.some(([id])=>id===ability)&&JSON.stringify(ids)===JSON.stringify(jlptSkillIds(uid,ability));}
 if(['jlpt-check','jlpt-week','jlpt-repair'].includes(source)){const [level,day,...extra]=reference.split(':');return !extra.length&&jlptLevels.includes(level)&&validDay(day)&&new Set(ids.map(id=>jlptQuestionUnits.get(id))).size===ids.length&&ids.every(id=>jlptUnitMeta.get(jlptQuestionUnits.get(id))?.level===level);}
 return false;
}
export const jlptQuestionAbility=id=>dimensions.get(id);
export const jlptSessionLevel=s=>jlptUnitMeta.get(jlptQuestionUnits.get(s.questionIds[0]))?.level;
