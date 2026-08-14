/* ==========================================================================
   PULSE — analytics.js
   ========================================================================== */

const TRAFFIC_SOURCES = [
  { label: "Organic", value: 42, color: "var(--primary)" },
  { label: "Social", value: 27, color: "var(--teal)" },
  { label: "Direct", value: 18, color: "var(--pink)" },
  { label: "Referral", value: 13, color: "var(--amber)" },
];

const SESSIONS_BY_MONTH = [
  { label: "Feb", value: 41 }, { label: "Mar", value: 48 }, { label: "Apr", value: 39 },
  { label: "May", value: 58 }, { label: "Jun", value: 63 }, { label: "Jul", value: 71 },
];

const CONVERSION_VALUES = [2.1, 2.6, 2.4, 3.1, 3.4, 3.0, 3.8];
const CONVERSION_LABELS = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5", "Wk6", "Wk7"];

const REVENUE_COMPARISON = [
  { label: "Actual", color: "var(--primary)", values: [32, 41, 38, 52, 47, 61, 55] },
  { label: "Target", color: "var(--text-soft)", values: [35, 38, 42, 46, 50, 54, 58] },
];
const REVENUE_COMPARISON_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

// 12 weeks x 7 days of order-activity intensity (0-4), hand-authored to
// look like a believable pattern: weekends a little quieter, one slow week.
const ACTIVITY_WEEKS = [
  [1, 2, 1, 3, 2, 1, 0], [2, 3, 2, 4, 3, 1, 1], [0, 1, 1, 2, 1, 0, 0], [3, 4, 3, 4, 4, 2, 1],
  [2, 2, 3, 3, 2, 1, 1], [1, 1, 2, 2, 3, 2, 1], [4, 4, 3, 4, 4, 3, 2], [2, 3, 2, 3, 3, 1, 1],
  [1, 2, 2, 3, 2, 1, 0], [3, 3, 4, 4, 3, 2, 2], [2, 2, 1, 2, 2, 1, 0], [4, 3, 4, 4, 4, 3, 2],
];

function renderTrafficBars() {
  const wrap = document.getElementById("traffic-bars");
  if (!wrap) return;
  wrap.innerHTML = TRAFFIC_SOURCES.map(
    (s) => `
    <div>
      <div class="flex items-center justify-between text-xs mb-1.5">
        <span class="font-medium">${s.label}</span>
        <span class="font-mono text-text-soft">${s.value}%</span>
      </div>
      <div class="h-2.5 rounded-full bg-surface-2 overflow-hidden">
        <div class="h-full rounded-full traffic-bar" style="width:0%; background:${s.color}" data-target="${s.value}"></div>
      </div>
    </div>`
  ).join("");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      wrap.querySelectorAll(".traffic-bar").forEach((el) => {
        el.style.transition = "width 1s cubic-bezier(.2,.8,.2,1)";
        el.style.width = el.dataset.target + "%";
      });
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const sessionsEl = document.getElementById("sessions-chart");
    if (sessionsEl) renderBarChart(sessionsEl, SESSIONS_BY_MONTH);

    const convEl = document.getElementById("conversion-chart");
    if (convEl) renderLineChart(convEl, CONVERSION_VALUES, CONVERSION_LABELS);

    const engagementEl = document.getElementById("engagement-donut");
    if (engagementEl) renderDonut(engagementEl, 74, "var(--primary)");
    const engagementValueEl = document.getElementById("engagement-value");
    if (engagementValueEl) animateCounter(engagementValueEl, 74, 1000);

    const comparisonEl = document.getElementById("revenue-comparison-chart");
    if (comparisonEl) renderMultiLineChart(comparisonEl, REVENUE_COMPARISON, REVENUE_COMPARISON_LABELS);

    const heatmapEl = document.getElementById("activity-heatmap");
    if (heatmapEl) renderHeatmap(heatmapEl, ACTIVITY_WEEKS);

    renderTrafficBars();

    document.getElementById("skeleton-layer")?.classList.add("hidden");
    document.getElementById("real-content")?.classList.remove("hidden");
  }, 750);
});
