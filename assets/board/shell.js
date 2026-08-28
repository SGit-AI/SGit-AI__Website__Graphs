/* @module board/shell
   Single responsibility: the project board page — the tab strip across the four
   boards, the fetch, and the Kanban drill-down. The manifest is generated at
   build time (window.BOARDS); each board's JSON is fetched on click and
   rendered by assets/board/core/board.js, which owns the markup.

   Boards are read-only here, deliberately. The JSON is a projection of the
   packs, the team folder and the release table; editing a card would put the
   truth in the browser instead of in the repository. To move a card, move the
   thing it is derived from and rebuild. */
'use strict';
import { renderBoard, workstreamDetail } from './core/board.js';

const B = window.BOARDS;
if (B) boot();

function boot() {
  const root = document.getElementById('board');
  root.innerHTML = '<nav class="bd-tabs">' + B.boards.map((b, i) =>
    '<button class="bd-tab' + (i ? '' : ' on') + '" data-i="' + i + '">' + b.title +
    '<span class="bd-n">' + b.count + '</span></button>').join('') +
    '</nav><p class="bd-note" hidden></p><div class="bd-body"><p class="dim">loading …</p></div>';
  const tabs = root.querySelector('.bd-tabs');
  const note = root.querySelector('.bd-note');
  const body = root.querySelector('.bd-body');
  let cur = null;   /* the parsed board being shown */

  function show(i) {
    const b = B.boards[i];
    tabs.querySelectorAll('.bd-tab').forEach((t) =>
      t.classList.toggle('on', t.getAttribute('data-i') === String(i)));
    body.innerHTML = '<p class="dim">loading ' + b.title + ' …</p>';
    fetch(b.file).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => {
        cur = data;
        note.hidden = !data.note;
        note.textContent = data.note || '';
        const html = renderBoard(data);
        body.innerHTML = html || '<p class="dim">no renderer for schema ' + b.schema + '</p>';
        try { history.replaceState(null, '', '#' + b.slug); } catch (e) { /* fine */ }
      })
      .catch(() => { body.innerHTML = '<p class="dim">could not load ' + b.title + '</p>'; });
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('.bd-tab');
    if (t) { show(Number(t.getAttribute('data-i'))); return; }
    if (e.target.closest('.bd-back')) {
      body.innerHTML = renderBoard(cur);
      return;
    }
    const card = e.target.closest('.bd-card');
    if (card && cur) {
      const html = workstreamDetail(cur, card.getAttribute('data-ws'));
      if (html) body.innerHTML = html;
    }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.bd-card');
    if (card && cur) {
      e.preventDefault();
      const html = workstreamDetail(cur, card.getAttribute('data-ws'));
      if (html) body.innerHTML = html;
    }
  });

  const want = location.hash.slice(1);
  const i = Math.max(0, B.boards.findIndex((b) => b.slug === want));
  show(i);
}
