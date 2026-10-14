import test from 'node:test';import assert from 'node:assert/strict';import {gradeQuestion} from '../app/core/study.mjs';
test('N2 lexicon and twenty distinct situation lessons provide usable vocabulary and original questions',async()=>{
 const {words}=await import('../app/content/n2-lexicon.mjs'),{scenarios}=await import('../app/content/n2-scenarios.mjs');assert.equal(words.length,400);assert.equal(new Set(words.map(w=>w[0]+'\n'+w[1])).size,400);assert.equal(scenarios.length,20);assert.equal(new Set(scenarios.map(s=>s.topic)).size,20);
 for(const w of words)assert(w.length===3&&w.every(v=>typeof v==='string'&&v.trim()));
 for(const s of scenarios){assert.equal(s.level,'N2');assert(s.words.length>=8&&s.dialogue.length>=6&&s.questions.length>=5);assert(s.writing.sample.length>100);for(const d of s.dialogue)assert(d.jp&&d.reading&&d.zh);for(const q of s.questions){assert(q.explanation);assert(gradeQuestion(q,q.kind==='cloze'?q.accepted[0]:q.kind==='order'?q.answerOrder:q.correct));if(q.options)assert.equal(new Set(q.options).size,q.options.length);}}
});
test('Two independent N2 forms follow combined-area timing and cover N2 tasks with real context',async()=>{
 const {forms}=await import('../app/content/n2-exams.mjs');assert.equal(forms.length,2);const ids=new Set(),prompts=new Set();
 for(const f of forms){assert.equal(f.level,'N2');assert.deepEqual(f.sections.map(s=>s.minutes),[105,50]);assert.deepEqual(f.sections.map(s=>s.questions.length),[50,20]);
 for(const q of f.sections.flatMap(s=>s.questions)){assert(!ids.has(q.id));ids.add(q.id);assert(!prompts.has(q.prompt));prompts.add(q.prompt);assert(q.explanation.length>8);assert(gradeQuestion(q,q.kind==='cloze'?q.accepted[0]:q.kind==='order'?q.answerOrder:q.correct));if(q.options)assert.equal(new Set(q.options).size,q.options.length);if(q.kind==='listen')assert(q.transcript.length>(q.taskType==='response'?8:15));if(q.dimension==='reading')assert(q.passage.length>60);}
 const types=new Set(f.sections[0].questions.map(q=>q.taskType));for(const t of ['reading-kanji','word-formation','usage','sentence-order','text-grammar','integrated-reading','information-search','author-intent'])assert(types.has(t),t);
 const listening=new Set(f.sections[1].questions.map(q=>q.taskType));for(const t of ['task','point','gist','response','integrated'])assert(listening.has(t),t);
 }
});

test('N2 writing references meet their suggested length and technology dialogue names an actual backup',async()=>{
 const {scenarios}=await import('../app/content/n2-scenarios.mjs');for(const s of scenarios)assert(s.writing.sample.length>=150&&s.writing.sample.length<=250,s.id);
 const tech=scenarios.find(s=>s.topic==='technology');assert(tech.dialogue.some(d=>d.jp.includes('バックアップ')&&d.reading.includes('ばっくあっぷ')));assert(!tech.dialogue.some(d=>d.jp.includes('備えを作り')));
});
