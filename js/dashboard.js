/* ==========================================================================
   PULSE — dashboard.js
   ========================================================================== */

const KPI_ICONS = ["fa-regular fa-eye", "fa-solid fa-users", "fa-solid fa-arrow-pointer", "fa-regular fa-envelope"];

/* Static, not tied to the date range: matches the "Customers" panel in the
   reference screenshot exactly (2,884 retailers / 1,432 distributors /
   562 wholesalers). */
const CUSTOMERS_BREAKDOWN = [
  { label: "Retailers", value: 2884, color: "var(--primary)" },
  { label: "Distributors", value: 1432, color: "var(--teal)" },
  { label: "Wholesalers", value: 562, color: "var(--amber)" },
];

/* Weekday activity for "Most Day Active" — Tuesday is the standout bar, so
   it gets the primary gradient while every other day renders muted. */
const MOST_ACTIVE = {
  peakValue: 8162,
  days: [
    { label: "Sun", value: 4120 },
    { label: "Mon", value: 5340 },
    { label: "Tue", value: 8162 },
    { label: "Wed", value: 3860 },
    { label: "Thu", value: 4610 },
    { label: "Fri", value: 5120 },
    { label: "Sat", value: 4430 },
  ],
};

/* Canned answers for the AI Assistant widget — there's no live model behind
   it, but the interaction (typing, submitting, getting a relevant-looking
   reply) is fully real, keyword-matched against the same mock data that
   drives the rest of the dashboard. */
const AI_REPLIES = [
  { match: ["profit", "revenue", "money", "earn"], reply: () => `Total profit is $${RANGE_DATA[activeRange].profit.toFixed(1)}K over the ${RANGE_DATA[activeRange].label.toLowerCase()}, up 24.6%.` },
  { match: ["customer", "retailer", "distributor", "wholesaler"], reply: () => `You have 2,884 retailers, 1,432 distributors, and 562 wholesalers, with a 68% repeat rate.` },
  { match: ["order"], reply: () => `Orders are at ${RANGE_DATA[activeRange].kpis[3].value.toLocaleString()} for the ${RANGE_DATA[activeRange].label.toLowerCase()}.` },
  { match: ["product", "sell", "best"], reply: () => `Your best seller is the Hybrid Active Noise Cancelling Headphones, 2,310 sold.` },
  { match: ["visitor", "traffic", "view"], reply: () => `${RANGE_DATA[activeRange].kpis[1].value.toLocaleString()} visitors and ${RANGE_DATA[activeRange].kpis[0].value.toLocaleString()} page views this range.` },
  { match: ["day", "active", "busy"], reply: () => `Tuesdays are your most active day, peaking around 8,162 visits.` },
];
function aiReplyFor(q) {
  const lower = q.toLowerCase();
  const hit = AI_REPLIES.find((r) => r.match.some((word) => lower.includes(word)));
  if (hit) return hit.reply();
  return "This demo assistant only knows the numbers already on this dashboard, try asking about profit, customers, orders, or best sellers.";
}

