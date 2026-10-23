import {units,questionById} from '../content/catalog.mjs';
import {jlptUnitMeta,jlptQuestionUnits,jlptLevels,jlptAbilities,jlptMemoryIds,jlptSkillIds,jlptUnitQuestionIds,isJlptSource,jlptSessionLevel} from '../content/jlpt-memory-ids.mjs';
import {jlptNoteKey,validateJlptNoteDraft,recordJlptExposure} from './jlpt-memory-state.mjs';
import {initialState,recordAnswers,validateState} from './learning.mjs';
import {beginV3Session} from './v3-learning.mjs';
import {studyDay} from './v3-state.mjs';
export {jlptNoteKey};
const ordinal=t=>Date.parse(studyDay(t))/86400000;
export const jlptMemoryQuestions=unit=>jlptMemoryIds(unit).map(id=>questionById.get(id));
export const jlptSkillQuestions=(unit,ability)=>jlptSkillIds(unit,ability).map(id=>questionById.get(id));
export const pendingJlpt=state=>state.v3.sessions.find(s=>isJlptSource(s.source)&&!s.completedAt);
export function jlptBlocker(state){
 if(state.activeExam)return {route:'exam-session',title:'先接續原來的模擬考',detail:'原作答與計時保持，參考與練習先收起。'};
 const p=pendingJlpt(state);if(p)return {route:'v3-practice/'+p.id,title:'先接續這輪檢定課程回想',detail:'原題、首答與提示保持，先完成這一小輪。'};
 if(jlptUnitMeta.has(state.practice?.unitId)&&state.practice.index<state.practice.questionIds.length)return {route:'practice',title:'先接續原課回想',detail:'原有課內作答仍保留，先接回目前這輪。'};
 return null;
}
export function jlptHistory(state,time){return state.attempts.filter(a=>jlptQuestionUnits.has(a.item)&&questionById.get(a.item)?.dimension===a.dimension&&Date.parse(a.time)<=Date.parse(time)).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));}
export function jlptCandidates(state,level,mode,time){
 if(!jlptLevels.includes(level)||!['check','week','repair'].includes(mode))return [];
 const history=jlptHistory(state,time),latest=new Map(history.map(a=>[a.item,a])),reviews=recordAnswers(initialState(),history).reviews;
 const ranked=[...latest.values()].filter(a=>jlptUnitMeta.get(jlptQuestionUnits.get(a.item)).level===level).filter(a=>{
  if(mode==='repair')return !a.correct||a.hinted;
  if(ordinal(a.time)>=ordinal(time))return false;
  const lastHint=Math.max(-Infinity,...(state.v3.jlptHints?.[a.item]||[]).filter(t=>Date.parse(t)<=Date.parse(time)).map(ordinal));
  return mode!=='week'||ordinal(time)-Math.max(ordinal(a.time),lastHint)>=7;
 }).map(a=>({a,q:questionById.get(a.item),due:Date.parse(reviews[a.item+':'+a.dimension].due)<=Date.parse(time)}));
 ranked.sort((a,b)=>Number(!b.a.correct)-Number(!a.a.correct)||Number(b.a.hinted)-Number(a.a.hinted)||Number(b.due)-Number(a.due)||Date.parse(a.a.time)-Date.parse(b.a.time)||a.q.id.localeCompare(b.q.id));
 const seen=new Set(),out=[];for(const {q} of ranked)if(!seen.has(q.unitId)){seen.add(q.unitId);out.push(q);if(out.length===3)break;}return out;
}
export function startJlptRound(state,{unitId,level,mode='memory',ability,id,time}){
 if(jlptBlocker(state))return state;let ids,reference;
 if(mode==='memory'){ids=jlptMemoryIds(unitId);reference=unitId;}
 else if(mode==='skill'){ids=jlptSkillIds(unitId,ability);reference=unitId+':'+ability;}
 else if(['check','week','repair'].includes(mode)&&jlptLevels.includes(level)){reference=level+':'+studyDay(time);if(mode!=='repair'&&state.v3.sessions.some(s=>s.source==='jlpt-'+mode&&s.reference===reference))return state;ids=jlptCandidates(state,level,mode,time).map(q=>q.id);}
 return ids?.length?beginV3Session(state,ids,{id,time,source:'jlpt-'+mode,reference}):state;
}
export function jlptMap(state,level,time){
 const history=jlptHistory(state,time),latest=new Map(history.map(a=>[a.item,a]));
 return units.filter(u=>u.level===level).map(unit=>{const rows=history.filter(a=>jlptQuestionUnits.get(a.item)===unit.id),ids=new Set(rows.map(a=>a.item)),weak=[...ids].filter(id=>!latest.get(id).correct||latest.get(id).hinted).length;return {unit,practiced:ids.size,total:jlptUnitQuestionIds(unit.id).length,days:new Set(rows.map(a=>studyDay(a.time))).size,weak,note:Boolean(state.drafts[jlptNoteKey(unit.id)]),status:!ids.size?'new':weak?'weak':'practiced'};});
}
export function jlptAbilityReport(state,level,time){
 const history=jlptHistory(state,time).filter(a=>jlptUnitMeta.get(jlptQuestionUnits.get(a.item)).level===level),first=new Map(),counts=new Map();for(const a of history){const key=a.item+':'+studyDay(a.time);if(!first.has(key))first.set(key,a);const stamp=a.item+':'+Date.parse(a.time);counts.set(stamp,(counts.get(stamp)||0)+1);}
 const out=Object.fromEntries(jlptAbilities.map(([key])=>[key,{total:0,independent:0,hinted:0,ambiguous:0}]));for(const a of first.values()){const row=out[a.dimension];row.total++;if(counts.get(a.item+':'+Date.parse(a.time))>1)row.ambiguous++;else{if(a.correct&&!a.hinted)row.independent++;if(a.hinted)row.hinted++;}}return out;
}
export function jlptNextStep(state,level,time){
 const blocked=jlptBlocker(state);if(blocked)return {kind:'pending',...blocked};
 if(state.v3.sessions.some(s=>isJlptSource(s.source)&&jlptSessionLevel(s)===level&&s.completedAt&&Date.parse(s.completedAt)<=Date.parse(time)&&studyDay(s.completedAt)===studyDay(time)))return {kind:'done',title:'今天這個級別，先到這裡就好。',detail:'完成一輪就可以休息；當天重練與跨日記住分開。',route:'jlpt-map/'+level};
 for(const [mode,title] of [['week','七日後，再自己想一次'],['check','先做隔天的小檢查'],['repair','先補強最多三個弱點']])if(!(mode!=='repair'&&state.v3.sessions.some(s=>s.source==='jlpt-'+mode&&s.reference===level+':'+studyDay(time)))&&jlptCandidates(state,level,mode,time).length)return {kind:mode,title,detail:'只取實際做過的原題，每課一題，最多三題。',route:'jlpt-review/'+level+':'+mode};
 const next=jlptMap(state,level,time).find(r=>r.status==='new');return next?{kind:'new',title:'選一課，先記住一小步。',detail:next.unit.title,route:'jlpt-memory/'+next.unit.id}:{kind:'done',title:'今天可以先收尾。',detail:'所有課都已有原題練習紀錄；之後再確認能否想起。',route:'jlpt-map/'+level};
}
export function jlptRoundReview(state,id,time){const session=state.v3.sessions.find(s=>s.id===id&&isJlptSource(s.source)&&s.completedAt&&Date.parse(s.completedAt)<=Date.parse(time));if(!session)return null;return {session,entries:session.questionIds.map(qid=>({q:questionById.get(qid),answer:structuredClone(session.answers[qid])}))};}
export function jlptEvidence(state,id){
 const s=state.v3.sessions.find(s=>s.id===id&&['jlpt-check','jlpt-week'].includes(s.source)),out={total:0,hinted:0,comparable:0,retained:0,excluded:0};if(!s)return out;
 for(const [qid,a] of Object.entries(s.answers)){out.total++;if(a.hinted)out.hinted++;const all=jlptHistory(state,a.time).filter(h=>h.item===qid),prior=all.filter(h=>Date.parse(h.time)<Date.parse(s.createdAt)).at(-1),between=all.some(h=>Date.parse(h.time)>=Date.parse(s.createdAt)&&Date.parse(h.time)<Date.parse(a.time)),ties=all.filter(h=>Date.parse(h.time)===Date.parse(a.time));if(a.hinted||!prior||ordinal(a.time)-ordinal(prior.time)<(s.source==='jlpt-week'?7:1)||between||ties.length!==1){out.excluded++;continue;}out.comparable++;if(a.correct)out.retained++;}return out;
}
export function storeJlptNote(state,unitId,text,time){if(!jlptUnitMeta.has(unitId)||jlptBlocker(state))throw Error('請先接續原輪，再編輯個人線索。');const key=jlptNoteKey(unitId),draft={text,points:[],time};validateJlptNoteDraft(key,draft);let next=text.trim()?recordJlptExposure(state,jlptUnitQuestionIds(unitId),time):state;next=structuredClone(next);next.drafts[key]=draft;next.revision++;return validateState(next);}
