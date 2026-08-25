/* @module universe-chat/chat-markup
   Single responsibility: the panel's markup, as a part of chat.js — the same
   move as the reader's graph-strip.js: markup owned by a part, behaviour owned
   by the module. Presentation classes live in chat.css; no inline styles. */
'use strict';

/**
 * The panel's inner markup.
 * @param {string} defaultModel - shown in the settings drawer copy
 * @returns {string}
 */
export function panelMarkup(defaultModel) {
  return '<div class="uchat-resize" title="Drag to resize"></div>' +
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
    '  <button class="uchat-hbtn uchat-close" id="uc-close" title="Close the chat panel (Esc) — the 💬 button brings it back">&#10005; close</button>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-settings" hidden>' +
    '  <h5>Model &middot; the OpenRouter workflow</h5>' +
    '  <p>Your key is pasted here once and kept in this browser&rsquo;s localStorage only &mdash; it is never sent to any sgraph.ai or sgit.ai host. Requests go from your browser straight to the provider. Default model: <code>' + defaultModel + '</code>.</p>' +
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
    '  <input type="password" id="uc-vkey" class="uchat-in" placeholder="vault key:  passphrase:vaultId  or  word-word-0000" autocomplete="off" spellcheck="false">' +
    '  <input type="password" id="uc-vtoken" class="uchat-in" placeholder="server access key (if the server requires one)" autocomplete="off" spellcheck="false">' +
    '  <input type="text" id="uc-vendpoint" class="uchat-in" placeholder="endpoint (default https://send.sgraph.ai)" autocomplete="off" spellcheck="false">' +
    '  <p class="uchat-row">' +
    '    <button class="uchat-hbtn" id="uc-vconnect">connect</button>' +
    '    <button class="uchat-hbtn" id="uc-vsave" hidden>save now</button>' +
    '    <button class="uchat-hbtn" id="uc-vforget" hidden>forget key</button>' +
    '    <span class="small uchat-msg" id="uc-vmsg"></span></p>' +
    '  <label><input type="checkbox" id="uc-vasave" checked> autosave after every reply <span class="lvl-note">&mdash; one commit per changed file, pushed immediately</span></label>' +
    '  <div id="uc-vsessions"></div>' +
    '</div>' +
    '<div class="uchat-drawer" id="uc-drawer-persona" hidden>' +
    '  <h5>The persona &middot; one document, many readers</h5>' +
    '  <p>A persona is an angle applied to every answer &mdash; a role, a language, a level. With a vault connected, personas live in it at <code>/personas/</code>, where you or any agent holding the key can tune them or add new ones; the views the model saves for a persona, and your feedback on them, land beside it. That ledger is the seed of the personalised document.</p>' +
    '  <div id="uc-plist"></div>' +
    '  <h5 class="uchat-h5gap">New or edited persona</h5>' +
    '  <input type="text" id="uc-pname" class="uchat-in uchat-in-ui" placeholder="name, e.g. the CFO">' +
    '  <textarea id="uc-pprompt" class="uchat-in uchat-in-ui uchat-ta" rows="3" placeholder="the angle: who is reading, what they need, how to speak to them"></textarea>' +
    '  <p><button class="uchat-hbtn" id="uc-puse">use now</button> <button class="uchat-hbtn" id="uc-psave">save to vault &amp; use</button> <span class="small uchat-msg" id="uc-pmsg"></span></p>' +
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
    '<div class="uchat-usage" id="uc-usage" hidden><sg-llm-stats></sg-llm-stats></div>' +
    '<div class="uchat-foot">' +
    '  <span class="model" id="uc-model">&mdash;</span>' +
    '  <span class="model" id="uc-pfoot"></span>' +
    '  <span id="uc-vstat"></span><span class="sp"></span>' +
    '  <button class="uchat-hbtn" id="uc-usage-btn" title="Tokens, cost and streaming details" aria-pressed="false">usage &#9662;</button>' +
    '</div>';
}