const RANGE_DATA = {
  "7d": {
    label: "Last 7 days",
    kpis: [
      { label: "Page Views", value: 4210, delta: 6.1, up: true, trend: [520, 560, 610, 590, 640, 680, 4210] },
      { label: "Visitors", value: 1580, delta: 3.2, up: true, trend: [190, 205, 215, 220, 230, 240, 1580] },
      { label: "Clicks", value: 902, delta: 4.4, up: false, trend: [140, 135, 132, 128, 125, 120, 902] },
      { label: "Orders", value: 312, delta: 2.1, up: true, trend: [38, 40, 42, 44, 46, 48, 312] },
    ],
    revenue: [{ label: "Mon", value: 12 }, { label: "Tue", value: 18 }, { label: "Wed", value: 15 }, { label: "Thu", value: 22 }, { label: "Fri", value: 26 }, { label: "Sat", value: 19 }, { label: "Sun", value: 24 }],
    visitorLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    visitorValues: [180, 210, 195, 260, 240, 280, 250],
    profit: 62.4,
    repeat: 61,
  },
  "30d": {
    label: "Last 30 days",
    kpis: [
      { label: "Page Views", value: 16431, delta: 15.5, up: true, trend: [11200, 12100, 11800, 13400, 14200, 15100, 16431] },
      { label: "Visitors", value: 6225, delta: 8.4, up: true, trend: [4800, 5100, 5300, 5600, 5900, 6000, 6225] },
      { label: "Clicks", value: 2832, delta: 10.5, up: false, trend: [3400, 3200, 3350, 3100, 2950, 2900, 2832] },
      { label: "Orders", value: 1224, delta: 4.4, up: true, trend: [980, 1020, 1050, 1090, 1140, 1180, 1224] },
    ],
    revenue: [{ label: "Jan", value: 32 }, { label: "Feb", value: 41 }, { label: "Mar", value: 38 }, { label: "Apr", value: 52 }, { label: "May", value: 47 }, { label: "Jun", value: 61 }, { label: "Jul", value: 55 }],
    visitorLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    visitorValues: [820, 932, 901, 1340, 1190, 1420, 1260],
    profit: 446.7,
    repeat: 68,
  },
  "90d": {
    label: "Last 90 days",
    kpis: [
      { label: "Page Views", value: 48920, delta: 22.3, up: true, trend: [28000, 31000, 33500, 37200, 40800, 44500, 48920] },
      { label: "Visitors", value: 19340, delta: 17.6, up: true, trend: [11200, 12800, 14100, 15600, 17000, 18200, 19340] },
      { label: "Clicks", value: 9105, delta: 6.8, up: true, trend: [6800, 7100, 7500, 7900, 8300, 8700, 9105] },
      { label: "Orders", value: 3866, delta: 9.9, up: true, trend: [2400, 2700, 2950, 3200, 3450, 3650, 3866] },
    ],
    revenue: [{ label: "W1", value: 28 }, { label: "W3", value: 35 }, { label: "W5", value: 44 }, { label: "W7", value: 51 }, { label: "W9", value: 58 }, { label: "W11", value: 66 }, { label: "W13", value: 74 }],
    visitorLabels: ["W1", "W3", "W5", "W7", "W9", "W11", "W13"],
    visitorValues: [3200, 4100, 4800, 5600, 6200, 7100, 7800],
    profit: 1284.5,
    repeat: 71,
  },
};

let activeRange = "30d";

const PRODUCTS = [
  { id: "#3009", name: "Hybrid Active Noise Cancelling Headphones", sold: 2310, revenue: "$124,639", rating: 5.0, category: "Audio", trend: [180, 210, 195, 260, 240, 300, 330] },
  { id: "#3001", name: "Casio G-Shock Shock Resistant Watch", sold: 1230, revenue: "$92,032", rating: 4.8, category: "Watches", trend: [140, 150, 130, 160, 175, 165, 190] },
  { id: "#3004", name: "Samsung 525 Ultra Smartphone", sold: 812, revenue: "$74,048", rating: 4.7, category: "Phones", trend: [130, 110, 120, 95, 105, 90, 80] },
  { id: "#3002", name: "Xbox Wireless Gaming Controller", sold: 645, revenue: "$62,820", rating: 4.6, category: "Gaming", trend: [70, 85, 80, 95, 90, 105, 100] },
  { id: "#3005", name: "Timex Men's Easy Reader Watch", sold: 572, revenue: "$48,724", rating: 4.5, category: "Watches", trend: [90, 85, 92, 80, 78, 82, 88] },
  { id: "#3006", name: "Sony Alpha Mirrorless Camera", sold: 401, revenue: "$41,090", rating: 4.9, category: "Cameras", trend: [40, 55, 50, 65, 60, 72, 68] },
];
let currentRows = PRODUCTS;

function starRating(n) {
  const full = Math.round(n);
  return `<span class="text-amber">${"★".repeat(full)}<span class="text-border">${"★".repeat(5 - full)}</span></span>`;
}

