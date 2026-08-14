/* ==========================================================================
   PULSE — content.js
   Mock data + render logic for content.html. Same shape as reports.js.
   ========================================================================== */

const CONTENT_KPIS = [
  { label: "Published", value: 24, delta: 4.3, up: true, trend: [18, 19, 20, 21, 23, 24], icon: "fa-solid fa-circle-check", format: (n) => Math.round(n).toLocaleString() },
  { label: "Drafts", value: 7, delta: 16.7, up: true, trend: [3, 4, 5, 5, 6, 7], icon: "fa-regular fa-pen-to-square", format: (n) => Math.round(n).toLocaleString() },
  { label: "Total Views", value: 128400, delta: 11.6, up: true, trend: [82, 91, 101, 110, 119, 128.4], icon: "fa-regular fa-eye", format: (n) => Math.round(n).toLocaleString() },
  { label: "Avg. Read Time", value: 222, delta: 3.4, up: true, trend: [195, 200, 205, 210, 216, 222], icon: "fa-regular fa-clock", format: (n) => Math.floor(n / 60) + "m " + Math.round(n % 60) + "s" },
];

const CONTENT_TYPE_CATEGORIES = [
  { label: "Blog Posts", value: 58 },
  { label: "Landing Pages", value: 34 },
  { label: "Guides", value: 41 },
  { label: "Product Pages", value: 22 },
  { label: "Help Docs", value: 15 },
];

const CONTENT_ITEMS_BASE = [
  { title: "How we cut checkout time by 40%", type: "Blog Post", status: "Published", author: "Obioma Justice", views: 14200, updated: "2026-07-18" },
  { title: "Summer Sale — Landing Page", type: "Landing Page", status: "Published", author: "Amara Chen", views: 9840, updated: "2026-07-22" },
  { title: "Getting started with Pulse API", type: "Guide", status: "Published", author: "Priya Nair", views: 6310, updated: "2026-06-30" },
  { title: "Q3 product roadmap (draft)", type: "Blog Post", status: "Draft", author: "Obioma Justice", views: 0, updated: "2026-07-27" },
  { title: "Returns & exchanges policy", type: "Help Doc", status: "Published", author: "Kwame Mensah", views: 4120, updated: "2026-05-14" },
  { title: "Black Friday teaser page", type: "Landing Page", status: "Scheduled", author: "Grace Okoro", views: 0, updated: "2026-07-29" },
  { title: "Shipping rates by region", type: "Help Doc", status: "Published", author: "Priya Nair", views: 3050, updated: "2026-04-02" },
  { title: "New camera lineup — buyer's guide", type: "Guide", status: "Draft", author: "Liu Wei", views: 0, updated: "2026-07-25" },
];

function loadContentEdits() {
  try { return JSON.parse(localStorage.getItem("pulse-content-edits") || "{}"); }
  catch { return {}; }
}
function saveContentEdit(title, values) {
  const edits = loadContentEdits();
  edits[title] = { ...(edits[title] || {}), ...values };
  localStorage.setItem("pulse-content-edits", JSON.stringify(edits));
}
const CONTENT_ITEMS = [
  ...CONTENT_ITEMS_BASE.map((c) => ({ ...c, ...(loadContentEdits()[c.title] || {}) })),
  ...JSON.parse(localStorage.getItem("pulse-content-new") || "[]"),
];
let currentContentRows = CONTENT_ITEMS;

const CONTENT_STATUS_STYLE = {
  Published: "badge-up",
  Draft: "",
  Scheduled: "",
};

function contentRowHTML(c) {
  let statusClass = "", statusBg = "";
  if (c.status === "Published") statusClass = CONTENT_STATUS_STYLE.Published;
  else if (c.status === "Draft") statusBg = "background:color-mix(in srgb, var(--text-soft) 18%, transparent); color:var(--text-soft)";
  else statusBg = "background:color-mix(in srgb, var(--teal) 15%, transparent); color:var(--teal)";
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${c.title.toLowerCase()} ${c.type.toLowerCase()} ${c.status.toLowerCase()} ${c.author.toLowerCase()}">
      <td class="py-3 pr-3 text-sm font-medium max-w-[220px] truncate">${c.title}</td>
      <td class="py-3 pr-3 text-xs text-text-soft hidden sm:table-cell">${c.type}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}" style="${statusBg}">${c.status}</span></td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden md:table-cell">${c.author}</td>
      <td class="py-3 pr-3 text-sm">${c.views ? c.views.toLocaleString() : "—"}</td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden sm:table-cell">${c.updated}</td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-title="${c.title}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-title="${c.title}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderContent(rows) {
  currentContentRows = rows;
  const tbody = document.getElementById("content-tbody");
  if (!tbody) return;
  if (!rows.length) {
    document.getElementById("table-empty").classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");
  tbody.innerHTML = rows.map(contentRowHTML).join("");
  revealRows(tbody);
}

