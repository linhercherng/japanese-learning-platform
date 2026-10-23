import {rhythmQuestion} from './content/kana-rhythm.mjs';
import {rhythmCards,exposedRhythmItems} from './content/kana-focus.mjs';
import {recordRhythmExposure} from './core/kana-rhythm.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';
import {extraKanaExposure} from './content/kana-recall.mjs';
import * as catalog from './content/catalog.mjs';
import {kana,kanaLessons} from './content/kana.mjs';
import {concepts} from './content/concepts.mjs';
import {v3Questions} from './content/practice-v3.mjs';
import {deepLessons} from './content/deep-lessons.mjs';
import {confusionPairs} from './content/confusions.mjs';
import {kanaDrills,selectKanaDrills,validKanaReference} from './content/kana-drills.mjs';
import {kanaMemoryView,kanaMemorySelection} from './ui/kana-memory.mjs';
import {makeDailyPlan} from './core/daily-plan.mjs';
import {learningPending} from './core/unified-learning.mjs';
import {setLearningGoal,storeDailyPlan,startDailyStep,completeDailyStep,adjustDailyPlan,beginV3Session,hintV3Question,answerV3Session,nextV3Question,markDeepStep,saveDailyWriting,saveTextRevision,saveDeepWriting,organizeV3} from './core/v3-learning.mjs';
import {exportBackup} from './core/learning.mjs';
import {profileView} from './ui/profile.mjs';
import {v3HomeView,dailyView,practiceV3View,weaknessesView,confusionView,deepView,weeklyView,reviseView,profileV3Extras,todayPlan} from './ui/v3.mjs';

