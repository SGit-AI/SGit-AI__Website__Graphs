/* @module wclm/senses
   Single responsibility: the pure word-sense and number logic (brief 34). A
   word's number (singular or plural) is read as evidence from the stem
   families the core graph already computed; a word's senses come from the
   authored senses register compiled into the world. Pure: no DOM, no state —
   used by the engine's senses block and tested under gate 27. */
'use strict';

/** Is b the plural surface of base a, by the generator's own stem rules? */
const pluralOf = (b, a) => b === a + 's' || b === a + 'es'
  || (a.endsWith('y') && b === a.slice(0, -1) + 'ies');

/**
 * The number evidence for a form, from the stem families: {num, base, family}
 * when the family holds the pair that proves it, null when it holds nothing.
 */
export function numberOf(form, stems) {
  for (const fam of Object.values(stems || {})) {
    if (!fam.includes(form)) continue;
    for (const other of fam) {
      if (other !== form && pluralOf(form, other)) return { num: 'plural', base: other, family: fam };
      if (other !== form && pluralOf(other, form)) return { num: 'singular', base: form, family: fam };
    }
  }
  return null;
}

/**
 * The sense entry for a form: the word it keys under (itself, or its singular
 * base through the stem family — "graphs" inherits the senses of "graph"),
 * the active sense (the document's own unless chosen otherwise), and the
 * options. Null when the register holds nothing for it.
 */
export function senseOf(form, world, chosen) {
  const reg = world.senses || {};
  const nm = numberOf(form, world.stems || {});
  const word = reg[form] ? form : nm && reg[nm.base] ? nm.base : null;
  if (!word) return null;
  const list = reg[word];
  const pick = chosen && chosen[word] && list.some((x) => x.key === chosen[word]) ? chosen[word] : 'doc';
  const rec = list.find((x) => x.key === pick) || list[0];
  return { word, active: rec.key, label: rec.label, domain: rec.domain, def: rec.def,
    options: list.map((x) => ({ key: x.key, label: x.label, domain: x.domain })) };
}

/**
 * The concepts of this world that lean on a word (directly or through its
 * stem family) — what stops applying when the word's sense is switched.
 */
export function leansOn(word, world) {
  const fam = new Set([word]);
  Object.values(world.stems || {}).forEach((f) => { if (f.includes(word)) f.forEach((x) => fam.add(x)); });
  return (world.concepts || []).filter((c) => (c.forms || []).some((f) => fam.has(f)));
}
