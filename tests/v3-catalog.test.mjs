import test from 'node:test';
import assert from 'node:assert/strict';
import {forms,resolveLearningQuestion,resolveQuestion,knownItems,v3Questions} from '../app/content/catalog.mjs';
import {concepts} from '../app/content/concepts.mjs';
test('Learning resolver respects exam and unreliable question exclusions while keeping history resolvable',()=>{
 assert(resolveQuestion('N4-12-G2'));assert.equal(resolveLearningQuestion('N4-12-G2'),null);
 assert(!concepts.some(c=>c.itemIds.includes('N4-12-G2')));
 for(const form of forms)for(const section of form.sections)for(const q of section.questions)assert.equal(resolveLearningQuestion(q.id),null);
 for(const q of v3Questions){assert(knownItems.has(q.id));assert.equal(resolveLearningQuestion(q.id).conceptId,q.conceptId);}
 assert.equal(resolveLearningQuestion('h-3042','recognition').level,'K');assert(knownItems.has('K01'));
});
