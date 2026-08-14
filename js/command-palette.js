/* ==========================================================================
   PULSE — command-palette.js
   A single Ctrl+K palette shared by every page. It searches two things:
   1) a fixed list of pages/actions (always shown first)
   2) a small hand-copied index of orders/customers/products, so you can
      jump straight to "Kwame Mensah" or "#10480" from anywhere in the app
      — not just from the one table that happens to be open right now.
   The palette itself is injected into the page as HTML the first time
   it's opened, so no page needs to remember to add the markup by hand.
   ========================================================================== */

const CMDK_PAGES = [
  { label: "Dashboard", icon: "fa-gauge", href: "dashboard.html" },
  { label: "Orders", icon: "fa-receipt", href: "orders.html" },
  { label: "Products", icon: "fa-box", href: "products.html" },
  { label: "Customers", icon: "fa-users", href: "customers.html" },
  { label: "Analytics", icon: "fa-chart-line", href: "analytics.html" },
  { label: "Settings", icon: "fa-gear", href: "settings.html" },
  { label: "Marketing site home", icon: "fa-house", href: "index.html" },
];

// A light, hand-maintained index — enough to demonstrate cross-page jump
// search without pulling every page's full dataset into every other page.
const CMDK_INDEX = [
  { label: "Order #10482 — Amara Chen", icon: "fa-receipt", href: "orders.html" },
  { label: "Order #10480 — Kwame Mensah", icon: "fa-receipt", href: "orders.html" },
  { label: "Customer — Amara Chen", icon: "fa-user", href: "customers.html" },
  { label: "Customer — Grace Okafor (VIP)", icon: "fa-user", href: "customers.html" },
  { label: "Customer — Kwame Mensah (VIP)", icon: "fa-user", href: "customers.html" },
  { label: "Product — Hybrid Active Noise Cancelling Headphones", icon: "fa-box", href: "products.html" },
  { label: "Product — Sony Alpha Mirrorless Camera (low stock)", icon: "fa-box", href: "products.html" },
];

function cmdkEnsureMarkup() {
  if (document.getElementById("cmdk")) return;
  const el = document.createElement("div");
  el.id = "cmdk";
  el.dataset.open = "false";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Command palette");
  el.className = "fixed inset-0 z-[60]";
  el.innerHTML = `
    <div id="cmdk-backdrop" class="cmdk-backdrop absolute inset-0"></div>
    <div class="relative max-w-lg mx-auto mt-24 card overflow-hidden">
      <div class="flex items-center gap-3 px-4 border-b border-border">
        <i class="fa-solid fa-magnifying-glass text-text-soft text-sm"></i>
        <input id="cmdk-input" type="text" placeholder="Jump to a page, order, customer, product…" class="flex-1 py-3.5 text-sm outline-none bg-transparent" />
        <kbd>Esc</kbd>
      </div>
      <div id="cmdk-results" class="max-h-80 overflow-y-auto py-1"></div>
    </div>`;
  document.body.appendChild(el);
}

function cmdkResults(query) {
  const q = query.trim().toLowerCase();
  const pages = CMDK_PAGES.filter((p) => p.label.toLowerCase().includes(q));
  const index = q ? CMDK_INDEX.filter((i) => i.label.toLowerCase().includes(q)) : [];
  return [...pages, ...index];
}

function cmdkRender(query) {
  const list = document.getElementById("cmdk-results");
  const results = cmdkResults(query);
  if (!results.length) {
    list.innerHTML = `<p class="px-4 py-8 text-center text-sm text-text-soft">No matches for "${query}"</p>`;
    return;
  }
  list.innerHTML = results
    .map(
      (r, i) => `
      <a href="${r.href}" data-index="${i}" class="cmdk-item ${i === 0 ? "is-highlighted" : ""} flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-2">
        <i class="fa-solid ${r.icon} w-4 text-text-soft"></i>${r.label}
      </a>`
    )
    .join("");
}

function initCommandPalette() {
  cmdkEnsureMarkup();
  const cmdk = document.getElementById("cmdk");
  const input = document.getElementById("cmdk-input");
  let release = null;
  let highlighted = 0;

  function open() {
    cmdk.dataset.open = "true";
    document.body.style.overflow = "hidden";
    input.value = "";
    cmdkRender("");
    highlighted = 0;
    release = trapFocus(cmdk, document.activeElement);
    input.focus();
  }
  function close() {
    cmdk.dataset.open = "false";
    document.body.style.overflow = "";
    if (release) { release(); release = null; }
  }

  [document.getElementById("cmdk-btn"), document.getElementById("cmdk-btn-mobile")].forEach((btn) => {
    if (btn) btn.addEventListener("click", open);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk.dataset.open === "true" ? close() : open(); }
    if (e.key === "Escape" && cmdk.dataset.open === "true") close();
  });
  cmdk.addEventListener("click", (e) => { if (e.target.id === "cmdk-backdrop") close(); });

  input.addEventListener("input", (e) => { highlighted = 0; cmdkRender(e.target.value); });
  input.addEventListener("keydown", (e) => {
    const items = [...document.querySelectorAll(".cmdk-item")];
    if (!items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); highlighted = Math.max(highlighted - 1, 0); }
    else if (e.key === "Enter") { e.preventDefault(); items[highlighted].click(); return; }
    else return;
    items.forEach((it, i) => it.classList.toggle("is-highlighted", i === highlighted));
    items[highlighted].scrollIntoView({ block: "nearest" });
  });
}

document.addEventListener("DOMContentLoaded", initCommandPalette);
