import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationContext,navigationView} from '../app/ui/navigation.mjs';
import {initialState} from '../app/core/learning.mjs';
import {allUnits} from '../app/content/catalog.mjs';
import {createV2} from '../app/v2.mjs';
const ctx=()=>({state:initialState(),session:{}});
const routes=n=>n.trail.map(c=>c.route);

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
