import {courseIndex,courseAnswerHinted,courseAnswerUnknown} from './course-history-state.mjs';
import {kanaEvents,legacyKanaUnknown} from './kana-history-state.mjs';
import {kana} from '../content/kana.mjs';
import {resolveLearningQuestion,unitById} from '../content/catalog.mjs';
import {lifeQuestionUnits,lifeAbility} from '../content/life-memory-ids.mjs';
import {jlptQuestionUnits,jlptUnitMeta} from '../content/jlpt-memory-ids.mjs';
import {extraKanaExposure} from '../content/kana-recall.mjs';
import {studyDay} from './v3-state.mjs';
const kanaIndex=new Map(kana.map((k,i)=>[k.id,{...k,index:i+1}]));
const stamp=t=>Date.parse(t),ordinal=t=>Date.parse(studyDay(t))/86400000;
const labels={recognition:'認字',listening:'聽辨',language:'詞音與拼寫',understanding:'理解',productive:'補字與重組',vocabulary:'語彙',kanji:'漢字',grammar:'文法',reading:'讀解'};
const statuses=['review','uncertain','waiting','retained','week'];
export const memoryStatusLabels={review:'需要再複習',uncertain:'紀錄待確認',waiting:'無提示答對，跨日待確認',retained:'已有跨日記憶證據',week:'已有七日記憶證據'};
export const emptyRecent=()=>({dailyFirst:0,independent:0,hinted:0,wrong:0,needsHelp:0,ambiguous:0,uncertain:0,comparable:0,delayedFailed:0,retained:0,week:0});
export const weeklyFocusScore=r=>(r.recent?.delayedFailed||0)*10+(r.recent?.needsHelp||0)*3+(r.recent?.uncertain||0);
export function memoryTiming(r){const last=Math.max(stamp(r.lastAt),stamp(r.lastCueAt||r.lastAt)),base=ordinal(new Date(last).toISOString()),interval=r.status==='week'?7:r.status==='retained'?3:1;return {next:base+interval,week:base+7,interval};}
export function memoryTarget(a){
 const k=kanaIndex.get(a.item);if(k&&['recognition','listening','language'].includes(a.dimension))return {goal:'K',unitId:null,title:`${k.script==='kata'?'片假名':'平假名'} · 字表第 ${k.index} 字`,ability:a.dimension,route:'kana-map/'+k.id};
 const q=resolveLearningQuestion(a.item);if(!q||q.dimension!==a.dimension||a.dimension==='writing')return null;
 const life=lifeQuestionUnits.get(a.item),unitId=life||jlptQuestionUnits.get(a.item);if(!unitId)return null;
 return {goal:life?'L':jlptUnitMeta.get(unitId).level,unitId,title:unitById.get(unitId)?.title||unitId,ability:life?lifeAbility(q):a.dimension,route:life?'life-memory/'+unitId:'jlpt-memory/'+unitId};
}
const emptyWeek=()=>({answers:0,dailyFirst:0,independent:0,hinted:0,ambiguous:0,uncertainHistory:0,retained:0,week:0,studyDays:0});
/** Read-only evidence. No question text, answer values, user writing, or persisted aggregate. */
export function memoryEvidence(state,time){
 const end=studyDay(time),endDay=ordinal(time),start=new Date((endDay-6)*86400000).toISOString().slice(0,10),visible=t=>stamp(t)<=stamp(time),inWeek=t=>visible(t)&&studyDay(t)>=start;
 const histories=new Map(),exposures=new Map(),separate={writing:0,artifacts:state.artifacts.filter(a=>inWeek(a.time)).length,other:0,corrections:0};
 const expose=(item,t)=>{if(!visible(t))return;if(!exposures.has(item))exposures.set(item,[]);exposures.get(item).push(stamp(t));};
 for(const a of state.attempts){
  if(!visible(a.time))continue;
  if(kanaIndex.has(a.item))expose(a.item,a.time);
  if(a.dimension==='writing'){if(inWeek(a.time))separate.writing++;continue;}
  const meta=memoryTarget(a);if(!meta){if(inWeek(a.time))separate.other++;continue;}
  if(meta.goal!=='K')expose(a.item,a.time);
  const key=a.item+':'+a.dimension;if(!histories.has(key))histories.set(key,{meta,list:[]});histories.get(key).list.push(a);
 }
 const kanaTimeline=kanaEvents(state,null,time);for(const event of kanaTimeline)if(event.kind!=='answer')expose(event.item,event.time);
 const courses=courseIndex(state,time);for(const [item,row] of courses)for(const event of row.events)if(event.kind!=='answer')expose(item,event.time);
 // Saved comparison/correction records can expose a different kana without scoring it.
 for(const s of state.v3.sessions){
  for(const [qid,a] of Object.entries(s.answers))for(const item of extraKanaExposure(qid))expose(item,a.time);
  for(const [index,a] of Object.entries(s.corrections)){
   if(inWeek(a.time))separate.corrections++;
   const qid=s.queue[Number(index)]?.questionId,q=resolveLearningQuestion(qid);
   if(q)expose(q.reviewItem||qid,a.time);for(const item of extraKanaExposure(qid))expose(item,a.time);
  }
 }
 const week=emptyWeek(),days=new Set(),tracks=['K','L','N5','N4','N3','N2'].map(goal=>({goal,items:[],abilities:[],week:emptyWeek(),current:{...Object.fromEntries(statuses.map(s=>[s,0])),remembered:0,total:0}}));
 for(const {meta,list} of histories.values()){
  list.sort((a,b)=>stamp(a.time)-stamp(b.time)||a.id.localeCompare(b.id));
  const track=tracks.find(t=>t.goal===meta.goal),first=new Map(),ties=new Map();
  for(const a of list){const day=studyDay(a.time);if(!first.has(day))first.set(day,a);ties.set(stamp(a.time),(ties.get(stamp(a.time))||0)+1);if(inWeek(a.time)){track.week.answers++;week.answers++;days.add(day);}}
  const timeline=meta.goal==='K'?kanaTimeline.filter(e=>e.item===list[0].item):(courses.get(list[0].item)?.events||[]),missingHintHistory=a=>meta.goal==='K'?legacyKanaUnknown(state,a,time,timeline):courseAnswerUnknown(courses,a);
  const effectiveHint=a=>meta.goal==='K'?a.hinted||timeline.some(e=>e.kind!=='answer'&&stamp(e.time)<=stamp(a.time)&&studyDay(e.time)===studyDay(a.time)):courseAnswerHinted(courses,a);
  const comparable=a=>{
   if(effectiveHint(a)||ties.get(stamp(a.time))!==1||missingHintHistory(a))return null;
   const prior=list.filter(p=>stamp(p.time)<stamp(a.time)).at(-1);if(!prior||studyDay(prior.time)===studyDay(a.time))return null;
   const cues=(exposures.get(a.item)||[]).filter(t=>t<stamp(a.time));
   if((exposures.get(a.item)||[]).filter(t=>t===stamp(a.time)).length!==1)return null;
   const last=Math.max(stamp(prior.time),...cues),gap=ordinal(a.time)-ordinal(new Date(last).toISOString());
   return gap>=1?{time:a.time,days:gap}:null;
  };
  const proof=a=>a.correct?comparable(a):null,recent=emptyRecent();
  for(const a of first.values())if(inWeek(a.time)){
   recent.dailyFirst++;
   if(ties.get(stamp(a.time))>1)recent.ambiguous++;
   else{const hinted=effectiveHint(a),unknown=missingHintHistory(a),p=comparable(a);if(hinted)recent.hinted++;if(!a.correct)recent.wrong++;if(hinted||!a.correct)recent.needsHelp++;if(unknown)recent.uncertain++;if(a.correct&&!hinted&&!unknown)recent.independent++;if(p){recent.comparable++;if(a.correct){recent.retained++;if(p.days>=7)recent.week++;}else recent.delayedFailed++;}}
   for(const target of [week,track.week]){target.dailyFirst++;if(ties.get(stamp(a.time))>1)target.ambiguous++;else{if(effectiveHint(a))target.hinted++;if(a.correct&&!effectiveHint(a)){target.independent++;if(missingHintHistory(a))target.uncertainHistory++;}const p=proof(a);if(p){target.retained++;if(p.days>=7)target.week++;}}}
  }
  const last=list.at(-1),daily=first.get(studyDay(last.time)),ambiguous=ties.get(stamp(last.time))>1||ties.get(stamp(daily.time))>1;
  const cues=exposures.get(last.item)||[],lastCueAt=cues.length?new Date(Math.max(...cues)).toISOString():null,p=proof(daily),missing=missingHintHistory(daily);
  const status=ambiguous?'uncertain':!last.correct||effectiveHint(last)||!daily.correct||effectiveHint(daily)?'review':missing?'uncertain':p?(p.days>=7?'week':'retained'):'waiting';
  const item={...meta,item:last.item,dimension:last.dimension,abilityLabel:labels[meta.ability]||meta.ability,status,label:memoryStatusLabels[status],recent,history:Object.fromEntries(['hint','feedback','reference','legacy','answer'].map(kind=>[kind,timeline.filter(e=>e.kind===kind).length])),reason:ambiguous?'同一時間有多筆答案，需另一次清楚的首答確認。':missing?(meta.goal==='K'?'舊五十音提示歷史只存最後時間，無法確認答前是否看過線索；先保留原首答，再於原練習確認。':'舊生活與檢定參考只有每日合併時間，無法還原提示與回饋階段；原首答保持，另一次回想再確認。'):null,lastCueAt,lastAt:last.time,firstAt:daily.time,days:first.size,total:list.length,proof:status==='retained'||status==='week'?p:null};
  track.items.push(item);track.current[status]++;track.current.total++;if(['week','retained'].includes(status))track.current.remembered++;
 }
 for(const t of tracks){
  t.items.sort((a,b)=>statuses.indexOf(a.status)-statuses.indexOf(b.status)||stamp(b.lastAt)-stamp(a.lastAt)||a.item.localeCompare(b.item)||a.dimension.localeCompare(b.dimension));
  t.week.studyDays=new Set(t.items.flatMap(r=>histories.get(r.item+':'+r.dimension).list.filter(a=>inWeek(a.time)).map(a=>studyDay(a.time)))).size;
  for(const ability of [...new Set(t.items.map(r=>r.ability))]){const rows=t.items.filter(r=>r.ability===ability);t.abilities.push({ability,label:labels[ability]||ability,total:rows.length,remembered:rows.filter(r=>['retained','week'].includes(r.status)).length,review:rows.filter(r=>['review','uncertain'].includes(r.status)).length,waiting:rows.filter(r=>r.status==='waiting').length});}
 }
 week.studyDays=days.size;
 return {start,end,week,tracks,separate,courseHistory:Object.fromEntries(['hint','feedback','reference','legacy','answer'].map(kind=>[kind,[...courses.values()].flatMap(row=>row.events).filter(e=>e.kind===kind&&inWeek(e.time)).length])),kanaHistory:Object.fromEntries(['hint','feedback','reference','legacy','answer'].map(kind=>[kind,kanaTimeline.filter(e=>e.kind===kind&&inWeek(e.time)).length]))};
}
