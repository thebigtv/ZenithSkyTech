/* ==========================================================================
   ZENITH SKYTECH — HOMEPAGE SCRIPT
   Three responsibilities only, each isolated so they can be unit tested
   or reused independently on future pages:
     1. Sticky header state (transparent → solid on scroll)
     2. Mobile navigation overlay (open/close, focus management, Escape)
     3. Scroll-reveal animation trigger (IntersectionObserver, fires once)
   No external libraries. No framework. Progressive enhancement throughout —
   every link and button works with JavaScript disabled; JS only adds motion
   and the mobile overlay's open/close behaviour.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. STICKY HEADER
     Adds .is-scrolled once the user has scrolled past 80px, matching the
     Design System's "Scrolled" nav variant. Uses a scroll listener guarded
     by requestAnimationFrame to avoid layout thrashing.
     ------------------------------------------------------------------------ */
  var header = document.getElementById('site-header');
  var scrollTicking = false;

  function updateHeaderState() {
    if (window.scrollY > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateHeaderState);
      scrollTicking = true;
    }
  }, { passive: true });

  // Set initial state in case the page loads already scrolled (e.g. anchor link)
  updateHeaderState();

  /* ------------------------------------------------------------------------
     2. MOBILE NAVIGATION OVERLAY
     Toggles the full-screen overlay, manages aria-expanded/aria-hidden,
     traps focus while open, and restores focus to the toggle on close.
     ------------------------------------------------------------------------ */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileNavLinks = mobileNav.querySelectorAll('a, button');

  function openMobileNav() {
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    if (mobileNavLinks.length) mobileNavLinks[0].focus();
  }

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    navToggle.focus();
  }

  navToggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.contains('is-open');
    if (isOpen) { closeMobileNav(); } else { openMobileNav(); }
  });

  // Close on Escape, and trap Tab focus within the overlay while open
  document.addEventListener('keydown', function (e) {
    if (!mobileNav.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeMobileNav();
      return;
    }

    if (e.key === 'Tab' && mobileNavLinks.length) {
      var first = mobileNavLinks[0];
      var last = mobileNavLinks[mobileNavLinks.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Close the overlay automatically if a link inside it is followed
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ------------------------------------------------------------------------
     3. SCROLL-REVEAL
     Design System §7.2: fade-up once at ~20% visibility, never re-triggers.
     Skipped entirely under prefers-reduced-motion — content is simply
     visible immediately (handled by the CSS media query), so this observer
     doesn't even need to run in that case.
     ------------------------------------------------------------------------ */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('[data-reveal]');

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    revealTargets.forEach(function (target) {
      revealObserver.observe(target);
    });
  } else {
    // No IntersectionObserver support, or motion is reduced: show immediately.
    document.querySelectorAll('[data-reveal]').forEach(function (target) {
      target.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------------
     Footer year — small enhancement, avoids a stale hard-coded year.
     ------------------------------------------------------------------------ */
  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
