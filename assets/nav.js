/* @module nav
   Single responsibility: the site navigation's only behaviour — the mobile
   menu toggle and the aria-expanded state that goes with it, and publishing the
   nav's measured height as --navh so the rest of the site can scroll around it.
   Everything else about the nav is stamped into every page by chrome.py at build
   time, so this file stays the size of the things that genuinely need a browser. */
/* graphs.sgit.ai — nav interaction, the same component sgit.ai runs.
   Two jobs, and only one of them needs JavaScript on desktop: hover and :focus-within
   open a dropdown in CSS alone. This handles the rest — the phone menu button, and the
   fact that a finger has no hover. If this file never loads the nav still works: every
   group label is a link to that section's own page. */
(function () {
  'use strict';
  var nav = document.querySelector('nav.site');
  if (!nav) return;
  var toggle = nav.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  /* On a touch screen the dropdown has no hover to open it: the first tap on a group
     label opens the menu, a second follows the link. Only where a dropdown is actually
     drawn — in the collapsed phone menu the children are already visible. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('nav.site .ni-has > .nl');
    var open = nav.querySelector('.ni-has.open');
    if (open && (!link || link.parentNode !== open)) open.classList.remove('open');
    if (!link || !window.matchMedia || !window.matchMedia('(hover: none)').matches) return;
    var item = link.parentNode, sub = item.querySelector('.sub');
    if (sub && window.getComputedStyle(sub).position === 'absolute'
            && !item.classList.contains('open')) {
      e.preventDefault();
      item.classList.add('open');
    }
  });
  /* Escape closes whatever is open — keyboard users get out the same way everywhere. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = nav.querySelector('.ni-has.open');
    if (open) open.classList.remove('open');
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* --- the nav's height, published --------------------------------------
     The nav is sticky, so anything scrolled to the top of the viewport lands
     underneath it. CSS cannot know how tall it is: the row WRAPS, so it is 104px
     on a wide desktop, 92px on a phone and 55px on an iPad. A hard-coded value
     was wrong at two of those three widths and hid up to 87px of content.
     Measure it, publish it as --navh, and site.css does the rest with one
     scroll-padding-top. Kept here because the nav's height is the nav's fact. */
  var root = document.documentElement;
  function publishHeight() {
    var h = Math.round(nav.getBoundingClientRect().height);
    if (h > 0) root.style.setProperty('--navh', h + 'px');
  }
  publishHeight();
  if (window.ResizeObserver) {
    new ResizeObserver(publishHeight).observe(nav);   /* fires when the row wraps */
  } else {
    window.addEventListener('resize', publishHeight);
  }
}());
