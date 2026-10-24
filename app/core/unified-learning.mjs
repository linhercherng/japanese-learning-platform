import {kana} from '../content/kana.mjs';
import {lifeQuestionUnits,isLifeSource} from '../content/life-memory-ids.mjs';
import {jlptQuestionUnits,jlptUnitMeta,isJlptSource,jlptSessionLevel} from '../content/jlpt-memory-ids.mjs';
import {resolveLearningQuestion} from '../content/catalog.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {studyDay} from './v3-state.mjs';
import {parseDictation} from './kana-studio-state.mjs';
import {kanaNextStep} from './kana-next.mjs';
import {lifeNextStep} from './life-progress.mjs';
import {jlptNextStep} from './jlpt-memory.mjs';
import {memoryEvidence} from './memory-evidence.mjs';
import {dailyMemory,dailyMemoryReason} from './daily-memory.mjs';

export const learningTracks=[['K','五十音','kana-path'],['L','生活日語','life-path'],...['N5','N4','N3','N2'].map(g=>[g,g+' 檢定課程','jlpt-path/'+g])];
const kanaIds=new Set(kana.map(k=>k.id));
const stamp=t=>Date.parse(t)||0;
const latest=(a,b)=>stamp(b.time)-stamp(a.time)||a.route.localeCompare(b.route);
function sessionGoal(state,s){
 if(isJlptSource(s.source))return jlptSessionLevel(s);
 if(isLifeSource(s.source))return 'L';
 if(s.source==='kana'||s.source.startsWith('kana-')||s.source==='confusion')return 'K';
 return state.v3.dailyPlans.find(p=>p.id===s.reference)?.goal||resolveLearningQuestion(s.questionIds[0])?.level||'K';
}
const started=p=>p.steps.some(s=>s.startedAt||s.completedAt||s.sessionId);
const unfinished=p=>p.steps.some(s=>!s.completedAt);

