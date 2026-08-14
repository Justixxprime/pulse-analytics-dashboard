/* ==========================================================================
   PULSE — reports.js
   Mock data + render logic for reports.html. Same shape as dashboard.js:
   a skeleton-then-paint pass on load, hand-built charts from charts.js,
   a sortable/searchable/exportable table via table-utils.js.
   ========================================================================== */

const REPORT_KPIS = [
  { label: "Total Revenue", value: 892400, delta: 18.2, up: true, trend: [520, 560, 610, 660, 720, 892], icon: "fa-solid fa-sack-dollar", format: (n) => "$" + Math.round(n).toLocaleString() },
  { label: "Total Expenses", value: 316900, delta: 6.4, up: false, trend: [280, 285, 290, 300, 305, 317], icon: "fa-solid fa-file-invoice-dollar", format: (n) => "$" + Math.round(n).toLocaleString() },
  { label: "Net Margin", value: 64.5, delta: 3.1, up: true, trend: [58, 59, 61, 62, 63, 64], icon: "fa-solid fa-percent", format: (n) => n.toFixed(1) + "%" },
  { label: "Outstanding", value: 41200, delta: 5.6, up: false, trend: [30, 32, 35, 37, 39, 41], icon: "fa-regular fa-clock", format: (n) => "$" + Math.round(n).toLocaleString() },
];

const REVEXP_MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REVENUE_SERIES = [102, 118, 131, 146, 158, 172];
const EXPENSE_SERIES = [46, 49, 51, 55, 58, 61];
const EXPENSE_RATIO = 35;

const REVENUE_CATEGORIES = [
  { label: "Audio", value: 214 },
  { label: "Watches", value: 168 },
  { label: "Phones", value: 241 },
  { label: "Gaming", value: 122 },
  { label: "Cameras", value: 97 },
];

const INVOICES_BASE = [
  { id: "#INV-3311", client: "Amara Chen", amount: "$4,200.00", status: "Paid", due: "2026-06-02" },
  { id: "#INV-3312", client: "Kwame Mensah", amount: "$1,860.00", status: "Pending", due: "2026-07-14" },
  { id: "#INV-3313", client: "Priya Nair", amount: "$7,450.00", status: "Paid", due: "2026-06-21" },
  { id: "#INV-3314", client: "Diego Fernandez", amount: "$980.00", status: "Overdue", due: "2026-06-30" },
  { id: "#INV-3315", client: "Grace Okoro", amount: "$3,120.00", status: "Pending", due: "2026-07-28" },
  { id: "#INV-3316", client: "Liu Wei", amount: "$5,675.00", status: "Paid", due: "2026-07-05" },
];

function loadInvoiceEdits() {
  try { return JSON.parse(localStorage.getItem("pulse-invoice-edits") || "{}"); }
  catch { return {}; }
}
function saveInvoiceEdit(id, values) {
  const edits = loadInvoiceEdits();
  edits[id] = { ...(edits[id] || {}), ...values };
  localStorage.setItem("pulse-invoice-edits", JSON.stringify(edits));
}
const INVOICES = INVOICES_BASE.map((inv) => ({ ...inv, ...(loadInvoiceEdits()[inv.id] || {}) }));
let currentInvoiceRows = INVOICES;

const STATUS_STYLE = {
  Paid: "badge-up",
  Pending: "text-amber",
  Overdue: "badge-down",
};

