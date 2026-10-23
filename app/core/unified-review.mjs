import {kana} from '../content/kana.mjs';
import {resolveLearningQuestion,unitById} from '../content/catalog.mjs';
import {lifeQuestionUnits,lifeAbility} from '../content/life-memory-ids.mjs';
import {jlptQuestionUnits,jlptUnitMeta} from '../content/jlpt-memory-ids.mjs';
import {extraKanaExposure} from '../content/kana-recall.mjs';
import {studyDay} from './v3-state.mjs';
import {unifiedLearning} from './unified-learning.mjs';
const kanaIndex=new Map(kana.map((k,i)=>[k.id,{...k,index:i+1}]));
const stamp=t=>Date.parse(t),ordinal=t=>Date.parse(studyDay(t))/86400000;
const labels={recognition:'認字',listening:'聽辨',language:'詞音與拼寫',understanding:'理解',productive:'補字與重組',vocabulary:'語彙',kanji:'漢字',grammar:'文法',reading:'讀解'};
const statuses=['review','uncertain','waiting','retained','week'];
export const memoryStatusLabels={review:'需要再複習',uncertain:'時間重疊，待確認',waiting:'無提示答對，跨日待確認',retained:'已有跨日記憶證據',week:'已有七日記憶證據'};
function metadata(a){
 const k=kanaIndex.get(a.item);if(k&&['recognition','listening','language'].includes(a.dimension))return {goal:'K',unitId:null,title:`${k.script==='kata'?'片假名':'平假名'} · 字表第 ${k.index} 字`,ability:a.dimension,route:'kana-map'};
 const q=resolveLearningQuestion(a.item);if(!q||q.dimension!==a.dimension||a.dimension==='writing')return null;
 const life=lifeQuestionUnits.get(a.item),unitId=life||jlptQuestionUnits.get(a.item);if(!unitId)return null;
 return {goal:life?'L':jlptUnitMeta.get(unitId).level,unitId,title:unitById.get(unitId)?.title||unitId,ability:life?lifeAbility(q):a.dimension,route:life?'life-memory/'+unitId:'jlpt-memory/'+unitId};
}
const emptyWeek=()=>({answers:0,dailyFirst:0,independent:0,hinted:0,ambiguous:0,retained:0,week:0,studyDays:0});
/** Read-only evidence. No question text, answer values, user writing, or persisted aggregate. */
export function unifiedReview(state,time,quiz=null){
 const end=studyDay(time),endDay=ordinal(time),start=new Date((endDay-6)*86400000).toISOString().slice(0,10),visible=t=>stamp(t)<=stamp(time),inWeek=t=>visible(t)&&studyDay(t)>=start;
 const route=unifiedLearning(state,time,quiz),histories=new Map(),exposures=new Map(),separate={writing:0,artifacts:state.artifacts.filter(a=>inWeek(a.time)).length,other:0,corrections:0};
 const expose=(item,t)=>{if(!visible(t))return;if(!exposures.has(item))exposures.set(item,[]);exposures.get(item).push(stamp(t));};
 for(const a of state.attempts){
  if(!visible(a.time))continue;
  if(kanaIndex.has(a.item))expose(a.item,a.time);
  if(a.dimension==='writing'){if(inWeek(a.time))separate.writing++;continue;}
  const meta=metadata(a);if(!meta){if(inWeek(a.time))separate.other++;continue;}
  if(meta.goal!=='K')expose(a.item,a.time);
  const key=a.item+':'+a.dimension;if(!histories.has(key))histories.set(key,{meta,list:[]});histories.get(key).list.push(a);
 }
 for(const [item,h] of Object.entries(state.v3.kanaHints||{}))expose(item,h.lastHintAt);
 for(const key of ['lifeHints','jlptHints'])for(const [item,times] of Object.entries(state.v3[key]||{}))for(const t of times)expose(item,t);
 // Saved comparison/correction records can expose a different kana without scoring it.
 for(const s of state.v3.sessions){
  for(const [qid,a] of Object.entries(s.answers))for(const item of extraKanaExposure(qid))expose(item,a.time);
  for(const [index,a] of Object.entries(s.corrections)){
   if(inWeek(a.time))separate.corrections++;
   const qid=s.queue[Number(index)]?.questionId,q=resolveLearningQuestion(qid);
   if(q)expose(q.reviewItem||qid,a.time);for(const item of extraKanaExposure(qid))expose(item,a.time);
  }
 }
 const week=emptyWeek(),days=new Set(),tracks=route.tracks.map(t=>({...t,next:route.pending[0]||t,items:[],abilities:[],week:emptyWeek(),current:{...Object.fromEntries(statuses.map(s=>[s,0])),remembered:0,total:0}}));
 for(const {meta,list} of histories.values()){
  list.sort((a,b)=>stamp(a.time)-stamp(b.time)||a.id.localeCompare(b.id));
  const track=tracks.find(t=>t.goal===meta.goal),first=new Map(),ties=new Map();
  for(const a of list){const day=studyDay(a.time);if(!first.has(day))first.set(day,a);ties.set(stamp(a.time),(ties.get(stamp(a.time))||0)+1);if(inWeek(a.time)){track.week.answers++;week.answers++;days.add(day);}}
  const proof=a=>{
   if(!a.correct||a.hinted||ties.get(stamp(a.time))!==1)return null;
   const prior=list.filter(p=>stamp(p.time)<stamp(a.time)).at(-1);if(!prior||studyDay(prior.time)===studyDay(a.time))return null;
   const cues=(exposures.get(a.item)||[]).filter(t=>t<stamp(a.time));
   if((exposures.get(a.item)||[]).filter(t=>t===stamp(a.time)).length!==1)return null;
   const last=Math.max(stamp(prior.time),...cues),gap=ordinal(a.time)-ordinal(new Date(last).toISOString());
   return gap>=1?{time:a.time,days:gap}:null;
  };
  for(const a of first.values())if(inWeek(a.time)){
   for(const target of [week,track.week]){target.dailyFirst++;if(ties.get(stamp(a.time))>1)target.ambiguous++;else{if(a.hinted)target.hinted++;if(a.correct&&!a.hinted)target.independent++;const p=proof(a);if(p){target.retained++;if(p.days>=7)target.week++;}}}
  }
  const last=list.at(-1),daily=first.get(studyDay(last.time)),ambiguous=ties.get(stamp(last.time))>1||ties.get(stamp(daily.time))>1;
  const laterCue=(exposures.get(last.item)||[]).some(t=>t>stamp(last.time)),p=proof(daily);
  const status=ambiguous?'uncertain':!last.correct||last.hinted||!daily.correct||daily.hinted||laterCue?'review':p?(p.days>=7?'week':'retained'):'waiting';
  const item={...meta,item:last.item,dimension:last.dimension,abilityLabel:labels[meta.ability]||meta.ability,status,label:memoryStatusLabels[status],lastAt:last.time,firstAt:daily.time,days:first.size,total:list.length,proof:status==='retained'||status==='week'?p:null};
  track.items.push(item);track.current[status]++;track.current.total++;if(['week','retained'].includes(status))track.current.remembered++;
 }
 for(const t of tracks){
  t.items.sort((a,b)=>statuses.indexOf(a.status)-statuses.indexOf(b.status)||stamp(b.lastAt)-stamp(a.lastAt)||a.item.localeCompare(b.item)||a.dimension.localeCompare(b.dimension));
  t.week.studyDays=new Set(t.items.flatMap(r=>histories.get(r.item+':'+r.dimension).list.filter(a=>inWeek(a.time)).map(a=>studyDay(a.time)))).size;
  for(const ability of [...new Set(t.items.map(r=>r.ability))]){const rows=t.items.filter(r=>r.ability===ability);t.abilities.push({ability,label:labels[ability]||ability,total:rows.length,remembered:rows.filter(r=>['retained','week'].includes(r.status)).length,review:rows.filter(r=>['review','uncertain'].includes(r.status)).length,waiting:rows.filter(r=>r.status==='waiting').length});}
 }
 week.studyDays=days.size;
 return {start,end,week,tracks,separate,main:route.main,pending:route.pending};
}
