import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {families,familyById,familyQuestion,familyQuestions,familyIds,familyMark,familyVisibleItems,validFamilyReference} from '../app/content/kana-family.mjs';
import {startFamily} from '../app/core/kana-family.mjs';import {initialState,recordAnswer,exportBackup,parseBackup,mergeStates} from '../app/core/learning.mjs';
import {answerV3Session,nextV3Question,organizeV3} from '../app/core/v3-learning.mjs';import {recordKanaExposure} from '../app/core/kana-studio.mjs';
import {resolveLearningQuestion} from '../app/content/catalog.mjs';import {extraKanaExposure,pairExposure} from '../app/content/kana-recall.mjs';import {startWeekCheck,weekEvidence} from '../app/core/kana-recall.mjs';
const time='2026-10-22T12:00:00.000Z';
test('58 families contain only 132 existing same-script canonical variants, including the contracted forms actually present',()=>{
 assert.equal(families.length,58);assert.equal(new Set(families.flatMap(f=>f.members.map(k=>k.id))).size,132);assert.equal(families.filter(f=>f.script==='hira').length,29);
 for(const f of families){assert([2,3].includes(f.members.length));assert.equal(f.id,f.members[0].id);assert.equal(familyMark(f.members[0].id),'plain');assert(f.members.every(k=>k.script===f.script&&k.glyph.normalize('NFD').replace(/[\u3099\u309a]/g,'')===f.members[0].glyph));assert.equal(new Set(f.members.map(k=>k.reading)).size,f.members.length);}
 assert.deepEqual(familyById.get('h-306f').members.map(k=>k.glyph),['は','ば','ぱ']);assert.deepEqual(familyById.get('h-3057').members.map(k=>k.glyph),['し','じ']);assert.deepEqual(familyById.get('h-3061').members.map(k=>k.glyph),['ち','ぢ']);assert.equal(familyMark('h-3071'),'ring');assert.equal(familyMark('h-3070'),'dots');assert.equal(familyMark('bad'),null);assert(!familyById.has('h-3061-3083'));
});
test('132 stable family listening questions have exactly the family choices and valid normal/slow offline audio',()=>{
 const audio=JSON.parse(fs.readFileSync('app/assets/audio.json')),pack=JSON.parse(fs.readFileSync('app/assets/offline-manifest.json')).packs.find(p=>p.id==='K');assert.equal(familyQuestions.length,132);assert.equal(new Set(familyQuestions.map(q=>q.id)).size,132);
 for(const f of families)for(const q of f.members.map(k=>familyQuestion('kg:'+f.id+':'+k.id))){assert(q);assert.equal(q.kind,'listen');assert.equal(q.dimension,'listening');assert.equal(q.options[q.correct],q.transcript);assert.deepEqual(new Set(q.options),new Set(f.members.map(k=>k.glyph)));assert.equal(q.audio,undefined);assert(pack.files.includes(audio[q.transcript]));assert.equal(resolveLearningQuestion(q.id).reviewItem,q.reviewItem);assert.deepEqual(new Set(extraKanaExposure(q.id)),new Set(f.members.map(k=>k.id).filter(id=>id!==q.reviewItem)));}
 assert.equal(familyQuestion('kg:unknown'),null);assert.deepEqual(extraKanaExposure('unknown'),[]);assert.deepEqual(extraKanaExposure('kd:shi-tsu:k-30b7'),[pairExposure('kd:shi-tsu:k-30b7')]);
});
test('family references and rounds are exact and reject reordered, mixed or non-base references',()=>{
 for(const f of families){const ids=familyIds(f.id);assert.equal(ids.length,f.members.length);assert(validFamilyReference(f.id,ids));assert(!validFamilyReference(f.id,ids.slice().reverse()));assert(!validFamilyReference(f.id,[...ids,ids[0]]));}
 assert.deepEqual(familyIds('h-3070'),[]);assert(!validFamilyReference('h-3070',familyIds('h-306f')));assert(!validFamilyReference('bad',[]));assert.equal(startFamily(initialState(),{family:'bad',id:'bad',time}).v3.sessions.length,0);
});
test('family rounds preserve first answers and pending IDs through backup and merge',()=>{
 let s=startFamily(initialState(),{family:'h-306f',id:'round',time}),q=familyQuestion(familyIds('h-306f')[0]);s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time});const first=structuredClone(s.v3.sessions[0].answers);
 s=answerV3Session(s,{sessionId:'round',question:q,value:1,eventId:'b',time});assert.deepEqual(s.v3.sessions[0].answers,first);s=parseBackup(exportBackup(s));assert.equal(startFamily(s,{family:'h-306f',id:'again',time}).v3.sessions.length,1);assert.deepEqual(mergeStates(initialState(),s).v3.sessions[0].answers,first);
 const bad=structuredClone(s);bad.v3.sessions[0].reference='h-304b';assert.throws(()=>parseBackup(exportBackup(bad)));s=nextV3Question(s,'round',time);assert.equal(s.v3.sessions[0].cursor,1);
});
test('any member cue from today or the open round marks new family answers hinted, excluding prior-day and future cues',()=>{
 const q=familyQuestion(familyIds('h-306f')[0]);for(const item of ['h-306f','h-3070','h-3071'])for(const [cue,expected]of [['2026-10-22T11:00:00Z',true],['2026-10-21T11:00:00Z',false],['2027-01-01T00:00:00Z',false]]){let s=recordKanaExposure(initialState(),[item],cue);s=startFamily(s,{family:'h-306f',id:'round',time});s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time});assert.equal(s.attempts[0].hinted,expected);assert.equal(s.attempts[0].dimension,'listening');assert(parseBackup(exportBackup(s)));}
 let s=startFamily(initialState(),{family:'h-306f',id:'round',time});s=recordKanaExposure(s,['h-3071'],time);s=answerV3Session(s,{sessionId:'round',question:q,value:q.correct,eventId:'a',time:'2026-10-23T12:00:00Z'});assert(s.v3.sessions[0].answers[q.id].hinted);
});
test('visible family exposure follows only the selected glyph, word and existing mnemonic, rejecting an unrelated selection',()=>{
 assert(familyVisibleItems('h-306f','h-3071').includes('h-3071'));assert(!familyVisibleItems('h-306f','h-306f').includes('h-3071'));assert.deepEqual(familyVisibleItems('h-306f','h-3042'),[]);assert.deepEqual(familyVisibleItems('bad','h-3042'),[]);
});
test('third-member family feedback excludes week evidence and survives organizing and backup',()=>{
 let s=recordAnswer(initialState(),{id:'old',item:'h-3071',dimension:'recognition',correct:true,hinted:false,time:'2026-09-01T00:00:00Z'});s=startWeekCheck(s,{id:'week',time:'2026-10-01T00:00:00Z'});s=startFamily(s,{family:'h-306f',id:'family',time:'2026-10-02T00:00:00Z'});
 for(const [i,id]of familyIds('h-306f').entries()){const q=familyQuestion(id);s=answerV3Session(s,{sessionId:'family',question:q,value:q.correct,eventId:'f-'+i,time:'2026-10-02T00:0'+i+':00Z'});s=nextV3Question(s,'family','2026-10-02T00:03:00Z');}
 const q=resolveLearningQuestion(s.v3.sessions.find(s=>s.id==='week').questionIds[0]);s=answerV3Session(s,{sessionId:'week',question:q,value:q.correct,eventId:'check',time:'2026-10-20T00:00:00Z'});s=nextV3Question(s,'week','2026-10-20T00:01:00Z');const before=weekEvidence(s,s.v3.sessions.find(s=>s.id==='week'));assert.equal(before.total,0);assert.equal(before.excluded,1);s=organizeV3(s,time);assert(s.v3.sessions.some(s=>s.id==='family'));s=parseBackup(exportBackup(s));assert.deepEqual(weekEvidence(s,s.v3.sessions.find(s=>s.id==='week')),before);
});
