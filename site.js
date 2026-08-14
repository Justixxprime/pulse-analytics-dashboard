/* ==========================================================================
   PULSE — site.js
   Shared on every page: theme (incl. "system"), mobile menu, scroll reveal,
   the notification bell, a small focus-trap helper for overlays, and a
   shared toast() that supports an optional "Undo" button.
   ========================================================================== */

/* ---------------------------------------------------------------------
   THEME — "light" | "dark" | "system"
   The anti-flash inline script in <head> already applied the right class
   before paint. Here we just keep everything else in sync: the simple
   nav switches (which always toggle explicitly between light/dark), the
   3-way segmented control on the Settings page (data-theme-set), and a
   live listener so switching your OS theme while "system" is selected
   updates Pulse immediately, no refresh needed.
--------------------------------------------------------------------- */
const SYSTEM_DARK_QUERY = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function effectiveIsDark(pref) {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return SYSTEM_DARK_QUERY ? SYSTEM_DARK_QUERY.matches : false; // "system" or unset
}

function applyTheme(pref) {
  const isDark = effectiveIsDark(pref);
  document.documentElement.classList.toggle("dark", isDark);
  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themeSet === pref);
  });

  // Keep the browser/status-bar chrome color (Android address bar, iOS
  // Safari's top bar, the installed-PWA title bar) matching whichever
  // theme is actually showing — not just a fixed brand color that would
  // look wrong against a dark page.
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.setAttribute("content", isDark ? "#0A0D18" : "#F5F6FA");

  // The hero phone mockup: tries the real file first (images/phone-preview.jpg
  // or -dark.jpg — swap either one out any time to customize it), and falls
  // back automatically to a version baked directly into the page if that
  // file can't load for any reason (wrong path, a server config quirk,
  // browser cache holding something stale) — so this can never show up
  // broken, only ever the real file or a guaranteed-good default.
  // Guarded to only run once per theme: applyTheme() can get called again
  // for the *same* theme (e.g. the settings page's 3-way switch firing on
  // load), and without this guard that second call would blindly re-point
  // src at the file path even after the fallback already kicked in and
  // succeeded — undoing it, with the onerror handler already spent.
  const phoneImg = document.getElementById("phone-preview-img");
  if (phoneImg) {
    const themeKey = isDark ? "dark" : "light";
    if (phoneImg.dataset.loadedTheme !== themeKey) {
      phoneImg.dataset.loadedTheme = themeKey;
      phoneImg.dataset.usedFallback = "";
      phoneImg.dataset.currentFallback = (isDark ? phoneImg.dataset.fallbackDark : phoneImg.dataset.fallbackLight) || "";
      const wanted = isDark ? phoneImg.dataset.darkSrc : phoneImg.dataset.lightSrc;
      if (wanted) phoneImg.src = wanted;
    }
  }
}

function setThemePreference(pref) {
  localStorage.setItem("pulse-theme", pref);
  applyTheme(pref);
}

function initTheme() {
  const stored = localStorage.getItem("pulse-theme") || "system";
  applyTheme(stored);

  // simple nav switches: always flip explicitly between light and dark
  let themeTransitionInFlight = false;
  document.querySelectorAll("[data-theme-toggle]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const now = document.documentElement.classList.contains("dark") ? "light" : "dark";
      // A circular reveal expanding from the exact spot you clicked — if
      // the browser doesn't support View Transitions yet, or a fast
      // double-click/tap fires this before the last transition finished,
      // this just skips straight to the plain instant switch below, so
      // nothing ever breaks, it just isn't as fancy in that case.
      if (
        document.startViewTransition &&
        !themeTransitionInFlight &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        const x = e.clientX, y = e.clientY;
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        themeTransitionInFlight = true;
        document.documentElement.setAttribute("data-view-transition-kind", "theme");
        const transition = document.startViewTransition(() => setThemePreference(now));
        transition.ready
          .then(() => {
            document.documentElement.animate(
              { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
              { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" }
            );
          })
          .catch(() => {}); // the browser can legitimately skip a transition (e.g. a second one starting) — that's not an error, just nothing to animate
        transition.finished.finally(() => {
          themeTransitionInFlight = false;
          document.documentElement.removeAttribute("data-view-transition-kind");
        });
      } else {
        setThemePreference(now);
      }
    });
  });

  // 3-way control on Settings: data-theme-set="light|dark|system"
  document.querySelectorAll("[data-theme-set]").forEach((el) => {
    el.addEventListener("click", () => setThemePreference(el.dataset.themeSet));
  });

  if (SYSTEM_DARK_QUERY) {
    SYSTEM_DARK_QUERY.addEventListener("change", () => {
      const pref = localStorage.getItem("pulse-theme") || "system";
      if (pref === "system") applyTheme(pref);
    });
  }
}

