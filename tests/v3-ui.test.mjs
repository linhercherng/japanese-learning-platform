import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../app/core/learning.mjs';
import {makeDailyPlan} from '../app/core/daily-plan.mjs';
import {storeDailyPlan,startDailyStep,beginV3Session,answerV3Session,nextV3Question} from '../app/core/v3-learning.mjs';
import {v3HomeView,dailyView,practiceV3View,weaknessesView,confusionView,deepView,weeklyView,reviseView} from '../app/ui/v3.mjs';
import {concepts} from '../app/content/concepts.mjs';
import {v3Questions} from '../app/content/practice-v3.mjs';
import {kana,kanaLessons} from '../app/content/kana.mjs';
import {allUnits} from '../app/content/catalog.mjs';
import {createV3} from '../app/v3.mjs';
import {readFileSync} from 'node:fs';
const time='2026-10-13T00:00:00.000Z';
const resolve=id=>v3Questions.find(q=>q.id===id);
const context=state=>({state,session:{},kana,kanaLessons,allUnits,strokes:{}});
test('Five minute new content is taught before recall, and daily writing requires self checks',()=>{
 const raw=initialState();raw.settings.dailyMinutes=5;
 const p=makeDailyPlan(raw,{concepts,questions:v3Questions,units:[...allUnits,...kanaLessons.map(k=>({...k,level:'K'}))],resolveQuestion:resolve,time,id:'five'});
 let state=startDailyStep(storeDailyPlan(raw,p),'five','recall',time);const ctx=context(state);ctx.audioIndex=JSON.parse(readFileSync(new URL('../app/assets/audio.json',import.meta.url),'utf8'));
 const html=dailyView(ctx,'five');assert(html.includes(concepts[0].explanation));assert(!html.includes('data-audio="あめ／アイス"'));assert(html.includes('data-audio="あめ"'));
 state.v3.dailyPlans[0].steps.forEach(s=>{if(s.kind!=='write')s.completedAt=time;else s.startedAt=time;});assert.match(dailyView({...ctx,state},'five'),/data-v3-check/);
});
function planState(){const state=initialState(),plan=makeDailyPlan(state,{concepts,questions:v3Questions,units:[...allUnits,...kanaLessons.map(k=>({...k,level:'K'}))],resolveQuestion:resolve,time,id:'daily-one'});return storeDailyPlan(state,plan);}
test('Home resumes a stable existing plan and completed day needs explicit extra action',()=>{
 const state=planState();assert.match(v3HomeView(context(state),time),/href="#daily\/daily-one"/);assert.doesNotMatch(v3HomeView(context(state),time),/data-v3-action="create-plan"/);
 for(const step of state.v3.dailyPlans[0].steps)step.completedAt=time;
 const html=v3HomeView(context(state),time);assert.match(html,/今天的循環完成/);assert.match(html,/data-v3-action="extra-plan"/);assert.doesNotMatch(html,/接續今天的學習/);
});
test('Daily overview describes backlog; warmup is overview rather than a future answer sheet',()=>{
 let state=planState();state=startDailyStep(state,'daily-one','recall',time);const html=dailyView(context(state),'daily-one');
 assert.match(html,/本份安排以外還有/);assert.match(html,/今天要能做到什麼/);assert.doesNotMatch(html,/參考答案/);assert.match(html,/data-v3-action="finish-step"/);
});
test('Listen question keeps explanation and option reasons hidden until committed answer',()=>{
 const q=v3Questions.find(q=>q.kind==='listen'),initial=beginV3Session(initialState(),[q.id],{id:'listen-session',source:'concept',reference:`${q.conceptId}:${q.dimension}`,time});
 const before=practiceV3View(context(initial),'listen-session',resolve);assert.doesNotMatch(before,new RegExp(q.explanation));assert.doesNotMatch(before,/參考答案/);assert.match(before,/data-v3-choice=/);assert.doesNotMatch(before,/data-study-choice/);
 const answered=answerV3Session(initial,{sessionId:'listen-session',question:q,value:q.correct,eventId:'answer-one',time,variants:v3Questions});
 assert.match(practiceV3View(context(answered),'listen-session',resolve),/為什麼這個選項/);
});
test('Completion separates same-day correction from cross-day success and reports short deferral',()=>{
 const q=v3Questions[0];let state=beginV3Session(initialState(),[q.id],{id:'session-one',source:'concept',reference:`${q.conceptId}:${q.dimension}`,time});state=answerV3Session(state,{sessionId:'session-one',question:q,value:(q.correct+1)%q.options.length,eventId:'answer-one',time,variants:v3Questions});state=nextV3Question(state,'session-one',time);
 const html=practiceV3View(context(state),'session-one',resolve);assert.match(html,/無提示首答正確/);assert.match(html,/不足兩題間隔/);assert.match(html,/不算跨日成功/);assert.doesNotMatch(html,/data-v3-action="next"/);
});
test('Empty weekly and weakness pages use honest denominators and meaningful entry routes',()=>{
 const ctx=context(initialState());assert.match(weeklyView(ctx,time),/還沒有可比較的跨日紀錄/);assert.match(weeklyView(ctx,time),/分母是/);assert.match(weaknessesView(ctx),/還沒有獨立練習紀錄/);
});
test('Hide comparison removes glyphs, examples and SVG while preserving listening and write routes',()=>{
 const ctx=context(initialState()),shown=confusionView(ctx,'shi-tsu');assert.match(shown,/KanjiVG/);assert.match(shown,/stroke-svg/);ctx.session.v3ui={hiddenPair:'shi-tsu'};const hidden=confusionView(ctx,'shi-tsu');assert.doesNotMatch(hidden,/stroke-svg/);assert.doesNotMatch(hidden,/<h2 class="jp" lang="ja">シ/);assert.match(hidden,/href="#write\/k-30b7"/);assert.match(hidden,/data-audio="シ"/);
});
test('Deep listening transcript is collapsed and course output cannot skip recall via UI claims',()=>{
 const ctx=context(initialState());ctx.session.v3ui={deepUnit:'K01',deepIndex:3};const listen=deepView(ctx,'K01');assert.match(listen,/<details><summary>聽完再展開文字與提示/);ctx.session.v3ui.deepIndex=5;const writing=deepView(ctx,'K01');assert.match(writing,/data-v3-action="save-deep"/);assert.match(writing,/自查/);assert.doesNotMatch(writing,/教師評分/);
});
test('Original and revision drafts safely escape untrusted text; missing routes remain usable',()=>{
 const state=initialState();state.artifacts.push({id:'original-one',kind:'text',item:'N5-01',text:'<img src=x onerror=alert(1)>',points:[],time});state.drafts['text:original-one']={text:'</textarea><script>alert(1)</script>',points:[],time};const html=reviseView(context(state),'original-one');assert.doesNotMatch(html,/<script>|<img src=x/);assert.match(html,/&lt;img/);assert.match(html,/原稿會保留/);assert.match(dailyView(context(state),'missing'),/href="#home"/);
});
test('Controller restores an unfinished ordering draft and committed answer clears the draft',async()=>{
 const q=v3Questions.find(q=>q.kind==='order'),listeners=new Map(),previousDocument=globalThis.document,previousLocation=globalThis.location;
 let state=beginV3Session(initialState(),[q.id],{id:'order-session',source:'lesson',reference:q.unitId,time}),counter=0;
 let ctx=context(state);ctx.session={};const flush=()=>new Promise(resolve=>setImmediate(resolve));
 globalThis.location={hash:'#v3-practice/order-session'};globalThis.document={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);},querySelector:()=>null};
 const setup=()=>createV3({getState:()=>state,getContext:()=>({...ctx,state}),update:async fn=>{state=fn(structuredClone(state));},toast:message=>{throw new Error(message);},render:()=>{},now:()=>time,id:()=>`event-${++counter}`,cacheDraft:()=>{}});
 let controller=setup();
 try{
  controller.onRoute('v3-practice','order-session');
  const click=dataset=>{const button={dataset,isConnected:true};listeners.get('click')({target:{closest:()=>button}});};
  click({v3Token:String(q.answerOrder[0])});await flush();assert.equal(state.drafts['text:order-session'].text,JSON.stringify([q.answerOrder[0]]));
  controller.dispose();ctx.session={};controller=setup();controller.onRoute('v3-practice','order-session');assert.deepEqual(ctx.session.v3ui.order,[q.answerOrder[0]]);
  for(const i of q.answerOrder.slice(1)){click({v3Token:String(i)});await flush();}
  click({v3Action:'submit-order'});await flush();assert.equal(state.v3.sessions[0].answers[q.id].correct,true);assert.equal(state.drafts['text:order-session'],undefined);
 }finally{controller.dispose();globalThis.document=previousDocument;globalThis.location=previousLocation;}
});
