/* ==========================================================================
   PULSE — team.js
   Mock data + render logic for team.html. Same shape as reports.js, plus
   real create/edit/remove wired to the shared edit panel and localStorage.
   ========================================================================== */

const TEAM_BASE = [
  { name: "Obioma Chibueze Justice", email: "obioma@pulse.app", role: "Owner", status: "Active", joined: "2025-11-02" },
  { name: "Amara Chen", email: "amara@pulse.app", role: "Admin", status: "Active", joined: "2026-01-14" },
  { name: "Priya Nair", email: "priya@pulse.app", role: "Editor", status: "Active", joined: "2026-02-20" },
  { name: "Kwame Mensah", email: "kwame@pulse.app", role: "Editor", status: "Active", joined: "2026-03-05" },
  { name: "Grace Okoro", email: "grace@pulse.app", role: "Viewer", status: "Invited", joined: "2026-07-22" },
  { name: "Liu Wei", email: "liu@pulse.app", role: "Viewer", status: "Active", joined: "2026-05-11" },
];

function loadTeamEdits() {
  try { return JSON.parse(localStorage.getItem("pulse-team-edits") || "{}"); }
  catch { return {}; }
}
function saveTeamEdit(email, values) {
  const edits = loadTeamEdits();
  edits[email] = { ...(edits[email] || {}), ...values };
  localStorage.setItem("pulse-team-edits", JSON.stringify(edits));
}
function loadNewMembers() {
  try { return JSON.parse(localStorage.getItem("pulse-team-new") || "[]"); }
  catch { return []; }
}
function saveNewMember(m) {
  const list = loadNewMembers();
  list.push(m);
  localStorage.setItem("pulse-team-new", JSON.stringify(list));
}
function loadRemovedMembers() {
  try { return JSON.parse(localStorage.getItem("pulse-team-removed") || "[]"); }
  catch { return []; }
}
function saveRemovedMembers(emails) {
  localStorage.setItem("pulse-team-removed", JSON.stringify(emails));
}

const removedEmails = new Set(loadRemovedMembers());
let TEAM = [
  ...TEAM_BASE.map((m) => ({ ...m, ...(loadTeamEdits()[m.email] || {}) })),
  ...loadNewMembers(),
].filter((m) => !removedEmails.has(m.email));
let currentTeamRows = TEAM;

const ROLE_OPTIONS = ["Owner", "Admin", "Editor", "Viewer"];
const TEAM_STATUS_STYLE = { Active: "badge-up", Invited: "" };

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function teamRowHTML(m) {
  const statusClass = m.status === "Active" ? TEAM_STATUS_STYLE.Active : "";
  const statusBg = m.status === "Invited" ? "background:color-mix(in srgb, var(--amber) 15%, transparent); color:var(--amber)" : "";
  return `
    <tr class="table-row border-b border-border last:border-0" data-name="${m.name.toLowerCase()} ${m.email.toLowerCase()} ${m.role.toLowerCase()} ${m.status.toLowerCase()}">
      <td class="py-3 pr-3">
        <div class="flex items-center gap-3">
          <span class="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style="background:linear-gradient(135deg, var(--primary), var(--teal))">${initials(m.name)}</span>
          <span class="text-sm font-medium">${m.name}</span>
        </div>
      </td>
      <td class="py-3 pr-3 text-sm text-text-soft hidden sm:table-cell">${m.email}</td>
      <td class="py-3 pr-3 text-sm">${m.role}</td>
      <td class="py-3 pr-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}" style="${statusBg}">${m.status}</span></td>
      <td class="py-3 pr-3 text-xs text-text-soft font-mono hidden md:table-cell">${m.joined}</td>
      <td class="py-3 pl-3 sticky right-0 bg-surface shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.35)]">
        <div class="row-actions flex items-center gap-2 justify-end">
          <button class="edit-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary" data-email="${m.email}" aria-label="Edit role" ${m.role === "Owner" ? "disabled style='opacity:.35;pointer-events:none'" : ""}><i class="fa-regular fa-pen-to-square text-xs"></i></button>
          <button class="remove-btn h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-danger hover:text-danger" data-email="${m.email}" aria-label="Remove" ${m.role === "Owner" ? "disabled style='opacity:.35;pointer-events:none'" : ""}><i class="fa-regular fa-trash-can text-xs"></i></button>
        </div>
      </td>
    </tr>`;
}

