/* @module universe-chat/chat
   The chat panel for a universe document page, assembled from the family's
   published LLM components (tools.sgraph.ai, pinned versions, permissive
   CORS). Loaded on demand by boot.js.

   The independence contract (v2/dev-packs/v0.4.13__universe-chat/):
   the page publishes an API; the chat consumes it. This module reaches the
   page ONLY through window.__tool — the universe reader's tool API — plus
   one public element method (uni-graph.resize()) to nudge the canvas after
   the panel changes the viewport. It imports none of the page's modules.

   The OpenRouter workflow: the user's own key, pasted once into
   sg-llm-connection, stored in localStorage['sg-llm-config'] only, and per
   that component's invariant never sent to any *.sgraph.ai domain. Default
   model: anthropic/claude-sonnet-5.

   The tool loop (per the estate's agentic design, v0.20.33): my listener on
   the bus augments each llm:send with the enabled levels' schemas; on
   llm:tool-calls the calls are executed against window.__tool, the results
   appended as tool messages, and the conversation re-sent — capped at
   MAX_HOPS rounds per user turn. Every invocation also lands in
   __tool.meta.getLog(), which is the audit trail. */
'use strict';
import { SGL_LLM } from 'https://tools.sgraph.ai/components/llm/sg-llm-events/v0/v0.1/v0.1.1/sg-llm-events.js';
import 'https://tools.sgraph.ai/components/llm/sg-llm-connection/v0/v0.1/v0.1.4/sg-llm-connection.js';
import 'https://tools.sgraph.ai/components/llm/sg-llm-request/v0/v0.1/v0.1.4/sg-llm-request.js';
import 'https://tools.sgraph.ai/components/llm/sg-llm-chat-history/v0/v0.1/v0.1.10/sg-llm-chat-history.js';
import 'https://tools.sgraph.ai/components/llm/sg-llm-chat-input/v0/v0.1/v0.1.5/sg-llm-chat-input.js';
import 'https://tools.sgraph.ai/components/llm/sg-llm-stats/v0/v0.1/v0.1.1/sg-llm-stats.js';

const CHAT_MESSAGE = 'llm:chat-message';
const DEFAULT_MODEL = 'anthropic/claude-sonnet-5';
const MAX_HOPS = 8;
const U = window.UNIVERSE;

const pref = (k, d) => { try { const v = localStorage.getItem('uchat:' + k); return v === null ? d : v; } catch (e) { return d; } };
const setPref = (k, v) => { try { localStorage.setItem('uchat:' + k, String(v)); } catch (e) { /* fine */ } };

const CHIPS = [
  'What does this document claim, and how well does it support each claim?',
  'Select the concept the most claims depend on, and show only its subtree.',
  'Which terms does the document use but never define? Show me each one.',
  'Review three anchors: is each quote fair to the section it comes from?',
  'What would a sceptic of graph-first modelling push back on here?',
];

const state = {
  built: false, connected: false, model: '', hops: 0, schemas: [],
  levels: (() => { try { return JSON.parse(pref('levels', '')) || { view: true, author: false }; }
    catch (e) { return { view: true, author: false }; } })(),
  promptChars: 0,
};
let aside = null, bus = null, tool = null;

export function open() {
  if (!state.built) build();
  aside.hidden = false;
  document.body.classList.add('uchat-open');
  setPref('open', 1);
  nudgeViewport();
}

function close() {
  aside.hidden = true;
  document.body.classList.remove('uchat-open');
  setPref('open', 0);
  nudgeViewport();
}

/* The one concession outside window.__tool: the reader's canvas needs a
   resize nudge when the viewport it sits in changes width. resize() is a
   public method of the published element. */
function nudgeViewport() {
  window.dispatchEvent(new Event('resize'));
  const g = document.querySelector('uni-graph');
  if (g && g.resize) g.resize();
}

