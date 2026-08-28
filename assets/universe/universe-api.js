/* @module universe/universe-api
   Single responsibility: publish the universe reader as a JavaScript API.
   Implements the Tool API Primitive (SgToolApi, from the family's component
   estate at tools.sgraph.ai): the reader's commands become named methods on
   window.__tool, equally callable from the browser console, Playwright, and
   the chat panel. The command table and the LLM tool schemas live in
   core/commands.js (pure, gate-27-tested); this module binds implementations.

   Over the size guideline at 409 lines, on purpose: an API surface is allowed to be a
   list. The logic behind each command is in core/; what is long here is one binding per
   published command, and grouping those into files would hide the surface, not clarify
   it. Recorded in pass three of the v0.5.17 non-functional plan as a deliberate keep.

   The adapter drives the reader ONLY through surfaces the reader already
   publishes: its uni:* CustomEvents, its option buttons, and the public
   methods of its custom elements. reader.js and the components are untouched
   — ADR-7's lesson: wrap the one reader, never fork it.

   Loaded as its own <script type="module"> after universe-view.js; if this
   module (or the CDN import) fails, the reader is unaffected. */
'use strict';
import { SgToolApi } from 'https://tools.sgraph.ai/core/sg-tool-api/v0/v0.1/v0.1.0/sg-tool-api.js';
import { COMMANDS, LEVELS, toolSchemas, clampRange } from './core/commands.js';
import { composeNodeDoc, nodeRichness } from './core/nodedoc.js';
import { neighbourhoodIds, graphStats } from './core/explore.js';

const U = window.UNIVERSE;
const layout = document.querySelector('.uni-layout');
const graph = document.querySelector('uni-graph');

if (U && layout && graph) publish();

