/* @module wclm/operators/expand
   The expand operator (T8, optional): each bound meaning assembles its
   neighbourhood — the world model, gathered per meaning. Document edges and
   pack edges both count; the degree becomes the blast radius downstream. Pure. */
'use strict';

export const block = {
  key: 'expand', name: 'T8 expand', core: false,
  io: { reads: ['bindings'], writes: ['bindings'] },
  role: 'each bound meaning assembles its neighbourhood: the world model, gathered per meaning',
  run(s, world) {
    const packTerms = (world.pack || {}).terms || [];
    const label = (id) => (world.concepts.find((c) => c.id === id)
      || packTerms.find((p) => p.id === id) || { label: id }).label;
    s.assembled = s.bindings.map((b) => {
      const n = [];
      (world.edges || []).forEach((e) => {
        if (e.from === b.id) n.push({ id: e.to, label: label(e.to), verb: e.verb, dir: 'out', src: 'doc' });
        else if (e.to === b.id) n.push({ id: e.from, label: label(e.from), verb: e.verb, dir: 'in', src: 'doc' });
      });
      packTerms.filter((p) => p.id === b.id).forEach((p) =>
        (p.edges || []).forEach(([rel, to]) => n.push({ id: to, label: label(to), verb: rel, dir: 'out', src: 'pack' })));
      return { ...b, neighbours: n.slice(0, 6), degree: n.length };
    });
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'anchor nodes and reference graphs', 'connectivity'],
  watch: ['assembled'],
};
