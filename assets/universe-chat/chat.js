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
  'Select the concept the most claims depend on, and explore two hops around it.',
  'Which terms does the document use but never define? Show me each one.',
  'Review three anchors: is each quote fair to the section it comes from?',
  'Create an infographic of this document’s claims and how each is supported.',
  'Rewrite this document’s opening for the current persona, and save it as a view.',
  'What would a sceptic of graph-first modelling push back on here?',
];

const state = {
  built: false, connected: false, model: '', hops: 0, schemas: [],
  levels: (() => { try { return JSON.parse(pref('levels', '')) || { view: true, author: false }; }
    catch (e) { return { view: true, author: false }; } })(),
  promptChars: 0,
  traceLines: [],
  vault: { client: null, sid: null, autosave: pref('vasave', '1') === '1', timer: 0, meta: null },
  persona: { active: null, vaultList: [] },
};
let aside = null, bus = null, tool = null;
let traceFn = () => {};

/* The one chat-local tool: it exists only while a vault is connected, and it
   writes only inside the current session's folder. */
/* The starter personas: reading angles, offered before any vault exists. A
   persona used from a vault-connected chat is saved there, where any key
   holder — the founder, an agent, a pipeline — can tune it or add more. */
const BUILTIN_PERSONAS = [
  { slug: 'engineer', name: 'the engineer',
    prompt: 'The reader is a hands-on software engineer. Lead with mechanisms and concrete consequences: what they would build, query or refactor differently tomorrow. Code-shaped examples beat abstractions.' },
  { slug: 'ciso', name: 'the CISO',
    prompt: 'The reader runs risk for a board. Translate every claim into exposure, assurance and evidence: what becomes provable, what stays a judgement call, what an auditor would accept. Short, decision-shaped answers.' },
  { slug: 'sceptic', name: 'the sceptic',
    prompt: 'The reader doubts graph-first modelling. Steel-man their objections before answering them, concede what the document only argues or declares, and never present an argued claim as demonstrated.' },
  { slug: 'plain-english', name: 'plain English',
    prompt: 'The reader is smart but not technical. No jargon survives: every technical term is unpacked in ordinary words the first time it appears, and examples come from everyday life.' },
  { slug: 'portugues', name: 'português',
    prompt: 'Responde sempre em português europeu. Mantém os factos, os ids dos nós e as citações exactamente iguais ao original — muda a língua, nunca o conteúdo.' },
];

const SAVE_VIEW_TOOL = {
  type: 'function',
  function: {
    name: 'save_view',
    description: 'Save a persona-targeted VIEW of this document into the vault — a rewrite, summary, translation or projection shaped for the active persona. Views live under the persona, beside the feedback they earn, and are the raw material of the personalised document. Returns the vault path.',
    parameters: { type: 'object', properties: {
      name: { type: 'string', description: 'File name for the view, e.g. "opening-rewrite.md".' },
      content: { type: 'string', description: 'The full view content.' } },
    required: ['name', 'content'], additionalProperties: false },
  },
};

const FEEDBACK_TOOL = {
  type: 'function',
  function: {
    name: 'record_feedback',
    description: 'Record the user’s reaction to a saved view, beside that view in the vault. Call this whenever the user judges a view you saved — it landed, it is wrong, it is unclear — quoting their reasoning in the note. This feedback is what the next generation of the view is built from.',
    parameters: { type: 'object', properties: {
      view: { type: 'string', description: 'The view file name the feedback is about.' },
      verdict: { type: 'string', enum: ['right', 'wrong', 'unclear', 'note'] },
      note: { type: 'string', description: 'The user’s reaction, in substance — what worked or failed and why.' } },
    required: ['view', 'verdict', 'note'], additionalProperties: false },
  },
};

