/* Photographs each book's cover SVG into the PNG Leanpub wants (1600 x 2400).

   There is no SVG rasteriser installed here, and adding one would be a dependency
   for a job the estate already has a tool for: the same headless Chromium harness
   that takes every screenshot in this repository. The cover is drawn as SVG (the
   source of truth, versioned, diffable) and photographed at exact pixel size with
   captureBeyondViewport, so the PNG is a projection of the SVG rather than a
   separate artefact that could drift.

   The harness rule this repository learned the hard way: a unique debug port per
   run, and kill the Chromium you spawn. A crashed run leaves a browser holding its
   port, and the next run on that port silently serves stale content. */
import { spawn } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BOOKS = ['fsg', 'making-a-book'];
const W = 1600, H = 2400;
const SHELLS = process.argv[2];
if (!SHELLS) throw new Error('gen_covers: pass the render-shell directory as argv[2]');
const port = 9500 + Math.floor(Math.random() * 400);

const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, 'about:blank']);

let list = null;
for (let i = 0; i < 25 && !list; i++) {
  await new Promise((r) => setTimeout(r, 400));
  try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch (e) { /* retry */ }
}
if (!list) { chrome.kill(); throw new Error('gen_covers: Chromium did not come up'); }

const ws = new WebSocket(list[0].webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res) => {
  const i = ++id; pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send('Page.enable');
const done = [];
for (const slug of BOOKS) {
  const src = join(SHELLS, `${slug}.html`);
  if (!existsSync(src)) throw new Error(`gen_covers: no render shell for ${slug} at ${src}`);
  await send('Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'file://' + src });
  await new Promise((r) => setTimeout(r, 900));
  const shot = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
  });
  const out = join(ROOT, 'v2', 'books', slug, 'publish', 'cover.png');
  const buf = Buffer.from(shot.data, 'base64');
  writeFileSync(out, buf);
  done.push(`${slug} ${(buf.length / 1024).toFixed(0)}kB`);
}
console.log(`gen_covers: ${W}x${H} PNG — ${done.join(' · ')}`);
chrome.kill();
process.exit(0);
