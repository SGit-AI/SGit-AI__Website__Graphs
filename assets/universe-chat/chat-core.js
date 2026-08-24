/* @module universe-chat/chat-core
   Single responsibility: the chat's pure rules, with no DOM, network or clock —
   the grounding-prompt composition (the single highest-leverage string in the
   panel), the empty-bubble sweep predicate, and the tool-result truncation.
   Extracted per the reader agent's brief (v0.4.21 §1) so gate 27 fails loudly
   if an edit quietly drops the claims section. */
'use strict';

/** How much of a tool result the model is allowed to carry back. */
export const TOOL_RESULT_CAP = 24000;

/**
 * Compose the grounding prompt from fetched data plus the active persona.
 * @param {{doc, nodes, pairings}|null} data - null means the page API failed
 * @param {{name: string, prompt: string}|null} persona
 * @returns {string}
 */
export function groundingPrompt(data, persona) {
  let prompt;
  if (!data) {
    prompt = 'You are the chat panel on a universe document page of graphs.sgit.ai. The page API is unavailable, so answer only from what the user pastes, and say the grounding failed to load.';
  } else {
    const { doc, nodes, pairings } = data;
    const concepts = nodes.filter((n) => n.family === 'concept');
    const claims = nodes.filter((n) => n.family === 'claim');
    const rest = nodes.filter((n) => n.family !== 'concept' && n.family !== 'claim');
    prompt = [
      'You are the chat panel on a page of graphs.sgit.ai: the layer 1 local graph of one frozen source document, "' + doc.title + '".',
      'Every item on the page is a record that THIS DOCUMENT SAYS something, at a verified anchor — whether it is true is deliberately not judged at this layer. Answer from the extraction and the source, cite item ids in backticks (e.g. `meaning-through-connectivity`), and when a claim is involved say how the document supports it (demonstrated, argued or declared). If the extraction does not carry an answer, say so rather than inventing one.',
      'You have tools. Reading tools fetch the data; view tools drive the page — when the user asks to see, show, select, filter or lay out something, actually do it with the view tools rather than describing what they could click. After driving the view, say briefly what is now on screen. When the user points with "this", "here" or "that one", get_recent_activity tells you what they last clicked. After reshaping the layout, graph_snapshot shows you the result — check it before describing it.',
      'The dictionary (id: label — statement; * = used but never defined):',
      concepts.map((c) => '  ' + (c.defined ? '' : '*') + c.id + ': ' + c.label + ' — ' + c.statement).join('\n'),
      'The claims (id [support]: statement):',
      claims.map((c) => '  ' + c.id + ' [' + c.support + ']: ' + c.statement).join('\n'),
      'Hypotheses, objectives and worked examples:',
      rest.map((n) => '  ' + n.id + ' [' + n.family + ']: ' + n.statement).join('\n'),
      'Also-called: ' + pairings.also_called.map((x) => x.a + ' ↔ ' + x.b).join('; '),
      'Near-but-not: ' + pairings.near_but_not.map((x) => x.this + ' is NOT ' + x.not).join('; '),
    ].join('\n\n');
  }
  if (persona) {
    prompt += '\n\nTHE READER PERSONA — "' + persona.name + '". ' + persona.prompt
      + '\nEverything you write speaks to this persona. When you produce a rewritten, summarised, translated or projected version of the document for them, save it with save_view (a view is a first-class artefact, not chat text). When the user reacts to a saved view — it landed, it is wrong, it is unclear — record that with record_feedback against the view, quoting their reasoning: the feedback ledger is what the next generation of the view is built from.';
  }
  return prompt;
}

/**
 * The transcript sweep: drop assistant turns that carry neither text nor
 * images (the empty bubbles a pure tool-call round leaves behind).
 * @param {Array} turns
 * @returns {Array} the kept turns (the same array when nothing was dropped)
 */
export function sweepTurns(turns) {
  const kept = turns.filter((t) => !(t.role === 'assistant'
    && !(typeof t.content === 'string' ? t.content.trim() : t.content)
    && !(t.images && t.images.length)));
  return kept.length === turns.length ? turns : kept;
}

/**
 * Serialize a tool result for the model, bounded.
 * @param {*} out
 * @param {number} [cap]
 * @returns {string}
 */
export function truncateToolResult(out, cap = TOOL_RESULT_CAP) {
  let body = JSON.stringify(out === undefined ? null : out);
  if (body.length > cap) body = body.slice(0, cap) + '…(truncated)';
  return body;
}
