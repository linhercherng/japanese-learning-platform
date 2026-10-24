import {memoryEvidence,emptyRecent,memoryTiming,weeklyFocusScore} from './memory-evidence.mjs';
import {resolveLearningQuestion} from '../content/catalog.mjs';
import {studyDay} from './v3-state.mjs';
import {dailyMemory} from './daily-memory.mjs';
const stamp=t=>Date.parse(t),day=n=>new Date(n*86400000).toISOString().slice(0,10),ordinal=t=>Date.parse(studyDay(t))/86400000;
const goals=['K','L','N5','N4','N3','N2'],labels={K:'五十音',L:'生活日語',N5:'N5',N4:'N4',N3:'N3',N2:'N2'};
const role=s=>['kana-mini','life-memory','jlpt-memory'].includes(s.source)?'learn':/^(kana|life|jlpt)-(check|week|repair)$/.test(s.source)?'review':null;
const answerKey=(item,dimension,time)=>JSON.stringify([item,dimension,stamp(time)]);
const severity=r=>r.status==='review'?3:r.status==='uncertain'?2:r.status==='waiting'?1:0;
export function weeklyFocusParam(param=''){const [goal,ability,...extra]=String(param).split(':'),allowed=goal==='K'?['recognition','listening','language']:goal==='L'?['listening','productive','understanding']:['vocabulary','grammar','kanji','reading','listening'];return goals.includes(goal)&&allowed.includes(ability)&&!extra.length?{goal,ability}:null;}
export function weeklyFocusQueue(state,param,time,options={}){const p=weeklyFocusParam(param);return p?dailyMemory(state,p.goal,time,{...options,ability:p.ability}):null;}
function outcomes(state,time,start){
 const visible=t=>stamp(t)<=stamp(time),inside=t=>visible(t)&&studyDay(t)>=start;
 const out={learn:{completed:0,answers:0},review:{completed:0,answers:0},pending:0,uncertain:0,rounds:[],legacyPlans:{completed:0,steps:0,writing:0}},byAnswer=new Map(),claims=new Map();
 for(const a of state.attempts)if(visible(a.time)){const key=answerKey(a.item,a.dimension,a.time);if(!byAnswer.has(key))byAnswer.set(key,[]);byAnswer.get(key).push(a);}
 const rows=state.v3.sessions.filter(s=>role(s)&&visible(s.createdAt)).map(s=>{
  const links=Object.entries(s.answers).map(([qid,a])=>{const q=resolveLearningQuestion(qid),matches=q?byAnswer.get(answerKey(q.reviewItem||q.id,q.dimension,a.time))||[]:[],original=matches.length===1&&matches[0].correct===a.correct&&matches[0].hinted===a.hinted&&stamp(a.time)>=stamp(s.createdAt)&&visible(a.time)?matches[0]:null;if(original)claims.set(original.id,(claims.get(original.id)||0)+1);return {a,original};});
  return {s,links};
 });
 for(const {s,links} of rows){
  const kind=role(s),sane=visible(s.updatedAt)&&stamp(s.updatedAt)>=stamp(s.createdAt)&&links.every(l=>l.original&&claims.get(l.original.id)===1&&stamp(l.a.time)<=stamp(s.updatedAt))&&Object.values(s.corrections).every(a=>visible(a.time)&&stamp(a.time)>=stamp(s.createdAt)&&stamp(a.time)<=stamp(s.updatedAt));
  const complete=s.completedAt&&visible(s.completedAt)&&stamp(s.completedAt)>=stamp(s.updatedAt)&&s.questionIds.every(id=>s.answers[id])&&s.cursor===s.queue.length;
  if(!sane||s.completedAt&&!complete){if(inside(s.createdAt)||inside(s.updatedAt)||s.completedAt&&inside(s.completedAt))out.uncertain++;continue;}
  out[kind].answers+=links.filter(l=>inside(l.a.time)).length;
  if(!s.completedAt)out.pending++;
  else if(inside(s.completedAt)){out[kind].completed++;out.rounds.push({id:s.id,kind,source:s.source,time:s.completedAt,route:'v3-practice/'+s.id});}
 }
 out.rounds.sort((a,b)=>stamp(b.time)-stamp(a.time)||a.id.localeCompare(b.id));out.rounds=out.rounds.slice(0,6);
 for(const p of state.v3.dailyPlans){const completed=p.steps.filter(s=>s.completedAt&&inside(s.completedAt));out.legacyPlans.steps+=completed.length;out.legacyPlans.writing+=completed.filter(s=>s.kind==='write').length;if(p.steps.every(s=>s.completedAt&&visible(s.completedAt))&&completed.length)out.legacyPlans.completed++;}
 return out;
}
/** A rolling-week learning summary and next seven-day focus, with no persisted schedule. */
export function weeklyLearning(state,time,{evidence=memoryEvidence(state,time)}={}){
 const end=ordinal(time),nextStart=day(end+1),nextEnd=day(end+7),period=emptyRecent(),groups=[];
 for(const track of evidence.tracks)for(const ability of track.abilities){
  const rows=track.items.filter(i=>i.ability===ability.ability),metrics=emptyRecent();for(const r of rows)for(const key of Object.keys(metrics)){metrics[key]+=r.recent[key];period[key]+=r.recent[key];}
  rows.sort((a,b)=>severity(b)-severity(a)||weeklyFocusScore(b)-weeklyFocusScore(a)||stamp(a.lastAt)-stamp(b.lastAt)||a.item.localeCompare(b.item));
  const weak=rows.filter(r=>r.status==='review').length,uncertain=rows.filter(r=>r.status==='uncertain').length,waiting=rows.filter(r=>r.status==='waiting').length,kind=weak?'repair':uncertain?'confirm':waiting?'check':'maintain';
  const next=Math.min(...rows.map(r=>memoryTiming(r).next)),reasons=[metrics.delayedFailed?`本週 ${metrics.delayedFailed} 次可比較的跨日回想未想起`:null,metrics.hinted?`本週 ${metrics.hinted} 次每日首答需要提示`:null,weak?`目前 ${weak} 項仍需複習`:null,uncertain?`${uncertain} 項紀錄待確認`:null].filter(Boolean);
  groups.push({id:track.goal+':'+ability.ability,goal:track.goal,ability:ability.ability,title:labels[track.goal]+' · '+ability.label,kind,metrics,weak,uncertain,waiting,priority:Math.max(...rows.map(severity)),score:rows.reduce((n,r)=>n+weeklyFocusScore(r),0),nextDay:day(next),scheduleDay:day(Math.max(end+1,next)),route:'weekly-focus/'+track.goal+':'+ability.ability,reason:reasons.join('；')||(kind==='check'?'已有單次成功，下一步確認跨日能否想起。':'已有可比較記憶證據，維持適當間隔即可。'),items:rows.slice(0,3).map(r=>({...r,nextDay:day(memoryTiming(r).next)}))});
 }
 groups.sort((a,b)=>b.priority-a.priority||b.score-a.score||Number(b.goal===state.v3.goal)-Number(a.goal===state.v3.goal)||a.nextDay.localeCompare(b.nextDay)||goals.indexOf(a.goal)-goals.indexOf(b.goal)||a.ability.localeCompare(b.ability));
 const focus=groups.slice(0,state.settings.dailyMinutes===5?1:3),needsReview=groups.some(g=>g.weak||g.uncertain),kind=!period.dailyFirst?'observe':needsReview||period.needsHelp*2>=period.dailyFirst?'consolidate':'balanced';
 const policy={kind,title:kind==='observe'?'先累積一小步，再調整重點':kind==='consolidate'?'下一週先鞏固，暫緩增加份量':'維持複習，再加一小段新內容',detail:kind==='observe'?'本週還沒有足夠每日首答。沿用已選目標，每次一小組，隔天再確認。':kind==='consolidate'?'需要提示、錯答或待確認的能力先練；5分鐘一次一題，其餘每輪最多三題。完成一輪即可休息。':'已有可靠回想結果；先完成到期原題，有餘裕再選一課，不自動升級程度。',route:state.v3.goal==='K'?'kana-mini':state.v3.goal==='L'?'life-memory':'jlpt-memory/'+state.v3.goal};
 return {start:evidence.start,end:evidence.end,nextStart,nextEnd,period,outcomes:outcomes(state,time,evidence.start),focus,groups,policy};
}
