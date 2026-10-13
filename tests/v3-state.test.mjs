import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,hintV3Question} from '../app/core/v3-learning.mjs';
const time='2026-10-13T00:00:00.000Z';
test('Backup branches reject pending hints that contradict immutable independent answers and divergent repeat variants',()=>{
 const qs=Array.from({length:4},(_,i)=>({id:`q${i}`,conceptId:'c',kind:'choice',dimension:'grammar',options:['a','b'],correct:0}));
 const base=beginV3Session(initialState(),qs.map(q=>q.id),{id:'session',source:'concept',reference:'c:grammar',time});
 const answered=answerV3Session(base,{sessionId:'session',question:qs[0],value:0,eventId:'e',time,variants:qs});
 const hinted=hintV3Question(base,'session',time);assert.throws(()=>mergeStates(answered,hinted),/提示/);
 const variant=id=>({...qs[0],id});
 const left=answerV3Session(base,{sessionId:'session',question:qs[0],value:1,eventId:'e',time,variants:[variant('v-left')]});
 const right=answerV3Session(base,{sessionId:'session',question:qs[0],value:1,eventId:'e',time,variants:[variant('v-right')]});
 assert.throws(()=>mergeStates(left,right),/分支/);
 assert.deepEqual(mergeStates(left,base).v3.sessions,left.v3.sessions);
});
function v2(){return {schema:2,settings:{dailyMinutes:30,roman:false,ruby:true,fontSize:19},attempts:[{id:'a-old',item:'h-3042',dimension:'recognition',correct:false,hinted:true,time}],reviews:{},completed:{K01:time},artifacts:[{id:'old-art',item:'L07',kind:'text',text:'お茶をください。',points:[],time}],drafts:{},lastLesson:'L07',revision:4,bookmarks:['word-old'],practice:null,practiceHistory:[],activeExam:null,examAttempts:[]};}
test('V3升級保留V2原事件、作品、設定與收藏，不修改來源',()=>{
 const old=v2(),snapshot=structuredClone(old),s=upgradeState(old);
 assert.equal(s.schema,3);assert.equal(s.v3.goal,'K');assert.deepEqual(s.attempts,old.attempts);assert.deepEqual(s.artifacts,old.artifacts);assert.deepEqual(s.settings,old.settings);assert.deepEqual(s.bookmarks,old.bookmarks);assert.deepEqual(old,snapshot);
 assert.equal(parseBackup(JSON.stringify({format:'hiyori-backup',version:2,state:old})).schema,3);
});
test('第三版備份往返，非法新增欄位和未知目標拒絕',()=>{
 const s=initialState();assert.equal(s.schema,3);s.v3.goal='N4';assert.equal(JSON.parse(exportBackup(s)).version,3);assert.deepEqual(parseBackup(exportBackup(s)),s);
 const bad=structuredClone(s);bad.v3.goal='N1';assert.throws(()=>validateState(bad));bad.v3.goal='K';bad.v3.cloudToken='secret';assert.throws(()=>validateState(bad));
});
test('第三版空白裝置恢復目標，有個人資料時保留本機目標',()=>{
 const incoming=upgradeState(v2());incoming.v3.goal='N3';assert.equal(mergeStates(initialState(),incoming).v3.goal,'N3');
 const current=upgradeState(v2());current.v3.goal='N4';assert.equal(mergeStates(current,incoming).v3.goal,'N4');
});
test('作品修訂合併保留原稿與子稿，分歧關係拒絕',()=>{
 const s=upgradeState(v2());s.artifacts.push({id:'child',item:'L07',kind:'text',text:'お茶を一つください。',points:[],time});s.v3.artifactParents.child='old-art';
 const merged=mergeStates(initialState(),parseBackup(exportBackup(s)));assert.equal(merged.artifacts.length,2);assert.equal(merged.v3.artifactParents.child,'old-art');
 const bad=structuredClone(s);bad.v3.artifactParents.child='child';assert.throws(()=>validateState(bad));
 const missing=structuredClone(s);missing.v3.artifactParents.child='missing';assert.throws(()=>validateState(missing));
});

test('Imported sessions reject immediate or duplicate repeats and exhausted unfinished cursors',()=>{
 const qs=Array.from({length:4},(_,i)=>({id:'q'+i,conceptId:'c',kind:'choice',dimension:'grammar',options:['a','b'],correct:0}));
 const base=beginV3Session(initialState(),qs.map(q=>q.id),{id:'s',source:'concept',reference:'c:grammar',time});
 const good=answerV3Session(base,{sessionId:'s',question:qs[0],value:1,eventId:'a',time,variants:qs});
 const early=structuredClone(good);early.v3.sessions[0].queue.splice(1,0,structuredClone(early.v3.sessions[0].queue[3]));assert.throws(()=>validateState(early),/訂正/);
 const exhausted=structuredClone(base);const s=exhausted.v3.sessions[0];s.cursor=s.queue.length;for(const q of qs)s.answers[q.id]={value:0,correct:true,hinted:false,time};assert.throws(()=>validateState(exhausted));
});
test('Unfinished daily sessions must be attached to their plan',()=>{
 assert.throws(()=>beginV3Session(initialState(),['q0'],{id:'s',source:'daily',reference:'missing-plan',time}),/缺少安排/);
});
