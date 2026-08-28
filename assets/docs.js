/* @module docs
   Single responsibility: the first edition's source-document pages — the
   per-document concept graph, the influence measures, and the switch between
   the rendered document and its raw markdown. Every number it shows was
   computed by gen_docs.py at build time; this module only draws.
   NOT SPLIT, on purpose. Its only consumer pages are in the frozen first edition
   (22 pages under v1/docs/), so no second <script src> tag can be added; splitting
   would mean dynamic import() and an async start on a page that is evidence, for no
   benefit to anything anyone still edits. Measured and recorded in the v0.5.17 pass, pass three. */
/* The fifteen source documents, and where each one lands on this site.

   Two graphs live here. On a document's own page, the document is the peak and below
   it hang the concepts measured in its text and the places on this site that rest on
   it. On the hub, all fifteen are drawn at once, joined through the concepts they
   share — which is the only view that shows the corpus's own shape rather than one
   drawn by hand.

   The two kinds of edge are drawn differently on purpose. A dashed edge with a number
   on it was counted mechanically. A solid edge was written down by a person. Nothing
   here pretends the second kind is the first. */
(function () {
  'use strict';
  var one = document.getElementById('docgraph');
  var all = document.getElementById('docsall');
  var hub = document.getElementById('docshub');
  if (!one && !all && !hub) { return; }

  var D = null, cyOne = null, cyAll = null, mode = 'both', sort = 'influence';

  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function strip(t) { return String(t == null ? '' : t).replace(/<[^>]+>/g, ''); }
  function cut(t, n) { t = strip(t); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  function bySlug(s) { return D.docs.filter(function (d) { return d.slug === s; })[0]; }

  var COL = { doc: '#5b4d8f', concept: '#0d5c50', book: '#a06a14', page: '#4a5b6a',
              vault: '#a33a31', layer: '#c98a2b', decision: '#7a8fa6' };

  function style(labelMax) {
    return [
      { selector: 'node', style: {
          'background-color': 'data(col)', label: 'data(label)', shape: 'round-rectangle',
          'text-wrap': 'wrap', 'text-max-width': labelMax || 108,
          'text-valign': 'center', 'text-halign': 'center',
          width: 'label', height: 'label', padding: '7px', 'font-size': 9, 'font-weight': 500,
          color: '#fff', 'border-width': 1, 'border-color': '#fff' } },
      { selector: 'node[kind = "doc"]', style: { 'font-weight': 'bold', 'font-size': 10 } },
      { selector: 'node[peak = 1]', style: { 'border-width': 3, 'border-color': '#c9a227' } },
      { selector: 'node[here = 1]', style: { 'border-width': 4, 'border-color': '#c9a227' } },
      { selector: 'edge', style: {
          width: 1.2, 'line-color': '#cfcabc', 'curve-style': 'bezier',
          'target-arrow-shape': 'triangle', 'target-arrow-color': '#cfcabc', 'arrow-scale': .7,
          label: 'data(label)', 'font-size': 7, color: '#8a8578', 'text-rotation': 'autorotate',
          'text-background-color': '#faf9f5', 'text-background-opacity': .85,
          'text-background-padding': 1 } },
      /* measured: dashed, weighted by the count */
      { selector: 'edge[kind = "measured"]', style: {
          'line-style': 'dashed', 'line-color': '#9cc5be', 'target-arrow-color': '#9cc5be',
          width: 'mapData(n, 1, 30, 1, 4)' } },
      /* authored: solid */
      { selector: 'edge[kind = "authored"]', style: {
          'line-color': '#c9a227', 'target-arrow-color': '#c9a227', width: 1.8 } },
      { selector: 'edge[kind = "onward"]', style: {
          'line-color': '#e4e0d6', 'target-arrow-color': '#e4e0d6', 'line-style': 'dotted' } },
      { selector: '.dim', style: { opacity: .12 } }
    ];
  }

  /* ---- one document ------------------------------------------------------ */
  function egoElements(d) {
    var els = [], seen = {};
    function node(id, label, kind, extra) {
      if (seen[id]) { return; }
      seen[id] = 1;
      var data = { id: id, label: label, kind: kind, col: COL[kind] || '#8a8578' };
      for (var k in extra) { if (extra.hasOwnProperty(k)) { data[k] = extra[k]; } }
      els.push({ data: data });
    }
    var root = 'D:' + d.slug;
    node(root, cut(d.title, 46), 'doc', { here: 1 });
    if (mode !== 'places') {
      d.concepts.forEach(function (h, i) {
        var cid = 'C:' + h.id;
        node(cid, cut(h.label, 34), 'concept', { peak: h.peak ? 1 : 0 });
        els.push({ data: { id: root + '>' + cid, source: root, target: cid,
                           label: h.n + '×', kind: 'measured', n: h.n } });
      });
    }
    if (mode !== 'concepts') {
      d.places.forEach(function (p, i) {
        var pid = 'P:' + d.slug + ':' + i;
        node(pid, cut(p.label, 34), p.kind, {});
        els.push({ data: { id: root + '>' + pid, source: root, target: pid,
                           label: p.kind, kind: 'authored' } });
      });
    }
    return els;
  }

  function drawOne() {
    var d = bySlug(one.getAttribute('data-slug'));
    if (!d || typeof cytoscape !== 'function') { return; }
    var pane = document.getElementById('dgcy');
    if (!pane) { return; }
    if (cyOne) { cyOne.destroy(); }
    cyOne = cytoscape({
      container: pane, elements: egoElements(d), style: style(108),
      layout: { name: 'concentric', animate: false, padding: 22, minNodeSpacing: 26,
                concentric: function (n) { return n.data('kind') === 'doc' ? 10 : 1; },
                levelWidth: function () { return 1; } },
      wheelSensitivity: .2, minZoom: .2, maxZoom: 3
    });
    cyOne.one('layoutstop', function () { cyOne.fit(undefined, 24); });
    setTimeout(function () { if (cyOne) { cyOne.resize(); cyOne.fit(undefined, 24); } }, 80);
  }

  function panelOne() {
    var d = bySlug(one.getAttribute('data-slug'));
    if (!d) { return; }
    var inf = d.influence;
    one.innerHTML =
      '<div class="dgwrap">' +
        '<div class="dgpane">' +
          '<div class="dgh"><b>' + esc(cut(d.title, 40)) + '</b>' +
            '<span><button class="altib' + (mode === 'both' ? ' on' : '') + '" data-m="both">both</button>' +
            '<button class="altib' + (mode === 'concepts' ? ' on' : '') + '" data-m="concepts">measured</button>' +
            '<button class="altib' + (mode === 'places' ? ' on' : '') + '" data-m="places">authored</button>' +
            '<button class="altib" data-fit="1">fit</button></span></div>' +
          '<div id="dgcy"></div>' +
        '</div>' +
        '<div class="dgside">' +
          '<div class="dginf"><b>Influence ' + inf.score + '</b>' +
            '<span class="small dim">rank ' + d.rank + ' of ' + D.totals.docs + '</span>' +
            '<p class="small">' + inf.concepts + ' concepts + 2 &times; ' + inf.places +
            ' places + 3 &times; ' + inf.resolves + ' review asks = <b>' + inf.score + '</b></p></div>' +
          '<h3>Measured in the text</h3>' +
          '<p class="small dim">Counted mechanically. Hover a concept to see the phrases counted.</p>' +
          '<ul class="dgclist">' + d.concepts.map(function (h) {
            return '<li><a href="../altitudes/concepts.html#' + esc(h.id) + '" title="phrases counted: ' +
              esc(h.phrases.join(', ')) + '">' + esc(h.label) + '</a>' +
              (h.peak ? ' <em class="dgpeak">peak</em>' : '') +
              '<span class="dgn">' + h.n + '</span></li>';
          }).join('') + '</ul>' +
          '<h3>Where the site rests on it</h3>' +
          '<p class="small dim">Authored, not derived. Each link says what it is for.</p>' +
          '<ul class="dgplist">' + d.places.map(function (p) {
            return '<li><span class="dgk dgk-' + esc(p.kind) + '">' + esc(p.kind) + '</span> ' +
              '<a href="' + esc(p.href) + '">' + esc(p.label) + '</a>' +
              '<span class="small dim"> &mdash; ' + esc(p.note) + '</span></li>';
          }).join('') + '</ul>' +
          (d.resolves.length ? '<h3>Review asks it resolves</h3><ul class="dgplist">' +
            d.resolves.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>' +
      '</div>';
    drawOne();
  }

  /* ---- all fifteen ------------------------------------------------------- */
  function allElements() {
    var els = [], seen = {}, keep = {};
    (D.common || []).forEach(function (c) { keep[c.id] = c; });
    D.docs.forEach(function (d) {
      els.push({ data: { id: 'D:' + d.slug, label: cut(d.title, 30), kind: 'doc',
                         col: COL.doc, slug: d.slug,
                         peak: d.rank <= 3 ? 1 : 0 } });
    });
    D.docs.forEach(function (d) {
      d.concepts.forEach(function (h) {
        if (!keep[h.id]) { return; }                  /* one-document concepts add no joins */
        if (!seen['C:' + h.id]) {
          seen['C:' + h.id] = 1;
          els.push({ data: { id: 'C:' + h.id, label: cut(h.label, 30), kind: 'concept',
                             col: COL.concept, peak: h.peak ? 1 : 0 } });
        }
        els.push({ data: { id: 'D:' + d.slug + '>C:' + h.id, source: 'D:' + d.slug,
                           target: 'C:' + h.id, label: '', kind: 'measured', n: h.n } });
      });
    });
    return els;
  }

  function drawAll() {
    var pane = document.getElementById('dacy');
    if (!pane || typeof cytoscape !== 'function') { return; }
    var w = pane.clientWidth || 800, h = pane.clientHeight || 620;
    if (cyAll) { cyAll.destroy(); }
    cyAll = cytoscape({
      container: pane, elements: allElements(), style: style(96),
      layout: { name: 'cose', animate: false, idealEdgeLength: 150, nodeRepulsion: 60000,
                nodeOverlap: 26, componentSpacing: 90, gravity: .4, numIter: 4000,
                nodeDimensionsIncludeLabels: true,
                boundingBox: { x1: 0, y1: 0, w: w * 1.4, h: h * 1.4 } },
      wheelSensitivity: .2, minZoom: .15, maxZoom: 3
    });
    cyAll.one('layoutstop', function () { cyAll.fit(undefined, 24); });
    setTimeout(function () { if (cyAll) { cyAll.resize(); cyAll.fit(undefined, 24); } }, 80);
    cyAll.on('tap', 'node', function (e) {
      var d = e.target.data();
      if (d.kind === 'doc') { window.location.href = d.slug + '.html'; }
      else if (d.kind === 'concept') { window.location.href = '../altitudes/concepts.html#' + d.id.slice(2); }
    });
  }

  /* ---- the hub table ----------------------------------------------------- */
  function table() {
    var ds = D.docs.slice();
    if (sort === 'words') { ds.sort(function (a, b) { return b.words - a.words; }); }
    else if (sort === 'alpha') { ds.sort(function (a, b) { return a.title.localeCompare(b.title); }); }
    else { ds.sort(function (a, b) { return a.rank - b.rank; }); }
    var max = Math.max.apply(null, D.docs.map(function (d) { return d.influence.score; }));
    return '<div class="dtabh"><b>' + D.totals.docs + ' documents · ' +
      D.totals.words.toLocaleString() + ' words</b>' +
      '<span><button class="altib' + (sort === 'influence' ? ' on' : '') + '" data-s="influence">by influence</button>' +
      '<button class="altib' + (sort === 'words' ? ' on' : '') + '" data-s="words">by length</button>' +
      '<button class="altib' + (sort === 'alpha' ? ' on' : '') + '" data-s="alpha">A–Z</button></span></div>' +
      '<div class="tablewrap"><table class="dtab"><thead><tr>' +
      '<th>Document</th><th>Influence</th><th>Concepts</th><th>Places</th><th>Asks</th><th>Words</th>' +
      '</tr></thead><tbody>' +
      ds.map(function (d) {
        var i = d.influence;
        return '<tr><td><a href="' + esc(d.slug) + '.html"><b>' + esc(d.title) + '</b></a>' +
          '<br><span class="small dim">' + esc(strip(d.short)) + '</span></td>' +
          '<td class="dscore"><span class="dbar" style="width:' +
            Math.round(100 * i.score / max) + '%"></span><b>' + i.score + '</b></td>' +
          '<td>' + i.concepts + '</td><td>' + i.places + '</td><td>' + i.resolves + '</td>' +
          '<td>' + d.words.toLocaleString() + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small dim">Influence is <code>concepts + 2 × places + 3 × review asks resolved</code>, ' +
      'computed on every build. <b>Concepts</b> is how many of the concept map’s twenty-four are ' +
      'measured in the document’s own words; <b>places</b> is how many pages of this site are ' +
      'recorded as resting on it; <b>asks</b> is how many review items or decisions went looking ' +
      'for this material. Disagree with the ranking by disagreeing with the formula — it is one ' +
      'line, and it is here.</p>';
  }

  function commonList() {
    if (!D.common || !D.common.length) { return ''; }
    var only = D.totals.concepts - D.common.length, n = D.totals.docs;
    var spread = D.common.slice().sort(function (a, b) { return a.concentration - b.concentration; });
    return '<div class="dshared"><h3>The concepts that join these documents</h3>' +
      '<p><b>' + D.common.length + ' of the ' + D.totals.concepts + '</b> concepts measured ' +
      'across the set appear in more than one document; ' + only + ' appear in only one. ' +
      'The joins are what the consolidated graph above is made of.</p>' +
      '<div class="tablewrap"><table class="dtab"><thead><tr><th>Concept</th><th>In</th>' +
      '<th>Mentions</th><th>Concentration</th><th>Carried mostly by</th></tr></thead><tbody>' +
      D.common.slice(0, 10).map(function (c) {
        return '<tr><td><a href="../altitudes/concepts.html#' + esc(c.id) + '">' + esc(c.label) + '</a></td>' +
          '<td>' + c.n + ' / ' + n + '</td><td>' + c.total + '</td>' +
          '<td>' + c.concentration.toFixed(2) + '</td>' +
          '<td class="small">' + c.top.map(function (t) {
            var d = bySlug(t.slug);
            return '<a href="' + esc(t.slug) + '.html">' + esc(cut(d ? d.title : t.slug, 30)) +
              '</a> <span class="dim">' + t.n + '</span>';
          }).join(', ') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small dim"><b>Concentration</b> is the share of a concept\u2019s total mentions ' +
      'sitting in its top three documents, computed on every build. It separates two things a ' +
      'plain count hides: a concept the corpus genuinely distributes, and one that a couple of ' +
      'documents carry while the rest allude to it. The most distributed is <b>' +
      esc(spread[0].label) + '</b> at ' + spread[0].concentration.toFixed(2) + '; most of the ' +
      'rest sit above 0.7, which is a caution about reading the counts as weight.</p></div>';
  }

  function renderHub() {
    hub.innerHTML = table() + commonList();
    if (all) {
      all.innerHTML = '<div class="dgpane dgfull"><div class="dgh">' +
        '<b>all fifteen, joined by the concepts they share</b>' +
        '<span><button class="altib" data-fit="1">fit</button></span></div>' +
        '<div id="dacy"></div>' +
        '<p class="small dim">Every document, and every concept measured in more than one of them. ' +
        'A gold-edged document is one of the three most influential; a gold-edged concept is a ' +
        'computed peak of the concept map. Tap a document to open it.</p></div>';
      drawAll();
    }
  }

  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-m]');
    if (m && one) { mode = m.getAttribute('data-m'); panelOne(); return; }
    var s = e.target.closest('[data-s]');
    if (s && hub) { sort = s.getAttribute('data-s'); renderHub(); return; }
    if (e.target.closest('[data-fit]')) {
      if (cyOne) { cyOne.fit(undefined, 24); }
      if (cyAll) { cyAll.fit(undefined, 24); }
    }
  });

  var base = one || all || hub;
  var up = base === hub || base === all ? 'data/docs.json' : 'data/docs.json';
  fetch(up).then(function (r) { return r.json(); }).then(function (data) {
    D = data;
    if (one) { panelOne(); }
    if (hub) { renderHub(); }
  }).catch(function () {
    var host = one || hub;
    if (host) {
      host.innerHTML = '<p class="dim">The source register did not load. It lives at ' +
        '<a href="data/docs.json">data/docs.json</a>.</p>';
    }
  });
}());
