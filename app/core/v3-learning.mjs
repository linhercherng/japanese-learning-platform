import {lifeCueSeen} from './life-memory-state.mjs';
import {isLifeSource} from '../content/life-memory-ids.mjs';
import {rhythmCueSeen} from '../content/kana-rhythm.mjs';
import {duelCueSeen} from '../content/kana-sixth.mjs';
import {extraKanaExposure} from '../content/kana-recall.mjs';
import {confusedKana,coachQuestion} from '../content/kana-coach.mjs';
import {recordAnswer,saveArtifact,validateState} from './learning.mjs';
import {gradeQuestion,validAnswerValue} from './study.mjs';
import {validateDailyPlan,validateSession,learningGoals,studyDay} from './v3-state.mjs';
const changed=state=>{state.revision++;return validateState(state);};
const requireValue=(value,message)=>{if(!value)throw new Error(message);};
export function setLearningGoal(state,goal){requireValue(learningGoals.includes(goal),'不支援的學習目標');if(state.v3.goal===goal)return state;const next=structuredClone(state);next.v3.goal=goal;return changed(next);}
export function storeDailyPlan(state,plan){validateDailyPlan(plan);if(state.v3.dailyPlans.some(p=>p.id===plan.id))return state;requireValue(state.v3.dailyPlans.length<60,'每日紀錄已達60份。先備份，再到每週回顧整理較早已完成的安排。');const next=structuredClone(state);next.v3.dailyPlans.push(structuredClone(plan));return changed(next);}
export function completeDailyStep(state,planId,stepId,time){
 const next=structuredClone(state),plan=next.v3.dailyPlans.find(p=>p.id===planId),step=plan?.steps.find(s=>s.id===stepId);requireValue(step,'找不到每日活動');
 if(step.completedAt)return state;requireValue(step.kind!=='practice'||next.v3.sessions.some(s=>s.id===step.sessionId&&s.completedAt),'先完成這輪回想');step.startedAt??=time;step.completedAt=time;plan.updatedAt=time;return changed(next);
}
export function startDailyStep(state,planId,stepId,time){const next=structuredClone(state),plan=next.v3.dailyPlans.find(p=>p.id===planId),step=plan?.steps.find(s=>s.id===stepId);requireValue(step,'找不到每日活動');if(step.startedAt)return state;step.startedAt=time;plan.updatedAt=time;return changed(next);}
export function adjustDailyPlan(state,planId,minutes,time,{questions=[]}={}){
 requireValue([5,15,30].includes(minutes),'不支援的每日時間');const next=structuredClone(state),plan=next.v3.dailyPlans.find(p=>p.id===planId);requireValue(plan,'找不到每日安排');
 if(plan.minutes===minutes)return state;const cap={5:2,15:6,30:10}[minutes];
 const learning=plan.steps.find(s=>s.id==='learn');
 if(!learning?.startedAt&&!learning?.completedAt){
  const newCap={5:1,15:3,30:5}[minutes],oldNew=plan.newConceptIds;
  plan.newConceptIds=oldNew.slice(0,newCap);const oldSlots=plan.newConceptIds.length?(newCap>1?1:0):newCap;plan.conceptIds=[...plan.conceptIds.filter(id=>!oldNew.includes(id)).slice(0,oldSlots),...plan.newConceptIds];plan.newCount=plan.newConceptIds.length;
  if(learning)learning.title=`理解 ${plan.newCount} 個新重點`;
  if(questions.length){const keep=new Set(questions.filter(q=>plan.conceptIds.includes(q.conceptId)).map(q=>q.id));for(const step of plan.steps)if(step.id==='transfer'&&!step.startedAt&&!step.sessionId&&!step.completedAt)step.questionIds=step.questionIds.filter(id=>keep.has(id));}
 }
 for(const step of plan.steps)if(!step.completedAt&&!step.sessionId&&step.kind==='practice'&&step.questionIds.length>cap){step.questionIds=step.questionIds.slice(0,cap);step.title=`回想 ${step.questionIds.length} 題`;}
 const recall=plan.steps.find(s=>s.id==='recall');plan.remainingDue=Math.max(0,plan.dueTotal-(recall?.kind==='practice'?recall.questionIds.length:0));
 plan.minutes=minutes;plan.updatedAt=time;return changed(next);
}
export function beginV3Session(state,questionIds,{id,source,reference,time,planId=null,stepId=null}){
 requireValue(questionIds.length>0,'目前沒有適合的題目');
 const next=structuredClone(state),old=next.v3.sessions.find(s=>s.source===source&&s.reference===reference&&!s.completedAt&&JSON.stringify(s.questionIds)===JSON.stringify(questionIds));
 if(!old)requireValue(state.v3.sessions.length<500,'回想輪次已達上限，請備份後整理較早的完成輪次');
 const session=old||validateSession({id,source,reference,questionIds:[...questionIds],queue:questionIds.map(questionId=>({questionId,repeat:false,sourceId:null})),cursor:0,answers:{},hints:[],corrections:{},deferred:[],createdAt:time,updatedAt:time,completedAt:null});
 if(!old)next.v3.sessions.push(session);
 if(planId){const plan=next.v3.dailyPlans.find(p=>p.id===planId),step=plan?.steps.find(s=>s.id===stepId);requireValue(step?.kind==='practice'&&JSON.stringify(step.questionIds)===JSON.stringify(questionIds),'每日活動題目不一致');if(step.sessionId&&step.sessionId!==session.id)throw new Error('這個活動已有另一輪回想');step.sessionId=session.id;step.startedAt??=time;plan.updatedAt=time;}
 return changed(next);
}
function active(state,id){const s=state.v3.sessions.find(s=>s.id===id);requireValue(s&&!s.completedAt,'找不到可接續的回想輪次');return s;}
export function hintV3Question(state,sessionId,time){
 const next=structuredClone(state),s=active(next,sessionId),entry=s.queue[s.cursor];
 if((entry.repeat?s.corrections[s.cursor]:s.answers[entry.questionId])||s.hints.includes(entry.questionId))return state;
 s.hints.push(entry.questionId);s.updatedAt=time;return changed(next);
}
export function answerV3Session(state,{sessionId,question,value,eventId,time,variants=[]}){
 requireValue(validAnswerValue(value),'答案格式不正確');let next=structuredClone(state),s=active(next,sessionId),entry=s.queue[s.cursor];
 requireValue(entry?.questionId===question.id,'畫面已切換，請回答目前題目');
 if(entry.repeat?s.corrections[s.cursor]:s.answers[question.id])return state;
 const exposure=next.v3.kanaHints?.[question.reviewItem]?.lastHintAt;
 if(s.source==='kana-week'&&exposure&&Date.parse(exposure)<=Date.parse(time)&&(Date.parse(exposure)>=Date.parse(s.createdAt)||(Date.parse(studyDay(time))-Date.parse(studyDay(exposure)))/86400000<7)&&!s.hints.includes(question.id))s.hints.push(question.id);
 const a={value:structuredClone(value),correct:gradeQuestion(question,value),hinted:s.hints.includes(question.id)||isLifeSource(s.source)&&lifeCueSeen(next.v3.lifeHints,question.id,s.createdAt,time)||rhythmCueSeen(next.v3.rhythmHints,question,s.createdAt,time)||['kana-duel','kana-bridge','kana-family','kana-row','kana-pocket-listen','kana-contrast'].includes(s.source)&&duelCueSeen(next.v3.kanaHints,question,s.createdAt,time),time};
 if(entry.repeat)s.corrections[s.cursor]=a;
 else{
  s.answers[question.id]=a;
  next=recordAnswer(next,{id:eventId,item:question.reviewItem||question.id,dimension:question.dimension,correct:a.correct,hinted:a.hinted,time,...(!a.correct&&confusedKana(question,value)?{kanaConfusion:confusedKana(question,value)}:{})});s=next.v3.sessions.find(s=>s.id===sessionId);
  if(!a.correct||a.hinted){
   const following=s.queue.length-s.cursor-1;
   const variant=(isLifeSource(s.source)?[]:variants).find(q=>q.conceptId&&q.conceptId===question.conceptId&&q.dimension===question.dimension&&!s.queue.some(entry=>entry.questionId===q.id));
   if(following>=2&&variant)s.queue.splice(s.cursor+3,0,{questionId:variant.id,repeat:true,sourceId:question.id});
   else s.deferred.push(question.id);
  }
 }s.updatedAt=time;return changed(next);
}
export function nextV3Question(state,sessionId,time){
 const next=structuredClone(state),s=active(next,sessionId),entry=s.queue[s.cursor];
 if(!(entry.repeat?s.corrections[s.cursor]:s.answers[entry.questionId]))return state;
 s.cursor++;s.updatedAt=time;if(s.cursor===s.queue.length){s.completedAt=time;for(const plan of next.v3.dailyPlans)for(const step of plan.steps)if(step.sessionId===s.id){step.completedAt=time;plan.updatedAt=time;}}
 return changed(next);
}
export function markDeepStep(state,unitId,index,time){requireValue(Number.isInteger(index)&&index>=0&&index<=5,'未知課程步驟');const next=structuredClone(state);next.v3.lessonSteps[unitId]={...next.v3.lessonSteps[unitId],[index]:time};return changed(next);}
export function saveDailyWriting(state,{planId,id,text,time}){
 requireValue(typeof text==='string'&&text.trim().length>0,'先寫一句自己的日文');const plan=state.v3.dailyPlans.find(p=>p.id===planId);requireValue(plan,'找不到每日安排');
 let next=saveArtifact(state,{id,item:plan.unitId,kind:'text',text:text.trim(),points:[],time});next=completeDailyStep(next,planId,'write',time);delete next.drafts[`text:${plan.id}`];return next;
}
export function saveTextRevision(state,{parentId,id,text,time}){
 const parent=state.artifacts.find(a=>a.id===parentId&&a.kind==='text');requireValue(parent,'找不到原文字作品');requireValue(typeof text==='string'&&text.trim().length>0,'先寫下修改稿');
 const next=saveArtifact(state,{id,item:parent.item,kind:'text',text:text.trim(),points:[],time});next.v3.artifactParents[id]=parentId;return changed(next);
}
export function saveDeepWriting(state,{unitId,questionIds,id,text,time}){
 requireValue(typeof text==='string'&&text.trim().length>0,'先寫自己的日文');
 requireValue(state.v3.sessions.some(s=>s.source==='lesson'&&s.reference===unitId&&s.completedAt&&JSON.stringify(s.questionIds)===JSON.stringify(questionIds)),'先完成本課的變式回想，草稿會保留');
 let next=saveArtifact(state,{id,item:unitId,kind:'text',text:text.trim(),points:[],time});next=markDeepStep(next,unitId,4,time);next=markDeepStep(next,unitId,5,time);delete next.drafts[`text:${unitId}`];return next;
}
export function organizeV3(state,time){
 const cutoff=Date.parse(time)-7*86400000,next=structuredClone(state);
 const removed=new Set(next.v3.dailyPlans.filter(p=>p.steps.every(s=>s.completedAt)&&Date.parse(p.updatedAt)<cutoff).map(p=>p.id));
 next.v3.dailyPlans=next.v3.dailyPlans.filter(p=>!removed.has(p.id));
 const required=new Set(next.v3.dailyPlans.flatMap(p=>p.steps.map(s=>s.sessionId).filter(Boolean)));
 const retainedWeeks=next.v3.sessions.filter(s=>s.source==='kana-week'&&(!s.completedAt||Date.parse(s.updatedAt)>=cutoff||required.has(s.id)));
 for(const session of next.v3.sessions)if(Object.entries(session.answers).some(([id,a])=>extraKanaExposure(id).some(partner=>retainedWeeks.some(w=>Date.parse(a.time)>=Date.parse(w.createdAt)&&(!w.completedAt||Date.parse(a.time)<=Date.parse(w.updatedAt))&&w.questionIds.some(qid=>coachQuestion(qid)?.reviewItem===partner)))))required.add(session.id);
 next.v3.sessions=next.v3.sessions.filter(s=>!s.completedAt||Date.parse(s.updatedAt)>=cutoff||required.has(s.id));
 return JSON.stringify(next)===JSON.stringify(state)?state:changed(next);
}
