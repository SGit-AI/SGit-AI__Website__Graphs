/* The version diff view for book/changes.html.
   Data: book/changes/data/index.json lists every release; one JSON per
   release holds the book's units (introduction + chapters) as plain text
   blocks, extracted from that release's tag by gen_changes.py. Everything
   here runs client-side: pick any two versions, diff block-by-block, then
   word-by-word inside changed blocks, GitHub-style. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var DATA = 'changes/data/';
  var versions = [];

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Longest-common-subsequence ops over two arrays of strings.
     Returns [{t:'same'|'del'|'add', x:string}] in order. */
  function lcsOps(a, b) {
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) { dp.push(new Uint16Array(m + 1)); }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1
                                 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var ops = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ t: 'same', x: a[i] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: 'del', x: a[i] }); i++; }
      else { ops.push({ t: 'add', x: b[j] }); j++; }
    }
    while (i < n) { ops.push({ t: 'del', x: a[i++] }); }
    while (j < m) { ops.push({ t: 'add', x: b[j++] }); }
    return ops;
  }

  /* Word-level diff of one modified block pair, rendered as HTML. */
  function wordDiff(oldT, newT) {
    var a = oldT.split(/\s+/), b = newT.split(/\s+/);
    if (a.length * b.length > 250000) {
      return '<div class="dblk ddel">' + esc(oldT) + '</div>' +
             '<div class="dblk dadd">' + esc(newT) + '</div>';
    }
    var out = [], run = null;
    lcsOps(a, b).forEach(function (op) {
      if (run && run.t === op.t) { run.w.push(op.x); return; }
      if (run) { out.push(run); }
      run = { t: op.t, w: [op.x] };
    });
    if (run) { out.push(run); }
    var htmlParts = out.map(function (r) {
      var words = esc(r.w.join(' '));
      if (r.t === 'del') { return '<del class="dw">' + words + '</del>'; }
      if (r.t === 'add') { return '<ins class="dw">' + words + '</ins>'; }
      return words;
    });
    return '<div class="dblk dmod">' + htmlParts.join(' ') + '</div>';
  }

  /* Block ops -> rows. Runs of del followed by add pair up positionally into
     modified blocks (the usual shape of an edit); leftovers stay pure. */
  function rows(ops) {
    var out = [], i = 0;
    while (i < ops.length) {
      if (ops[i].t === 'same') { out.push({ t: 'same', a: ops[i].x }); i++; continue; }
      var dels = [], adds = [];
      while (i < ops.length && ops[i].t !== 'same') {
        (ops[i].t === 'del' ? dels : adds).push(ops[i].x); i++;
      }
      var k = 0;
      for (; k < Math.min(dels.length, adds.length); k++) {
        out.push({ t: 'mod', a: dels[k], b: adds[k] });
      }
      for (; k < dels.length; k++) { out.push({ t: 'del', a: dels[k] }); }
      for (k = Math.min(dels.length, adds.length); k < adds.length; k++) {
        out.push({ t: 'add', a: adds[k] });
      }
    }
    return out;
  }

  function unitKeys(from, to) {
    var seen = {}, keys = [];
    [from, to].forEach(function (snap) {
      Object.keys(snap.units).forEach(function (k) {
        if (!seen[k]) { seen[k] = true; keys.push(k); }
      });
    });
    return keys.sort(function (x, y) {
      var ox = x === 'intro' ? -1 : parseInt(x.slice(2), 10);
      var oy = y === 'intro' ? -1 : parseInt(y.slice(2), 10);
      return ox - oy;
    });
  }

  function render(from, to, mode) {
    var container = $('#diff');
    container.innerHTML = '';
    var totals = { add: 0, del: 0, mod: 0 }, changedUnits = 0;

    unitKeys(from, to).forEach(function (key) {
      var uf = from.units[key], ut = to.units[key];
      var title = (ut || uf).title;
      var section = document.createElement('section');
      section.className = 'diffunit';

      var status = '';
      var body = '';
      if (!uf) { status = 'new in ' + to.version; }
      else if (!ut) { status = 'not present in ' + to.version; }

      var r = rows(lcsOps(uf ? uf.blocks : [], ut ? ut.blocks : []));
      var counts = { add: 0, del: 0, mod: 0 };
      r.forEach(function (row) { if (row.t !== 'same') { counts[row.t]++; } });
      totals.add += counts.add; totals.del += counts.del; totals.mod += counts.mod;
      var changed = counts.add + counts.del + counts.mod > 0;
      if (changed) { changedUnits++; }

      var badge = changed
        ? '<span class="dcount">' +
          (counts.mod ? '<b class="cm">~' + counts.mod + '</b> ' : '') +
          (counts.add ? '<b class="ca">+' + counts.add + '</b> ' : '') +
          (counts.del ? '<b class="cd">&minus;' + counts.del + '</b>' : '') + '</span>'
        : '<span class="dcount dun">unchanged</span>';
      if (status) { badge = '<span class="dcount"><b class="cm">' + status + '</b></span>'; }

      if (changed) {
        var ctx = mode === 'all' ? Infinity : (mode === 'context' ? 1 : 0);
        var visible = new Array(r.length);
        r.forEach(function (row, idx) {
          if (row.t !== 'same') {
            for (var d = -ctx; d <= ctx; d++) {
              if (r[idx + d]) { visible[idx + d] = true; }
            }
            visible[idx] = true;
          }
        });
        if (mode === 'all') { visible = r.map(function () { return true; }); }
        var i = 0;
        while (i < r.length) {
          if (!visible[i]) {
            var j = i;
            while (j < r.length && !visible[j]) { j++; }
            var hidden = r.slice(i, j).map(function (row) {
              return '<div class="dblk dsame">' + esc(row.a) + '</div>';
            }).join('');
            body += '<div class="dgap"><button type="button" data-n="' + (j - i) +
                    '">&ctdot; ' + (j - i) + ' unchanged block' + (j - i > 1 ? 's' : '') +
                    '</button><div class="dhidden" hidden>' + hidden + '</div></div>';
            i = j; continue;
          }
          var row = r[i];
          if (row.t === 'same') { body += '<div class="dblk dsame">' + esc(row.a) + '</div>'; }
          else if (row.t === 'del') { body += '<div class="dblk ddel">' + esc(row.a) + '</div>'; }
          else if (row.t === 'add') { body += '<div class="dblk dadd">' + esc(row.a) + '</div>'; }
          else { body += wordDiff(row.a, row.b); }
          i++;
        }
      }

      section.innerHTML = '<h2>' + esc(title) + ' ' + badge + '</h2>' + body;
      container.appendChild(section);
    });

    $('#summary').innerHTML =
      'Comparing <b>' + esc(from.version) + '</b> (' + esc(from.date) + ') &rarr; <b>' +
      esc(to.version) + '</b> (' + esc(to.date) + '): <b>' + changedUnits +
      '</b> of ' + unitKeys(from, to).length + ' chapters changed &middot; ' +
      '<b class="cm">~' + totals.mod + ' modified</b> &middot; ' +
      '<b class="ca">+' + totals.add + ' added</b> &middot; ' +
      '<b class="cd">&minus;' + totals.del + ' removed</b> blocks';

    container.querySelectorAll('.dgap button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.nextElementSibling.hidden = false;
        btn.remove();
      });
    });
  }

  function fetchVersion(v) {
    return fetch(DATA + v + '.json').then(function (r) {
      if (!r.ok) { throw new Error(v); }
      return r.json();
    });
  }

  function update() {
    var f = $('#from').value, t = $('#to').value;
    var mode = document.querySelector('input[name="mode"]:checked').value;
    var qs = '?from=' + f + '&to=' + t + (mode !== 'changes' ? '&mode=' + mode : '');
    history.replaceState(null, '', qs);
    $('#summary').textContent = 'Loading ' + f + ' and ' + t + '…';
    Promise.all([fetchVersion(f), fetchVersion(t)]).then(function (snaps) {
      render(snaps[0], snaps[1], mode);
    }).catch(function (e) {
      $('#summary').textContent = 'Could not load ' + e.message + '.json';
    });
  }

  fetch(DATA + 'index.json').then(function (r) { return r.json(); }).then(function (idx) {
    versions = idx.versions;
    var params = new URLSearchParams(location.search);
    var selFrom = $('#from'), selTo = $('#to');
    versions.forEach(function (e) {
      selFrom.add(new Option(e.v + ' · ' + e.date, e.v));
      selTo.add(new Option(e.v + ' · ' + e.date, e.v));
    });
    var last = versions[versions.length - 1].v;
    var prev = versions.length > 1 ? versions[versions.length - 2].v : last;
    selFrom.value = params.get('from') || prev;
    selTo.value = params.get('to') || last;
    var mode = params.get('mode');
    if (mode === 'context' || mode === 'all') {
      document.querySelector('input[name="mode"][value="' + mode + '"]').checked = true;
    }
    selFrom.addEventListener('change', update);
    selTo.addEventListener('change', update);
    document.querySelectorAll('input[name="mode"]').forEach(function (el) {
      el.addEventListener('change', update);
    });
    update();
  }).catch(function () {
    $('#summary').textContent = 'Could not load the version index.';
  });
})();
