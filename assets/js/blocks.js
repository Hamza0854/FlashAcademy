
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---------------------------------------------------------------
       1. FAQ accordion — one item open at a time
       --------------------------------------------------------------- */
    document.querySelectorAll(".fa-accordion").forEach(function (accordion) {
      var items = [].slice.call(
        accordion.querySelectorAll(".fa-accordion-item"),
      );

      function setState(item, open) {
        var toggle = item.querySelector(".fa-accordion-item__toggle");
        var panel = item.querySelector(".fa-accordion-item__panel");
        var icon = item.querySelector(".fa-accordion-item__icon");

        item.classList.toggle("is-open", open);
        if (toggle)
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (icon) icon.textContent = open ? "\u2212" : "+"; // − / +
        if (!panel) return;

        if (open) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }

      items.forEach(function (item) {
        var toggle = item.querySelector(".fa-accordion-item__toggle");
        if (!toggle) return;

        // normalise whatever state the markup shipped with
        setState(item, item.classList.contains("is-open"));

        toggle.addEventListener("click", function () {
          var willOpen = !item.classList.contains("is-open");
          items.forEach(function (other) {
            setState(other, other === item ? willOpen : false);
          });
        });
      });
    });

    /* ---------------------------------------------------------------
       2. Cards block carousel
       --------------------------------------------------------------- */
    if (typeof window.Swiper !== "undefined") {
      document.querySelectorAll(".fa-cards-block").forEach(function (block) {
        var el = block.querySelector(".fa-cards-block__swiper");
        if (!el || el.classList.contains("swiper-initialized")) return;

        var dots = block.querySelector(".fa-cards-block__dots");
        var count = el.querySelectorAll(".swiper-slide").length;
        var per = function (n) {
          return Math.min(n, count);
        };

        new Swiper(el, {
          slidesPerView: 1.1,
          spaceBetween: 20,
          watchOverflow: true,
          // pagination: dots ? { el: dots, clickable: true } : false,
          breakpoints: {
            576: {
              slidesPerView: per(2.1),
              spaceBetween: 24,
            },
            992: {
              slidesPerView: per(2.6),
              spaceBetween: 26,
            },
            1200: {
              slidesPerView: per(3.2),
              spaceBetween: 26,
            },
          },
        });
      });
    }

    /* ---------------------------------------------------------------
       3. Cards reveal — click a card to expand its panel
       --------------------------------------------------------------- */
    document
      .querySelectorAll(".fa-cards-reveal__card")
      .forEach(function (card) {
        var trigger = card.querySelector(".fa-cards-reveal__card-trigger");
        var panel = card.querySelector(".fa-cards-reveal__card-panel");
        var summary = card.querySelector(".fa-cards-reveal__card-summary");
        if (!trigger) return;

        function setOpen(open) {
          card.classList.toggle("is-open", open);
          trigger.setAttribute("aria-expanded", open ? "true" : "false");
          [panel, summary].forEach(function (el) {
            if (el) el.setAttribute("aria-hidden", open ? "false" : "true");
          });
        }

        setOpen(card.classList.contains("is-open"));

        trigger.addEventListener("click", function () {
          setOpen(!card.classList.contains("is-open"));
        });
      });

    /* ---------------------------------------------------------------
       4. Video block — swap the poster for the embedded player
       --------------------------------------------------------------- */
    document.querySelectorAll(".fa-video-block").forEach(function (block) {
      var trigger = block.querySelector(".fa-video-block__trigger");
      var media = block.querySelector(".fa-video-block__media");
      if (!trigger || !media) return;

      // the theme's bootstrap modal isn't available in a static export,
      // so play inline instead of opening a modal
      trigger.removeAttribute("data-bs-toggle");
      trigger.removeAttribute("data-bs-target");

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        var url =
          trigger.getAttribute("data-src") ||
          block.getAttribute("data-video-url");
        if (!url) return;

        var frame = document.createElement("iframe");
        frame.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
        frame.title = "FlashAcademy video";
        frame.allow = "autoplay; fullscreen; picture-in-picture";
        frame.allowFullscreen = true;
        frame.style.cssText =
          "width:100%;aspect-ratio:16/9;border:0;border-radius:24px;display:block";

        media.innerHTML = "";
        media.appendChild(frame);
      });
    });

    /* ---------------------------------------------------------------
       5. Hero video — reveal the embed when the play button is used
       --------------------------------------------------------------- */
    document
      .querySelectorAll(".wp-block-flashacademy-hero-video")
      .forEach(function (block) {
        var button = block.querySelector(
          ".flashacademy-hero-video__play-button",
        );
        var frame = block.querySelector(".flashacademy-hero-video__embed");
        if (!button || !frame) return;

        button.addEventListener("click", function () {
          var src = frame.getAttribute("src") || "";
          if (src && src.indexOf("autoplay=1") === -1) {
            frame.setAttribute(
              "src",
              src + (src.indexOf("?") > -1 ? "&" : "?") + "autoplay=1",
            );
          }
          button.classList.add("is-hidden");
        });
      });

    /* ---------------------------------------------------------------
       6. Horizontal scroll showcase
       The track slides sideways as the pinned section moves through the
       viewport. Falls back to native horizontal scrolling on small screens
       and when reduced motion is requested.
       --------------------------------------------------------------- */
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    document
      .querySelectorAll(".fa-horizontal-showcase")
      .forEach(function (section) {
        var pin = section.querySelector(".fa-horizontal-showcase__pin");
        var viewport = section.querySelector(
          ".fa-horizontal-showcase__viewport",
        );
        var track = section.querySelector("[data-horizontal-track]");
        if (!pin || !viewport || !track) return;

        function maxShift() {
          return Math.max(0, track.scrollWidth - viewport.clientWidth);
        }

        function isSmall() {
          return window.matchMedia("(max-width: 640px)").matches;
        }

        function update() {
          if (isSmall() || reduceMotion) {
            track.style.transform = "";
            pin.style.height = "";
            viewport.style.position = "";
            return;
          }

          var shift = maxShift();
          if (shift <= 0) {
            track.style.transform = "";
            pin.style.height = "";
            return;
          }

          // give the section extra scroll length equal to the sideways distance
          pin.style.height = viewport.offsetHeight + shift + "px";
          viewport.style.position = "sticky";
          viewport.style.top = "0";

          var rect = pin.getBoundingClientRect();
          var travelled = Math.min(Math.max(-rect.top, 0), shift);
          track.style.transform = "translate3d(" + -travelled + "px,0,0)";
        }

        var ticking = false;
        function onScroll() {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            update();
            ticking = false;
          });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", update);
        if (document.readyState !== "complete")
          window.addEventListener("load", update);
        update();
      });

    /* ---------------------------------------------------------------
       7. Layered cards ("numbers stack")
       The ORIGINAL plugin CSS for this block was recovered and is loaded
       from blocks-original.css. It expects a --progress value (0 -> 1) per
       card, which this driver supplies from the scroll position; the CSS
       then handles the sticky stacking, rotation and settle.
       --------------------------------------------------------------- */
    document.querySelectorAll(".fa-numbers-stack").forEach(function (stack) {
      var items = [].slice.call(stack.querySelectorAll("[data-scroll-card]"));
      if (!items.length) return;

      if (reduceMotion) {
        items.forEach(function (item) {
          item.style.setProperty("--progress", "1");
          item.classList.add("is-inview");
        });
        return;
      }

      function update() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          // 0 while the card is still below the fold, 1 once it has settled
          var start = vh * 0.9;
          var end = vh * 0.35;
          var progress = (start - rect.top) / (start - end);
          progress = Math.min(Math.max(progress, 0), 1);
          item.style.setProperty("--progress", progress.toFixed(4));
          item.classList.toggle("is-inview", progress > 0.05);
        });
      }

      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      if (document.readyState !== "complete")
        window.addEventListener("load", update);
      update();
    });
  });
})();
