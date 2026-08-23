/* The decisions register, drawn as graphs.

   Each open decision is the peak of its own small graph: below it hang the options,
   below each option the side effect that comes with it, and out to the sides the work
   it blocks, the pages it touches, and the other decisions it should be answered with.
   The peak is where you enter; everything else is one hop away.

   Answers are held in this browser (localStorage) and never sent anywhere. The point of
   holding them is the copy block at the bottom: a plain-text form of what you decided
   and why, which can be pasted straight back into the conversation that produced the
   questions. The register on disk stays the record; this page is the desk it is
   answered at. */
(function () {
  'use strict';
  var host = document.getElementById('decisions');
  if (!host) { return; }

  var KEY = 'graphs.sgit.ai:decisions:v1';
  var D = null, cur = null, cy = null, mode = 'open', wide = false;

  /* ---- store ------------------------------------------------------------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); return true; }
    catch (e) { return false; }
  }
  function mine(id) { return load()[id] || null; }

  /* ---- text -------------------------------------------------------------- */
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(t) {
    return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function plain(t) { return String(t == null ? '' : t).replace(/\*\*/g, '').replace(/`/g, ''); }
  function byId(id) { return D.decisions.filter(function (d) { return d.id === id; })[0]; }
  function shorten(t, n) { t = plain(t); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  function sharedWith(key, id) {
    var v = (D.shared || []).filter(function (x) { return x.key === key; })[0];
    return v ? v.decisions.filter(function (x) { return x !== id; }) : [];
  }

  /* ---- the graph for one decision ---------------------------------------- */
  var COL = {
    decision: '#5b4d8f', option: '#0d5c50', effect: '#c98a2b',
    work: '#a33a31', touch: '#7a8fa6', other: '#8a8578'
  };

  function elements(d) {
    var els = [], seen = {};
    function node(id, label, kind, extra) {
      if (seen[id]) { return id; }
      seen[id] = 1;
      var data = { id: id, label: label, kind: kind, col: COL[kind] || COL.other };
      for (var k in extra) { if (extra.hasOwnProperty(k)) { data[k] = extra[k]; } }
      els.push({ data: data });
      return id;
    }
    function edge(s, t, verb, kind) {
      els.push({ data: { id: s + '>' + t + '>' + verb, source: s, target: t, label: verb, kind: kind || verb } });
    }

    var root = 'D:' + d.id;
    node(root, d.id + ' · ' + shorten(d.short, 34), 'decision', { peak: 1, ref: d.id });

    (d.options || []).forEach(function (o, i) {
      var oid = 'O:' + d.id + ':' + i;
      node(oid, shorten(o.label, 34), 'option', { rec: o.recommended ? 1 : 0, idx: i, ref: d.id });
      edge(root, oid, 'offers', 'offers');
      if (o.cost) {
        var eid = 'E:' + d.id + ':' + i;
        node(eid, shorten(o.cost, 74), 'effect', {});
        edge(oid, eid, 'costs', 'costs');
      }
    });
    (d.blocks || []).forEach(function (b, i) {
      var bid = 'B:' + d.id + ':' + i, also = sharedWith(b.key, d.id);
      node(bid, shorten(b.label, 34), 'work', { shared: also.length ? 1 : 0 });
      edge(root, bid, 'blocks', 'blocks');
      /* the same work, named differently by another decision: show that decision here,
         because it is the reason this one cannot be answered alone */
      also.forEach(function (o) {
        var x = byId(o);
        if (!x) { return; }
        node('D:' + o, o + ' · ' + shorten(x.short, 30), 'decision', { ref: o });
        edge('D:' + o, bid, 'blocks', 'blocks');
      });
    });
    (d.affects || []).forEach(function (a, i) {
      var aid = 'A:' + d.id + ':' + i;
      node(aid, shorten(a.label, 34), 'touch', { href: a.href || '' });
      edge(root, aid, 'touches', 'touches');
    });
    (d.answer_with || []).forEach(function (oid) {
      var o = byId(oid);
      if (!o) { return; }
      var nid = 'D:' + o.id;
      node(nid, o.id + ' · ' + shorten(o.short, 30), 'decision', { ref: o.id });
      edge(root, nid, 'answer with', 'pair');
    });
    return els;
  }

  /* every decision at once, so the couplings between them are visible */
  function allElements() {
    var els = [], seen = {};
    D.decisions.forEach(function (d) {
      var id = 'D:' + d.id;
      seen[id] = 1;
      els.push({ data: { id: id, label: d.id + ' · ' + shorten(d.short, 28), kind: 'decision',
                         col: d.state === 'open' ? COL.decision : '#9cc5be', peak: d.state === 'open' ? 1 : 0, ref: d.id } });
    });
    D.decisions.forEach(function (d) {
      (d.blocks || []).forEach(function (b) {
        var bid = 'B:' + b.key, many = sharedWith(b.key, d.id).length;
        if (!seen[bid]) {
          seen[bid] = 1;
          els.push({ data: { id: bid, label: shorten(b.work, 32), kind: 'work', col: COL.work, shared: many ? 1 : 0 } });
        }
        els.push({ data: { id: 'D:' + d.id + '>' + bid, source: 'D:' + d.id, target: bid,
                           label: shorten(b.label, 30), kind: 'blocks' } });
      });
      (d.answer_with || []).forEach(function (o) {
        if (!seen['D:' + o]) { return; }
        els.push({ data: { id: 'D:' + d.id + '>pair>' + o, source: 'D:' + d.id, target: 'D:' + o, label: 'answer with', kind: 'pair' } });
      });
    });
    return els;
  }

  function style() {
    return [
      { selector: 'node', style: {
          'background-color': 'data(col)', label: 'data(label)', shape: 'round-rectangle',
          'text-wrap': 'wrap', 'text-max-width': 104, 'text-valign': 'center', 'text-halign': 'center',
          width: 'label', height: 'label', padding: '7px', 'font-size': 9, 'font-weight': 500,
          color: '#fff', 'border-width': 1, 'border-color': '#fff' } },
      { selector: 'node[kind = "decision"]', style: { 'font-weight': 'bold', 'font-size': 10 } },
      { selector: 'node[peak = 1]', style: { 'border-width': 3, 'border-color': '#c9a227' } },
      { selector: 'node[rec = 1]', style: { 'border-width': 2, 'border-color': '#c9a227' } },
      { selector: 'node[shared = 1]', style: { 'border-width': 3, 'border-color': '#c9a227' } },
      { selector: 'node[kind = "effect"]', style: { 'font-size': 8, 'text-max-width': 150, color: '#3a3b40' } },
      { selector: 'node[kind = "touch"]', style: { 'font-size': 8 } },
      { selector: 'edge', style: {
          width: 1.2, 'line-color': '#cfcabc', 'curve-style': 'bezier',
          'target-arrow-shape': 'triangle', 'target-arrow-color': '#cfcabc', 'arrow-scale': .7,
          label: 'data(label)', 'font-size': 7, color: '#8a8578', 'text-rotation': 'autorotate',
          'text-background-color': '#faf9f5', 'text-background-opacity': .85, 'text-background-padding': 1 } },
      { selector: 'edge[kind = "offers"]', style: { width: 2, 'line-color': '#9cc5be', 'target-arrow-color': '#9cc5be' } },
      { selector: 'edge[kind = "costs"]', style: { 'line-color': '#e0c08a', 'target-arrow-color': '#e0c08a', 'line-style': 'dashed' } },
      { selector: 'edge[kind = "blocks"]', style: { 'line-color': '#d6a49f', 'target-arrow-color': '#d6a49f', 'line-style': 'dotted', width: 1.6 } },
      { selector: 'edge[kind = "pair"]', style: { 'line-color': '#5b4d8f', 'target-arrow-color': '#5b4d8f', 'source-arrow-shape': 'triangle', 'source-arrow-color': '#5b4d8f' } },
      { selector: '.chosen', style: { 'border-width': 4, 'border-color': '#0d5c50', 'z-index': 99 } }
    ];
  }

  /* A deliberate layout beats a generic one at this size: the peak on top, the options
     down the left with the cost of each one beside it, the blocked work and the touched
     pages below. Positions are abstract; cytoscape's fit does the scaling. */
  function positions(d) {
    var L = 0, R = 360, C = 180, pos = {}, y = 130, i;
    pos['D:' + d.id] = { x: C, y: 0 };
    for (i = 0; i < (d.options || []).length; i++) {
      pos['O:' + d.id + ':' + i] = { x: L, y: y };
      if (d.options[i].cost) { pos['E:' + d.id + ':' + i] = { x: R, y: y }; }
      y += 105;
    }
    y += 30;
    var yb = y;
    for (i = 0; i < (d.blocks || []).length; i++) {
      pos['B:' + d.id + ':' + i] = { x: L, y: yb + i * 80 };
      /* a decision that blocks the same work sits beside that work, out to the left */
      sharedWith(d.blocks[i].key, d.id).forEach(function (o, k) {
        pos['D:' + o] = { x: L - 260, y: yb + i * 80 + k * 70 };
      });
    }
    var yt = y;
    for (i = 0; i < (d.affects || []).length; i++) { pos['A:' + d.id + ':' + i] = { x: R, y: yt + i * 80 }; }
    y = Math.max(yb + Math.max(0, (d.blocks || []).length - 1) * 80,
                 yt + Math.max(0, (d.affects || []).length - 1) * 80) + 90;
    (d.answer_with || []).forEach(function (o, k) { pos['D:' + o] = { x: C, y: y + k * 80 }; });
    return pos;
  }

  function draw() {
    var el = document.getElementById('dcy');
    if (!el || typeof cytoscape !== 'function') { return; }
    var els = mode === 'all' ? allElements() : (cur ? elements(cur) : []);
    var w = el.clientWidth || 700, h = el.clientHeight || 460;
    if (cy) { cy.destroy(); cy = null; }
    cy = cytoscape({
      container: el, elements: els, style: style(),
      layout: mode === 'all'
        ? { name: 'cose', animate: false, idealEdgeLength: wide ? 190 : 150, nodeRepulsion: wide ? 90000 : 42000,
            nodeOverlap: 28, componentSpacing: 90, gravity: .35, numIter: 4000,
            nodeDimensionsIncludeLabels: true, coolingFactor: .97,
            boundingBox: { x1: 0, y1: 0, w: w * 1.5, h: h * 1.5 } }
        : { name: 'preset', positions: cur ? positions(cur) : {}, fit: true, padding: 20, animate: false },
      wheelSensitivity: .2, minZoom: .15, maxZoom: 3
    });
    cy.one('layoutstop', function () { cy.fit(undefined, 26); });
    setTimeout(function () { if (cy) { cy.resize(); cy.fit(undefined, 26); } }, 80);
    cy.on('tap', 'node', function (e) {
      var d = e.target.data();
      if (d.kind === 'option' && d.ref === (cur && cur.id)) { pick(d.idx); }
      else if (d.kind === 'decision' && d.ref && d.ref !== (cur && cur.id)) { go(d.ref); }
      else if (d.kind === 'touch' && d.href) { window.location.href = d.href; }
    });
    markChosen();
  }

  function markChosen() {
    if (!cy || mode === 'all' || !cur) { return; }
    cy.$('.chosen').removeClass('chosen');
    var m = mine(cur.id);
    if (m && typeof m.idx === 'number' && m.idx >= 0) { cy.getElementById('O:' + cur.id + ':' + m.idx).addClass('chosen'); }
  }

  /* ---- the list ---------------------------------------------------------- */
  function list() {
    var s = load();
    var open = D.decisions.filter(function (d) { return d.state === 'open'; });
    var done = D.decisions.filter(function (d) { return d.state !== 'open'; });
    function row(d) {
      var m = s[d.id], state = d.state === 'open' ? (m ? 'drafted' : 'open') : d.state;
      return '<a class="ditem' + (cur && cur.id === d.id ? ' cur' : '') + '" href="#' + d.id + '" data-d="' + d.id + '">' +
        '<b>' + esc(d.id) + '</b> <em class="dst dst-' + state + '">' + state + '</em>' +
        '<span>' + esc(d.short) + '</span></a>';
    }
    return '<div class="dlist">' +
      '<div class="dlhead"><b>' + open.length + ' open</b><span>' + done.length + ' already answered</span></div>' +
      open.map(row).join('') +
      '<div class="dlhead dlhead2"><b>answered</b><span>in the register</span></div>' +
      done.map(row).join('') +
      '</div>';
  }

  /* ---- the panel --------------------------------------------------------- */
  function optionRows(d) {
    if (!d.options || !d.options.length) { return ''; }
    var m = mine(d.id);
    return '<div class="dopts">' + d.options.map(function (o, i) {
      var on = m && m.idx === i;
      return '<label class="dopt' + (on ? ' on' : '') + (o.recommended ? ' rec' : '') + '">' +
        '<input type="radio" name="dopt" value="' + i + '"' + (on ? ' checked' : '') + '>' +
        '<span class="dol"><b>' + fmt(o.label) + '</b>' + (o.recommended ? ' <em class="drec">proposed</em>' : '') + '</span>' +
        '<span class="dodoes">' + fmt(o.does) + '</span>' +
        (o.cost ? '<span class="docost"><i>side effect</i> ' + fmt(o.cost) + '</span>' : '') +
        '</label>';
    }).join('') +
    ['defer', 'more data'].map(function (kind, k) {
      var idx = -1 - k, on = m && m.idx === idx;
      return '<label class="dopt dalt' + (on ? ' on' : '') + '">' +
        '<input type="radio" name="dopt" value="' + idx + '"' + (on ? ' checked' : '') + '>' +
        '<span class="dol"><b>' + (kind === 'defer' ? 'Defer this' : 'Ask for more data') + '</b></span>' +
        '<span class="dodoes">' + (kind === 'defer'
          ? 'Not now, and the reason below says until when or until what.'
          : 'The question is not answerable yet; the note below says what would make it answerable.') +
        '</span><span class="docost"><i>side effect</i> ' +
        esc(kind === 'defer' ? 'everything listed under “this blocks” stays where it is, on the record rather than by silence.'
                             : 'the work of getting that data moves ahead of the decision.') + '</span></label>';
    }).join('') + '</div>';
  }

  function panel(d) {
    var h = [], m = mine(d.id);
    h.push('<article class="dpanel" id="' + esc(d.id) + '">');
    h.push('<div class="dph"><span class="dpid">' + esc(d.id) + '</span>' +
           '<h2>' + esc(d.short) + '</h2>' +
           '<p class="small dim">Raised in <a href="' + esc(d.href) + '">' + esc(d.review_title) +
           '</a>, item ' + d.item + '. <span class="dst dst-' + esc(d.state) + '">' + esc(d.state) + '</span></p></div>');
    h.push('<div class="dq">' + fmt(d.question) + '</div>');
    if (d.why) { h.push('<p class="dwhy"><b>Why it matters.</b> ' + fmt(d.why) + '</p>'); }

    if (d.state === 'open') {
      h.push('<h3>The answers on the table</h3>');
      h.push(optionRows(d));
      h.push('<div class="dform">' +
        '<label class="dnote"><b>Because</b> <span class="small dim">(the reason travels with the answer)</span>' +
        '<textarea id="dnote" rows="3" placeholder="Say why. One sentence is enough; it is what makes the answer arguable later rather than only obeyed.">' +
        esc(m ? m.note : '') + '</textarea></label>' +
        '<div class="dbtns">' +
        '<button type="button" id="drec">Record it</button>' +
        '<button type="button" id="dcopy1">Copy this answer</button>' +
        (m ? '<button type="button" id="dclear" class="dclear">Clear</button>' : '') +
        '<span class="small dim" id="dsaved">' + (m ? 'held in this browser since ' + esc(m.at) : '') + '</span>' +
        '</div></div>');
    } else {
      h.push('<h3>The answer</h3><div class="dans">' + fmt(d.answer) +
             (d.date ? '<p class="small dim">Answered ' + esc(d.date) + '.</p>' : '') + '</div>');
    }

    if (d.answer_with && d.answer_with.length) {
      h.push('<p class="dlinks"><b>Answer with</b> ' + d.answer_with.map(function (o) {
        var x = byId(o);
        return '<a href="#' + esc(o) + '" data-d="' + esc(o) + '">' + esc(o) + ' · ' + esc(x ? x.short : o) + '</a>';
      }).join(', ') + ' — they move the same work, and answering one without the other leaves the plan half-decided.</p>');
    }
    if (d.blocks && d.blocks.length) {
      h.push('<p class="dlinks"><b>This blocks</b> ' + d.blocks.map(function (b) {
        var also = sharedWith(b.key, d.id);
        return '<code>' + fmt(b.label) + '</code>' + (also.length
          ? ' <span class="dshare">the same work as ' + also.map(function (o) {
              return '<a href="#' + esc(o) + '" data-d="' + esc(o) + '">' + esc(o) + '</a>';
            }).join(' and ') + '</span>' : '');
      }).join(' ') + '</p>');
    }
    if (d.affects && d.affects.length) {
      h.push('<p class="dlinks"><b>It touches</b> ' + d.affects.map(function (a) {
        return '<a href="' + esc(a.href) + '">' + esc(a.label) + '</a> <span class="small dim">(' + esc(a.kind) + ')</span>';
      }).join(', ') + '</p>');
    }
    h.push('</article>');
    return h.join('');
  }

  /* ---- what more than one decision is waiting on ------------------------- */
  function sharedBox() {
    var sh = D.shared || [], total = (D.blocks || []).length;
    if (!sh.length) {
      return '<div class="dshared"><h3>Work more than one decision is holding up</h3>' +
        '<p>None, as the register currently stands: each of the ' + total + ' named pieces of work ' +
        'is waiting on exactly one decision. This is computed on every build rather than asserted, ' +
        'so it will say so the moment that changes.</p></div>';
    }
    return '<div class="dshared"><h3>Work more than one decision is holding up</h3>' +
      '<p><b>' + sh.length + ' of the ' + total + '</b> named pieces of work have more than one decision ' +
      'waiting on them. Every one of them is <b>named differently by each decision</b>, which is exactly ' +
      'why the list could not show it and the graph can: the decisions were raised in different reviews, ' +
      'weeks apart, and each described the blocked work in the vocabulary of its own review.</p><ul>' +
      sh.map(function (v) {
        return '<li><b>' + esc(v.work) + '</b> — waiting on ' + v.decisions.map(function (o) {
          return '<a href="#' + esc(o) + '" data-d="' + esc(o) + '">' + esc(o) + '</a>';
        }).join(' and ') + ', called ' + v.names.map(function (n) {
          return '&ldquo;' + esc(n) + '&rdquo;';
        }).join(' and ') + '.</li>';
      }).join('') + '</ul></div>';
  }

  /* ---- the copy block ---------------------------------------------------- */
  function answerText(d) {
    var m = mine(d.id);
    if (!m) { return null; }
    var label = m.idx >= 0 ? plain((d.options[m.idx] || {}).label) : (m.idx === -1 ? 'DEFER' : 'NEED MORE DATA');
    var out = [d.id + ' · ' + plain(d.short), '  answer: ' + label];
    out.push('  because: ' + (m.note ? m.note.replace(/\s+/g, ' ').trim() : '(no reason given)'));
    return out.join('\n');
  }
  function allText() {
    var parts = D.decisions.map(answerText).filter(Boolean);
    if (!parts.length) { return ''; }
    return 'Decisions from graphs.sgit.ai ' + D.version + ' — ' + parts.length +
      ' of ' + D.open + ' open questions answered.\n\n' + parts.join('\n\n') +
      '\n\n(Recorded in the browser at /decisions/index.html and pasted back by hand.)';
  }
  function copy(text, btn) {
    var box = document.getElementById('dout');
    if (box) { box.value = text; box.parentNode.hidden = false; }
    var done = function () { if (btn) { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1400); } };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { if (box) { box.focus(); box.select(); } });
    } else if (box) { box.focus(); box.select(); try { document.execCommand('copy'); done(); } catch (e) { /* select it by hand */ } }
  }

  /* ---- wiring ------------------------------------------------------------ */
  function pick(i) {
    var r = host.querySelector('input[name="dopt"][value="' + i + '"]');
    if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function go(id) {
    var d = byId(id);
    if (!d) { return; }
    cur = d;
    render();
    if (window.history && history.replaceState) { history.replaceState(null, '', '#' + id); }
  }

  function render() {
    var s = load(), n = D.decisions.filter(function (d) { return d.state === 'open' && s[d.id]; }).length;
    host.innerHTML =
      '<div class="dwrap' + (wide ? ' dwide' : '') + '">' +
        list() +
        '<div class="dmain">' + (cur ? panel(cur) : '<p class="dim">Pick a decision.</p>') + '</div>' +
        '<div class="dgraph">' +
          '<div class="dgh"><b>' + (mode === 'all' ? 'the whole register' : 'this decision as a graph') + '</b>' +
            '<span><button class="altib' + (mode === 'one' ? ' on' : '') + '" data-mode="one">one</button>' +
            '<button class="altib' + (mode === 'all' ? ' on' : '') + '" data-mode="all">all</button>' +
            '<button class="altib" data-fit="1">fit</button>' +
            '<button class="altib' + (wide ? ' on' : '') + '" data-wide="1">' + (wide ? 'back' : 'wide') + '</button></span></div>' +
          '<div id="dcy"></div>' +
          '<p class="small dim">' + (mode === 'all'
            ? 'Every decision in the register, with the work each one blocks. A gold-edged block is one that more than one decision is waiting on — those are listed under the register. Tap any decision to open it.'
            : 'The decision is the peak. Tap an option in the graph to choose it; tap a page to go there.') + '</p>' +
        '</div>' +
      '</div>' +
      sharedBox() +
      '<div class="dexport">' +
        '<button type="button" id="dcopyall">Copy every answer (' + n + ')</button>' +
        '<button type="button" id="dclearall" class="dclear">Forget them all</button>' +
        '<span class="small dim">Held in this browser only. Nothing is sent anywhere; the copy is how an answer travels.</span>' +
        '<div class="doutwrap" hidden><textarea id="dout" rows="10" readonly></textarea>' +
        '<p class="small dim">If the copy button was blocked, select this and copy it by hand.</p></div>' +
      '</div>';
    draw();
  }

  host.addEventListener('click', function (e) {
    var a = e.target.closest('[data-d]');
    if (a) { e.preventDefault(); go(a.getAttribute('data-d')); return; }
    var m = e.target.closest('[data-mode]');
    if (m) {
      mode = m.getAttribute('data-mode');
      if (window.history && history.replaceState) { history.replaceState(null, '', '#' + (mode === 'all' ? 'all' : cur.id)); }
      render();
      return;
    }
    if (e.target.closest('[data-fit]')) { if (cy) { cy.fit(undefined, 24); } return; }
    if (e.target.closest('[data-wide]')) { wide = !wide; render(); return; }

    var id = e.target.id;
    if (id === 'drec' && cur) {
      var sel = host.querySelector('input[name="dopt"]:checked');
      if (!sel) { flash('Choose one of the answers first.'); return; }
      var idx = parseInt(sel.value, 10);
      var note = (document.getElementById('dnote') || {}).value || '';
      if (idx < 0 && !note.trim()) { flash('Deferring and asking for data both need a reason — that is the whole mechanism.'); return; }
      var s = load();
      s[cur.id] = { idx: idx, note: note.trim(), at: new Date().toISOString().slice(0, 10) };
      if (!save(s)) { flash('This browser refused to store it. The copy button still works.'); }
      render();
    } else if (id === 'dclear' && cur) {
      var s2 = load(); delete s2[cur.id]; save(s2); render();
    } else if (id === 'dcopy1' && cur) {
      var t = answerText(cur);
      copy(t || 'Nothing recorded for ' + cur.id + ' yet.', e.target);
    } else if (id === 'dcopyall') {
      copy(allText() || 'No answers recorded in this browser yet.', e.target);
    } else if (id === 'dclearall') {
      if (window.confirm('Forget every answer held in this browser?')) { save({}); render(); }
    }
  });
  host.addEventListener('change', function (e) {
    if (e.target.name === 'dopt') {
      host.querySelectorAll('.dopt').forEach(function (l) { l.classList.toggle('on', !!l.querySelector('input:checked')); });
      markChosen();
    }
  });
  function flash(msg) {
    var el = document.getElementById('dsaved');
    if (el) { el.textContent = msg; }
  }

  fetch('data/decisions.json').then(function (r) { return r.json(); }).then(function (data) {
    D = data;
    var want = (location.hash || '').replace('#', '');
    if (want === 'all') { mode = 'all'; }
    cur = byId(want) || D.decisions.filter(function (d) { return d.state === 'open'; })[0] || D.decisions[0];
    render();
  }).catch(function () {
    host.innerHTML = '<p class="dim">The decisions register did not load. It lives at <a href="data/decisions.json">data/decisions.json</a>.</p>';
  });
}());
