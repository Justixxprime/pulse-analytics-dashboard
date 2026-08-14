/* ==========================================================================
   PULSE — table-utils.js
   Two small, page-agnostic helpers shared by every table/grid page.
   ========================================================================== */

/**
 * Staggers the entrance of whatever was just rendered into a container
 * (table rows, product cards) — each direct child fades/slides in a
 * fraction of a second after the previous one instead of every row
 * appearing at once. Capped at 12 rows deep so a 200-row table doesn't
 * end with the last rows waiting seconds to appear; anything past that
 * just appears with the last row's delay.
 */
function revealRows(container) {
  if (!container) return;
  Array.from(container.children).forEach((row, i) => {
    row.classList.remove("row-enter");
    void row.offsetWidth;
    row.classList.add("row-enter");
    row.style.animationDelay = Math.min(i, 12) * 30 + "ms";
  });
}

/**
 * Sorts a plain array of objects by one or more {key, dir} criteria,
 * applying each as a tiebreaker for the ones before it — e.g.
 * sortRows(rows, [{key:"status",dir:"asc"}, {key:"total",dir:"desc"}])
 * sorts by status first, then by total (descending) wherever status ties.
 * Numeric-looking strings ("$124,639", "2,310") are cleaned to plain
 * numbers first so "Revenue" and "Sold" sort correctly instead of
 * alphabetically.
 */
