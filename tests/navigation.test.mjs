import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationContext,navigationView} from '../app/ui/navigation.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {allUnits,unitQuestions,deepLessons} from '../app/content/catalog.mjs';
import {createPractice} from '../app/core/study.mjs';
import {beginV3Session} from '../app/core/v3-learning.mjs';
import {createV2} from '../app/v2.mjs';
const ctx=()=>({state:initialState(),session:{}});
const routes=n=>n.trail.map(c=>c.route);
const time='2026-10-16T12:00:00.000Z';

function coursePracticeContext(id){
 const c=ctx(),unit=allUnits.find(u=>u.id===id);
 c.state.practice=createPractice({id:'navigation-practice',unitId:id,questionIds:unitQuestions(unit).map(q=>q.id),time});
 return c;
}
function v3RecallContext(source,reference,questionIds){
 const c=ctx();
 if(source==='daily')c.state.v3.dailyPlans.push({id:reference,day:'2026-10-16',minutes:5,goal:'N5',unitId:'N5-03',conceptIds:['c-n5-no'],newConceptIds:[],newCount:0,dueTotal:1,remainingDue:0,reason:'合成安排：日本語の本',steps:[{id:'recall',kind:'practice',title:'回想の',questionIds,sessionId:null,startedAt:null,completedAt:null},{id:'write',kind:'write',title:'自己寫',questionIds:[],sessionId:null,startedAt:null,completedAt:null}],createdAt:time,updatedAt:time});
 c.state=beginV3Session(c.state,questionIds,{id:'navigation-session',source,reference,time,...(source==='daily'?{planId:reference,stepId:'recall'}:{})});
 return c;
}

test('N5-09 course recall breadcrumbs retain the course link without revealing the time particle',()=>{
 const c=coursePracticeContext('N5-09'),unit=allUnits.find(u=>u.id==='N5-09'),n=navigationContext(c,'practice'),html=navigationView(n);
 assert.equal(unit.title,'幾點開始：時間的に');
 assert.doesNotMatch(html,/幾點開始：時間的に|に/);
 assert.deepEqual(n.trail.find(c=>c.route==='study/N5-09'),{label:'N5-09',route:'study/N5-09'});
 assert.match(html,/<a href="#study\/N5-09">N5-09<\/a>/);
 assert.equal(n.section,'practice-hub');assert.equal(n.trail.at(-1).label,'課內回想');
 assert.match(html,/<span aria-current="page">課內回想<\/span>/);
});

test('N5-03 deep recall breadcrumbs retain the deep link without revealing the noun particle',()=>{
 const lesson=deepLessons.find(l=>l.id==='N5-03'),c=v3RecallContext('lesson',lesson.id,lesson.questionIds),n=navigationContext(c,'v3-practice','navigation-session'),html=navigationView(n);
 assert.equal(lesson.title,'從核心物品往前理解の');
 assert.doesNotMatch(html,/從核心物品往前理解の|の/);
 assert.deepEqual(n.trail.find(c=>c.route==='deep/N5-03'),{label:'N5-03',route:'deep/N5-03'});
 assert.match(html,/<a href="#deep\/N5-03">N5-03<\/a>/);
 assert.equal(n.section,'practice-hub');assert.equal(n.trail.at(-1).label,'回想練習');
 assert.match(html,/<span aria-current="page">回想練習<\/span>/);
});

test('Recall navigation uses course IDs across every course family while study pages keep their titles',()=>{
 for(const unit of allUnits){
  const c=coursePracticeContext(unit.id),n=navigationContext(c,'practice');
  assert.equal(n.trail.find(c=>c.route===`study/${unit.id}`).label,unit.id,unit.id);
  assert.equal(n.section,'practice-hub');assert.equal(n.trail.at(-1).label,'課內回想');
  assert.equal(navigationContext(c,'study',unit.id).trail.at(-1).label,unit.title);
  assert.equal(navigationContext(c,'lesson',unit.id).trail.at(-1).label,unit.title);
 }
});

