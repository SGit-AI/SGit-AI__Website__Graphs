/* @module universe-chat/tool-loop
   Single responsibility: the agentic engine on the [data-llm-bus] — augment
   every llm:send with the enabled tools, execute the model's tool calls
   (page API via window.__tool, chat-local tools via the caller's router),
   attach graph snapshots as user-turn images (providers accept image parts
   on user turns only), re-send the continuation, cap the rounds, and sweep
   the empty assistant bubbles a pure tool round leaves behind.
   Extracted from chat.js per the reader agent's brief (v0.4.21 §1); the pure
   rules it applies live in chat-core.js under gate 27. */
'use strict';
import { sweepTurns, truncateToolResult } from './chat-core.js';

/**
 * Wire the loop onto the bus. Call BEFORE the request engine joins the bus:
 * same-target listeners run in registration order, which is what lets the
 * augmenter add tools before sg-llm-request reads the event.
 *
 * @param {object} ctx
 * @param {Element} ctx.bus - the [data-llm-bus] element
 * @param {object} ctx.events - the SGL_LLM constants
 * @param {string} ctx.chatEvent - the llm:chat-message event name
 * @param {{schemas: Array, hops: number}} ctx.state - shared chat state
 * @param {() => object|null} ctx.getTool - the page's window.__tool
 * @param {() => Array} ctx.extraTools - chat-local tool schemas to offer now
 * @param {(name: string, args: object) => Promise<*>|null} ctx.runLocal -
 *        executes a chat-local tool, or returns null when the name is not local
 * @param {(cls: string, text: string) => void} ctx.trace
 * @param {() => object|null} ctx.getHistory - the sg-llm-chat-history instance
 * @param {() => void} ctx.onTurnSettled - called when a turn lands (autosave)
 * @param {() => {busy: boolean}} ctx.getRequest - the sg-llm-request element
 * @param {number} ctx.maxHops
 */
export function wireToolLoop(ctx) {
  const { bus, events, chatEvent, state, getTool, extraTools, runLocal,
    trace, getHistory, onTurnSettled, getRequest, maxHops } = ctx;

  bus.addEventListener(events.SEND, (e) => {
    if (state.schemas.length && !e.detail.tools) {
      e.detail.tools = state.schemas;
      e.detail.tool_choice = 'auto';
    }
    const extra = extraTools();
    if (extra.length) {
      e.detail.tools = (e.detail.tools || []).concat(extra);
      e.detail.tool_choice = e.detail.tool_choice || 'auto';
    }
  });

  bus.addEventListener(chatEvent, () => { state.hops = 0; });

  bus.addEventListener(events.TOOL_CALLS, async (e) => {
    const { toolCalls, messages } = e.detail;
    state.hops += 1;
    if (state.hops > maxHops) {
      trace('err', '⏹ stopped after ' + maxHops + ' tool rounds in one turn');
      return;
    }
    const results = [];
    const snapshots = [];
    for (const c of toolCalls) {
      const name = c.function && c.function.name;
      const argText = (c.function && c.function.arguments) || '{}';
      trace('', '→ ' + name + ' ' + (argText.length > 120 ? argText.slice(0, 120) + '…' : argText));
      try {
        const args = JSON.parse(argText);
        const local = runLocal(name, args);
        let out;
        if (local) out = await local;
        else {
          const tool = getTool();
          if (!tool || typeof tool[name] !== 'function') throw new Error('unknown tool: ' + name);
          out = await tool[name](args);
        }
        /* a snapshot cannot ride in a tool message: providers only accept
           image parts on user turns, so it is attached after the results */
        if (name === 'graph_snapshot' && out && out.data_url) {
          snapshots.push(out.data_url);
          out = { attached_as_image: true, full: !!out.full };
        }
        results.push({ role: 'tool', tool_call_id: c.id, content: truncateToolResult(out) });
        trace('ok', '✓ ' + name);
      } catch (err) {
        results.push({ role: 'tool', tool_call_id: c.id,
          content: JSON.stringify({ error: err.message }) });
        trace('err', '✗ ' + name + ' — ' + err.message);
      }
    }
    const cont = [...messages,
      { role: 'assistant', content: null, tool_calls: toolCalls }, ...results];
    if (snapshots.length) {
      cont.push({ role: 'user', content: [
        { type: 'text', text: '[the graph snapshot' + (snapshots.length > 1 ? 's' : '') + ' you requested]' },
        ...snapshots.map((u) => ({ type: 'image_url', image_url: { url: u } })),
      ] });
    }
    /* the engine clears its busy flag in the same tick this handler first
       yields in; wait it out rather than racing it (an upstream note asks
       the Tools estate for a promise instead of this poll) */
    const req = getRequest();
    for (let i = 0; i < 100 && req.busy; i++) await new Promise((r) => setTimeout(r, 50));
    bus.dispatchEvent(new CustomEvent(events.SEND, {
      detail: { messages: cont, mode: 'build', tools: state.schemas, tool_choice: 'auto' },
    }));
  });

  bus.addEventListener(events.REQUEST_COMPLETE, (e) => {
    if (e.detail.toolCalls && e.detail.toolCalls.length) return;
    const hist = getHistory();
    if (hist) {
      const st = hist.getState();
      const kept = sweepTurns(st.turns);
      if (kept !== st.turns) hist.setState({ ...st, turns: kept });
    }
    onTurnSettled();
  });
}
