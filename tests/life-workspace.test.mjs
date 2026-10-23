import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,exportBackup} from '../app/core/learning.mjs';
import {lifeMemoryUnits} from '../app/core/life-memory.mjs';
import {storeLifeRecallDraft,storeLifeDictationDraft,storeLifeBlankDraft} from '../app/core/life-dictation.mjs';
import {saveLifeNote,storeLifeNoteDraft} from '../app/core/life-notes.mjs';
const mod=await import('../app/core/life-workspace.mjs').catch(()=>({}));
const index=(...args)=>{assert.equal(typeof mod.lifeWorkspaceIndex,'function','workspace index is missing');return mod.lifeWorkspaceIndex(...args);};
const t='2026-10-23T08:00:00.000Z',later='2026-10-23T08:01:00.000Z';
function fixture(){let s=initialState();s=storeLifeRecallDraft(s,'L07:0','回想原稿🍵',t);s=storeLifeBlankDraft(s,'L07:0','回想再想稿',later,true);s=storeLifeDictationDraft(s,'L07:1','聽寫原稿',t);s=storeLifeBlankDraft(s,'L07:1','聽寫再想稿',later,false);s=saveLifeNote(s,'L07','午休線索',t);return storeLifeNoteDraft(s,'L07','待存線索',later);}

test('workspace indexes original and retry independently without exposing any text',()=>{
 const s=fixture(),before=JSON.parse(exportBackup(s)).state,r=index(s);assert.equal(r.total,3);
 const recall=r.rows.find(x=>x.kind==='recall'),dictation=r.rows.find(x=>x.kind==='dictation'),notes=r.rows.find(x=>x.kind==='notes');
 assert.equal(recall.reference,'L07:0');assert(recall.original&&recall.retry&&recall.written&&recall.retryWritten);
 assert.equal(dictation.reference,'L07:1');assert(notes.saved&&notes.draft);assert.equal(recall.updatedAt,later);
 assert(!JSON.stringify(r).includes('原稿'));assert(!JSON.stringify(r).includes('線索'));assert.deepEqual(JSON.parse(exportBackup(s)).state,before);
});
test('explicit search finds either original, retry, saved note or pending note without returning their contents',()=>{
 for(const query of ['回想原稿🍵','回想再想稿','聽寫原稿','聽寫再想稿','午休線索','待存線索']){const r=index(fixture(),{query});assert.equal(r.total,1,query);assert(!JSON.stringify(r.rows).includes(query));}
 assert.equal(index(fixture(),{query:'找不到'}).total,0);assert.equal(index(fixture(),{query:'點一杯'}).total,3);assert.equal(index(fixture(),{query:'飲食與餐廳'}).total,3);
});
test('empty and whitespace drafts remain findable without claiming written text',()=>{
 let s=initialState();s=storeLifeRecallDraft(s,'L01:0',' ',t);s=storeLifeBlankDraft(s,'L01:0','',t,true);s=storeLifeNoteDraft(s,'L01','',t);
 const r=index(s);assert.equal(r.total,2);const row=r.rows.find(x=>x.kind==='recall');assert(row.original&&row.retry);assert(!row.written&&!row.retryWritten);
 assert.equal(index(s,{scope:'written'}).total,0);assert.equal(index(s,{scope:'retry'}).total,0);assert.equal(index(s,{scope:'note-drafts'}).total,1);
});
test('level, topic, kind and scope filters combine and preserve a genuine empty result',()=>{
 const s=fixture();assert.equal(index(s,{level:'N2'}).total,0);assert.equal(index(s,{topic:'health'}).total,0);assert.equal(index(s,{kind:'recall',scope:'retry'}).total,1);
 assert.equal(index(s,{kind:'notes',scope:'written'}).total,0);assert.equal(index(s,{kind:'notes',scope:'note-drafts'}).total,1);assert.equal(index(s,{kind:'dictation',scope:'written'}).rows[0].reference,'L07:1');
});
test('all 92 units and 276 phrases support both draft modes with ten results per page',()=>{
 const s=initialState();for(const unit of lifeMemoryUnits)for(let slot=0;slot<3;slot++)for(const mode of ['LR','LD'])s.drafts[`text:${mode}-${unit.id}:${slot}`]={text:'個人文字',points:[],time:t};
 const before=structuredClone(s),r=index(s);assert.equal(r.total,552);assert.equal(r.pages,56);assert.equal(r.rows.length,10);assert.equal(index(s,{page:56}).rows.length,2);assert.equal(index(s,{page:999}).page,56);
 const seen=new Set();for(let page=1;page<=r.pages;page++)for(const row of index(s,{page}).rows){assert(!seen.has(row.id));seen.add(row.id);assert(row.route===`life-${row.kind}/${row.reference}`);}
 assert.equal(seen.size,552);assert.deepEqual(s,before);
});
test('pagination is stable at tied dates and clamps invalid pages',()=>{
 const s=fixture(),a=index(s),b=index(s);assert.deepEqual(a,b);assert.equal(index(s,{page:-5}).page,1);assert.equal(index(s,{page:NaN}).page,1);assert.equal(index(initialState(),{page:8}).pages,1);
});