function build() {
  state.built = true;
  tool = window.__tool;

  /* first run: seed the family's shared connection config with this site's
     defaults, without touching an existing key or choice */
  try {
    if (!localStorage.getItem('sg-llm-config')) {
      localStorage.setItem('sg-llm-config',
        JSON.stringify({ provider: 'openrouter', model: DEFAULT_MODEL }));
    }
  } catch (e) { /* storage blocked: connection still works, unconfigured */ }

  aside = document.createElement('aside');
  aside.className = 'uchat';
  aside.setAttribute('data-llm-bus', '');
  bus = aside;
  const w = pref('w', '');
  if (w) document.documentElement.style.setProperty('--uchat-w', w);

  aside.innerHTML =
    '<div class="uchat-resize" title="Drag to resize"></div>' +
    '<div class="uchat-head">' +
    '  <b>Talk to this graph</b> <span class="uchat-badge">metered</span>' +
    '  <span class="sp"></span>' +
    '  <span class="uchat-est" id="uc-est" title="Rough size of what each message carries: the grounding prompt plus the enabled tools"></span>' +
    '  <button class="uchat-hbtn" id="uc-settings" title="Model, provider and key">model</button>' +
    '  <button class="uchat-hbtn" id="uc-tools" title="Which tool levels the model may use">tools</button>' +
    '  <button class="uchat-hbtn" id="uc-help" title="What this is">?</button>' +
    '  <button class="uchat-hbtn" id="uc-new" title="Start a fresh conversation">New</button>' +
    '  <button class="uchat-hbtn" id="uc-close" title="Close">&#10005;</button>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-settings" hidden>' +
    '  <h5>Model &middot; the OpenRouter workflow</h5>' +
    '  <p>Your key is pasted here once and kept in this browser&rsquo;s localStorage only &mdash; it is never sent to any sgraph.ai or sgit.ai host. Requests go from your browser straight to the provider. Default model: <code>' + DEFAULT_MODEL + '</code>.</p>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-tools" hidden>' +
    '  <h5>What the model is allowed to do here</h5>' +
    '  <label><input type="checkbox" checked disabled> read <span class="lvl-note">&mdash; the universe as data: nodes, claims, anchors, the frozen source. Always on.</span></label>' +
    '  <label><input type="checkbox" id="uc-lvl-view"> view <span class="lvl-note">&mdash; drive the reader: select, filter, lay out, highlight.</span></label>' +
    '  <label><input type="checkbox" id="uc-lvl-author"> author <span class="lvl-note">&mdash; scratch nodes and drafts, visibly unsaved; nothing anchored is ever written.</span></label>' +
    '  <p>Every call the model makes is logged &mdash; <code>window.__tool.meta.getLog()</code> in the console shows the full audit trail.</p>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-help" hidden>' +
    '  <h5>What this is</h5>' +
    '  <p>A chat over <b>this document&rsquo;s local graph</b> &mdash; the extraction, its anchors, and the frozen source underneath. The model reads them through the page&rsquo;s own API and, at the <i>view</i> level, drives the reader for you: ask it to select, filter or re-lay the graph.</p>' +
    '  <p>Paste a screenshot straight into the input (Ctrl/Cmd-V) when pointing at something is easier than describing it.</p>' +
    '  <p>The same API is yours in the console: see <a href="skills/SKILL-browser.md">SKILL-browser</a> and <a href="skills/SKILL-api.md">SKILL-api</a>. The plan behind this panel: <a href="../dev-packs/v0.4.13__universe-chat/00__plan.md">the universe chat plan</a>.</p>' +
    '</div>' +
    '<div class="uchat-body uchat-fresh" id="uc-body">' +
    '  <div class="uchat-intro">' +
    '    <p><b>Nothing has been sent yet &mdash; and nothing has been spent.</b></p>' +
    '    <p>The page, the graph and every table are free, local and already verified against the frozen bytes. This side is what the page cannot do alone &mdash; questions, review, the graph driven by instruction &mdash; charged per call to your own OpenRouter key. Start here:</p>' +
    '    <div id="uc-chips"></div>' +
    '  </div>' +
    '  <sg-llm-chat-history></sg-llm-chat-history>' +
    '</div>' +
    '<div class="uchat-trace" id="uc-trace"></div>' +
    '<sg-llm-chat-input></sg-llm-chat-input>' +
    '<div class="uchat-nokey" id="uc-nokey"><b>No model connected.</b> The page is unaffected &mdash; it never needed one. To chat, <button id="uc-nokey-open">open model settings</button> and paste your OpenRouter key. It stays in this browser.</div>' +
    '<div class="uchat-foot">' +
    '  <span class="model" id="uc-model">&mdash;</span><span class="sp"></span>' +
    '  <sg-llm-stats compact></sg-llm-stats>' +
    '</div>';

  /* listeners BEFORE the request engine joins the bus: same-target listeners
     run in registration order, which is what lets the augmenter add tools to
     llm:send before sg-llm-request reads it */
  wireBus();
  document.body.appendChild(aside);

  /* the settings drawer gets the connection component only now, so its
     auto-connect (from a saved key) fires with every listener in place */
  const conn = document.createElement('sg-llm-connection');
  document.getElementById('uc-drawer-settings').appendChild(conn);
  const req = document.createElement('sg-llm-request');
  aside.appendChild(req);

  wireHeader();
  wireChips();
  wireResize();
  refreshSchemas();
  buildSystemPrompt();

  /* no saved key: open the settings drawer so the first thing seen is the
     honest ask, not a failed request */
  let cfg = null;
  try { cfg = JSON.parse(localStorage.getItem('sg-llm-config') || 'null'); } catch (e) { /* fine */ }
  if (!cfg || !cfg.apiKey) toggleDrawer('settings', true);
}

