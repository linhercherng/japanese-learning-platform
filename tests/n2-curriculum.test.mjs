import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

test('N2 has 24 complete original lessons, with usable answers and complete learning media', async () => {
  const { units } = await import('../app/content/n2.mjs');
  assert.equal(units.length, 24);
  const ids = new Set();
  const patterns = new Set();
  const readings = new Set();
  for (const [i, u] of units.entries()) {
    assert.equal(u.id, `N2-${String(i + 1).padStart(2, '0')}`);
    assert.equal(u.level, 'N2');
    for (const key of ['title', 'topic', 'goal']) assert.ok(u[key]?.trim(), `${u.id}: ${key}`);
    assert.ok(u.vocabulary.length >= 12, u.id);
    for (const w of u.vocabulary) {
      for (const key of ['jp', 'reading', 'zh', 'example', 'exampleZh']) assert.ok(w[key]?.trim(), `${u.id}: vocabulary ${key}`);
      assert.ok(w.example.includes(w.jp), `${u.id}: usable cloze source ${w.jp}`);
    }
    assert.equal(u.grammar.length, 2);
    for (const g of u.grammar) {
      assert.ok(!patterns.has(g.pattern), `${u.id}: duplicate pattern ${g.pattern}`);
      patterns.add(g.pattern);
      for (const key of ['pattern', 'meaning', 'formation', 'explanation', 'contrast', 'pitfall']) assert.ok(g[key]?.trim(), `${u.id}: grammar ${key}`);
      assert.equal(g.examples.length, 2);
      for (const e of g.examples) assert.ok(e.jp && e.zh);
    }
    assert.ok(u.kanji.length >= 3);
    for (const k of u.kanji) {
      assert.equal([...k.glyph].length, 1);
      assert.ok(k.meaning && k.readings?.length && k.words?.length);
      for (const w of k.words) assert.ok(w.jp.includes(k.glyph) && w.reading && w.zh);
    }
    assert.ok(u.dialogue.length >= 6);
    for (const d of u.dialogue) for (const key of ['speaker', 'jp', 'reading', 'zh']) assert.ok(d[key]?.trim());
    assert.ok([...u.reading.jp.replace(/\s/g, '')].length >= 450, `${u.id}: reading too short`);
    assert.ok([...u.reading.zh].length >= 200, `${u.id}: complete translation`);
    assert.ok(!readings.has(u.reading.jp));
    readings.add(u.reading.jp);
    assert.equal(u.reading.questions.length, 2);
    assert.equal(u.questions.length, 8);
    assert.equal(u.questions.filter(q => q.dimension === 'listening').length, 2);
    assert.equal(u.questions.filter(q => q.kind === 'cloze').length, 1);
    assert.equal(u.questions.filter(q => q.kind === 'order').length, 1);
    for (const q of [...u.questions, ...u.reading.questions]) {
      assert.ok(!ids.has(q.id), q.id);
      ids.add(q.id);
      assert.ok(q.prompt && q.explanation);
      if (q.options) {
        assert.ok(q.options.length >= 3, q.id);
        assert.equal(new Set(q.options).size, q.options.length, q.id);
        assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
      }
      if (q.kind === 'cloze') {
        assert.equal(q.prompt.match(/＿＿/g)?.length, 1, q.id);
        assert.ok(q.accepted.length >= 2 && q.accepted.every(a => a.trim()));
        assert.ok(u.vocabulary.some(w => q.accepted.includes(w.jp) && q.explanation.includes(w.example)), q.id);
        const source = u.vocabulary.find(w => q.accepted.includes(w.jp));
        assert.equal(q.prompt.slice(q.prompt.lastIndexOf('：') + 1).replace('＿＿', q.accepted[0]), source.example, `${q.id}: filled sentence`);
      }
      if (q.kind === 'order') {
        assert.equal(q.answerOrder.length, q.tokens.length);
        assert.equal(new Set(q.answerOrder).size, q.tokens.length);
        assert.ok(q.answerOrder.every(n => n >= 0 && n < q.tokens.length));
        assert.ok(q.explanation.includes(q.answerOrder.map(n => q.tokens[n]).join('')), q.id);
      }
      if (q.kind === 'listen') assert.ok(q.transcript?.trim(), q.id);
    }
    const listens = u.questions.filter(q => q.kind === 'listen');
    assert.equal(listens[0].transcript, u.dialogue.map(d => d.jp).join('\n'));
    assert.equal(listens[0].options[listens[0].correct], u.dialogue.at(-1).zh);
    assert.equal(listens[1].transcript, `${u.dialogue[2].jp}\n${u.dialogue[3].jp}`);
    assert.equal(listens[1].options[listens[1].correct], u.dialogue[3].zh);
    assert.match(u.writing.prompt, /200～350/);
    assert.ok([...u.writing.sample].length >= 200 && [...u.writing.sample].length <= 350, `${u.id}: writing sample length`);
    assert.equal(u.writing.checklist.length, 3);
  }
  assert.equal(patterns.size, 48);
  assert.equal(ids.size, 240);
});

test('N2 grammar contexts preserve irregular forms and lesson-specific sequence explanations', async () => {
  const { units } = await import('../app/content/n2.mjs');
  const necessity = units[22].questions[3];
  const sentence = necessity.prompt.slice(necessity.prompt.lastIndexOf('：') + 1).replace('＿＿', necessity.options[necessity.correct]);
  assert.equal(sentence, '利用を停止せざるを得ない。');
  assert.match(units[14].writing.sample, /停電して以来/);
  const targetPatterns = [[6, 1], [8, 1], [14, 1], [16, 1], [22, 1]];
  for (const [lesson, grammar] of targetPatterns) {
    assert.ok(units[lesson].questions[5].explanation.includes(units[lesson].grammar[grammar].explanation));
  }
  const choiceAnswers = units.flatMap(u => [...u.questions, ...u.reading.questions]).filter(q => q.options).map(q => q.correct);
  assert.deepEqual(new Set(choiceAnswers), new Set([0, 1, 2]));
});

test('N2 preserves human-context Chinese meanings and gives 更 its own reading', async () => {
  const { units } = await import('../app/content/n2.mjs');
  assert.deepEqual(units[2].kanji.find(k => k.glyph === '更').readings, ['コウ']);
  for (const u of units) {
    for (const w of u.vocabulary) {
      if (w.jp === '対象') assert.equal(w.zh, '對象');
      if (w.jp === '項目') assert.equal(w.zh, '項目');
    }
    assert.equal(/物件|專案|視窗|制度匯入|擴充套件|隻|錶現/.test(JSON.stringify(u)), false, `${u.id}: Chinese terminology`);
  }
  assert.match(units[2].reading.zh, /窗口/);
  assert.match(units[12].dialogue[4].zh, /三項/);
  assert.equal(units[14].grammar[1].formation, '動詞て形＋以来');
  const audioText = units.map(u => ({vocabulary:u.vocabulary.map(w => [w.jp,w.reading,w.example]),grammar:u.grammar.map(g => g.examples.map(e => e.jp)),dialogue:u.dialogue.map(d => [d.jp,d.reading]),reading:u.reading.jp,writing:u.writing.sample,transcripts:u.questions.filter(q => q.transcript).map(q => q.transcript)}));
  assert.equal(createHash('sha256').update(JSON.stringify(audioText)).digest('hex'), 'bcefa004cdcd45b922dce599eda2b2924b50d917c4dfb3af34653c9150b04ed8');
});
