import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState,exportBackup,parseBackup,mergeStates,validateState} from '../app/core/learning.mjs';
import {beginV3Session,answerV3Session,hintV3Question,nextV3Question} from '../app/core/v3-learning.mjs';
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
 const good=answerV3Session(base,{sessionId:'s',question:qs[0],value:1,eventId:'a',time,variants:[...qs,{...qs[0],id:'unseen-variant'}]});
 const early=structuredClone(good);early.v3.sessions[0].queue.splice(1,0,structuredClone(early.v3.sessions[0].queue[3]));assert.throws(()=>validateState(early),/訂正/);
 const exhausted=structuredClone(base);const s=exhausted.v3.sessions[0];s.cursor=s.queue.length;for(const q of qs)s.answers[q.id]={value:0,correct:true,hinted:false,time};assert.throws(()=>validateState(exhausted));
});
test('Unfinished daily sessions must be attached to their plan',()=>{
 assert.throws(()=>beginV3Session(initialState(),['q0'],{id:'s',source:'daily',reference:'missing-plan',time}),/缺少安排/);
});

function pendingCorrection(state=initialState()){
 const questions=Array.from({length:4},(_,i)=>({id:`correction-q${i}`,conceptId:`c${i}`,kind:'choice',dimension:'grammar',options:['a','b'],correct:0}));
 const variant={...questions[0],id:'correction-variant'};
 let pending=beginV3Session(state,questions.map(q=>q.id),{id:'correction-session',source:'lesson',reference:'N5-01',time});
 for(let i=0;i<3;i++){
  pending=answerV3Session(pending,{sessionId:'correction-session',question:questions[i],value:i===0?1:0,eventId:`correction-first-${i}`,time,variants:[variant]});
  pending=nextV3Question(pending,'correction-session',time);
 }
 assert.deepEqual(pending.v3.sessions[0].queue[3],{questionId:variant.id,repeat:true,sourceId:questions[0].id});
 return {pending,variant};
}
const backupSnapshot=state=>parseBackup(exportBackup(state));

for(const order of ['answer-first','hint-first'])test(`訂正備份拒絕無提示答案與待答提示分歧：${order}`,()=>{
 const {pending,variant}=pendingCorrection();
 const answered=backupSnapshot(answerV3Session(pending,{sessionId:'correction-session',question:variant,value:0,eventId:'unused-correction',time}));
 const hinted=backupSnapshot(hintV3Question(pending,'correction-session',time));
 assert.equal(answered.v3.sessions[0].corrections[3].hinted,false);
 assert.equal(hinted.v3.sessions[0].corrections[3],undefined);
 assert.deepEqual(hinted.v3.sessions[0].hints,[variant.id]);
 const before=[structuredClone(answered),structuredClone(hinted)];
 const [current,incoming]=order==='answer-first'?[answered,hinted]:[hinted,answered];
 assert.throws(()=>mergeStates(current,incoming),/訂正.*提示|提示.*訂正/);
 assert.deepEqual([answered,hinted],before);
});

test('合法有提示訂正備份兩順序結果一致，重複匯入冪等且保留首答與複習證據',()=>{
 const {pending,variant}=pendingCorrection();
 const hinted=backupSnapshot(hintV3Question(pending,'correction-session',time));
 const answered=backupSnapshot(answerV3Session(hinted,{sessionId:'correction-session',question:variant,value:0,eventId:'unused-correction',time}));
 const before=[structuredClone(hinted),structuredClone(answered)];
 const forward=mergeStates(answered,hinted),reverse=mergeStates(hinted,answered);
 assert.deepEqual({...forward,revision:0},{...reverse,revision:0});
 assert.deepEqual(forward.v3.sessions,answered.v3.sessions);
 assert.equal(forward.v3.sessions[0].corrections[3].hinted,true);
 assert.deepEqual(forward.attempts,pending.attempts);
 assert.deepEqual(forward.reviews,pending.reviews);
 assert.deepEqual(mergeStates(forward,answered),forward);
 assert.deepEqual(mergeStates(forward,hinted),forward);
 assert.deepEqual([hinted,answered],before);
});

test('訂正快照合法合併保留V1與V2既有事件、作品、設定、完成、草稿與收藏',()=>{
 const legacyV1=v2();legacyV1.schema=1;
 for(const key of ['bookmarks','practice','practiceHistory','activeExam','examAttempts'])delete legacyV1[key];
 legacyV1.attempts[0].id='v1-old-answer';legacyV1.artifacts[0].id='v1-old-art';legacyV1.completed={K02:time};
 legacyV1.drafts={'text:K02':{text:'あ',points:[],time}};
 const legacyV2=v2(),legacyBefore=[structuredClone(legacyV1),structuredClone(legacyV2)];
 const legacy=mergeStates(legacyV2,parseBackup(JSON.stringify({format:'hiyori-backup',version:1,state:legacyV1})));
 const {pending,variant}=pendingCorrection(legacy);
 const hinted=backupSnapshot(hintV3Question(pending,'correction-session',time));
 const answered=backupSnapshot(answerV3Session(hinted,{sessionId:'correction-session',question:variant,value:0,eventId:'unused-correction',time}));
 for(const merged of [mergeStates(hinted,answered),mergeStates(answered,hinted)]){
  assert.equal(merged.schema,3);
  assert.deepEqual(merged.attempts,backupSnapshot(pending).attempts);
  assert.deepEqual(merged.artifacts,[...legacyV2.artifacts,...legacyV1.artifacts]);
  assert.deepEqual(merged.settings,legacyV2.settings);assert.deepEqual(merged.bookmarks,legacyV2.bookmarks);
  assert.deepEqual(merged.completed,{...legacyV2.completed,...legacyV1.completed});assert.deepEqual(merged.drafts,legacyV1.drafts);
 }
 assert.deepEqual([legacyV1,legacyV2],legacyBefore);
});

test('訂正備份兩份不同答案仍在兩順序拒絕',()=>{
 const {pending,variant}=pendingCorrection();
 const left=backupSnapshot(answerV3Session(pending,{sessionId:'correction-session',question:variant,value:0,eventId:'unused-correction',time}));
 const right=backupSnapshot(answerV3Session(pending,{sessionId:'correction-session',question:variant,value:1,eventId:'unused-correction',time}));
 const before=[structuredClone(left),structuredClone(right)];
 assert.throws(()=>mergeStates(left,right),/訂正答案衝突/);
 assert.throws(()=>mergeStates(right,left),/訂正答案衝突/);
 assert.deepEqual([left,right],before);
});

test('舊schema3原題訂正仍可匯入並與較早快照合法合併',()=>{
 const {pending,variant}=pendingCorrection();
 const oldPending=structuredClone(pending);oldPending.v3.sessions[0].queue[3].questionId='correction-q0';
 const restored=backupSnapshot(oldPending);
 const answered=backupSnapshot(answerV3Session(restored,{sessionId:'correction-session',question:{...variant,id:'correction-q0'},value:0,eventId:'unused-correction',time}));
 for(const merged of [mergeStates(restored,answered),mergeStates(answered,restored)]){
  assert.deepEqual(merged.v3.sessions,answered.v3.sessions);
  assert.deepEqual(merged.attempts,restored.attempts);assert.deepEqual(merged.reviews,restored.reviews);
 }
 assert.equal(answered.v3.sessions[0].answers['correction-q0'].correct,false);
 assert.equal(answered.v3.sessions[0].corrections[3].correct,true);
});