const INFOGRAPHIC_TOOL = {
  type: 'function',
  function: {
    name: 'generate_infographic',
    description: 'Generate an infographic image from a brief you write, render it in the chat, and (when a vault is connected) save the PNG into this session’s images/ folder. Use it when the user asks for an infographic, a visual summary, or a diagram-as-image of something from this document. Write the brief yourself: the layout, the exact text to show, the claims with their support states.',
    parameters: { type: 'object', properties: {
      brief: { type: 'string', description: 'What the infographic must show, including exact wording.' },
      style: { type: 'string', description: 'Optional style guidance (palette, tone, density).' } },
    required: ['brief'], additionalProperties: false },
  },
};

const SAVE_DOC_TOOL = {
  type: 'function',
  function: {
    name: 'save_to_vault',
    description: 'Save a document you have written into the user’s connected vault, inside this chat session’s folder. Use it when the user asks to keep, save or export something you produced — a summary, a review, a rewrite. Returns the vault path.',
    parameters: { type: 'object', properties: {
      name: { type: 'string', description: 'File name, e.g. "claims-review.md".' },
      content: { type: 'string', description: 'The full file content.' } },
    required: ['name', 'content'], additionalProperties: false },
  },
};

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
    '  <button class="uchat-hbtn" id="uc-mic" title="Voice note: record, transcribe with your key, send">&#127908;</button>' +
    '  <button class="uchat-hbtn" id="uc-settings" title="Model, provider and key">model</button>' +
    '  <button class="uchat-hbtn" id="uc-tools" title="Which tool levels the model may use">tools</button>' +
    '  <button class="uchat-hbtn" id="uc-vault" title="Persist sessions to an encrypted vault">vault</button>' +
    '  <button class="uchat-hbtn" id="uc-persona" title="Read as a persona: an angle applied to every answer">persona</button>' +
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
    '<div class="uchat-drawer" id="uc-drawer-vault" hidden>' +
    '  <h5>The vault &middot; sessions that survive the refresh</h5>' +
    '  <p>Paste a vault key (<code>passphrase:vaultId</code> or a Simple Token). Every conversation is then saved as a folder of files under <code>/universe-chat/</code> in that vault &mdash; encrypted in this browser before anything leaves it, readable by <code>sgit clone</code> anywhere you hold the key. The key stays in this browser&rsquo;s localStorage, like the model key.</p>' +
    '  <input type="password" id="uc-vkey" placeholder="vault key:  passphrase:vaultId  or  word-word-0000" autocomplete="off" spellcheck="false" style="width:100%;box-sizing:border-box;background:#12122a;color:#e2e8f0;border:1px solid #2d3060;border-radius:5px;padding:7px 9px;font:12px monospace">' +
    '  <input type="password" id="uc-vtoken" placeholder="server access key (if the server requires one)" autocomplete="off" spellcheck="false" style="width:100%;box-sizing:border-box;margin-top:6px;background:#12122a;color:#e2e8f0;border:1px solid #2d3060;border-radius:5px;padding:7px 9px;font:12px monospace">' +
    '  <input type="text" id="uc-vendpoint" placeholder="endpoint (default https://send.sgraph.ai)" autocomplete="off" spellcheck="false" style="width:100%;box-sizing:border-box;margin-top:6px;background:#12122a;color:#e2e8f0;border:1px solid #2d3060;border-radius:5px;padding:7px 9px;font:12px monospace">' +
    '  <p style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '    <button class="uchat-hbtn" id="uc-vconnect">connect</button>' +
    '    <button class="uchat-hbtn" id="uc-vsave" hidden>save now</button>' +
    '    <button class="uchat-hbtn" id="uc-vforget" hidden>forget key</button>' +
    '    <span class="small" id="uc-vmsg" style="color:#94a3b8"></span></p>' +
    '  <label><input type="checkbox" id="uc-vasave" checked> autosave after every reply <span class="lvl-note">&mdash; one commit per changed file, pushed immediately</span></label>' +
    '  <div id="uc-vsessions"></div>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-persona" hidden>' +
    '  <h5>The persona &middot; one document, many readers</h5>' +
    '  <p>A persona is an angle applied to every answer &mdash; a role, a language, a level. With a vault connected, personas live in it at <code>/personas/</code>, where you or any agent holding the key can tune them or add new ones; the views the model saves for a persona, and your feedback on them, land beside it. That ledger is the seed of the personalised document.</p>' +
    '  <div id="uc-plist"></div>' +
    '  <h5 style="margin-top:10px">New or edited persona</h5>' +
    '  <input type="text" id="uc-pname" placeholder="name, e.g. the CFO" style="width:100%;box-sizing:border-box;background:#12122a;color:#e2e8f0;border:1px solid #2d3060;border-radius:5px;padding:7px 9px;font:12px system-ui">' +
    '  <textarea id="uc-pprompt" rows="3" placeholder="the angle: who is reading, what they need, how to speak to them" style="width:100%;box-sizing:border-box;margin-top:6px;background:#12122a;color:#e2e8f0;border:1px solid #2d3060;border-radius:5px;padding:7px 9px;font:12px system-ui;resize:vertical"></textarea>' +
    '  <p><button class="uchat-hbtn" id="uc-puse">use now</button> <button class="uchat-hbtn" id="uc-psave">save to vault &amp; use</button> <span class="small" id="uc-pmsg" style="color:#94a3b8"></span></p>' +
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
    '  <span class="model" id="uc-model">&mdash;</span>' +
    '  <span class="model" id="uc-pfoot"></span>' +
    '  <span id="uc-vstat"></span><span class="sp"></span>' +
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
  wireVault();
  wireMic();
  wirePersona();
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
    state.traceLines.push(text);
  };
  traceFn = trace;

  bus.addEventListener(SGL_LLM.SEND, (e) => {
    if (state.schemas.length && !e.detail.tools) {
      e.detail.tools = state.schemas;
      e.detail.tool_choice = 'auto';
    }
    if (state.connected) {
      e.detail.tools = (e.detail.tools || []).concat([INFOGRAPHIC_TOOL]);
      e.detail.tool_choice = e.detail.tool_choice || 'auto';
    }
    if (state.vault.client && state.vault.client.connected) {
      e.detail.tools = (e.detail.tools || []).concat([SAVE_DOC_TOOL]);
      if (state.persona.active) {
        e.detail.tools = e.detail.tools.concat([SAVE_VIEW_TOOL, FEEDBACK_TOOL]);
      }
      e.detail.tool_choice = e.detail.tool_choice || 'auto';
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
        if (name === 'save_to_vault') {
          const a = JSON.parse(argText);
          out = await vaultSaveDocument(a.name, a.content);
        } else if (name === 'generate_infographic') {
          const a = JSON.parse(argText);
          out = await makeInfographic(a.brief, a.style);
        } else if (name === 'save_view') {
          const a = JSON.parse(argText);
          out = await personaSaveView(a.name, a.content);
        } else if (name === 'record_feedback') {
          const a = JSON.parse(argText);
          out = await personaRecordFeedback(a.view, a.verdict, a.note);
        } else if (!tool || typeof tool[name] !== 'function') {
          throw new Error('unknown tool: ' + name);
        } else out = await tool[name](JSON.parse(argText));
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
    scheduleVaultSave();
  });
  bus.addEventListener(SGL_LLM.REQUEST_ERROR, () => scheduleVaultSave());

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
  for (const d of ['settings', 'tools', 'vault', 'persona', 'help']) {
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
  document.getElementById('uc-vault').addEventListener('click', () => toggleDrawer('vault'));
  document.getElementById('uc-persona').addEventListener('click', () => toggleDrawer('persona'));
  document.getElementById('uc-help').addEventListener('click', () => toggleDrawer('help'));
  document.getElementById('uc-close').addEventListener('click', close);
  document.getElementById('uc-nokey-open').addEventListener('click', () => toggleDrawer('settings', true));
  document.getElementById('uc-new').addEventListener('click', () => {
    const hist = bus.__sgLlmChatHistory;
    if (hist) hist.clear();
    state.hops = 0;
    state.traceLines = [];
    state.vault.sid = null;      /* the next save starts a new session folder */
    state.vault.meta = null;
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
  const p = state.persona.active;
  if (p) {
    prompt += '\n\nTHE READER PERSONA — "' + p.name + '". ' + p.prompt
      + '\nEverything you write speaks to this persona. When you produce a rewritten, summarised, translated or projected version of the document for them, save it with save_view (a view is a first-class artefact, not chat text). When the user reacts to a saved view — it landed, it is wrong, it is unclear — record that with record_feedback against the view, quoting their reasoning: the feedback ledger is what the next generation of the view is built from.';
  }
  state.promptChars = prompt.length;
  const hist = bus.__sgLlmChatHistory;
  if (hist) hist.setSystemPrompt(prompt);
  updateEstimate();
}

/* ---- personas: one document, many readers ---------------------------------- */
function personaFoot() {
  const el = document.getElementById('uc-pfoot');
  el.textContent = state.persona.active ? '· as ' + state.persona.active.name : '';
}

function allPersonas() {
  const vaultSlugs = new Set(state.persona.vaultList.map((p) => p.slug));
  return state.persona.vaultList.concat(
    BUILTIN_PERSONAS.filter((b) => !vaultSlugs.has(b.slug)).map((b) => ({ ...b, builtin: true })));
}

function setActivePersona(p) {
  state.persona.active = p;
  setPref('persona', p ? p.slug : '');
  personaFoot();
  renderPersonaList();
  buildSystemPrompt();
}

function renderPersonaList() {
  const box = document.getElementById('uc-plist');
  box.innerHTML = '';
  const mk = (label, on, cb, title) => {
    const b = document.createElement('button');
    b.className = 'uchat-hbtn' + (on ? ' on' : '');
    b.style.margin = '0 6px 6px 0';
    b.textContent = label;
    if (title) b.title = title;
    b.addEventListener('click', cb);
    box.appendChild(b);
  };
  mk('none', !state.persona.active, () => setActivePersona(null), 'No persona: the plain grounding prompt');
  for (const p of allPersonas()) {
    mk(p.name + (p.builtin ? '' : ' ⬢'), state.persona.active && state.persona.active.slug === p.slug,
      () => setActivePersona(p),
      (p.builtin ? 'built-in — saved to the vault when used from a connected chat' : 'from the vault') +
      '\n' + p.prompt);
  }
}

async function refreshPersonaList() {
  const client = state.vault.client;
  if (client && client.connected) {
    try { state.persona.vaultList = await client.listPersonas(); }
    catch (e) { state.persona.vaultList = []; }
  }
  /* restore the remembered choice once the vault list is in */
  const want = pref('persona', '');
  if (want && (!state.persona.active || state.persona.active.slug !== want)) {
    const found = allPersonas().find((p) => p.slug === want);
    if (found) { state.persona.active = found; personaFoot(); buildSystemPrompt(); }
  }
  renderPersonaList();
}

function wirePersona() {
  const nameIn = document.getElementById('uc-pname');
  const promptIn = document.getElementById('uc-pprompt');
  const msg = document.getElementById('uc-pmsg');
  document.getElementById('uc-puse').addEventListener('click', () => {
    const name = nameIn.value.trim(), p = promptIn.value.trim();
    if (!name || !p) { msg.textContent = 'a persona needs a name and an angle'; return; }
    setActivePersona({ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      name, prompt: p, session_only: true });
    msg.textContent = 'in use for this session (not saved)';
  });
  document.getElementById('uc-psave').addEventListener('click', async () => {
    const name = nameIn.value.trim(), p = promptIn.value.trim();
    if (!name || !p) { msg.textContent = 'a persona needs a name and an angle'; return; }
    const client = state.vault.client;
    if (!client || !client.connected) { msg.textContent = 'connect a vault first — or "use now" for this session only'; return; }
    try {
      const slug = await client.savePersona(name, p, { author: 'user (chat)' });
      msg.textContent = 'saved to the vault as ' + slug;
      await refreshPersonaList();
      const saved = allPersonas().find((x) => x.slug === slug);
      if (saved) setActivePersona(saved);
    } catch (err) { msg.textContent = 'save failed — ' + err.message; }
  });
  refreshPersonaList();
}

async function ensureActivePersonaInVault() {
  const p = state.persona.active;
  const client = state.vault.client;
  if (!p || !client || !client.connected) throw new Error('needs a vault and an active persona');
  const inVault = state.persona.vaultList.some((x) => x.slug === p.slug);
  if (!inVault) {
    await client.savePersona(p.name, p.prompt, { author: p.builtin ? 'builtin (chat)' : 'user (chat)' });
    state.persona.vaultList = await client.listPersonas();
    renderPersonaList();
  }
  return p;
}

async function personaSaveView(name, content) {
  const p = await ensureActivePersonaInVault();
  const r = await state.vault.client.saveView(p.slug, U.slug, name, content);
  traceFn('ok', '✓ view saved for ' + p.name + ': ' + r.path);
  return { saved: r.path, persona: p.slug,
    note: 'tell the user where it landed, and invite their reaction — record it with record_feedback' };
}

async function personaRecordFeedback(view, verdict, note) {
  const p = await ensureActivePersonaInVault();
  const r = await state.vault.client.recordFeedback(p.slug, U.slug, view, {
    at: new Date().toISOString(), session: state.vault.sid || null, verdict, note });
  traceFn('ok', '✓ feedback filed on ' + view + ' (' + verdict + ')');
  return { filed: r.path, entries: r.entries };
}

/* ---- the vault: sessions that survive the refresh -------------------------- */
function vstat(text, err) {
  const el = document.getElementById('uc-vstat');
  el.textContent = text;
  el.style.color = err ? '#f87171' : '#4ade80';
  const msg = document.getElementById('uc-vmsg');
  if (msg) { msg.textContent = text; msg.style.color = err ? '#f87171' : '#94a3b8'; }
}

function wireVault() {
  const keyInput = document.getElementById('uc-vkey');
  const connectBtn = document.getElementById('uc-vconnect');
  const saveBtn = document.getElementById('uc-vsave');
  const forgetBtn = document.getElementById('uc-vforget');
  const asaveChk = document.getElementById('uc-vasave');
  asaveChk.checked = state.vault.autosave;
  asaveChk.addEventListener('change', () => {
    state.vault.autosave = asaveChk.checked;
    setPref('vasave', asaveChk.checked ? '1' : '0');
  });

  const tokenInput = document.getElementById('uc-vtoken');
  const endpointInput = document.getElementById('uc-vendpoint');
  const connect = async (rawKey, accessToken, endpoint) => {
    connectBtn.disabled = true;
    vstat('vault: connecting…');
    try {
      const { ChatVault } = await import('./vault.js');
      const client = new ChatVault();
      const { vaultId } = await client.connect(rawKey,
        { accessToken: accessToken || undefined, endpoint: endpoint || undefined });
      state.vault.client = client;
      setPref('vault', JSON.stringify({ key: rawKey, token: accessToken || '', endpoint: endpoint || '' }));
      vstat('vault: ' + vaultId);
      saveBtn.hidden = false; forgetBtn.hidden = false;
      connectBtn.textContent = 'reconnect';
      renderSessions();
      refreshPersonaList();
    } catch (err) {
      vstat('vault: ' + err.message, true);
    } finally { connectBtn.disabled = false; }
  };

  connectBtn.addEventListener('click', () => {
    const raw = keyInput.value.trim();
    if (raw) connect(raw, tokenInput.value.trim(), endpointInput.value.trim());
  });
  saveBtn.addEventListener('click', () => vaultSaveNow('save now'));
  forgetBtn.addEventListener('click', () => {
    setPref('vault', '');
    keyInput.value = ''; tokenInput.value = ''; endpointInput.value = '';
    if (state.vault.client) state.vault.client.disconnect();
    state.vault.client = null;
    saveBtn.hidden = true; forgetBtn.hidden = true;
    connectBtn.textContent = 'connect';
    document.getElementById('uc-vsessions').textContent = '';
    vstat('');
    document.getElementById('uc-vstat').textContent = '';
  });

  const saved = pref('vault', '');
  if (saved) {
    let cfg;
    try { cfg = JSON.parse(saved); } catch (e) { cfg = { key: saved, token: '', endpoint: '' }; }
    if (cfg && cfg.key) {
      keyInput.value = cfg.key;
      tokenInput.value = cfg.token || '';
      endpointInput.value = cfg.endpoint || '';
      connect(cfg.key, cfg.token, cfg.endpoint);
    }
  }
}

async function renderSessions() {
  const box = document.getElementById('uc-vsessions');
  const client = state.vault.client;
  if (!client || !client.connected) { box.textContent = ''; return; }
  let sessions = [];
  try { sessions = await client.listSessions(U.slug); } catch (e) { /* an empty vault is fine */ }
  box.innerHTML = '';
  if (!sessions.length) return;
  const h = document.createElement('h5');
  h.textContent = 'Saved sessions for this document';
  box.appendChild(h);
  for (const sid of sessions.slice(0, 12)) {
    const b = document.createElement('button');
    b.className = 'uchat-chip';
    b.textContent = (sid === state.vault.sid ? '▸ ' : '') + sid
      + (sid === state.vault.sid ? ' (current)' : ' — restore');
    b.addEventListener('click', async () => {
      try {
        const { messages } = await client.loadSession(U.slug, sid);
        const hist = bus.__sgLlmChatHistory;
        hist.setState(messages);
        state.vault.sid = sid;
        state.vault.meta = null;      /* session.json already exists in the vault */
        state.hops = 0;
        document.getElementById('uc-body').classList.remove('uchat-fresh');
        vstat('vault: restored ' + sid);
        renderSessions();
      } catch (err) { vstat('vault: ' + err.message, true); }
    });
    box.appendChild(b);
  }
}

function scheduleVaultSave() {
  if (!state.vault.autosave || !state.vault.client || !state.vault.client.connected) return;
  clearTimeout(state.vault.timer);
  state.vault.timer = setTimeout(() => vaultSaveNow('autosave'), 1200);
}

async function vaultSaveNow(why) {
  const client = state.vault.client;
  const hist = bus.__sgLlmChatHistory;
  if (!client || !client.connected || !hist) return;
  const messages = hist.getState();
  if (!messages.turns.length) return;
  await ensureVaultSid();
  let drafts = null;
  try { drafts = await tool.get_drafts(); } catch (e) { /* page API optional here */ }
  try {
    const r = await client.save(U.slug, state.vault.sid, {
      meta: state.vault.meta, messages, drafts,
      trace: state.traceLines.join('\n') + '\n',
    });
    if (r.written.length) {
      vstat('vault: saved ' + r.written.join(', ') + ' · ' + new Date().toISOString().slice(11, 16));
      renderSessions();
    }
  } catch (err) {
    vstat('vault: save failed — ' + err.message, true);
    traceFn('err', '✗ vault save — ' + err.message);
  }
}

/* ---- voice notes: record → transcribe with the user's key → send ----------- */
function wireMic() {
  const mic = document.getElementById('uc-mic');
  let rec = null, t0 = 0, timer = 0;
  const idle = () => {
    mic.classList.remove('rec');
    mic.innerHTML = '&#127908;';
    clearInterval(timer);
  };
  mic.addEventListener('click', async () => {
    if (!state.connected) { toggleDrawer('settings', true); return; }
    if (rec) {
      const h = rec; rec = null;
      idle();
      mic.disabled = true; mic.textContent = '…';
      try {
        const wav = await h.stop();
        if (!wav) throw new Error('nothing was recorded');
        traceFn('', '→ transcribing voice note (' + Math.round(wav.size / 1024) + ' KB wav)');
        const media = await import('./media.js');
        const text = await media.transcribe(wav);
        traceFn('ok', '✓ transcribed: ' + (text.length > 80 ? text.slice(0, 80) + '…' : text));
        bus.dispatchEvent(new CustomEvent(CHAT_MESSAGE, { detail: { text } }));
        if (state.vault.client && state.vault.client.connected) {
          try {
            await ensureVaultSid();
            const bytes = new Uint8Array(await wav.arrayBuffer());
            const r = await state.vault.client.saveFile(U.slug, state.vault.sid, 'voice-notes',
              'note-' + new Date().toISOString().slice(11, 19).replace(/:/g, '') + '.wav', bytes);
            traceFn('ok', '✓ voice note kept: ' + r.path);
          } catch (err) { traceFn('err', '✗ voice note not saved — ' + err.message); }
        }
      } catch (err) {
        traceFn('err', '✗ voice — ' + err.message);
      } finally { mic.disabled = false; idle(); }
      return;
    }
    try {
      const media = await import('./media.js');
      rec = await media.startVoiceNote();
      t0 = performance.now();
      mic.classList.add('rec');
      timer = setInterval(() => {
        const s = Math.floor((performance.now() - t0) / 1000);
        mic.textContent = '■ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      }, 500);
      mic.textContent = '■ 0:00';
    } catch (err) {
      rec = null; idle();
      traceFn('err', '✗ mic — ' + err.message);
    }
  });
}

/* ---- infographics: one image call, rendered in the transcript, kept -------- */
async function makeInfographic(brief, style) {
  const media = await import('./media.js');
  traceFn('', '→ generating infographic (' + media.IMAGE_MODEL + ')');
  const { dataUrl } = await media.generateInfographic(brief, style);
  const hist = bus.__sgLlmChatHistory;
  if (hist) {
    const st = hist.getState();
    st.turns.push({ role: 'assistant', content: '[infographic]',
      images: [{ image_url: { url: dataUrl } }] });
    hist.setState(st);
  }
  let saved = null;
  if (state.vault.client && state.vault.client.connected) {
    try {
      await ensureVaultSid();
      const r = await state.vault.client.saveFile(U.slug, state.vault.sid, 'images',
        'infographic-' + new Date().toISOString().slice(11, 19).replace(/:/g, '') + '.png',
        media.dataUrlToBytes(dataUrl));
      saved = r.path;
      traceFn('ok', '✓ infographic kept: ' + r.path);
    } catch (err) { traceFn('err', '✗ infographic not saved — ' + err.message); }
  }
  scheduleVaultSave();
  return { shown_in_chat: true, saved_to_vault: saved,
    note: 'the image is already displayed to the user' + (saved ? ' and saved at ' + saved : '') };
}

async function ensureVaultSid() {
  if (state.vault.sid) return;
  const { sessionId } = await import('./vault-core.js');
  state.vault.sid = sessionId(new Date());
  state.vault.meta = { doc: U.slug, title: U.title, page: location.href,
    started: new Date().toISOString(), model: state.model || null,
    persona: state.persona.active ? state.persona.active.slug : null };
}

async function vaultSaveDocument(name, content) {
  const client = state.vault.client;
  if (!client || !client.connected) throw new Error('no vault connected — the user connects one in the vault drawer');
  await ensureVaultSid();
  const r = await client.saveDocument(U.slug, state.vault.sid, name, content);
  traceFn('ok', '✓ saved to vault: ' + r.path);
  return { saved: r.path, vault: client.vaultId };
}
