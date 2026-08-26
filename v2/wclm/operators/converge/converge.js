/* @module wclm/operators/converge
   The converge operator (T9, core): evidence is summed — total = 2·bind +
   0.1·blast, both multipliers opinion, both inputs evidence — and the
   meaning comes out with its provenance, its blast radius, its ANCHORING
   (a quoted fact, a stated claim, or an authored input; brief 35) and its
   contradictions: a negated word this universe asserts, or a sense switch
   that takes claims with it, is said out loud, never silently resolved. Pure. */
'use strict';
import { r3 } from '../../../../assets/wclm/engine.js';
import { leansOn } from '../../../../assets/wclm/senses.js';

export const block = {
  key: 'converge', name: 'T9 converge', core: true,
  io: { reads: ['bindings'], writes: ['meanings'] },
  role: 'evidence is summed; the meaning, its provenance, its blast radius and its contradictions come out',
  run(s, world) {
    const base = s.assembled || s.bindings.map((b) => ({ ...b, neighbours: [], degree: 0 }));
    const byId = {};
    (world.concepts || []).forEach((c) => { byId[c.id] = c; });
    ((world.pack || {}).terms || []).forEach((p) => { byId[p.id] = p; });
    s.ranked = base.map((b) => {
      const rec = byId[b.id] || {};
      /* the anchoring declaration (brief 35): fact, claim, or authored input */
      const anchor = rec.quote ? 'fact-anchored: a quote in §' + rec.section
        : rec.statement ? 'a stated claim: asserted in the document, not quoted'
        : b.kind === 'pack' ? 'an authored term: proposed in a meaning pack'
        : b.kind === 'sense' ? 'a chosen sense: from the senses register'
        : 'unanchored: nothing in this universe vouches for it';
      return { ...b, blast: b.degree, anchor,
        total: r3(2 * b.score + 0.1 * b.degree),   /* 2 and 0.1 are opinion */
        def: rec.statement || rec.def || b.def || null,
        section: rec.section || null, quote: rec.quote || null };
    }).sort((x, y) => y.total - x.total || (x.id < y.id ? -1 : 1));
    s.meaning = s.ranked[0] || null;
    /* a negated word that belongs to the world's own labels is a contradiction,
       surfaced and never silently resolved (brief 33) */
    s.notes = (s.negated || []).flatMap((f) =>
      (world.concepts || []).filter((c) => (c.forms || []).includes(f) && c.statement)
        .slice(0, 1).map((c) => 'the prompt negates "' + f + '", but this universe holds "'
          + c.label + '": ' + c.statement + ' — the query contradicts the world.'));
    /* a sense-switched word takes this universe's claims with it (brief 34):
       say which no longer apply, computed from the concept labels */
    (s.foreign || []).forEach((f) => {
      const hit = leansOn(f.word, world).map((c) => '"' + c.label + '"');
      s.notes.push('you read "' + f.word + '" as ' + f.label + ' (' + f.domain
        + '); this universe speaks its own sense, so its claims that lean on the word'
        + (hit.length ? ' — ' + hit.slice(0, 3).join(', ')
          + (hit.length > 3 ? ' and ' + (hit.length - 3) + ' more' : '') + ' —' : '')
        + ' do not apply under yours.');
    });
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'meaning without connectivity', 'graphs of graphs'],
  watch: ['ranked', 'meaning', 'notes'],
};