/** V3 owns its event namespace; V1/V2 audio, writing and backup flows remain shared. */
export function createV3({getState,getContext,update,toast,render,now,id,cacheDraft}){
 const state=()=>getState(),ctx=()=>getContext();let composingInput=null,compositionSubmitBlocked=false,routeEpoch=0,disposed=false;
 const local=()=>ctx().session.v3ui??=( {order:[],deepIndex:0} );
 const resolve=(qid,dimension)=>catalog.resolveLearningQuestion(qid,dimension);
 const units=[...catalog.allUnits,...kanaLessons.map(u=>({...u,level:'K'}))];
 const route=()=>location.hash.slice(1).split('/');
 const refresh=hash=>{if(location.hash===hash)render(false);};
 const draftText=()=>document.querySelector('#v3-writing')?.value.trim()||'';
 function clearDraft(key){cacheDraft(`text:${key}`,null);}
 function savedOrder(sessionId){try{const session=state().v3.sessions.find(s=>s.id===sessionId),q=resolve(session?.queue[session.cursor]?.questionId),parsed=JSON.parse(ctx().state.drafts[`text:${sessionId}`]?.text||'[]');return q?.kind==='order'&&Array.isArray(parsed)&&new Set(parsed).size===parsed.length&&parsed.every(i=>Number.isInteger(i)&&i>=0&&i<q.tokens.length)?parsed:[];}catch{return [];}}
 function persistOrder(){
  const current=currentQuestion();if(!current||current.q.kind!=='order')return;
  const {sid,cursor}=current,draft={text:JSON.stringify(local().order),points:[],time:now()};cacheDraft(`text:${sid}`,draft);
  update(s=>{const session=s.v3.sessions.find(p=>p.id===sid);if(!session||session.cursor!==cursor||session.completedAt)return s;return {...s,drafts:{...s.drafts,[`text:${sid}`]:draft},revision:s.revision+1};}).catch(()=>{});
 }
 async function createPlan(allowNew=false){
  const planId=id(),time=now(),origin=location.hash,ticket=routeEpoch;let destination;
  await update(s=>{const pending=learningPending(s,time,ctx().session.quiz)[0];if(pending){destination=pending.route;return s;}const existing=todayPlan(s,time);if(existing&&!allowNew){destination='daily/'+existing.id;return s;}const plan=makeDailyPlan(s,{concepts,questions:v3Questions,units,resolveQuestion:resolve,time,id:planId,allowNew});destination='daily/'+plan.id;return storeDailyPlan(s,plan);});
  if(!disposed&&ticket===routeEpoch&&location.hash===origin)location.hash=destination;
 }
 async function begin(questions,{source,reference,planId=null,stepId=null}){
  const questionIds=questions.map(q=>q.id),sessionId=id(),time=now();let destination;
  await update(s=>{const next=beginV3Session(s,questionIds,{id:sessionId,source,reference,time,planId,stepId});destination=next.v3.sessions.find(p=>p.source===source&&p.reference===reference&&!p.completedAt&&JSON.stringify(p.questionIds)===JSON.stringify(questionIds)).id;return next;});
  local().order=[];location.hash=`v3-practice/${destination}`;
 }
 function currentQuestion(){const [name,sid]=route(),s=state().v3.sessions.find(s=>s.id===sid);if(name!=='v3-practice'||!s||s.completedAt)return null;const entry=s.queue[s.cursor],q=resolve(entry?.questionId);return q?{sid,cursor:s.cursor,q}:null;}
 function expose(s,q,time,shownItems=[]){
  const rhythm=rhythmQuestion(q.id);if(!rhythm&&!kana.some(k=>k.id===q.reviewItem))return s;
  const items=rhythm?exposedRhythmItems(rhythmCards.find(c=>c.id===rhythm.rhythmCard)):[...new Set([q.reviewItem,...extraKanaExposure(q.id),...shownItems])];
  const next=rhythm?recordRhythmExposure(s,rhythm.rhythmCard,time):recordKanaExposure(s,items,time);for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;
 }
 function afterRender(name,sid){
  if(name!=='v3-practice')return;const session=ctx().state.v3.sessions.find(s=>s.id===sid);if(!session||session.completedAt)return;
  const entry=session.queue[session.cursor],q=resolve(entry?.questionId),answer=entry?.repeat?session.corrections[session.cursor]:session.answers[entry?.questionId];
  if(!q||!rhythmQuestion(q.id)&&!kana.some(k=>k.id===q.reviewItem)||!answer&&!session.hints.includes(q.id))return;
  const time=new Date(Math.max(Date.parse(now()),answer?Date.parse(answer.time)+1:0)).toISOString();
  // Only the feedback and personal cue that this render actually showed count as exposure.
  const shownText=['kana-pocket-listen','kana-contrast'].includes(session.source)?q.explanation+(ctx().state.v3.kanaNotes?.[q.reviewItem]?.text||''):'';
  const shownItems=kana.filter(k=>shownText.includes(k.glyph)).map(k=>k.id);
  update(s=>expose(s,q,time,shownItems)).catch(error=>toast(error.message));
 }
 async function submit(value){
  const snapshot=currentQuestion();if(!snapshot)return;const {sid,cursor,q}=snapshot,hash=location.hash,time=now(),eventId=id();
  await update(s=>{const current=s.v3.sessions.find(s=>s.id===sid);if(!current||current.completedAt||current.cursor!==cursor||current.queue[cursor].questionId!==q.id)throw new Error('題目已切換，請回答目前顯示的題目。');let next=answerV3Session(s,{sessionId:sid,question:q,value,eventId,time,variants:['kana-pocket-listen','kana-contrast'].includes(current.source)?[]:q.mode?kanaDrills:v3Questions});delete next.drafts[`text:${sid}`];return next;});
  clearDraft(sid);refresh(hash);
 }
 async function nextQuestion(){
  const snapshot=currentQuestion();if(!snapshot)return;const {sid,cursor}=snapshot,hash=location.hash,time=now();
  await update(s=>{const current=s.v3.sessions.find(s=>s.id===sid);if(!current||current.completedAt||current.cursor!==cursor)return s;let next=nextV3Question(s,sid,time);const finished=next.v3.sessions.find(s=>s.id===sid);if(finished.completedAt&&finished.source==='lesson')next=markDeepStep(next,finished.reference,4,time);delete next.drafts[`text:${sid}`];return next;});
  clearDraft(sid);local().order=[];refresh(hash);
 }
 async function startStep(planId,stepId){
  const p=state().v3.dailyPlans.find(p=>p.id===planId),step=p?.steps.find(s=>s.id===stepId);if(!step||step.completedAt)return;
  if(step.kind==='practice'){
   if(step.sessionId){location.hash=`v3-practice/${step.sessionId}`;return;}
   const questions=step.questionIds.map(resolve).filter(Boolean);if(questions.length!==step.questionIds.length)throw new Error('這份安排的題目未完整載入，請保留備份。');
   await begin(questions,{source:'daily',reference:planId,planId,stepId});
  }else{const hash=location.hash;await update(s=>startDailyStep(s,planId,stepId,now()));refresh(hash);}
 }
 function requireChecks(){if([...document.querySelectorAll('[data-v3-check]')].some(el=>!el.checked))throw new Error('先對照任務，完成自查；草稿會保留。');}
 async function saveWriting(action,d){
  const text=draftText(),time=now(),artifactId=id(),hash=location.hash;if(!text)throw new Error('先寫一句自己的日文。');requireChecks();
  const key=action==='save-daily'?d.v3Plan:action==='save-deep'?d.v3Unit:d.v3Parent;
  await update(s=>{let next;
   if(action==='save-daily')next=saveDailyWriting(s,{planId:key,id:artifactId,text,time});
   else if(action==='save-deep'){const lesson=deepLessons.find(u=>u.id===key);if(!lesson)throw new Error('找不到這一課');next=saveDeepWriting(s,{unitId:key,questionIds:lesson.questionIds,id:artifactId,text,time});}
   else next=saveTextRevision(s,{parentId:key,id:artifactId,text,time});
   delete next.drafts[`text:${key}`];return next;
  });clearDraft(key);toast(action==='save-revision'?'修改稿已另外保存，原稿仍保留。':'作品與自查已保存。');refresh(hash);
 }
 function downloadBackup(){
  const snapshot=state(),revision=snapshot.revision,url=URL.createObjectURL(new Blob([exportBackup(snapshot)],{type:'application/json'})),link=document.createElement('a');
  link.href=url;link.download=`hiyori-before-v3-organize-${now().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  local().backupRevision=revision;local().backupConfirmed=false;toast('請確認備份檔已保存，再勾選整理。');render(false);
 }
 async function action(name,d){
  const hash=location.hash;
  switch(name){
   case 'kana-start':{const selection={...kanaMemorySelection(ctx().session)};return begin(selectKanaDrills(state(),{...selection,seed:id(),time:now()}),{source:'kana',reference:selection.script+':'+selection.mode+':'+selection.row});}
   case 'kana-hide':kanaMemorySelection(ctx().session).hidden=!kanaMemorySelection(ctx().session).hidden;break;
   case 'create-plan':return createPlan();
   case 'refresh-home':break;
   case 'extra-plan':return createPlan(true);
   case 'start-step':return startStep(d.v3Plan,d.v3Step);
   case 'finish-step':await update(s=>completeDailyStep(s,d.v3Plan,d.v3Step,now()));break;
   case 'adjust-plan':{const minutes=Number(document.querySelector('#v3-adjust')?.value);await update(s=>adjustDailyPlan(s,d.v3Plan,minutes,now(),{questions:v3Questions}));toast('已做的內容保留，剩下活動已調整。');break;}
   case 'submit-text':{const field=document.querySelector('#v3-answer'),value=field?.value.trim()||'';if(currentQuestion()?.q.id.startsWith('kt:')){if(composingInput===field||compositionSubmitBlocked){compositionSubmitBlocked=false;toast('先完成日文輸入法的選字，再提交。');return;}if(!value){toast('先輸入假名，再提交；需要幫忙可以使用提示。');return;}if(value.length>50){toast('這題最多輸入50字。');return;}}return submit(value);}
   case 'submit-order':return submit([...(local().order||[])]);
   case 'next':return nextQuestion();
   case 'hint':{const current=currentQuestion();if(!current)return;const time=now();await update(s=>{const active=s.v3.sessions.find(p=>p.id===current.sid);if(!active||active.completedAt||active.cursor!==current.cursor||(active.queue[active.cursor].repeat?active.corrections[active.cursor]:active.answers[current.q.id]))return s;const next=hintV3Question(s,current.sid,time);return ['kana-pocket-listen','kana-contrast'].includes(active.source)?next:expose(next,current.q,time);});break;}
   case 'concept-practice':{const qs=v3Questions.filter(q=>q.conceptId===d.v3Concept&&q.dimension===d.v3Dimension);return begin(qs,{source:'concept',reference:`${d.v3Concept}:${d.v3Dimension}`});}
   case 'confusion-practice':{const pair=confusionPairs.find(p=>p.id===d.v3Pair);if(!pair)throw new Error('找不到這組字');return begin(v3Questions.filter(q=>q.conceptId===pair.conceptId),{source:'confusion',reference:pair.id});}
   case 'deep-practice':{const u=deepLessons.find(u=>u.id===d.v3Unit);if(!u)throw new Error('找不到這一課');return begin(u.questionIds.map(resolve).filter(Boolean),{source:'lesson',reference:u.id});}
   case 'toggle-pair':local().hiddenPair=local().hiddenPair===d.v3Pair?null:d.v3Pair;break;
   case 'deep-next':{const index=Number(d.v3Index),unitId=d.v3Unit;if(index<4)await update(s=>markDeepStep(s,unitId,index,now()));local().deepUnit=unitId;local().deepIndex=Math.min(5,index+1);break;}
   case 'save-daily':case 'save-deep':case 'save-revision':return saveWriting(name,d);
   case 'backup-organize':return downloadBackup();
   case 'organize':{const revision=local().backupRevision;if(!local().backupConfirmed)throw new Error('先確認備份檔已保存。');await update(s=>{if(s.revision!==revision)throw new Error('資料已有新變動，請重新下載完整備份再整理。');return organizeV3(s,now());});delete local().backupRevision;local().backupConfirmed=false;toast('較早的完成輪次已整理；首次作答、作品與未完成活動保留。');break;}
   default:return;
  }refresh(hash);
 }
 function click(event){
  const button=event.target.closest('button');if(!button)return;const d={...button.dataset};if(!Object.keys(d).some(k=>k.startsWith('v3')))return;
  const task=async()=>{
   if(d.v3KanaScript){kanaMemorySelection(ctx().session).script=d.v3KanaScript;render(false);return;}
   if(d.v3Choice!==undefined)return submit(Number(d.v3Choice));
   if(d.v3Token!==undefined){const i=Number(d.v3Token);if(!local().order.includes(i))local().order.push(i);persistOrder();render(false);return;}
   if(d.v3RemoveToken!==undefined){local().order=local().order.filter((_,i)=>i!==Number(d.v3RemoveToken));persistOrder();render(false);return;}
   if(d.v3DeepIndex!==undefined){local().deepUnit=d.v3Unit;local().deepIndex=Number(d.v3DeepIndex);render(false);return;}
   if(d.v3Minutes!==undefined){const minutes=Number(d.v3Minutes);if(![5,15,30].includes(minutes))return;await update(s=>({...s,settings:{...s.settings,dailyMinutes:minutes},revision:s.revision+1}));render(false);return;}
   if(d.v3Action)return action(d.v3Action,d);
  };
  button.disabled=true;task().catch(error=>toast(error.message)).finally(()=>{if(button.isConnected)button.disabled=false;});
 }
 function input(event){const el=event.target,key=el.dataset.v3Draft;if(!key)return;const draft={text:el.value,points:[],time:now()};cacheDraft(`text:${key}`,draft);update(s=>({...s,drafts:{...s.drafts,[`text:${key}`]:draft},revision:s.revision+1})).catch(()=>{});}
 function change(event){const el=event.target;
  if(el.dataset.v3KanaSetting){const key=el.dataset.v3KanaSetting,choice=kanaMemorySelection(ctx().session);if(key==='group'){choice.group=el.value;choice.row={basic:'a',voiced:'ga',semivoiced:'pa',contracted:'kya'}[el.value];if(choice.group==='basic'&&choice.mode==='build')choice.mode='listen';}else if(['row','mode','count'].includes(key))choice[key]=key==='count'?Number(el.value):el.value;render(false);return;}
  if(el.dataset.v3Goal!==undefined){const goal=el.value,hash=location.hash;update(s=>setLearningGoal(s,goal)).then(()=>refresh(hash)).catch(error=>toast(error.message));}
  if(el.dataset.v3BackupConfirm!==undefined){local().backupConfirmed=el.checked;render(false);}
 }
 function pointerDown(event){const b=event.target.closest?.('button');compositionSubmitBlocked=Boolean(b?.dataset.v3Action==='submit-text'&&composingInput&&composingInput===document.querySelector('#v3-answer'));}
 function compositionStart(event){if(event.target.id==='v3-answer')composingInput=event.target;}
 function compositionEnd(event){if(composingInput===event.target)composingInput=null;}
 document.addEventListener('pointerdown',pointerDown);document.addEventListener('compositionstart',compositionStart);document.addEventListener('compositionend',compositionEnd);
 document.addEventListener('click',click);document.addEventListener('input',input);document.addEventListener('change',change);
 return {
  views:{home:()=>v3HomeView(ctx(),now()),'kana-memory':()=>kanaMemoryView(ctx()),daily:pid=>dailyView(ctx(),pid),'v3-practice':sid=>practiceV3View(ctx(),sid,resolve,now()),weaknesses:()=>weaknessesView(ctx()),confusion:pair=>confusionView(ctx(),pair),deep:unit=>deepView(ctx(),unit),weekly:()=>weeklyView(ctx(),now()),revise:artifact=>reviseView(ctx(),artifact),profile:()=>profileV3Extras(ctx())+profileView(ctx())},
  afterRender,
  onRoute(name,param){const ui=local(),key=`${name}/${param||''}`;if(ui.route!==key){routeEpoch++;composingInput=null;compositionSubmitBlocked=false;ui.order=name==='v3-practice'?savedOrder(param):[];if(name==='deep'){ui.deepUnit=param;const completed=state().v3.lessonSteps[param]||{};ui.deepIndex=Math.min(5,[0,1,2,3,4,5].find(i=>!completed[i])??5);}ui.route=key;}},
  validateCatalog(s){
   const conceptIds=new Set(concepts.map(c=>c.id)),unitIds=new Set(units.map(u=>u.id)),deepIds=new Set(deepLessons.map(u=>u.id)),pairIds=new Set(confusionPairs.map(p=>p.id));
   for(const p of s.v3.dailyPlans){if(!unitIds.has(p.unitId)||p.conceptIds.some(cid=>!conceptIds.has(cid))||(p.newConceptIds||[]).some(cid=>!conceptIds.has(cid))||p.steps.some(step=>step.questionIds.some(qid=>!resolve(qid))))throw new Error('備份包含未知每日教材');}
   for(const p of s.v3.sessions){if(p.source==='kana'&&!validKanaReference(p.reference,p.queue.map(q=>q.questionId)))throw new Error('備份包含不一致的假名加練');if(p.queue.some(q=>!resolve(q.questionId)))throw new Error('備份包含未知第三版題目');if(p.source==='lesson'&&!deepIds.has(p.reference)||p.source==='confusion'&&!pairIds.has(p.reference)||p.source==='concept'&&!concepts.some(c=>c.dimensions.some(d=>p.reference===`${c.id}:${d}`)))throw new Error('備份包含未知第三版活動');}
   if(Object.keys(s.v3.lessonSteps).some(uid=>!deepIds.has(uid)))throw new Error('備份包含未知深化課程');
  },
  dispose(){disposed=true;routeEpoch++;document.removeEventListener('pointerdown',pointerDown);document.removeEventListener('compositionstart',compositionStart);document.removeEventListener('compositionend',compositionEnd);document.removeEventListener('click',click);document.removeEventListener('input',input);document.removeEventListener('change',change);}
 };
}