/* ---------------------------------------------------------------------
   FOCUS TRAP — for the mobile drawer, widget panel, notification
   dropdown, and command palette. Keeps Tab cycling inside the open
   panel and returns focus to whatever opened it once it closes.
--------------------------------------------------------------------- */
function trapFocus(container, triggerEl) {
  const focusables = container.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusables.length) focusables[0].focus();

  function handleKeydown(e) {
    if (e.key !== "Tab") return;
    const items = [...container.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener("keydown", handleKeydown);
  return function release() {
    container.removeEventListener("keydown", handleKeydown);
    if (triggerEl) triggerEl.focus();
  };
}

/* ---------------------------------------------------------------------
   MOBILE MENU
--------------------------------------------------------------------- */
function initMobileMenu() {
  const openBtn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("mobile-menu");
  if (!openBtn || !menu) return;
  let release = null;
  const close = () => {
    menu.dataset.open = "false"; openBtn.dataset.open = "false"; document.body.style.overflow = "";
    if (release) { release(); release = null; }
  };
  const open = () => {
    menu.dataset.open = "true"; openBtn.dataset.open = "true"; document.body.style.overflow = "hidden";
    release = trapFocus(menu, openBtn);
  };
  openBtn.addEventListener("click", () => (menu.dataset.open === "true" ? close() : open()));
  menu.querySelectorAll("a, [data-close-menu]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.dataset.open === "true") close(); });
}

/* ---------------------------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

/* Anything built with `[data-reveal]` markup gets its "wait until scrolled
   into view" behavior from the IntersectionObserver above — but that
   observer is only set up once, at page load, over whatever already
   exists in the DOM. Cards a page builds *later* with JS (KPI cards that
   render after a simulated loading delay, for example) are never handed
   to that observer, so they'd sit at permanent opacity:0 forever — still
   taking up their full height, just invisible, which looks exactly like
   a blank gap where content should be. Call this right after injecting
   any new `[data-reveal]` markup so it appears immediately instead.
   (Scroll-triggered reveal makes sense for content that was already on
   the page before you started scrolling; content that just finished
   "loading" should simply show up, not wait to be scrolled to.) */
function revealNow(container) {
  container.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
}

/* ---------------------------------------------------------------------
   STAT COUNTERS — the homepage "11 / 0ms / 4 / 100%" numbers count up
   (or down, for the "0ms" delay stat, which starts at a plausible
   non-zero number and counts DOWN to 0 to sell the "instant" claim)
   the first time each one scrolls into view. Same easing curve as the
   card-hover/tilt system elsewhere for a consistent feel, and fully
   skipped under prefers-reduced-motion — the final value is just set
   immediately, no motion, same as every other animation in Pulse.
--------------------------------------------------------------------- */
function initStatCounters() {
  const items = document.querySelectorAll("[data-count-to]");
  if (!items.length) return;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(el) {
    const to = parseFloat(el.dataset.countTo);
    const from = parseFloat(el.dataset.countFrom || "0");
    const suffix = el.dataset.countSuffix || "";
    if (reduced) { el.textContent = to + suffix; return; }
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const val = Math.round(from + (to - from) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!("IntersectionObserver" in window)) { items.forEach(animate); return; }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); }
    }),
    { threshold: 0.6 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   NOTIFICATION BELL — a small dropdown, same open/close mechanics as
   everything else. Mock data lives right here since it's identical on
   every page.
--------------------------------------------------------------------- */
const NOTIFICATIONS = [
  { icon: "fa-cart-shopping", color: "var(--primary)", title: "New order #10482", body: "Amara Chen just placed a $214.00 order.", time: "2m ago", day: "Today", unread: true },
  { icon: "fa-user-plus", color: "var(--teal)", title: "New customer signed up", body: "Priya Nair created an account.", time: "1h ago", day: "Today", unread: true },
  { icon: "fa-triangle-exclamation", color: "var(--amber)", title: "Low stock warning", body: "Sony Alpha Mirrorless Camera has 9 units left.", time: "3h ago", day: "Today", unread: true },
  { icon: "fa-circle-check", color: "var(--success)", title: "Order #10480 fulfilled", body: "Kwame Mensah's order shipped.", time: "Yesterday", day: "Yesterday", unread: false },
];

function renderNotifications() {
  const list = document.getElementById("notif-list");
  const badge = document.getElementById("notif-badge");
  if (!list) return;
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  if (badge) {
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
  }

  if (!NOTIFICATIONS.length) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-10 px-6">
        <i class="fa-regular fa-bell-slash text-2xl text-text-soft mb-2"></i>
        <p class="text-sm text-text-soft">You're all caught up.</p>
      </div>`;
    return;
  }

  // group consecutive-in-array items by their "day" bucket (Today,
  // Yesterday, ...) so the panel reads like Gmail/Slack instead of one
  // flat list once there's more than a handful of notifications
  const groups = [];
  NOTIFICATIONS.forEach((n, i) => {
    const last = groups[groups.length - 1];
    if (last && last.day === n.day) last.items.push({ ...n, index: i });
    else groups.push({ day: n.day, items: [{ ...n, index: i }] });
  });

  list.innerHTML = groups.map((group) => `
    <p class="text-[10px] font-mono uppercase tracking-wide text-text-soft px-4 pt-3 pb-1.5 sticky top-0 bg-surface">${group.day}</p>
    ${group.items.map((n) => `
    <div data-notif-index="${n.index}" class="notif-item group w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-2 transition-colors cursor-pointer ${n.unread ? "" : "opacity-60"}">
      <div class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style="background:color-mix(in srgb, ${n.color} 15%, transparent)">
        <i class="fa-solid ${n.icon} text-xs" style="color:${n.color}"></i>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium leading-snug">${n.title}</p>
        <p class="text-xs text-text-soft mt-0.5">${n.body}</p>
        <p class="text-[10px] font-mono text-text-soft mt-1">${n.time}</p>
      </div>
      ${n.unread ? '<span class="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></span>' : ""}
      <button type="button" class="notif-dismiss h-6 w-6 rounded-md flex items-center justify-center shrink-0 text-text-soft hover:text-danger hover:bg-surface-2 opacity-0 group-hover:opacity-100 focus:opacity-100" data-notif-index="${n.index}" aria-label="Dismiss notification"><i class="fa-solid fa-xmark text-[10px]"></i></button>
    </div>`).join("")}
  `).join("");
}

function initNotifications() {
  const btn = document.getElementById("notif-btn");
  const panel = document.getElementById("notif-panel");
  if (!btn || !panel) return;
  renderNotifications();
  let release = null;
  const close = () => { panel.dataset.open = "false"; if (release) { release(); release = null; } };
  const open = () => { panel.dataset.open = "true"; release = trapFocus(panel, btn); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); panel.dataset.open === "true" ? close() : open(); });
  document.addEventListener("click", (e) => { if (panel.dataset.open === "true" && !panel.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.dataset.open === "true") close(); });
  document.getElementById("notif-mark-read")?.addEventListener("click", () => {
    NOTIFICATIONS.forEach((n) => (n.unread = false));
    renderNotifications();
  });
  document.getElementById("notif-clear-all")?.addEventListener("click", () => {
    if (!NOTIFICATIONS.length) return;
    const removed = NOTIFICATIONS.splice(0, NOTIFICATIONS.length);
    renderNotifications();
    toast("Notifications cleared", "ok", { label: "Undo", onUndo: () => { NOTIFICATIONS.push(...removed); renderNotifications(); } });
  });
  document.getElementById("notif-list")?.addEventListener("click", (e) => {
    const dismiss = e.target.closest(".notif-dismiss");
    if (dismiss) {
      const idx = Number(dismiss.dataset.notifIndex);
      NOTIFICATIONS.splice(idx, 1);
      renderNotifications();
      return;
    }
    const item = e.target.closest(".notif-item");
    if (!item) return;
    const n = NOTIFICATIONS[Number(item.dataset.notifIndex)];
    if (n && n.unread) { n.unread = false; renderNotifications(); }
  });
}

/* ---------------------------------------------------------------------
   COPY TO CLIPBOARD — used on ID columns (orders, invoices, products).
   Flashes a checkmark on the button that was clicked, then confirms with
   the shared toast. Exposed on window since table rows are rendered as
   HTML strings with inline onclick handlers, not addEventListener.
--------------------------------------------------------------------- */
function copyToClipboard(text, btn) {
  const done = () => {
    if (btn) {
      const icon = btn.querySelector("i");
      if (icon) {
        const original = icon.className;
        icon.className = "fa-solid fa-check text-[10px]";
        setTimeout(() => { icon.className = original; }, 1100);
      }
    }
    toast(`Copied ${text}`);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => toast("Couldn't copy — try selecting it manually", "error"));
  } else {
    done();
  }
}
window.copyToClipboard = copyToClipboard;

/* ---------------------------------------------------------------------
   TOAST — shared everywhere. Optional undo button: pass an
   { label, onUndo } object as the third argument.
--------------------------------------------------------------------- */
function toast(message, kind = "ok", undo) {
  const wrap = document.getElementById("toast-wrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = `toast font-mono text-xs px-3 py-2 rounded-lg shadow border card flex items-center gap-3 ${kind === "error" ? "text-danger" : ""}`;
  const msg = document.createElement("span");
  msg.textContent = message;
  el.appendChild(msg);
  if (undo) {
    const btn = document.createElement("button");
    btn.textContent = undo.label || "Undo";
    btn.className = "text-primary font-semibold underline shrink-0";
    btn.addEventListener("click", () => { undo.onUndo(); el.remove(); });
    el.appendChild(btn);
  }
  wrap.appendChild(el);
  setTimeout(() => el.remove(), undo ? 5000 : 2800);
}

/* ---------------------------------------------------------------------
   3D TILT — any element with class "tilt-wrap" containing one child with
   class "tilt-el" gets a subtle perspective tilt that follows the
   pointer. The math: find where the pointer is inside the box as a 0-1
   fraction on each axis, subtract 0.5 so the center is "0" and the edges
   are "+/-0.5", then scale that into a small rotation in degrees. Mouse
   near the top rotates the element to lean back, mouse near the bottom
   makes it lean forward, same idea left/right — CSS 3D perspective does
   the rest. On mouse-leave everything eases back to flat.
--------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   SPOTLIGHT — the glow itself is pure CSS (a radial-gradient reading two
   variables); this just keeps those two variables pointed at the cursor.
   One delegated listener on `document`, same reasoning as initTilt: it
   automatically covers cards that don't exist yet at page-load time
   (widgets you add later, KPI cards that render after a loading delay).
--------------------------------------------------------------------- */
function initSpotlight() {
  document.addEventListener("pointermove", (e) => {
    const card = e.target?.closest?.(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
  });
}

function initTilt() {
  document.addEventListener("pointermove", (e) => {
    const wrap = e.target?.closest?.(".tilt-wrap");
    if (!wrap) return;
    const el = wrap.querySelector(".tilt-el");
    if (!el) return;
    const maxDeg = parseFloat(wrap.dataset.tiltMax || "8");
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", (px * maxDeg * 2).toFixed(2) + "deg");
    el.style.setProperty("--rx", (py * -maxDeg * 2).toFixed(2) + "deg");
  });
  document.addEventListener("pointerout", (e) => {
    const wrap = e.target?.closest?.(".tilt-wrap");
    if (!wrap || wrap.contains(e.relatedTarget)) return;
    const el = wrap.querySelector(".tilt-el");
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
}

/* ---------------------------------------------------------------------
   BACK TO TOP — appears once the page has scrolled a bit, same
   show/hide data-attribute pattern as every other toggle in Pulse.
--------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  const onScroll = () => { btn.dataset.visible = window.scrollY > 500 ? "true" : "false"; };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------------------------------------------------------------
   PARALLAX — the blurred ambient orbs drift slightly slower than the
   page scrolls, which is what makes background elements read as "further
   away" (the same trick a video game background layer uses). Each orb
   gets a random-ish but stable speed from its position in the DOM so
   they don't all move in perfect unison.
--------------------------------------------------------------------- */
function initParallax() {
  const orbs = document.querySelectorAll(".ambient-orb");
  if (!orbs.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  const speeds = Array.from(orbs).map((_, i) => 0.06 + (i % 3) * 0.05);
  const update = () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => { orb.style.setProperty("--py", (y * speeds[i]).toFixed(1) + "px"); });
    ticking = false;
  };
  document.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ---------------------------------------------------------------------
   MAGNETIC BUTTONS — a button with class "magnetic" pulls slightly
   toward the cursor as it gets close, then springs back on leave. Same
   variable-writing pattern as tilt/spotlight: JS only ever updates two
   numbers (--mx/--my), CSS does the actual rendering via a transform
   that's already transitioning smoothly, so this stays cheap even with
   many buttons on a page.
--------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   CHART TOOLTIPS — replaces the browser's native `title` tooltip (slow
   to appear, unstyled, positioned wherever the browser feels like) with
   one styled element that follows the cursor immediately. One shared
   div for the whole page, moved and re-labeled on the fly, rather than
   creating/destroying elements per chart — cheaper and simpler than it
   sounds, and it's the same "one element, keep repositioning it" idea
   as the widget-drag ghost pill.
--------------------------------------------------------------------- */
function initChartTooltip() {
  const tip = document.createElement("div");
  tip.id = "chart-tooltip";
  tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);

  document.addEventListener("pointerover", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) return;
    tip.textContent = target.dataset.tooltip;
    tip.classList.add("chart-tooltip-visible");
  });
  document.addEventListener("pointermove", (e) => {
    if (!tip.classList.contains("chart-tooltip-visible")) return;
    tip.style.left = e.clientX + "px";
    tip.style.top = e.clientY + "px";
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest("[data-tooltip]") && !e.relatedTarget?.closest("[data-tooltip]")) {
      tip.classList.remove("chart-tooltip-visible");
    }
  });
}

/* ---------------------------------------------------------------------
   HERO SCROLL-SCRUB — the dashboard mockup in the homepage hero subtly
   leans back and shrinks as you scroll down past it, instead of just
   fading in once and sitting static. Unlike the pointer-tilt (which
   lives on the inner `.tilt-el` and eases with a spring), this writes
   straight to the OUTER `.hero-scrub` wrapper with no transition, so it
   tracks scroll position 1:1 — scroll-linked animation looks wrong the
   moment it lags behind your actual scrolling.
--------------------------------------------------------------------- */
function initHeroScrub() {
  const el = document.querySelector(".hero-scrub");
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  const update = () => {
    const r = el.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -r.top / (r.height * 0.9)));
    el.style.setProperty("--scroll-rx", (progress * -10).toFixed(2) + "deg");
    el.style.setProperty("--scroll-scale", (1 - progress * 0.06).toFixed(3));
    ticking = false;
  };
  document.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

function initMagnetic() {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.setProperty("--mx", (x * 0.25).toFixed(1) + "px");
      btn.style.setProperty("--my", (y * 0.25).toFixed(1) + "px");
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--mx", "0px");
      btn.style.setProperty("--my", "0px");
    });
  });
}

/* ---------------------------------------------------------------------
   NAV PROGRESS BAR — a thin bar across the top of the page that sweeps
   in in when you click a link to another page on the site, giving instant
   feedback that the click registered even before the page transition
   finishes. Pairs with the native View Transition (see the CSS
   `@view-transition` rule) but doesn't depend on it — this works even in
   browsers that don't support that API yet.
--------------------------------------------------------------------- */
function initNavProgress() {
  const bar = document.createElement("div");
  bar.id = "nav-progress";
  document.body.appendChild(bar);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    // only same-site page navigations, not #anchors, external links, or
    // links that open a new tab
    if (!href || href.startsWith("#") || href.startsWith("http") || link.target === "_blank") return;
    bar.classList.add("nav-progress-active");
    bar.style.width = "30%";
    requestAnimationFrame(() => { bar.style.width = "75%"; });
  });
  window.addEventListener("pageshow", () => {
    bar.style.width = "100%";
    setTimeout(() => { bar.classList.remove("nav-progress-active"); bar.style.width = "0%"; }, 200);
  });
}

/* ---------------------------------------------------------------------
   SHORTCUTS SHEET — press "?" anywhere (outside a text field) to see
   every keyboard shortcut in the app. Built on demand, same pattern as
   the command palette, so no page needs its own copy of the markup.
--------------------------------------------------------------------- */
function initShortcutsSheet() {
  let sheet = null;

  const SHORTCUTS = [
    { keys: ["⌘", "K"], desc: "Open the command palette (jump to a page, order, customer, product)" },
    { keys: ["Esc"], desc: "Close whatever panel, menu, or dialog is open" },
    { keys: ["↑", "↓"], desc: "Move through results in the command palette" },
    { keys: ["Enter"], desc: "Select the highlighted command palette result" },
    { keys: ["?"], desc: "Show this shortcuts sheet" },
  ];

  function build() {
    sheet = document.createElement("div");
    sheet.id = "shortcuts-sheet";
    sheet.dataset.open = "false";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Keyboard shortcuts");
    sheet.className = "fixed inset-0 z-[60]";
    const rows = SHORTCUTS.map(
      (s) => `
      <div class="flex items-center justify-between py-2.5 border-b border-border last:border-0">
        <span class="text-sm text-text-soft">${s.desc}</span>
        <span class="flex items-center gap-1 shrink-0 ml-4">${s.keys.map((k) => `<kbd>${k}</kbd>`).join('<span class="text-text-soft text-xs">+</span>')}</span>
      </div>`
    ).join("");
    sheet.innerHTML = `
      <div id="shortcuts-backdrop" class="cmdk-backdrop absolute inset-0"></div>
      <div class="relative max-w-md mx-auto mt-24 card p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-display font-semibold">Keyboard shortcuts</p>
          <button id="shortcuts-close" class="h-7 w-7 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-soft" aria-label="Close"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>
        ${rows}
      </div>`;
    document.body.appendChild(sheet);
    sheet.querySelector("#shortcuts-backdrop").addEventListener("click", close);
    sheet.querySelector("#shortcuts-close").addEventListener("click", close);
  }

  function open() {
    if (!sheet) build();
    sheet.dataset.open = "true";
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (!sheet) return;
    sheet.dataset.open = "false";
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", (e) => {
    if (sheet && sheet.dataset.open === "true" && e.key === "Escape") { close(); return; }
    if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    const editable = document.activeElement?.isContentEditable;
    if (tag === "INPUT" || tag === "TEXTAREA" || editable) return; // don't hijack "?" while typing
    e.preventDefault();
    open();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initNotifications();
  initTilt();
  initSpotlight();
  initMagnetic();
  initNavProgress();
  initChartTooltip();
  initHeroScrub();
  const grain = document.createElement("div");
  grain.className = "grain-overlay";
  grain.setAttribute("aria-hidden", "true");
  document.body.appendChild(grain);
  initBackToTop();
  initParallax();
  initShortcutsSheet();
});