function renderTeam(rows) {
  currentTeamRows = rows;
  const tbody = document.getElementById("team-tbody");
  if (!tbody) return;
  if (!rows.length) {
    document.getElementById("table-empty").classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");
  tbody.innerHTML = rows.map(teamRowHTML).join("");
  revealRows(tbody);
}

function editMemberRole(email) {
  const m = TEAM.find((x) => x.email === email);
  if (!m) return;
  openEditPanel(m.name, m.email, [
    { label: "Role", key: "role", value: m.role, type: "select", options: ROLE_OPTIONS.filter((r) => r !== "Owner") },
    { label: "Status", key: "status", value: m.status, type: "select", options: ["Active", "Invited"] },
  ], "var(--teal)", (values) => {
    saveTeamEdit(email, values);
    Object.assign(m, values);
    renderTeam(currentTeamRows);
    toast(`${m.name}'s role updated`);
  });
}

function removeMember(email) {
  const m = TEAM.find((x) => x.email === email);
  if (!m) return;
  TEAM = TEAM.filter((x) => x.email !== email);
  removedEmails.add(email);
  saveRemovedMembers([...removedEmails]);
  renderTeam(TEAM);
  toast(`${m.name} removed`, "ok", {
    label: "Undo",
    onUndo: () => {
      removedEmails.delete(email);
      saveRemovedMembers([...removedEmails]);
      TEAM.push(m);
      renderTeam(TEAM);
    },
  });
}

function inviteMember() {
  openEditPanel("Invite a teammate", "New member", [
    { label: "Name", key: "name", value: "", type: "text" },
    { label: "Email", key: "email", value: "", type: "text" },
    { label: "Role", key: "role", value: "Viewer", type: "select", options: ROLE_OPTIONS.filter((r) => r !== "Owner") },
  ], "var(--primary)", (values) => {
    const email = values.email.trim().toLowerCase();
    if (!values.name.trim() || !email) return toast("Name and email are required — nothing was invited", "error");
    if (TEAM.some((m) => m.email.toLowerCase() === email)) return toast(`${email} is already on the team`, "error");
    const newMember = { name: values.name.trim(), email, role: values.role, status: "Invited", joined: new Date().toISOString().slice(0, 10) };
    TEAM.push(newMember);
    saveNewMember(newMember);
    renderTeam(TEAM);
    toast(`Invited ${newMember.name}`);
  });
}

const TEAM_KPIS = [
  { label: "Total Members", value: () => TEAM.length, icon: "fa-solid fa-users" },
  { label: "Pending Invites", value: () => TEAM.filter((m) => m.status === "Invited").length, icon: "fa-regular fa-envelope" },
  { label: "Admins", value: () => TEAM.filter((m) => m.role === "Owner" || m.role === "Admin").length, icon: "fa-solid fa-user-shield" },
  { label: "Active This Week", value: () => TEAM.filter((m) => m.status === "Active").length, icon: "fa-solid fa-bolt" },
];

function renderTeamKPIs() {
  const wrap = document.getElementById("kpi-wrap");
  if (!wrap) return;
  wrap.innerHTML = TEAM_KPIS.map(
    (k, i) => `
    <div class="tilt-wrap" data-tilt-max="6" data-reveal data-reveal-delay="${i}">
    <div class="tilt-el card p-5">
      <div class="flex items-start justify-between mb-1">
        <p class="text-xs text-text-soft font-medium">${k.label}</p>
        <span class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background:var(--surface-2)"><i class="${k.icon} text-xs text-text-soft"></i></span>
      </div>
      <p class="font-display font-bold text-2xl" id="team-kpi-value-${i}">0</p>
    </div>
    </div>`
  ).join("");
  revealNow(wrap);
  TEAM_KPIS.forEach((k, i) => {
    const el = document.getElementById(`team-kpi-value-${i}`);
    if (el) animateCounter(el, k.value(), 700 + i * 100);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderTeamKPIs();
    renderTeam(TEAM);
    const thead = document.getElementById("team-thead");
    if (thead) attachSortHandlers(thead, (stack) => renderTeam(sortRows(currentTeamRows, stack)));

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);

  document.getElementById("table-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderTeam(q ? TEAM.filter((m) => (m.name + " " + m.email + " " + m.role + " " + m.status).toLowerCase().includes(q)) : TEAM);
  });

  document.getElementById("team-tbody")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) return editMemberRole(editBtn.dataset.email);
    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) return removeMember(removeBtn.dataset.email);
  });

  document.getElementById("invite-btn")?.addEventListener("click", inviteMember);

  document.getElementById("export-btn")?.addEventListener("click", () => {
    exportToCSV("pulse-team", ["Name", "Email", "Role", "Status", "Joined"],
      currentTeamRows.map((m) => [m.name, m.email, m.role, m.status, m.joined]));
    toast("Team list exported to CSV");
  });
});
