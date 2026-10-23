import test from 'node:test';
import assert from 'node:assert/strict';
import * as cards from '../app/core/life-cards.mjs';
import {lifeMemoryUnits,memoryPhrases} from '../app/core/life-memory.mjs';
const opened=r=>cards.revealLifeCard(r);
const rate=(r,value)=>cards.rateLifeCard(opened(r),value);
test('all 92 units use exactly their existing three phrases in either recall direction',()=>{
 assert.equal(typeof cards.createLifeCards,'function');
 for(const unit of lifeMemoryUnits)for(const mode of ['meaning','sound']){
  let r=cards.createLifeCards(unit.id,mode);assert.equal(r.queue.length,3);assert.equal(r.revealed,false);
  const originals=memoryPhrases(unit.id);for(let i=0;i<3;i++){assert.deepEqual(cards.currentLifeCard(r),originals[i]);r=rate(r,'remember');}
  assert.equal(cards.currentLifeCard(r),null);assert.deepEqual(cards.lifeCardSummary(r),{total:3,remember:3,again:0,visits:3,done:true});
 }
 assert.equal(cards.createLifeCards('missing','meaning'),null);assert.equal(cards.createLifeCards('L07','invalid'),null);
});
test('rating requires revealing for comparison and invalid ratings leave the round unchanged',()=>{
 const r=cards.createLifeCards('L07','meaning');assert.equal(cards.rateLifeCard(r,'remember'),r);
 const visible=opened(r);assert.equal(cards.rateLifeCard(visible,'wrong'),visible);assert.equal(cards.revealLifeCard(visible),visible);const next=cards.rateLifeCard(visible,'again');assert.equal(next.revealed,false);assert.equal(r.cursor,0);assert.equal(r.ratings[0],null);
});
test('a difficult first phrase returns only after two different phrases',()=>{
 let r=rate(cards.createLifeCards('L07','meaning'),'again');assert.deepEqual(r.queue,[0,1,2,0]);
 r=rate(r,'remember');assert.equal(r.queue[r.cursor],2);r=rate(r,'remember');assert.equal(r.queue[r.cursor],0);r=rate(r,'remember');
 assert.deepEqual(cards.lifeCardSummary(r),{total:3,remember:3,again:0,visits:4,done:true});
});
test('insufficient spacing leaves a difficult tail phrase for later rather than immediately showing it again',()=>{
 let r=cards.createLifeCards('L07','sound');r=rate(r,'remember');r=rate(r,'again');r=rate(r,'again');
 assert.equal(r.queue.length,3);assert.deepEqual(cards.lifeCardSummary(r),{total:3,remember:1,again:2,visits:3,done:true});
});
test('every phrase repeats at most once, bounding a fully difficult round to six visits',()=>{
 let r=cards.createLifeCards('L07','meaning');for(let i=0;i<6;i++)r=rate(r,'again');
 assert.deepEqual(r.queue,[0,1,2,0,1,2]);assert.deepEqual(cards.lifeCardSummary(r),{total:3,remember:0,again:3,visits:6,done:true});
 assert.equal(cards.rateLifeCard(r,'again'),r);assert.equal(cards.revealLifeCard(r),r);
});
test('a new direction starts hidden with no carried rating or learning records',()=>{
 const old=rate(cards.createLifeCards('L07','meaning'),'again'),fresh=cards.createLifeCards('L07','sound');
 assert.equal(fresh.revealed,false);assert.deepEqual(fresh.ratings,[null,null,null]);assert.equal(fresh.cursor,0);assert.equal(old.cursor,1);
 assert.deepEqual(Object.keys(fresh).sort(),['unitId','mode','queue','cursor','revealed','ratings'].sort());
});
