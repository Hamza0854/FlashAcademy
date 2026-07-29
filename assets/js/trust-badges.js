/* ==========================================================================
   FlashAcademy® — trust badge marquee (standalone)

   Reads the attributes already on your markup:
     data-direction        left | right
     data-speed            slow | normal | fast
     data-pause-on-hover   true | false

   Clones badges until the rail is over-filled, then loops the track by
   exactly one set width so the seam is invisible. Also collapses the rail
   to the height its tracks actually need, which removes the dead space
   under the badges caused by the fixed 10rem/20rem/16rem in blocks.css.

   No dependencies. Load it anywhere after the markup.
   ========================================================================== */

(function () {
  "use strict";

  // pixels per second. 'medium' is an alias — the hero block uses that word.
  var SPEEDS = { slow: 34, normal: 62, medium: 62, fast: 100 };

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function toArray(list) {
    return Array.prototype.slice.call(list);
  }

  ready(function init() {
    var sections = toArray(
      document.querySelectorAll(".wp-block-flashacademy-trust-badges")
    );

    if (!sections.length) {
      console.warn("[fa-badges] no .wp-block-flashacademy-trust-badges found");
      return;
    }

    sections.forEach(function (section) {
      if (section.classList.contains("fa-trust-badges--no-animation")) return;

      var direction =
        section.getAttribute("data-direction") === "right" ? 1 : -1;
      var speed =
        SPEEDS[section.getAttribute("data-speed")] || SPEEDS.normal;
      var pauseOnHover =
        section.getAttribute("data-pause-on-hover") !== "false";

      /* Rail height comes from CSS as a fixed 10rem / 20rem / 16rem. Measure
         what the tracks actually occupy and mirror the top offset underneath
         so the padding reads as symmetric. */
      function fitRail(rail) {
        var tracks = toArray(
          rail.querySelectorAll(".fa-trust-badges__track")
        );
        var top = Infinity;
        var bottom = 0;

        tracks.forEach(function (track) {
          top = Math.min(top, track.offsetTop);
          bottom = Math.max(bottom, track.offsetTop + track.offsetHeight);
        });

        // hidden rail (the mobile one at desktop widths) measures 0 — skip it
        if (bottom > 0 && top !== Infinity) {
          rail.style.height = bottom + top + "px";
        }
      }

      toArray(section.querySelectorAll(".fa-trust-badges__track")).forEach(
        function (track, index) {
          var rail = track.parentElement;
          if (!rail || !track.children.length) return;

          var originals = toArray(track.children);
          var setWidth = 0;
          var offset = 0;
          var paused = false;
          var lastTime = 0;
          var frame = null;

          function build() {
            if (frame) {
              cancelAnimationFrame(frame);
              frame = null;
            }

            toArray(track.querySelectorAll("[data-fa-clone]")).forEach(
              function (node) {
                node.parentNode.removeChild(node);
              }
            );

            track.style.transform = "translate3d(0,0,0)";

            // hidden rails have no width — nothing to measure yet
            if (!rail.clientWidth || !track.scrollWidth) {
              fitRail(rail);
              return;
            }

            var target = rail.clientWidth * 2 + track.scrollWidth;
            var guard = 0;

            while (track.scrollWidth < target && guard < 40) {
              originals.forEach(function (node) {
                var clone = node.cloneNode(true);
                clone.setAttribute("data-fa-clone", "");
                clone.setAttribute("aria-hidden", "true");
                track.appendChild(clone);
              });
              guard += 1;
            }

            /* Distance from an original to its clone is one full set with the
               trailing flex gap included — measuring scrollWidth would miss
               that gap and the loop would visibly stutter. */
            var firstClone = track.querySelector("[data-fa-clone]");
            setWidth = firstClone
              ? firstClone.offsetLeft - originals[0].offsetLeft
              : 0;

            // stagger the second mobile row so both don't march in lockstep
            offset = index && setWidth ? setWidth * 0.35 : 0;

            fitRail(rail);

            if (setWidth <= 0 || prefersReduced) return;

            lastTime = 0;
            frame = requestAnimationFrame(step);
          }

          function step(now) {
            if (!lastTime) lastTime = now;

            var delta = (now - lastTime) / 1000;
            lastTime = now;

            // returning from a background tab hands back a huge delta
            if (delta > 0.1) delta = 0.1;

            if (!paused) {
              offset = (offset + speed * delta) % setWidth;
              var x = direction === -1 ? -offset : offset - setWidth;
              track.style.transform = "translate3d(" + x + "px,0,0)";
            }

            frame = requestAnimationFrame(step);
          }

          if (pauseOnHover) {
            rail.addEventListener("mouseenter", function () {
              paused = true;
            });
            rail.addEventListener("mouseleave", function () {
              paused = false;
            });
          }

          build();

          /* Badge logos are loading="lazy", so their width is often 0 at
             DOMContentLoaded and the first measurement comes out short.
             Rebuild once each one resolves, and again on full load. */
          toArray(track.querySelectorAll("img")).forEach(function (img) {
            if (img.complete && img.naturalWidth) return;
            img.addEventListener("load", rebuildSoon);
            img.addEventListener("error", rebuildSoon);
          });

          window.addEventListener("load", rebuildSoon);
          window.addEventListener("resize", rebuildSoon);

          var pending;
          function rebuildSoon() {
            clearTimeout(pending);
            pending = setTimeout(build, 150);
          }
        }
      );
    });
  });
})();