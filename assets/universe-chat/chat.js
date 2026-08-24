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
import { panelMarkup } from './chat-markup.js';
import { wireToolLoop } from './tool-loop.js';
import { groundingPrompt } from './chat-core.js';

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

  aside.innerHTML = panelMarkup(DEFAULT_MODEL);

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

/* ---- the bus: status wiring here; the agentic engine lives in tool-loop.js - */
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

  wireToolLoop({
    bus, events: SGL_LLM, chatEvent: CHAT_MESSAGE, state,
    getTool: () => tool,
    extraTools: () => {
      const extra = [];
      if (state.connected) extra.push(INFOGRAPHIC_TOOL);
      if (state.vault.client && state.vault.client.connected) {
        extra.push(SAVE_DOC_TOOL);
        if (state.persona.active) extra.push(SAVE_VIEW_TOOL, FEEDBACK_TOOL);
      }
      return extra;
    },
    runLocal: (name, a) => {
      if (name === 'save_to_vault') return vaultSaveDocument(a.name, a.content);
      if (name === 'generate_infographic') return makeInfographic(a.brief, a.style);
      if (name === 'save_view') return personaSaveView(a.name, a.content);
      if (name === 'record_feedback') return personaRecordFeedback(a.view, a.verdict, a.note);
      return null;
    },
    trace,
    getHistory: () => bus.__sgLlmChatHistory,
    onTurnSettled: () => scheduleVaultSave(),
    getRequest: () => aside.querySelector('sg-llm-request'),
    maxHops: MAX_HOPS,
  });

  bus.addEventListener(CHAT_MESSAGE, () => {
    document.getElementById('uc-body').classList.remove('uchat-fresh');
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
    scheduleVaultSave();
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

function newConversation() {
  const hist = bus.__sgLlmChatHistory;
  if (hist) hist.clear();
  state.hops = 0;
  state.traceLines = [];
  state.vault.sid = null;      /* the next save starts a new session folder */
  state.vault.meta = null;
  document.getElementById('uc-trace').textContent = '';
  document.getElementById('uc-body').classList.add('uchat-fresh');
  buildSystemPrompt();
}

function wireHeader() {
  /* one delegated handler, per the guidelines' handleEvent pattern */
  aside.querySelector('.uchat-head').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    switch (b.id) {
      case 'uc-settings': toggleDrawer('settings'); break;
      case 'uc-tools': toggleDrawer('tools'); break;
      case 'uc-vault': toggleDrawer('vault'); break;
      case 'uc-persona': toggleDrawer('persona'); break;
      case 'uc-help': toggleDrawer('help'); break;
      case 'uc-close': close(); break;
      case 'uc-new': newConversation(); break;
      default: break;                        /* uc-mic wires its own state */
    }
  });
  document.getElementById('uc-nokey-open').addEventListener('click', () => toggleDrawer('settings', true));
  document.getElementById('uc-usage-btn').addEventListener('click', () => {
    const box = document.getElementById('uc-usage');
    const btn = document.getElementById('uc-usage-btn');
    box.hidden = !box.hidden;
    btn.setAttribute('aria-pressed', String(!box.hidden));
    btn.innerHTML = box.hidden ? 'usage &#9662;' : 'usage &#9652;';
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
    try { grip.setPointerCapture(e.pointerId); } catch (err) { /* capture is a nicety */ }
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
  let data = null;
  try {
    const [doc, nodes, pairings] = await Promise.all([
      tool.get_doc(), tool.get_nodes(), tool.get_pairings()]);
    data = { doc, nodes, pairings };
  } catch (e) { /* groundingPrompt states the failure honestly */ }
  const prompt = groundingPrompt(data, state.persona.active);
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
