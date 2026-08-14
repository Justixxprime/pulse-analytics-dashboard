/* ==========================================================================
   PULSE — settings.js
   No backend here — this dashboard is a UI/visualization portfolio piece,
   so "saving" just means writing to localStorage and confirming with a
   toast, which is enough to demonstrate the interaction.
   ========================================================================== */

// toast() now lives in site.js (shared, supports an optional Undo button)

document.addEventListener("DOMContentLoaded", () => {
  const nameField = document.getElementById("name-field");
  const nameError = document.getElementById("name-field-error");
  if (nameField) nameField.value = localStorage.getItem("pulse-name") || "Obioma Chibueze Justice";

  function validateName() {
    const value = nameField.value.trim();
    let message = "";
    if (value.length === 0) message = "Display name is required.";
    else if (value.length < 2) message = "Display name must be at least 2 characters.";
    const invalid = Boolean(message);
    nameField.classList.toggle("input-error", invalid);
    nameField.setAttribute("aria-invalid", String(invalid));
    if (nameError) {
      nameError.textContent = message;
      nameError.classList.toggle("hidden", !invalid);
    }
    return !invalid;
  }

  nameField?.addEventListener("input", validateName);
  nameField?.addEventListener("blur", validateName);

  document.getElementById("profile-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateName()) {
      nameField.classList.add("field-shake");
      nameField.addEventListener("animationend", () => nameField.classList.remove("field-shake"), { once: true });
      nameField.focus();
      return;
    }
    localStorage.setItem("pulse-name", nameField.value.trim());
    toast("Profile saved");
  });

  document.querySelectorAll("[data-pref-toggle]").forEach((toggle) => {
    const key = "pulse-pref-" + toggle.dataset.prefToggle;
    toggle.checked = localStorage.getItem(key) !== "off";
    toggle.addEventListener("change", () => {
      localStorage.setItem(key, toggle.checked ? "on" : "off");
    });
  });
});
