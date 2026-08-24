/* @module universe/core/segments
   Single responsibility: turn a set of byte-offset anchors into non-overlapping
   ELEMENTARY SEGMENTS. Overlapping and nested anchors are handled by splitting
   the byte space at every anchor boundary, so downstream markup can never nest.
   Pure: no DOM, no IO. */

/**
 * Split the byte space at every anchor boundary and keep the covered pieces.
 * @param {Array<{aid: string, chars: [number, number]}>} anchors
 * @returns {Array<{s: number, e: number, ids: string[]}>} segments in byte order;
 *   each carries every aid whose range covers it fully
 */
export function elementarySegments(anchors) {
  const bounds = new Set();
  anchors.forEach((a) => { bounds.add(a.chars[0]); bounds.add(a.chars[1]); });
  const bs = Array.from(bounds).sort((a, b) => a - b);
  const segs = [];
  for (let i = 0; i + 1 < bs.length; i++) {
    const s = bs[i];
    const e = bs[i + 1];
    const ids = anchors.filter((a) => a.chars[0] <= s && a.chars[1] >= e).map((a) => a.aid);
    if (ids.length) segs.push({ s, e, ids });
  }
  return segs;
}
