/* graphs.sgit.ai — the universe reader.
   One script owns the whole interaction layer of a per-document universe page:
   the resizable right panel (local graph on top, rendered source below), the
   anchor highlights inside the source, and the three-way jumps between the
   extraction tables, the graph and the frozen document.

   The one rule that matters: highlights are driven by the SAME byte offsets that
   gate 23 verifies on every build. The raw bytes are fetched, sliced at the
   recorded offsets, and marker tokens are spliced in BEFORE markdown rendering,
   so a highlight can only ever sit on the exact bytes the extraction cited.
   Nothing here re-searches the text. If the source cannot be fetched, the page
   degrades to what it was before this script existed. */
(function () {
  'use strict';
  var U = window.UNIVERSE;
  if (!U || !window.cytoscape) return;

  var WIDE = matchMedia('(min-width: 1100px)');
  var LS = 'uni:' + U.slug + ':';
  function pref(k, d) { try { var v = localStorage.getItem(LS + k); return v === null ? d : v === '1'; } catch (e) { return d; } }
  function setPref(k, v) { try { localStorage.setItem(LS + k, v ? '1' : '0'); } catch (e) {} }

  /* ---------------- layout: wrap the existing page in a two-pane flex ------- */
  var main = document.querySelector('main.doc');
  var layout = document.createElement('div');
  layout.className = 'uni-layout';
  var left = document.createElement('div');
  left.className = 'uni-left';
  while (main.firstChild) left.appendChild(main.firstChild);
  layout.appendChild(left);

  var vsplit = document.createElement('div');
  vsplit.className = 'uni-vsplit';
  vsplit.title = 'Drag to resize';
  layout.appendChild(vsplit);

  var panel = document.createElement('aside');
  panel.className = 'uni-panel';
  panel.innerHTML =
    '<div class="uni-graphbox"><div class="uni-cy" id="uni-cy"></div></div>' +
    '<div class="uni-hsplit" title="Drag to resize"></div>' +
    '<div class="uni-srcbox">' +
    '  <div class="uni-srchead"><b>The frozen source</b>' +
    '    <span class="dim">every highlight sits on gate-verified bytes</span>' +
    '    <a class="dim" href="' + U.source + '" style="margin-left:auto">raw</a></div>' +
    '  <div class="uni-srcbody mdread" id="uni-src"><p class="dim">Loading the frozen source…</p></div>' +
    '</div>';
  layout.appendChild(panel);
  main.appendChild(layout);

  /* toolbar, placed after the docmeta block */
  var tools = document.createElement('div');
  tools.className = 'uni-tools';
  tools.innerHTML =
    '<button id="uni-tglpanel" class="uni-wide-only" aria-pressed="false">◫ side panel: graph &amp; source</button>' +
    '<button id="uni-tglall" aria-pressed="false">§ show every anchor in the source</button>' +
    '<span class="dim" id="uni-status"></span>';
  var meta = left.querySelector('.docmeta');
  (meta || left.firstChild).insertAdjacentElement('afterend', tools);

  var cy = null;
  var inlineBox = null;
  var panelOn = pref('panel', true);
  var showAll = pref('all', false);
  function applyState() {
    document.body.classList.toggle('uni-panel-on', panelOn && WIDE.matches);
    document.body.classList.toggle('uni-showall', showAll);
    document.getElementById('uni-tglpanel').setAttribute('aria-pressed', String(panelOn));
    document.getElementById('uni-tglall').setAttribute('aria-pressed', String(showAll));
    /* the graph follows the visible home: the panel when it shows, inline otherwise */
    inlineBox = inlineBox || document.getElementById('unigraph-inline');
    if (cy) {
      var target = (panelOn && WIDE.matches) ? document.getElementById('uni-cy') : inlineBox;
      if (target && cy.container() !== target) cy.mount(target);
      requestAnimationFrame(function () { cy.resize(); cy.fit(undefined, 24); });
    }
  }
  document.getElementById('uni-tglpanel').addEventListener('click', function () {
    panelOn = !panelOn; setPref('panel', panelOn); applyState();
  });
  document.getElementById('uni-tglall').addEventListener('click', function () {
    showAll = !showAll; setPref('all', showAll); applyState();
  });

  /* ---------------- resizers ------------------------------------------------ */
  function dragger(el, apply) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); el.classList.add('drag'); el.setPointerCapture(e.pointerId);
      function move(ev) { apply(ev); if (cy) cy.resize(); }
      function up() {
        el.classList.remove('drag');
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
      }
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    });
  }
  dragger(vsplit, function (ev) {
    var r = layout.getBoundingClientRect();
    var frac = Math.min(.64, Math.max(.25, (r.right - ev.clientX) / r.width));
    panel.style.flexBasis = (frac * 100) + '%';
  });
  var graphbox = panel.querySelector('.uni-graphbox');
  dragger(panel.querySelector('.uni-hsplit'), function (ev) {
    var r = panel.getBoundingClientRect();
    var frac = Math.min(.8, Math.max(.12, (ev.clientY - r.top) / r.height));
    graphbox.style.flexBasis = (frac * 100) + '%';
  });

  /* ---------------- the graph, living in the panel -------------------------- */
  cy = cytoscape({
    container: document.getElementById('uni-cy'),
    elements: U.elements,
    layout: { name: 'cose', animate: false, nodeRepulsion: 90000, idealEdgeLength: 90, padding: 24 },
    style: [
      { selector: 'node', style: { 'label': 'data(label)', 'font-size': 9, 'width': 14, 'height': 14,
        'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'bottom', 'text-margin-y': 4,
        'background-color': '#8a8f98', 'color': '#666' } },
      { selector: 'node[family = "concept"]', style: { 'background-color': '#3f6ad8', 'width': 22, 'height': 22, 'font-weight': 'bold', 'color': '#333' } },
      { selector: 'node[family = "claim"]', style: { 'background-color': '#2f9e63' } },
      { selector: 'node[family = "hypothesis"]', style: { 'background-color': '#c58f00' } },
      { selector: 'node[family = "objective"]', style: { 'background-color': '#9b59b6' } },
      { selector: 'node[family = "example"]', style: { 'background-color': '#d0654e', 'shape': 'round-rectangle' } },
      { selector: 'edge', style: { 'width': 1, 'line-color': '#c9ccd2', 'curve-style': 'bezier',
        'target-arrow-shape': 'triangle', 'arrow-scale': .7, 'target-arrow-color': '#c9ccd2' } },
      { selector: 'edge[kind = "asserted"]', style: { 'width': 2, 'line-color': '#3f6ad8', 'target-arrow-color': '#3f6ad8',
        'label': 'data(verb)', 'font-size': 8, 'color': '#3f6ad8', 'text-background-color': '#fff',
        'text-background-opacity': .85, 'text-background-padding': 2 } },
      { selector: 'edge[kind = "demonstrates"]', style: { 'line-style': 'dashed' } }
    ]
  });

  /* ---------------- jump helpers ------------------------------------------- */
  function flashRow(rowId) {
    var el = document.getElementById(rowId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('uni-hit'); void el.offsetWidth; el.classList.add('uni-hit');
  }
  var srcBody = document.getElementById('uni-src');
  function flashSource(aid) {
    if (!panelOn) { panelOn = true; setPref('panel', panelOn); applyState(); }
    var marks = srcBody.querySelectorAll('mark.uni-anchor[data-aids~="' + aid + '"]');
    if (!marks.length) return;
    marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    marks.forEach(function (m) { m.classList.remove('uni-hit'); void m.offsetWidth; m.classList.add('uni-hit'); });
  }

  cy.on('tap', 'node', function (evt) {
    var id = evt.target.id();
    flashRow('n-' + id);       /* the extraction row on the left */
    flashSource(id);           /* and the cited bytes in the source */
  });

  left.addEventListener('click', function (e) {
    var go = e.target.closest('.anchgo');
    if (go) flashSource(go.getAttribute('data-aid'));
  });

  /* ---------------- the source pane: verified bytes to highlights ----------- */
  var S = '⟦', E = '⟧';   /* marker brackets: absent from the corpus, survive markdown */

  fetch(U.source).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.arrayBuffer();
  }).then(function (buf) {
    var raw = new Uint8Array(buf);
    var dec = new TextDecoder();

    /* elementary segments: split the byte space at every anchor boundary, so
       overlapping and nested anchors never produce nested markers */
    var bounds = [];
    U.anchors.forEach(function (a) { bounds.push(a.chars[0], a.chars[1]); });
    bounds = Array.from(new Set(bounds)).sort(function (a, b) { return a - b; });
    var segs = [];
    for (var i = 0; i + 1 < bounds.length; i++) {
      var s = bounds[i], e = bounds[i + 1];
      var ids = U.anchors.filter(function (a) { return a.chars[0] <= s && a.chars[1] >= e; })
                         .map(function (a) { return a.aid; });
      if (ids.length) segs.push({ s: s, e: e, ids: ids });
    }

    var md = '', prev = 0;
    segs.forEach(function (g, i) {
      md += dec.decode(raw.subarray(prev, g.s)) + S + 'S' + i + E +
            dec.decode(raw.subarray(g.s, g.e)) + S + 'E' + i + E;
      prev = g.e;
    });
    md += dec.decode(raw.subarray(prev));

    /* render, then convert tokens to <mark> in one linear pass over the HTML
       string. A mark is closed before any tag and reopened after it, so marks
       never cross element boundaries and the markup can never mis-nest. */
    var html = marked.parse(md);
    var out = [];
    var openSeg = null;
    var tokenOrTag = /(<[^>]*>)|⟦([SE])(\d+)⟧/g;
    var pos = 0, m;
    function openTagFor(idx) {
      var ids = segs[idx].ids;
      var label = ids.map(function (id) {
        var a = U.anchors.find(function (x) { return x.aid === id; });
        return a ? a.label : id;
      }).join(' · ').replace(/"/g, '&quot;');
      return '<mark class="uni-anchor" data-aids="' + ids.join(' ') + '" title="' + label + '">';
    }
    while ((m = tokenOrTag.exec(html)) !== null) {
      out.push(html.slice(pos, m.index));
      pos = m.index + m[0].length;
      if (m[1] !== undefined) {                 /* an HTML tag */
        if (openSeg !== null) out.push('</mark>', m[1], openTagFor(openSeg));
        else out.push(m[1]);
      } else if (m[2] === 'S') {                /* segment opens */
        openSeg = +m[3];
        out.push(openTagFor(openSeg));
      } else {                                  /* segment closes */
        out.push('</mark>');
        openSeg = null;
      }
    }
    out.push(html.slice(pos));
    /* drop empty marks produced by the close-before-tag rule */
    srcBody.innerHTML = out.join('').replace(/<mark[^>]*><\/mark>/g, '');

    var made = srcBody.querySelectorAll('mark.uni-anchor').length;
    document.getElementById('uni-status').textContent =
      U.anchors.length + ' anchors · ' + segs.length + ' verified spans in the source' +
      (made ? '' : ' · rendering failed, open the raw file');

    /* clicking a highlight jumps the extraction to its row */
    srcBody.addEventListener('click', function (e) {
      var mk = e.target.closest('mark.uni-anchor');
      if (!mk) return;
      var aid = mk.getAttribute('data-aids').split(' ')[0];
      var a = U.anchors.find(function (x) { return x.aid === aid; });
      if (a) flashRow(a.row);
    });

    /* arriving with #n-<id> in the URL lights both sides */
    if (location.hash && location.hash.indexOf('#n-') === 0) {
      var id = location.hash.slice(3);
      if (U.anchors.some(function (a) { return a.aid === id; })) flashSource(id);
    }
  }).catch(function () {
    srcBody.innerHTML = '<p class="dim">Could not load the frozen source in-page — ' +
      '<a href="' + U.source + '">open the raw markdown</a> instead.</p>';
  });

  WIDE.addEventListener('change', applyState);
  applyState();
})();