/* ---- the bus: augment sends, run the tool loop, keep the transcript clean -- */
function wireBus() {
  const trace = (cls, text) => {
    const el = document.getElementById('uc-trace');
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  };

  bus.addEventListener(SGL_LLM.SEND, (e) => {
    if (state.schemas.length && !e.detail.tools) {
      e.detail.tools = state.schemas;
      e.detail.tool_choice = 'auto';
    }
  });

  bus.addEventListener(CHAT_MESSAGE, () => {
    state.hops = 0;
    document.getElementById('uc-body').classList.remove('uchat-fresh');
  });

  bus.addEventListener(SGL_LLM.TOOL_CALLS, async (e) => {
    const { toolCalls, messages } = e.detail;
    state.hops += 1;
    if (state.hops > MAX_HOPS) {
      trace('err', '⏹ stopped after ' + MAX_HOPS + ' tool rounds in one turn');
      return;
    }
    const results = [];
    for (const c of toolCalls) {
      const name = c.function && c.function.name;
      let argText = (c.function && c.function.arguments) || '{}';
      trace('', '→ ' + name + ' ' + (argText.length > 120 ? argText.slice(0, 120) + '…' : argText));
      let out;
      try {
        if (!tool || typeof tool[name] !== 'function') throw new Error('unknown tool: ' + name);
        out = await tool[name](JSON.parse(argText));
        let body = JSON.stringify(out === undefined ? null : out);
        if (body.length > 24000) body = body.slice(0, 24000) + '…(truncated)';
        results.push({ role: 'tool', tool_call_id: c.id, content: body });
        trace('ok', '✓ ' + name);
      } catch (err) {
        results.push({ role: 'tool', tool_call_id: c.id,
          content: JSON.stringify({ error: err.message }) });
        trace('err', '✗ ' + name + ' — ' + err.message);
      }
    }
    const cont = [...messages,
      { role: 'assistant', content: null, tool_calls: toolCalls }, ...results];
    /* the engine clears its busy flag in the same tick this handler first
       yields in; wait it out rather than racing it */
    const req = aside.querySelector('sg-llm-request');
    for (let i = 0; i < 100 && req.busy; i++) await new Promise((r) => setTimeout(r, 50));
    bus.dispatchEvent(new CustomEvent(SGL_LLM.SEND, {
      detail: { messages: cont, mode: 'build', tools: state.schemas, tool_choice: 'auto' },
    }));
  });

  bus.addEventListener(SGL_LLM.REQUEST_COMPLETE, (e) => {
    /* a pure tool-call turn leaves an empty assistant bubble in the history;
       once the loop lands (no more tool calls), sweep those out */
    if (e.detail.toolCalls && e.detail.toolCalls.length) return;
    const hist = bus.__sgLlmChatHistory;
    if (!hist) return;
    const st = hist.getState();
    const kept = st.turns.filter((t) => !(t.role === 'assistant'
      && !(typeof t.content === 'string' ? t.content.trim() : t.content)
      && !(t.images && t.images.length)));
    if (kept.length !== st.turns.length) hist.setState({ ...st, turns: kept });
  });

  bus.addEventListener(SGL_LLM.CONNECTED, (e) => {
    state.connected = true;
    state.model = (e.detail && e.detail.model) || '';
    document.getElementById('uc-model').textContent = state.model || 'connected';
    document.getElementById('uc-nokey').hidden = true;
  });
  bus.addEventListener(SGL_LLM.MODEL_CHANGED, (e) => {
    state.model = (e.detail && e.detail.model) || state.model;
    document.getElementById('uc-model').textContent = state.model;
  });
  bus.addEventListener(SGL_LLM.DISCONNECTED, () => {
    state.connected = false;
    document.getElementById('uc-nokey').hidden = false;
  });
  bus.addEventListener(SGL_LLM.REQUEST_START, (e) => {
    if (e.detail && e.detail.tokenEstimate) {
      document.getElementById('uc-est').textContent = '~' + e.detail.tokenEstimate + ' tok';
    }
  });
  bus.addEventListener(SGL_LLM.REQUEST_ERROR, (e) => {
    trace('err', '✗ request — ' + ((e.detail && e.detail.error) || 'failed'));
  });
}

