/* Karma of Fuquay — homepage updates (2026-11)
   1. Hero: header height → CSS var, line masks for slide copy, Eximius film control.
   2. Current Models: scroll-linked shutter + drive-in for photos, line reveal for copy.
   Motion is opt-in: the hidden start states exist only when this script runs AND
   the visitor allows motion. Reduced motion → static page, slider does not auto-advance. */
(function ($) {
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var root = document.documentElement;

  /* ---------- shared: fixed header height ---------- */
  function syncHeader() {
    var hdr = document.querySelector("header");
    if (hdr && getComputedStyle(hdr).position === "fixed") {
      root.style.setProperty("--fq-hdr-h", hdr.offsetHeight + "px");
    }
  }

  /* ---------- shared: wrap lines in reveal masks ---------- */
  function wrapLines(children) {
    var i = 0;
    children.forEach(function (el) {
      var cs = getComputedStyle(el);
      var pad = Math.ceil(parseFloat(cs.fontSize) * 0.18); // room for descenders / button border
      var mask = document.createElement("div");
      mask.className = "rv-mask";
      mask.style.setProperty("--rv-i", i++);
      // the line's own margins move to the mask, so a hidden line cannot peek through its margin
      mask.style.marginTop = cs.marginTop;
      mask.style.marginBottom = "calc(" + cs.marginBottom + " - " + pad + "px)";
      mask.style.paddingBottom = pad + "px";
      el.style.marginTop = "0";
      el.style.marginBottom = "0";
      // owl's slide animation listens for animationend on the slide itself;
      // a line's own animationend must not bubble up and end the slide's shutter early
      mask.addEventListener("animationend", function (e) { e.stopPropagation(); });
      el.parentNode.insertBefore(mask, el);
      mask.appendChild(el);
    });
  }

  $(function () {
    syncHeader();
    $(window).on("resize", syncHeader);

    /* ---------- 1. Hero ---------- */
    var $hero = $(".home-slider");
    if ($hero.length) {
      // copy blocks: drop the empty &nbsp; spacer paragraphs so every slide spaces alike,
      // then mask each line (clones included — owl has already built them)
      $hero.find(".banner-content > div").each(function () {
        var lines = [];
        $(this).children().each(function () {
          var empty = this.tagName === "P" && !this.querySelector("img, a") && !this.textContent.replace(/ /g, "").trim();
          if (empty) { this.parentNode.removeChild(this); } else { lines.push(this); }
        });
        wrapLines(lines);
      });

      if (!reduceMotion) root.classList.add("fq-motion");

      /* Rotation is driven here, not by owl's autoplay, so the rail's progress line
         ends exactly when the slide changes: photos 5s, the film for its own length.
         Reduced motion: nothing advances on its own; the rail and swipe still work. */
      var PHOTO_MS = 5000;
      var SAFETY_PAD_MS = 4000;  // film stalled → advance anyway
      var timer = null;
      var paused = reduceMotion;
      var $rail = $("#carousel-custom-dots");
      var $pause = $(".hero-rail__pause");

      var activeDot = function () { return $rail.children("li.active"); };

      var goNext = function () { $hero.trigger("next.owl.carousel", [300]); };

      var startProgress = function (ms) {
        var $li = activeDot();
        $rail.children("li").removeClass("is-running");
        if (paused || !$li.length) return;
        $li.get(0).style.setProperty("--fq-slide-dur", ms / 1000 + "s");
        void $li.get(0).offsetWidth; // restart the fill from zero
        $li.addClass("is-running");
      };

      var keepActiveInView = function () {
        var list = $rail.get(0), li = activeDot().get(0);
        if (!list || !li || list.scrollWidth <= list.clientWidth) return;
        // land the current model just past the left edge fade (14% of the rail), never inside it
        var fade = Math.ceil(list.clientWidth * 0.16);
        list.scrollTo({ left: Math.max(0, li.offsetLeft - list.offsetLeft - fade), behavior: reduceMotion ? "auto" : "smooth" });
      };

      var schedule = function () {
        clearTimeout(timer);
        $rail.children("li").each(function () {
          this.querySelector(".hero-rail__btn").setAttribute("aria-current", $(this).hasClass("active") ? "true" : "false");
        });
        keepActiveInView();

        var video = $hero.find(".owl-item.active video.hero-video").get(0);
        $hero.find("video.hero-video").each(function () {
          if (this !== video) { this.onended = null; this.pause(); }
        });

        if (video && !reduceMotion) {
          // the Eximius film plays once through, then the slider moves on
          video.onended = paused ? null : goNext;
          try { video.currentTime = 0; } catch (e) {}
          var p = video.play();
          var ms = (video.duration && isFinite(video.duration) ? video.duration * 1000 : 8475);
          startProgress(ms);
          if (!paused) timer = setTimeout(goNext, ms + SAFETY_PAD_MS);
          if (p && typeof p.catch === "function") {
            p.catch(function () { // autoplay refused: treat as a still
              clearTimeout(timer); video.onended = null;
              startProgress(PHOTO_MS);
              if (!paused) timer = setTimeout(goNext, PHOTO_MS);
            });
          }
          return;
        }

        startProgress(PHOTO_MS);
        if (!paused) timer = setTimeout(goNext, PHOTO_MS);
      };

      $rail.on("scroll", function () { this.classList.toggle("is-scrolled", this.scrollLeft > 4); });

      // rail buttons: our handler only (owl delegates clicks on any <button> in the dots container)
      $rail.on("click", ".hero-rail__btn", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var i = $(this).closest("li").index();
        if ($(this).closest("li").hasClass("active")) { schedule(); return; }
        $hero.trigger("to.owl.carousel", [i, 300]);
      });

      $pause.on("click", function () {
        paused = !paused;
        this.setAttribute("aria-pressed", paused ? "true" : "false");
        this.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        var v = $hero.find(".owl-item.active video.hero-video").get(0);
        if (v && paused) v.pause();
        schedule();
      });
      if (reduceMotion) { $pause.attr({ "aria-pressed": "true", "aria-label": "Play slideshow" }); }

      // a background tab must not keep rotating; restart the current slide on return
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          clearTimeout(timer);
          $rail.children("li").removeClass("is-running");
          $hero.find("video.hero-video").each(function () { this.pause(); });
        } else {
          schedule();
        }
      });

      // a slide change (not first load): copy waits for the shutter to cross the text column
      $hero.on("translate.owl.carousel", function () {
        clearTimeout(timer);
        $hero.find(".owl-item.active").each(function () { this.style.setProperty("--rv-base", "0.7s"); });
      });
      $hero.on("translated.owl.carousel", schedule);
      $hero.trigger("stop.owl.autoplay");
      schedule();
    }

    /* ---------- 3. Footer map — live, monochrome ---------- */
    (function () {
      var el = document.getElementById("fq-map");
      if (!el || !window.L) return; // no Leaflet → the static map and pin link stay
      var DEALER = [35.61448, -78.737002]; // 2900 N Main St, Fuquay-Varina, NC 27526
      var DIRECTIONS = "https://www.google.com/maps/dir/?api=1&destination=2900+N+Main+St,+Fuquay-Varina,+NC+27526";
      var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

      var map = L.map(el, {
        center: DEALER,
        zoom: 16,
        scrollWheelZoom: false, // the page keeps the wheel
        dragging: !touch,       // one finger scrolls the page, not the map
        zoomControl: false,
        attributionControl: true
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.attributionControl.setPrefix(false); // OSM credit (required) stays; library badge goes
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);

      var pin = L.icon({
        iconUrl: "wp-content/themes/aanWordpress/assets/images/footer-location.svg",
        iconSize: [35, 50],
        iconAnchor: [17.5, 50],
        className: "fq-pin"
      });
      L.marker(DEALER, { icon: pin, title: "Karma of Fuquay — get directions", alt: "Karma of Fuquay", keyboard: true })
        .addTo(map)
        .on("click", function () { window.open(DIRECTIONS, "_blank", "noopener"); });

      el.parentNode.classList.add("is-live");
      // the box may be sized after load (fonts, lazy content): keep tiles in step
      if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize(); }).observe(el);
    })();

    /* ---------- 2. Current Models ---------- */
    var rows = document.querySelectorAll(".model-row");
    if (!rows.length || reduceMotion || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    var heading = document.querySelector(".models-section__heading h2");
    if (heading) wrapLines([heading]);

    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
      if (heading) {
        gsap.fromTo(heading, { yPercent: 115 }, {
          yPercent: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: heading.parentNode, start: "top 88%", once: true }
        });
      }

      rows.forEach(function (row) {
        var media = row.querySelector(".model-row__media");
        var img = media && media.querySelector("img");
        var text = row.querySelector(".model-row__text");

        // photo: shutter opens right→left while the car drives in nose-first (all frames face left)
        if (media && img) {
          gsap.timeline({
            scrollTrigger: { trigger: media, start: "top 92%", end: "top 58%", scrub: 0.8 }
          })
            .fromTo(media, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, 0)
            .fromTo(img, { xPercent: 16, scale: 1.06 }, { xPercent: 0, scale: 1, ease: "power2.out", duration: 1 }, 0);
        }

        // copy: plays once on entry (time-based, so a stopped scroll never leaves a half-hidden line)
        if (text) {
          var lines = Array.prototype.slice.call(text.children);
          wrapLines(lines);
          gsap.fromTo(lines, { yPercent: 115 }, {
            yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.09,
            scrollTrigger: { trigger: text, start: "top 86%", once: true }
          });
        }
      });

      // lazy images and the AJAX inventory above can shift layout: re-measure once everything is in
      $(window).on("load", function () { ScrollTrigger.refresh(); });
    });
  });
})(jQuery);
