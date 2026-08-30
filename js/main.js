/* ==========================================================================
   Blue Orbit Digi - site scripts
   Plain JavaScript, no libraries. Every block checks for the elements it
   needs, so a page that does not contain them simply skips that block.

   1  Header state on scroll      2  Mobile menu
   3  Service filter              4  Contact form
   5  Motion setup                6  Smooth (lerped) scrolling
   7  Scroll progress bar         8  Reveal on scroll
   9  Hero headline word reveal  10  Counting stats
  11  Parallax                   12  Logo marquee
  13  Footer year
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 1. Header background on scroll ---------- */
  var header = document.querySelector(".site-header");

  if (header) {
    var onHeaderScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-scrolled", y > 40);
    };
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ---------- 2. Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    var setMenu = function (open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      // Lock the page behind the panel so the background cannot scroll away
      document.documentElement.classList.toggle("menu-open", open);
    };

    var closeMenu = function (refocus) {
      if (!links.classList.contains("is-open")) { return; }
      setMenu(false);
      if (refocus) { toggle.focus(); }
    };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!links.classList.contains("is-open"));
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) { closeMenu(false); }
    });

    // Tapping anywhere outside the panel closes it
    document.addEventListener("click", function (e) {
      if (!links.classList.contains("is-open")) { return; }
      if (!links.contains(e.target) && e.target !== toggle) { closeMenu(false); }
    });

    // Escape closes it and puts focus back on the button that opened it
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") { closeMenu(true); }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) { closeMenu(false); }
    });
  }

  /* ---------- 3. Service filter chips (home page) ---------- */
  var chips = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll("[data-type]");

  if (chips.length && cards.length) {
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        var wanted = this.getAttribute("data-filter");

        for (var c = 0; c < chips.length; c++) {
          chips[c].classList.toggle("is-active", chips[c] === this);
          chips[c].setAttribute("aria-pressed", chips[c] === this ? "true" : "false");
        }

        for (var d = 0; d < cards.length; d++) {
          var type = cards[d].getAttribute("data-type");
          cards[d].hidden = !(wanted === "all" || wanted === type);
        }
      });
    }
  }

  /* ---------- 4. Contact form ---------- */
  var form = document.querySelector("#enquiry-form");

  if (form) {
    var msg = document.querySelector("#form-msg");

    var say = function (text, isError) {
      if (!msg) { return; }
      msg.textContent = text;
      msg.classList.add("is-shown");
      msg.classList.toggle("is-error", !!isError);
    };

    // send.php redirects back here with ?sent=1 or ?error=1
    if (/[?&]sent=1/.test(window.location.search)) {
      say("Thanks — your enquiry is on its way. We reply within one business day.", false);
      form.reset();
      history.replaceState(null, "", window.location.pathname);
    } else if (/[?&]error=1/.test(window.location.search)) {
      say("Sorry, that did not send. Please email info@blueorbitdigi.com directly.", true);
      history.replaceState(null, "", window.location.pathname);
    }

    form.addEventListener("submit", function (e) {
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      if (!name || !validEmail) {
        e.preventDefault();
        say("Please add your name and a valid email address so we can reply.", true);
        return;
      }

      // Valid: let the browser post it to send.php, which mails the
      // enquiry and redirects back here with ?sent=1 or ?error=1.
    });
  }

  /* ---------- 5. Motion setup ---------- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Touch devices already have good momentum scrolling of their own, and
  // taking it over makes things worse. Only fine pointers get the lerp.
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var canAnimate = !reduceMotion && "IntersectionObserver" in window;

  /* ---------- 6. Smooth (lerped) scrolling ----------
     Rather than transforming the page - which breaks the sticky header - this
     eases the real scroll position towards a target each frame. Everything
     native (sticky, anchors, the scrollbar) keeps working. */
  var lerpActive = false;

  if (!reduceMotion && finePointer) {
    var target = window.scrollY;
    var current = target;
    var ticking = false;
    var lastSet = target;
    var EASE = 0.11;      // higher = snappier, lower = floatier
    var STEP = 0.85;      // damping applied to each wheel notch

    var maxScroll = function () {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    var run = function () {
      current += (target - current) * EASE;

      // Close enough - land exactly and stop the loop
      if (Math.abs(target - current) < 0.35) { current = target; }

      lastSet = current;
      window.scrollTo(0, current);

      if (current === target) { ticking = false; return; }
      requestAnimationFrame(run);
    };

    var start = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    };

    window.addEventListener("wheel", function (e) {
      // Leave pinch-zoom and modifier gestures alone
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) { return; }

      e.preventDefault();
      var delta = e.deltaY * (e.deltaMode === 1 ? 24 : e.deltaMode === 2 ? window.innerHeight : 1);
      target = Math.max(0, Math.min(maxScroll(), target + delta * STEP));
      start();
    }, { passive: false });

    // If the page moved some other way (keyboard, scrollbar, find-in-page),
    // adopt that position instead of yanking back to our target.
    window.addEventListener("scroll", function () {
      if (Math.abs(window.scrollY - lastSet) > 2) {
        target = current = window.scrollY;
      }
    }, { passive: true });

    window.addEventListener("resize", function () {
      target = Math.max(0, Math.min(maxScroll(), target));
    }, { passive: true });

    // Same-page anchor links glide instead of jumping
    document.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) { return; }

      var id = link.getAttribute("href");
      if (id.length < 2) { return; }

      var dest = document.getElementById(id.slice(1));
      if (!dest) { return; }

      e.preventDefault();
      var top = dest.getBoundingClientRect().top + window.scrollY - 90;
      target = Math.max(0, Math.min(maxScroll(), top));
      start();
      history.replaceState(null, "", id);

      // Taking over the jump also takes away the focus move the browser would
      // normally do, which would strand keyboard users on the skip link.
      if (!dest.hasAttribute("tabindex")) { dest.setAttribute("tabindex", "-1"); }
      dest.focus({ preventScroll: true });
    });

    lerpActive = true;
    document.documentElement.classList.add("has-lerp");
  }

  /* ---------- 7. Scroll progress bar ---------- */
  var bar = document.querySelector(".scroll-progress span");

  if (bar && !reduceMotion) {
    var barQueued = false;

    var drawBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, pct)).toFixed(4) + ")";
      barQueued = false;
    };

    window.addEventListener("scroll", function () {
      if (!barQueued) { barQueued = true; requestAnimationFrame(drawBar); }
    }, { passive: true });

    drawBar();
  }

  /* ---------- 8. Reveal on scroll ----------
     Containers stagger their children; standalone blocks fade in on their own.
     The selector list mirrors the one in section 18 of style.css. */
  if (canAnimate) {
    var GROUPS = ".hero .container, .service-grid, .grid-2, .grid-3, .grid-4, " +
                 ".plan-grid, .plan-grid-4, .split, .form-grid, .footer-top";
    var SINGLES = ".section-head, .logo-strip, .note-strip, .table-title, .table-wrap, .cta";
    var HIDDEN = GROUPS.split(", ").map(function (g) { return g + " > *"; })
                 .concat(SINGLES.split(", ")).join(", ");

    // Show one element, either with its transition or immediately
    var show = function (el, delay, instant) {
      if (instant) {
        el.style.transition = "none";
        el.classList.add("is-in");
        requestAnimationFrame(function () { el.style.transition = ""; });
        return;
      }
      el.style.transitionDelay = delay ? delay + "ms" : "";
      el.classList.add("is-in");
    };

    // Anything hidden inside a block that just revealed is shown at once, so
    // nested items never animate a second time behind their own parent.
    var markInside = function (el, instant) {
      var inner = el.querySelectorAll(HIDDEN);
      for (var i = 0; i < inner.length; i++) { show(inner[i], 0, instant); }
    };

    var units = [];   // everything still waiting to be revealed

    // animate = false means "just show it", used for anything already passed
    var reveal = function (el, animate) {
      var instant = !animate;

      if (el.hasAttribute("data-group")) {
        var kids = el.children;
        var step = 0;
        for (var k = 0; k < kids.length; k++) {
          if (kids[k].classList.contains("is-in")) { continue; }
          show(kids[k], animate ? step * 95 : 0, instant);
          markInside(kids[k], instant);
          step++;
        }
      } else {
        show(el, 0, instant);
        markInside(el, instant);
      }
    };

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) { continue; }
        var el = entries[i].target;
        observer.unobserve(el);
        if (!el.classList.contains("is-in")) { reveal(el, true); }
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

    var watch = function (el, isGroup) {
      if (isGroup) { el.setAttribute("data-group", ""); }
      units.push(el);
      observer.observe(el);
    };

    var groups = document.querySelectorAll(GROUPS);
    for (var g = 0; g < groups.length; g++) { watch(groups[g], true); }

    var singles = document.querySelectorAll(SINGLES);
    for (var s = 0; s < singles.length; s++) { watch(singles[s], false); }

    /* An element that goes from below the fold to above it in a single jump
       never intersects the viewport, so the observer above never fires for it
       and it would stay invisible forever. That happens on anchor jumps, fast
       scrolling, and when the browser restores your scroll position on
       reload. This sweep catches anything already scrolled past and shows it
       straight away, with no animation - it is behind the reader already. */
    var sweepQueued = false;

    var sweep = function () {
      sweepQueued = false;
      var remaining = [];

      for (var i = 0; i < units.length; i++) {
        var el = units[i];

        if (el.classList.contains("is-in")) { continue; }

        if (el.getBoundingClientRect().bottom < 0) {
          observer.unobserve(el);
          reveal(el, false);
          continue;
        }
        remaining.push(el);
      }
      units = remaining;
    };

    window.addEventListener("scroll", function () {
      if (!sweepQueued) { sweepQueued = true; requestAnimationFrame(sweep); }
    }, { passive: true });

    window.addEventListener("load", sweep);
    sweep();
  }

  /* ---------- 9. Hero headline, revealed a word at a time ----------
     Text is split into words and each is slid up behind its own mask. Child
     elements (the gradient <em>) are kept whole so their styling survives. */
  var headline = document.querySelector(".hero h1");

  if (headline && canAnimate) {
    var wrapWord = function (text) {
      var span = document.createElement("span");
      span.className = "word";
      var inner = document.createElement("i");
      inner.textContent = text;
      span.appendChild(inner);
      return span;
    };

    var pieces = [];
    var nodes = Array.prototype.slice.call(headline.childNodes);

    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];

      if (node.nodeType === 3) {
        var words = node.textContent.split(/(\s+)/);
        for (var w = 0; w < words.length; w++) {
          if (!words[w]) { continue; }
          if (/^\s+$/.test(words[w])) { pieces.push(document.createTextNode(" ")); }
          else { pieces.push(wrapWord(words[w])); }
        }
      } else {
        // Keep the element itself, but mask and slide it as one unit
        var holder = document.createElement("span");
        holder.className = "word";
        var lift = document.createElement("i");
        lift.appendChild(node.cloneNode(true));
        holder.appendChild(lift);
        pieces.push(holder);
      }
    }

    headline.textContent = "";
    for (var p = 0; p < pieces.length; p++) { headline.appendChild(pieces[p]); }
    headline.classList.add("has-words");

    // Stagger the words, then start just after the hero settles
    var wordSpans = headline.querySelectorAll(".word > i");
    for (var q = 0; q < wordSpans.length; q++) {
      wordSpans[q].style.transitionDelay = (60 + q * 55) + "ms";
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { headline.classList.add("words-in"); });
    });
  }

  /* ---------- 10. Counting stats ---------- */
  var counters = document.querySelectorAll(".stat-num");

  if (counters.length && canAnimate) {
    var countUp = function (el) {
      var parts = /^(\D*)(\d+)(.*)$/.exec(el.textContent.trim());
      if (!parts) { return; }

      var prefix = parts[1], final = parseInt(parts[2], 10), suffix = parts[3];
      if (final === 0) { return; }

      var startedAt = null;
      var DURATION = 1500;

      var tick = function (now) {
        if (startedAt === null) { startedAt = now; }
        var t = Math.min(1, (now - startedAt) / DURATION);
        var eased = 1 - Math.pow(1 - t, 4);   // ease-out quart
        el.textContent = prefix + Math.round(final * eased) + suffix;
        if (t < 1) { requestAnimationFrame(tick); }
      };

      el.textContent = prefix + "0" + suffix;
      requestAnimationFrame(tick);
    };

    var countObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          countObserver.unobserve(entries[i].target);
          countUp(entries[i].target);
        }
      }
    }, { threshold: 0.6 });

    for (var cn = 0; cn < counters.length; cn++) { countObserver.observe(counters[cn]); }
  }

  /* ---------- 11. Parallax ---------- */
  var layers = document.querySelectorAll("[data-parallax]");

  if (layers.length && !reduceMotion && finePointer) {
    var parallaxQueued = false;

    var drawParallax = function () {
      var mid = window.innerHeight / 2;

      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var box = el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > window.innerHeight + 200) { continue; }

        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var shift = ((box.top + box.height / 2) - mid) * speed;
        el.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
      }
      parallaxQueued = false;
    };

    window.addEventListener("scroll", function () {
      if (!parallaxQueued) { parallaxQueued = true; requestAnimationFrame(drawParallax); }
    }, { passive: true });

    window.addEventListener("resize", drawParallax, { passive: true });
    drawParallax();
  }

  /* ---------- 12. Logo marquee ----------
     The row is wrapped and duplicated so the CSS loop is seamless. */
  var strip = document.querySelector(".logo-strip ul");

  if (strip && !reduceMotion) {
    var wrapper = document.createElement("div");
    wrapper.className = "marquee";
    strip.parentNode.insertBefore(wrapper, strip);
    wrapper.appendChild(strip);

    var originals = Array.prototype.slice.call(strip.children);
    for (var m = 0; m < originals.length; m++) {
      var copy = originals[m].cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      strip.appendChild(copy);
    }
  }

  /* ---------- 13. Tabs (services page) ----------
     Shows one comparison table at a time. The tab strip carries `hidden` in
     the HTML and is revealed here, so with JavaScript off all the panels
     simply stack and stay readable. */
  var tablist = document.querySelector('[role="tablist"]');

  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var panelFor = function (tab) { return document.getElementById(tab.getAttribute("aria-controls")); };

    var select = function (tab, moveFocus) {
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i] === tab;
        var panel = panelFor(tabs[i]);

        tabs[i].setAttribute("aria-selected", on ? "true" : "false");
        tabs[i].setAttribute("tabindex", on ? "0" : "-1");
        if (panel) { panel.hidden = !on; }
      }
      if (moveFocus) { tab.focus(); }

      // Let the reveal system catch up with whatever just became visible
      window.dispatchEvent(new Event("scroll"));
    };

    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener("click", function () { select(this, false); });

      tabs[t].addEventListener("keydown", function (e) {
        var i = tabs.indexOf(this);
        var next = null;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") { next = tabs[(i + 1) % tabs.length]; }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
        else if (e.key === "Home") { next = tabs[0]; }
        else if (e.key === "End") { next = tabs[tabs.length - 1]; }

        if (next) { e.preventDefault(); select(next, true); }
      });
    }

    // Links elsewhere on the site point at services.html#seo and the like,
    // so open the tab the visitor actually asked for.
    var fromHash = function () {
      var id = window.location.hash.slice(1);
      if (!id) { return null; }
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute("aria-controls") === id) { return tabs[i]; }
      }
      return null;
    };

    tablist.hidden = false;
    select(fromHash() || tabs[0], false);

    window.addEventListener("hashchange", function () {
      var tab = fromHash();
      if (tab) { select(tab, false); }
    });
  }

  /* ---------- 14. Current year in the footer ---------- */
  var years = document.querySelectorAll(".js-year");
  for (var y = 0; y < years.length; y++) {
    years[y].textContent = new Date().getFullYear();
  }
})();
