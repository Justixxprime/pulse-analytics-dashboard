/* ==========================================================================
   PULSE — orders.js
   ========================================================================== */

let ORDERS = [
  { id: "#10482", customer: "Amara Chen", items: 3, total: "$214.00", status: "Fulfilled", date: "Jul 14" },
  { id: "#10481", customer: "Diego Ramirez", items: 1, total: "$48.00", status: "Processing", date: "Jul 14" },
  { id: "#10480", customer: "Kwame Mensah", items: 5, total: "$612.40", status: "Fulfilled", date: "Jul 13" },
  { id: "#10479", customer: "Priya Nair", items: 2, total: "$96.50", status: "Pending", date: "Jul 13" },
  { id: "#10478", customer: "Grace Okafor", items: 4, total: "$388.10", status: "Fulfilled", date: "Jul 12" },
  { id: "#10477", customer: "Lucas Silva", items: 1, total: "$22.00", status: "Cancelled", date: "Jul 12" },
  { id: "#10476", customer: "Fatima Al-Sayed", items: 2, total: "$140.00", status: "Processing", date: "Jul 11" },
  { id: "#10475", customer: "Noah Bergström", items: 6, total: "$734.90", status: "Fulfilled", date: "Jul 11" },
];

const ORDER_STATUS_STYLE = {
  Fulfilled: "badge-up",
  Processing: "text-primary bg-primary/10",
  Pending: "text-amber bg-amber/10",
  Cancelled: "badge-down",
};

const selected = new Set();
let currentRows = ORDERS;
let activeStatusFilter = "all";

function orderRowHTML(o) {
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${(o.id + " " + o.customer + " " + o.status).toLowerCase()}">
      <td class="py-3 pr-2 w-8"><input type="checkbox" class="row-check" data-id="${o.id}" ${selected.has(o.id) ? "checked" : ""} aria-label="Select order ${o.id}"></td>
      <td class="py-3 pr-3 font-mono text-xs text-text-soft">
        <button class="inline-flex items-center gap-1.5 hover:text-primary" onclick="copyToClipboard('${o.id}', this)" aria-label="Copy order ID">${o.id}<i class="fa-regular fa-copy text-[10px]"></i></button>
      </td>
      <td class="py-3 pr-3 text-sm font-medium">${o.customer}</td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden sm:table-cell">${o.items}</td>
      <td class="py-3 pr-3 text-sm font-medium">${o.total}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_STYLE[o.status]}">${o.status}</span></td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden sm:table-cell">${o.date}</td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${o.id}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${o.id}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
          <button class="delete-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-danger hover:text-danger" data-id="${o.id}" aria-label="Delete"><i class="fa-regular fa-trash-can text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderOrders(rows) {
  currentRows = rows;
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;
  const empty = document.getElementById("table-empty");
  if (!rows.length) { empty.classList.remove("hidden"); tbody.innerHTML = ""; updateBulkBar(); return; }
  empty.classList.add("hidden");
  tbody.innerHTML = rows.map(orderRowHTML).join("");
  revealRows(tbody);
  const countEl = document.getElementById("orders-count");
  if (countEl) countEl.textContent = rows.length;
  updateBulkBar();
}

function updateBulkBar() {
  const bar = document.getElementById("bulk-bar");
  if (!bar) return;
  bar.dataset.open = selected.size > 0 ? "true" : "false";
  document.getElementById("bulk-count").textContent = selected.size;
  const selectAll = document.getElementById("select-all");
  if (selectAll) {
    const visibleIds = currentRows.map((r) => r.id);
    selectAll.checked = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  }
}

function viewOrder(id) {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) return;
  openDetailPanel(
    o.id,
    o.customer,
    [
      { label: "Status", value: o.status },
      { label: "Items", value: o.items },
      { label: "Total", value: o.total },
      { label: "Date", value: o.date },
    ],
    "var(--primary)"
  );
}

