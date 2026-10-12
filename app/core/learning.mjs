/** Pure learning state. Recognition, listening and self-rated writing remain separate. */
import {validatePractice} from './study.mjs';
import {validateExamSession} from './exam.mjs';
const dimensions = ['recognition','listening','writing','language','vocabulary','kanji','grammar','reading'];
const intervals = [1,3,7,14,30];
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,80}$/.test(value);
const validTime = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value));
const day = time => new Date(time).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const requireValue = (condition,message='備份格式不正確') => {if(!condition)throw new Error(message);};
export function initialState(){return {schema:2,settings:{dailyMinutes:15,roman:true,ruby:true,fontSize:15},attempts:[],reviews:{},completed:{},artifacts:[],drafts:{},lastLesson:'K01',revision:0,bookmarks:[],practice:null,practiceHistory:[],activeExam:null,examAttempts:[]};}
export function upgradeState(state){
 validateState(state);const next=state.schema===1?{...structuredClone(state),schema:2,bookmarks:[],practice:null,activeExam:null,examAttempts:[]}:structuredClone(state);
 next.practiceHistory??=[];for(const p of [next.practice,...next.practiceHistory].filter(Boolean))p.hints??=[];
 next.reviews={};next.attempts.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id)).forEach(a=>applyReview(next.reviews,a));return validateState(next);
}
function validateAttempt(a){requireValue(plain(a)&&safeId(a.id)&&safeId(a.item)&&dimensions.includes(a.dimension)&&typeof a.correct==='boolean'&&typeof a.hinted==='boolean'&&validTime(a.time),'作答資料不正確');}
function applyReview(reviews,a){
 const key=`${a.item}:${a.dimension}`;
 const previous=reviews[key]||{item:a.item,dimension:a.dimension,correct:0,total:0,independent:0,step:0,due:a.time,lastAdvance:null,history:[]};
 const r={...previous,total:previous.total+1,correct:previous.correct+(a.correct?1:0),independent:previous.independent+(a.correct&&!a.hinted?1:0),history:[...previous.history,{correct:a.correct,hinted:a.hinted,time:a.time}].slice(-10)};
 const success=a.correct&&!a.hinted;
 if(!success){r.step=0;r.due=a.time;r.lastAdvance=null;}
 else if(previous.lastAdvance!==day(a.time)){
  r.step=Math.min(previous.lastAdvance?previous.step+1:0,intervals.length-1);
  r.lastAdvance=day(a.time);r.due=new Date(Date.parse(a.time)+intervals[r.step]*86400000).toISOString();
 }
 reviews[key]=r;
}
export function recordAnswer(state,attempt){
 validateAttempt(attempt);
 if(state.attempts.some(a=>a.id===attempt.id))return state;
 requireValue(state.attempts.length<20000,'作答紀錄已達上限，請先匯出備份');
 const next=structuredClone(state);next.attempts.push({...attempt});applyReview(next.reviews,attempt);next.revision++;
 return next;
}
export function recordAnswers(state,attempts){
 const next=structuredClone(state),ids=new Set(next.attempts.map(a=>a.id));
 for(const attempt of attempts){validateAttempt(attempt);if(ids.has(attempt.id))continue;requireValue(next.attempts.length<20000,'作答紀錄已達上限，請先匯出備份');ids.add(attempt.id);next.attempts.push({...attempt});applyReview(next.reviews,attempt);next.revision++;}
 return next;
}
export function dueReviews(state,now=new Date().toISOString()){
 requireValue(validTime(now),'時間不正確');
 return Object.values(state.reviews).filter(r=>Date.parse(r.due)<=Date.parse(now)).sort((a,b)=>Date.parse(a.due)-Date.parse(b.due));
}
export function mastery(review){
 if(!review)return '未練習';
 if(review.dimension==='writing')return '自評紀錄';
 const entries=review.history;const days=new Set(entries.map(e=>day(e.time)));
 const correct=entries.filter(e=>e.correct&&!e.hinted).length;
 return entries.length>=10&&days.size>=2&&correct/entries.length>=.85?'暫時熟練':'持續練習';
}
export function completeLesson(state,id,time){requireValue(safeId(id)&&validTime(time),'課程紀錄不正確');return {...state,completed:{...state.completed,[id]:state.completed[id]||time},lastLesson:id,revision:state.revision+1};}
function validateArtifact(a){
 requireValue(plain(a)&&safeId(a.id)&&safeId(a.item)&&['text','handwriting'].includes(a.kind)&&validTime(a.time));
 requireValue(typeof a.text==='string'&&a.text.length<=2000&&Array.isArray(a.points)&&a.points.length<=30);
 for(const stroke of a.points){requireValue(Array.isArray(stroke)&&stroke.length<=1000);for(const p of stroke)requireValue(plain(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);}
}
export function saveArtifact(state,artifact){validateArtifact(artifact);requireValue(state.artifacts.length<500,'作品已達 500 件，請先備份再整理');return {...state,artifacts:[...state.artifacts,structuredClone(artifact)],revision:state.revision+1};}
export function validateState(s){
 requireValue(plain(s)&&[1,2].includes(s.schema),'不支援此資料版本');
 const expected=['schema','settings','attempts','reviews','completed','artifacts','drafts','lastLesson','revision',...(s.schema===2?['bookmarks','practice','activeExam','examAttempts']:[])];
 requireValue(Object.keys(s).every(k=>expected.includes(k)||(s.schema===2&&k==='practiceHistory'))&&expected.every(k=>Object.hasOwn(s,k)));
 requireValue(plain(s.settings)&&[5,15,30].includes(s.settings.dailyMinutes)&&typeof s.settings.roman==='boolean'&&typeof s.settings.ruby==='boolean'&&[15,17,19].includes(s.settings.fontSize));
 requireValue(Array.isArray(s.attempts)&&s.attempts.length<=20000&&Array.isArray(s.artifacts)&&s.artifacts.length<=500);
 const ids=new Set();for(const a of s.attempts){validateAttempt(a);requireValue(!ids.has(a.id),'備份含重複作答');ids.add(a.id);}
 requireValue(plain(s.reviews)&&plain(s.completed)&&plain(s.drafts)&&safeId(s.lastLesson)&&Number.isSafeInteger(s.revision)&&s.revision>=0);
 for(const [key,r] of Object.entries(s.reviews)){
  requireValue(safeId(key)&&plain(r)&&safeId(r.item)&&dimensions.includes(r.dimension)&&key===`${r.item}:${r.dimension}`&&validTime(r.due));
  for(const field of ['correct','total','independent','step'])requireValue(Number.isSafeInteger(r[field])&&r[field]>=0);
  requireValue(r.step<intervals.length&&r.correct<=r.total&&r.independent<=r.correct);
  requireValue(Array.isArray(r.history)&&r.history.length<=10&&r.history.every(h=>typeof h.correct==='boolean'&&typeof h.hinted==='boolean'&&validTime(h.time))&&(r.lastAdvance===null||/^\d{4}-\d\d-\d\d$/.test(r.lastAdvance)));
 }
 for(const [id,t] of Object.entries(s.completed))requireValue(safeId(id)&&validTime(t));
 for(const [id,d] of Object.entries(s.drafts)){requireValue(safeId(id)&&plain(d)&&typeof d.text==='string'&&d.text.length<=2000&&validTime(d.time));validateArtifact({id:'draft',item:id,kind:'handwriting',text:d.text,points:d.points||[],time:d.time});}
 s.artifacts.forEach(validateArtifact);
 if(s.schema===2){
  requireValue(Array.isArray(s.bookmarks)&&s.bookmarks.length<=10000&&s.bookmarks.every(safeId)&&new Set(s.bookmarks).size===s.bookmarks.length);
  validatePractice(s.practice);validateExamSession(s.activeExam);
  requireValue(s.practiceHistory===undefined||(Array.isArray(s.practiceHistory)&&s.practiceHistory.length<=100&&new Set(s.practiceHistory.map(p=>p.id)).size===s.practiceHistory.length));
  (s.practiceHistory||[]).forEach(p=>{requireValue(p!==null&&p.id!==s.practice?.id);validatePractice(p);});
  requireValue(Array.isArray(s.examAttempts)&&s.examAttempts.length<=100&&new Set(s.examAttempts.map(x=>x.id)).size===s.examAttempts.length);
  s.examAttempts.forEach(exam=>{validateExamSession(exam);requireValue(exam.status!=='active');});
 }
 return s;
}
export function exportBackup(state){const upgraded=upgradeState(state);return JSON.stringify({format:'hiyori-backup',version:2,exportedAt:new Date().toISOString(),state:upgraded},null,2);}
export function parseBackup(text){
 requireValue(typeof text==='string'&&new TextEncoder().encode(text).length<=12*1024*1024,'備份超過 12 MB');
 const backup=JSON.parse(text,(key,value)=>{requireValue(!['__proto__','constructor','prototype'].includes(key),'備份含不安全欄位');return value;});
 requireValue(plain(backup)&&backup.format==='hiyori-backup'&&[1,2].includes(backup.version)&&backup.state?.schema===backup.version,'不支援的備份版本');
 return upgradeState(backup.state);
}
export function mergeStates(current,incoming){
 current=upgradeState(current);incoming=upgradeState(incoming);
 const next=structuredClone(current);const map=new Map(current.attempts.map(a=>[a.id,a]));
 if(current.revision===0&&!current.attempts.length&&!current.artifacts.length&&!Object.keys(current.completed).length&&!Object.keys(current.drafts).length){next.settings=structuredClone(incoming.settings);next.lastLesson=incoming.lastLesson;}
 for(const a of incoming.attempts){if(map.has(a.id))requireValue(JSON.stringify(map.get(a.id))===JSON.stringify(a),'同一作答 ID 的內容衝突');else map.set(a.id,a);}
 next.attempts=[...map.values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.id.localeCompare(b.id));
 next.reviews={};next.attempts.forEach(a=>applyReview(next.reviews,a));
 for(const [id,t] of Object.entries(incoming.completed))if(!next.completed[id]||t<next.completed[id])next.completed[id]=t;
 const artifacts=new Map(next.artifacts.map(a=>[a.id,a]));
 for(const a of incoming.artifacts){if(!artifacts.has(a.id))artifacts.set(a.id,a);else requireValue(JSON.stringify(artifacts.get(a.id))===JSON.stringify(a),'作品 ID 衝突，未匯入');}
 next.artifacts=[...artifacts.values()];
 for(const [id,d] of Object.entries(incoming.drafts))if(!next.drafts[id]||d.time>next.drafts[id].time)next.drafts[id]=d;
 next.bookmarks=[...new Set([...next.bookmarks,...incoming.bookmarks])];
 const exams=new Map(next.examAttempts.map(a=>[a.id,a]));
 for(const exam of incoming.examAttempts){if(exams.has(exam.id))requireValue(JSON.stringify(exams.get(exam.id))===JSON.stringify(exam),'模擬紀錄 ID 衝突');else exams.set(exam.id,exam);}
 next.examAttempts=[...exams.values()];
 const practices=new Map();
 for(const p of [next.practice,...next.practiceHistory,incoming.practice,...incoming.practiceHistory].filter(Boolean)){
  const prior=practices.get(p.id);if(!prior){practices.set(p.id,structuredClone(p));continue;}
  requireValue(prior.unitId===p.unitId&&JSON.stringify(prior.questionIds)===JSON.stringify(p.questionIds),'練習 ID 衝突');
  for(const [qid,a] of Object.entries(p.answers)){if(prior.answers[qid])requireValue(JSON.stringify(prior.answers[qid])===JSON.stringify(a),'練習答案衝突');else prior.answers[qid]=a;}
  prior.hints=[...new Set([...prior.hints,...p.hints])];prior.index=Math.max(prior.index,p.index);prior.updatedAt=prior.updatedAt>p.updatedAt?prior.updatedAt:p.updatedAt;
 }
 const active=p=>p&&p.index<p.questionIds.length;
 const preferred=active(next.practice)?next.practice:active(incoming.practice)?incoming.practice:next.practice||incoming.practice;
 next.practice=preferred?practices.get(preferred.id):null;next.practiceHistory=[...practices.values()].filter(p=>p.id!==next.practice?.id);
 if(next.activeExam&&incoming.activeExam&&next.activeExam.id!==incoming.activeExam.id)throw new Error('兩份備份有不同進行中模擬，請先完成本機模擬再匯入。');
 if(next.activeExam&&incoming.activeExam){
  const local=next.activeExam,other=incoming.activeExam;
  for(const key of ['formId','mode','startedAt','sectionSeconds','questionIds'])requireValue(JSON.stringify(local[key])===JSON.stringify(other[key]),'同一模擬的設定衝突，未匯入');
  if(local.sectionIndex===other.sectionIndex)requireValue(local.sectionStartedAt===other.sectionStartedAt&&local.sectionEndsAt===other.sectionEndsAt,'同一模擬的期限衝突，未匯入');
  const selected=structuredClone(local.sectionIndex>=other.sectionIndex?local:other),answers={...local.answers};
  if(local.sectionIndex!==other.sectionIndex){const earlier=local.sectionIndex<other.sectionIndex?local:other;for(const [qid,a] of Object.entries(earlier.answers))requireValue(JSON.stringify(selected.answers[qid])===JSON.stringify(a),'模擬已跨考區，兩份首答紀錄不同，未匯入');}
  for(const [qid,a] of Object.entries(other.answers)){if(answers[qid])requireValue(JSON.stringify(answers[qid])===JSON.stringify(a),'模擬答案 ID 衝突，未匯入');else answers[qid]=a;}
  selected.answers=answers;next.activeExam=selected;
 }
 if(!next.activeExam&&incoming.activeExam&&!next.examAttempts.some(a=>a.id===incoming.activeExam.id))next.activeExam=structuredClone(incoming.activeExam);
 const terminal=next.examAttempts.find(a=>a.id===next.activeExam?.id);
 if(terminal){for(const [qid,a] of Object.entries(next.activeExam.answers))requireValue(JSON.stringify(terminal.answers[qid])===JSON.stringify(a),'完成與續考答案衝突，未匯入');next.activeExam=null;}
 if(JSON.stringify({...next,revision:0})!==JSON.stringify({...current,revision:0}))next.revision=Math.max(current.revision,incoming.revision)+1;
 return validateState(next);
}
export function organizeCompletedPractice(state){
 return {...state,practice:state.practice?.index>=state.practice?.questionIds.length?null:state.practice,practiceHistory:state.practiceHistory.filter(p=>p.index<p.questionIds.length),revision:state.revision+1};
}