/** Existing unfinished work is protected even when the device clock has moved backwards. */
export function learningPending(state,time,quiz=null){
 const rows=[];
 if(state.activeExam)rows.push({goal:null,kind:'pending',route:'exam-session',title:'先接續原來的模擬考',detail:'原作答與計時保留，先回到這份模擬。',priority:0,time});
 if(quiz?.questions?.length&&quiz.index<quiz.questions.length)rows.push({goal:'K',kind:'pending',route:'quiz',title:'接續目前的五十音回想',detail:'這個分頁的原題與已提交答案仍在；重新整理前先完成這輪。',priority:1,time});
 const p=state.practice;
 if(p&&p.index<p.questionIds.length)rows.push({goal:jlptUnitMeta.get(p.unitId)?.level||(p.unitId.startsWith('L')||p.unitId.startsWith('S-')?'L':null),kind:'pending',route:'practice',title:'接續原來的課內練習',detail:'原題、第一個答案與草稿保持，先完成這一輪。',priority:2,time:p.updatedAt});
 for(const s of state.v3.sessions)if(!s.completedAt)rows.push({goal:sessionGoal(state,s),kind:'pending',route:'v3-practice/'+s.id,title:'接續已保存的一小輪',detail:'原輪次、題序、首答與提示保持，不重新開題。',priority:2,time:s.updatedAt});
 for(const [key,draft] of Object.entries(state.drafts))if(key.startsWith('write:KS-')){const m=parseDictation(key,draft);if(!state.attempts.some(a=>a.id==='ksw-'+m.id))rows.push({goal:'K',kind:'pending',route:'kana-dictation/'+m.item,title:'接續原來的聽音默寫',detail:'原字跡保留；接著書寫或對照自評，與客觀作答分開。',priority:3,time:draft.time});}
 for(const p of state.v3.dailyPlans)if(unfinished(p)&&started(p))rows.push({goal:p.goal,kind:'pending',route:'daily/'+p.id,title:'接續已開始的每日安排',detail:'保留原活動與作品，從中斷處往下走。',priority:4,time:p.updatedAt});
 return rows.sort((a,b)=>a.priority-b.priority||latest(a,b));
}
function visibleState(state,time){
 const before=t=>stamp(t)<=stamp(time),attempts=state.attempts.filter(a=>before(a.time));
 return {...state,attempts,reviews:recordAnswers(initialState(),attempts).reviews,v3:{...state.v3,sessions:state.v3.sessions.filter(s=>before(s.createdAt)&&before(s.updatedAt)&&(!s.completedAt||before(s.completedAt)))}};
}
function progress(state,goal){
 const rows=state.attempts.filter(a=>goal==='K'?kanaIds.has(a.item)&&['recognition','listening','language'].includes(a.dimension):goal==='L'?lifeQuestionUnits.has(a.item)&&resolveLearningQuestion(a.item)?.dimension===a.dimension:jlptUnitMeta.get(jlptQuestionUnits.get(a.item))?.level===goal&&resolveLearningQuestion(a.item)?.dimension===a.dimension);
 return {practiced:new Set(rows.map(a=>a.item)).size,lastAt:rows.length?rows.reduce((last,a)=>stamp(a.time)>stamp(last)?a.time:last,rows[0].time):null};
}
function completedToday(state,time,quiz){
 const before=t=>stamp(t)<=stamp(time),day=studyDay(time),rows=[];
 if(quiz?.started&&quiz.questions?.length&&quiz.index===quiz.questions.length&&quiz.results?.length===quiz.questions.length){
  const answers=quiz.questions.map((q,i)=>state.attempts.find(a=>a.id===quiz.started+'-'+i&&a.item===q.item&&a.dimension===q.dimension&&a.correct===quiz.results[i].correct&&a.hinted===quiz.results[i].hinted&&before(a.time)));
  if(answers.every(Boolean)){const last=answers.map(a=>a.time).sort((a,b)=>stamp(b)-stamp(a))[0];if(studyDay(last)===day)rows.push({goal:'K',route:'quiz',time:last});}
 }
 for(const s of state.v3.sessions)if(s.completedAt&&Object.keys(s.answers).length&&before(s.createdAt)&&before(s.completedAt)&&Object.values(s.answers).every(a=>before(a.time))&&studyDay(s.completedAt)===day)rows.push({goal:sessionGoal(state,s),route:'v3-practice/'+s.id,time:s.completedAt});
 for(const p of [state.practice,...state.practiceHistory||[]].filter(Boolean))if(p.index===p.questionIds.length&&p.questionIds.every(id=>p.answers[id])&&before(p.updatedAt)&&Object.values(p.answers).every(a=>before(a.time))&&studyDay(p.updatedAt)===day)rows.push({goal:jlptUnitMeta.get(p.unitId)?.level||(p.unitId.startsWith('L')||p.unitId.startsWith('S-')?'L':null),route:p.id===state.practice?.id?'practice':'practice-hub',time:p.updatedAt});
 for(const p of state.v3.dailyPlans)if(!unfinished(p)&&p.steps.every(s=>before(s.completedAt))){const last=p.steps.map(s=>s.completedAt).sort((a,b)=>stamp(b)-stamp(a))[0];if(studyDay(last)===day)rows.push({goal:p.goal,route:'daily/'+p.id,time:last});}
 return rows.sort(latest)[0]||null;
}
/** A read-only recommendation, never a new schedule, question, answer, or mastery claim. */
export function unifiedLearning(state,time,quiz=null,evidence=memoryEvidence(state,time)){
 const snapshot=visibleState(state,time),pending=learningPending(state,time,quiz),finishedToday=completedToday(state,time,quiz),goal=state.v3.goal;
 const tracks=learningTracks.map(([id,label,route])=>{
  const step=id==='K'?kanaNextStep(snapshot,time):id==='L'?lifeNextStep(snapshot,time):jlptNextStep(snapshot,id,time),kind=['done','finish'].includes(step.kind)?'rest':['resume','pending'].includes(step.kind)?'pending':step.kind;
  const memory=dailyMemory(state,id,time,{evidence}),review=['week','check','repair'].includes(memory.mode),waiting=['wait','clock'].includes(memory.mode),replacement=review||waiting;
  return {goal:id,label,overview:route,kind:replacement?memory.mode==='clock'?'wait':memory.mode:['week','check','repair'].includes(kind)?'rest':kind,route:review?'today-review/'+id+':'+memory.mode:waiting?memory.conflict?.route||'weaknesses/'+id+':all:1':step.route||(id==='L'?'life-map':route),title:review?(memory.mode==='week'?'隔了七天，收起線索再想一次':memory.mode==='check'?'隔一段時間，再自己想一次':'先補強最需要幫忙的原題'):waiting?memory.conflict?'先確認裝置日期與原輪時間':'依記憶結果，留到下次再確認':step.title,detail:replacement?dailyMemoryReason(memory):step.detail||step.reason,...progress(snapshot,id),questions:review?memory.questionIds.length:0,memory};
 });
 const ranks={week:0,check:1,repair:2,pocket:3};
 const review=tracks.filter(t=>Object.hasOwn(ranks,t.kind)).sort((a,b)=>ranks[a.kind]-ranks[b.kind]||(b.memory?.priority||0)-(a.memory?.priority||0)||Number(b.goal===goal)-Number(a.goal===goal)||stamp(a.lastAt)-stamp(b.lastAt)||learningTracks.findIndex(x=>x[0]===a.goal)-learningTracks.findIndex(x=>x[0]===b.goal));
 let main=pending[0]|| (finishedToday?{...finishedToday,kind:'rest',title:'今天已完成一小輪，可以先休息。',detail:'原結果已保存；明天再回首頁，依新日期確認記憶。今天答對不代表已長期記住。'}:review[0]||tracks.find(t=>t.goal===goal));
 main={...main,label:learningTracks.find(t=>t[0]===main.goal)?.[1]||'接續原活動',memory:main.memory||tracks.find(t=>t.goal===main.goal)?.memory};
 const legacyPlans=state.v3.dailyPlans.filter(p=>unfinished(p)&&stamp(p.createdAt)<=stamp(time)).map(p=>({route:'daily/'+p.id,goal:p.goal,day:p.day,completed:p.steps.filter(s=>s.completedAt&&stamp(s.completedAt)<=stamp(time)).length,total:p.steps.length})).sort((a,b)=>b.day.localeCompare(a.day)||a.route.localeCompare(b.route));
 return {day:studyDay(time),goal,minutes:state.settings.dailyMinutes,main,tracks,pending,finishedToday,legacyPlans};
}
