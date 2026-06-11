/* ============================================================
   ALSONEX V2 "Meridian Cine" — global site behaviour
   Ported from design_handoff_alsonex_v2/modern/modern.js.
   Loaded site-wide from BaseLayout.astro (as /scripts/meridian.js).

   - Sticky/condensing nav: adds .is-stuck at scrollY > 24
   - Mobile hamburger overlay: open/close + close-on-link + Esc
   - Scroll reveals: IntersectionObserver with a safety net,
     only pre-hides below-the-fold elements (never blanks the
     page if JS stalls); honours prefers-reduced-motion via CSS.
   ============================================================ */
(function () {
  // sticky/condensing nav
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add('is-stuck');
      else nav.classList.remove('is-stuck');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // mobile hamburger menu (present only where a .nav__burger exists)
  var burger = document.querySelector('.nav__burger');
  if (burger && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('menu-open'));
    });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var vh = window.innerHeight || document.documentElement.clientHeight;

  // Only pre-hide elements that start BELOW the fold. Anything already
  // visible stays visible — so the page is never blank if JS stalls.
  var toWatch = [];
  els.forEach(function (el) {
    var top = el.getBoundingClientRect().top;
    if (top > vh * 0.9) {
      el.classList.add('pre');
      toWatch.push(el);
    }
  });

  var show = function (el) {
    el.classList.remove('pre');
  };

  if ('IntersectionObserver' in window && toWatch.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    toWatch.forEach(function (el) {
      io.observe(el);
    });
  } else {
    toWatch.forEach(show);
  }

  // safety net
  setTimeout(function () {
    toWatch.forEach(show);
  }, 3000);
})();