test('All deep lesson recall sources use IDs while deep learning pages retain their full titles',()=>{
 for(const lesson of deepLessons){
  const c=v3RecallContext('lesson',lesson.id,lesson.questionIds),n=navigationContext(c,'v3-practice','navigation-session');
  assert.equal(n.trail.find(c=>c.route===`deep/${lesson.id}`).label,lesson.id,lesson.id);
  assert.equal(navigationContext(c,'deep',lesson.id).trail.at(-1).label,lesson.title);
 }
});

for(const [source,reference,questionIds,parent] of [
 ['daily','synthetic-daily',['v3q-n5-no-category'],'daily/synthetic-daily'],
 ['concept','c-n5-no:language',['v3q-n5-no-category'],'weaknesses'],
 ['confusion','shi-tsu',['v3q-k-shi-tsu-stroke'],'confusion/shi-tsu'],
 ['kana','hira:pair:wa',['km-h-3092-pair'],'kana-memory'],
 ['lesson','N5-03',deepLessons.find(l=>l.id==='N5-03').questionIds,'deep/N5-03'],
])test(`V3 ${source} recall navigation preserves its route, generic current page and backup state`,()=>{
 const c=v3RecallContext(source,reference,questionIds),before=structuredClone(c),backup=JSON.parse(exportBackup(c.state)).state;
 const n=navigationContext(c,'v3-practice','navigation-session'),html=navigationView(n);
 assert(routes(n).includes(parent));assert.equal(n.section,'practice-hub');
 assert.deepEqual(n.trail.at(-1),{label:'回想練習',route:'v3-practice/navigation-session'});
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 assert.match(html,/<span aria-current="page">回想練習<\/span>/);
 assert.doesNotMatch(html,/[にのシツをヲ]/);
 assert.deepEqual(c,before);assert.deepEqual(JSON.parse(exportBackup(c.state)).state,backup);
 const restored=parseBackup(exportBackup(c.state));
 assert.deepEqual(navigationContext({...c,state:restored},'v3-practice','navigation-session'),n);
 assert.deepEqual(restored,parseBackup(JSON.stringify({format:'hiyori-backup',version:3,state:backup})));
});

test('Course recall navigation does not rewrite practice answers, hints, drafts or exported progress',()=>{
 const c=coursePracticeContext('N5-09'),qid=c.state.practice.questionIds[0];
 c.state.practice.answers[qid]={value:0,correct:false,hinted:true,time};c.state.practice.hints=[qid];
 c.state.drafts['text:navigation-practice']={text:'合成未提交答案',points:[],time};
 const before=structuredClone(c),backup=JSON.parse(exportBackup(c.state)).state;
 navigationView(navigationContext(c,'practice'));
 assert.deepEqual(c,before);assert.deepEqual(JSON.parse(exportBackup(c.state)).state,backup);
 assert.deepEqual(navigationContext({...c,state:parseBackup(exportBackup(c.state))},'practice'),navigationContext(c,'practice'));
});

