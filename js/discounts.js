/* ==========================================================================
   PULSE — discounts.js
   Mock data + render logic for discounts.html. Same shape as reports.js:
   a skeleton-then-paint pass on load, hand-built charts from charts.js,
   a sortable/searchable/exportable table via table-utils.js.
   ========================================================================== */

const DISCOUNT_KPIS = [
  { label: "Active Codes", value: 12, delta: 20.0, up: true, trend: [7, 8, 9, 10, 11, 12], icon: "fa-solid fa-tags", format: (n) => Math.round(n).toLocaleString() },
  { label: "Total Redemptions", value: 3204, delta: 14.7, up: true, trend: [1800, 2100, 2400, 2700, 2950, 3204], icon: "fa-solid fa-receipt", format: (n) => Math.round(n).toLocaleString() },
  { label: "Revenue From Discounts", value: 48900, delta: 9.2, up: true, trend: [28, 32, 36, 40, 44, 48.9], icon: "fa-solid fa-sack-dollar", format: (n) => "$" + Math.round(n).toLocaleString() },
  { label: "Avg. Discount Value", value: 15.3, delta: 2.1, up: false, trend: [17.5, 17, 16.5, 16, 15.6, 15.3], icon: "fa-solid fa-percent", format: (n) => "$" + n.toFixed(2) },
];

const REDEMPTION_MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REDEMPTION_SERIES = [310, 420, 480, 590, 640, 764];

const DISCOUNTS_BASE = [
  { code: "WELCOME10", type: "Percentage", value: "10%", uses: "842 / ∞", status: "Active", expires: "No expiry" },
  { code: "SUMMER25", type: "Percentage", value: "25%", uses: "1,203 / 2,000", status: "Active", expires: "2026-08-31" },
  { code: "FREESHIP", type: "Free shipping", value: "—", uses: "615 / ∞", status: "Active", expires: "No expiry" },
  { code: "SAVE20FIXED", type: "Fixed amount", value: "$20.00", uses: "298 / 500", status: "Active", expires: "2026-09-15" },
  { code: "VIP15", type: "Percentage", value: "15%", uses: "94 / 200", status: "Scheduled", expires: "Starts 2026-08-10" },
  { code: "BLACKFRIDAY24", type: "Percentage", value: "30%", uses: "2,140 / 2,140", status: "Expired", expires: "2024-11-30" },
  { code: "NEWSLETTER5", type: "Fixed amount", value: "$5.00", uses: "412 / ∞", status: "Active", expires: "No expiry" },
  { code: "SPRING2025", type: "Percentage", value: "20%", uses: "980 / 1,000", status: "Expired", expires: "2025-04-30" },
];

// Edits persist in localStorage (keyed by discount code) so they survive
// a page reload instead of snapping back to the demo defaults.
function loadDiscountEdits() {
  try { return JSON.parse(localStorage.getItem("pulse-discount-edits") || "{}"); }
  catch { return {}; }
}
function saveDiscountEdit(code, values) {
  const edits = loadDiscountEdits();
  edits[code] = { ...(edits[code] || {}), ...values };
  localStorage.setItem("pulse-discount-edits", JSON.stringify(edits));
}
const DISCOUNTS = [
  ...DISCOUNTS_BASE.map((d) => ({ ...d, ...(loadDiscountEdits()[d.code] || {}) })),
  ...JSON.parse(localStorage.getItem("pulse-discounts-new") || "[]"),
];
let currentDiscountRows = DISCOUNTS;

const DISCOUNT_STATUS_STYLE = {
  Active: "badge-up",
  Scheduled: "",
  Expired: "badge-down",
};

