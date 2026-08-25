/* @module universe/components/state-pane
   Single responsibility: the state pane, per brief 27's follow-on — the page
   broadcasting its own state into the pixels a screen recording captures,
   because the narrated-review recorder has no programmatic access to the page
   it records. Off by default: it exists for narration and debug sessions.
   High-contrast monospace on dark, short stable lines, written for OCR and
   vision models as much as for eyes. Also publishes window.__uniState() so a
   tool that DOES gain programmatic access reads the same truth as the pixels.
   A part of the reader. */
'use strict';

/**
 * Build the pane (hidden) and the state publisher.
 * @param {{slug: string, graph: Element}} ctx
 * @returns {{setOn: function(boolean), note: function(string)}}
 */
export function initStatePane(ctx) {
  const el = document.createElement('div');
  el.className = 'uni-statepane';
  el.hidden = true;
  document.body.appendChild(el);
  const version = ((document.querySelector('nav.site .ver') || {}).textContent || '').trim();
  let lastAction = '—';

  const snapshot = () => Object.assign(
    { version, slug: ctx.slug, hash: location.hash || '', last: lastAction },
    ctx.graph.snapshot);
  window.__uniState = snapshot;

  const onoff = (m) => Object.keys(m).filter((k) => m[k]).join(' ') || 'none';
  function render() {
    if (el.hidden) return;
    const s = snapshot();
    const p = s.prefs;
    const t = new Date();
    const hh = [t.getHours(), t.getMinutes(), t.getSeconds()]
      .map((x) => String(x).padStart(2, '0')).join(':');
    el.textContent = '';
    [
      version + ' · ' + ctx.slug + (s.hash ? ' · ' + s.hash : ''),
      hh + ' · sel: ' + (s.selected || 'none'),
      'lay:' + p.glay + ' ' + p.gsize + (p.boxed ? ' boxed' : '') + (p.stable ? ' stable' : '')
        + (p.pin ? ' pin' : '') + (p.paths ? ' paths' : ''),
      'src: ' + onoff(s.sources),
      'exp: ' + (p.exp ? 'on deg:' + p.deg : 'off')
        + (s.edgesOff.length ? ' · edges off: ' + s.edgesOff.join(',') : ''),
      'vis: ' + (s.visible ? s.visible.nodes + 'n ' + s.visible.edges + 'e' : '—'),
      'last: ' + lastAction,
    ].forEach((text) => {
      const d = document.createElement('div');
      d.textContent = text;
      el.appendChild(d);
    });
  }

  let clock = 0;
  return {
    setOn(on) {
      el.hidden = !on;
      clearInterval(clock);
      if (on) { render(); clock = setInterval(render, 1000); }
    },
    note(action) { lastAction = action; render(); },
  };
}