/* ---- header, drawers, chips, resize --------------------------------------- */
function toggleDrawer(which, force) {
  for (const d of ['settings', 'tools', 'help']) {
    const el = document.getElementById('uc-drawer-' + d);
    const btn = document.getElementById('uc-' + (d === 'help' ? 'help' : d));
    const on = d === which ? (force !== undefined ? force : el.hidden) : false;
    el.hidden = !on;
    if (btn) btn.classList.toggle('on', on);
  }
}

function wireHeader() {
  document.getElementById('uc-settings').addEventListener('click', () => toggleDrawer('settings'));
  document.getElementById('uc-tools').addEventListener('click', () => toggleDrawer('tools'));
  document.getElementById('uc-help').addEventListener('click', () => toggleDrawer('help'));
  document.getElementById('uc-close').addEventListener('click', close);
  document.getElementById('uc-nokey-open').addEventListener('click', () => toggleDrawer('settings', true));
  document.getElementById('uc-new').addEventListener('click', () => {
    const hist = bus.__sgLlmChatHistory;
    if (hist) hist.clear();
    state.hops = 0;
    document.getElementById('uc-trace').textContent = '';
    document.getElementById('uc-body').classList.add('uchat-fresh');
    buildSystemPrompt();
  });

  const view = document.getElementById('uc-lvl-view');
  const author = document.getElementById('uc-lvl-author');
  view.checked = !!state.levels.view;
  author.checked = !!state.levels.author;
  const onLevel = () => {
    state.levels = { view: view.checked, author: author.checked };
    setPref('levels', JSON.stringify(state.levels));
    refreshSchemas();
  };
  view.addEventListener('change', onLevel);
  author.addEventListener('change', onLevel);
}

