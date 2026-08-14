/* ==========================================================================
   PULSE — charts.js
   Three small, dependency-free chart builders. Each one writes plain SVG
   (or, for the bar chart, plain divs) into a container, then — one frame
   later — adds a "ready" class that CSS transitions animate: bars grow
   up, the line draws itself in, the donut ring sweeps around.
   Two frames (nested requestAnimationFrame) are used instead of one so the
   browser is guaranteed to have painted the *starting* state (height 0 /
   dash offset full) before we ask it to transition to the end state —
   skip that and some browsers just snap straight to the final frame.
   ========================================================================== */

function renderBarChart(containerEl, data) {
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  containerEl.classList.remove("bars-ready");
  containerEl.innerHTML = `<div class="flex items-end gap-3 sm:gap-4 h-full">${data
    .map((d) => {
      const pct = Math.max(4, Math.round((d.value / max) * 100));
      return `
        <div class="flex flex-col items-center gap-2 flex-1">
          <div class="relative w-full flex items-end justify-center" style="height:170px">
            <div class="bar-fill w-full max-w-[30px] rounded-t-lg" style="height:${pct}%; background:${d.color || "linear-gradient(180deg, var(--primary), var(--primary-dark))"}" data-tooltip="${d.label}: ${d.value}"></div>
          </div>
          <span class="font-mono text-[10px] text-text-soft">${d.label}</span>
        </div>`;
    })
    .join("")}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => containerEl.classList.add("bars-ready")));
}

function renderLineChart(containerEl, values, labels) {
  const w = 600, h = 200, pad = 14;
  const max = Math.max(...values) * 1.1;
  const min = Math.min(...values) * 0.85;
  const stepX = (w - 2 * pad) / (values.length - 1);
  const points = values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / (max - min)) * (h - 2 * pad)]);
  const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const areaD = `${pathD} L${points[points.length - 1][0].toFixed(1)},${h - pad} L${points[0][0].toFixed(1)},${h - pad} Z`;
  const dots = points
    .map((p, i) => `<circle class="line-dot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--primary)" stroke="var(--surface)" stroke-width="2" data-tooltip="${labels ? labels[i] : ""}: ${values[i]}"></circle>`)
    .join("");

  containerEl.classList.remove("line-ready");
  containerEl.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad-${containerEl.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path class="line-area" d="${areaD}" fill="url(#lineGrad-${containerEl.id})" stroke="none"/>
      <path class="line-path" d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  requestAnimationFrame(() => requestAnimationFrame(() => containerEl.classList.add("line-ready")));
}

function renderDonut(containerEl, percent, color) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  containerEl.classList.remove("donut-ready");
  containerEl.innerHTML = `
    <svg viewBox="0 0 140 140" class="w-full h-auto -rotate-90">
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="14"/>
      <circle class="donut-ring" cx="70" cy="70" r="${r}" fill="none" stroke="${color || "var(--primary)"}"
        stroke-width="14" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}"
        style="--donut-offset:${offset.toFixed(1)}"/>
    </svg>`;
  requestAnimationFrame(() => requestAnimationFrame(() => containerEl.classList.add("donut-ready")));
}

/**
 * A GitHub-style contribution heatmap: `weeks` columns of 7 day-cells each,
 * colored by intensity (0-4). No animation library needed — cells fade/scale
 * in with a short stagger using plain CSS transition-delay per cell.
 */
function renderHeatmap(containerEl, weeks) {
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const intensityColor = (level) => {
    if (level <= 0) return "var(--surface-2)";
    const alpha = [0, 0.28, 0.5, 0.72, 1][Math.min(level, 4)];
    return `color-mix(in srgb, var(--primary) ${Math.round(alpha * 100)}%, var(--surface-2))`;
  };

  let html = '<div class="flex gap-[3px]">';
  weeks.forEach((week, wi) => {
    html += '<div class="flex flex-col gap-[3px]">';
    week.forEach((level, di) => {
      const delay = (wi * 7 + di) * 6;
      html += `<div class="heatmap-cell" style="background:${intensityColor(level)}; transition:background-color .4s ease ${delay}ms" title="Week ${wi + 1}, ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][di]}: ${level} events"></div>`;
    });
    html += "</div>";
  });
  html += "</div>";

  containerEl.innerHTML = `
    <div class="flex items-start gap-2">
      <div class="flex flex-col gap-[3px] pt-0 text-[9px] font-mono text-text-soft mr-1">
        ${dayLabels.map((l) => `<div style="height:11px; line-height:11px">${l}</div>`).join("")}
      </div>
      ${html}
    </div>
    <div class="flex items-center gap-1.5 mt-3 text-[10px] text-text-soft font-mono">
      <span>Less</span>
      ${[0, 1, 2, 3, 4].map((l) => `<div class="heatmap-cell" style="background:${intensityColor(l)}"></div>`).join("")}
      <span>More</span>
    </div>`;
}

/**
 * Counts a number up from 0 to `target` over `duration` ms, easing out.
 * `formatter` lets the caller keep commas / a "%" / a "$" on the final text
 * (e.g. formatter = n => "$" + Math.round(n).toLocaleString()).
 */
function animateCounter(el, target, duration = 900, formatter = (n) => Math.round(n).toLocaleString()) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = formatter(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * A tiny inline trend line with no axes or labels — the small chart you see
 * inside a KPI card. Same draw-in animation as the full line chart, scaled
 * down. Pass a second color for a "down" trend if you want it to read red.
 */
function renderSparkline(containerEl, values, color) {
  const w = 120, h = 36, pad = 3;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (w - 2 * pad) / (values.length - 1);
  const points = values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - 2 * pad)]);
  const d = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  containerEl.classList.remove("line-ready");
  containerEl.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-full block" preserveAspectRatio="none">
      <path class="line-path" d="${d}" fill="none" stroke="${color || "var(--primary)"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  requestAnimationFrame(() => requestAnimationFrame(() => containerEl.classList.add("line-ready")));
}

/**
 * Two (or more) overlapping lines sharing one scale — e.g. "actual vs
 * target." Each series gets its own color and draws in with a slight
 * stagger so the eye can tell them apart as they appear.
 */
function renderMultiLineChart(containerEl, series, labels) {
  const w = 600, h = 220, pad = 16;
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues) * 1.1;
  const min = Math.min(...allValues) * 0.85;
  const n = series[0].values.length;
  const stepX = (w - 2 * pad) / (n - 1);

  const toPoints = (values) => values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / (max - min)) * (h - 2 * pad)]);
  const toPath = (points) => points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  const axisLabels = (labels || [])
    .map((l, i) => `<text x="${(pad + i * stepX).toFixed(1)}" y="${h - 2}" font-size="9" fill="var(--text-soft)" text-anchor="middle" font-family="JetBrains Mono, monospace">${l}</text>`)
    .join("");

  const paths = series
    .map((s, idx) => {
      const points = toPoints(s.values);
      return `<path class="line-path" data-series="${idx}" d="${toPath(points)}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition-delay:${idx * 0.15}s"/>`;
    })
    .join("");

  const legend = series
    .map((s, idx) => `<button type="button" class="legend-item inline-flex items-center gap-1.5 mr-4 py-1" data-series="${idx}" aria-pressed="true"><span class="h-2 w-2 rounded-full" style="background:${s.color}"></span>${s.label}</button>`)
    .join("");

  containerEl.classList.remove("line-ready");
  containerEl.innerHTML = `
    <div class="flex flex-wrap items-center text-xs text-text-soft mb-2">${legend}</div>
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" preserveAspectRatio="none">
      ${paths}
      ${axisLabels}
    </svg>`;
  requestAnimationFrame(() => requestAnimationFrame(() => containerEl.classList.add("line-ready")));

  // Click a legend entry to hide/show that line — handy once a chart has
  // more than two or three series and you want to isolate one.
  const legendWrap = containerEl.querySelector(".flex.flex-wrap");
  legendWrap?.addEventListener("click", (e) => {
    const item = e.target.closest(".legend-item");
    if (!item) return;
    const idx = item.dataset.series;
    const path = containerEl.querySelector(`.line-path[data-series="${idx}"]`);
    const nowHidden = item.getAttribute("aria-pressed") === "true";
    item.setAttribute("aria-pressed", String(!nowHidden));
    item.classList.toggle("legend-item-off", nowHidden);
    if (path) path.style.opacity = nowHidden ? "0" : "1";
  });
}
