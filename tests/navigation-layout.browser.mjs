// Optional real-browser regression: see docs/navigation-recall-timer-validation.md.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {createPractice} from '../app/core/study.mjs';
import {beginV3Session} from '../app/core/v3-learning.mjs';
import {deepLessons} from '../app/content/deep-lessons.mjs';
import {unitById,resolveQuestion} from '../app/content/catalog.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=new URL(process.env.HIYORI_QA_URL||'http://127.0.0.1:18107/?qa=1');
assert(['127.0.0.1','localhost'].includes(base.hostname)&&base.searchParams.get('qa')==='1','Use an isolated localhost QA URL');
const phase=process.argv[2]||'green';assert(['red','green'].includes(phase));
const output=path.join(process.env.HIYORI_EVIDENCE_DIR||fileURLToPath(new URL('../../navigation-timer-evidence/',import.meta.url)),phase);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
const results=[],consoleErrors=[],failedResponses=[];
const settle=page=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
async function visit(page,route){await page.goto(base.href+'#'+route);await page.locator('#main[data-screen="'+route.split('/')[0]+'"]').waitFor();await settle(page);}
async function load(page,state){await visit(page,'profile');await page.locator('#backup-file').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(exportBackup(state))});await page.locator('#import-dialog[open]').waitFor();await page.locator('[data-action="confirm-import"]').click();await page.locator('#import-dialog').waitFor({state:'hidden'});}
async function snapshot(page,name){await visit(page,'profile');const waiting=page.waitForEvent('download');await page.locator('[data-action="export-backup"]').click();const download=await waiting,target=path.join(output,name+'.json');await download.saveAs(target);return parseBackup(await readFile(target,'utf8'));}
async function scenario(name,width,run){
 const context=await browser.newContext({viewport:{width,height:720},acceptDownloads:true}),page=await context.newPage();
 page.on('pageerror',e=>consoleErrors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))consoleErrors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failedResponses.push([r.status(),r.url()]);});
 try{await visit(page,'home');const details=await run(page);results.push({name,width,status:'passed',details});}
 catch(error){await page.screenshot({path:path.join(output,name+'-failed.png')}).catch(()=>{});results.push({name,width,status:'failed',error:error.message});}
 finally{await context.close();}
}
function geometry(page){return page.evaluate(()=>{
 const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right};};
 const nav=document.querySelector('#location-context'),timer=document.querySelector('.exam-timer'),count=document.querySelector('#exam-countdown'),r=count.getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
 return {nav:rect(nav),timer:rect(timer),count:rect(count),visible:hit===count||count.contains(hit),time:count.textContent,scrollY,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};
});}
function visible(g){assert(g.scrollY>140,'Scroll far enough to engage sticky elements');assert(g.nav.top<=1&&g.nav.bottom>0,'Location bar remains visible');assert(g.timer.top>=g.nav.bottom-.75,'Timer must sit below location bar');assert(g.count.top>=0&&g.count.bottom<g.viewport-80,'Countdown stays inside the visible content area');assert(g.visible,'Countdown is not occluded');assert(!g.overflow,'No horizontal overflow');}
try{
 for(const [name,source,course,answer] of [['course-recall','practice','N5-09','に'],['deep-recall','v3-practice','N5-03','の']])await scenario(name,390,async page=>{
  const time=new Date().toISOString();let state=initialState(),route='practice',parent='study/'+course;
  if(source==='practice')state.practice=createPractice({id:'qa-course',unitId:course,questionIds:['N5-09-c'],time});
  else{const lesson=deepLessons.find(l=>l.id===course);state=beginV3Session(state,lesson.questionIds,{id:'qa-deep',source:'lesson',reference:course,time});route='v3-practice/qa-deep';parent='deep/'+course;}
  await load(page,state);const before=await snapshot(page,name+'-before');await visit(page,route);
  await page.screenshot({path:path.join(output,name+'.png')});
  const nav=page.locator('#location-context'),text=await nav.innerText();assert(!text.includes(answer),'Recall navigation must not reveal '+answer);assert(!text.includes(source==='practice'?unitById.get(course).title:deepLessons.find(l=>l.id===course).title));assert.equal(await nav.locator('a[href="#'+parent+'"]').innerText(),course);
  assert.equal(await page.title(),source==='practice'?'日和｜課內回想':'日和｜回想練習');assert.equal(await page.locator('#bottom-nav [aria-current="page"]').getAttribute('href'),'#practice-hub');
  await page.reload();await settle(page);assert(!((await nav.innerText()).includes(answer)));assert.deepEqual(await snapshot(page,name+'-after-navigation'),before);
  await visit(page,route);if(source==='practice'){await page.locator('#practice-answer').fill(answer);await page.locator('[data-study-action="submit-text"]').click();await page.locator('[data-study-action="next"]:not([disabled])').waitFor();}
  else{const q=resolveQuestion(state.v3.sessions[0].questionIds[0]);await page.locator('[data-v3-choice="'+q.correct+'"]').click();await page.locator('[data-v3-action="next"]').waitFor();}
  const answered=await snapshot(page,name+'-answered');assert.equal(answered.attempts.length,before.attempts.length+1);assert.equal(answered.attempts.at(-1).correct,true);assert.equal(answered.attempts.at(-1).hinted,false);
  if(source==='practice')assert.deepEqual(answered.practice.questionIds,state.practice.questionIds);else assert.deepEqual(answered.v3.sessions[0].questionIds,state.v3.sessions[0].questionIds);
  await visit(page,route);await page.locator('#location-context a[href="#'+parent+'"]').click();await page.locator('#main[data-screen="'+parent.split('/')[0]+'"]').waitFor();assert((await nav.innerText()).includes(source==='practice'?unitById.get(course).title:deepLessons.find(l=>l.id===course).title));return {parent,course,answerProtected:true,progress:'unchanged by navigation; first answer saved'};
 });
 for(const width of [320,390,768,1024,1440])await scenario('timer-'+width,width,async page=>{
  await visit(page,'exam');await page.locator('[data-start-exam="N5-A"][data-exam-mode="full"]').click();await page.locator('#exam-countdown').waitFor();const samples=[];
  for(const distance of [280,450]){await page.mouse.wheel(0,distance);await settle(page);const g=await geometry(page);samples.push(g);await writeFile(path.join(output,'timer-'+width+'-geometry.json'),JSON.stringify(samples,null,2));await page.screenshot({path:path.join(output,'timer-'+width+'.png')});visible(g);}
  if(width===1440){for(const narrow of [320,240]){await page.setViewportSize({width:narrow,height:720});await settle(page);const g=await geometry(page);samples.push(g);visible(g);if(narrow===240){assert(g.nav.height>samples[0].nav.height,'Exercise a wrapped location bar');await page.screenshot({path:path.join(output,'timer-wrapped-240.png')});}}}
  const previous=await page.locator('#exam-countdown').innerText();await page.waitForFunction(previous=>document.querySelector('#exam-countdown')?.textContent!==previous,previous,{timeout:4000});visible(await geometry(page));
  const before=await snapshot(page,'timer-'+width+'-before-reload');await visit(page,'exam-session');await page.reload();await page.locator('#exam-countdown').waitFor();await page.mouse.wheel(0,450);await settle(page);visible(await geometry(page));const after=await snapshot(page,'timer-'+width+'-after-reload');assert.deepEqual(after.activeExam,before.activeExam);assert.deepEqual(after.attempts,before.attempts);
  return {samples,deadline:after.activeExam.sectionEndsAt,reload:'same exam ID, question IDs and deadline; countdown continues'};
 });
 const report={phase,results,consoleErrors,failedResponses};await writeFile(path.join(output,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 assert.deepEqual(consoleErrors,[]);assert.deepEqual(failedResponses,[]);assert.equal(results.filter(r=>r.status==='failed').length,0,'All real-browser regressions must pass');
}finally{await browser.close();}