function wireChips() {
  const box = document.getElementById('uc-chips');
  for (const text of CHIPS) {
    const b = document.createElement('button');
    b.className = 'uchat-chip';
    b.textContent = text;
    b.addEventListener('click', () => {
      if (!state.connected) { toggleDrawer('settings', true); return; }
      bus.dispatchEvent(new CustomEvent(CHAT_MESSAGE, { detail: { text } }));
    });
    box.appendChild(b);
  }
}

function wireResize() {
  const grip = aside.querySelector('.uchat-resize');
  grip.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    grip.classList.add('drag');
    grip.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const px = Math.min(Math.max(window.innerWidth - ev.clientX, 320), 760);
      document.documentElement.style.setProperty('--uchat-w', px + 'px');
      nudgeViewport();
    };
    const up = () => {
      grip.classList.remove('drag');
      setPref('w', document.documentElement.style.getPropertyValue('--uchat-w'));
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
  });
}

/* ---- levels → schemas, and the grounding prompt ---------------------------- */
async function refreshSchemas() {
  const levels = ['read'];
  if (state.levels.view) levels.push('view');
  if (state.levels.author) levels.push('author');
  try { state.schemas = await tool.get_tool_schemas({ levels }); }
  catch (e) { state.schemas = []; }
  updateEstimate();
}

function updateEstimate() {
  const chars = state.promptChars + JSON.stringify(state.schemas).length;
  document.getElementById('uc-est').textContent = '~' + Math.round(chars / 4) + ' tok';
}

async function buildSystemPrompt() {
  if (!tool) return;
  let prompt;
  try {
    const [doc, nodes, pairings] = await Promise.all([
      tool.get_doc(), tool.get_nodes(), tool.get_pairings()]);
    const concepts = nodes.filter((n) => n.family === 'concept');
    const claims = nodes.filter((n) => n.family === 'claim');
    const rest = nodes.filter((n) => n.family !== 'concept' && n.family !== 'claim');
    prompt = [
      'You are the chat panel on a page of graphs.sgit.ai: the layer 1 local graph of one frozen source document, "' + doc.title + '".',
      'Every item on the page is a record that THIS DOCUMENT SAYS something, at a verified anchor — whether it is true is deliberately not judged at this layer. Answer from the extraction and the source, cite item ids in backticks (e.g. `meaning-through-connectivity`), and when a claim is involved say how the document supports it (demonstrated, argued or declared). If the extraction does not carry an answer, say so rather than inventing one.',
      'You have tools. Reading tools fetch the data; view tools drive the page — when the user asks to see, show, select, filter or lay out something, actually do it with the view tools rather than describing what they could click. After driving the view, say briefly what is now on screen.',
      'The dictionary (id: label — statement; * = used but never defined):',
      concepts.map((c) => '  ' + (c.defined ? '' : '*') + c.id + ': ' + c.label + ' — ' + c.statement).join('\n'),
      'The claims (id [support]: statement):',
      claims.map((c) => '  ' + c.id + ' [' + c.support + ']: ' + c.statement).join('\n'),
      'Hypotheses, objectives and worked examples:',
      rest.map((n) => '  ' + n.id + ' [' + n.family + ']: ' + n.statement).join('\n'),
      'Also-called: ' + pairings.also_called.map((x) => x.a + ' ↔ ' + x.b).join('; '),
      'Near-but-not: ' + pairings.near_but_not.map((x) => x.this + ' is NOT ' + x.not).join('; '),
    ].join('\n\n');
  } catch (e) {
    prompt = 'You are the chat panel on a universe document page of graphs.sgit.ai. The page API is unavailable, so answer only from what the user pastes, and say the grounding failed to load.';
  }
  state.promptChars = prompt.length;
  const hist = bus.__sgLlmChatHistory;
  if (hist) hist.setSystemPrompt(prompt);
  updateEstimate();
}