function invoiceRowHTML(inv) {
  const statusClass = inv.status === "Pending" ? "" : STATUS_STYLE[inv.status];
  const statusBg = inv.status === "Pending" ? "background:color-mix(in srgb, var(--amber) 15%, transparent); color:var(--amber)" : "";
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${inv.client.toLowerCase()} ${inv.status.toLowerCase()} ${inv.id.toLowerCase()}">
      <td class="py-3 pr-3 font-mono text-xs text-text-soft">
        <button class="inline-flex items-center gap-1.5 hover:text-primary" onclick="copyToClipboard('${inv.id}', this)" aria-label="Copy invoice ID">${inv.id}<i class="fa-regular fa-copy text-[10px]"></i></button>
      </td>
      <td class="py-3 pr-3 text-sm font-medium">${inv.client}</td>
      <td class="py-3 pr-3 text-sm">${inv.amount}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}" style="${statusBg}">${inv.status}</span></td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden sm:table-cell">${inv.due}</td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${inv.id}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${inv.id}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderInvoices(rows) {
  currentInvoiceRows = rows;
  const tbody = document.getElementById("invoices-tbody");
  if (!tbody) return;
  if (!rows.length) {
    document.getElementById("table-empty").classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");
  tbody.innerHTML = rows.map(invoiceRowHTML).join("");
  revealRows(tbody);
}

function viewInvoice(id) {
  const inv = INVOICES.find((x) => x.id === id);
  if (!inv) return;
  openDetailPanel(inv.client, inv.id, [
    { label: "Amount", value: inv.amount },
    { label: "Status", value: inv.status },
    { label: "Due date", value: inv.due },
  ], "var(--primary)");
}

function editInvoice(id) {
  const inv = INVOICES.find((x) => x.id === id);
  if (!inv) return;
  openEditPanel(inv.id, inv.client, [
    { label: "Client", key: "client", value: inv.client, type: "text" },
    { label: "Amount", key: "amount", value: inv.amount, type: "text" },
    { label: "Status", key: "status", value: inv.status, type: "select", options: Object.keys(STATUS_STYLE) },
    { label: "Due date", key: "due", value: inv.due, type: "text" },
  ], "var(--primary)", (values) => {
    saveInvoiceEdit(id, values);
    Object.assign(inv, values);
    renderInvoices(currentInvoiceRows);
    toast(`${id} updated`);
  });
}

function renderReportKPIs() {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = REPORT_KPIS.map(
    (k, i) => `
    <div class="tilt-wrap" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium">${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${k.icon} text-xs text-text-soft"></i></span>
      </div>
      <div class="flex items-end justify-between gap-2">
        <p class="font-display font-bold text-2xl" id="report-kpi-value-${i}">0</p>
        <span class="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 mb-0.5 ${k.up ? "badge-up" : "badge-down"}">
          <i class="fa-solid ${k.up ? "fa-arrow-up" : "fa-arrow-down"} text-[9px]"></i>${k.delta}%
        </span>
      </div>
      <div class="mt-2 h-9" id="report-kpi-spark-${i}"></div>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);

  REPORT_KPIS.forEach((k, i) => {
    const valueEl = document.getElementById(`report-kpi-value-${i}`);
    if (valueEl) animateCounter(valueEl, k.value, 900 + i * 100, k.format);
    const sparkEl = document.getElementById(`report-kpi-spark-${i}`);
    if (sparkEl) renderSparkline(sparkEl, k.trend, k.up ? "var(--success)" : "var(--danger)");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderReportKPIs();

    const revexpEl = document.getElementById("revexp-chart");
    if (revexpEl) renderMultiLineChart(revexpEl, [
      { label: "Revenue", color: "var(--primary)", values: REVENUE_SERIES },
      { label: "Expenses", color: "var(--pink)", values: EXPENSE_SERIES },
    ], REVEXP_MONTHS);

    const heroSparkEl = document.getElementById("hero-spark");
    if (heroSparkEl) renderSparkline(heroSparkEl, REVENUE_SERIES, "var(--pink)");

    const donutEl = document.getElementById("expense-donut");
    if (donutEl) renderDonut(donutEl, EXPENSE_RATIO, "var(--pink)");
    const expenseValueEl = document.getElementById("expense-value");
    if (expenseValueEl) animateCounter(expenseValueEl, EXPENSE_RATIO, 1100, (n) => Math.round(n) + "%");

    const categoryEl = document.getElementById("category-chart");
    if (categoryEl) renderBarChart(categoryEl, REVENUE_CATEGORIES);

    renderInvoices(INVOICES);
    const thead = document.getElementById("invoices-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderInvoices(sortRows(currentInvoiceRows, stack)));

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);

  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderInvoices(q ? INVOICES.filter((inv) => (inv.client + " " + inv.status + " " + inv.id).toLowerCase().includes(q)) : INVOICES);
  });

  document.getElementById("invoices-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) viewInvoice(viewBtn.dataset.id);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) editInvoice(editBtn.dataset.id);
  });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-invoices", ["Invoice", "Client", "Amount", "Status", "Due"],
      currentInvoiceRows.map((inv) => [inv.id, inv.client, inv.amount, inv.status, inv.due]));
    toast("Invoices exported to CSV");
  });
});
