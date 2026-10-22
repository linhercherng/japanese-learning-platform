import {rhythmCueSeen,rhythmQuestion} from './content/kana-rhythm.mjs';
import {rhythmCards,exposedRhythmItems} from './content/kana-focus.mjs';
import {recordRhythmExposure} from './core/kana-rhythm.mjs';
import {readDictation} from './core/kana-studio.mjs';
import {confusedKana} from './content/kana-coach.mjs';
import {topics,allUnits,units,scenarios,lifeLessons,unitById,unitQuestions,completionKey,words,forms,allWritingItems,resolveQuestion,reviewQuestions,practicePool,grammarItems,kanjiItems} from './content/catalog.mjs';
import {createPractice,answerPractice,hintPractice,presentationOrder} from './core/study.mjs';
import {recordAnswer,saveArtifact,exportBackup,organizeCompletedPractice} from './core/learning.mjs';
import {startExam,answerExam,remainingSeconds,validateExamForm} from './core/exam.mjs';
import {transitionExamState} from './core/exam-progress.mjs';
import {coursesView,levelView,topicsView,practiceHubView} from './ui/courses.mjs';
import {studyView,practiceView} from './ui/study.mjs';
import {libraryView,libraryItems} from './ui/library.mjs';
import {examsView,examSessionView,examResultView} from './ui/exam.mjs';
import {supportView} from './ui/support.mjs';
import {createOffline} from './ui/offline.mjs';
export function createV2({getState,getContext,update,toast,render,now,id,cacheDraft}){
 let examTimerBusy=false;
 const offline=createOffline({render,toast});
 const ctx=()=>getContext(),state=()=>getState(),session=()=>ctx().session;
 const practiceQuestions=()=>state().practice?.questionIds.map(resolveQuestion).filter(Boolean)||[];
 function question(){
  const currentRoute=location.hash.slice(1).split('/')[0];
  if(currentRoute==='exam-session'){const exam=state().activeExam,form=forms.find(f=>f.id===exam?.formId);return form?.sections[exam.sectionIndex]?.questions.find(q=>q.id===exam.questionIds[exam.sectionIndex][session().examQuestion||0]);}
  const p=state().practice;return p&&resolveQuestion(p.questionIds[p.index]);
 }
 async function beginPractice(unitId,questions){
  if(!questions.length){toast('目前沒有可練習的題目，請換個篩選或課程。');return;}
  const old=state().practice;
  if(old?.unitId===unitId&&old.index<old.questionIds.length&&JSON.stringify(old.questionIds)===JSON.stringify(questions.map(q=>q.id))){location.hash='practice';return;}
  await update(s=>{if(s.practice&&s.practiceHistory.length>=100)throw new Error('回想紀錄已達100輪。到練習頁備份並整理已完成輪次；未完成輪次可先接續完成。');return {...s,practiceHistory:s.practice?[...s.practiceHistory,s.practice]:s.practiceHistory,practice:createPractice({id:id(),unitId,questionIds:questions.map(q=>q.id),time:now()}),lastLesson:unitById.has(unitId)?unitId:s.lastLesson,revision:s.revision+1};});
  session().order=[];session().hinted=false;location.hash='practice';
 }
 async function submit(value){
  const q=question();if(!q)return;
  if(location.hash==='#exam-session'){
   await update(s=>({...s,activeExam:answerExam(s.activeExam,forms.find(f=>f.id===s.activeExam.formId),q.id,value,now()),revision:s.revision+1}));render(false);return;
  }
  await update(s=>{const p=s.practice;if(p.answers[q.id])return s;const time=now(),nextPractice=answerPractice(p,q,value,{time,hinted:rhythmCueSeen(s.v3.rhythmHints,q,p.startedAt,time)});const answer=nextPractice.answers[q.id];let next=recordAnswer(s,{id:`${p.id}-${q.id}`,item:q.reviewItem||q.id,dimension:q.dimension,correct:answer.correct,hinted:answer.hinted,time:answer.time,...(!answer.correct&&confusedKana(q,value)?{kanaConfusion:confusedKana(q,value)}:{})});next.practice=nextPractice;return next;});render(false);
 }
 async function nextExamSection({submit=false,abandon=false}={}){
  const exam=state().activeExam;if(!exam)return;
  await update(s=>transitionExamState(s,forms.find(f=>f.id===exam.formId),now(),{sessionId:exam.id,sectionIndex:exam.sectionIndex,submit,abandon}));
  session().order=[];session().examQuestion=0;
  if(state().examAttempts.some(a=>a.id===exam.id))location.hash=`exam-result/${exam.id}`;else render(false);
 }
 function handleClick(event){
  const openWriting=event.target.closest('[data-open-writing]');if(openWriting){session().studyUnit=openWriting.getAttribute('href').split('/').pop();session().studyTab='write';return;}
  const button=event.target.closest('button');if(!button)return;const d=button.dataset;
  if(!Object.keys(d).some(key=>/^(study|library|bookmark|startExam|examQuestion|resumePractice)/.test(key)))return;
  const locked=d.studyChoice!==undefined||['submit-text','submit-order','next','exam-submit-section','exam-abandon'].includes(d.studyAction)||d.studyStart||d.studySave||d.startExam;
  if(locked)button.disabled=true;
  const task=async()=>{
   if(d.studyTab){session().studyTab=d.studyTab;render(false);}
   if(d.studyStart){const unit=unitById.get(d.studyStart);await beginPractice(unit.id,unitQuestions(unit));}
   if(d.resumePractice){await update(s=>{const p=s.practiceHistory.find(p=>p.id===d.resumePractice);if(!p)return s;return {...s,practice:p,practiceHistory:[...s.practiceHistory.filter(x=>x.id!==p.id),...(s.practice?[s.practice]:[])],revision:s.revision+1};});session().order=[];location.hash='practice';}
   if(d.studyChoice!==undefined)await submit(Number(d.studyChoice));
   if(d.studyToken!==undefined){session().order=[...(session().order||[]),Number(d.studyToken)];render(false);}
   if(d.studyRemoveToken!==undefined){session().order=(session().order||[]).filter((_,i)=>i!==Number(d.studyRemoveToken));render(false);}
   if(d.studySave){const unit=unitById.get(d.studySave),text=document.querySelector('#study-writing').value.trim();
    if(!text){toast('先寫自己的日文。');return;}if([...document.querySelectorAll('[data-writing-check]')].some(el=>!el.checked)){toast('先對照任務，完成自評檢查。');return;}
    const required=unitQuestions(unit);if(required.some(q=>!state().attempts.some(a=>a.item===q.id))){toast('先完成本課回想，再保存課程成果。草稿會保留。');return;}
    await update(s=>{let next=saveArtifact(s,{id:id(),item:unit.id,kind:'text',text,points:[],time:now()});next=recordAnswer(next,{id:id(),item:unit.id,dimension:'writing',correct:true,hinted:false,time:now()});delete next.drafts[`text:${unit.id}`];next.completed[completionKey(unit)]=next.completed[completionKey(unit)]||now();next.lastLesson=unit.id;return next;});cacheDraft(`text:${unit.id}`,null);toast('文字作品、自評與本課成果已保存。');location.hash='profile';
   }
   if(d.bookmark){await update(s=>({...s,bookmarks:s.bookmarks.includes(d.bookmark)?s.bookmarks.filter(x=>x!==d.bookmark):[...s.bookmarks,d.bookmark],revision:s.revision+1}));render(false);}
   if(d.libraryPage){session().library={...(session().library||{query:'',level:'all',favorites:false}),page:Math.max(0,(session().library?.page||0)+Number(d.libraryPage))};render();}
   if(d.studyWord){const qs=[resolveQuestion(`${d.studyWord}-read`),resolveQuestion(`${d.studyWord}-meaning`)].filter(Boolean);await beginPractice('library-words',qs);}
   if(d.startExam){if(state().activeExam){toast('先接續或結束目前模擬，這次原作答會保留。');location.hash='exam-session';return;}
    const form=forms.find(f=>f.id===d.startExam);await update(s=>s.activeExam?s:({...s,activeExam:startExam(form,{id:id(),mode:d.examMode,time:now(),seen:[...new Set(s.attempts.map(a=>a.item))]}),revision:s.revision+1}));session().order=[];session().examQuestion=0;location.hash='exam-session';
   }
   if(d.examQuestion!==undefined){session().examQuestion=Number(d.examQuestion);session().order=[];render(false);}
   const actions={
    'submit-text':()=>submit(document.querySelector('#practice-answer').value.trim()),'submit-order':()=>submit(session().order||[]),
    hint:async()=>{const q=question();if(!state().practice.answers[q.id]){await update(s=>({...s,practice:hintPractice(s.practice,q.id,now()),revision:s.revision+1}));render(false);}},
    next:async()=>{await update(s=>{if(!s.practice.answers[s.practice.questionIds[s.practice.index]])return s;return {...s,practice:{...s.practice,index:s.practice.index+1,updatedAt:now()},revision:s.revision+1};});session().order=[];session().hinted=false;render();},
    'practice-library':()=>beginPractice('library-words',libraryItems(session(),state().bookmarks).slice(0,10).flatMap(w=>[resolveQuestion(`${w.id}-read`),resolveQuestion(`${w.id}-meaning`)]).filter(Boolean)),
    'skill-practice':()=>{const pool=practicePool({level:session().practiceLevel||'all',dimension:session().practiceDimension||'all'});return beginPractice('skill-set',presentationOrder(pool.length,id()).slice(0,10).map(i=>pool[i]));},
    'organize-practice':()=>{const data=exportBackup(state()),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=`hiyori-before-organize-${now().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);session().practiceBackupRevision=state().revision;session().practiceBackupConfirmed=false;toast('請確認備份檔已成功下載，再勾選完成整理。');render(false);},
    'confirm-organize':async()=>{if(!session().practiceBackupConfirmed)throw new Error('先確認備份檔已保存');await update(s=>{if(s.revision!==session().practiceBackupRevision)throw new Error('資料已有新變動，請重新下載完整備份再整理。');return organizeCompletedPractice(s);});session().practiceBackupRevision=null;session().practiceBackupConfirmed=false;toast('完成輪次已整理，首次作答、複習、作品與未完成輪次保留。');render(false);},
    'exam-prev':()=>{session().examQuestion=Math.max(0,(session().examQuestion||0)-1);session().order=[];render(false);},
    'exam-next':()=>{session().examQuestion=(session().examQuestion||0)+1;session().order=[];render(false);},
    'exam-submit-section':()=>nextExamSection({submit:true}),'exam-abandon':()=>nextExamSection({abandon:true})
   };if(actions[d.studyAction])await actions[d.studyAction]();
  };
  task().catch(error=>toast(error.message)).finally(()=>{if(locked&&button.isConnected)button.disabled=false;});
 }
 function handleInput(event){const el=event.target;if(!el.dataset.studyDraft)return;const draft={text:el.value,points:[],time:now()},key=`text:${el.dataset.studyDraft}`;cacheDraft(key,draft);update(s=>{s.drafts[key]=draft;return s;}).catch(()=>{});}
 function handleChange(event){const d=event.target.dataset;
  if(d.practiceLevel!==undefined)session().practiceLevel=event.target.value;
  if(d.practiceDimension!==undefined)session().practiceDimension=event.target.value;
  if(d.practiceBackupConfirmed!==undefined){session().practiceBackupConfirmed=event.target.checked;render(false);}
  if(d.studyTopic!==undefined){session().topic=event.target.value;location.hash=`topics/${session().topic}`;}
  if(d.libraryLevel!==undefined||d.libraryFavorites!==undefined){const next={query:'',level:'all',favorites:false,page:0,...session().library};if(d.libraryLevel!==undefined)next.level=event.target.value;if(d.libraryFavorites!==undefined)next.favorites=event.target.checked;next.page=0;session().library=next;render(false);}
  if(d.examWrong!==undefined){session().examWrongOnly=event.target.checked;render(false);}
 }
 function handleSubmit(event){const form=event.target.closest('[data-search-kind]');if(!form)return;event.preventDefault();const value=new FormData(form).get('query')?.toString().trim()||'';if(form.dataset.searchKind==='courses')session().courseQuery=value;else session().library={query:value,level:session().library?.level||'all',favorites:session().library?.favorites||false,page:0};render(false);}
 const tick=setInterval(async()=>{
  const exam=state().activeExam;if(!exam||examTimerBusy||getContext().unsaved)return;
  const time=now(),seconds=remainingSeconds(exam,time),label=document.querySelector('#exam-countdown');if(label)label.textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  if(seconds===0){examTimerBusy=true;try{await nextExamSection();}catch(error){toast(error.message);}finally{examTimerBusy=false;}}
 },1000);
 document.addEventListener('click',handleClick);document.addEventListener('input',handleInput);document.addEventListener('change',handleChange);document.addEventListener('submit',handleSubmit);
 function afterRender(name){if(name!=='practice')return;const p=state().practice,q=p&&rhythmQuestion(p.questionIds[p.index]),answer=q&&p.answers[q.id];if(!q||!answer&&!(p.hints||[]).includes(q.id))return;const time=new Date(Math.max(Date.parse(now()),answer?Date.parse(answer.time)+1:0)).toISOString();update(s=>{const next=recordRhythmExposure(s,q.rhythmCard,time);for(const item of exposedRhythmItems(rhythmCards.find(c=>c.id===q.rhythmCard))){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));}
 return {
  afterRender,
  async startReview(reviews){
   const first=reviews[0];if(first?.dimension==='writing'){const item=allWritingItems.find(k=>k.id===first.item);if(item)location.hash=`write/${item.id}`;else if(unitById.has(first.item)){session().studyUnit=first.item;session().studyTab='write';location.hash=`study/${first.item}`;}return;}
   await beginPractice('review-set',reviewQuestions(reviews,Math.max(5,state().settings.dailyMinutes)));
  },
  views:{support:param=>supportView(ctx(),param),courses:()=>coursesView(ctx()),level:param=>levelView(ctx(),param),topics:()=>topicsView(ctx()),study:param=>studyView(ctx(),param),practice:()=>practiceView({...ctx(),practiceQuestions:practiceQuestions()},now()),'practice-hub':()=>practiceHubView(ctx()),library:param=>libraryView(ctx(),param),exam:()=>examsView(ctx()),'exam-session':()=>examSessionView(ctx()),'exam-result':param=>examResultView(ctx(),param)},
  contextExtras:()=>({units,scenarios,allUnits,wordCount:words.length,kanjiCount:kanjiItems.length,grammarCount:grammarItems.length,forms,writingItems:allWritingItems,lifeLessons,offlineHtml:offline.view()}),
  onRoute(name,param){if(name==='topics'&&topics.some(([id])=>id===param))session().topic=param;if(name==='study'&&session().studyUnit!==param){session().studyUnit=param;session().studyTab='learn';}if(['practice','exam-session'].includes(name)&&session().lastV2Route!==`${name}/${param||''}`)session().order=[];session().lastV2Route=`${name}/${param||''}`;},
  validateCatalog(s){
   const bookmarks=new Set([...words,...kanjiItems,...grammarItems].map(x=>x.id));
   if(s.bookmarks.some(id=>!bookmarks.has(id)))throw new Error('備份包含未知收藏項目');
   for(const p of [s.practice,...(s.practiceHistory||[])].filter(Boolean)){if(!unitById.has(p.unitId)&&!['library-words','review-set','skill-set'].includes(p.unitId))throw new Error('備份包含未知練習課程');if(p.questionIds.some(id=>!resolveQuestion(id)))throw new Error('備份包含未知練習題目');}
   for(const exam of [s.activeExam,...s.examAttempts].filter(Boolean))validateExamForm(exam,forms.find(f=>f.id===exam.formId));
  },
  dispose(){offline.dispose();clearInterval(tick);document.removeEventListener('click',handleClick);document.removeEventListener('input',handleInput);document.removeEventListener('change',handleChange);document.removeEventListener('submit',handleSubmit);}
 };
}
