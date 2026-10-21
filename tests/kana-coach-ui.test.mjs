import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,recordAnswer,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {kanaMapView,kanaConfusionsView,kanaCheckView} from '../app/ui/kana-coach.mjs';
import {createKanaCoach} from '../app/kana-coach.mjs';
import {startKanaCheck} from '../app/core/kana-coach.mjs';
import {createV3} from '../app/v3.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';
import {validateState} from '../app/core/learning.mjs';
import {navigationContext,navigationView} from '../app/ui/navigation.mjs';
const time='2026-10-21T02:00:00.000Z',old='2026-10-20T02:00:00.000Z';
const ctx=()=>({state:initialState(),session:{}});
test('map offers three independent abilities, 46 basic tiles and all 208 existing cards through filters',()=>{
 const c=ctx(),html=kanaMapView(c,null,time);assert.match(html,/記憶地圖/);assert.match(html,/認字/);assert.match(html,/聽辨/);assert.match(html,/手寫自評/);assert.equal((html.match(/class="kc-tile /g)||[]).length,46);
 c.session.kanaCoach={script:'kata',group:'all',ability:'writing',status:'all'};const all=kanaMapView(c,null,time);assert.equal((all.match(/class="kc-tile /g)||[]).length,104);assert.match(all,/未留下自評/);
 const detail=kanaMapView(c,'h-306c',time);assert.match(detail,/data-coach-dimension="recognition"/);assert.match(detail,/data-recall-write/);assert.match(detail,/自評/);
 assert.doesNotMatch(kanaMapView(c,'<script>',time),/<script>/);
});
test('empty personal confusion and check pages explain why and provide real learning entrances',()=>{
 const c=ctx();assert.match(kanaConfusionsView(c),/還沒有可確認的個人混淆/);assert.match(kanaConfusionsView(c),/教材相似字/);
 const html=kanaCheckView(c,time);assert.match(html,/較早日期/);assert.match(html,/href="#kana-memory"/);assert.doesNotMatch(html,/data-coach-action="check-start"/);
});
test('check page resumes the saved round and completed checks cannot create another daily first attempt',()=>{
 const c=ctx();c.state=recordAnswer(c.state,{id:'prior',item:'h-306c',dimension:'recognition',correct:true,hinted:false,time:old});
 assert.match(kanaCheckView(c,time),/data-coach-action="check-start"/);
 c.state=startKanaCheck(c.state,{id:'check-saved',time});const html=kanaCheckView(c,time);assert.match(html,/v3-practice\/check-saved/);assert.doesNotMatch(html,/data-coach-action="check-start"/);
});
test('coach navigation and pending practice never leak target glyphs, words or pair names',()=>{
 for(const source of ['kana-map','kana-check','kana-confusion']){
  const c=ctx();c.state.v3.sessions=[{id:'coach-session',source,reference:source==='kana-map'?'h-306c':source==='kana-check'?'2026-10-21':'h-306c:h-3081'}];
  const n=navigationContext(c,'v3-practice','coach-session');assert.equal(n.section,'practice-hub');assert.doesNotMatch(navigationView(n),/[ぬめヌメ]/);assert(n.trail.some(c=>c.route===({'kana-map':'kana-map','kana-check':'kana-check','kana-confusion':'kana-confusions'})[source]));
 }
});
test('controller starts one daily check, resumes after refresh and validates imported references',async()=>{
 const c=ctx();c.state=recordAnswer(c.state,{id:'prior',item:'h-306c',dimension:'recognition',correct:true,hinted:false,time:old});
 const previousDocument=globalThis.document,previousLocation=globalThis.location,listeners=new Map();globalThis.document={addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:()=>{}};globalThis.location={hash:'#kana-check'};
 let counter=0;const setup=()=>createKanaCoach({getState:()=>c.state,getContext:()=>c,update:async fn=>{c.state=fn(c.state);},render:()=>{},toast:m=>{throw new Error(m);},now:()=>time,id:()=>`coach-${++counter}`});let controller=setup();
 try{
  const button={dataset:{coachAction:'check-start'},disabled:false,isConnected:true};listeners.get('click')({target:{closest:()=>button}});await new Promise(r=>setImmediate(r));
  assert.equal(c.state.v3.sessions.length,1);assert.equal(location.hash,'v3-practice/coach-1');controller.dispose();c.state=parseBackup(exportBackup(c.state));controller=setup();controller.validateCatalog(c.state);
  const bad=structuredClone(c.state);bad.v3.sessions[0].questionIds=['km-h-3042-listen'];bad.v3.sessions[0].queue[0].questionId='km-h-3042-listen';assert.throws(()=>controller.validateCatalog(bad));
 }finally{controller.dispose();globalThis.document=previousDocument;globalThis.location=previousLocation;}
});
test('learner can move from a map error through confusion practice, backup restore and next-day check',async()=>{
 const c=ctx(),listeners=new Map(),previousDocument=globalThis.document,previousLocation=globalThis.location;
 let clock=time,counter=0,hash='#kana-map/h-306c',v3,coach,answerInput='';
 globalThis.location={get hash(){return hash;},set hash(value){hash=value.startsWith('#')?value:`#${value}`;}};
 globalThis.document={addEventListener:(n,fn)=>{const list=listeners.get(n)||[];list.push(fn);listeners.set(n,list);},removeEventListener:(n,fn)=>listeners.set(n,(listeners.get(n)||[]).filter(f=>f!==fn)),querySelector:selector=>selector==='#v3-answer'?{value:answerInput}:null};
 const options={getState:()=>c.state,getContext:()=>c,update:async fn=>{c.state=validateState(fn(structuredClone(c.state)));},render:()=>{},toast:m=>{throw new Error(m);},now:()=>clock,id:()=>`flow-${++counter}`,cacheDraft:()=>{}};
 const click=async dataset=>{const button={dataset,disabled:false,isConnected:true};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button}});await new Promise(r=>setImmediate(r));};
 const active=()=>c.state.v3.sessions.find(s=>hash.endsWith(s.id));
 try{
  coach=createKanaCoach(options);v3=createV3(options);
  await click({coachAction:'map-practice',coachItem:'h-306c',coachDimension:'listening'});let s=active(),q=resolveLearningQuestion(s.questionIds[0]);
  await click({v3Choice:String((q.correct+1)%q.options.length)});await click({v3Action:'next'});assert(active().completedAt);
  const {kanaConfusions}=await import('../app/core/kana-coach.mjs');const pair=kanaConfusions(c.state)[0];assert(pair);assert.match(coach.views['kana-confusions'](pair.reference),/開始 6 題專練/);
  await click({coachAction:'confusion-start',coachPair:pair.reference});s=active();assert.equal(s.questionIds.length,6);
  // Confirm the active source and answer survive a real backup round trip before continuing.
  q=resolveLearningQuestion(s.queue[s.cursor].questionId);await click({v3Choice:String(q.correct)});c.state=parseBackup(exportBackup(c.state));coach.validateCatalog(c.state);v3.validateCatalog(c.state);assert(active().answers[q.id]);
  while(!active().completedAt){const current=active(),entry=current.queue[current.cursor],question=resolveLearningQuestion(entry.questionId);if(!current.answers[question.id]){if(question.kind==='cloze'){answerInput=question.accepted[0];await click({v3Action:'submit-text'});}else await click({v3Choice:String(question.correct)});}await click({v3Action:'next'});}
  assert.match(v3.views['v3-practice'](active().id),/回到學習安排/);assert.equal(Object.keys(active().answers).length,6);
  // A saved session remains resumable; tomorrow's check derives from the prior date's attempts.
  clock='2026-10-22T02:00:00.000Z';hash='#kana-check';assert.match(coach.views['kana-check'](),/開始今天的隔天檢查/);
  await click({coachAction:'check-start'});s=active();assert.equal(s.source,'kana-check');assert(s.questionIds.length>0&&s.questionIds.length<=10);
  q=resolveLearningQuestion(s.queue[s.cursor].questionId);await click({v3Action:'hint'});await click({v3Choice:String(q.correct)});c.state=parseBackup(exportBackup(c.state));
  assert.equal(active().answers[q.id].hinted,true);coach.validateCatalog(c.state);v3.validateCatalog(c.state);assert.match(v3.views['v3-practice'](s.id),/提示後答對/);
 }finally{v3?.dispose();coach?.dispose();globalThis.document=previousDocument;globalThis.location=previousLocation;}
});
