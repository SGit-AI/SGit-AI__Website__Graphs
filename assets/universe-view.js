/* graphs.sgit.ai — the universe reader.
   One script owns the whole interaction layer of a per-document universe page:
   the resizable right panel (local graph on top, rendered source below), the
   anchor highlights inside the source, the location trail, the anchor stepper,
   the family filters, and the three-way jumps between the extraction tables,
   the graph and the frozen document.

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
  function pref(k, d) { try { var v = localStorage.getItem(LS + k); return v === null ? d : v; } catch (e) { return d; } }
  function setPref(k, v) { try { localStorage.setItem(LS + k, String(v)); } catch (e) {} }
  function prefBool(k, d) { var v = pref(k, d ? '1' : '0'); return v === '1' || v === 'true'; }

  var KINDS = [
    ['concept', 'dictionary'], ['claim', 'claims'], ['hypothesis', 'hypotheses'],
    ['objective', 'objectives'], ['example', 'examples'], ['edge', 'relations'],
    ['nbn', 'near-but-nots'], ['alias', 'also-called'],
  ];
  var kindOf = {};
  U.anchors.forEach(function (a) { kindOf[a.aid] = a.kind; });

  /* ---------------- state -------------------------------------------------- */
  var cy = null, inlineBox = null;
  var panelOn = prefBool('panel', true);
  var graphOn = prefBool('graph', true);
  var scrollMode = pref('scroll', 'instant');            /* instant | fast | smooth */
  var enabledKinds;
  try { enabledKinds = JSON.parse(pref('kinds', 'null')) || []; } catch (e) { enabledKinds = []; }

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
    '<div class="uni-graphbox">' +
    '  <button class="uni-gcog" title="Graph options">&#9881;</button>' +
    '  <div class="uni-gopts" hidden>' +
    '    <span>layout</span>' +
    '    <button data-glay="cose">cose</button><button data-glay="concentric">rings</button><button data-glay="grid">grid</button>' +
    '    <button data-glabels="1">labels</button>' +
    '    <button data-gfit="1">fit</button>' +
    '    <button data-gclear="1">clear focus</button>' +
    '  </div>' +
    '  <div class="uni-cy" id="uni-cy"></div>' +
    '</div>' +
    '<div class="uni-hsplit" title="Drag to resize"></div>' +
    '<div class="uni-srcbox">' +
    '  <div class="uni-srchead">' +
    '    <b>The frozen source</b>' +
    '    <span class="uni-step">' +
    '      <button id="uni-prev" title="Previous highlighted anchor">&#8249;</button>' +
    '      <span class="cnt" id="uni-cnt">&ndash;</span>' +
    '      <button id="uni-next" title="Next highlighted anchor">&#8250;</button>' +
    '    </span>' +
    '    <a class="dim" href="' + U.source + '">raw</a>' +
    '    <div class="uni-trail" id="uni-trail"><span class="dim">every highlight sits on gate-verified bytes</span></div>' +
    '  </div>' +
    '  <div class="uni-srcbody mdread" id="uni-src"><p class="dim">Loading the frozen source…</p></div>' +
    '</div>';
  layout.appendChild(panel);
  main.appendChild(layout);

  /* toolbar, placed after the docmeta block */
  var tools = document.createElement('div');
  tools.className = 'uni-tools';
  tools.innerHTML =
    '<button id="uni-tglpanel" class="uni-wide-only" aria-pressed="false">&#9707; side panel</button>' +
    '<span class="uni-optwrap"><button id="uni-tglopts" aria-pressed="false">&#9881; reader options</button>' +
    '<div class="uni-opts" id="uni-opts" hidden>' +
    '  <h5>Scrolling</h5>' +
    '  <label><input type="radio" name="uni-scroll" value="instant"> immediate</label>' +
    '  <label><input type="radio" name="uni-scroll" value="fast"> fast</label>' +
    '  <label><input type="radio" name="uni-scroll" value="smooth"> smooth</label>' +
    '  <h5>Highlight in the source <span class="uni-quick" id="uni-kall">all</span><span class="uni-quick" id="uni-knone">none</span></h5>' +
    '  <span id="uni-kboxes">' + KINDS.map(function (k) {
        return '<label><input type="checkbox" data-kind="' + k[0] + '"> ' + k[1] + '</label>';
      }).join('') + '</span>' +
    '  <h5>Panel</h5>' +
    '  <label><input type="checkbox" id="uni-graphchk"> show the graph</label>' +
    '</div></span>' +
    '<button id="uni-clear" title="Clear the selected node everywhere" hidden>&#10005; clear selection</button>' +
    '<span class="dim" id="uni-status"></span>';
  var meta = left.querySelector('.docmeta');
  (meta || left.firstChild).insertAdjacentElement('afterend', tools);

  var optsBox = document.getElementById('uni-opts');
  document.getElementById('uni-tglopts').addEventListener('click', function () {
    optsBox.hidden = !optsBox.hidden;
    this.setAttribute('aria-pressed', String(!optsBox.hidden));
  });
  document.addEventListener('click', function (e) {
    if (!optsBox.hidden && !e.target.closest('.uni-optwrap')) optsBox.hidden = true;
  });

  /* ---------------- scrolling, in the user's chosen tempo ------------------- */
  function setScroll(container, y, behavior) {
    /* site.css declares html{scroll-behavior:smooth}, which turns a plain
       window.scrollTo into a slow glide and lets successive jumps interrupt
       each other mid-flight — the drifting-pane bug. behavior:'instant'
       overrides the CSS, so a jump is a jump. */
    if (container === window) window.scrollTo({ top: y, left: 0, behavior: behavior });
    else container.scrollTo({ top: y, behavior: behavior });
  }
  function animateScroll(container, top, ms) {
    var from = container === window ? window.scrollY : container.scrollTop;
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / ms);
      var eased = 1 - Math.pow(1 - p, 3);
      setScroll(container, from + (top - from) * eased, 'instant');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function scrollToEl(el, container) {
    var isWin = container === window;
    var r = el.getBoundingClientRect();
    var top;
    if (isWin) top = r.top + window.scrollY - window.innerHeight / 2;
    else {
      var cr = container.getBoundingClientRect();
      top = container.scrollTop + (r.top - cr.top) - container.clientHeight / 2;
    }
    top = Math.max(0, top);
    if (scrollMode === 'instant') setScroll(container, top, 'instant');
    else if (scrollMode === 'fast') animateScroll(container, top, 140);
    else setScroll(container, top, 'smooth');
  }

  /* ---------------- state application --------------------------------------- */
  function applyState() {
    document.body.classList.toggle('uni-panel-on', panelOn && WIDE.matches);
    document.body.classList.toggle('uni-graph-off', !graphOn);
    document.getElementById('uni-tglpanel').setAttribute('aria-pressed', String(panelOn));
    tools.querySelectorAll('input[name="uni-scroll"]').forEach(function (r) { r.checked = r.value === scrollMode; });
    tools.querySelectorAll('input[data-kind]').forEach(function (c) { c.checked = enabledKinds.indexOf(c.getAttribute('data-kind')) !== -1; });
    document.getElementById('uni-graphchk').checked = graphOn;
    /* the graph follows the visible home: the panel when it shows, inline otherwise */
    inlineBox = inlineBox || document.getElementById('unigraph-inline');
    if (inlineBox) inlineBox.style.display = (graphOn && !(panelOn && WIDE.matches)) ? '' : 'none';
    if (cy && graphOn) {
      var target = (panelOn && WIDE.matches) ? document.getElementById('uni-cy') : inlineBox;
      if (target && cy.container() !== target) cy.mount(target);
      requestAnimationFrame(function () { cy.resize(); });
    }
    applyKinds();
  }
  document.getElementById('uni-tglpanel').addEventListener('click', function () {
    panelOn = !panelOn; setPref('panel', panelOn ? 1 : 0); applyState();
  });
  document.getElementById('uni-graphchk').addEventListener('change', function () {
    graphOn = this.checked; setPref('graph', graphOn ? 1 : 0); applyState();
  });
  tools.addEventListener('change', function (e) {
    if (e.target.name === 'uni-scroll') { scrollMode = e.target.value; setPref('scroll', scrollMode); }
    if (e.target.hasAttribute && e.target.hasAttribute('data-kind')) {
      var k = e.target.getAttribute('data-kind');
      var i = enabledKinds.indexOf(k);
      if (e.target.checked && i === -1) enabledKinds.push(k);
      if (!e.target.checked && i !== -1) enabledKinds.splice(i, 1);
      setPref('kinds', JSON.stringify(enabledKinds)); applyState();
    }
  });
  document.getElementById('uni-kall').addEventListener('click', function () {
    enabledKinds = KINDS.map(function (k) { return k[0]; });
    setPref('kinds', JSON.stringify(enabledKinds)); applyState();
  });
  document.getElementById('uni-knone').addEventListener('click', function () {
    enabledKinds = []; setPref('kinds', JSON.stringify(enabledKinds)); applyState();
  });

  /* ---------------- resizers (sizes remembered) ------------------------------ */
  var pw = pref('panelw', ''); if (pw) panel.style.flexBasis = pw;
  var gh = pref('graphh', '');
  var graphbox = panel.querySelector('.uni-graphbox');
  if (gh) graphbox.style.flexBasis = gh;
  function dragger(el, apply, done) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); el.classList.add('drag'); el.setPointerCapture(e.pointerId);
      function move(ev) { apply(ev); if (cy) cy.resize(); }
      function up() {
        el.classList.remove('drag'); done();
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
      }
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    });
  }
  dragger(vsplit, function (ev) {
    var r = layout.getBoundingClientRect();
    var frac = Math.min(.64, Math.max(.22, (r.right - ev.clientX) / r.width));
    panel.style.flexBasis = (frac * 100) + '%';
  }, function () { setPref('panelw', panel.style.flexBasis); });
  dragger(panel.querySelector('.uni-hsplit'), function (ev) {
    var r = panel.getBoundingClientRect();
    var frac = Math.min(.8, Math.max(.12, (ev.clientY - r.top) / r.height));
    graphbox.style.flexBasis = (frac * 100) + '%';
  }, function () { setPref('graphh', graphbox.style.flexBasis); });

  /* ---------------- the graph ------------------------------------------------ */
  var showLabels = true;
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
      { selector: 'edge[kind = "demonstrates"]', style: { 'line-style': 'dashed' } },
      { selector: '.uni-nolabel', style: { 'label': '' } },
      { selector: 'node.uni-focus', style: { 'border-width': 4, 'border-color': '#c9a227',
        'width': 28, 'height': 28, 'font-weight': 'bold', 'color': '#111' } },
      { selector: '.uni-dim', style: { 'opacity': .15 } }
    ]
  });

  function focusNode(id) {
    if (!cy) return;
    var node = cy.$id(id);
    cy.elements().removeClass('uni-focus uni-dim');
    if (node.empty()) return;
    cy.elements().addClass('uni-dim');
    node.closedNeighborhood().removeClass('uni-dim');
    node.addClass('uni-focus');
    if (graphOn) cy.animate({ center: { eles: node } },
      { duration: scrollMode === 'smooth' ? 350 : scrollMode === 'fast' ? 140 : 0 });
  }

  var gopts = panel.querySelector('.uni-gopts');
  panel.querySelector('.uni-gcog').addEventListener('click', function () { gopts.hidden = !gopts.hidden; });
  gopts.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-glay')) {
      var name = b.getAttribute('data-glay');
      gopts.querySelectorAll('[data-glay]').forEach(function (x) { x.classList.toggle('on', x === b); });
      cy.layout(name === 'cose'
        ? { name: 'cose', animate: false, nodeRepulsion: 90000, idealEdgeLength: 90, padding: 24 }
        : name === 'concentric'
          ? { name: 'concentric', animate: false, padding: 24, minNodeSpacing: 22,
              concentric: function (n) { return n.data('family') === 'concept' ? 3 : n.data('family') === 'claim' ? 2 : 1; },
              levelWidth: function () { return 1; } }
          : { name: 'grid', animate: false, padding: 24 }).run();
    }
    if (b.hasAttribute('data-glabels')) {
      showLabels = !showLabels; b.classList.toggle('on', !showLabels);
      cy.nodes().toggleClass('uni-nolabel', !showLabels);
    }
    if (b.hasAttribute('data-gfit')) cy.fit(undefined, 24);
    if (b.hasAttribute('data-gclear')) clearSelection();
  });

  /* ---------------- jump helpers -------------------------------------------- */
  function flashRow(rowId, scroll) {
    var el = document.getElementById(rowId);
    if (!el) return;
    if (scroll !== false) scrollToEl(el, window);
    el.classList.remove('uni-hit'); void el.offsetWidth; el.classList.add('uni-hit');
  }
  var srcBody = document.getElementById('uni-src');
  var srcBox = panel.querySelector('.uni-srcbox');
  function flashSource(aid) {
    if (!panelOn) { panelOn = true; setPref('panel', 1); applyState(); }
    var marks = srcBody.querySelectorAll('mark.uni-anchor[data-aids~="' + aid + '"]');
    if (!marks.length) return;
    scrollToEl(marks[0], srcBox);
    marks.forEach(function (m) { m.classList.remove('uni-hit'); void m.offsetWidth; m.classList.add('uni-hit'); });
    updateTrail();
  }

  /* the selection is PERSISTENT: it stays on the row, the source marks and the
     graph node until the same thing is clicked again or the clear control is
     used. A second click on the selected thing deselects it everywhere. */
  var selected = null;
  var clearBtn = document.getElementById('uni-clear');
  function clearSelection() {
    selected = null;
    document.querySelectorAll('.uni-sel').forEach(function (el) { el.classList.remove('uni-sel'); });
    if (cy) cy.elements().removeClass('uni-focus uni-dim');
    clearBtn.hidden = true;
  }
  clearBtn.addEventListener('click', clearSelection);
  function select(aid, opts) {
    opts = opts || {};
    if (selected === aid && !opts.force) { clearSelection(); return; }
    clearSelection();
    selected = aid;
    clearBtn.hidden = false;
    var a = null;
    for (var i = 0; i < U.anchors.length; i++) if (U.anchors[i].aid === aid) { a = U.anchors[i]; break; }
    if (a) {
      var row = document.getElementById(a.row);
      if (row) { row.classList.add('uni-sel'); flashRow(a.row, opts.scrollLeft !== false); }
      flashSource(aid);
      srcBody.querySelectorAll('mark.uni-anchor[data-aids~="' + aid + '"]').forEach(function (m) { m.classList.add('uni-sel'); });
    }
    if (cy.$id(aid).nonempty()) focusNode(aid);
  }

  cy.on('tap', 'node', function (evt) {
    select(evt.target.id());
  });
  cy.on('tap', function (evt) {
    if (evt.target === cy && selected !== null) return;   /* background tap keeps the selection */
  });

  left.addEventListener('click', function (e) {
    var go = e.target.closest('.anchgo');
    if (go) select(go.getAttribute('data-aid'), { scrollLeft: false });
  });

  /* ---------------- family filter and the stepper ---------------------------- */
  var navList = [], navIdx = -1;
  function applyKinds() {
    if (!srcBody.querySelector('mark.uni-anchor')) return;
    var on = {};
    enabledKinds.forEach(function (k) { on[k] = true; });
    srcBody.querySelectorAll('mark.uni-anchor').forEach(function (m) {
      var vis = m.getAttribute('data-aids').split(' ').some(function (aid) { return on[kindOf[aid]]; });
      m.classList.toggle('uni-vis', vis);
    });
    navList = U.anchors.filter(function (a) { return on[a.kind]; })
                       .sort(function (a, b) { return a.chars[0] - b.chars[0]; });
    navIdx = -1;
    updateCounter();
  }
  function updateCounter() {
    document.getElementById('uni-cnt').textContent =
      navList.length ? ((navIdx >= 0 ? navIdx + 1 : '–') + ' / ' + navList.length) : '–';
  }
  function stepTo(i) {
    if (!navList.length) return;
    navIdx = (i + navList.length) % navList.length;
    var a = navList[navIdx];
    select(a.aid, { force: true, scrollLeft: false });
    updateCounter();
  }
  document.getElementById('uni-prev').addEventListener('click', function () { stepTo(navIdx - 1); });
  document.getElementById('uni-next').addEventListener('click', function () { stepTo(navIdx <= -1 ? 0 : navIdx + 1); });

  /* ---------------- the location trail --------------------------------------- */
  var heads = [];
  function buildHeads() {
    heads = Array.prototype.slice.call(srcBody.querySelectorAll('h1,h2,h3,h4')).map(function (h) {
      return { el: h, level: +h.tagName[1] };
    });
  }
  var trailBox = document.getElementById('uni-trail');
  function updateTrail() {
    if (!heads.length) return;
    var boxTop = srcBox.getBoundingClientRect().top + 70;
    var cur = null;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].el.getBoundingClientRect().top <= boxTop) cur = i; else break;
    }
    trailBox.innerHTML = '';
    if (cur === null) { trailBox.innerHTML = '<span class="dim">top of the document</span>'; return; }
    var chain = [heads[cur]];
    var need = heads[cur].level - 1;
    for (var j = cur - 1; j >= 0 && need >= 1; j--) {
      if (heads[j].level === need) { chain.unshift(heads[j]); need--; }
    }
    chain.forEach(function (h, k) {
      if (k) { var sep = document.createElement('span'); sep.className = 'crumbsep'; sep.textContent = '›'; trailBox.appendChild(sep); }
      var a = document.createElement('a');
      a.textContent = h.el.textContent;
      a.addEventListener('click', function () { scrollToEl(h.el, srcBox); });
      trailBox.appendChild(a);
    });
  }
  var trailPending = false;
  srcBox.addEventListener('scroll', function () {
    if (trailPending) return;
    trailPending = true;
    requestAnimationFrame(function () { trailPending = false; updateTrail(); });
  });

  /* ---------------- the source pane: verified bytes to highlights ------------ */
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
      md += dec.decode(raw.subarray(prev, g.s)) + '⟦S' + i + '⟧' +
            dec.decode(raw.subarray(g.s, g.e)) + '⟦E' + i + '⟧';
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
      if (m[1] !== undefined) {
        if (openSeg !== null) out.push('</mark>', m[1], openTagFor(openSeg));
        else out.push(m[1]);
      } else if (m[2] === 'S') {
        openSeg = +m[3];
        out.push(openTagFor(openSeg));
      } else {
        out.push('</mark>');
        openSeg = null;
      }
    }
    out.push(html.slice(pos));
    srcBody.innerHTML = out.join('').replace(/<mark[^>]*><\/mark>/g, '');

    buildHeads();
    updateTrail();
    applyKinds();
    document.getElementById('uni-status').textContent =
      U.anchors.length + ' anchors · ' + segs.length + ' verified spans in the source';

    /* clicking a highlight jumps the extraction to its row, and lights the graph */
    srcBody.addEventListener('click', function (e) {
      var mk = e.target.closest('mark.uni-anchor');
      if (!mk) return;
      select(mk.getAttribute('data-aids').split(' ')[0]);
    });

    /* arriving with #n-<id> in the URL lights both sides */
    if (location.hash && location.hash.indexOf('#n-') === 0) {
      var id = location.hash.slice(3);
      if (U.anchors.some(function (a) { return a.aid === id; })) select(id, { force: true });
    }
  }).catch(function () {
    srcBody.innerHTML = '<p class="dim">Could not load the frozen source in-page — ' +
      '<a href="' + U.source + '">open the raw markdown</a> instead.</p>';
  });

  WIDE.addEventListener('change', applyState);
  applyState();
})();
