/* @module universe-chat/boot
   Single responsibility: the chat's only footprint on the page — a floating
   button and a lazy import. The page ships no LLM code until the button is
   pressed; if chat.js (or the component CDN behind it) cannot load, the page
   is unaffected beyond a note on the button. The page's own JavaScript never
   knows this module exists: the chat reaches the page only through the
   published tool API (window.__tool). */
'use strict';

if (window.UNIVERSE && document.querySelector('.uni-layout')) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./chat.css', import.meta.url).href;
  document.head.appendChild(css);

  const fab = document.createElement('button');
  fab.className = 'uchat-fab';
  fab.textContent = '💬 talk to this graph';
  fab.title = 'Chat with this document’s universe — your own OpenRouter key, in your browser only';
  document.body.appendChild(fab);

  let chat = null;
  const open = () => {
    fab.disabled = true;
    import('./chat.js')
      .then((m) => { chat = m; m.open(); fab.disabled = false; })
      .catch(() => {
        fab.disabled = false;
        fab.textContent = '💬 chat unavailable (components did not load)';
        setTimeout(() => { fab.textContent = '💬 talk to this graph'; }, 4000);
      });
  };
  fab.addEventListener('click', () => (chat ? chat.open() : open()));

  let auto = false;
  try { auto = localStorage.getItem('uchat:open') === '1'; } catch (e) { /* fine */ }
  if (auto || new URLSearchParams(location.search).get('chat') === '1') open();
}
