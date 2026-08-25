/* @module universe/core/slots
   Single responsibility: the four border areas and their slots, per brief 26.
   The canvas edge is divided into four rectangles (top, right, bottom, left),
   each with a fixed number of aligned slots; the pinned peaks live in slots,
   and the placement is data an interface can edit and a layout can apply.
   Pure: no DOM, no cytoscape. */

/** The four areas, in the order the board draws them. */
export const AREAS = ['top', 'right', 'bottom', 'left'];

/** Slots per area; few on purpose — a crowded border is not a set of peaks. */
export const SLOT_COUNT = 6;

/**
 * A default placement: the doc root and family peaks fill the left slots,
 * the derived-group summits fill the right, top to bottom, in given order.
 * @param {string[]} leftIds @param {string[]} rightIds
 * @returns {Object<string, {area: string, slot: number}>}
 */
export function defaultAssignments(leftIds, rightIds) {
  const a = {};
  (leftIds || []).slice(0, SLOT_COUNT).forEach((id, i) => { a[id] = { area: 'left', slot: i }; });
  (rightIds || []).slice(0, SLOT_COUNT).forEach((id, i) => { a[id] = { area: 'right', slot: i }; });
  return a;
}

/**
 * Canvas positions for slotted pins: each area is a border band, its slots
 * spread evenly along it, so pinned peaks sit aligned, never scattered.
 * The field between the bands scales with how many free nodes must settle.
 * @param {Object<string, {area, slot}>} assignments
 * @param {number} freeCount - unpinned nodes between the bands
 * @returns {Object<string, {x: number, y: number}>} position per id
 */
export function slotPositions(assignments, freeCount) {
  const w = Math.max(700, freeCount * 26);
  const h = Math.max(480, freeCount * 14);
  const along = (slot, size) => ((slot + 1) * size) / (SLOT_COUNT + 1);
  const pos = {};
  Object.keys(assignments).forEach((id) => {
    const { area, slot } = assignments[id];
    if (area === 'top') pos[id] = { x: along(slot, w), y: 0 };
    else if (area === 'bottom') pos[id] = { x: along(slot, w), y: h };
    else if (area === 'left') pos[id] = { x: 0, y: along(slot, h) };
    else pos[id] = { x: w, y: along(slot, h) };
  });
  return pos;
}

/**
 * The first free slot in an area, or -1 when the area is full.
 * @param {Object<string, {area, slot}>} assignments @param {string} area
 * @returns {number}
 */
export function freeSlot(assignments, area) {
  const used = new Set(Object.keys(assignments)
    .filter((id) => assignments[id].area === area).map((id) => assignments[id].slot));
  for (let s = 0; s < SLOT_COUNT; s++) if (!used.has(s)) return s;
  return -1;
}
