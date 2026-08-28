/* @module altitudes-graph
   Single responsibility: the altitude ladder's graph instrument — build the
   element set from the generated altitude data, lay it out, and handle
   selection, focus and the descent animation between altitudes. The largest
   hand-written module in the estate, and the clearest split candidate on shape
   (graph build / layout / interaction).
   NOT SPLIT, on purpose. Its only consumer page is in the frozen first edition
   (v1/altitudes/graph.html), so no second <script src> tag can be added; splitting
   would mean dynamic import() and an async start on a page that is evidence, for no
   benefit to anything anyone still edits. Measured and recorded in the v0.5.17 pass, pass three. */
/* The ladder, the concepts and the findings as one explorable graph.

   Cytoscape.js, vendored. Four ideas drive the controls:
     1. Start anywhere. Any node can become the centre, with a radius, so the graph
        is explored from a concept as easily as from the top of the ladder.
     2. Every edge names both directions, so a path can be READ as a sentence in
        whichever direction you walk it.
     3. A view is a thing you can keep: settings, zoom, pan and hand-moved positions
        save to a file and restore exactly.
     4. A contradiction is a node, not an edge — a symmetric edge would have to be
        its own inverse, which this project's grammar bans. */
(function () {
  'use strict';
  var el = document.getElementById('cy');
  if (!el || typeof cytoscape === 'undefined') { return; }

  var D = null, cy = null, VERB = {}, INV = {};
  var collapsed = [];            // stack of {id, members}
  var pathEnds = { a: null, b: null };

  var cfg = {
    levels: { 1: true, 2: true, 3: true, 4: true },
    tree: true, cites: true, findings: true, claims: false,
    concepts: true, cedges: true, crossing: true,
    colour: 'kind', layout: 'force', iterations: 2000, stabilise: false,
    labels: 'inside', wrap: 18, maxlen: 28, size: 'strength',
    radius: 0, edgeLabels: 'none'
  };

  var LEVEL_C = { 1: '#5b4d8f', 2: '#0d5c50', 3: '#a06a14', 4: '#8a5a2b' };
  var CLASS_C = { work: '#5b4d8f', argument: '#0d5c50', prescription: '#1e6b3a',
    evidence: '#a06a14', record: '#8a5a2b', disclosure: '#a33a31', apparatus: '#4a5b6a',
    definition: '#5b4d8f', demonstration: '#0d5c50', rule: '#1e6b3a', correction: '#a33a31',
    signpost: '#8a5a2b' };
  var EV_C = { evidenced: '#1e6b3a', argued: '#a06a14', unevidenced: '#a33a31', unlifted: '#b9b4a6' };
  var KIND_C = { unit: '#a06a14', concept: '#5b4d8f', finding: '#a33a31', claim: '#4a5b6a',
                 group: '#0d5c50' };

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function evOf(n) {
    if (!n.claims || !n.claims.length) { return 'unlifted'; }
    var st = n.claims.map(function (c) { return c.state; });
    return st.indexOf('evidenced') > -1 ? 'evidenced'
         : st.indexOf('argued') > -1 ? 'argued' : 'unevidenced';
  }
  function clip(t) {
    t = String(t);
    return t.length > cfg.maxlen ? t.slice(0, cfg.maxlen - 1) + '…' : t;
  }
  function conceptById(id) {
    for (var i = 0; i < D.concepts.length; i++) { if (D.concepts[i].id === id) { return D.concepts[i]; } }
    return null;
  }

  /* ------------------------------------------------------------- build */
  function colourOf(kind, n) {
    if (cfg.colour === 'kind') { return KIND_C[kind] || '#8a8578'; }
    if (kind !== 'unit') { return KIND_C[kind] || '#8a8578'; }
    if (cfg.colour === 'level') { return LEVEL_C[n.level] || '#8a8578'; }
    if (cfg.colour === 'class') { return CLASS_C[n['class']] || '#8a8578'; }
    return EV_C[evOf(n)];
  }
  function sizeOf(kind, n, strength) {
    if (cfg.size === 'fixed') { return 30; }
    if (cfg.size === 'strength' && strength != null) { return Math.max(24, Math.min(80, 18 + strength * 1.7)); }
    if (cfg.size === 'words' && n && n.words) { return Math.max(22, Math.min(74, 16 + n.words * 0.32)); }
    return 30;
  }

  function build() {
    var els = [], on = {};
    Object.keys(D.nodes).forEach(function (id) {
      var n = D.nodes[id];
      if (!cfg.levels[n.level]) { return; }
      on[id] = 1;
      els.push({ data: { id: id, kind: 'unit', label: clip(n.title), level: n.level,
        col: colourOf('unit', n), w: sizeOf('unit', n, null) } });
    });
    if (cfg.tree) {
      Object.keys(D.nodes).forEach(function (id) {
        if (!on[id]) { return; }
        D.nodes[id].children.forEach(function (c) {
          if (on[c]) { els.push({ data: { id: 'k-' + id + '-' + c, source: id, target: c,
            kind: 'compresses', label: 'compresses' } }); }
        });
      });
    }
    if (cfg.cites) {
      (D.cites || []).forEach(function (e, i) {
        if (on[e.source] && on[e.target]) {
          els.push({ data: { id: 'ci-' + i, source: e.source, target: e.target,
            kind: 'cites', label: 'cites', weight: e.weight } });
        }
      });
    }
    if (cfg.findings) {
      D.findings.forEach(function (f, i) {
        var hits = f.where.filter(function (w) { return on[w]; });
        if (!hits.length) { return; }
        els.push({ data: { id: 'f' + i, kind: 'finding', fkind: f.kind, label: clip(f.title),
          col: KIND_C.finding, w: 32 } });
        hits.forEach(function (w) {
          els.push({ data: { id: 'fl-' + i + '-' + w, source: 'f' + i, target: w,
            kind: 'flags', label: 'flags' } });
        });
      });
    }
    if (cfg.concepts) {
      D.concepts.forEach(function (c) {
        els.push({ data: { id: c.id, kind: 'concept', label: clip(c.label), col: KIND_C.concept,
          w: sizeOf('concept', null, c.strength.score), peak: D.peaks.indexOf(c.id) > -1 ? 1 : 0 } });
      });
      if (cfg.cedges) {
        D.concepts.forEach(function (c) {
          c.edges.forEach(function (e, i) {
            els.push({ data: { id: 'ce-' + c.id + '-' + i, source: c.id, target: e[1],
              kind: 'concept-edge', label: e[0] } });
          });
        });
      }
      if (cfg.crossing) {
        D.concepts.forEach(function (c) {
          c.units.forEach(function (u) {
            if (on[u]) { els.push({ data: { id: 'ap-' + c.id + '-' + u, source: c.id, target: u,
              kind: 'appears_in', label: 'appears_in' } }); }
          });
        });
      }
    }
    if (cfg.claims) {
      Object.keys(D.nodes).forEach(function (id) {
        if (!on[id]) { return; }
        (D.nodes[id].claims || []).forEach(function (c, i) {
          var cid = 'c-' + id + '-' + i;
          els.push({ data: { id: cid, kind: 'claim', label: clip(c.text), state: c.state,
            ckind: c.kind, col: EV_C[c.state] || '#8a8578', w: 18 } });
          els.push({ data: { id: 'ca-' + cid, source: id, target: cid, kind: 'carries',
            label: 'carries' } });
        });
      });
    }
    return els;
  }

  /* ------------------------------------------------------------- style */
  function style() {
    var inside = cfg.labels === 'inside', px = Math.round(cfg.wrap * 6.4);
    var base = {
      'background-color': 'data(col)', 'label': cfg.labels === 'none' ? '' : 'data(label)',
      'font-size': inside ? 9 : 8, 'color': inside ? '#fff' : '#3a3b40',
      'text-wrap': 'wrap', 'text-max-width': inside ? px : 96,
      'border-width': 1, 'border-color': '#fff'
    };
    if (inside) {
      base['shape'] = 'round-rectangle';
      base['text-valign'] = 'center'; base['text-halign'] = 'center';
      base['width'] = 'label'; base['height'] = 'label';
      base['padding'] = '8px'; base['font-weight'] = 500;
    } else {
      base['width'] = 'data(w)'; base['height'] = 'data(w)';
      base['text-valign'] = 'bottom'; base['text-margin-y'] = 3;
    }
    var edgeLbl = cfg.edgeLabels === 'none' ? '' : 'data(label)';
    return [
      { selector: 'node', style: base },
      { selector: 'node[kind = "finding"]', style: {
          shape: inside ? 'round-rectangle' : 'diamond', 'font-weight': 'bold',
          'border-width': 2, 'border-color': '#fbebe9' } },
      { selector: 'node[kind = "concept"][peak = 1]', style: {
          'border-width': 3, 'border-color': '#c9a227' } },
      { selector: 'node[kind = "group"]', style: {
          shape: 'round-rectangle', 'border-width': 3, 'border-style': 'double',
          'border-color': '#0d5c50', 'font-weight': 'bold' } },
      { selector: 'node[kind = "claim"]', style: { shape: 'round-rectangle', 'font-size': 8 } },
      { selector: 'edge', style: {
          width: 1, 'line-color': '#cfcabc', 'curve-style': 'bezier',
          'target-arrow-shape': 'triangle', 'target-arrow-color': '#cfcabc', 'arrow-scale': .7,
          label: edgeLbl, 'font-size': 7, color: '#8a8578', 'text-rotation': 'autorotate',
          'text-background-color': '#faf9f5', 'text-background-opacity': .85,
          'text-background-padding': 1 } },
      { selector: 'edge[kind = "compresses"]', style: { width: 2, 'line-color': '#9cc5be', 'target-arrow-color': '#9cc5be' } },
      { selector: 'edge[kind = "cites"]', style: { 'line-color': '#c98a2b', 'target-arrow-color': '#c98a2b',
          'line-style': 'dashed', width: 'mapData(weight, 1, 4, 1, 3.4)' } },
      { selector: 'edge[kind = "flags"]', style: { 'line-color': '#a33a31', 'target-arrow-color': '#a33a31',
          'line-style': 'dotted', width: 1.6 } },
      { selector: 'edge[kind = "concept-edge"]', style: { 'line-color': '#5b4d8f', 'target-arrow-color': '#5b4d8f', width: 1.6 } },
      { selector: 'edge[kind = "appears_in"]', style: { 'line-color': '#d8d3e8', 'target-arrow-color': '#d8d3e8',
          'line-style': 'dashed', width: 1 } },
      { selector: 'edge[kind = "carries"]', style: { 'line-color': '#e4e0d6', 'target-arrow-color': '#e4e0d6' } },
      { selector: '.dim', style: { opacity: .1 } },
      { selector: '.hot', style: { opacity: 1, 'border-width': 4, 'border-color': '#0d5c50' } },
      { selector: '.onpath', style: { 'line-color': '#0d5c50', 'target-arrow-color': '#0d5c50',
          width: 4, opacity: 1, 'z-index': 99 } },
      { selector: '.pend', style: { 'border-width': 5, 'border-color': '#c9a227', opacity: 1 } }
    ];
  }

  function layoutOpts(fromPositions) {
    if (fromPositions) { return { name: 'preset', fit: false, animate: false }; }
    if (cfg.layout === 'layered') {
      var pos = preset();
      return { name: 'preset', positions: function (n) { return pos[n.id()] || { x: 0, y: 0 }; },
               fit: true, padding: 26, animate: false };
    }
    if (cfg.layout === 'concentric') {
      return { name: 'concentric', concentric: function (n) {
                 return n.data('kind') === 'concept' ? 6 : 5 - (n.data('level') || 5); },
               levelWidth: function () { return 1; }, padding: 24, animate: false };
    }
    if (cfg.layout === 'grid') { return { name: 'grid', padding: 24, animate: false }; }
    var big = cfg.labels === 'inside';   // labelled boxes need far more room than dots
    // Without a bounding box cose lays out into a square and a wide pane wastes its
    // sides: the graph ends up a tall column with empty margins. Handing it the pane's
    // real shape is what makes the width usable.
    var bb = { x1: 0, y1: 0, w: Math.max(el.clientWidth - 40, 600),
               h: Math.max(el.clientHeight - 40, 420) };
    return { name: 'cose', animate: false, padding: 26, boundingBox: bb, fit: true,
             nodeRepulsion: big ? 48000 : 12000,
             idealEdgeLength: big ? 190 : 85,
             nodeOverlap: big ? 28 : 12, componentSpacing: big ? 140 : 80,
             nestingFactor: .8, gravity: .32, numIter: cfg.iterations,
             coolingFactor: cfg.stabilise ? .997 : .99,
             initialTemp: cfg.stabilise ? 260 : 200, randomize: true };
  }

  function preset() {
    var W = Math.max(el.clientWidth, 900), GAP = cfg.labels === 'inside' ? 190 : 132,
        ROW = cfg.labels === 'inside' ? 130 : 118, pos = {}, y = 0;
    if (cfg.findings) {
      var f = D.findings.map(function (x, i) { return 'f' + i; }),
          per = Math.max(3, Math.floor(W / 210));
      f.forEach(function (id, i) {
        pos[id] = { x: (i % per + .5) * (W / Math.min(per, f.length)), y: y + Math.floor(i / per) * 90 };
      });
      y += Math.ceil(f.length / per) * 90 + 150;
    }
    [1, 2, 3, 4].forEach(function (L) {
      if (!cfg.levels[L]) { return; }
      var ids = Object.keys(D.nodes).filter(function (id) { return D.nodes[id].level === L; });
      var per = Math.max(4, Math.floor(W / GAP)), rows = Math.ceil(ids.length / per);
      ids.forEach(function (id, i) {
        var r = Math.floor(i / per), inRow = Math.min(per, ids.length - r * per);
        pos[id] = { x: (i % per + .5) * (W / inRow), y: y + r * ROW };
      });
      y += rows * ROW + 92;
    });
    if (cfg.concepts) {                      // concepts get their own band at the foot
      var per2 = Math.max(4, Math.floor(W / GAP));
      D.concepts.forEach(function (c, i) {
        var r = Math.floor(i / per2), inRow = Math.min(per2, D.concepts.length - r * per2);
        pos[c.id] = { x: (i % per2 + .5) * (W / inRow), y: y + r * ROW };
      });
    }
    Object.keys(D.nodes).forEach(function (id) {
      (D.nodes[id].claims || []).forEach(function (c, i) {
        if (pos[id]) { pos['c-' + id + '-' + i] = { x: pos[id].x + (i - 1) * 46, y: pos[id].y + 54 }; }
      });
    });
    return pos;
  }

  /* ------------------------------------------------------------- draw */
  function draw(keepPositions) {
    var pos = null;
    if (keepPositions && cy) {
      pos = {}; cy.nodes().forEach(function (n) { pos[n.id()] = n.position(); });
    }
    var zoom = cy ? cy.zoom() : null, pan = cy ? cy.pan() : null;
    if (cy) { cy.destroy(); }
    cy = cytoscape({ container: el, elements: build(), style: style(),
                     layout: { name: 'preset', animate: false },
                     wheelSensitivity: .25, maxZoom: 4, minZoom: .08 });
    if (pos) {
      cy.nodes().forEach(function (n) { if (pos[n.id()]) { n.position(pos[n.id()]); } });
      if (zoom) { cy.zoom(zoom); cy.pan(pan); }
    } else {
      cy.layout(layoutOpts(false)).run();
    }
    wire();
    applyRadius();
    stats();
  }

  function relayout() {
    cy.layout(layoutOpts(false)).run();
    stats();
  }

  function wire() {
    cy.on('tap', 'node', function (e) {
      if (e.originalEvent && e.originalEvent.shiftKey) { setPathEnd(e.target); return; }
      detail(e.target);
    });
    cy.on('dbltap', 'node', function (e) {
      var n = e.target;
      if (n.data('kind') === 'group') { expandGroup(n.id()); return; }
      focusOn(n.id(), Math.max(1, cfg.radius || 1));
    });
    cy.on('tap', function (e) {
      if (e.target === cy) { cy.elements().removeClass('dim hot onpath'); clearDetail(); }
    });
  }

  function stats() {
    var s = document.getElementById('gstats');
    if (!s) { return; }
    s.textContent = cy.nodes(':visible').length + ' nodes · ' + cy.edges(':visible').length +
      ' edges' + (collapsed.length ? ' · ' + collapsed.length + ' collapsed' : '') +
      (cfg.radius ? ' · radius ' + cfg.radius : '');
  }

  /* --------------------------------------------------- focus and radius */
  var focusId = null;
  function focusOn(id, r) {
    focusId = id; cfg.radius = r;
    var f = document.querySelector('[name="radius"]'); if (f) { f.value = String(r); }
    applyRadius(); detail(cy.$id(id));
  }
  function applyRadius() {
    if (!cfg.radius || !focusId || !cy.$id(focusId).length) {
      cy.elements().style('display', 'element'); return;
    }
    var keep = cy.$id(focusId);
    for (var i = 0; i < cfg.radius; i++) { keep = keep.closedNeighborhood(); }
    cy.elements().style('display', 'none');
    keep.style('display', 'element');
    keep.nodes().addClass('');
  }

  /* ------------------------------------------------------ collapse group */
  function collapseSelection() {
    var sel = cy.$(':selected').filter('node');
    if (sel.length < 2) { note('Select two or more nodes first (shift-drag a box, or ctrl-click).'); return; }
    var gid = 'grp-' + (collapsed.length + 1),
        members = sel.map(function (n) { return n.id(); });
    var pos = { x: 0, y: 0 };
    sel.forEach(function (n) { pos.x += n.position('x') / sel.length; pos.y += n.position('y') / sel.length; });
    collapsed.push({ id: gid, members: members, json: sel.union(sel.connectedEdges()).jsons() });
    cy.add({ group: 'nodes', data: { id: gid, kind: 'group', label: members.length + ' collapsed',
      col: KIND_C.group, w: 44 }, position: pos });
    var seen = {};
    sel.connectedEdges().forEach(function (e) {
      var other = members.indexOf(e.source().id()) > -1 ? e.target().id() : e.source().id();
      if (members.indexOf(other) > -1 || seen[other + e.data('kind')]) { return; }
      seen[other + e.data('kind')] = 1;
      cy.add({ group: 'edges', data: { id: 'g-' + gid + '-' + other + '-' + e.data('kind'),
        source: members.indexOf(e.source().id()) > -1 ? gid : other,
        target: members.indexOf(e.source().id()) > -1 ? other : gid,
        kind: e.data('kind'), label: e.data('label') } });
    });
    sel.remove();
    stats();
  }
  function expandGroup(gid) {
    var idx = -1;
    collapsed.forEach(function (g, i) { if (g.id === gid) { idx = i; } });
    if (idx < 0) { return; }
    cy.$id(gid).connectedEdges().remove();
    cy.$id(gid).remove();
    cy.add(collapsed[idx].json);
    collapsed.splice(idx, 1);
    stats();
  }

  /* ------------------------------------------------------------- paths */
  function setPathEnd(n) {
    if (!pathEnds.a) { pathEnds.a = n.id(); n.addClass('pend'); note('Path start: ' + n.data('label') + '. Shift-click a second node.'); return; }
    if (pathEnds.a === n.id()) { cy.$id(pathEnds.a).removeClass('pend'); pathEnds.a = null; note('Path start cleared.'); return; }
    pathEnds.b = n.id();
    var dij = cy.elements().dijkstra({ root: cy.$id(pathEnds.a), directed: false });
    var path = dij.pathTo(cy.$id(pathEnds.b));
    cy.elements().removeClass('onpath dim');
    if (!path || path.length < 2) { note('No path between those two under the current filters.'); return; }
    path.addClass('onpath');
    cy.elements().not(path).addClass('dim');
    readPath(path);
    cy.$id(pathEnds.a).removeClass('pend');
    pathEnds = { a: null, b: null };
  }

  /* A path is only worth having if it reads. Each edge is walked in the direction the
     path actually goes, and named with its verb or its inverse accordingly. */
  function readPath(path) {
    var out = [], prev = null;
    path.forEach(function (e) {
      if (e.isNode()) { prev = e; return; }
      var fwd = prev && e.source().id() === prev.id();
      var v = e.data('label'), verb = fwd ? v : (INV[v] || (v + ' (reversed)'));
      out.push({ from: (fwd ? e.source() : e.target()).data('label'),
                 verb: verb,
                 to: (fwd ? e.target() : e.source()).data('label') });
      prev = fwd ? e.target() : e.source();
    });
    var d = document.getElementById('gdetail');
    if (!d) { return; }
    d.innerHTML = '<h3>The path, read as sentences</h3>' +
      '<p class="small dim">' + out.length + ' hop' + (out.length === 1 ? '' : 's') +
      '. Each edge is named in the direction the path walks it, using its inverse where the walk goes backwards.</p>' +
      '<ol class="gpath">' + out.map(function (h) {
        return '<li><b>' + esc(h.from) + '</b> <code>' + esc(h.verb) + '</code> <b>' + esc(h.to) + '</b></li>';
      }).join('') + '</ol>';
  }

  /* ------------------------------------------------------- the path query
     Trace-and-read answers "how do these two connect?". This answers the other
     question: "show me EVERY route shaped like this". A pattern is a start filter
     then alternating edge and node steps, walked breadth-first with a visited set
     per path so a cycle cannot spin. Bounded, and it says when it hit the bound —
     a query that silently truncates is worse than one that refuses. */
  var QCAP = 300;

  function pattern() {
    var f = document.getElementById('gq');
    if (!f) { return null; }
    var p = { start: f.querySelector('[name="q-start"]').value, steps: [] };
    for (var i = 1; i <= 3; i++) {
      var v = f.querySelector('[name="q-verb' + i + '"]'),
          d = f.querySelector('[name="q-dir' + i + '"]'),
          n = f.querySelector('[name="q-node' + i + '"]');
      if (!v || v.value === 'stop') { break; }
      p.steps.push({ verb: v.value, dir: d.value, node: n.value });
    }
    return p;
  }

  function matchNode(n, filter) {
    if (filter === 'any') { return true; }
    if (filter.indexOf('kind:') === 0) { return n.data('kind') === filter.slice(5); }
    if (filter.indexOf('ev:') === 0) {
      var d = D.nodes[n.id()];
      return d ? evOf(d) === filter.slice(3) : false;
    }
    if (filter === 'peak') { return D.peaks.indexOf(n.id()) > -1; }
    if (filter === 'unevidenced-concept') {
      var c = conceptById(n.id());
      return !!c && !c.demonstrated_by.length;
    }
    return n.id() === filter;
  }

  function runQuery() {
    var p = pattern();
    if (!p || !p.steps.length) { qresult('<p class="small dim">Add at least one step.</p>'); return; }
    var starts = cy.nodes().filter(function (n) { return matchNode(n, p.start); });
    var paths = [], capped = false;

    function walk(node, i, trail, seen) {
      if (paths.length >= QCAP) { capped = true; return; }
      if (i >= p.steps.length) { paths.push(trail.slice()); return; }
      var st = p.steps[i];
      var edges = st.dir === 'in' ? node.incomers('edge')
                : st.dir === 'out' ? node.outgoers('edge')
                : node.connectedEdges();
      edges.forEach(function (e) {
        if (st.verb !== 'any' && e.data('label') !== st.verb) { return; }
        var other = e.source().id() === node.id() ? e.target() : e.source();
        if (st.dir === 'in' && e.target().id() !== node.id()) { return; }
        if (st.dir === 'out' && e.source().id() !== node.id()) { return; }
        if (seen[other.id()]) { return; }
        if (!matchNode(other, st.node)) { return; }
        seen[other.id()] = 1;
        trail.push({ e: e, from: node, to: other, back: e.source().id() !== node.id() });
        walk(other, i + 1, trail, seen);
        trail.pop();
        delete seen[other.id()];
      });
    }
    starts.forEach(function (n) { var seen = {}; seen[n.id()] = 1; walk(n, 0, [], seen); });

    if (!paths.length) {
      qresult('<p class="small dim">No paths match that pattern under the current filters. ' +
              'That is a result, not a failure: it is the difference between "we did not look" ' +
              'and "we looked and there is nothing there".</p>');
      return;
    }
    var h = ['<p class="small dim"><b>' + paths.length + (capped ? '+' : '') + ' path' +
             (paths.length === 1 ? '' : 's') + '</b> match ' + esc(patternText(p)) +
             (capped ? ' &mdash; <b>capped at ' + QCAP + '</b>, so the list is incomplete and says so.' : '') +
             ' Click one to trace it in the graph.</p><ol class="gpath">'];
    paths.forEach(function (t, i) {
      h.push('<li><a href="#" data-qpath="' + i + '">' + t.map(function (hop) {
        var v = hop.back ? (INV[hop.e.data('label')] || hop.e.data('label') + ' (reversed)') : hop.e.data('label');
        return '<b>' + esc(hop.from.data('label')) + '</b> <code>' + esc(v) + '</code> <b>' +
               esc(hop.to.data('label')) + '</b>';
      }).join(' &rarr; ') + '</a></li>');
    });
    h.push('</ol>');
    qresult(h.join(''));
    window.__qpaths = paths;
  }
  function patternText(p) {
    return nodeLabel(p.start) + p.steps.map(function (s) {
      return ' ' + (s.dir === 'in' ? '<' : '') + '-' + (s.verb === 'any' ? '*' : s.verb) + '-' +
             (s.dir === 'in' ? '' : '>') + ' ' + nodeLabel(s.node);
    }).join('');
  }
  function nodeLabel(f) {
    if (f === 'any') { return '*'; }
    if (f.indexOf('kind:') === 0) { return f.slice(5); }
    if (f.indexOf('ev:') === 0) { return f.slice(3) + ' unit'; }
    if (f === 'peak') { return 'a peak'; }
    if (f === 'unevidenced-concept') { return 'concept with no demonstration'; }
    return f;
  }
  function qresult(h) {
    var d = document.getElementById('gqout');
    if (d) { d.innerHTML = h; }
  }
  function showQPath(i) {
    var t = (window.__qpaths || [])[i];
    if (!t) { return; }
    var els = cy.collection();
    t.forEach(function (hop) { els = els.union(hop.e).union(hop.from).union(hop.to); });
    cy.elements().removeClass('onpath').addClass('dim');
    els.removeClass('dim').addClass('onpath');
  }

  function note(t) {
    var d = document.getElementById('gnote');
    if (d) { d.textContent = t; setTimeout(function () { if (d.textContent === t) { d.textContent = ''; } }, 6000); }
  }

  /* ------------------------------------------------------------- detail */
  function clearDetail() {
    var d = document.getElementById('gdetail');
    if (d) { d.innerHTML = '<p class="small dim">Click a node to open it. <b>Double-click</b> to centre the graph on it at the current radius. <b>Shift-click two nodes</b> to trace a path and read it as sentences.</p>'; }
  }
  function detail(node) {
    var d = document.getElementById('gdetail'), id = node.id(), k = node.data('kind'), h = [];
    cy.elements().removeClass('dim hot');
    if (!cfg.radius) {
      cy.elements().addClass('dim');
      node.closedNeighborhood().removeClass('dim');
    }
    node.addClass('hot');

    if (k === 'concept') {
      var c = conceptById(id);
      h.push('<h3>' + esc(c.label) + '</h3>');
      h.push('<p class="small dim">concept · strength ' + c.strength.score +
             ' <span title="' + esc(c.strength.formula) + '">(' + c.strength.out + ' out, ' +
             c.strength.incoming + ' in, ' + c.strength.units + ' units, ' +
             c.strength.shown + ' demonstrated)</span>' +
             (D.peaks.indexOf(id) > -1 ? ' · <b>a peak</b>' : '') + '</p>');
      h.push('<p>' + fmt(c.definition) + '</p>');
      if (c.also_called.length) { h.push('<p class="small"><b>Also called:</b> ' + c.also_called.map(esc).join(' · ') + '</p>'); }
      if (c.near_but_not.length) { h.push('<p class="small"><b>Near, but not:</b> ' + c.near_but_not.map(esc).join(' · ') + '</p>'); }
      h.push(edgeList('Outward', c.edges) + edgeList('Inward', c.in_edges));
      if (c.units.length) {
        h.push('<p class="small"><b>Appears in:</b> ' + c.units.map(function (u) {
          return '<a href="index.html?t=' + encodeURIComponent(trailOf(u).join(',')) + '">' +
                 esc(D.nodes[u].title) + '</a>'; }).join(' · ') + '</p>');
      }
      if (c.demonstrated_by.length) {
        h.push('<p class="small"><b>Demonstrated by:</b> ' + c.demonstrated_by.map(function (u) {
          return '<a href="' + esc(u) + '">' + esc(u.replace('../vaults/', '').replace('.html', '')) + '</a>';
        }).join(' · ') + '</p>');
      }
      h.push('<p class="small"><a href="concepts.html#' + esc(id) + '">Open in the concept map &rarr;</a></p>');
    } else if (k === 'finding') {
      var f = D.findings[+id.slice(1)];
      h.push('<h3>' + esc(f.title) + '</h3><p class="small dim">finding · ' + esc(f.kind) + '</p>');
      h.push('<p>' + fmt(f.detail) + '</p><p class="altverdict"><span class="revlbl">Verdict</span>' + fmt(f.verdict) + '</p>');
    } else if (k === 'group') {
      h.push('<h3>' + node.data('label') + '</h3><p class="small dim">A group you collapsed. Double-click it to expand.</p>');
    } else if (k === 'claim') {
      h.push('<h3>A ' + esc(node.data('ckind') || 'claim') + '</h3><p>' + esc(node.data('label')) +
             '</p><p class="small dim">evidence state: ' + esc(node.data('state')) + '</p>');
    } else {
      var n = D.nodes[id];
      h.push('<h3>' + esc(n.title) + '</h3>');
      h.push('<p class="small dim">level ' + n.level + ' · ' + esc(n.type || '') +
             (n['class'] ? ' · ' + esc(n['class']) : '') + ' · ' + n.words + ' words</p>');
      h.push('<p>' + esc(n.segments.map(function (s) { return s.t; }).join('')) + '</p>');
      if (n.claims && n.claims.length) {
        h.push('<div class="altgraph"><span class="revlbl">Claims</span><ul>' + n.claims.map(function (c) {
          return '<li class="ac-' + esc(c.state) + '"><span class="acst">' + esc(c.kind || c.state) +
                 '</span> ' + esc(c.text) + '</li>'; }).join('') + '</ul></div>');
      }
      h.push('<p class="small"><a href="index.html?t=' + encodeURIComponent(trailOf(id).join(',')) +
             '">Open in the ladder &rarr;</a>' + (n.book ? ' · <a href="' + esc(n.book) + '">read it in the book</a>' : '') + '</p>');
    }
    h.push('<p class="small dim"><button class="altib" data-focus="' + esc(id) + '">Centre the graph here</button></p>');
    if (d) { d.innerHTML = h.join('\n'); }
  }
  function fmt(t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function edgeList(dir, list) {
    if (!list || !list.length) { return ''; }
    return '<p class="small"><b>' + dir + ':</b> ' + list.map(function (e) {
      var c = conceptById(e[1]);
      return '<code>' + esc(e[0]) + '</code> ' + esc(c ? c.label : e[1]);
    }).join('<br>') + '</p>';
  }
  function trailOf(id) {
    var t = [id], cur = id, g = 0;
    while (D.nodes[cur] && D.nodes[cur].parents.length && g++ < 12) { cur = D.nodes[cur].parents[0]; t.unshift(cur); }
    return t;
  }

  /* ------------------------------------------------- capture and restore
     A view worth showing somebody is a view you can get back to: the settings, the
     zoom, the pan, what you collapsed and where you dragged things. The PNG alone
     is a dead end, so both are offered and the JSON is the one that matters. */
  function viewSpec() {
    return {
      kind: 'graphs.sgit.ai altitude view', version: D.version,
      saved: new Date().toISOString().slice(0, 10),
      cfg: JSON.parse(JSON.stringify(cfg)),
      zoom: cy.zoom(), pan: cy.pan(),
      collapsed: collapsed.map(function (g) { return { id: g.id, members: g.members }; }),
      focus: focusId,
      positions: cy.nodes().map(function (n) {
        return { id: n.id(), x: Math.round(n.position('x')), y: Math.round(n.position('y')) };
      })
    };
  }
  function download(name, blob) {
    var a = document.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500);
  }
  function savePng() {
    var b = cy.png({ output: 'blob', full: true, scale: 2, bg: '#faf9f5' });
    download('altitude-graph-' + D.version + '.png', b);
    note('PNG saved. The view spec beside it is what lets you recreate this exact picture.');
  }
  function saveView() {
    download('altitude-view-' + D.version + '.json',
             new Blob([JSON.stringify(viewSpec(), null, 1)], { type: 'application/json' }));
    note('View saved: settings, zoom, pan, collapsed groups and every node position.');
  }
  function loadView(spec) {
    try {
      if (!spec || !spec.cfg) { throw new Error('not a view spec'); }
      Object.keys(spec.cfg).forEach(function (k) { cfg[k] = spec.cfg[k]; });
      syncForm();
      focusId = spec.focus || null;
      collapsed = [];
      draw(false);
      var pos = {};
      (spec.positions || []).forEach(function (p) { pos[p.id] = { x: p.x, y: p.y }; });
      cy.nodes().forEach(function (n) { if (pos[n.id()]) { n.position(pos[n.id()]); } });
      if (spec.zoom) { cy.zoom(spec.zoom); cy.pan(spec.pan); }
      applyRadius(); stats();
      note('View restored, positions and all.');
    } catch (e) { note('That file is not a view spec (' + e.message + ').'); }
  }
  function syncForm() {
    var f = document.getElementById('gcfg');
    if (!f) { return; }
    [1, 2, 3, 4].forEach(function (L) {
      var c = f.querySelector('[name="lv' + L + '"]'); if (c) { c.checked = !!cfg.levels[L]; }
    });
    ['tree', 'cites', 'findings', 'claims', 'concepts', 'cedges', 'crossing', 'stabilise'].forEach(function (k) {
      var c = f.querySelector('[name="' + k + '"]'); if (c) { c.checked = !!cfg[k]; }
    });
    ['colour', 'layout', 'labels', 'size', 'edgeLabels'].forEach(function (k) {
      var r = f.querySelector('[name="' + k + '"][value="' + cfg[k] + '"]'); if (r) { r.checked = true; }
    });
    ['iterations', 'wrap', 'maxlen', 'radius'].forEach(function (k) {
      var i = f.querySelector('[name="' + k + '"]');
      if (i) { i.value = String(cfg[k]); var o = document.getElementById('out-' + k); if (o) { o.textContent = cfg[k]; } }
    });
  }

  /* ------------------------------------------------------------- events */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.name || !t.closest('#gcfg')) { return; }
    if (t.name.indexOf('lv') === 0) { cfg.levels[+t.name.slice(2)] = t.checked; draw(false); return; }
    if (t.type === 'checkbox') { cfg[t.name] = t.checked; }
    else if (t.type === 'range') { cfg[t.name] = +t.value; }
    else { cfg[t.name] = t.value; }
    var o = document.getElementById('out-' + t.name);
    if (o) { o.textContent = t.value; }
    if (t.name === 'radius') { applyRadius(); stats(); return; }
    if (t.name === 'iterations' || t.name === 'stabilise') { return; }   // applied on next layout
    if (t.name === 'labels' || t.name === 'wrap' || t.name === 'edgeLabels') {
      cy.style(style()); draw(true); return;
    }
    draw(t.name === 'colour' || t.name === 'size' || t.name === 'maxlen');
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-focus')) { focusOn(t.getAttribute('data-focus'), Math.max(1, cfg.radius || 2)); return; }
    var qp = t.closest && t.closest('[data-qpath]');
    if (qp) { e.preventDefault(); showQPath(+qp.getAttribute('data-qpath')); return; }
    if (t.id === 'gqrun') { runQuery(); return; }
    if (t.hasAttribute && t.hasAttribute('data-preset')) {
      e.preventDefault();
      var pre = JSON.parse(t.getAttribute('data-preset')), f = document.getElementById('gq');
      f.querySelector('[name="q-start"]').value = pre.start;
      [1, 2, 3].forEach(function (i) {
        var st = pre.steps[i - 1] || { verb: 'stop', dir: 'out', node: 'any' };
        f.querySelector('[name="q-verb' + i + '"]').value = st.verb;
        f.querySelector('[name="q-dir' + i + '"]').value = st.dir;
        f.querySelector('[name="q-node' + i + '"]').value = st.node;
      });
      runQuery();
      return;
    }
    switch (t.id) {
      case 'gfit': cy.fit(undefined, 30); break;
      case 'greset':
        cy.elements().removeClass('dim hot onpath pend'); focusId = null; cfg.radius = 0;
        syncForm(); applyRadius(); clearDetail(); stats(); break;
      case 'grelayout': relayout(); break;
      case 'gstable':
        cfg.stabilise = true; cfg.iterations = Math.max(cfg.iterations, 6000);
        syncForm(); relayout(); note('Ran a long layout (' + cfg.iterations + ' iterations).'); break;
      case 'gpng': savePng(); break;
      case 'gsave': saveView(); break;
      case 'gload': document.getElementById('gfile').click(); break;
      case 'gcollapse': collapseSelection(); break;
      case 'gexpandall':
        collapsed.slice().forEach(function (g) { expandGroup(g.id); }); break;
      case 'gfull': {
        var w = document.querySelector('.gwrap');
        if (!document.fullscreenElement) { w.requestFullscreen && w.requestFullscreen(); }
        else { document.exitFullscreen(); }
        break;
      }
      case 'gwide':
        document.querySelector('.gwrap').classList.toggle('gwide');
        setTimeout(function () { cy.resize(); cy.fit(undefined, 30); }, 60);
        break;
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id !== 'gfile' || !e.target.files || !e.target.files[0]) { return; }
    var r = new FileReader();
    r.onload = function () { try { loadView(JSON.parse(r.result)); } catch (x) { note('Could not read that file.'); } };
    r.readAsText(e.target.files[0]);
    e.target.value = '';
  });

  /* the graph pane is resizable: drag its bottom edge, or the divider beside it */
  (function resizers() {
    var drag = null;
    document.addEventListener('pointerdown', function (e) {
      var h = e.target.closest('[data-gresize]');
      if (!h) { return; }
      drag = { how: h.getAttribute('data-gresize'), x: e.clientX, y: e.clientY,
               h: el.getBoundingClientRect().height,
               w: document.querySelector('.gdetail').getBoundingClientRect().width };
      h.setPointerCapture(e.pointerId); document.body.classList.add('altdragging'); e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!drag) { return; }
      if (drag.how === 'v') {
        el.style.height = Math.max(300, drag.h + (e.clientY - drag.y)) + 'px';
      } else {
        var w = Math.max(180, Math.min(640, drag.w - (e.clientX - drag.x)));
        document.querySelector('.gwrap').style.setProperty('--gdw', w + 'px');
      }
      cy.resize();
    });
    document.addEventListener('pointerup', function () {
      if (!drag) { return; }
      drag = null; document.body.classList.remove('altdragging'); cy.resize();
    });
  })();

  document.addEventListener('fullscreenchange', function () {
    setTimeout(function () { cy.resize(); cy.fit(undefined, 30); }, 80);
  });

  /* ------------------------------------------------------------- boot */
  fetch('data/altitudes.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    (D.edge_registry || []).forEach(function (e) {
      VERB[e.verb] = e; INV[e.verb] = e.inverse; INV[e.inverse] = e.verb;
    });
    var inv = document.getElementById('ginventory');
    if (inv && D.inventory) {
      var i = D.inventory;
      inv.innerHTML = '<b>' + i.fact + '</b> facts · <b>' + i.assertion + '</b> assertions · <b>' +
        i.opinion + '</b> opinions · <b>' + i.concepts + '</b> concepts · <b>' + i.units +
        '</b> units · <b>' + i.findings + '</b> findings';
    }
    syncForm(); clearDetail(); draw(false);
  }).catch(function () {
    el.innerHTML = '<p class="small dim">Could not load the ladder data.</p>';
  });
})();