function sortRows(rows, criteria) {
  const list = Array.isArray(criteria) ? criteria : [criteria];
  const compareOne = (a, b, key, dir) => {
    let av = a[key], bv = b[key];
    if (typeof av === "string") {
      const an = parseFloat(av.replace(/[^0-9.-]/g, ""));
      const bn = parseFloat(bv.replace(/[^0-9.-]/g, ""));
      if (!isNaN(an) && !isNaN(bn) && /[0-9]/.test(av)) { av = an; bv = bn; }
      else { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  };
  return [...rows].sort((a, b) => {
    for (const { key, dir } of list) {
      const result = compareOne(a, b, key, dir);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Wires up every <th data-sort="fieldName"> in a table so clicking it
 * calls `onSort(sortStack)`, toggling asc/descending on repeat clicks.
 * Shift-click a second (or third) column to add it as a tiebreaker
 * instead of replacing the current sort — a small numbered badge shows
 * each column's priority once more than one is active. A plain click
 * always resets back to a single-column sort.
 */
function attachSortHandlers(theadEl, onSort) {
  let stack = []; // [{key, dir}]

  function paint() {
    theadEl.querySelectorAll("th[data-sort]").forEach((el) => {
      const key = el.dataset.sort;
      const pos = stack.findIndex((s) => s.key === key);
      const icon = el.querySelector(".sort-icon");
      const badge = el.querySelector(".sort-priority");
      el.classList.toggle("sort-active", pos !== -1);
      if (icon) icon.className = `fa-solid ${pos === -1 ? "fa-sort" : stack[pos].dir === "asc" ? "fa-sort-up" : "fa-sort-down"} sort-icon`;
      if (badge) {
        badge.textContent = pos !== -1 && stack.length > 1 ? String(pos + 1) : "";
        badge.classList.toggle("hidden", pos === -1 || stack.length <= 1);
      }
    });
  }

  theadEl.querySelectorAll("th[data-sort]").forEach((th) => {
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-sort sort-icon";
    th.appendChild(icon);
    const badge = document.createElement("sup");
    badge.className = "sort-priority hidden";
    th.appendChild(badge);
    th.title = "Click to sort — shift-click to add as a tiebreaker";

    th.addEventListener("click", (e) => {
      const key = th.dataset.sort;
      const existingIdx = stack.findIndex((s) => s.key === key);

      if (!e.shiftKey) {
        // plain click: always a fresh single-column sort
        const dir = stack.length === 1 && stack[0].key === key && stack[0].dir === "asc" ? "desc" : "asc";
        stack = [{ key, dir }];
      } else if (existingIdx !== -1) {
        // shift-click a column already in the stack: flip its direction in place
        stack[existingIdx].dir = stack[existingIdx].dir === "asc" ? "desc" : "asc";
      } else {
        // shift-click a new column: add it as the next tiebreaker
        stack.push({ key, dir: "asc" });
      }
      paint();
      onSort(stack);
    });
  });
}

/**
 * A single reusable slide-over panel for "view details" on any row —
 * customers, orders, or products. Injects its own markup the first time
 * it's used, the same way the command palette does, so no page has to
 * remember to add it to the HTML by hand.
 *
 * `fields` is an array of {label, value} pairs rendered as a simple list.
 */
function openDetailPanel(title, subtitle, fields, accentColor) {
  let panel = document.getElementById("detail-overlay");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "detail-overlay";
    panel.dataset.open = "false";
    panel.className = "fixed inset-0 z-[55]";
    panel.innerHTML = `
      <div class="absolute inset-0 bg-black/40" data-close-detail></div>
      <div id="detail-panel" class="absolute right-0 top-0 h-full w-full sm:w-96 bg-surface border-l border-border p-5 overflow-y-auto">
        <div class="flex items-start justify-between mb-5">
          <div>
            <p id="detail-title" class="font-display font-semibold text-lg"></p>
            <p id="detail-subtitle" class="text-xs text-text-soft mt-0.5"></p>
          </div>
          <button data-close-detail class="h-8 w-8 flex items-center justify-center shrink-0" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="detail-fields" class="space-y-3"></div>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelectorAll("[data-close-detail]").forEach((el) => el.addEventListener("click", closeDetailPanel));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.dataset.open === "true") closeDetailPanel(); });
  }

  document.getElementById("detail-title").textContent = title;
  document.getElementById("detail-title").style.color = accentColor || "var(--text)";
  document.getElementById("detail-subtitle").textContent = subtitle || "";
  document.getElementById("detail-fields").innerHTML = fields
    .map((f) => `<div class="flex items-center justify-between py-2.5 border-b border-border last:border-0"><span class="text-xs text-text-soft">${f.label}</span><span class="text-sm font-medium text-right">${f.value}</span></div>`)
    .join("");

  panel.dataset.open = "true";
  document.body.style.overflow = "hidden";
  panel._release = trapFocus(panel, document.activeElement);
}

function closeDetailPanel() {
  const panel = document.getElementById("detail-overlay");
  if (!panel) return;
  panel.dataset.open = "false";
  document.body.style.overflow = "";
  if (panel._release) { panel._release(); panel._release = null; }
}

/**
 * A reusable "edit" slide-over — same mechanics as openDetailPanel, but
 * fields are real form inputs instead of static text, with a Save/Cancel
 * footer. `fields` is an array of
 *   { label, key, value, type: "text"|"select"|"number", options?, min?, max?, step? }
 * `onSave(values)` is called with an object of {key: newValue} once the
 * person clicks Save; the caller is responsible for updating its own
 * data array and re-rendering.
 */
function openEditPanel(title, subtitle, fields, accentColor, onSave) {
  let panel = document.getElementById("edit-overlay");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "edit-overlay";
    panel.dataset.open = "false";
    panel.className = "fixed inset-0 z-[55]";
    panel.innerHTML = `
      <div class="absolute inset-0 bg-black/40" data-close-edit></div>
      <div id="edit-panel" class="absolute right-0 top-0 h-full w-full sm:w-96 bg-surface border-l border-border p-5 overflow-y-auto flex flex-col">
        <div class="flex items-start justify-between mb-5">
          <div>
            <p class="font-display font-semibold text-lg">Edit <span id="edit-title"></span></p>
            <p id="edit-subtitle" class="text-xs text-text-soft mt-0.5"></p>
          </div>
          <button data-close-edit class="h-8 w-8 flex items-center justify-center shrink-0" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="edit-fields" class="space-y-4 flex-1"></form>
        <div class="flex items-center gap-2.5 pt-4 mt-4 border-t border-border">
          <button type="button" data-close-edit class="flex-1 text-sm font-semibold border border-border rounded-xl py-2.5 hover:border-primary">Cancel</button>
          <button type="button" id="edit-save-btn" class="btn-pop flex-1 text-sm font-semibold bg-primary text-white rounded-xl py-2.5 hover:bg-primary-dark">Save changes</button>
        </div>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelectorAll("[data-close-edit]").forEach((el) => el.addEventListener("click", closeEditPanel));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.dataset.open === "true") closeEditPanel(); });
  }

  document.getElementById("edit-title").textContent = title;
  document.getElementById("edit-title").style.color = accentColor || "var(--text)";
  document.getElementById("edit-subtitle").textContent = subtitle || "";

  const fieldsForm = document.getElementById("edit-fields");
  fieldsForm.innerHTML = fields.map((f) => {
    const inputBase = "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface focus:border-primary outline-none";
    let control;
    if (f.type === "select") {
      control = `<select id="edit-field-${f.key}" class="${inputBase}">${f.options.map((o) => `<option value="${o}" ${o === f.value ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    } else {
      control = `<input id="edit-field-${f.key}" type="${f.type === "number" ? "number" : "text"}" value="${f.value ?? ""}" ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step !== undefined ? `step="${f.step}"` : ""} class="${inputBase}">`;
    }
    return `<div><label for="edit-field-${f.key}" class="block text-xs font-mono uppercase text-text-soft mb-1">${f.label}</label>${control}</div>`;
  }).join("");

  const saveBtn = document.getElementById("edit-save-btn");
  saveBtn.onclick = () => {
    const values = {};
    fields.forEach((f) => {
      const el = document.getElementById(`edit-field-${f.key}`);
      values[f.key] = f.type === "number" ? Number(el.value) : el.value;
    });
    closeEditPanel();
    onSave(values);
  };

  panel.dataset.open = "true";
  document.body.style.overflow = "hidden";
  panel._release = trapFocus(panel, document.activeElement);
}

function closeEditPanel() {
  const panel = document.getElementById("edit-overlay");
  if (!panel) return;
  panel.dataset.open = "false";
  document.body.style.overflow = "";
  if (panel._release) { panel._release(); panel._release = null; }
}

/**
 * Turns an array-of-arrays into a downloaded CSV file. No dependency —
 * builds a Blob in memory and clicks a throwaway <a download> link.
 */
function exportToCSV(filename, headers, rows) {
  const escapeCell = (cell) => {
    const s = String(cell ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  const csv = lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
