/* The altitude ladder (altitudes/data/altitudes.json), consumed as columns.

   Clicking a descending phrase does NOT replace the view: it opens the next
   level in a new column beside the current one, so the tree stays on screen.
   Each column can also show its whole level as an index, grouped by that
   level's taxonomy, so any unit is reachable without climbing to it. */
(function () {
  'use strict';
  var host = document.getElementById('ladder');
  if (!host) { return; }

  var D = null,
      trail = [],          // one node id per open column
      idxOpen = {},        // column index -> showing its level index?
      ontOpen = {},        // column index -> showing ontology and taxonomy?
      widths = {},         // column index -> px
      mode = 'evidence';

  var MODES = {
    evidence: { label: 'evidence behind it',
      hint: 'Green where the unit below carries a claim with a named source or a number; amber where it is argued; grey where the graph layer was not lifted for it.' },
    depth: { label: 'how far it descends',
      hint: 'Teal where the unit below descends further; slate where it is a leaf in this pilot and the next stop is the book itself.' },
    class: { label: 'what kind of unit it is',
      hint: 'One hue per taxonomy class of the unit below. The classes are level-dependent, so the same colour means a different thing at a different altitude — which is the point.' }
  };

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmt(t) {
    return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>')
                 .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  function levelOf(n) {
    for (var i = 0; i < D.levels.length; i++) { if (D.levels[i].n === n) { return D.levels[i]; } }
    return null;
  }
  function nodesAt(n) {
    return Object.keys(D.nodes).filter(function (k) { return D.nodes[k].level === n; });
  }
  function classOf(level, id) {
    var t = levelOf(level).taxonomy;
    for (var i = 0; i < t.classes.length; i++) { if (t.classes[i].id === id) { return t.classes[i]; } }
    return null;
  }

  /* colour of a descent link, by what the mode is asking about the target */
  function tone(id) {
    var n = D.nodes[id];
    if (!n) { return 'none'; }
    if (mode === 'evidence') {
      if (!n.claims || !n.claims.length) { return 'unlifted'; }
      var st = n.claims.map(function (c) { return c.state; });
      return st.indexOf('evidenced') > -1 ? 'evidenced'
           : st.indexOf('argued') > -1 ? 'argued' : 'unevidenced';
    }
    if (mode === 'depth') {
      return n.children.length ? 'descends' : (n.book ? 'leaf' : 'none');
    }
    return 'c-' + (n['class'] || 'none');
  }

  /* the ancestor chain, so entering at any level keeps the tree above it */
  function trailTo(id) {
    var t = [id], guard = 0, cur = id;
    while (D.nodes[cur] && D.nodes[cur].parents.length && guard++ < 12) {
      cur = D.nodes[cur].parents[0];
      t.unshift(cur);
    }
    return t;
  }

  function push() {
    var open = Object.keys(idxOpen).filter(function (k) { return idxOpen[k]; });
    history.replaceState(null, '', '?t=' + trail.join(',') + '&c=' + mode +
      (open.length ? '&i=' + open.join(',') : ''));
  }

  /* ------------------------------------------------------------------ rail */
  function rail() {
    var h = ['<div class="altbar">'];
    D.levels.forEach(function (l) {
      var on = trail.some(function (id) { return D.nodes[id].level === l.n; });
      var wpu = l.units ? Math.round(l.words / l.units) : 0;
      var live = l.n < 5;
      h.push('<button class="altlv' + (on ? ' on' : '') + '"' +
             (live ? ' data-level="' + l.n + '"' : ' disabled') + '>' +
             '<b>L' + l.n + '</b><span>' + esc(l.name) + '</span>' +
             '<em>' + l.units + ' unit' + (l.units === 1 ? '' : 's') + ' · ' +
             (l.n === 5 ? '~' : '') + l.words.toLocaleString() + ' words · ' +
             (l.n === 5 ? '~' : '') + wpu.toLocaleString() + ' each</em></button>');
    });
    h.push('</div>');

    h.push('<div class="altmode"><span class="revlbl">Colour the descending links by</span>');
    Object.keys(MODES).forEach(function (m) {
      h.push('<button class="altmb' + (m === mode ? ' on' : '') + '" data-mode="' + m + '">' +
             esc(MODES[m].label) + '</button>');
    });
    h.push('<p class="small dim">' + esc(MODES[mode].hint) + '</p>');
    h.push('<div class="altkey">' + legend() + '</div></div>');
    return h.join('');
  }

  function chip(t, label) { return '<span class="altk t-' + t + '">' + esc(label) + '</span>'; }

  function legend() {
    if (mode === 'evidence') {
      return chip('evidenced', 'evidenced') + chip('argued', 'argued') +
             chip('unevidenced', 'unevidenced') + chip('unlifted', 'graph not lifted');
    }
    if (mode === 'depth') {
      return chip('descends', 'descends further') + chip('leaf', 'leaf in this pilot');
    }
    var seen = {}, out = [];
    D.levels.forEach(function (l) {
      (l.taxonomy.classes || []).forEach(function (c) {
        if (!seen[c.id] && c.members && c.members.length) {
          seen[c.id] = 1;
          out.push('<span class="altk t-c-' + c.id + '" title="' + esc(c.note) + '">' +
                   esc(c.name) + ' <em>L' + l.n + '</em></span>');
        }
      });
    });
    return out.join('');
  }

  /* --------------------------------------------------------------- columns */
  function columnHead(i, lv) {
    return '<header class="altch">' +
      '<b>L' + lv.n + '</b> <span>' + esc(lv.name) + '</span>' +
      '<button class="altib' + (idxOpen[i] ? ' on' : '') + '" data-idx="' + i + '" ' +
      'title="Every unit at this level">' + (idxOpen[i] ? '✕ close index' : '☰ all ' + lv.units) +
      '</button></header>';
  }

  function indexBody(i, lv) {
    var h = ['<div class="altidx">'];
    h.push('<p class="small dim">Every unit at level ' + lv.n +
           ', grouped by this level’s taxonomy. Picking one keeps the units above it in place.</p>');
    var classes = lv.taxonomy.classes || [];
    if (!classes.length) {
      h.push('<p class="small dim">No taxonomy at this level.</p>');
    }
    classes.forEach(function (c) {
      if (!c.members.length) { return; }
      h.push('<div class="altigrp"><h4>' + chip('c-' + c.id, c.name) +
             ' <span class="small dim">' + c.members.length + '</span></h4>');
      h.push('<p class="small dim">' + fmt(c.note) + '</p><ul>');
      c.members.forEach(function (m) {
        h.push('<li><a href="#" data-pick="' + m + '"' +
               (trail[i] === m ? ' class="cur"' : '') + '>' + esc(D.nodes[m].title) + '</a> ' +
               '<span class="small dim">' + D.nodes[m].words + 'w</span></li>');
      });
      h.push('</ul></div>');
    });
    h.push('</div>');
    return h.join('');
  }

  function ontBody(i, lv) {
    var o = lv.ontology, t = lv.taxonomy, h = ['<div class="altont">'];
    h.push('<p class="small dim"><b>Ontology</b> points outward: what types exist here and how they may ' +
           'connect. <b>Taxonomy</b> points upward: what kind of unit this is. Both are per level, and they ' +
           'differ level to level.</p>');
    h.push('<h4>Node types</h4><ul>');
    o.node_types.forEach(function (nt) {
      h.push('<li><b>' + esc(nt.name) + '</b> — ' + fmt(nt.definition) + '</li>');
    });
    h.push('</ul>');
    if (o.edge_types.length) {
      h.push('<h4>Edge types</h4><div class="tablewrap"><table><thead><tr><th>verb</th>' +
             '<th>inverse</th><th>domain → range</th></tr></thead><tbody>');
      o.edge_types.forEach(function (e) {
        h.push('<tr><td><code>' + esc(e.verb) + '</code></td><td><code>' + esc(e.inverse) +
               '</code></td><td>' + esc(e.domain) + ' → ' + esc(e.range) +
               '<br><span class="small dim">' + fmt(e.note) + '</span></td></tr>');
      });
      h.push('</tbody></table></div>');
    }
    h.push('<h4>Taxonomy</h4>');
    if (t.classes.length) {
      h.push('<ul class="alttax"><li><b>' + esc(t.root) + '</b><ul>');
      t.classes.forEach(function (c) {
        h.push('<li>' + chip('c-' + c.id, c.name) + ' <span class="small dim">' +
               c.members.length + ' unit' + (c.members.length === 1 ? '' : 's') + '</span><br>' +
               '<span class="small dim">' + fmt(c.note) + '</span></li>');
      });
      h.push('</ul></li></ul>');
    }
    h.push('<p class="small dim">' + fmt(t.note) + '</p></div>');
    return h.join('');
  }

  function nodeBody(i, id) {
    var n = D.nodes[id], lv = levelOf(n.level), h = [];
    h.push('<div class="altnode">');
    h.push('<h3>' + esc(n.title) + '</h3>');
    h.push('<p class="altmeta">');
    if (n.type) { h.push('<span class="altk t-type">' + esc(n.type) + '</span> '); }
    var c = n['class'] ? classOf(n.level, n['class']) : null;
    if (c && c.name !== n.type) {
      h.push('<span class="altk t-c-' + esc(n['class']) + '" title="' + esc(c.note) + '">' +
             esc(c.name) + '</span> ');
    }
    h.push('<span class="small dim">' + n.words + ' words' +
           (n.children.length ? ' · compresses ' + n.children.length : '') + '</span></p>');

    h.push('<div class="altproj">' + n.segments.map(function (s) {
      if (!s.to) { return fmt(s.t); }
      var t = D.nodes[s.to];
      return '<a class="altseg tone-' + tone(s.to) + '" href="#" data-open="' + s.to +
             '" data-col="' + i + '" title="' + esc(t ? t.title : s.to) + '">' + fmt(s.t) + '</a>';
    }).join('') + '</div>');

    if (n.claims && n.claims.length) {
      h.push('<div class="altgraph"><span class="revlbl">The graph behind this text</span><ul>');
      n.claims.forEach(function (c) {
        h.push('<li class="ac-' + esc(c.state) + '"><span class="acst">' + esc(c.state) + '</span> ' +
               fmt(c.text) + (c.evidence && c.evidence.length ?
                 '<ul class="acev">' + c.evidence.map(function (e) {
                   return '<li>' + fmt(e) + '</li>'; }).join('') + '</ul>' : '') + '</li>');
      });
      h.push('</ul></div>');
    } else {
      h.push('<p class="altnolift small dim">The graph layer was not lifted for this unit in the pilot.</p>');
    }
    if (n.book) {
      h.push('<p class="altbook">↓ <a href="' + esc(n.book) + '">Read it at level 5, in the book</a></p>');
    }
    h.push('<p class="altfoot"><button class="altob' + (ontOpen[i] ? ' on' : '') +
           '" data-ont="' + i + '">' + (ontOpen[i] ? '✕ hide' : '⊞ show') +
           ' this level’s ontology and taxonomy</button></p>');
    if (ontOpen[i]) { h.push(ontBody(i, lv)); }
    h.push('</div>');
    return h.join('');
  }

  function columnHTML(i) {
    var id = trail[i], lv = levelOf(D.nodes[id].level),
        w = widths[i] ? ' style="flex-basis:' + widths[i] + 'px"' : '';
    return '<section class="altcol" data-col="' + i + '"' + w + '>' + columnHead(i, lv) +
           '<div class="altcb">' + (idxOpen[i] ? indexBody(i, lv) : nodeBody(i, id)) + '</div></section>';
  }

  function render() {
    var h = [rail(), '<div class="altcols" id="altcols">'];
    trail.forEach(function (id, i) {
      h.push(columnHTML(i));
      if (i < trail.length - 1) { h.push('<div class="altdrag" data-drag="' + i + '"></div>'); }
    });
    h.push('</div>');
    host.innerHTML = h.join('\n');
    push();
  }

  /* Rebuild only what changed, keep the scroll where it was, and scroll only far
     enough to bring the new column into view. Re-rendering everything and then
     smooth-scrolling to the end made every click flicker the whole strip. */
  function repaintFrom(col) {
    var cols = document.getElementById('altcols');
    if (!cols) { render(); return; }
    var keep = cols.scrollLeft;

    var kids = Array.prototype.slice.call(cols.children), n = -1;
    kids.forEach(function (el) {
      if (el.classList.contains('altcol')) { n++; }
      if (n > col) { el.remove(); }
    });

    for (var i = Math.max(0, col + 1); i < trail.length; i++) {
      if (i > 0) {
        cols.insertAdjacentHTML('beforeend', '<div class="altdrag" data-drag="' + (i - 1) + '"></div>');
      }
      cols.insertAdjacentHTML('beforeend', columnHTML(i));
    }
    cols.scrollLeft = keep;

    var last = cols.querySelector('.altcol:last-of-type');
    if (last) {
      last.classList.add('altnew');
      setTimeout(function () { last.classList.remove('altnew'); }, 700);
      var over = last.offsetLeft + last.offsetWidth - (cols.scrollLeft + cols.clientWidth);
      if (over > 0) { cols.scrollTo({ left: cols.scrollLeft + over + 12, behavior: 'smooth' }); }
    }
    push();
  }

  /* ----------------------------------------------------------- interaction */
  function openFrom(col, id) {
    trail = trail.slice(0, col + 1);
    trail.push(id);
    for (var k in idxOpen) { if (+k > col) { delete idxOpen[k]; } }
    for (var j in ontOpen) { if (+j > col) { delete ontOpen[j]; } }
    repaintFrom(col);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-pick],[data-idx],[data-ont],[data-level],[data-mode],[data-go]');
    if (!t || t.disabled) { return; }
    e.preventDefault();

    if (t.hasAttribute('data-open')) { openFrom(+t.getAttribute('data-col'), t.getAttribute('data-open')); return; }
    if (t.hasAttribute('data-pick') || t.hasAttribute('data-go')) {
      trail = trailTo(t.getAttribute('data-pick') || t.getAttribute('data-go'));
      idxOpen = {}; ontOpen = {}; render();
      host.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    if (t.hasAttribute('data-idx')) {
      var i = +t.getAttribute('data-idx');
      idxOpen[i] = !idxOpen[i]; repaintFrom(i - 1); return;
    }
    if (t.hasAttribute('data-ont')) {
      var j = +t.getAttribute('data-ont');
      ontOpen[j] = !ontOpen[j]; repaintFrom(j - 1); return;
    }
    if (t.hasAttribute('data-mode')) { mode = t.getAttribute('data-mode'); render(); return; }
    if (t.hasAttribute('data-level')) {
      var L = +t.getAttribute('data-level'), at = -1;
      trail.forEach(function (id, k) { if (D.nodes[id].level === L) { at = k; } });
      if (at < 0) { trail = trailTo(nodesAt(L)[0]); at = trail.length - 1; }
      idxOpen = {}; idxOpen[at] = true; ontOpen = {}; render();
    }
  });

  /* resizable columns */
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    var d = e.target.closest('[data-drag]');
    if (!d) { return; }
    var col = d.previousElementSibling;
    drag = { i: +d.getAttribute('data-drag'), x: e.clientX, w: col.getBoundingClientRect().width, el: col };
    d.setPointerCapture(e.pointerId);
    document.body.classList.add('altdragging');
    e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) { return; }
    var w = Math.max(240, Math.min(900, drag.w + (e.clientX - drag.x)));
    widths[drag.i] = Math.round(w);
    drag.el.style.flexBasis = widths[drag.i] + 'px';
  });
  document.addEventListener('pointerup', function () {
    if (!drag) { return; }
    drag = null;
    document.body.classList.remove('altdragging');
  });

  /* -------------------------------------------------------------- findings */
  function checks() {
    var el = document.getElementById('checks-list');
    if (!el || !D.checks) { return; }
    el.innerHTML = D.checks.map(function (c) {
      return '<div class="altchk sv-' + esc(c.severity) + '">' +
        '<h3>' + esc(c.asks) + ' <span class="rstate">' + c.hits.length + ' ' +
        (c.hits.length === 1 ? 'hit' : 'hits') + '</span></h3>' +
        '<p class="chkrule"><span class="revlbl">The rule that ran</span><code>' + esc(c.rule) + '</code></p>' +
        (c.hits.length ? '<ul>' + c.hits.map(function (h) { return '<li>' + fmt(h) + '</li>'; }).join('') + '</ul>'
                       : '<p class="small dim">Nothing matched today. The rule is kept anyway: a check with zero hits is still a check, and it will fire the moment the data changes.</p>') +
        '<p class="small dim">' + fmt(c.reading) + '</p></div>';
    }).join('');
  }

  function findings() {
    var el = document.getElementById('findings-list');
    if (!el) { return; }
    var KIND = { contradiction: 'contradiction', repeat: 'repeated content',
                 'compression-loss': 'compression loss', weight: 'weight mismatch',
                 'cross-estate': 'cross-estate', classification: 'classification', concept: 'the concept layer',
                 control: 'control case' };
    var open = D.findings.filter(function (f) { return f.state === 'open'; }).length;
    el.innerHTML = '<p class="small dim"><b>' + open + ' open</b>, <b>' +
      (D.findings.length - open) + ' accepted</b>. A finding is not automatically a defect: ' +
      'some contradictions are correct in context, and an accepted one carries the reason it ' +
      'was accepted, so the acceptance can be argued with rather than assumed.</p>' +
      D.findings.map(function (f) {
      return '<div class="altfind af-' + esc(f.kind) + ' fs-' + esc(f.state || 'open') + '">' +
        '<h3>' + esc(f.title) + ' <span class="rstate">' + esc(KIND[f.kind] || f.kind) + '</span>' +
        '<span class="rstate ' + (f.state === 'accepted' ? 'rs-agreed' : 'rs-open') + '">' +
        esc(f.state || 'open') + '</span></h3>' +
        '<p>' + fmt(f.detail) + '</p>' +
        '<p class="altverdict"><span class="revlbl">Verdict</span>' + fmt(f.verdict) + '</p>' +
        (f.because ? '<p class="altbecause"><span class="revlbl">' +
          (f.state === 'accepted' ? 'Accepted because' : 'Open because') + '</span>' +
          fmt(f.because) + '</p>' : '') +
        '<p class="small dim">Where: ' + f.where.map(function (w) {
          return '<a href="#" data-go="' + w + '">' + esc(D.nodes[w] ? D.nodes[w].title : w) + '</a>';
        }).join(' · ') + '</p></div>';
    }).join('');
  }

  fetch('data/altitudes.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    findings();
    checks();
    var q = new URLSearchParams(location.search);
    if (MODES[q.get('c')]) { mode = q.get('c'); }
    var t = (q.get('t') || '').split(',').filter(function (x) { return D.nodes[x]; });
    trail = t.length ? t : [D.root];
    (q.get('i') || '').split(',').forEach(function (k) {
      if (k !== '' && +k < trail.length) { idxOpen[+k] = true; }
    });
    render();
  }).catch(function () {
    host.innerHTML = '<p class="small dim">Could not load the ladder data.</p>';
  });
})();
