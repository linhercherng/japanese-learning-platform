const validId=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,80}$/.test(value);
const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const requireValue=(ok,message='練習資料不正確')=>{if(!ok)throw new Error(message);};
const normalized=value=>String(value).normalize('NFKC').trim().replace(/\s+/g,'');
export function presentationOrder(length,seed){
 let hash=2166136261;for(const char of String(seed))hash=Math.imul(hash^char.codePointAt(0),16777619);
 const order=Array.from({length},(_,i)=>i);
 for(let i=length-1;i>0;i--){hash=(Math.imul(hash,1664525)+1013904223)>>>0;const j=Math.floor(hash/4294967296*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 return order;
}
export function gradeQuestion(question,value){
 if(['choice','listen'].includes(question.kind))return Number.isInteger(value)&&value===question.correct&&value>=0&&value<question.options.length;
 if(question.kind==='cloze')return typeof value==='string'&&question.accepted.some(answer=>normalized(answer)===normalized(value));
 if(question.kind==='order'){
  if(!Array.isArray(value)||value.length!==question.tokens.length||new Set(value).size!==value.length||value.some(i=>!Number.isInteger(i)||i<0||i>=question.tokens.length))return false;
  return normalized(value.map(i=>question.tokens[i]).join(''))===normalized(question.answerOrder.map(i=>question.tokens[i]).join(''));
 }
 return false;
}
export function questionAnswer(q){return q.kind==='cloze'?q.accepted.join('／'):q.kind==='order'?q.answerOrder.map(i=>q.tokens[i]).join(''):q.options[q.correct];}
export function createPractice({id,unitId,questionIds,time}){
 requireValue(validId(id)&&validId(unitId)&&validTime(time)&&Array.isArray(questionIds)&&questionIds.length>0&&questionIds.length<=200&&questionIds.every(validId)&&new Set(questionIds).size===questionIds.length);
 return {id,unitId,questionIds:[...questionIds],index:0,answers:{},hints:[],startedAt:time,updatedAt:time};
}
export function validatePractice(p){
 if(p===null)return p;
 requireValue(p&&Object.keys(p).every(k=>['id','unitId','questionIds','index','answers','hints','startedAt','updatedAt'].includes(k)));
 createPractice({id:p.id,unitId:p.unitId,questionIds:p.questionIds,time:p.startedAt});
 requireValue(validTime(p.updatedAt)&&Number.isInteger(p.index)&&p.index>=0&&p.index<=p.questionIds.length&&p.answers&&typeof p.answers==='object'&&!Array.isArray(p.answers));
 requireValue(p.hints===undefined||(Array.isArray(p.hints)&&new Set(p.hints).size===p.hints.length&&p.hints.every(id=>p.questionIds.includes(id))));
 for(const [key,a] of Object.entries(p.answers))requireValue(p.questionIds.includes(key)&&a&&typeof a.correct==='boolean'&&typeof a.hinted==='boolean'&&validTime(a.time)&&validAnswerValue(a.value)&&Object.keys(a).every(k=>['value','correct','hinted','time'].includes(k)));
 return p;
}
export function validAnswerValue(value){return (typeof value==='string'&&value.length<=2000)||(Number.isInteger(value)&&value>=0&&value<100)||(Array.isArray(value)&&value.length<=60&&value.every(n=>Number.isInteger(n)&&n>=0&&n<60));}
export function hintPractice(practice,questionId,time){
 validatePractice(practice);requireValue(practice.questionIds.includes(questionId)&&validTime(time));
 if(practice.answers[questionId]||(practice.hints||[]).includes(questionId))return practice;
 return {...practice,hints:[...(practice.hints||[]),questionId],updatedAt:time};
}
export function answerPractice(practice,question,value,{time,hinted=false}={}){
 validatePractice(practice);requireValue(practice.questionIds.includes(question.id)&&validTime(time)&&validAnswerValue(value),'這題不屬於目前練習');
 if(practice.answers[question.id])return practice;
 return {...practice,answers:{...practice.answers,[question.id]:{value:structuredClone(value),correct:gradeQuestion(question,value),hinted:Boolean(hinted)||(practice.hints||[]).includes(question.id),time}},updatedAt:time};
}
export function practiceReport(practice){const answers=Object.values(practice.answers);return {total:practice.questionIds.length,answered:answers.length,correct:answers.filter(a=>a.correct&&!a.hinted).length,hinted:answers.filter(a=>a.hinted).length};}
