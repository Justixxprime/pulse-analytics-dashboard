/* ==========================================================================
   PULSE — customers.js
   ========================================================================== */

let CUSTOMERS = [
  { id: "c1", name: "Amara Chen", email: "amara.chen@mail.com", orders: 24, spent: "$3,214", status: "Active", joined: "Mar 2024" },
  { id: "c2", name: "Diego Ramirez", email: "diego.r@mail.com", orders: 11, spent: "$1,048", status: "Active", joined: "Jun 2024" },
  { id: "c3", name: "Fatima Al-Sayed", email: "fatima.a@mail.com", orders: 6, spent: "$512", status: "New", joined: "Jul 2026" },
  { id: "c4", name: "Kwame Mensah", email: "kwame.m@mail.com", orders: 32, spent: "$5,880", status: "VIP", joined: "Jan 2023" },
  { id: "c5", name: "Priya Nair", email: "priya.n@mail.com", orders: 3, spent: "$210", status: "New", joined: "Jul 2026" },
  { id: "c6", name: "Lucas Silva", email: "lucas.silva@mail.com", orders: 17, spent: "$2,105", status: "Active", joined: "Sep 2024" },
  { id: "c7", name: "Grace Okafor", email: "grace.o@mail.com", orders: 41, spent: "$7,430", status: "VIP", joined: "Nov 2022" },
  { id: "c8", name: "Noah Bergström", email: "noah.b@mail.com", orders: 2, spent: "$88", status: "Inactive", joined: "Apr 2025" },
];

const STATUS_STYLE = {
  Active: "badge-up",
  VIP: "text-primary bg-primary/10",
  New: "text-teal bg-teal/10",
  Inactive: "text-text-soft bg-surface-2",
};

const selected = new Set();

function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function customerRowHTML(c) {
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${(c.name + " " + c.email).toLowerCase()}" data-id="${c.id}">
      <td class="py-3 pr-2 w-8"><input type="checkbox" class="row-check" data-id="${c.id}" ${selected.has(c.id) ? "checked" : ""} aria-label="Select ${c.name}"></td>
      <td class="py-3 pr-3">
        <div class="flex items-center gap-3">
          <span class="h-9 w-9 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">${initials(c.name)}</span>
          <div>
            <p class="text-sm font-medium">${c.name}</p>
            <p class="text-xs text-text-soft">${c.email}</p>
          </div>
        </div>
      </td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden sm:table-cell">${c.orders}</td>
      <td class="py-3 pr-3 text-sm font-medium">${c.spent}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[c.status]}">${c.status}</span></td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="view-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${c.id}" aria-label="View"><i class="fa-regular fa-eye text-xs"></i></button>
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${c.id}" aria-label="Edit"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
          <button class="delete-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-danger hover:text-danger" data-id="${c.id}" aria-label="Delete"><i class="fa-regular fa-trash-can text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

let currentRows = CUSTOMERS;

function renderCustomers(rows) {
  currentRows = rows;
  const tbody = document.getElementById("customers-tbody");
  if (!tbody) return;
  const empty = document.getElementById("table-empty");
  if (!rows.length) { empty.classList.remove("hidden"); tbody.innerHTML = ""; updateBulkBar(); return; }
  empty.classList.add("hidden");
  tbody.innerHTML = rows.map(customerRowHTML).join("");
  revealRows(tbody);
  document.getElementById("customers-count").textContent = rows.length;
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

function viewCustomer(id) {
  const c = CUSTOMERS.find((x) => x.id === id);
  if (!c) return;
  openDetailPanel(
    c.name,
    c.email,
    [
      { label: "Status", value: c.status },
      { label: "Total orders", value: c.orders },
      { label: "Total spent", value: c.spent },
      { label: "Customer since", value: c.joined },
    ],
    "var(--primary)"
  );
}

function editCustomer(id) {
  const c = CUSTOMERS.find((x) => x.id === id);
  if (!c) return;
  openEditPanel(c.name, c.email, [
    { label: "Name", key: "name", value: c.name, type: "text" },
    { label: "Email", key: "email", value: c.email, type: "text" },
    { label: "Status", key: "status", value: c.status, type: "select", options: Object.keys(STATUS_STYLE) },
  ], "var(--primary)", (values) => {
    Object.assign(c, values);
    renderCustomers(currentRows);
    toast(`${values.name} updated`);
  });
}

function deleteCustomer(id) {
  const idx = CUSTOMERS.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const [removed] = CUSTOMERS.splice(idx, 1);
  selected.delete(id);
  renderCustomers(applyCurrentSearch());
  toast(`Removed ${removed.name}`, "ok", {
    label: "Undo",
    onUndo: () => { CUSTOMERS.splice(idx, 0, removed); renderCustomers(applyCurrentSearch()); },
  });
}

function bulkDelete() {
  const ids = [...selected];
  const removed = CUSTOMERS.filter((c) => ids.includes(c.id));
  const removedWithIndex = removed.map((c) => ({ item: c, index: CUSTOMERS.indexOf(c) }));
  CUSTOMERS = CUSTOMERS.filter((c) => !ids.includes(c.id));
  selected.clear();
  renderCustomers(applyCurrentSearch());
  toast(`Removed ${removed.length} customer${removed.length === 1 ? "" : "s"}`, "ok", {
    label: "Undo",
    onUndo: () => {
      removedWithIndex.sort((a, b) => a.index - b.index).forEach(({ item, index }) => CUSTOMERS.splice(index, 0, item));
      renderCustomers(applyCurrentSearch());
    },
  });
}

function applyCurrentSearch() {
  const search = document.getElementById("table-search");
  const q = search ? search.value.trim().toLowerCase() : "";
  return q ? CUSTOMERS.filter((c) => (c.name + " " + c.email).toLowerCase().includes(q)) : CUSTOMERS;
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderCustomers(CUSTOMERS);
    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");

    const thead = document.getElementById("customers-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderCustomers(sortRows(currentRows, stack)));
  }, 650);

  document.getElementById("table-search")?.addEventListener("input", () => renderCustomers(applyCurrentSearch()));

  document.getElementById("customers-tbody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) return viewCustomer(viewBtn.dataset.id);
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) return editCustomer(editBtn.dataset.id);
    const delBtn = e.target.closest(".delete-btn");
    if (delBtn) return deleteCustomer(delBtn.dataset.id);
  });

  document.getElementById("customers-tbody")?.addEventListener("change", (e) => {
    const check = e.target.closest(".row-check");
    if (!check) return;
    check.checked ? selected.add(check.dataset.id) : selected.delete(check.dataset.id);
    updateBulkBar();
  });

  document.getElementById("select-all")?.addEventListener("change", (e) => {
    currentRows.forEach((r) => (e.target.checked ? selected.add(r.id) : selected.delete(r.id)));
    renderCustomers(currentRows);
  });

  document.getElementById("bulk-delete-btn")?.addEventListener("click", bulkDelete);
  document.getElementById("bulk-clear-btn")?.addEventListener("click", () => { selected.clear(); renderCustomers(currentRows); });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-customers", ["Name", "Email", "Orders", "Total spent", "Status", "Customer since"],
      currentRows.map((c) => [c.name, c.email, c.orders, c.spent, c.status, c.joined]));
    toast("Customers exported to CSV");
  });
});
