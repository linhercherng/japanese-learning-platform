import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../app/core/life-dictation.mjs';
import {lifeMemoryUnits} from '../app/core/life-memory.mjs';
import {initialState} from '../app/core/learning.mjs';
const time='2026-10-23T07:00:00.000Z';
test('sentence index covers all 552 mode-specific entries without reading content or mutating state',()=>{
 assert.equal(typeof d.lifeTextDraftSentences,'function');const s=initialState(),old=structuredClone(s);let count=0;
 for(const recall of [false,true])for(const u of lifeMemoryUnits){const rows=d.lifeTextDraftSentences(s,u.id,recall);assert.equal(rows.length,3);for(const [slot,row] of rows.entries()){assert.deepEqual(row,{reference:u.id+':'+slot,slot,hasDraft:false,written:false,hasBlankDraft:false,blankWritten:false});count++;}}
 assert.equal(count,552);assert.deepEqual(s,old);for(const id of ['bad','L07:0','K01',null,'L7'])assert.deepEqual(d.lifeTextDraftSentences(s,id),[]);
});
test('sentence status separates original, retry, empty and whitespace drafts without leaking their text',()=>{
 assert.equal(typeof d.lifeTextDraftSentences,'function');let s=d.storeLifeRecallDraft(initialState(),'L07:0','私稿<&>',time);s=d.storeLifeBlankDraft(s,'L07:1','再稿秘密',time,true);s=d.storeLifeRecallDraft(s,'L07:1',' ',time);s=d.storeLifeBlankDraft(s,'L07:2','',time,true);s.drafts['text:LN-L07']={text:'線索秘密',points:[],time};s.drafts['text:L07']={text:'寫作秘密',points:[],time};const old=structuredClone(s),rows=d.lifeTextDraftSentences(s,'L07',true);
 assert.deepEqual(rows.map(x=>[x.hasDraft,x.written,x.hasBlankDraft,x.blankWritten]),[[true,true,false,false],[true,false,true,true],[false,false,true,false]]);assert(!JSON.stringify(rows).includes('秘密'));assert(!JSON.stringify(rows).includes('私稿'));assert(!JSON.stringify(rows).includes(time));assert(d.lifeTextDraftSentences(s,'L07',false).every(x=>!x.written&&!x.blankWritten));assert.deepEqual(s,old);
});
test('filtered main links point to an actual matching slot instead of always the first sentence',()=>{
 let s=d.storeLifeRecallDraft(initialState(),'L07:2','原文字',time);s=d.storeLifeBlankDraft(s,'L07:1','再文字',time,true);s=d.storeLifeBlankDraft(s,'L03:2','聽文字',time,false);
 for(const [scope,recall,unit,ref] of [['all',true,'L07','L07:0'],['written',true,'L07','L07:2'],['blank',true,'L07','L07:1'],['blank',false,'L03','L03:2'],['unwritten',true,'L07','L07:0']]){const row=d.lifeTextDraftRows(s,{scope},recall).find(x=>x.unit.id===unit);assert.equal(row.startReference,ref);assert.equal(row.sentences.length,3);}
 const row=d.lifeTextDraftRows(s,{scope:'all'},true).find(x=>x.unit.id==='L07');assert.equal(row.unwrittenCount,1);assert.equal(row.draftCount,1);assert.equal(row.blankDraftCount,1);
});
test('unwritten means no non-whitespace text in either draft in this mode, not an unlearned judgement',()=>{
 let s=initialState();s=d.storeLifeRecallDraft(s,'L07:0','original',time);s=d.storeLifeBlankDraft(s,'L07:1','retry',time,true);s=d.storeLifeRecallDraft(s,'L07:2',' \n ',time);const old=structuredClone(s);
 let row=d.lifeTextDraftRows(s,{scope:'unwritten'},true).find(x=>x.unit.id==='L07');assert.equal(row.startReference,'L07:2');assert.equal(row.unwrittenCount,1);assert.deepEqual(s,old);s=d.storeLifeBlankDraft(s,'L07:2','last',time,true);assert(!d.lifeTextDraftRows(s,{scope:'unwritten'},true).some(x=>x.unit.id==='L07'));assert.equal(d.lifeTextDraftRows(s,{scope:'unwritten'},false).find(x=>x.unit.id==='L07').unwrittenCount,3);
});
test('every combined filter keeps counts and matching references consistent with pure sentence rows',()=>{
 let s=d.storeLifeRecallDraft(initialState(),'L07:2','r',time);s=d.storeLifeBlankDraft(s,'L07:1','b',time,true);const old=structuredClone(s);
 for(const recall of [false,true])for(const level of ['all','L','N5','N4','N3','N2'])for(const topic of ['all','food','health'])for(const scope of ['all','written','blank','unwritten'])for(const row of d.lifeTextDraftRows(s,{recall,level,topic,scope},recall)){const target=row.sentences.find(x=>x.reference===row.startReference);assert(target);assert(level==='all'||row.unit.level===level);assert(topic==='all'||row.unit.topic===topic);if(scope==='written')assert(target.written);if(scope==='blank')assert(target.blankWritten);if(scope==='unwritten')assert(!target.written&&!target.blankWritten);assert.equal(row.unwrittenCount,row.sentences.filter(x=>!x.written&&!x.blankWritten).length);}assert.deepEqual(s,old);
});
