import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {concepts} from '../app/content/concepts.mjs';
import {v3Questions,deepLessons,knownItems,resolveLearningQuestion,allUnits} from '../app/content/catalog.mjs';
import {kanaLessons} from '../app/content/kana.mjs';
import {initialState,exportBackup,parseBackup} from '../app/core/learning.mjs';
import {makeDailyPlan} from '../app/core/daily-plan.mjs';
import {storeDailyPlan} from '../app/core/v3-learning.mjs';
const packs=JSON.parse(await readFile(new URL('../app/assets/offline-manifest.json',import.meta.url),'utf8'));
const audio=JSON.parse(await readFile(new URL('../app/assets/audio.json',import.meta.url),'utf8'));
for(const q of v3Questions){assert(knownItems.has(q.id));if(q.transcript)assert(packs.packs.find(p=>p.id===q.level).files.includes(audio[q.transcript]),q.id);}
for(const lesson of deepLessons)for(const x of lesson.listening)assert(packs.packs.find(p=>p.id===lesson.level).files.includes(audio[x.jp]),lesson.id);
for(const goal of ['K','L','N5','N4','N3'])for(const minutes of [5,15,30]){
 const state=initialState();state.v3.goal=goal;state.settings.dailyMinutes=minutes;
 const plan=makeDailyPlan(state,{concepts,questions:v3Questions,units:[...allUnits,...kanaLessons.map(u=>({...u,level:'K'}))],resolveQuestion:resolveLearningQuestion,time:'2026-10-13T00:00:00.000Z',id:`check-${goal}-${minutes}`});
 assert(knownItems.has(plan.unitId));assert(plan.steps.some(s=>s.kind==='practice'));
 assert.deepEqual(parseBackup(exportBackup(storeDailyPlan(state,plan))).v3.dailyPlans[0],plan);
}
assert.equal(resolveLearningQuestion('N4-12-G2'),null);
console.log(`第三版檢查通過：${concepts.length} 概念、${v3Questions.length} 題、${deepLessons.length} 深化單元、15 組每日安排與音檔包引用。`);
