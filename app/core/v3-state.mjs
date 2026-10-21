import {validateHintRecords,mergeHintRecords,validateKanaNotes,mergeKanaNotes} from './kana-studio-state.mjs';
import {validAnswerValue} from './study.mjs';
export const learningGoals=['K','L','N5','N4','N3','N2'];
export const studyDay=time=>new Date(time).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
export const initialV3=()=>({goal:'K',dailyPlans:[],sessions:[],lessonSteps:{},artifactParents:{}});
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const safe=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,80}$/.test(x);
const time=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT/.test(x)&&Number.isFinite(Date.parse(x));
const requireValue=(x,message='第三版資料格式不正確')=>{if(!x)throw new Error(message);};
function shape(x,keys){requireValue(plain(x)&&keys.every(k=>Object.hasOwn(x,k))&&Object.keys(x).every(k=>keys.includes(k)));}
const uniqueIds=items=>Array.isArray(items)&&items.every(safe)&&new Set(items).size===items.length;
function answer(a){shape(a,['value','correct','hinted','time']);requireValue(validAnswerValue(a.value)&&typeof a.correct==='boolean'&&typeof a.hinted==='boolean'&&time(a.time));}
export function validateSession(s){
 shape(s,['id','source','reference','questionIds','queue','cursor','answers','hints','corrections','deferred','createdAt','updatedAt','completedAt']);
 requireValue(safe(s.id)&&['daily','concept','lesson','confusion','kana','kana-check','kana-confusion','kana-map','kana-words','kana-mini','kana-build'].includes(s.source)&&safe(s.reference)&&uniqueIds(s.questionIds)&&s.questionIds.length>0&&s.questionIds.length<=60);
 requireValue(Array.isArray(s.queue)&&s.queue.length<=120&&s.queue.length>=s.questionIds.length&&Number.isInteger(s.cursor)&&s.cursor>=0&&s.cursor<=s.queue.length);
 const original=[];
 for(const q of s.queue){shape(q,['questionId','repeat','sourceId']);requireValue(safe(q.questionId)&&typeof q.repeat==='boolean'&&(q.repeat?s.questionIds.includes(q.sourceId):q.sourceId===null));if(!q.repeat)original.push(q.questionId);}
 requireValue(JSON.stringify(original)===JSON.stringify(s.questionIds)&&plain(s.answers)&&uniqueIds(s.hints)&&s.hints.every(id=>s.queue.some(q=>q.questionId===id)));
 for(const [id,a] of Object.entries(s.answers)){requireValue(s.questionIds.includes(id));answer(a);}
 requireValue(plain(s.corrections)&&uniqueIds(s.deferred)&&s.deferred.every(id=>s.questionIds.includes(id)));
 const repeated=new Set();
 s.queue.forEach((q,index)=>{if(!q.repeat)return;const source=s.queue.findIndex(x=>!x.repeat&&x.questionId===q.sourceId),first=s.answers[q.sourceId];requireValue(!repeated.has(q.sourceId)&&index-source>=3&&first&&(!first.correct||first.hinted),'訂正需隔兩題且每題最多一次');repeated.add(q.sourceId);});
 for(const [key,a] of Object.entries(s.corrections)){requireValue(/^\d+$/.test(key)&&s.queue[Number(key)]?.repeat);answer(a);}
 for(let i=0;i<s.cursor;i++)requireValue(s.queue[i].repeat?Boolean(s.corrections[i]):Boolean(s.answers[s.queue[i].questionId]),'回想中斷點超過已保存答案');
 requireValue(time(s.createdAt)&&time(s.updatedAt)&&(s.completedAt===null?s.cursor<s.queue.length:time(s.completedAt)&&s.cursor===s.queue.length));
 return s;
}
export function validateDailyPlan(p){
 shape(p,['id','day','minutes','goal','unitId','conceptIds','newConceptIds','newCount','dueTotal','remainingDue','reason','steps','createdAt','updatedAt']);
 requireValue(safe(p.id)&&/^\d{4}-\d\d-\d\d$/.test(p.day)&&[5,15,30].includes(p.minutes)&&learningGoals.includes(p.goal)&&safe(p.unitId)&&uniqueIds(p.conceptIds));
 for(const key of ['newCount','dueTotal','remainingDue'])requireValue(Number.isInteger(p[key])&&p[key]>=0&&p[key]<=20000);
 requireValue(p.remainingDue<=p.dueTotal&&typeof p.reason==='string'&&p.reason.length<=600&&Array.isArray(p.steps)&&p.steps.length>=2&&p.steps.length<=5&&new Set(p.steps.map(s=>s.id)).size===p.steps.length);
 requireValue(uniqueIds(p.newConceptIds)&&p.newConceptIds.every(id=>p.conceptIds.includes(id))&&p.newCount===p.newConceptIds.length);
 for(const s of p.steps){shape(s,['id','kind','title','questionIds','sessionId','startedAt','completedAt']);requireValue(safe(s.id)&&['practice','learn','write'].includes(s.kind)&&typeof s.title==='string'&&s.title.length<=100&&uniqueIds(s.questionIds)&&s.questionIds.length<=60&&(s.sessionId===null||safe(s.sessionId))&&(s.startedAt===null||time(s.startedAt))&&(s.completedAt===null||time(s.completedAt)));}
 requireValue(time(p.createdAt)&&time(p.updatedAt));return p;
}
export function validateV3(v,artifacts=[]){
 shape(v,['goal','dailyPlans','sessions','lessonSteps','artifactParents',...(Object.hasOwn(v,'kanaHints')?['kanaHints']:[]),...(Object.hasOwn(v,'kanaNotes')?['kanaNotes']:[])]);if(Object.hasOwn(v,'kanaHints'))validateHintRecords(v.kanaHints);if(Object.hasOwn(v,'kanaNotes'))validateKanaNotes(v.kanaNotes);requireValue(learningGoals.includes(v.goal));
 requireValue(Array.isArray(v.dailyPlans)&&v.dailyPlans.length<=60&&new Set(v.dailyPlans.map(p=>p.id)).size===v.dailyPlans.length);
 requireValue(Array.isArray(v.sessions)&&v.sessions.length<=500&&new Set(v.sessions.map(s=>s.id)).size===v.sessions.length);
 v.dailyPlans.forEach(validateDailyPlan);v.sessions.forEach(validateSession);
 const checks=v.sessions.filter(s=>s.source==='kana-check');requireValue(new Set(checks.map(s=>s.reference)).size===checks.length,'同日隔天檢查有不同輪次，請保留備份並先完成目前輪次。');
 for(const p of v.dailyPlans)for(const step of p.steps)if(step.sessionId!==null)requireValue(v.sessions.some(s=>s.id===step.sessionId&&s.source==='daily'&&s.reference===p.id&&JSON.stringify(s.questionIds)===JSON.stringify(step.questionIds)),'每日安排與回想輪次不一致');
 for(const s of v.sessions)if(s.source==='daily'&&!s.completedAt)requireValue(v.dailyPlans.some(p=>p.id===s.reference&&p.steps.some(step=>step.sessionId===s.id&&JSON.stringify(step.questionIds)===JSON.stringify(s.questionIds))),'未完成的每日回想缺少安排');
 requireValue(plain(v.lessonSteps)&&plain(v.artifactParents));
 for(const [id,steps] of Object.entries(v.lessonSteps)){requireValue(safe(id)&&plain(steps)&&Object.keys(steps).every(k=>/^[0-5]$/.test(k))&&Object.values(steps).every(time));}
 const ids=new Set(artifacts.map(a=>a.id));
 for(const [child,parent] of Object.entries(v.artifactParents)){const c=artifacts.find(a=>a.id===child),p=artifacts.find(a=>a.id===parent);requireValue(safe(child)&&safe(parent)&&child!==parent&&ids.has(child)&&p&&c.kind==='text'&&p.kind==='text'&&c.item===p.item,'修訂稿缺少同一任務的原稿');const seen=new Set([child]);let next=parent;while(next){requireValue(!seen.has(next),'作品修訂關係循環');seen.add(next);next=v.artifactParents[next];}}
 return v;
}
function mergeSession(a,b){
 for(const key of ['source','reference','questionIds','createdAt'])requireValue(JSON.stringify(a[key])===JSON.stringify(b[key]),'第三版回想設定衝突，未匯入');
 for(const [id,value] of Object.entries(b.answers))if(a.answers[id])requireValue(JSON.stringify(value)===JSON.stringify(a.answers[id]),'第三版首次答案衝突，未匯入');
 const richer=Object.keys(a.answers).length>=Object.keys(b.answers).length?a:b,other=richer===a?b:a;
 if(JSON.stringify(a.queue)!==JSON.stringify(b.queue)){
  const projection=richer.queue.filter(q=>!q.repeat||Object.hasOwn(other.answers,q.sourceId));
  requireValue(Object.keys(other.answers).every(id=>richer.answers[id])&&JSON.stringify(projection)===JSON.stringify(other.queue),'第三版重練分支衝突，未匯入');
 }
 for(const [answered,pending] of [[a,b],[b,a]])for(const [id,value] of Object.entries(answered.answers))if(!pending.answers[id]&&pending.hints.includes(id))requireValue(value.hinted,'第三版提示與首次答案分支衝突，未匯入');
 for(const [answered,pending] of [[a,b],[b,a]])for(const [key,value] of Object.entries(answered.corrections))if(!pending.corrections[key]&&pending.hints.includes(answered.queue[key].questionId))requireValue(value.hinted,'第三版提示與訂正答案分支衝突，未匯入');
 const next=structuredClone(richer);next.answers={...a.answers,...b.answers};
 for(const [key,value] of Object.entries(other.corrections)){if(next.corrections[key])requireValue(JSON.stringify(value)===JSON.stringify(next.corrections[key]),'第三版訂正答案衝突，未匯入');else{requireValue(JSON.stringify(next.queue[key])===JSON.stringify(other.queue[key]),'第三版訂正題目衝突，未匯入');next.corrections[key]=value;}}
 next.hints=[...new Set([...a.hints,...b.hints])];next.deferred=[...new Set([...a.deferred,...b.deferred])];
 next.cursor=Math.max(a.cursor,b.cursor);next.updatedAt=a.updatedAt>b.updatedAt?a.updatedAt:b.updatedAt;next.completedAt=a.completedAt||b.completedAt;
 return validateSession(next);
}
export function mergeV3(a,b,{blank=false,artifacts=[]}={}){
 const next=structuredClone(a);if(blank)next.goal=b.goal;
 const sessions=new Map(a.sessions.map(s=>[s.id,structuredClone(s)]));
 for(const s of b.sessions)sessions.set(s.id,sessions.has(s.id)?mergeSession(sessions.get(s.id),s):structuredClone(s));next.sessions=[...sessions.values()];
 const plans=new Map(a.dailyPlans.map(p=>[p.id,structuredClone(p)]));
 for(const p of b.dailyPlans){const old=plans.get(p.id);if(!old){plans.set(p.id,structuredClone(p));continue;}
  for(const key of ['day','minutes','goal','unitId','conceptIds','newConceptIds','createdAt'])requireValue(JSON.stringify(old[key])===JSON.stringify(p[key]),'每日安排分支衝突，未匯入');
  requireValue(old.steps.length===p.steps.length,'每日步驟衝突，未匯入');
  p.steps.forEach((step,i)=>{const prior=old.steps[i];for(const key of ['id','kind','title','questionIds'])requireValue(JSON.stringify(prior[key])===JSON.stringify(step[key]),'每日步驟衝突，未匯入');if(prior.sessionId&&step.sessionId)requireValue(prior.sessionId===step.sessionId,'每日回想分支衝突，未匯入');prior.sessionId??=step.sessionId;prior.startedAt??=step.startedAt;prior.completedAt??=step.completedAt;});
  if(p.updatedAt>old.updatedAt)old.updatedAt=p.updatedAt;
 }next.dailyPlans=[...plans.values()];
 for(const [id,steps] of Object.entries(b.lessonSteps))next.lessonSteps[id]={...steps,...next.lessonSteps[id]};
 for(const [child,parent] of Object.entries(b.artifactParents)){if(next.artifactParents[child])requireValue(next.artifactParents[child]===parent,'作品修訂分支衝突，未匯入');next.artifactParents[child]=parent;}
 if(a.kanaHints||b.kanaHints)next.kanaHints=mergeHintRecords(a.kanaHints,b.kanaHints);
 if(a.kanaNotes||b.kanaNotes)next.kanaNotes=mergeKanaNotes(a.kanaNotes,b.kanaNotes);
 return validateV3(next,artifacts);
}
