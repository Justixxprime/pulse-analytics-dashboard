/* ==========================================================================
   PULSE — products.js
   A grid layout instead of a table, to keep the app from feeling like
   "table, table, table" — same skeleton + instant-search pattern underneath,
   plus a sort <select> (a grid has no column headers to click on) and a
   click-to-view detail panel shared with the other pages.
   ========================================================================== */

const CATALOG_BASE = [
  { id: "p1", name: "Hybrid Active Noise Cancelling Headphones", category: "Audio", price: "$249.00", stock: 82, color: "var(--primary)", sku: "SKU-3009" },
  { id: "p2", name: "Casio G-Shock Shock Resistant Watch", category: "Watches", price: "$129.00", stock: 41, color: "var(--teal)", sku: "SKU-3001" },
  { id: "p3", name: "Samsung 525 Ultra Smartphone", category: "Phones", price: "$999.00", stock: 15, color: "var(--pink)", sku: "SKU-3004" },
  { id: "p4", name: "Xbox Wireless Gaming Controller", category: "Gaming", price: "$64.00", stock: 120, color: "var(--amber)", sku: "SKU-3002" },
  { id: "p5", name: "Timex Men's Easy Reader Watch", category: "Watches", price: "$78.00", stock: 63, color: "var(--teal)", sku: "SKU-3005" },
  { id: "p6", name: "Sony Alpha Mirrorless Camera", category: "Cameras", price: "$1,299.00", stock: 9, color: "var(--primary)", sku: "SKU-3006" },
  { id: "p7", name: "Mechanical Keyboard, Hot-swap", category: "Accessories", price: "$139.00", stock: 54, color: "var(--pink)", sku: "SKU-3007" },
  { id: "p8", name: "Portable Bluetooth Speaker", category: "Audio", price: "$89.00", stock: 97, color: "var(--amber)", sku: "SKU-3008" },
];

function loadProductEdits() {
  try { return JSON.parse(localStorage.getItem("pulse-product-edits") || "{}"); }
  catch { return {}; }
}
function saveProductEdit(id, values) {
  const edits = loadProductEdits();
  edits[id] = { ...(edits[id] || {}), ...values };
  localStorage.setItem("pulse-product-edits", JSON.stringify(edits));
}
const CATALOG = CATALOG_BASE.map((p) => ({ ...p, ...(loadProductEdits()[p.id] || {}) }));

let currentRows = CATALOG;

function stockLabel(stock) {
  if (stock < 15) return { text: "Low stock", cls: "badge-down" };
  if (stock < 50) return { text: "Limited", cls: "text-amber bg-amber/10" };
  return { text: "In stock", cls: "badge-up" };
}

function productCardHTML(p) {
  const s = stockLabel(p.stock);
  return `
    <div class="product-card card card-hover p-4 text-left w-full relative cursor-pointer" data-id="${p.id}" data-name="${(p.name + " " + p.category).toLowerCase()}" data-reveal role="button" tabindex="0" aria-label="View ${p.name}">
      <button class="edit-product-btn absolute top-3 right-3 z-10 h-7 w-7 rounded-lg bg-surface/90 border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-id="${p.id}" aria-label="Edit ${p.name}"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
      <div class="h-28 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden" style="background:linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 60%, black))">
        <i class="fa-solid fa-box-open text-white/80 text-2xl"></i>
        <img src="images/products/${p.sku}.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" onerror="this.style.display='none'" loading="lazy" />
      </div>
      <p class="text-[11px] font-mono text-text-soft uppercase">${p.category}</p>
      <p class="text-sm font-semibold mt-1 leading-snug">${p.name}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="font-display font-bold">${p.price}</span>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}">${s.text}</span>
      </div>
    </div>`;
}

function renderProducts(rows) {
  currentRows = rows;
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  const empty = document.getElementById("grid-empty");
  if (!rows.length) { empty.classList.remove("hidden"); grid.innerHTML = ""; return; }
  empty.classList.add("hidden");
  grid.innerHTML = rows.map(productCardHTML).join("");
  revealRows(grid);
  document.getElementById("products-count").textContent = rows.length;
  initScrollReveal();
}

function viewProduct(id) {
  const p = CATALOG.find((x) => x.id === id);
  if (!p) return;
  const s = stockLabel(p.stock);
  openDetailPanel(
    p.name,
    p.sku,
    [
      { label: "Category", value: p.category },
      { label: "Price", value: p.price },
      { label: "Units in stock", value: p.stock },
      { label: "Status", value: s.text },
    ],
    p.color
  );
}

function editProduct(id) {
  const p = CATALOG.find((x) => x.id === id);
  if (!p) return;
  openEditPanel(p.name, p.sku, [
    { label: "Name", key: "name", value: p.name, type: "text" },
    { label: "Category", key: "category", value: p.category, type: "text" },
    { label: "Price", key: "price", value: p.price, type: "text" },
    { label: "Units in stock", key: "stock", value: p.stock, type: "number", min: 0 },
  ], p.color, (values) => {
    saveProductEdit(id, values);
    Object.assign(p, values);
    renderProducts(currentRows);
    toast(`${values.name} updated`);
  });
}

function applyCurrentSearch() {
  const search = document.getElementById("table-search");
  const q = search ? search.value.trim().toLowerCase() : "";
  return q ? CATALOG.filter((p) => (p.name + " " + p.category).toLowerCase().includes(q)) : CATALOG;
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderProducts(CATALOG);
    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 650);

  document.getElementById("table-search")?.addEventListener("input", () => renderProducts(applyCurrentSearch()));

  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    const [key, dir] = e.target.value.split("-");
    renderProducts(sortRows(currentRows, { key, dir }));
  });

  document.getElementById("products-grid")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-product-btn");
    if (editBtn) return editProduct(editBtn.dataset.id);
    const card = e.target.closest(".product-card");
    if (card) viewProduct(card.dataset.id);
  });

  document.getElementById("products-grid")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".product-card");
    if (!card) return;
    e.preventDefault();
    viewProduct(card.dataset.id);
  });

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-products", ["Name", "SKU", "Category", "Price", "Stock"],
      currentRows.map((p) => [p.name, p.sku, p.category, p.price, p.stock]));
    toast("Products exported to CSV");
  });
});
