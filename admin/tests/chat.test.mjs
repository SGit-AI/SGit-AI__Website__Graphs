/* The chat's pure halves: vault persistence (keys, sessions, files) and the
   grounding prompt (sections, sweeping, bounded tool results).

   Plain node:assert, no framework. Known-answer vectors included so a refactor that
   changes behaviour fails loudly rather than shipping silently different output.
   Run this file alone, or the whole set with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';

import { test, report } from './harness.mjs';

const { parseVaultKey, sessionId, sessionFolder, changedFiles, sessionFiles, documentName } =
  await import('../../assets/universe-chat/vault-core.js');
test('vault-core: the last colon splits key from vault id', () => {
  assert.deepEqual(parseVaultKey('pass:with:colons:vault-abc'),
    { kind: 'passphrase', passphrase: 'pass:with:colons', vaultId: 'vault-abc' });
  assert.deepEqual(parseVaultKey(' river-cloud-3847 '), { kind: 'token', token: 'river-cloud-3847' });
  assert.throws(() => parseVaultKey(''), /empty/);
  assert.throws(() => parseVaultKey('trailing:'), /passphrase:vaultId/);
});
test('vault-core: session ids sort by time and land in a safe folder', () => {
  const id = sessionId(new Date(Date.UTC(2026, 7, 24, 18, 5, 9)), 'ab12');
  assert.equal(id, '20260824-180509-ab12');
  assert.equal(sessionFolder('thinking-in-graphs', id),
    '/universe-chat/thinking-in-graphs/20260824-180509-ab12');
  assert.throws(() => sessionFolder('../evil', id), /bad slug/);
  assert.throws(() => sessionFolder('ok', '../up'), /bad session id/);
});
test('vault-core: only moved files are written, and hashes advance', () => {
  const first = changedFiles({ 'a.json': 'one', 'b.txt': 'two' }, {});
  assert.deepEqual(Object.keys(first.writes).sort(), ['a.json', 'b.txt']);
  const second = changedFiles({ 'a.json': 'one', 'b.txt': 'CHANGED' }, first.hashes);
  assert.deepEqual(Object.keys(second.writes), ['b.txt']);
  assert.deepEqual(Object.keys(changedFiles({ 'a.json': 'one' }, second.hashes).writes), []);
});
test('vault-core: a session serializes only what it has', () => {
  const files = sessionFiles({ messages: { turns: [] }, drafts: { annotations: [], crossrefs: [], scratch: { nodes: [], edges: [] } }, trace: '  ' });
  assert.deepEqual(Object.keys(files), ['messages.json']);   /* empty drafts and blank trace are not written */
  const full = sessionFiles({ meta: { doc: 'd' }, messages: { turns: [1] },
    drafts: { annotations: [{ id: 'x' }], crossrefs: [], scratch: { nodes: [], edges: [] } }, trace: 'line\n' });
  assert.deepEqual(Object.keys(full).sort(), ['drafts.json', 'messages.json', 'session.json', 'trace.txt']);
});
const { personaSlug, personaFolder, viewsFolder, appendFeedback } =
  await import('../../assets/universe-chat/vault-core.js');
