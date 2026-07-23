/* FlashAcademy front-page slider init
   Rebuilt to match the reference site's slider behaviour, since the original
   code-split webpack chunks that initialised these were not part of the mirror. */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (typeof window.Swiper === "undefined") {
      console.warn("[FA] Swiper library not loaded — sliders skipped.");
      return;
    }

    /* 1) Feature slider: Digital Proficiency Assessment / Accelerate / Track / Dedicated */
    var featureEl = document.querySelector(".fp-paralax-scrolling .swiper");
    if (featureEl) {
      // make sure a pagination container exists
      var fPag = featureEl.querySelector(".swiper-pagination");
      new Swiper(featureEl, {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        speed: 700,
        autoHeight: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: fPag ? { el: fPag, clickable: true } : false,
        keyboard: { enabled: true },
      });
    }

    /* 2) Testimonials carousel */
    var testiEl = document.querySelector(".fp-testimonials .swiper");
    if (testiEl) {
      // inject a pagination element if the markup doesn't include one
      var tPag = testiEl.querySelector(".swiper-pagination");
      if (!tPag) {
        tPag = document.createElement("div");
        tPag.className = "swiper-pagination fp-testimonials__pagination";
        testiEl.appendChild(tPag);
      }
      new Swiper(testiEl, {
        slidesPerView: 3,
        spaceBetween: 0,
        loop: true,
        speed: 600,
        autoHeight: true,
        grabCursor: true,
        autoplay: { delay: 6000, disableOnInteraction: false },
        pagination: false,
        breakpoints: {
          0: { slidesPerView: 1 },
          576: { slidesPerView: 1 },
          992: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
      });
    }

    /* 3) "Who is FlashAcademy for?" — synced thumbs (personas) + content panels */
    var thumbsEl = document.querySelector(".fp-audiance__content-thumbs");
    var sliderEl = document.querySelector(".fp-audiance__content-slider");
    if (thumbsEl && sliderEl) {
      var thumbs = new Swiper(thumbsEl, {
        slidesPerView: "auto",
        spaceBetween: 0,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
        navigation: {
          nextEl: ".fp-audiance__content-thumbs-button-next",
          prevEl: ".fp-audiance__content-thumbs-button-prev",
        },
        breakpoints: {
          0: { slidesPerView: 2 },
          576: { slidesPerView: 3 },
          992: { slidesPerView: 6 },
          1200: { slidesPerView: 8 },
        },
      });

      new Swiper(sliderEl, {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 500,
        autoHeight: true,
        allowTouchMove: true,
        thumbs: { swiper: thumbs },
      });
    }
  });
})();
