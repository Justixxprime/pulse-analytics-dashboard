/* ==========================================================================
   PULSE — store.js
   Mock data + render logic for store.html. Same shape as reports.js.
   ========================================================================== */

const STORE_KPIS = [
  { label: "Store Visitors", value: 18400, delta: 12.3, up: true, trend: [12, 13.5, 14.8, 16, 17.2, 18.4], icon: "fa-solid fa-user-group", format: (n) => Math.round(n).toLocaleString() },
  { label: "Conversion Rate", value: 3.2, delta: 0.4, up: true, trend: [2.6, 2.7, 2.9, 3.0, 3.1, 3.2], icon: "fa-solid fa-bullseye", format: (n) => n.toFixed(1) + "%" },
  { label: "Cart Abandonment", value: 68, delta: 2.1, up: false, trend: [72, 71, 70, 69.5, 68.8, 68], icon: "fa-solid fa-cart-shopping", format: (n) => Math.round(n) + "%" },
  { label: "Avg. Order Value", value: 86, delta: 5.8, up: true, trend: [74, 77, 80, 82, 84, 86], icon: "fa-solid fa-sack-dollar", format: (n) => "$" + Math.round(n) },
];

const CHANNEL_CATEGORIES = [
  { label: "Direct", value: 6200, color: "linear-gradient(180deg, var(--primary), var(--primary-dark))" },
  { label: "Organic Search", value: 5100, color: "linear-gradient(180deg, var(--teal), #0f8f8f)" },
  { label: "Social", value: 3400, color: "linear-gradient(180deg, var(--pink), #c23a7a)" },
  { label: "Email", value: 2300, color: "linear-gradient(180deg, var(--amber), #b8790a)" },
  { label: "Referral", value: 1400, color: "linear-gradient(180deg, var(--success), #1f9d5c)" },
];

const CHECKOUT_COMPLETION = 61;

const STORE_PAGES = [
  { page: "Homepage", views: 9840, avgTime: "0m 48s", bounce: "38%", conversion: "1.2%" },
  { page: "Summer Sale Collection", views: 6210, avgTime: "1m 12s", bounce: "31%", conversion: "4.6%" },
  { page: "Hybrid Headphones — PDP", views: 4180, avgTime: "1m 35s", bounce: "22%", conversion: "8.1%" },
  { page: "All Watches Collection", views: 3320, avgTime: "0m 58s", bounce: "40%", conversion: "2.9%" },
  { page: "Checkout", views: 2140, avgTime: "2m 04s", bounce: "12%", conversion: "61.0%" },
  { page: "Cart", views: 2960, avgTime: "0m 41s", bounce: "18%", conversion: "72.3%" },
];

function storePageRowHTML(p) {
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${p.page.toLowerCase()}">
      <td class="py-3 pr-3 text-sm font-medium">${p.page}</td>
      <td class="py-3 pr-3 text-sm">${p.views.toLocaleString()}</td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden sm:table-cell">${p.avgTime}</td>
      <td class="py-3 pr-3 text-xs text-text-soft hidden md:table-cell">${p.bounce}</td>
      <td class="py-3 pl-3 text-sm font-medium">${p.conversion}</td>
    </tr>`;
}

function renderStorePages(rows) {
  const tbody = document.getElementById("pages-tbody");
  if (!tbody) return;
  tbody.innerHTML = rows.map(storePageRowHTML).join("");
  revealRows(tbody);
}

function renderStoreKPIs() {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = STORE_KPIS.map(
    (k, i) => `
    <div class="tilt-wrap" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium">${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${k.icon} text-xs text-text-soft"></i></span>
      </div>
      <div class="flex items-end justify-between gap-2">
        <p class="font-display font-bold text-2xl" id="store-kpi-value-${i}">0</p>
        <span class="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 mb-0.5 ${k.up ? "badge-up" : "badge-down"}">
          <i class="fa-solid ${k.up ? "fa-arrow-up" : "fa-arrow-down"} text-[9px]"></i>${k.delta}%
        </span>
      </div>
      <div class="mt-2 h-9" id="store-kpi-spark-${i}"></div>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);

  STORE_KPIS.forEach((k, i) => {
    const valueEl = document.getElementById(`store-kpi-value-${i}`);
    if (valueEl) animateCounter(valueEl, k.value, 900 + i * 100, k.format);
    const sparkEl = document.getElementById(`store-kpi-spark-${i}`);
    if (sparkEl) renderSparkline(sparkEl, k.trend, k.up ? "var(--success)" : "var(--danger)");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderStoreKPIs();

    const channelEl = document.getElementById("channel-chart");
    if (channelEl) renderBarChart(channelEl, CHANNEL_CATEGORIES);

    const heroSparkEl = document.getElementById("hero-spark");
    if (heroSparkEl) renderSparkline(heroSparkEl, [12, 13.5, 14.8, 16, 17.2, 18.4], "var(--primary)");

    const donutEl = document.getElementById("checkout-donut");
    if (donutEl) renderDonut(donutEl, CHECKOUT_COMPLETION, "var(--primary)");
    const checkoutValueEl = document.getElementById("checkout-value");
    if (checkoutValueEl) animateCounter(checkoutValueEl, CHECKOUT_COMPLETION, 1100, (n) => Math.round(n) + "%");

    renderStorePages(STORE_PAGES);
    const thead = document.getElementById("pages-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderStorePages(sortRows(STORE_PAGES, stack)));

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);

  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderStorePages(q ? STORE_PAGES.filter((p) => p.page.toLowerCase().includes(q)) : STORE_PAGES);
  });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-store-pages", ["Page", "Views", "Avg Time", "Bounce Rate", "Conversion"],
      STORE_PAGES.map((p) => [p.page, p.views, p.avgTime, p.bounce, p.conversion]));
    toast("Store pages exported to CSV");
  });
});
