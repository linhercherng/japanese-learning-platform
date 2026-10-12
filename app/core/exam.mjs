import {gradeQuestion,validAnswerValue} from './study.mjs';
const requireValue=(ok,message='模擬資料不正確')=>{if(!ok)throw new Error(message);};
const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const safeId=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,80}$/.test(value);
const iso=n=>new Date(n).toISOString();
export function startExam(form,{id,mode='full',time,seen=[]}){
 requireValue(safeId(id)&&validTime(time)&&['full','short'].includes(mode)&&Array.isArray(form.sections)&&form.sections.length===3);
 const questionIds=form.sections.map((section,i)=>section.questions.slice(0,mode==='short'?[5,10,5][i]:section.questions.length).map(q=>q.id));
 const all=questionIds.flat();requireValue(new Set(all).size===all.length&&all.every(safeId)&&questionIds.every(ids=>ids.length));
 const sectionSeconds=form.sections.map(section=>mode==='short'?300:section.minutes*60);
 const session={id,formId:form.id,mode,status:'active',sectionIndex:0,sectionStartedAt:time,sectionEndsAt:iso(Date.parse(time)+sectionSeconds[0]*1000),sectionSeconds,questionIds,answers:{},startedAt:time,finishedAt:null,seen:seen.filter(x=>all.includes(x))};
 return validateExamSession(session);
}
export function validateExamSession(s){
 if(s===null)return s;
 requireValue(s&&safeId(s.id)&&safeId(s.formId)&&['full','short'].includes(s.mode)&&['active','completed','abandoned'].includes(s.status));
 const expected=['id','formId','mode','status','sectionIndex','sectionStartedAt','sectionEndsAt','sectionSeconds','questionIds','answers','startedAt','finishedAt','seen'];
 requireValue(Object.keys(s).length===expected.length&&Object.keys(s).every(k=>expected.includes(k)));
 requireValue(Number.isInteger(s.sectionIndex)&&s.sectionIndex>=0&&s.sectionIndex<=3&&validTime(s.startedAt)&&validTime(s.sectionStartedAt)&&validTime(s.sectionEndsAt)&&Date.parse(s.sectionEndsAt)>=Date.parse(s.sectionStartedAt));
 requireValue(Array.isArray(s.sectionSeconds)&&s.sectionSeconds.length===3&&s.sectionSeconds.every(n=>Number.isInteger(n)&&n>0&&n<=7200));
 requireValue(Array.isArray(s.questionIds)&&s.questionIds.length===3&&s.questionIds.every(ids=>Array.isArray(ids)&&ids.length>0&&ids.length<=100&&ids.every(safeId)));
 const all=s.questionIds.flat();requireValue(new Set(all).size===all.length&&Array.isArray(s.seen)&&s.seen.every(x=>all.includes(x))&&new Set(s.seen).size===s.seen.length);
 requireValue(s.answers&&typeof s.answers==='object'&&!Array.isArray(s.answers));
 for(const [key,a] of Object.entries(s.answers))requireValue(all.includes(key)&&a&&validAnswerValue(a.value)&&validTime(a.time)&&Object.keys(a).length===2);
 requireValue(s.status==='active'?s.finishedAt===null&&s.sectionIndex<3:validTime(s.finishedAt));return s;
}
export function remainingSeconds(session,time){return Math.max(0,Math.ceil((Date.parse(session.sectionEndsAt)-Date.parse(time))/1000));}
export function answerExam(session,form,questionId,value,time){
 validateExamSession(session);requireValue(validTime(time)&&session.status==='active','模擬已結束');requireValue(remainingSeconds(session,time)>0,'這一區的時間已到，請接續下一區');
 requireValue(session.formId===form.id&&session.questionIds[session.sectionIndex].includes(questionId)&&validAnswerValue(value),'這题不屬於目前考區');
 if(session.answers[questionId])return session;
 return {...session,answers:{...session.answers,[questionId]:{value:structuredClone(value),time}}};
}
export function advanceExam(session,form,time,{submit=false,abandon=false}={}){
 validateExamSession(session);requireValue(validTime(time)&&session.formId===form.id);
 if(session.status!=='active')return session;
 if(abandon)return {...session,status:'abandoned',finishedAt:time};
 let next={...session};let manual=submit;
 while(next.status==='active'&&(manual||remainingSeconds(next,time)===0)){
  const ended=manual?time:next.sectionEndsAt;manual=false;next.sectionIndex++;
  if(next.sectionIndex===3){next.status='completed';next.finishedAt=ended;break;}
  next.sectionStartedAt=ended;next.sectionEndsAt=iso(Date.parse(ended)+next.sectionSeconds[next.sectionIndex]*1000);
 }
 return next;
}
export function examReport(session,form){
 const questions=session.questionIds.flat().map(id=>form.sections.flatMap(s=>s.questions).find(q=>q.id===id));requireValue(questions.every(Boolean));
 const sections=form.sections.map((section,i)=>{const qs=questions.filter(q=>session.questionIds[i].includes(q.id));return {id:section.id,title:section.title,total:qs.length,answered:qs.filter(q=>session.answers[q.id]).length,correct:qs.filter(q=>session.answers[q.id]&&gradeQuestion(q,session.answers[q.id].value)).length};});
 const total=questions.length,correct=sections.reduce((n,s)=>n+s.correct,0),answered=Object.keys(session.answers).length;
 return {total,correct,answered,unanswered:total-answered,seen:session.seen.length,percent:Math.round(correct/total*100),sections};
}
