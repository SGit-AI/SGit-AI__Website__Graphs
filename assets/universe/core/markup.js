/* @module universe/core/markup
   Single responsibility: the two pure halves of the verified-highlight pipeline.
   1) spliceMarkers: raw source bytes + elementary segments -> a markdown string
      with unicode marker tokens around the exact cited bytes.
   2) tokensToMarks: rendered HTML string -> HTML with <mark> spans. A mark is
      closed before any tag and reopened after it, so marks never cross element
      boundaries and the markup can never mis-nest.
   Nothing here re-searches text: offsets come from the gate-verified anchors.
   Pure: no DOM, no IO. */

const S = '⟦';
const E = '⟧';

/** Escape text for use inside an HTML attribute or text node. */
export function escAttr(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Splice marker tokens into the raw bytes around each segment.
 * Anchor boundaries always sit on UTF-8 character boundaries (they were found
 * by locating encoded quotes), so decoding each slice independently is safe.
 * @param {Uint8Array} raw - the frozen source bytes
 * @param {Array<{s: number, e: number}>} segs - elementary segments, in order
 * @param {{decode: function(Uint8Array): string}} decoder - a TextDecoder
 * @returns {string} the markdown with ⟦S<i>⟧ … ⟦E<i>⟧ tokens spliced in
 */
export function spliceMarkers(raw, segs, decoder) {
  let out = '';
  let prev = 0;
  segs.forEach((g, i) => {
    out += decoder.decode(raw.subarray(prev, g.s)) + S + 'S' + i + E +
           decoder.decode(raw.subarray(g.s, g.e)) + S + 'E' + i + E;
    prev = g.e;
  });
  return out + decoder.decode(raw.subarray(prev));
}

/**
 * Convert marker tokens in rendered HTML into <mark> spans in one linear pass.
 * @param {string} html - marked's output, tokens intact
 * @param {Array<{ids: string[]}>} segs - the same segments, for ids per token
 * @param {function(string): string} kindOf - aid -> kind, for the colour class
 * @param {function(string): string} labelOf - aid -> human label, for the title
 * @returns {string} HTML with every token replaced and no empty marks
 */
export function tokensToMarks(html, segs, kindOf, labelOf) {
  const out = [];
  let openSeg = null;
  const tokenOrTag = /(<[^>]*>)|⟦([SE])(\d+)⟧/g;
  let pos = 0;
  let m;
  const openTagFor = (idx) => {
    const ids = segs[idx].ids;
    /* when links overlap, the last-added one wins the colour, the chip and the
       click; the title still names every link on the span */
    const kind = kindOf(ids[ids.length - 1]) || 'edge';
    const label = escAttr(ids.map((id) => labelOf(id) || id).join(' · '));
    const more = ids.length > 1 ? ' data-more=" +' + (ids.length - 1) + '"' : '';
    return '<mark class="uni-anchor uni-k-' + kind + '" data-kind="' + kind + '"' + more +
           ' data-aids="' + ids.join(' ') + '" title="' + label + '">';
  };
  while ((m = tokenOrTag.exec(html)) !== null) {
    out.push(html.slice(pos, m.index));
    pos = m.index + m[0].length;
    if (m[1] !== undefined) {
      if (openSeg !== null) out.push('</mark>', m[1], openTagFor(openSeg));
      else out.push(m[1]);
    } else if (m[2] === 'S') {
      openSeg = Number(m[3]);
      out.push(openTagFor(openSeg));
    } else {
      out.push('</mark>');
      openSeg = null;
    }
  }
  out.push(html.slice(pos));
  return out.join('').replace(/<mark[^>]*><\/mark>/g, '');
}