function publish() {
  /* ---- lazily fetched data: the extraction and the source bytes ---------- */
  let exP = null, srcP = null, crP = null, lexP = null, umP = null;
  const getEx = () => (exP = exP || fetch(U.extraction).then((r) => r.json()));
  const getSrc = () => (srcP = srcP || fetch(U.source).then((r) => r.arrayBuffer())
    .then((b) => new Uint8Array(b)));
  const getCr = () => (crP = crP || fetch(U.folder + 'crossrefs.json').then((r) => r.json()));

  /* ---- session-local author state ---------------------------------------- */
  const drafts = { annotations: [], crossrefs: [], scratch: { nodes: [], edges: [] } };
  let scratchStyled = false;

  /* ---- the activity ring: what happened on the page, for "this/here" ------ */
  const activity = [];
  let actSeq = 0;
  const record = (event, detail) => {
    activity.push({ seq: ++actSeq, event, ...detail });
    if (activity.length > 50) activity.shift();
  };
  layout.addEventListener('uni:node-tap', (e) => record('user-tapped-graph-node',
    { id: e.detail.id, label: e.detail.label }));
  layout.addEventListener('uni:mark-click', (e) => record('user-clicked-source-mark',
    { id: e.detail.aid }));
  layout.addEventListener('uni:gmax', (e) => record('graph-maximized', { on: e.detail.on }));
  layout.addEventListener('uni:gpref', (e) => record('graph-pref-changed',
    { key: e.detail.key, value: e.detail.value }));
  layout.addEventListener('uni:pref', (e) => record('reader-pref-changed',
    { key: e.detail.key, value: Array.isArray(e.detail.value) ? e.detail.value.join(' ') : e.detail.value }));

  /* ---- helpers over the reader's published surfaces ----------------------- */
  const emit = (name, detail) => layout.dispatchEvent(new CustomEvent(name, { detail }));
  const gbtn = (sel) => graph.querySelector(sel);
  const btnOn = (sel) => { const b = gbtn(sel); return !!(b && b.classList.contains('on')); };
  const clickIf = (sel, want) => { if (btnOn(sel) !== want) gbtn(sel).click(); };
  const anchorOf = (id) => U.anchors.find((a) => a.aid === id);
  const requireAnchor = (id) => {
    const a = anchorOf(id);
    if (!a) throw new Error('unknown id: ' + id + ' — ids are node ids or edge-N / nbn-N / alias-N');
    return a;
  };
  const nodeBrief = (n) => ({
    id: n.id, family: n.family, label: n.label, statement: n.statement,
    ...(n.family === 'concept' ? { defined: n.defined } : {}),
    ...(n.family === 'claim' ? { support: n.support, about: n.about || [] } : {}),
    ...(n.demonstrates ? { demonstrates: n.demonstrates } : {}),
  });
  const ensureScratchStyle = () => {
    if (scratchStyled) return;
    graph.cy.style()
      .selector('node.uni-scratch').style({
        'background-color': '#c8611a', 'border-width': 2, 'border-style': 'dashed',
        'border-color': '#8a3d05', shape: 'round-rectangle' })
      .selector('edge.uni-scratch').style({
        'line-style': 'dashed', 'line-color': '#c8611a',
        'target-arrow-color': '#c8611a' })
      .update();
    scratchStyled = true;
  };

  /* ---- the implementations, one per row of the command table -------------- */
  const impl = {
    /* read */
    get_doc: () => ({
      slug: U.slug, title: U.title, source: U.source.replace(/^(\.\.\/)+/, ''),
      sha256: U.sha256, extraction: U.extraction, folder: U.folder,
      anchors: U.anchors.length, sections: U.taxonomy.length,
    }),
    get_nodes: async ({ family } = {}) => {
      const ex = await getEx();
      const nodes = family ? ex.nodes.filter((n) => n.family === family) : ex.nodes;
      if (family && !nodes.length && ['concept', 'claim', 'hypothesis', 'objective', 'example'].indexOf(family) === -1) {
        throw new Error('unknown family: ' + family);
      }
      return nodes.map(nodeBrief);
    },
    get_node: async ({ id }) => {
      const ex = await getEx();
      const n = ex.nodes.find((x) => x.id === id);
      if (!n) throw new Error('unknown node: ' + id);
      const a = anchorOf(id);
      return { ...nodeBrief(n), anchor: { ...n.anchor, ...(a ? { chars: a.chars } : {}) } };
    },
    get_edges: async () => {
      const ex = await getEx();
      return ex.edges.map((e, i) => ({ id: 'edge-' + i, from: e.from, verb: e.verb,
        inverse: e.inverse, to: e.to, anchor: e.anchor }));
    },
    get_pairings: async () => {
      const ex = await getEx();
      return {
        also_called: ex.aliases.map((x, i) => ({ id: 'alias-' + i, a: x.a, b: x.b, anchor: x.anchor })),
        near_but_not: ex.near_but_not.map((x, i) => ({ id: 'nbn-' + i, this: x.this, not: x.not, anchor: x.anchor })),
      };
    },
    get_anchor: ({ id }) => {
      const a = requireAnchor(id);
      return { id: a.aid, kind: a.kind, section: a.section || null, chars: a.chars, label: a.label };
    },
    get_source_text: async ({ start, end } = {}) => {
      const bytes = await getSrc();
      const r = clampRange(start, end, bytes.length);
      return { start: r.start, end: r.end, of: bytes.length,
        text: new TextDecoder().decode(bytes.subarray(r.start, r.end)) };
    },
    get_coverage: async () => {
      const ex = await getEx();
      const anchored = new Set(U.anchors.map((a) => a.section).filter(Boolean));
      const empty = Object.fromEntries((ex.empty_sections || []).map((x) => [x.section, x.why]));
      return U.taxonomy.map((t) => ({ section: t.title, level: t.level,
        yield: anchored.has(t.title) ? 'anchored'
          : empty[t.title] ? 'empty on purpose: ' + empty[t.title] : 'structural' }));
    },
    get_crossrefs: async () => {
      const cr = await getCr();
      return cr.refs.map((r) => ({ id: r.id, where: r.where, what: r.what, how: r.how,
        rating: r.rating, note: r.note, rated_by: r.rated_by, rated: r.rated }));
    },
    get_state: () => ({
      selected: graph.selected || null,
      layout: (['cose', 'concentric', 'grid', 'tree']
        .find((l) => btnOn('[data-glay="' + l + '"]')) || 'cose'),
      sources: { document: btnOn('[data-gdoc]'), doc_tree: btnOn('[data-gtree]'),
        family_peaks: btnOn('[data-gpeaks]'), derived_links: btnOn('[data-gderived]') },
      explore: { on: btnOn('[data-gexp]'),
        degrees: (gbtn('#uni-gdeg') || { textContent: '1' }).textContent },
      pin_peaks: btnOn('[data-gpin]'), paths_to_peaks: btnOn('[data-gpaths]'),
      stats: ((gbtn('#uni-gstats') || {}).textContent || '').trim(),
      labels: btnOn('[data-glabels]'), boxed: btnOn('[data-gboxed]'),
      panel_on: document.getElementById('uni-tglpanel').getAttribute('aria-pressed') === 'true',
      graph_on: !document.body.classList.contains('uni-graph-off'),
      highlight_kinds: [...document.querySelectorAll('uni-options input[data-kind]')]
        .filter((c) => c.checked).map((c) => c.getAttribute('data-kind')),
      drafts: { annotations: drafts.annotations.length, crossrefs: drafts.crossrefs.length,
        scratch_nodes: drafts.scratch.nodes.length, scratch_edges: drafts.scratch.edges.length },
    }),

    compose_node_doc: async ({ id }) => {
      const [ex, cr] = await Promise.all([getEx(), getCr().catch(() => ({ refs: [] }))]);
      const m = composeNodeDoc(ex, cr, id);
      if (!m) throw new Error('unknown node: ' + id);
      return m;
    },
    rank_nodes: async () => {
      const ex = await getEx();
      return nodeRichness(ex);
    },
    graph_snapshot: ({ full } = {}) => {
      const data_url = graph.cy.png({ output: 'base64uri', full: !!full, scale: 1,
        maxWidth: 900, maxHeight: 700, bg: '#faf8f2' });
      return { data_url, bytes: data_url.length, full: !!full,
        note: 'in the chat this arrives as an image on the next turn' };
    },
    get_recent_activity: ({ since } = {}) => {
      const from = Number.isFinite(since) ? since : 0;
      return { latest_seq: actSeq, entries: activity.filter((a) => a.seq > from) };
    },
    price_next_hop: ({ degrees } = {}) => {
      const sel = graph.selected;
      if (!sel) throw new Error('price_next_hop needs a selection — select_node first');
      const shown = (gbtn('#uni-gdeg') || { textContent: '1' }).textContent;
      const deg = Number.isFinite(degrees) ? degrees
        : (shown === '∞' ? Infinity : parseInt(shown, 10) || 1);
      const data = U.elements.map((el) => el.data);
      const cur = neighbourhoodIds(data, sel, deg);
      const nxt = neighbourhoodIds(data, sel, deg === Infinity ? Infinity : deg + 1);
      const added = data.filter((d) => nxt.has(d.id) && !cur.has(d.id));
      return { from_degrees: deg === Infinity ? 'max' : deg, in_view: graphStats(
        data.filter((d) => cur.has(d.id))), next_hop_adds: graphStats(added),
        added_ids: added.filter((d) => !d.source).map((d) => d.id).slice(0, 30) };
    },
    get_lexicon: () => (lexP = lexP || fetch('../lexicon/data/lexicon.json').then((r) => {
      if (!r.ok) throw new Error('lexicon fetch failed: ' + r.status);
      return r.json();
    })),
    get_usage_model: () => (umP = umP || fetch('usage-model.json').then((r) => r.json())),
    search: async ({ text }) => {
      const q = String(text || '').toLowerCase().trim();
      if (q.length < 2) throw new Error('search needs at least 2 characters');
      const ex = await getEx();
      const hits = [];
      for (const n of ex.nodes) {
        const hay = (n.id + ' ' + n.label + ' ' + n.statement + ' '
          + (n.anchor && n.anchor.quote || '')).toLowerCase();
        if (hay.indexOf(q) !== -1) hits.push({ id: n.id, family: n.family, label: n.label,
          statement: n.statement });
      }
      for (const a of U.anchors) {
        if (a.kind === 'edge' || a.kind === 'nbn' || a.kind === 'alias') {
          if (String(a.label).toLowerCase().indexOf(q) !== -1) {
            hits.push({ id: a.aid, family: a.kind, label: a.label });
          }
        }
      }
      return { matches: hits.slice(0, 40), of: hits.length };
    },

    /* view — every command goes through the reader's own events and buttons */
    select_node: ({ id }) => {
      const a = requireAnchor(id);
      emit('uni:step-select', { aid: id });
      const row = document.getElementById(a.row);
      if (row) row.scrollIntoView({ block: 'center', behavior: 'instant' });
      return { selected: id, section: a.section || null };
    },
    clear_selection: () => { emit('uni:clear-request', {}); return { selected: null }; },
    fit_graph: () => { gbtn('[data-gfit]').click(); return { done: true }; },
    set_layout: ({ layout: l }) => {
      const b = gbtn('[data-glay="' + l + '"]');
      if (!b) throw new Error('unknown layout: ' + l);
      b.click(); return { layout: l };
    },
    set_physics: ({ spring_length, pull }) => {
      const len = graph.querySelector('#uni-glen'), pl = graph.querySelector('#uni-gpull');
      if (Number.isFinite(spring_length)) len.value = String(spring_length);
      if (Number.isFinite(pull)) pl.value = String(pull);
      len.dispatchEvent(new Event('input', { bubbles: true }));
      return { spring_length: parseInt(len.value, 10), pull: parseInt(pl.value, 10) };
    },
    set_view_preset: ({ view }) => {
      const b = gbtn('[data-gview="' + view + '"]');
      if (!b) throw new Error('unknown preset view: ' + view);
      b.click();
      return { view };
    },
    explore_selection: ({ on, id, degrees, to_peaks }) => {
      if (id) impl.select_node({ id });
      if (on && !graph.selected) throw new Error('explore needs a selection — pass id or select_node first');
      clickIf('[data-gexp]', on);
      const shown = () => gbtn('#uni-gdeg').textContent;
      if (on && to_peaks) {
        if (shown() !== '∞') gbtn('[data-gdegmax]').click();
      } else if (on && Number.isFinite(degrees)) {
        const want = Math.max(0, Math.min(degrees, 6));
        if (shown() === '∞') gbtn('[data-gdegmax]').click();   /* ∞ toggles back to 1 */
        for (let i = 0; i < 12 && parseInt(shown(), 10) !== want; i++) {
          gbtn(parseInt(shown(), 10) < want ? '[data-gdegup]' : '[data-gdegdn]').click();
        }
      }
      return { explore: on, root: graph.selected || null, degrees: shown() };
    },
    show_sources: ({ document: doc, doc_tree, family_peaks, derived_links }) => {
      if (typeof doc === 'boolean') clickIf('[data-gdoc]', doc);
      if (typeof doc_tree === 'boolean') clickIf('[data-gtree]', doc_tree);
      if (typeof family_peaks === 'boolean') clickIf('[data-gpeaks]', family_peaks);
      if (typeof derived_links === 'boolean') clickIf('[data-gderived]', derived_links);
      return { document: btnOn('[data-gdoc]'), doc_tree: btnOn('[data-gtree]'),
        family_peaks: btnOn('[data-gpeaks]'), derived_links: btnOn('[data-gderived]') };
    },
    pin_peaks: ({ on }) => { clickIf('[data-gpin]', on); return { pin_peaks: on }; },
    pin_nodes: ({ left = [], right = [], clear } = {}) => {
      /* bound to the component's own pipeline (uni-graph.setCustomPins, added
         at v0.4.24 after the reader agent's follow-up): the stacks now hold
         through every later layout, whatever triggers it */
      if (clear) { graph.setCustomPins(null); return { cleared: true }; }
      const ids = left.concat(right);
      if (!ids.length) throw new Error('pin_nodes needs left and/or right ids (or clear: true)');
      for (const id of ids) {
        const n = graph.cy.$id(id);
        if (n.empty() || n.hasClass('uni-hide')) throw new Error('not visible on the canvas: ' + id);
      }
      graph.setCustomPins(left, right);
      return { pinned: { left, right },
        note: 'stacks placed in the reader’s own layout pipeline; they hold through later layouts and stay hand-draggable between runs' };
    },
    scroll_to_heading: ({ title }) => {
      if (!U.taxonomy.some((t) => t.title === title)) {
        throw new Error('unknown heading: ' + title + ' — get_coverage lists them');
      }
      document.querySelector('uni-source').scrollToHeading(title);
      return { scrolled_to: title };
    },
    step_anchor: ({ direction }) => {
      const id = direction === 'previous' ? '#uni-prev'
        : direction === 'next' ? '#uni-next' : null;
      if (!id) throw new Error('direction is next or previous');
      const b = document.querySelector('uni-source ' + id);
      if (!b) throw new Error('the source pane has no stepper on this screen');
      b.click();
      return { stepped: direction, selected: graph.selected || null };
    },
    maximize_graph: ({ on }) => {
      const box = graph.querySelector('.uni-graphbox');
      if (box.classList.contains('uni-gmax') !== on) gbtn('[data-gmax]').click();
      return { maximized: on };
    },
    reset_view: () => {
      impl.maximize_graph({ on: false });
      if (graph.customPins) graph.setCustomPins(null);
      clickIf('[data-gpin]', false);
      impl.set_view_preset({ view: 'overview' });
      impl.clear_selection();
      impl.set_highlight_kinds({ kinds: ['concept', 'claim', 'hypothesis', 'objective',
        'example', 'edge', 'nbn', 'alias'] });
      impl.show_graph({ on: true });
      return { reset: true };
    },
    paths_to_peaks: ({ on }) => { clickIf('[data-gpaths]', on); return { paths_to_peaks: on }; },
    set_highlight_kinds: ({ kinds }) => { emit('uni:pref', { key: 'kinds', value: kinds }); return { kinds }; },
    set_graph_look: ({ labels, size, boxed }) => {
      if (typeof labels === 'boolean') clickIf('[data-glabels]', labels);
      if (size) {
        const b = gbtn('[data-gsize="' + size + '"]');
        if (!b) throw new Error('size is s, m or l');
        b.click();
      }
      if (typeof boxed === 'boolean') clickIf('[data-gboxed]', boxed);
      return { labels: btnOn('[data-glabels]'),
        size: ['s', 'm', 'l'].find((s) => btnOn('[data-gsize="' + s + '"]')) || 's',
        boxed: btnOn('[data-gboxed]') };
    },
    show_panel: ({ on }) => {
      const b = document.getElementById('uni-tglpanel');
      if ((b.getAttribute('aria-pressed') === 'true') !== on) b.click();
      return { panel_on: on };
    },
    show_graph: ({ on }) => { emit('uni:pref', { key: 'graph', value: on }); return { graph_on: on }; },

    /* author — scratch on the canvas, drafts for the human; nothing anchored */
    add_scratch_node: ({ id, label, note }) => {
      if (graph.cy.$id(id).nonempty()) throw new Error('id already exists on the canvas: ' + id);
      ensureScratchStyle();
      graph.cy.add({ data: { id, label, family: 'scratch' }, classes: 'uni-scratch' });
      drafts.scratch.nodes.push({ id, label, note: note || '' });
      graph.runLayout();
      return { added: id, scratch: true, unsaved: true };
    },
    add_scratch_edge: ({ from, to, label }) => {
      for (const end of [from, to]) {
        if (graph.cy.$id(end).empty()) throw new Error('unknown node on the canvas: ' + end);
      }
      ensureScratchStyle();
      const id = 'scratch-' + from + '-' + to;
      if (graph.cy.$id(id).nonempty()) throw new Error('that scratch edge already exists');
      graph.cy.add({ data: { id, source: from, target: to, kind: 'scratch', verb: label || '' },
        classes: 'uni-scratch' });
      drafts.scratch.edges.push({ from, to, label: label || '' });
      return { added: id, scratch: true, unsaved: true };
    },
    clear_scratch: () => {
      graph.cy.$('.uni-scratch').remove();
      const n = drafts.scratch.nodes.length + drafts.scratch.edges.length;
      drafts.scratch = { nodes: [], edges: [] };
      return { removed: n };
    },
    annotate: ({ id, note }) => {
      requireAnchor(id);
      drafts.annotations.push({ id, note, at: new Date().toISOString() });
      return { annotated: id, session_only: true };
    },
    draft_crossref: async ({ where, what, how, rating, note }) => {
      const ex = await getEx();
      const known = new Set(ex.nodes.map((n) => n.id));
      const unknown = (what || []).filter((c) => !known.has(c));
      if (unknown.length) throw new Error('unknown concept id(s): ' + unknown.join(', '));
      const draft = { id: 'draft-' + (drafts.crossrefs.length + 1), where, what, how, rating,
        note, rated_by: 'chat-draft (unreviewed)', rated: new Date().toISOString().slice(0, 10) };
      drafts.crossrefs.push(draft);
      return { draft, next: 'a human reviews this and carries it into crossrefs.json — the gates verify it there' };
    },
    get_drafts: () => JSON.parse(JSON.stringify(drafts)),
  };

  /* ---- register and activate ---------------------------------------------- */
  const api = new SgToolApi({
    name: 'universe-reader',
    version: { api: '0.1.0', ui: '0.1.0', content: U.slug },
    panelId: U.slug,
    skills: { browser: 'skills/SKILL-browser.md', api: 'skills/SKILL-api.md' },
  });
  for (const c of COMMANDS) {
    if (!impl[c.name]) throw new Error('command table names a method with no implementation: ' + c.name);
    api.register(c.name, impl[c.name], { async: true, level: c.level });
  }
  /* The switchboard surface for consumers assembling an LLM request: the
     OpenAI function schemas for the enabled levels. Not itself in the table,
     so it is never offered to a model as a callable tool. */
  api.register('get_tool_schemas', ({ levels } = {}) => toolSchemas(levels || ['read', 'view']),
    { async: false });
  api.register('get_levels', () => LEVELS.slice(), { async: false });
  api.activate();
}