function tableRowHTML(p) {
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${p.name.toLowerCase()} ${p.category.toLowerCase()} ${p.id.toLowerCase()}">
      <td class="py-3 pr-3 font-mono text-xs text-text-soft hidden sm:table-cell">
        <button class="inline-flex items-center gap-1.5 hover:text-primary" onclick="copyToClipboard('${p.id}', this)" aria-label="Copy product ID">${p.id}<i class="fa-regular fa-copy text-[10px]"></i></button>
      </td>
      <td class="py-3 pr-3">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-lg shrink-0 relative overflow-hidden" style="background:linear-gradient(135deg, var(--primary), var(--teal))">
            <img src="images/products/${p.id.replace("#", "")}.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" onerror="this.style.display='none'" loading="lazy" />
          </div>
          <span class="text-sm font-medium">${p.name}</span>
        </div>
      </td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden sm:table-cell">${p.sold.toLocaleString()}</td>
      <td class="py-3 pr-3 text-sm font-medium">${p.revenue}</td>
      <td class="py-3 pr-3 hidden md:table-cell"><div class="h-8 w-20" id="spark-${p.id.replace("#", "")}"></div></td>
      <td class="py-3 pr-3 text-xs hidden sm:table-cell">${starRating(p.rating)} <span class="text-text-soft">(${p.rating.toFixed(1)})</span></td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${p.id}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${p.id}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderTable(rows) {
  currentRows = rows;
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;
  if (!rows.length) {
    document.getElementById("table-empty").classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");
  tbody.innerHTML = rows.map(tableRowHTML).join("");
  revealRows(tbody);
  rows.forEach((p) => {
    const sparkEl = document.getElementById(`spark-${p.id.replace("#", "")}`);
    if (sparkEl && p.trend) {
      const trendingUp = p.trend[p.trend.length - 1] >= p.trend[0];
      renderSparkline(sparkEl, p.trend, trendingUp ? "var(--success)" : "var(--danger)");
    }
  });
}

function viewProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  openDetailPanel(
    p.name,
    p.id,
    [
      { label: "Category", value: p.category },
      { label: "Units sold", value: p.sold.toLocaleString() },
      { label: "Revenue", value: p.revenue },
      { label: "Rating", value: p.rating.toFixed(1) + " / 5" },
    ],
    "var(--primary)"
  );
}

function renderKPIs(kpis) {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = kpis.map(
    (k, i) => `
    <div class="tilt-wrap widget-card" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing"><i class="fa-solid fa-grip-vertical text-[9px] text-text-soft/50"></i>${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${KPI_ICONS[i] || "fa-solid fa-chart-simple"} text-xs text-text-soft"></i></span>
      </div>
      <div class="flex items-end justify-between gap-2">
        <p class="font-display font-bold text-2xl" id="kpi-value-${i}">0</p>
        <span class="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 mb-0.5 ${k.up ? "badge-up" : "badge-down"}">
          <i class="fa-solid ${k.up ? "fa-arrow-up" : "fa-arrow-down"} text-[9px]"></i>${k.delta}%
        </span>
      </div>
      <div class="mt-2 h-9" id="kpi-spark-${i}"></div>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);

  kpis.forEach((k, i) => {
    const valueEl = document.getElementById(`kpi-value-${i}`);
    if (valueEl) animateCounter(valueEl, k.value, 900 + i * 100);
    const sparkEl = document.getElementById(`kpi-spark-${i}`);
    if (sparkEl) renderSparkline(sparkEl, k.trend, k.up ? "var(--success)" : "var(--danger)");
  });
}

function renderCustomersBreakdown() {
  const wrap = document.getElementById("customers-wrap");
  if (!wrap) return;
  const total = CUSTOMERS_BREAKDOWN.reduce((sum, c) => sum + c.value, 0);
  wrap.innerHTML = CUSTOMERS_BREAKDOWN.map(
    (c, i) => `
    <div>
      <p class="font-display font-bold text-2xl" id="cust-value-${i}">0</p>
      <p class="text-xs text-text-soft mb-2">${c.label}</p>
      <div class="h-1.5 rounded-full overflow-hidden" style="background:var(--surface-2)">
        <div class="h-full rounded-full" id="cust-bar-${i}" style="width:0%; background:${c.color}; transition:width 1s cubic-bezier(.2,.8,.2,1)"></div>
      </div>
    </div>`
  ).join("");
  CUSTOMERS_BREAKDOWN.forEach((c, i) => {
    const valueEl = document.getElementById(`cust-value-${i}`);
    if (valueEl) animateCounter(valueEl, c.value, 1000 + i * 100);
    const barEl = document.getElementById(`cust-bar-${i}`);
    if (barEl) requestAnimationFrame(() => requestAnimationFrame(() => (barEl.style.width = Math.round((c.value / total) * 100) + "%")));
  });
}

function renderMostActive() {
  const valueEl = document.getElementById("active-value");
  if (valueEl) animateCounter(valueEl, MOST_ACTIVE.peakValue, 1000);
  const chartEl = document.getElementById("active-chart");
  if (!chartEl) return;
  const bars = MOST_ACTIVE.days.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.value === MOST_ACTIVE.peakValue ? "linear-gradient(180deg, var(--primary), var(--primary-dark))" : "color-mix(in srgb, var(--text-soft) 22%, transparent)",
  }));
  renderBarChart(chartEl, bars);
}

const WIDGET_DEFS = {
  "Visitors by Device": {
    icon: "fa-solid fa-chart-pie", color: "var(--primary)", type: "donut", value: "63%",
    sub: "63% mobile, the rest split across desktop and tablet.",
    render: (el) => renderDonut(el, 63, "var(--primary)"),
  },
  "Orders Performance": {
    icon: "fa-solid fa-chart-column", color: "var(--teal)", type: "bar",
    sub: "Order volume for each of the last 7 days.",
    render: (el) => renderBarChart(el, [
      { label: "Mon", value: 62 }, { label: "Tue", value: 81 }, { label: "Wed", value: 55 },
      { label: "Thu", value: 94 }, { label: "Fri", value: 88 }, { label: "Sat", value: 40 }, { label: "Sun", value: 33 },
    ]),
  },
  "Trend Analysis": {
    icon: "fa-solid fa-arrow-trend-up", color: "var(--pink)", type: "line",
    sub: "Visitor trend over the last 6 weeks.",
    render: (el) => renderLineChart(el, [420, 512, 489, 610, 705, 812], ["W1", "W2", "W3", "W4", "W5", "W6"]),
  },
  "Customer Segmentation": {
    icon: "fa-solid fa-users", color: "var(--amber)", type: "bar",
    sub: "Customers grouped by purchase frequency.",
    render: (el) => renderBarChart(el, [
      { label: "1x", value: 1240, color: "color-mix(in srgb, var(--amber) 40%, transparent)" },
      { label: "2-4x", value: 2180, color: "color-mix(in srgb, var(--amber) 70%, transparent)" },
      { label: "5x+", value: 980, color: "linear-gradient(180deg, var(--amber), color-mix(in srgb, var(--amber) 60%, black))" },
    ]),
  },
  "Cart Abandonment": {
    icon: "fa-solid fa-cart-shopping", color: "var(--danger)", type: "donut", value: "24%",
    sub: "Carts started but never checked out, last 30 days.",
    render: (el) => renderDonut(el, 24, "var(--danger)"),
  },
  "Support Tickets": {
    icon: "fa-regular fa-life-ring", color: "var(--teal)", type: "bar",
    sub: "Open tickets by day, this week.",
    render: (el) => renderBarChart(el, [
      { label: "Mon", value: 14 }, { label: "Tue", value: 9 }, { label: "Wed", value: 18 },
      { label: "Thu", value: 11 }, { label: "Fri", value: 7 }, { label: "Sat", value: 4 }, { label: "Sun", value: 3 },
    ]),
  },
  "Revenue Forecast": {
    icon: "fa-solid fa-wand-magic-sparkles", color: "var(--primary)", type: "line",
    sub: "Projected revenue for the next 6 weeks.",
    render: (el) => renderLineChart(el, [64, 69, 71, 78, 85, 91], ["W1", "W2", "W3", "W4", "W5", "W6"]),
  },
};

/* ---------------------------------------------------------------------
   Drag-and-drop reordering for widgets you've added — built on Pointer
   Events instead of the native HTML5 drag-and-drop API, on purpose: HTML5
   drag events (dragstart/dragover/drop) simply don't fire on touchscreens
   at all, only with a mouse. Pointer Events unify mouse, touch, and pen
   into one event model, which is the same trick libraries like SortableJS
   use to make dragging work everywhere with one code path.

   How it works: pressing down on a widget's grip handle starts tracking;
   as the pointer moves, we ask the browser "what element is physically
   under this point right now" and, if it's a different widget card, swap
   the dragged card to sit before/after it depending on which half of that
   card the pointer is over — so the reorder happens live, while you're
   still dragging, not just after you let go.
--------------------------------------------------------------------- */
function initDragDropForHost(hostId) {
  const host = document.getElementById(hostId);
  if (!host) return;
  let dragged = null;

  host.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".drag-handle");
    const card = e.target.closest(".widget-card");
    if (!handle || !card || e.button === 2) return;
    dragged = card;
    card.classList.add("widget-dragging");
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
  });

  host.addEventListener("pointermove", (e) => {
    if (!dragged) return;
    e.preventDefault();
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const over = target && target.closest(".widget-card");
    if (!over || over === dragged || !host.contains(over)) return;
    const r = over.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    host.insertBefore(dragged, before ? over : over.nextSibling);
  });

  const stop = () => {
    if (dragged) dragged.classList.remove("widget-dragging");
    dragged = null;
  };
  host.addEventListener("pointerup", stop);
  host.addEventListener("pointercancel", stop);
}

function initWidgetDragDrop() {
  // #added-widgets holds widgets you add via the "+" panel; #main-column and
  // #right-rail hold the built-in cards (Total Profit, Best Selling
  // Products, etc); #kpi-wrap holds the four KPI cards at the top. Each
  // container is reordered independently — dragging stays within its own
  // grid/column, same as most dashboard builders.
  initDragDropForHost("added-widgets");
  initDragDropForHost("main-column");
  initDragDropForHost("right-rail");
  initDragDropForHost("kpi-wrap");
}

function addWidgetToDashboard(name) {
  const host = document.getElementById("added-widgets");
  if (!host) return;
  const def = WIDGET_DEFS[name];
  if (!def) return;
  const id = "widget-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const existing = document.getElementById(id);
  if (existing) {
    existing.classList.remove("widget-pop-in");
    void existing.offsetWidth; // restart the animation as a "here it is again" nudge
    existing.classList.add("widget-pop-in");
    existing.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const card = document.createElement("div");
  card.id = id;
  card.className = "card p-5 tilt-wrap widget-pop-in widget-card";
  card.dataset.tiltMax = "5";
  // Donut widgets need a capped width (a square SVG stretched to a full-width
  // container blows out the row height) and a value label under the ring —
  // bar/line widgets just fill the width at a fixed height.
  const mountMarkup = def.type === "donut"
    ? `<div class="flex flex-col items-center text-center">
         <div class="w-28" style="aspect-ratio:1/1"><div class="widget-chart-mount w-full h-full"></div></div>
         <p class="font-display font-bold text-xl -mt-2">${def.value || ""}</p>
       </div>`
    : `<div class="widget-chart-mount" style="height:170px"></div>`;
  card.innerHTML = `
    <div class="tilt-el">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
          <i class="fa-solid fa-grip-vertical text-[10px] text-text-soft/60"></i>
          <span class="h-8 w-8 rounded-lg flex items-center justify-center" style="background:color-mix(in srgb, ${def.color} 15%, transparent)"><i class="${def.icon} text-xs" style="color:${def.color}"></i></span>
          <p class="text-sm font-semibold">${name}</p>
        </div>
        <button class="remove-widget-btn h-7 w-7 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-soft" aria-label="Remove widget"><i class="fa-solid fa-xmark text-xs"></i></button>
      </div>
      ${mountMarkup}
      <p class="text-[11px] text-text-soft mt-2">${def.sub}</p>
    </div>`;
  card.querySelector(".remove-widget-btn").addEventListener("click", () => {
    card.classList.add("widget-pop-out");
    setTimeout(() => card.remove(), 220);
  });
  host.appendChild(card);
  const mount = card.querySelector(".widget-chart-mount");
  mount.id = id + "-mount";
  def.render(mount);
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderRangeData(rangeKey, withSkeletonFlash) {
  const data = RANGE_DATA[rangeKey];
  if (!data) return;
  activeRange = rangeKey;

  const paint = () => {
    renderKPIs(data.kpis);

    const barsEl = document.getElementById("revenue-chart");
    if (barsEl) renderBarChart(barsEl, data.revenue);

    const lineEl = document.getElementById("visitors-chart");
    if (lineEl) renderLineChart(lineEl, data.visitorValues, data.visitorLabels);

    const donutEl = document.getElementById("repeat-donut");
    if (donutEl) renderDonut(donutEl, data.repeat, "var(--teal)");
    const repeatValueEl = document.getElementById("repeat-value");
    if (repeatValueEl) animateCounter(repeatValueEl, data.repeat, 1100, (n) => Math.round(n) + "%");

    const profitEl = document.getElementById("profit-value");
    if (profitEl) animateCounter(profitEl, data.profit, 1000, (n) => "$" + n.toFixed(1) + "K");

    const heroSparkEl = document.getElementById("hero-spark");
    if (heroSparkEl) renderSparkline(heroSparkEl, data.kpis[0].trend, "var(--primary)");

    renderCustomersBreakdown();
    renderMostActive();

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  };

  if (withSkeletonFlash) {
    document.getElementById("real-content")?.classList.add("hidden");
    document.getElementById("skeleton-layer")?.classList.remove("hidden");
    setTimeout(paint, 500);
  } else {
    paint();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initWidgetDragDrop();
  setTimeout(() => {
    renderRangeData(activeRange, false);
    renderTable(PRODUCTS);

    const thead = document.getElementById("products-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderTable(sortRows(currentRows, stack)));
  }, 750);

  // ---- instant search: filters the table with every keystroke, no submit button ----
  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderTable(q ? PRODUCTS.filter((p) => (p.name + " " + p.category + " " + p.id).toLowerCase().includes(q)) : PRODUCTS);
  });

  document.getElementById("products-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) return viewProduct(viewBtn.dataset.id);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) return toast("Editing isn't wired up in this demo");
  });

  // ---- date range picker ----
  const rangeBtn = document.getElementById("range-btn");
  const rangeMenu = document.getElementById("range-menu");
  if (rangeBtn && rangeMenu) {
    rangeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      rangeMenu.dataset.open = rangeMenu.dataset.open === "true" ? "false" : "true";
    });
    document.addEventListener("click", (e) => {
      if (rangeMenu.dataset.open === "true" && !rangeMenu.contains(e.target) && e.target !== rangeBtn) rangeMenu.dataset.open = "false";
    });
    rangeMenu.querySelectorAll("[data-range]").forEach((btn) => {
      btn.addEventListener("click", () => {
        rangeMenu.dataset.open = "false";
        document.getElementById("range-label").textContent = RANGE_DATA[btn.dataset.range].label;
        renderRangeData(btn.dataset.range, true);
      });
    });
  }

  // ---- widget panel (visual, matches the "Add Widget" slide-over in the reference) ----
  const widgetBtn = document.getElementById("add-widget-btn");
  const widgetOverlay = document.getElementById("widget-overlay");
  if (widgetBtn && widgetOverlay) {
    let release = null;
    const open = () => { widgetOverlay.dataset.open = "true"; release = trapFocus(widgetOverlay, widgetBtn); };
    const close = () => { widgetOverlay.dataset.open = "false"; if (release) { release(); release = null; } };
    widgetBtn.addEventListener("click", open);
    widgetOverlay.querySelectorAll("[data-close-widget]").forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && widgetOverlay.dataset.open === "true") close(); });
    widgetOverlay.querySelectorAll("[data-select-widget]").forEach((el) =>
      el.addEventListener("click", () => {
        addWidgetToDashboard(el.dataset.selectWidget);
        toast(`"${el.dataset.selectWidget}" added to your dashboard`);
        close();
      })
    );

    // ---- drag a widget out of the panel and onto the dashboard to add
    // it — same idea as "Select", just by dragging instead of tapping.
    // Built on Pointer Events (not native HTML5 drag) so it works with a
    // finger on touch devices too. With a mouse/pen, you can grab the
    // card anywhere; with a finger, only the small grip handle starts a
    // drag (grabbing anywhere else needs to stay a normal scroll, since
    // the panel can be taller than the screen).
    let ghost = null, dropZone = null;
    widgetOverlay.addEventListener("pointerdown", (e) => {
      const isTouch = e.pointerType === "touch";
      const card = e.target.closest(".card");
      const handle = e.target.closest(".panel-drag-handle");
      if (isTouch && !handle) return;
      const btn = card && card.querySelector("[data-select-widget]");
      if (!card || !btn || e.button === 2) return;
      const name = btn.dataset.selectWidget;
      const startX = e.clientX, startY = e.clientY;
      let started = false;
      try { (handle || card).setPointerCapture(e.pointerId); } catch (err) { /* not fatal — the drag still works via document-level listeners below */ }

      const onMove = (ev) => {
        if (!started) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 10) return;
          started = true;
          ghost = document.createElement("div");
          ghost.className = "widget-drag-ghost";
          ghost.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${name}`;
          document.body.appendChild(ghost);
          dropZone = document.createElement("div");
          dropZone.className = "widget-drop-zone";
          dropZone.innerHTML = `<i class="fa-solid fa-plus"></i> Drop here to add to your dashboard`;
          document.body.appendChild(dropZone);
          document.body.classList.add("widget-panel-dragging");
        }
        ghost.style.left = ev.clientX + "px";
        ghost.style.top = ev.clientY + "px";
        const zr = dropZone.getBoundingClientRect();
        const armed = ev.clientY >= zr.top && ev.clientY <= zr.bottom && ev.clientX >= zr.left && ev.clientX <= zr.right;
        ghost.classList.toggle("widget-drag-ghost-armed", armed);
        dropZone.classList.toggle("widget-drop-zone-armed", armed);
      };
      const onUp = (ev) => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.body.classList.remove("widget-panel-dragging");
        const wasArmed = ghost && ghost.classList.contains("widget-drag-ghost-armed");
        if (ghost) { ghost.remove(); ghost = null; }
        if (dropZone) { dropZone.remove(); dropZone = null; }
        if (started && wasArmed) {
          addWidgetToDashboard(name);
          toast(`"${name}" added to your dashboard`);
          close();
        }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }

  // ---- AI assistant (canned, keyword-matched replies, see AI_REPLIES above) ----
  const aiForm = document.getElementById("ai-form");
  const aiInput = document.getElementById("ai-input");
  const aiReply = document.getElementById("ai-reply");
  if (aiForm && aiInput && aiReply) {
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = aiInput.value.trim();
      if (!q) return;
      aiReply.textContent = "Thinking…";
      aiInput.value = "";
      setTimeout(() => { aiReply.textContent = aiReplyFor(q); }, 500);
    });
  }

  document.getElementById("repeat-details-btn")?.addEventListener("click", () => {
    toast("Retention cohorts aren't wired up in this demo, hook up real data via #10");
  });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-best-sellers", ["ID", "Name", "Category", "Sold", "Revenue", "Rating"],
      currentRows.map((p) => [p.id, p.name, p.category, p.sold, p.revenue, p.rating]));
    toast("Best sellers exported to CSV");
  });
});
