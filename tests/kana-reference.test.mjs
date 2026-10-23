import test from 'node:test';import assert from 'node:assert/strict';
const m=await import('../app/core/kana-reference.mjs').catch(()=>({}));
const get=(route,text)=>{assert.equal(typeof m.visibleKanaReference,'function');return m.visibleKanaReference(route,text);};
test('reference pages record only actual rendered kana, including contracted syllables',()=>{assert(get('stroke','あ きゃ').includes('h-3042'));assert(get('kana-map','あ きゃ').includes('h-304d-3083'));assert.deepEqual(get('unit','中文說明'),[]);});
test('question prompts, required audio and reports are excluded from passive reference detection',()=>{for(const route of ['quiz','practice','v3-practice','exam-session','weekly','weaknesses','kana-history','home'])assert.deepEqual(get(route,'あ ア きゃ'),[]);});