function discountRowHTML(d) {
  const statusClass = d.status === "Scheduled" ? "" : DISCOUNT_STATUS_STYLE[d.status];
  const statusBg = d.status === "Scheduled" ? "background:color-mix(in srgb, var(--amber) 15%, transparent); color:var(--amber)" : "";
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${d.code.toLowerCase()} ${d.type.toLowerCase()} ${d.status.toLowerCase()}">
      <td class="py-3 pr-3 font-mono text-xs font-medium">
        <button class="inline-flex items-center gap-1.5 hover:text-primary" onclick="copyToClipboard('${d.code}', this)" aria-label="Copy discount code">${d.code}<i class="fa-regular fa-copy text-[10px]"></i></button>
      </td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden sm:table-cell">${d.type}</td>
      <td class="py-3 pr-3 text-sm font-medium">${d.value}</td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden md:table-cell">${d.uses}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}" style="${statusBg}">${d.status}</span></td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden sm:table-cell">${d.expires}</td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-code="${d.code}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-code="${d.code}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderDiscounts(rows) {
  currentDiscountRows = rows;
  const tbody = document.getElementById("discounts-tbody");
  if (!tbody) return;
  if (!rows.length) {
    document.getElementById("table-empty").classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");
  tbody.innerHTML = rows.map(discountRowHTML).join("");
  revealRows(tbody);
}

function viewDiscount(code) {
  const d = DISCOUNTS.find((x) => x.code === code);
  if (!d) return;
  openDetailPanel(d.code, d.type, [
    { label: "Value", value: d.value },
    { label: "Uses", value: d.uses },
    { label: "Status", value: d.status },
    { label: "Expires", value: d.expires },
  ], "var(--amber)");
}

function renderDiscountKPIs() {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = DISCOUNT_KPIS.map(
    (k, i) => `
    <div class="tilt-wrap" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium">${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${k.icon} text-xs text-text-soft"></i></span>
      </div>
      <div class="flex items-end justify-between gap-2">
        <p class="font-display font-bold text-2xl" id="discount-kpi-value-${i}">0</p>
        <span class="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 mb-0.5 ${k.up ? "badge-up" : "badge-down"}">
          <i class="fa-solid ${k.up ? "fa-arrow-up" : "fa-arrow-down"} text-[9px]"></i>${k.delta}%
        </span>
      </div>
      <div class="mt-2 h-9" id="discount-kpi-spark-${i}"></div>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);

  DISCOUNT_KPIS.forEach((k, i) => {
    const valueEl = document.getElementById(`discount-kpi-value-${i}`);
    if (valueEl) animateCounter(valueEl, k.value, 900 + i * 100, k.format);
    const sparkEl = document.getElementById(`discount-kpi-spark-${i}`);
    if (sparkEl) renderSparkline(sparkEl, k.trend, k.up ? "var(--success)" : "var(--danger)");
  });
}

function editDiscount(code) {
  const d = DISCOUNTS.find((x) => x.code === code);
  if (!d) return;
  openEditPanel(d.code, "Discount code", [
    { label: "Type", key: "type", value: d.type, type: "select", options: ["Percentage", "Fixed amount", "Free shipping"] },
    { label: "Value", key: "value", value: d.value, type: "text" },
    { label: "Status", key: "status", value: d.status, type: "select", options: ["Active", "Scheduled", "Expired"] },
    { label: "Expires", key: "expires", value: d.expires, type: "text" },
  ], "var(--amber)", (values) => {
    Object.assign(d, values);
    saveDiscountEdit(code, values);
    renderDiscounts(currentDiscountRows);
    toast(`${code} updated`);
  });
}

function loadNewDiscounts() {
  try { return JSON.parse(localStorage.getItem("pulse-discounts-new") || "[]"); }
  catch { return []; }
}
function saveNewDiscount(d) {
  const list = loadNewDiscounts();
  list.push(d);
  localStorage.setItem("pulse-discounts-new", JSON.stringify(list));
}

function createDiscount() {
  openEditPanel("New discount code", "Create a code", [
    { label: "Code", key: "code", value: "", type: "text" },
    { label: "Type", key: "type", value: "Percentage", type: "select", options: ["Percentage", "Fixed amount", "Free shipping"] },
    { label: "Value", key: "value", value: "10%", type: "text" },
    { label: "Status", key: "status", value: "Active", type: "select", options: ["Active", "Scheduled", "Expired"] },
    { label: "Expires", key: "expires", value: "No expiry", type: "text" },
  ], "var(--amber)", (values) => {
    const code = values.code.trim().toUpperCase();
    if (!code) return toast("A code is required — nothing was created", "error");
    if (DISCOUNTS.some((d) => d.code === code)) return toast(`${code} already exists`, "error");
    const newDiscount = { ...values, code, uses: "0 / ∞" };
    DISCOUNTS.push(newDiscount);
    saveNewDiscount(newDiscount);
    renderDiscounts(DISCOUNTS);
    toast(`${code} created`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderDiscountKPIs();

    const redemptionsEl = document.getElementById("redemptions-chart");
    if (redemptionsEl) renderMultiLineChart(redemptionsEl, [
      { label: "Redemptions", color: "var(--amber)", values: REDEMPTION_SERIES },
    ], REDEMPTION_MONTHS);

    const heroSparkEl = document.getElementById("hero-spark");
    if (heroSparkEl) renderSparkline(heroSparkEl, REDEMPTION_SERIES, "var(--amber)");

    renderDiscounts(DISCOUNTS);
    const thead = document.getElementById("discounts-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderDiscounts(sortRows(currentDiscountRows, stack)));

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);

  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderDiscounts(q ? DISCOUNTS.filter((d) => (d.code + " " + d.type + " " + d.status).toLowerCase().includes(q)) : DISCOUNTS);
  });

  document.getElementById("discounts-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) viewDiscount(viewBtn.dataset.code);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) editDiscount(editBtn.dataset.code);
  });

  document.getElementById("new-discount-btn")?.addEventListener("click", createDiscount);

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-discounts", ["Code", "Type", "Value", "Uses", "Status", "Expires"],
      currentDiscountRows.map((d) => [d.code, d.type, d.value, d.uses, d.status, d.expires]));
    toast("Discounts exported to CSV");
  });
});
