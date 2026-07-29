/* ==========================================================================
   FlashAcademy® — hero mascot (globe) scroll scale

   Calibrated from frame-by-frame measurement of the reference recording.

   The globe's size tracks where its centre sits in the viewport:

       centre at viewport top     -> diameter ~270px  (scale 0.51)
       centre at viewport middle  -> diameter ~392px  (scale 0.74)
       centre at viewport bottom  -> diameter ~532px  (scale 1.00)

   Measured fit was D = 244 * p + 270 (p = centre / viewport height),
   linear to within 16px RMS across the whole clip. Frames where scrolling
   paused showed identical sizes, so the reference locks straight to scroll
   position with no easing lag — hence SMOOTHING defaults to 1.

   Scrolling down moves the globe up the viewport and shrinks it; scrolling
   back up grows it again.

   Self-contained. No CSS file, no GSAP, no load-order requirements.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- tune these ------------------------------------------------------ */
  var MIN_SCALE = 0.51; // centre at the top of the viewport
  var MAX_SCALE = 1.0;  // centre at the bottom of the viewport
  var SMOOTHING = 1;    // 1 = locked to scroll (matches reference). 0.15 = glide
  /* ---------------------------------------------------------------------- */

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll(".flashacademy-hero-mascot__mascot")
    );

    if (!nodes.length) {
      console.warn("[fa-mascot] no .flashacademy-hero-mascot__mascot found");
      return;
    }

    /* Scaling about the centre keeps the centre point fixed, so reading the
       rect back each frame can't feed into itself. */
    nodes.forEach(function (el) {
      el.style.transformOrigin = "50% 50%";
    });

    if (prefersReduced) return;

    var items = nodes.map(function (el) {
      el.style.willChange = "transform";
      return { el: el, current: null };
    });

    function scaleFor(el) {
      var rect = el.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var centre = rect.top + rect.height / 2;

      var progress = centre / viewport;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
    }

    var running = false;

    function frame() {
      var settling = false;

      items.forEach(function (item) {
        var target = scaleFor(item.el);

        if (item.current === null || SMOOTHING >= 1) {
          item.current = target;
        } else {
          item.current += (target - item.current) * SMOOTHING;
          if (Math.abs(target - item.current) > 0.0005) settling = true;
        }

        item.el.style.transform = "scale(" + item.current.toFixed(4) + ")";
      });

      if (settling) requestAnimationFrame(frame);
      else running = false;
    }

    function onScroll() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    frame(); // set the starting size before the first paint

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", onScroll);
  });
})();