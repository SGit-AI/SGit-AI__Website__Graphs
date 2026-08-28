/* The shared test harness.

   It exists because the inline one it replaces had a real hole: `test()` called its
   function and caught synchronous throws, but an ASYNC test returns a promise that was
   never awaited — so a failing async test printed "ok", was counted as a pass, and only
   surfaced later as an unhandled rejection after the summary had already lied. Three
   tests in the universe suite are async.

   Rules kept from the old harness: no runner dependency, no framework, plain
   node:assert. Rules added: every test is awaited before the summary is printed, and a
   file reports its own name so a multi-file run reads clearly. */

const results = [];

/** Register a test. The function may be sync or async; both are gated properly. */
export function test(label, fn) {
  const rec = { label, ok: true, err: null, pending: null };
  results.push(rec);
  try {
    const out = fn();
    if (out && typeof out.then === "function") {
      rec.pending = out.then(
        () => {},
        (e) => { rec.ok = false; rec.err = e; },
      );
    }
  } catch (e) {
    rec.ok = false;
    rec.err = e;
  }
}

/** Await every registered test, print the results, and exit with the right code. */
export async function report(suite) {
  await Promise.all(results.map((r) => r.pending).filter(Boolean));
  let pass = 0, fail = 0;
  for (const r of results) {
    if (r.ok) { pass += 1; console.log("  ok " + r.label); }
    else { fail += 1; console.error("  FAIL " + r.label + " — " + (r.err && r.err.message)); }
  }
  console.log(`${suite} tests: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
