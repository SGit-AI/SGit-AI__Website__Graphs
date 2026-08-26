/* @module wclm/operators/translate
   The translate operator (optional): analogies and equivalencies (brief 35).
   To explain this material to somebody from another world, do not repeat the
   words — restate the answer in THEIR concept, from the authored analogies
   register, with the why carried. A gap in the register is said, not hidden:
   it is a correction opportunity. Pure. */
'use strict';

export const block = {
  key: 'translate', name: 'translate', core: false,
  io: { reads: ['meanings'], writes: ['meanings'] },
  role: 'analogies for an audience: the answer restated in the listener’s own concept, with the why carried',
  run(s, world) {
    const key = (s.opts || {}).audience;
    const aud = (world.analogies || {})[key];
    if (!aud) { s.translated = null; return; }
    s.translated = { audience: key, label: aud.label,
      items: (s.ranked || []).slice(0, 3).map((m) => {
        const hit = (aud.maps || []).find((x) => x.for === m.id);
        return { id: m.id, from: m.label, say: hit ? hit.say : null, why: hit ? hit.why : null };
      }) };
  },
};

export const ui = {
  prompts: ['graphs of graphs', 'meaning through connectivity', 'anchor nodes'],
  presets: [{ label: 'for finance', opts: { audience: 'finance' } },
    { label: 'for operations', opts: { audience: 'operations' } },
    { label: 'for medicine', opts: { audience: 'medicine' } }],
  watch: ['translated'],
};
