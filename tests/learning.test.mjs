import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, recordAnswer, dueReviews, completeLesson, mergeStates, parseBackup, exportBackup} from '../app/core/learning.mjs';
const now = '2026-10-12T12:00:00.000Z';
const answer = (s, overrides={}) => recordAnswer(s, {id:'a1',item:'h-3042',dimension:'recognition',correct:true,hinted:false,time:now,...overrides});
test('認字與聽辨的弱點分開，不覆蓋既有能力',()=>{
 const s=answer(initialState());const next=answer(s,{id:'a2',dimension:'listening',correct:false});
 assert.equal(next.reviews['h-3042:recognition'].correct,1);assert.equal(next.reviews['h-3042:listening'].correct,0);
 assert.equal(dueReviews(next,now).length,1);
});
test('同一作答事件重送不增加計數',()=>{const s=answer(initialState());assert.deepEqual(answer(s),s);});
test('提示後答對不計入無提示掌握，也不延長複習',()=>{const s=answer(initialState(),{hinted:true});assert.equal(s.reviews['h-3042:recognition'].independent,0);assert.equal(s.reviews['h-3042:recognition'].step,0);});
test('同一天反覆答對不推進複習間隔',()=>{const s=answer(initialState());const next=answer(s,{id:'a2'});assert.equal(next.reviews['h-3042:recognition'].step,s.reviews['h-3042:recognition'].step);});
test('隔日成功回想才增加間隔，錯誤縮短到立即可重練',()=>{
 const s=answer(initialState());const next=answer(s,{id:'a2',time:'2026-10-13T12:00:00.000Z'});
 assert.ok(next.reviews['h-3042:recognition'].step>s.reviews['h-3042:recognition'].step);
 const wrong=answer(next,{id:'a3',correct:false,time:'2026-10-14T12:00:00.000Z'});assert.equal(wrong.reviews['h-3042:recognition'].step,0);assert.equal(dueReviews(wrong,'2026-10-14T12:00:01.000Z').length,1);
});
test('保留 0，禁止 NaN、未知版本與原型污染鍵值的備份',()=>{
 const s=answer(initialState(),{correct:false});const copy=parseBackup(exportBackup(s));assert.equal(copy.reviews['h-3042:recognition'].correct,0);
 assert.throws(()=>parseBackup('{"format":"hiyori-backup","version":99,"state":{}}'));
 assert.throws(()=>parseBackup('{"format":"hiyori-backup","version":1,"state":{"__proto__":{"x":1}}}'));
 const invalid=JSON.parse(exportBackup(s));invalid.state.reviews['h-3042:recognition'].correct='NaN';assert.throws(()=>parseBackup(JSON.stringify(invalid)));
});
test('備份重複合併不重複作答，作品與完成課保留',()=>{
 let s=completeLesson(answer(initialState()),'K01',now);s.artifacts=[{id:'w1',item:'h-3042',kind:'text',text:'あ',points:[],time:now}];
 const restored=parseBackup(exportBackup(s));assert.deepEqual(mergeStates(s,restored),s);
});
test('兩份進度合併由事件重建能力，不把計數直接相加',()=>{
 const a=answer(initialState());const b=answer(initialState(),{id:'a2',dimension:'listening'});
 const merged=mergeStates(a,b);assert.equal(merged.attempts.length,2);assert.equal(merged.reviews['h-3042:recognition'].correct,1);assert.equal(merged.reviews['h-3042:listening'].correct,1);
});
test('未完成與非法項目的作答不能進入正式紀錄',()=>{
 assert.throws(()=>answer(initialState(),{dimension:'unknown'}));assert.throws(()=>answer(initialState(),{time:'bad date'}));assert.throws(()=>answer(initialState(),{item:'<script>'}));
});
test('答錯後當日恢復正確，從一天間隔重新開始',()=>{
 const first=answer(initialState());const wrong=answer(first,{id:'a2',correct:false,time:'2026-10-13T12:00:00.000Z'});
 const recovered=answer(wrong,{id:'a3',time:'2026-10-13T12:01:00.000Z'});
 assert.equal(recovered.reviews['h-3042:recognition'].step,0);assert.equal(recovered.reviews['h-3042:recognition'].due,'2026-10-14T12:01:00.000Z');
});
test('空白裝置恢復備份的設定與續課位置，有既有資料時維持本機設定',()=>{
 const incoming=answer(initialState());incoming.settings.dailyMinutes=30;incoming.settings.roman=false;incoming.lastLesson='L07';
 const blank=mergeStates(initialState(),incoming);assert.equal(blank.settings.dailyMinutes,30);assert.equal(blank.settings.roman,false);assert.equal(blank.lastLesson,'L07');
 const current=answer(initialState(),{id:'different'});assert.equal(mergeStates(current,incoming).settings.dailyMinutes,15);
});