function viewContentItem(title) {
  const c = CONTENT_ITEMS.find((x) => x.title === title);
  if (!c) return;
  openDetailPanel(c.title, c.type, [
    { label: "Status", value: c.status },
    { label: "Author", value: c.author },
    { label: "Views", value: c.views ? c.views.toLocaleString() : "—" },
    { label: "Last updated", value: c.updated },
  ], "var(--teal)");
}

function editContentItem(title) {
  const c = CONTENT_ITEMS.find((x) => x.title === title);
  if (!c) return;
  openEditPanel(c.title, "Content item", [
    { label: "Title", key: "title", value: c.title, type: "text" },
    { label: "Type", key: "type", value: c.type, type: "select", options: ["Blog Post", "Landing Page", "Guide", "Help Doc"] },
    { label: "Status", key: "status", value: c.status, type: "select", options: ["Draft", "Scheduled", "Published"] },
    { label: "Author", key: "author", value: c.author, type: "text" },
  ], "var(--teal)", (values) => {
    saveContentEdit(title, values);
    Object.assign(c, values);
    renderContent(currentContentRows);
    toast(`"${values.title}" updated`);
  });
}

function renderContentKPIs() {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = CONTENT_KPIS.map(
    (k, i) => `
    <div class="tilt-wrap" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium">${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${k.icon} text-xs text-text-soft"></i></span>
      </div>
      <div class="flex items-end justify-between gap-2">
        <p class="font-display font-bold text-2xl" id="content-kpi-value-${i}">0</p>
        <span class="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 mb-0.5 ${k.up ? "badge-up" : "badge-down"}">
          <i class="fa-solid ${k.up ? "fa-arrow-up" : "fa-arrow-down"} text-[9px]"></i>${k.delta}%
        </span>
      </div>
      <div class="mt-2 h-9" id="content-kpi-spark-${i}"></div>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);

  CONTENT_KPIS.forEach((k, i) => {
    const valueEl = document.getElementById(`content-kpi-value-${i}`);
    if (valueEl) animateCounter(valueEl, k.value, 900 + i * 100, k.format);
    const sparkEl = document.getElementById(`content-kpi-spark-${i}`);
    if (sparkEl) renderSparkline(sparkEl, k.trend, k.up ? "var(--success)" : "var(--danger)");
  });
}

function loadNewContent() {
  try { return JSON.parse(localStorage.getItem("pulse-content-new") || "[]"); }
  catch { return []; }
}
function saveNewContent(c) {
  const list = loadNewContent();
  list.push(c);
  localStorage.setItem("pulse-content-new", JSON.stringify(list));
}

function createContentItem() {
  openEditPanel("New content", "Create an item", [
    { label: "Title", key: "title", value: "", type: "text" },
    { label: "Type", key: "type", value: "Blog Post", type: "select", options: ["Blog Post", "Landing Page", "Guide", "Help Doc"] },
    { label: "Status", key: "status", value: "Draft", type: "select", options: ["Draft", "Scheduled", "Published"] },
    { label: "Author", key: "author", value: "", type: "text" },
  ], "var(--teal)", (values) => {
    const title = values.title.trim();
    if (!title) return toast("A title is required — nothing was created", "error");
    if (CONTENT_ITEMS.some((c) => c.title === title)) return toast("That title already exists", "error");
    const newItem = { ...values, title, views: 0, updated: new Date().toISOString().slice(0, 10) };
    CONTENT_ITEMS.push(newItem);
    saveNewContent(newItem);
    renderContent(CONTENT_ITEMS);
    toast(`"${title}" created`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderContentKPIs();

    const typeChartEl = document.getElementById("content-type-chart");
    if (typeChartEl) renderBarChart(typeChartEl, CONTENT_TYPE_CATEGORIES);

    const heroSparkEl = document.getElementById("hero-spark");
    if (heroSparkEl) renderSparkline(heroSparkEl, [82, 91, 101, 110, 119, 128], "var(--teal)");

    renderContent(CONTENT_ITEMS);
    const thead = document.getElementById("content-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderContent(sortRows(currentContentRows, stack)));

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);

  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderContent(q ? CONTENT_ITEMS.filter((c) => (c.title + " " + c.type + " " + c.status + " " + c.author).toLowerCase().includes(q)) : CONTENT_ITEMS);
  });

  document.getElementById("content-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) viewContentItem(viewBtn.dataset.title);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) editContentItem(editBtn.dataset.title);
  });

  document.getElementById("new-content-btn")?.addEventListener("click", createContentItem);

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-content", ["Title", "Type", "Status", "Author", "Views", "Updated"],
      currentContentRows.map((c) => [c.title, c.type, c.status, c.author, c.views, c.updated]));
    toast("Content list exported to CSV");
  });
});
