import {createKanaFocus} from './kana-focus.mjs';
import {createKanaRecall} from './kana-recall.mjs';
import {createKanaLab} from './kana-lab.mjs';
import {createKanaStudio} from './kana-studio.mjs';
import {createKanaCoach} from './kana-coach.mjs';
import {confusedKana} from './content/kana-coach.mjs';
import {navigationContext,navigationView} from './ui/navigation.mjs';
import {kana,kanaLessons,kanaPhonology} from './content/kana.mjs';
import {lifeLessons,knownItems,knownLessons,allWritingItems} from './content/catalog.mjs';
import {createV2} from './v2.mjs';
import {createV3} from './v3.mjs';
import {initialState,recordAnswer,dueReviews,completeLesson,saveArtifact,parseBackup,exportBackup,mergeStates} from './core/learning.mjs';
import {makeKanaQuiz} from './core/quiz.mjs';
import {openStore,readState,writeState} from './core/storage.mjs';
import {escapeHtml as e,icon,heading,back,note,primary,audioButton} from './ui/shared.mjs';
import {kanaView,unitView,strokeView,writingView,reviewView} from './ui/kana.mjs';
import {lifeView,lifeLessonView} from './ui/life.mjs';
import {homeView,profileView} from './ui/profile.mjs';
import {attachWriting} from './ui/writing.mjs';
import {createMedia} from './ui/media.mjs';
const main=document.querySelector('#main'),status=document.querySelector('#save-status'),locationContext=document.querySelector('#location-context');
const updateLocationHeight=()=>locationContext.parentElement.style.setProperty('--location-height',`${locationContext.getBoundingClientRect().height}px`);
if(typeof ResizeObserver==='function')new ResizeObserver(updateLocationHeight).observe(locationContext);
else window.addEventListener('resize',updateLocationHeight);
const qa=new URL(location.href).searchParams.get('qa')==='1';
let state=initialState(),db=null,unsaved=null,strokes={},audioIndex={},canvas=null,queue=Promise.resolve(),pendingImport=null,animationSequence=0,toastTimer,pendingWrites=0;
const session={script:'hira',group:'basic',selected:'h-3042',guide:true,lessonTab:'對話',quiz:null,lifeAnswers:{},latestDrafts:{}};
const now=()=>new Date().toISOString(),id=()=>crypto.randomUUID();
history.scrollRestoration='manual';
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4000);}
const mediaIndex={};
const media=createMedia(mediaIndex,toast);
const v2=createV2({getState:()=>unsaved||state,getContext:context,update,toast,render,now,id,cacheDraft:(key,value)=>{if(value===null)delete session.latestDrafts[key];else session.latestDrafts[key]=value;}});
const v3=createV3({getState:()=>unsaved||state,getContext:context,update,toast,render,now,id,cacheDraft:(key,value)=>{if(value===null)delete session.latestDrafts[key];else session.latestDrafts[key]=value;}});
const kanaCoach=createKanaCoach({getState:()=>unsaved||state,getContext:context,update,toast,render,now,id});
const kanaStudio=createKanaStudio({getState:()=>unsaved||state,getContext:context,update,toast,render,now,id,cacheDraft:(key,value)=>{if(value===null)delete session.latestDrafts[key];else session.latestDrafts[key]=value;}});
const kanaLab=createKanaLab({getContext:context,update,render,toast,now,id,cacheDraft:(key,value)=>{if(value===null)delete session.latestDrafts[key];else session.latestDrafts[key]=value;}});
const kanaRecall=createKanaRecall({getContext:context,update,toast,now,id});
const kanaFocus=createKanaFocus({getContext:context,update,render,toast,now,id,cacheDraft:(key,value)=>{if(value===null)delete session.latestDrafts[key];else session.latestDrafts[key]=value;}});
function context(){const displayed={...(unsaved||state),drafts:{...(unsaved||state).drafts,...session.latestDrafts}};return {state:displayed,unsaved,session,kana,kanaLessons,kanaPhonology,lifeLessons,strokes,audioIndex,due:dueReviews(state),...v2.contextExtras()};}
function update(fn){
 pendingWrites++;status.textContent='保存中…';
 const operation=queue.then(async()=>{
  if(!db)throw new Error('目前無法保存，請先匯出備份，不要清除瀏覽器資料。');
  if(unsaved){const next=fn(structuredClone(unsaved));if(next===undefined)throw new Error('資料更新失敗');next.revision=Math.max(next.revision,unsaved.revision+1);unsaved=next;status.textContent='尚未保存，請先備份';throw new Error('新內容已留在待保存備份中。請先匯出，再重新整理後合併。');}
  const next=fn(structuredClone(state));if(next===undefined)throw new Error('資料更新失敗');
  if(JSON.stringify(next)===JSON.stringify(state))return;
  if(next.revision<=state.revision)next.revision=state.revision+1;
  status.textContent='保存中…';
  try{await writeState(db,next,state.revision);state=next;status.textContent='已保存至本機';status.classList.remove('save-warning');}
  catch(error){unsaved=next;status.textContent='尚未保存，請先備份';status.classList.add('save-warning');throw error;}
 });
 const completed=operation.finally(()=>{pendingWrites--;if(!pendingWrites&&!unsaved)status.textContent=db?'已保存至本機':'目前無法保存';});queue=completed.catch(error=>toast(error.message));return completed;
}
function route(){const [name='home',param]=location.hash.slice(1).split('/');return {name:name||'home',param};}
function render(focus=true){
 kanaStudio.beforeRender();
 canvas?.dispose();canvas=null;animationSequence++;document.getAnimations().forEach(a=>a.cancel());
 const {name,param}=route(),ctx=context();
 v2.onRoute(name,param);
 v3.onRoute(name,param);
 if(name==='lesson'&&session.activeLesson!==param){session.activeLesson=param;session.lessonTab='對話';}
 const views={home:()=>homeView(ctx),kana:()=>kanaView(ctx),unit:()=>unitView(ctx,param),stroke:()=>strokeView(ctx,param),write:()=>writingView(ctx,param||kana[0].id),life:()=>lifeView(ctx),lesson:()=>lifeLessonView(ctx,param),review:()=>reviewView(ctx),profile:()=>profileView(ctx),quiz:quizView,exam:()=>`${heading('一步一步，走向 N3。','完整檢定課程與模擬試卷會在後續版本加入。')}<section class="self-check"><h2>現在先把基礎練穩</h2><p>這一版可練完整五十音、音韻與六個生活任務。這些課程與進度不是 JLPT 合格證明。</p>${primary('練習五十音','kana')}</section>`};
 for(const [view,renderer] of Object.entries(v2.views))views[view]=()=>renderer(param);
 views.life=()=>v2.views.level('L');views.lesson=()=>v2.views.study(param);
 for(const [view,renderer] of Object.entries(v3.views))views[view]=()=>renderer(param);
 for(const [view,renderer] of Object.entries(kanaCoach.views))views[view]=()=>renderer(param);
 for(const [view,renderer] of Object.entries(kanaStudio.views))views[view]=()=>renderer(param);
 for(const [view,renderer] of Object.entries(kanaLab.views))views[view]=()=>renderer(param);
 for(const [view,renderer] of Object.entries(kanaRecall.views))views[view]=()=>renderer(param);
 for(const [view,renderer] of Object.entries(kanaFocus.views))views[view]=()=>renderer(param);
 main.innerHTML=(views[name]||views.home)();main.dataset.screen=name;
 const navigation=navigationContext(ctx,name,param);
 locationContext.innerHTML=navigationView(navigation);
 document.title=`日和｜${navigation.trail.at(-1).label}`;
 document.body.classList.toggle('large-text',state.settings.fontSize===17);document.body.classList.toggle('extra-large-text',state.settings.fontSize===19);
 const active=navigation.section;
 document.querySelector('#bottom-nav').innerHTML=[['home','home','今日'],['courses','book','課程'],['practice-hub','pen','練習'],['exam','exam','檢定'],['profile','user','我的']].map(([r,i,t])=>`<a href="#${r}" class="${active===r?'active':''}" ${active===r?'aria-current="page"':''}>${icon(i)}<span>${t}</span></a>`).join('');
 document.querySelectorAll('[data-review]').forEach(a=>{a.classList.toggle('active',a.dataset.review===navigation.rail);});
 updateLocationHeight();
 if(name==='write'){
  const item=allWritingItems.find(k=>k.id===param)||kana[0];const key=`write:${item.id}`;
  canvas=attachWriting(document.querySelector('#writing-canvas'),context().state.drafts[key]?.points||[],points=>{const draft={text:'',points,time:now()};session.latestDrafts[key]=draft;update(s=>{s.drafts[key]=draft;return s;}).catch(()=>{});});
 }
 kanaStudio.afterRender(name,param);kanaLab.afterRender(name,param);kanaFocus.afterRender(name,param);v3.afterRender(name,param);
 if(focus){window.scrollTo(0,0);main.focus({preventScroll:true});}
}
function phonologyQuestions(lessonId){return (kanaPhonology.find(p=>p.lessonId===lessonId)?.questions||[]).map((q,i)=>({item:`${lessonId}-p${i}`,dimension:'language',prompt:q.prompt,options:q.choices.map((label,j)=>({value:String(j),label})),correct:q.choices.indexOf(q.answer),explanation:q.explanation}));}
async function startUnit(lessonId){
 const lesson=kanaLessons.find(l=>l.id===lessonId);if(!lesson)return;
 const pending=lesson.items.filter(item=>!['recognition','listening'].every(d=>state.attempts.some(a=>a.item===item&&a.dimension===d)));
 const batch=(pending.length?pending:lesson.items).slice(0,5).map(x=>kana.find(k=>k.id===x)).filter(Boolean);
 const questions=[...makeKanaQuiz(batch,kana),...phonologyQuestions(lessonId)];
 session.quiz={lesson:lessonId,questions,index:0,results:[],answered:false,hinted:false,started:id()};
 await update(s=>({...s,lastLesson:lessonId}));location.hash='quiz';
}
function quizView(){
 const quiz=session.quiz;if(!quiz)return `${heading('回到課程，接續回想。','已提交的作答會保留；重新整理後可回到單元，練尚未完成的項目。')}${primary('選擇五十音課','kana')}`;
 if(quiz.index>=quiz.questions.length){const correct=quiz.results.filter(r=>r.correct&&!r.hinted).length;return `${heading('這一小步，完成了。','答錯的與需要提示的項目，會安排到複習。')}<section class="hero"><span class="eyebrow">INDEPENDENT RECALL</span><h2>${correct} / ${quiz.questions.length} 無提示首次答對</h2><p>這是本次練習表現，長期熟練需要跨日回想。</p>${primary('看看複習安排','review')}</section><div class="lesson-footer">${primary('回到今日','home')}</div>`;}
 const q=quiz.questions[quiz.index];
 return `${back('回到課程','kana')}<div class="question-header"><span>${q.dimension==='listening'?'聽辨練習':q.dimension==='recognition'?'認字練習':'理解練習'}</span><span>${quiz.index+1} / ${quiz.questions.length}</span></div>${heading(q.prompt,'先自己想一次，再選答案。')}${q.glyph?`<div class="big-question jp" lang="ja">${e(q.glyph)}</div>`:''}${q.audio?`<div class="slow-audio">${audioButton(q.audio)}<button class="sound-button" data-audio="${e(q.audio)}" data-rate="0.75">慢一點聽</button></div>`:''}<div class="quiz-choices">${q.options.map((o,i)=>`<button data-quiz-answer="${i}" ${quiz.answered?'disabled':''}>${e(o.label)}</button>`).join('')}</div><button class="text-button" data-action="quiz-hint">需要一個提示</button><div id="quiz-feedback" aria-live="polite"></div><div class="lesson-footer"><button class="primary" data-action="quiz-next" ${quiz.answered?'':'disabled'}>下一題${icon('arrow')}</button></div>`;
}
async function submitQuiz(choice){
 const quiz=session.quiz;if(!quiz||quiz.answered)return;quiz.answered=true;const q=quiz.questions[quiz.index],correct=Number(choice)===Number(q.correct);
 const confusion=!correct?confusedKana({kind:'choice',correct:q.correct,options:q.options.map(o=>kana.find(k=>k.id===o.value)?.glyph||o.label)},Number(choice)):null;
 try{await update(s=>recordAnswer(s,{id:`${quiz.started}-${quiz.index}`,item:q.item,dimension:q.dimension,correct,hinted:quiz.hinted,time:now(),...(confusion?{kanaConfusion:confusion}:{})}));}
 catch{quiz.answered=false;return;}
 quiz.results.push({correct,hinted:quiz.hinted});
 if(session.quiz!==quiz||route().name!=='quiz')return;
 document.querySelectorAll('[data-quiz-answer]').forEach(b=>{b.disabled=true;if(Number(b.dataset.quizAnswer)===Number(q.correct))b.classList.add('selected');});
 const feedback=document.querySelector('#quiz-feedback'),nextButton=document.querySelector('[data-action="quiz-next"]');
 if(feedback)feedback.innerHTML=`<div class="feedback ${correct?'':'error'}">${correct?'想對了！':'再記住這個差異。'} ${e(q.explanation)}</div>`;if(nextButton)nextButton.disabled=false;
}
async function nextQuestion(){const q=session.quiz;if(!q?.answered)return;q.index++;q.answered=false;q.hinted=false;if(q.index>=q.questions.length&&q.lesson){const lesson=kanaLessons.find(l=>l.id===q.lesson);const allItems=lesson.items.every(item=>['recognition','listening'].every(d=>state.attempts.some(a=>a.item===item&&a.dimension===d)));const allPhonology=phonologyQuestions(q.lesson).every(p=>state.attempts.some(a=>a.item===p.item));if(allItems&&allPhonology)await update(s=>completeLesson(s,q.lesson,now()));}render(false);window.scrollTo(0,0);}
async function startReview(){
 const due=dueReviews(state);if(!due.length){toast('今天沒有到期項目。');return;}
 await v2.startReview(due);
}
async function saveWriting(itemId){
 const points=canvas?.points()||[],independent=document.querySelector('#writing-recall').checked,order=document.querySelector('#writing-order').checked;
 if(!order&&!independent){toast('先完成至少一項自評檢查。');return;}
 await update(s=>{let next=saveArtifact(s,{id:id(),item:itemId,kind:'handwriting',text:points.length?'':'紙上練習自評',points,time:now()});next=recordAnswer(next,{id:id(),item:itemId,dimension:'writing',correct:order&&independent,hinted:!independent,time:now()});delete next.drafts[`write:${itemId}`];return next;});
 delete session.latestDrafts[`write:${itemId}`];toast('作品與自評已保存。');location.hash='profile';
}
async function answerLife(lessonId,question,choice){
 const lesson=lifeLessons.find(l=>l.id===lessonId),q=lesson?.quiz[Number(question)];if(!q)return;
 const key=`${lessonId}-q${question}`,correct=Number(choice)===q.correct;
 if(session.lifeAnswers[key])return;
 session.lifeAnswers[key]=true;
 const buttons=[...document.querySelectorAll(`[data-life-answer][data-question="${question}"]`)];buttons.forEach(b=>b.disabled=true);
 try{await update(s=>recordAnswer(s,{id:id(),item:key,dimension:'language',correct,hinted:false,time:now()}));}
 catch(error){delete session.lifeAnswers[key];buttons.forEach(b=>b.disabled=false);throw error;}
 session.lifeAnswers[key]={correct};
 const feedback=document.querySelector(`#life-feedback-${question}`);if(feedback)feedback.innerHTML=`<div class="feedback ${correct?'':'error'}">${correct?'首次作答選對了！':'首次作答已記錄，看看差別。'} ${e(q.explanation)}</div>`;
}
async function saveLife(lessonId){
 const lesson=lifeLessons.find(l=>l.id===lessonId),text=document.querySelector('#life-writing').value.trim();
 if(!text){toast('先寫下一句自己的日文。');return;}
 if(!document.querySelector('#life-self-check').checked){toast('先對照任務與參考，勾選自評。');return;}
 if(!lesson.quiz.every((_,i)=>state.attempts.some(a=>a.item===`${lessonId}-q${i}`))){toast('先完成「想一想」的小測，再保存本課成果。');return;}
 await update(s=>{let next=saveArtifact(s,{id:id(),item:lessonId,kind:'text',text,points:[],time:now()});next=recordAnswer(next,{id:id(),item:lessonId,dimension:'writing',correct:true,hinted:false,time:now()});delete next.drafts[`text:${lessonId}`];return completeLesson(next,lessonId,now());});
 delete session.latestDrafts[`text:${lessonId}`];toast('作品與課程進度已保存。');location.hash='profile';
}
function exportFile(){const blob=new Blob([exportBackup(context().state)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`hiyori-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('備份已匯出，包含進度、草稿與作品。');}
function validateCatalog(s){
 const known=knownItems,lessons=knownLessons,draftIds=new Set([...known,...kana.flatMap(k=>[`KS-${k.id}`,`KN-${k.id}`]),...s.v3.dailyPlans.map(p=>p.id),...s.v3.sessions.map(p=>p.id),...s.artifacts.filter(a=>a.kind==='text').map(a=>a.id)]);
 if(s.attempts.some(a=>!known.has(a.item))||s.artifacts.some(a=>!known.has(a.item))||Object.keys(s.completed).some(x=>!lessons.has(x))||!lessons.has(s.lastLesson)||Object.keys(s.drafts).some(k=>!draftIds.has(k.replace(/^(write|text):/,''))))throw new Error('備份含此版本不支援的教材項目。');
 v2.validateCatalog(s);
 v3.validateCatalog(s);kanaCoach.validateCatalog(s);kanaStudio.validateCatalog(s);kanaLab.validateCatalog(s);kanaRecall.validateCatalog(s);kanaFocus.validateCatalog(s);
}
async function importFile(file){
 if(!file)return;if(file.size>12*1024*1024){toast('備份超過 12 MB，未匯入。');return;}
 try{const data=parseBackup(await file.text());validateCatalog(data);pendingImport=data;document.querySelector('#import-summary').textContent=`包含 ${data.attempts.length} 次作答、${Object.keys(data.completed).length} 個完成單元、${data.artifacts.length} 件作品。`;document.querySelector('#import-dialog').showModal();}
 catch(error){pendingImport=null;toast(`未匯入：${error.message}`);}finally{document.querySelector('#backup-file').value='';}
}
async function animateStrokes(step){
 const token=++animationSequence;document.getAnimations().forEach(a=>a.cancel());const paths=[...document.querySelectorAll('.stroke-board path')];
 paths.forEach((p,i)=>{p.style.opacity=step===undefined?'.15':i<=step?'1':'.15';p.style.strokeDasharray='';});
 const selected=step===undefined?paths.map((_,i)=>i):[step];
 for(const i of selected){if(token!==animationSequence)return;const p=paths[i];if(!p)return;p.style.opacity='1';document.querySelector('#stroke-hint').textContent=`第 ${i+1} 筆 / 共 ${paths.length} 筆`;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const length=p.getTotalLength();p.style.strokeDasharray=length;try{await p.animate([{strokeDashoffset:length},{strokeDashoffset:0}],{duration:750,fill:'forwards'}).finished;}catch{return;}}
 }
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-skip-focus]')){event.preventDefault();main.focus();return;}
 if(event.target.closest('[data-recall-write]'))session.guide=false;
 const button=event.target.closest('button');if(!button)return;const d=button.dataset;
 const locks=d.saveWriting||d.saveLife||d.action==='confirm-import';if(locks)button.disabled=true;
 const task=async()=>{
  if(d.audio){await media.play(d.audio,Number(d.rate||1));return;}
  if(d.script){session.script=d.script;session.selected=kana.find(k=>k.script===d.script&&k.group===session.group).id;render(false);}
  if(d.group){session.group=d.group;session.selected=kana.find(k=>k.script===session.script&&k.group===d.group).id;render(false);}
  if(d.rowDelta){const items=kana.filter(k=>k.script===session.script&&k.group===session.group);const start=Math.floor(Math.max(0,items.findIndex(k=>k.id===session.selected))/5)*5;session.selected=items[Math.max(0,Math.min(items.length-1,start+Number(d.rowDelta)))].id;render(false);}
  if(d.kana){session.selected=d.kana;render(false);document.querySelector('#selected-card').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  if(d.startUnit)await startUnit(d.startUnit);
  if(d.quizAnswer!==undefined)await submitQuiz(d.quizAnswer);
  if(d.lifeTab){const input=document.querySelector('#life-writing');if(input)await update(s=>{s.drafts[`text:${input.dataset.draftLesson}`]={text:input.value,points:[],time:now()};return s;});session.lessonTab=d.lifeTab;render(false);window.scrollTo(0,0);}
  if(d.lifeAnswer!==undefined)await answerLife(d.lesson,d.question,d.lifeAnswer);
  if(d.saveLife)await saveLife(d.saveLife);
  if(d.saveWriting)await saveWriting(d.saveWriting);
  if(d.strokeStep!==undefined)await animateStrokes(Number(d.strokeStep));
  if(d.mode){session.guide=d.mode==='trace';const board=document.querySelector('#writing-board');board.classList.toggle('no-guide',!session.guide);board.classList.remove('compare');const item=allWritingItems.find(k=>k.id===route().param)||kana[0];document.querySelector('#writing-title').textContent=session.guide?`寫一次 ${item.glyph}，再回想。`:'先聽聲音，再自己寫。';document.querySelector('#writing-label').textContent=session.guide?`${item.glyph} · 字跡草稿自動保存`:'默寫草稿自動保存';document.querySelectorAll('[data-mode]').forEach(b=>{const active=(b.dataset.mode==='trace')===session.guide;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
  if(d.deleteArtifact){await update(s=>{if(Object.values(s.v3.artifactParents).includes(d.deleteArtifact))throw new Error('這份原稿還有修改稿，請先移除修改稿再整理原稿。');const next={...s,artifacts:s.artifacts.filter(a=>a.id!==d.deleteArtifact),v3:{...s.v3,artifactParents:{...s.v3.artifactParents}}};delete next.v3.artifactParents[d.deleteArtifact];delete next.drafts[`text:${d.deleteArtifact}`];return next;});toast('作品已移除。其他進度保留，可由先前備份恢復。');render(false);}
  const actions={undo:()=>canvas?.undo(),clear:()=>canvas?.clear(),compare:()=>{const board=document.querySelector('#writing-board');board.classList.toggle('compare');board.classList.toggle('no-guide',!board.classList.contains('compare')&&!session.guide);},'animate-strokes':()=>animateStrokes(),'start-review':startReview,'quiz-next':nextQuestion,'quiz-hint':()=>{if(!session.quiz?.answered){session.quiz.hinted=true;const q=session.quiz.questions[session.quiz.index];toast(q.explanation);}},'export-backup':exportFile,'import-backup':()=>document.querySelector('#backup-file').click(),'cancel-import':()=>{pendingImport=null;document.querySelector('#import-dialog').close();},'confirm-import':async()=>{if(!pendingImport)return;await update(s=>mergeStates(s,pendingImport));session.latestDrafts={};pendingImport=null;document.querySelector('#import-dialog').close();toast('備份已合併，既有紀錄保留。');render(false);},record:()=>media.toggleRecord(document.querySelector('#recording-playback'),button)};
  if(actions[d.action])await actions[d.action]();
 };
 task().catch(error=>toast(error.message)).finally(()=>{if(locks&&button.isConnected)button.disabled=false;});
});
document.addEventListener('input',event=>{
 const el=event.target;if(el.id!=='life-writing')return;const lesson=el.dataset.draftLesson,text=el.value;
 const draft={text,points:[],time:now()};session.latestDrafts[`text:${lesson}`]=draft;update(s=>{s.drafts[`text:${lesson}`]=draft;return s;}).catch(()=>{});
});
document.addEventListener('change',event=>{const el=event.target;if(el.id==='backup-file')importFile(el.files[0]);if(el.dataset.setting){const value=el.type==='checkbox'?el.checked:Number(el.value);update(s=>({...s,settings:{...s.settings,[el.dataset.setting]:value}})).then(()=>render(false)).catch(()=>{});}});
document.querySelector('#import-dialog').addEventListener('close',()=>{pendingImport=null;});
window.addEventListener('hashchange',()=>{media.stop();render();});
window.addEventListener('beforeunload',event=>{if(unsaved||pendingWrites>0){event.preventDefault();event.returnValue='';}});
document.querySelector('#profile-link').innerHTML=icon('user');
if(qa)document.querySelector('#version-label').textContent='驗證環境 · 與個人資料分開';
try{
 db=await openStore(qa?'hiyori-learning-qa':'hiyori-learning-v1');state=await readState(db);status.textContent='已讀取本機進度';
 [strokes,audioIndex]=await Promise.all(['assets/strokes.json','assets/audio.json'].map(async path=>{const response=await fetch(path);if(!response.ok)throw new Error('教材素材未完整載入，請重新整理。');return response.json();}));
 Object.assign(mediaIndex,audioIndex);
 render(false);
}catch(error){db=null;main.innerHTML=`${heading('暫時無法打開學習手帳。',error.message)}<button class="primary" data-action="reload">重新整理</button>`;status.textContent='未能讀取資料';document.querySelector('[data-action="reload"]').onclick=()=>location.reload();}