test('support deep links reconstruct all parents and select courses without history',()=>{
 const c=ctx(),n=navigationContext(c,'study','READ-N2-01');
 assert.deepEqual(routes(n),['home','courses','support','support/reading','study/READ-N2-01']);
 assert.equal(n.section,'courses');assert.match(n.trail.at(-1).label,/圖書館/);
 assert.equal(navigationContext(c,'support','resources').section,'courses');
 assert.equal(navigationContext(c,'support','reading').rail,'courses');
});
test('all course families have working parents and life scenarios retain their category',()=>{
 for(const u of allUnits){const n=navigationContext(ctx(),'study',u.id);assert.equal(n.trail.at(-1).label,u.title);assert.equal(n.section,'courses');assert(n.trail.length>=4);if(u.id.startsWith('S-'))assert(routes(n).includes(`topics/${u.topic}`));}
});
test('saved course practice and V3 sessions retain source after refresh',()=>{
 const c=ctx();c.state.practice={unitId:'READ-N2-01'};
 const n=navigationContext(c,'practice');assert.equal(n.section,'practice-hub');assert(routes(n).includes('study/READ-N2-01'));assert.equal(n.trail.at(-1).label,'課內回想');
 c.state.v3.sessions=[{id:'s',source:'daily',reference:'d'}];
 assert.deepEqual(routes(navigationContext(c,'v3-practice','s')),['home','daily/d','v3-practice/s']);
});
test('hidden kana practice and writing navigation never reveal target glyphs or answers',()=>{
 const c=ctx();c.state.v3.sessions=[{id:'s',source:'confusion',reference:'h-su-mu'}];
 for(const [name,param] of [['write','h-3042'],['confusion','h-su-mu'],['v3-practice','s']]){const html=navigationView(navigationContext(c,name,param));assert.doesNotMatch(html,/[あすむ]/);}
 assert(routes(navigationContext(c,'write','h-3042')).includes('kana'));
 assert(routes(navigationContext(c,'stroke','j-62c5')).includes('library/kanji'));
});
test('every registered route has one active section and unknown routes show home',()=>{
 const names=['home','courses','level','topics','support','study','lesson','life','kana','kana-memory','unit','stroke','write','quiz','review','practice','practice-hub','library','exam','exam-session','exam-result','profile','daily','v3-practice','weaknesses','confusion','deep','weekly','revise'];
 for(const name of names){const n=navigationContext(ctx(),name);assert(['home','courses','practice-hub','exam','profile'].includes(n.section));const html=navigationView(n);assert.equal((html.match(/aria-current="page"/g)||[]).length,1);assert.match(html,/aria-label="目前位置"/);}
 assert.equal(navigationContext(ctx(),'unknown').section,'home');
});
test('breadcrumb text and URL are escaped, current page is not a self link',()=>{
 const html=navigationView({trail:[{label:'<script>',route:'home" bad="'},{label:'末頁 & 位置',route:'last'}]});
 assert(!html.includes('<script>'));assert.match(html,/&quot;/);assert.match(html,/<span aria-current="page">末頁 &amp; 位置<\/span>/);assert(!html.includes('href="#last"'));
});
test('review, vocabulary and ability sessions never link to nonexistent courses',()=>{
 for(const [id,parent] of [['review-set','review'],['library-words','library/words'],['skill-set','practice-hub']]){
  const c=ctx();c.state.practice={unitId:id};const n=navigationContext(c,'practice');
  assert(routes(n).includes(parent));assert(!routes(n).some(r=>r.startsWith('study/')));
 }
});
test('topic deep link, dropdown and refresh use the same category',()=>{
 const c=ctx(),listeners=new Map(),keys=['document','location','addEventListener','removeEventListener'];
 const previous=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 globalThis.document={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:()=>{},querySelector:()=>null};
 globalThis.location={href:'http://localhost/?qa=1#topics/food',hash:'#topics/food'};
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
 let controller;
 try{
  controller=createV2({getState:()=>c.state,getContext:()=>c,update:()=>{},toast:()=>{},render:()=>controller.onRoute('topics','food'),now:()=>new Date().toISOString(),id:()=>'',cacheDraft:()=>{}});
  controller.onRoute('topics','food');assert.equal(c.session.topic,'food');
  listeners.get('change')({target:{value:'transport',dataset:{studyTopic:''}}});
  assert.equal(globalThis.location.hash,'topics/transport');
  controller.onRoute('topics','transport');assert.equal(c.session.topic,'transport');
  assert.match(controller.views.topics(),/<option value="transport" selected/);
 }finally{controller?.dispose();for(const key of keys){if(previous[key])Object.defineProperty(globalThis,key,previous[key]);else delete globalThis[key];}}
});