test('vault-core: persona names become safe slugs and folders', () => {
  assert.equal(personaSlug('The CFO!'), 'the-cfo');
  assert.equal(personaFolder('the-cfo'), '/personas/the-cfo');
  assert.equal(viewsFolder('the-cfo', 'thinking-in-graphs'),
    '/personas/the-cfo/views/thinking-in-graphs');
  assert.throws(() => personaSlug('!!!'), /usable name/);
  assert.throws(() => personaFolder('../up'), /bad persona slug/);
  assert.throws(() => viewsFolder('the-cfo', '../up'), /bad slug/);
});
test('vault-core: feedback appends, validates, and starts from nothing', () => {
  const one = appendFeedback(null, { at: 't1', session: 's1', verdict: 'wrong', note: 'too long' });
  const rec1 = JSON.parse(one);
  assert.equal(rec1.entries.length, 1);
  const two = JSON.parse(appendFeedback(one, { at: 't2', session: null, verdict: 'right', note: 'better' }));
  assert.equal(two.entries.length, 2);
  assert.equal(two.entries[0].note, 'too long');
  assert.throws(() => appendFeedback(null, { at: 't', verdict: 'meh', note: 'x' }), /verdict/);
  assert.throws(() => appendFeedback(null, { at: 't', verdict: 'right' }), /needs note/);
  assert.throws(() => appendFeedback('not json', { at: 't', verdict: 'right', note: 'x' }), /not JSON/);
});
test('vault-core: document names are tamed and default to markdown', () => {
  assert.equal(documentName('Claims Review!.md'), 'Claims-Review.md');
  assert.equal(documentName('summary'), 'summary.md');
  assert.equal(documentName('../../etc/passwd'), 'etc-passwd.md');
  assert.throws(() => documentName('///'), /usable name/);
});

/* ---- chat-core: the grounding prompt and the loop's pure rules ------------- */
const { groundingPrompt, sweepTurns, truncateToolResult } =
  await import('../../assets/universe-chat/chat-core.js');
test('chat-core: the grounding prompt carries every section, in order', () => {
  const p = groundingPrompt({
    doc: { title: 'Doc T' },
    nodes: [
      { id: 'c1', family: 'concept', label: 'C One', statement: 's1', defined: true },
      { id: 'c2', family: 'concept', label: 'C Two', statement: 's2', defined: false },
      { id: 'k1', family: 'claim', label: 'K', statement: 'ks', support: 'argued' },
      { id: 'h1', family: 'hypothesis', label: 'H', statement: 'hs' }],
    pairings: { also_called: [{ a: 'c1', b: 'alias' }], near_but_not: [{ this: 'c1', not: 'a schema' }] },
  }, null);
  const marks = ['"Doc T"', 'THIS DOCUMENT SAYS', 'get_recent_activity', 'graph_snapshot',
    'The dictionary', '  c1: C One — s1', '  *c2: C Two — s2',
    'The claims', '  k1 [argued]: ks', 'Hypotheses', '  h1 [hypothesis]: hs',
    'Also-called: c1 ↔ alias', 'Near-but-not: c1 is NOT a schema'];
  let at = -1;
  for (const m of marks) {
    const i = p.indexOf(m);
    assert.ok(i > at, 'missing or out of order: ' + m);
    at = i;
  }
  assert.ok(!p.includes('READER PERSONA'));
});
test('chat-core: the persona section appends, and the fallback stays honest', () => {
  const p = groundingPrompt(null, { name: 'the CFO', prompt: 'Costs first.' });
  assert.ok(p.includes('The page API is unavailable'));
  assert.ok(p.includes('THE READER PERSONA — "the CFO". Costs first.'));
  assert.ok(p.includes('save_view') && p.includes('record_feedback'));
});
test('chat-core: the sweep drops only truly empty assistant turns', () => {
  const turns = [
    { role: 'user', content: '' },
    { role: 'assistant', content: '  ' },
    { role: 'assistant', content: '', images: [{ image_url: { url: 'x' } }] },
    { role: 'assistant', content: 'kept' }];
  const kept = sweepTurns(turns);
  assert.equal(kept.length, 3);
  assert.ok(!kept.some((t) => t.role === 'assistant' && t.content === '  '));
  const same = [{ role: 'assistant', content: 'a' }];
  assert.equal(sweepTurns(same), same);   /* identity when nothing drops */
});
test('chat-core: tool results are bounded', () => {
  assert.equal(truncateToolResult({ a: 1 }), '{"a":1}');
  assert.equal(truncateToolResult(undefined), 'null');
  const big = truncateToolResult({ s: 'x'.repeat(30000) }, 100);
  assert.ok(big.length < 130 && big.endsWith('…(truncated)'));
});

await report('chat');
