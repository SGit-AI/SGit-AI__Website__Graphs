/* The test runner: every `*.test.mjs` beside it, each in its own process.

   Separate processes rather than one big import graph, deliberately. A suite that
   throws while loading, exits early, or leaves a module in a bad state can then only
   fail itself — it cannot take the others down with it or, worse, silently change what
   they see. The cost is one node start per suite (tens of milliseconds); the gain is
   that a red suite always names itself.

   Run: node admin/tests/run.mjs        (add a name to run one: `run.mjs wclm`) */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv[2];
const suites = readdirSync(HERE)
  .filter((f) => f.endsWith('.test.mjs'))
  .filter((f) => !only || f.startsWith(only))
  .sort();

if (!suites.length) {
  console.error(only ? `no suite matches "${only}"` : 'no suites found');
  process.exit(1);
}

let pass = 0, fail = 0;
const red = [];
for (const file of suites) {
  const r = spawnSync(process.execPath, [path.join(HERE, file)], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out);
  const m = out.match(/(\d+) passed, (\d+) failed/);
  if (m) { pass += Number(m[1]); fail += Number(m[2]); }
  /* A suite that died before it could report is a failure even with no counts. */
  if (r.status !== 0) { red.push(file); if (!m) fail += 1; }
}

console.log(`\nall suites: ${pass} passed, ${fail} failed` +
  (red.length ? ` (red: ${red.join(', ')})` : ''));
process.exit(fail || red.length ? 1 : 0);