function editOrder(id) {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) return;
  openEditPanel(o.id, o.customer, [
    { label: "Customer", key: "customer", value: o.customer, type: "text" },
    { label: "Items", key: "items", value: o.items, type: "number", min: 1 },
    { label: "Total", key: "total", value: o.total, type: "text" },
    { label: "Status", key: "status", value: o.status, type: "select", options: Object.keys(ORDER_STATUS_STYLE) },
  ], "var(--primary)", (values) => {
    Object.assign(o, values);
    renderOrders(currentRows);
    toast(`${id} updated`);
  });
}

function applyFilters() {
  const search = document.getElementById("table-search");
  const q = search ? search.value.trim().toLowerCase() : "";
  let rows = activeStatusFilter === "all" ? ORDERS : ORDERS.filter((o) => o.status === activeStatusFilter);
  if (q) rows = rows.filter((o) => (o.id + " " + o.customer + " " + o.status).toLowerCase().includes(q));
  return rows;
}

function deleteOrder(id) {
  const idx = ORDERS.findIndex((o) => o.id === id);
  if (idx === -1) return;
  const [removed] = ORDERS.splice(idx, 1);
  selected.delete(id);
  renderOrders(applyFilters());
  toast(`Removed order ${removed.id}`, "ok", {
    label: "Undo",
    onUndo: () => { ORDERS.splice(idx, 0, removed); renderOrders(applyFilters()); },
  });
}

function bulkDelete() {
  const ids = [...selected];
  const removed = ORDERS.filter((o) => ids.includes(o.id));
  const removedWithIndex = removed.map((o) => ({ item: o, index: ORDERS.indexOf(o) }));
  ORDERS = ORDERS.filter((o) => !ids.includes(o.id));
  selected.clear();
  renderOrders(applyFilters());
  toast(`Removed ${removed.length} order${removed.length === 1 ? "" : "s"}`, "ok", {
    label: "Undo",
    onUndo: () => {
      removedWithIndex.sort((a, b) => a.index - b.index).forEach(({ item, index }) => ORDERS.splice(index, 0, item));
      renderOrders(applyFilters());
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderOrders(ORDERS);
    const fulfilled = ORDERS.filter((o) => o.status === "Fulfilled").length;
    const countEl = document.getElementById("fulfilled-count");
    if (countEl) animateCounter(countEl, fulfilled, 700);
    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");

    const thead = document.getElementById("orders-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderOrders(sortRows(currentRows, stack)));
  }, 650);

  document.getElementById("table-search")?.addEventListener("input", () => renderOrders(applyFilters()));

  document.querySelectorAll("[data-filter-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter-status]").forEach((b) => b.classList.remove("bg-primary", "text-white"));
      btn.classList.add("bg-primary", "text-white");
      activeStatusFilter = btn.dataset.filterStatus;
      renderOrders(applyFilters());
    });
  });

  document.getElementById("orders-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) return viewOrder(viewBtn.dataset.id);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) return editOrder(editBtn.dataset.id);
    const delBtn = e.target.closest(".delete-btn");
    if (delBtn) return deleteOrder(delBtn.dataset.id);
  });

  document.getElementById("orders-tbody")?.addEventListener("change", (e) => {
    const check = e.target.closest(".row-check");
    if (!check) return;
    check.checked ? selected.add(check.dataset.id) : selected.delete(check.dataset.id);
    updateBulkBar();
  });

  document.getElementById("select-all")?.addEventListener("change", (e) => {
    currentRows.forEach((r) => (e.target.checked ? selected.add(r.id) : selected.delete(r.id)));
    renderOrders(currentRows);
  });

  document.getElementById("bulk-delete-btn")?.addEventListener("click", bulkDelete);
  document.getElementById("bulk-clear-btn")?.addEventListener("click", () => { selected.clear(); renderOrders(currentRows); });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-orders", ["Order", "Customer", "Items", "Total", "Status", "Date"],
      currentRows.map((o) => [o.id, o.customer, o.items, o.total, o.status, o.date]));
    toast("Orders exported to CSV");
  });
});
