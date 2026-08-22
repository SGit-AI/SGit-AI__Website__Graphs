/* The altitude ladder as one graph (cytoscape.js, vendored — no CDN, no network).

   Four kinds of node and four kinds of edge, and the point of the page is what the
   non-tree edges reveal: cites edges (measured from the book's own markdown) that
   jump between chapters, and finding nodes that tie two units the text keeps apart.

   A contradiction is deliberately NOT drawn as an edge between the two units. A
   symmetric edge would need to be its own inverse, which this project's grammar
   bans as meaningless. It is reified instead: the finding is a node, and it flags
   each unit it involves. That is the same move the grammar chapter asks for. */
(function () {
  'use strict';
  var el = document.getElementById('cy');
  if (!el || typeof cytoscape === 'undefined') { return; }

  var D = null, cy = null;
  var cfg = {
    levels: { 1: true, 2: true, 3: true, 4: true },
    tree: true, cites: true, findings: true, claims: false,
    colour: 'level', layout: 'breadthfirst', labels: 'units', size: 'words'
  };

  var LEVEL_C = { 1: '#5b4d8f', 2: '#0d5c50', 3: '#a06a14', 4: '#8a5a2b' };
  var CLASS_C = {
    work: '#5b4d8f', argument: '#0d5c50', prescription: '#1e6b3a', evidence: '#a06a14',
    record: '#8a5a2b', disclosure: '#a33a31', apparatus: '#4a5b6a', definition: '#5b4d8f',
    demonstration: '#0d5c50', rule: '#1e6b3a', correction: '#a33a31', signpost: '#8a5a2b'
  };
  var EV_C = { evidenced: '#1e6b3a', argued: '#a06a14', unevidenced: '#a33a31', unlifted: '#b9b4a6' };

  function evOf(n) {
    if (!n.claims || !n.claims.length) { return 'unlifted'; }
    var st = n.claims.map(function (c) { return c.state; });
    return st.indexOf('evidenced') > -1 ? 'evidenced'
         : st.indexOf('argued') > -1 ? 'argued' : 'unevidenced';
  }
  function colourOf(n) {
    if (cfg.colour === 'level') { return LEVEL_C[n.level] || '#8a8578'; }
    if (cfg.colour === 'class') { return CLASS_C[n['class']] || '#8a8578'; }
    return EV_C[evOf(n)];
  }
  function short(t, n) { return t.length > n ? t.slice(0, n - 1) + '…' : t; }

  function build() {
    var els = [], on = {};
    Object.keys(D.nodes).forEach(function (id) {
      var n = D.nodes[id];
      if (!cfg.levels[n.level]) { return; }
      on[id] = 1;
      els.push({ data: {
        id: id, kind: 'unit', label: short(n.title, 30), level: n.level,
        col: colourOf(n), w: cfg.size === 'words' ? Math.max(22, Math.min(74, 16 + n.words * 0.32)) : 34
      }});
    });
    if (cfg.tree) {
      Object.keys(D.nodes).forEach(function (id) {
        if (!on[id]) { return; }
        D.nodes[id].children.forEach(function (c) {
          if (on[c]) { els.push({ data: { id: 'k-' + id + '-' + c, source: id, target: c, kind: 'compresses' } }); }
        });
      });
    }
    if (cfg.cites) {
      (D.cites || []).forEach(function (e, i) {
        if (on[e.source] && on[e.target]) {
          els.push({ data: { id: 'ci-' + i, source: e.source, target: e.target,
                             kind: 'cites', weight: e.weight } });
        }
      });
    }
    if (cfg.findings) {
      D.findings.forEach(function (f, i) {
        var hits = f.where.filter(function (w) { return on[w]; });
        if (!hits.length) { return; }
        var fid = 'f' + i;
        els.push({ data: { id: fid, kind: 'finding', fkind: f.kind, label: short(f.title, 34), w: 30 } });
        hits.forEach(function (w) {
          els.push({ data: { id: 'fl-' + i + '-' + w, source: fid, target: w, kind: 'flags' } });
        });
      });
    }
    if (cfg.claims) {
      Object.keys(D.nodes).forEach(function (id) {
        if (!on[id]) { return; }
        (D.nodes[id].claims || []).forEach(function (c, i) {
          var cid = 'c-' + id + '-' + i;
          els.push({ data: { id: cid, kind: 'claim', label: short(c.text, 38), state: c.state,
                             col: EV_C[c.state] || '#8a8578', w: 16 } });
          els.push({ data: { id: 'ca-' + cid, source: id, target: cid, kind: 'carries' } });
        });
      });
    }
    return els;
  }

  var STYLE = [
    { selector: 'node', style: {
        'background-color': 'data(col)', 'width': 'data(w)', 'height': 'data(w)',
        'label': 'data(label)', 'font-size': 8, 'color': '#3a3b40',
        'text-wrap': 'wrap', 'text-max-width': 96, 'text-valign': 'bottom',
        'text-margin-y': 3, 'border-width': 1, 'border-color': '#fff' } },
    { selector: 'node[kind = "finding"]', style: {
        'shape': 'diamond', 'background-color': '#a33a31', 'font-weight': 'bold',
        'font-size': 10, 'border-width': 2, 'border-color': '#fbebe9' } },
    { selector: 'node[fkind = "repeat"], node[fkind = "compression-loss"]', style: { 'background-color': '#a06a14' } },
    { selector: 'node[fkind = "weight"], node[fkind = "classification"]', style: { 'background-color': '#0d5c50' } },
    { selector: 'node[fkind = "control"]', style: { 'background-color': '#8a8578' } },
    { selector: 'node[kind = "claim"]', style: { 'shape': 'round-rectangle', 'font-size': 8 } },
    { selector: 'edge', style: {
        'width': 1, 'line-color': '#cfcabc', 'curve-style': 'bezier',
        'target-arrow-shape': 'triangle', 'target-arrow-color': '#cfcabc', 'arrow-scale': .7 } },
    { selector: 'edge[kind = "compresses"]', style: { 'width': 2, 'line-color': '#9cc5be', 'target-arrow-color': '#9cc5be' } },
    { selector: 'edge[kind = "cites"]', style: {
        'line-color': '#c98a2b', 'target-arrow-color': '#c98a2b', 'line-style': 'dashed',
        'width': 'mapData(weight, 1, 4, 1, 3.4)' } },
    { selector: 'edge[kind = "flags"]', style: {
        'line-color': '#a33a31', 'target-arrow-color': '#a33a31', 'line-style': 'dotted', 'width': 1.6 } },
    { selector: 'edge[kind = "carries"]', style: { 'line-color': '#e4e0d6', 'target-arrow-color': '#e4e0d6' } },
    { selector: '.dim', style: { 'opacity': .12 } },
    { selector: '.hot', style: { 'opacity': 1, 'border-width': 3, 'border-color': '#0d5c50' } },
    { selector: 'node[kind = "unit"][?hideLabel]', style: { 'label': '' } }
  ];

  /* The layered view places nodes itself rather than asking breadthfirst to guess:
     one band per altitude, wrapped so a seventeen-unit level does not become one
     unreadable row, and findings in a band of their own above the book. */
  function preset() {
    var W = Math.max(el.clientWidth, 900), GAP = 132, ROW = 118, pos = {}, bands = [];
    [1, 2, 3, 4].forEach(function (L) {
      if (!cfg.levels[L]) { return; }
      bands.push({ L: L, ids: Object.keys(D.nodes).filter(function (id) {
        return D.nodes[id].level === L; }) });
    });
    var y = 0;
    if (cfg.findings) {
      var fids = D.findings.map(function (f, i) { return 'f' + i; });
      var perRow = Math.max(3, Math.floor(W / 190));
      fids.forEach(function (id, i) {
        pos[id] = { x: (i % perRow + .5) * (W / Math.min(perRow, fids.length)),
                    y: y + Math.floor(i / perRow) * 86 };
      });
      y += Math.ceil(fids.length / perRow) * 86 + 150;
    }
    bands.forEach(function (b) {
      var per = Math.max(4, Math.floor(W / GAP)), rows = Math.ceil(b.ids.length / per);
      b.ids.forEach(function (id, i) {
        var r = Math.floor(i / per), inRow = Math.min(per, b.ids.length - r * per);
        pos[id] = { x: (i % per + .5) * (W / inRow), y: y + r * ROW };
      });
      y += rows * ROW + 92;
    });
    Object.keys(D.nodes).forEach(function (id) {          // claims sit under their unit
      (D.nodes[id].claims || []).forEach(function (c, i) {
        if (pos[id]) { pos['c-' + id + '-' + i] = { x: pos[id].x + (i - 1) * 46, y: pos[id].y + 52 }; }
      });
    });
    return pos;
  }

  function layoutOpts() {
    if (cfg.layout === 'breadthfirst') {
      var pos = preset();
      return { name: 'preset', positions: function (n) { return pos[n.id()] || { x: 0, y: 0 }; },
               fit: true, padding: 26, animate: false };
    }
    if (cfg.layout === 'concentric') {
      return { name: 'concentric', concentric: function (n) { return 5 - (n.data('level') || 5); },
               levelWidth: function () { return 1; }, padding: 24, animate: false };
    }
    if (cfg.layout === 'grid') { return { name: 'grid', padding: 24, animate: false }; }
    return { name: 'cose', animate: false, padding: 24, nodeRepulsion: 9000,
             idealEdgeLength: 70, nestingFactor: .8, gravity: .6, numIter: 1200 };
  }

  function applyLabels() {
    cy.nodes().forEach(function (n) {
      var k = n.data('kind'), show =
        cfg.labels === 'all' ? true :
        cfg.labels === 'units' ? (k === 'unit' || k === 'finding') : false;
      n.style('label', show ? n.data('label') : '');
    });
  }

  function draw() {
    if (cy) { cy.destroy(); }
    cy = cytoscape({ container: el, elements: build(), style: STYLE, layout: layoutOpts(),
                     wheelSensitivity: .25, maxZoom: 3, minZoom: .15 });
    applyLabels();
    cy.on('tap', 'node', function (e) { detail(e.target); });
    cy.on('tap', function (e) { if (e.target === cy) { cy.elements().removeClass('dim hot'); clearDetail(); } });
    stats();
  }

  function stats() {
    var s = document.getElementById('gstats');
    if (!s) { return; }
    var n = cy.nodes().length, e = cy.edges().length;
    s.textContent = n + ' nodes · ' + e + ' edges drawn' +
      (cfg.claims ? '' : ' · claim nodes hidden') +
      (cfg.levels[4] ? '' : ' · level 4 hidden');
  }

  function clearDetail() {
    var d = document.getElementById('gdetail');
    if (d) { d.innerHTML = '<p class="small dim">Click any node. Units carry their text and their claims; a diamond is a finding, and its dotted edges reach every unit it involves.</p>'; }
  }

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function detail(node) {
    var d = document.getElementById('gdetail'), id = node.id(), h = [];
    cy.elements().addClass('dim');
    node.closedNeighborhood().removeClass('dim');
    cy.elements().removeClass('hot'); node.addClass('hot');

    if (node.data('kind') === 'finding') {
      var f = D.findings[+id.slice(1)];
      h.push('<h3>' + esc(f.title) + '</h3><p class="small dim">finding · ' + esc(f.kind) + '</p>');
      h.push('<p>' + esc(f.detail) + '</p><p class="altverdict"><span class="revlbl">Verdict</span>' +
             esc(f.verdict) + '</p>');
      h.push('<p class="small dim">Involves: ' + f.where.map(function (w) {
        return esc(D.nodes[w] ? D.nodes[w].title : w); }).join(' · ') + '</p>');
    } else if (node.data('kind') === 'claim') {
      h.push('<h3>A claim</h3><p>' + esc(node.data('label')) + '</p>' +
             '<p class="small dim">state: ' + esc(node.data('state')) + '</p>');
    } else {
      var n = D.nodes[id];
      h.push('<h3>' + esc(n.title) + '</h3>');
      h.push('<p class="small dim">level ' + n.level + ' · ' + esc(n.type || '') +
             (n['class'] ? ' · ' + esc(n['class']) : '') + ' · ' + n.words + ' words</p>');
      h.push('<p>' + n.segments.map(function (s) { return esc(s.t); }).join('') + '</p>');
      if (n.claims && n.claims.length) {
        h.push('<div class="altgraph"><span class="revlbl">Claims</span><ul>' +
          n.claims.map(function (c) {
            return '<li class="ac-' + esc(c.state) + '"><span class="acst">' + esc(c.state) +
                   '</span> ' + esc(c.text) + '</li>'; }).join('') + '</ul></div>');
      }
      h.push('<p><a href="index.html?t=' + encodeURIComponent(trailOf(id).join(',')) +
             '">↗ Open this unit in the ladder</a>' + (n.book ? ' · <a href="' + esc(n.book) +
             '">read it in the book</a>' : '') + '</p>');
    }
    if (d) { d.innerHTML = h.join('\n'); }
  }

  function trailOf(id) {
    var t = [id], cur = id, guard = 0;
    while (D.nodes[cur] && D.nodes[cur].parents.length && guard++ < 12) {
      cur = D.nodes[cur].parents[0]; t.unshift(cur);
    }
    return t;
  }

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.name || !t.closest('#gcfg')) { return; }
    if (t.name.indexOf('lv') === 0) { cfg.levels[+t.value] = t.checked; }
    else if (t.type === 'checkbox') { cfg[t.name] = t.checked; }
    else { cfg[t.name] = t.value; }
    if (t.name === 'labels') { applyLabels(); return; }
    draw();
  });
  document.addEventListener('click', function (e) {
    if (e.target.id === 'gfit') { cy.fit(undefined, 30); }
    if (e.target.id === 'greset') { cy.elements().removeClass('dim hot'); clearDetail(); }
  });

  fetch('data/altitudes.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d; clearDetail(); draw();
  }).catch(function () {
    el.innerHTML = '<p class="small dim">Could not load the ladder data.</p>';
  });
})();
