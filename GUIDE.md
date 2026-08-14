# Pulse — the complete beginner's guide

This explains everything about the Pulse dashboard slowly, in plain
language, the same way the Boardly guide did. Read it top to bottom once,
then use it as a reference.

### Scroll-scrubbed hero + custom chart tooltips (latest)

- **The homepage hero mockup now leans back and shrinks slightly as you
  scroll down past it**, tracking your scroll position directly rather
  than just fading in once and sitting static. Kept deliberately separate
  from the existing pointer-tilt (different transform layer, no
  transition) so the two don't fight — verified with a real before/after
  transform-matrix check, not just eyeballing it.
- **Charts have real tooltips now**, not the browser's native ones. Bar
  charts and line-chart data points used to rely on the `title`
  attribute, which is slow to appear, can't be styled, and shows up
  wherever the browser feels like. Replaced with one shared, styled
  tooltip that follows your cursor immediately.

### More cinematic polish (latest)

- **Magnetic buttons.** The three main "Open the dashboard" CTAs now
  pull gently toward your cursor as it gets close, and spring back on
  leave — the same trick Linear/Framer's marketing sites use.
- **A thin progress bar sweeps across the top of the page** the instant
  you click a link to another page, before the page even finishes
  loading — instant feedback that the click registered.
- **Table rows cascade in** one after another instead of all appearing
  at once, on every page with a table (Dashboard, Reports, Orders,
  Customers) and the Products grid.
- **Buttons compress slightly when pressed** — a small "this responded
  to me" cue most web buttons skip.
- **The hero headline's accent line has a slow color drift** instead of
  a flat color — subtle on purpose, not a loud rainbow.
- **The loading skeleton's shimmer is sharper and faster** — a
  brighter, narrower band sweeping across instead of a soft pulse.

### The phone photo now sits properly inside the notch (latest)

The screenshot was cropped starting right at the top of the page — which
put the website's own navbar (logo, nav links) directly under the phone
mockup's notch, so the notch visually chopped through the logo instead of
sitting over blank space like a real phone status bar does. Rendered the
actual composite (frame + notch + photo together, not just the code) to
confirm it, then re-cropped both the light and dark screenshots starting
a bit further down the page — the notch now sits over plain background,
and the crop shows more of the actual hero content besides. Also updated
the embedded fallback copy of the image to match, so both the real file
and the safety-net version look right.

### Three real bugs found and fixed (latest)

- **KPI sparkline lines overflowing their cards on mobile.** Their SVGs
  used `height: auto` (compute height from the image's own proportions)
  together with `preserveAspectRatio="none"` (stretch to fill whatever
  box you're given) — two contradictory instructions. Since the card
  gives them a short, wide box that doesn't match the graphic's natural
  proportions, `auto` was computing a height 2.5x taller than the card
  actually had room for, and the extra spilled out the bottom. Reproduced
  it in isolation first (confirmed: 90px tall in a 36px box), then fixed
  it to fill the box it's actually given instead of computing its own.
- **Dragging a widget out of the "Add widget" panel stopped working on
  desktop.** Not because the drag logic broke — I tested that in
  isolation and it worked — but because I'd narrowed it to only start
  from the small grip-handle icon (needed for that fix to work on
  touchscreens), which made it awkward to grab with a mouse. Fixed so a
  mouse can grab the card anywhere, while touch still needs the handle
  specifically (so it doesn't fight the panel's scroll gesture).
- **The phone mockup photo, for real this time.** Found a genuine race
  condition: the code that tries to load your real screenshot and the
  code that swaps the mockup for light/dark mode were fighting each
  other — the theme code kept resetting the image back to the (missing)
  file path even after the fallback had already kicked in and fixed it,
  and by then the fallback's one-time trigger had already been spent.
  Beyond fixing that: the fallback image is now baked directly into the
  page (not a separate file), so there is no path, server, or cache for
  it to ever fail on again. Verified by deleting the real image files
  entirely and confirming the mockup still displayed correctly.

### Tailwind is back to zero-setup (latest, important)

A few rounds ago this project switched from the Tailwind CDN to a
proper compiled build (the Tailwind CLI), which is the "correct" way to
ship Tailwind in production. In practice, it introduced a real recurring
problem for this project specifically: **every time new classes get
added to the HTML/JS (which happened almost every round of changes),
the compiled `css/tailwind.css` goes stale until you manually rebuild
it** — and a stale build doesn't error or warn you, it just quietly
renders with pieces missing, which looks exactly like "everything is
randomly broken."

So: **every page has switched back to the Tailwind CDN**, the same
script tag it started with. Open any `.html` file and it looks right,
immediately, every time, with zero commands to run and zero way for it
to go stale. The `tailwind.config.js`, `css/input.css`, and
`package.json` files are still in the project if you ever want to do a
real production build later (see Section 13, now marked optional) — but
nothing about using or editing this site day-to-day depends on them
anymore. If you're not deploying this behind a real build pipeline,
you'll likely never need them.

### Bug fixes (latest)

- **Fixed a real unhandled-error bug in the theme toggle's circular
  reveal.** The animation relies on a browser promise
  (`transition.ready`) that can legitimately get skipped — e.g. if you
  click the toggle twice quickly — and reject with an `AbortError`. That
  rejection was never caught, so it surfaced as a red console error.
  Fixed, and a second click while one transition is still finishing now
  just waits instead of starting a conflicting second one.

### Mobile & responsiveness pass

- **Found and fixed a real horizontal-overflow bug.** The "Add widget"
  panel's description text was inside a flex row without `min-w-0` — a
  classic, easy-to-miss flexbox default: a flex child won't shrink below
  its content's natural width unless you explicitly tell it to. Long
  descriptions were quietly forcing the page wider than the screen.
  Fixed on all 7 widget panel items.
- **Added a permanent safety net against this entire class of bug**:
  `overflow-x: clip` on `<html>`, so no single element misbehaving —
  today or in anything added later — can ever create a page-wide
  horizontal scrollbar again. Verified it doesn't break the sticky
  header (that's a real, common side effect of the more obvious
  `overflow: hidden` fix, which this avoids).
- **The hero phone mockup now shows on mobile too.** It was set to
  `hidden` below 640px on purpose (there wasn't room for it next to the
  browser mockup on a narrow screen) — now it stacks neatly below the
  browser mockup instead of being hidden outright.
- **Dragging widgets now works properly on mobile.** Both drag
  interactions (reordering an added widget, and dragging a widget out of
  the "Add widget" panel to add it) are Pointer-Events based, so they
  already worked with a finger in principle — but dragging out of the
  panel checked "is the pointer outside the panel," which is impossible
  on a phone where the panel is full-width. Replaced that with an
  explicit "Drop here to add" zone that appears during the drag, which
  works identically regardless of screen size.

### "World class" pass (latest)

Read Section 14 at the bottom for the full walkthrough — short version:

- **Smooth page-to-page transitions.** Clicking Dashboard → Orders now
  crossfades instead of hard-flashing to white, using the browser's
  native View Transitions API — zero JavaScript, one CSS rule, and
  browsers that don't support it yet just... don't, nothing breaks.
- **The theme toggle now does a circular reveal** expanding from wherever
  you clicked, instead of an instant flip. Same API, this time driven by
  a few lines of JS since it needs the click coordinates.
- **Cards now have a cursor-spotlight** — a soft glow that follows your
  pointer inside any card, the same trick Linear/Vercel/Stripe use.
- **A custom scrollbar, a tinted text-selection color, and an almost
  subliminal film-grain texture over the whole site** — small details,
  but they're what make a site feel designed all the way down instead of
  stopping at the cards.

Pulse is an **analytics dashboard UI** — sidebar navigation, KPI cards,
animated charts, a searchable table — built to look and feel like a real
SaaS admin panel (the kind you saw in the Shopeers dashboard screenshot).
Unlike Boardly, Pulse has **no backend and no login** — every number is
realistic mock data written directly in JavaScript. That's on purpose: this
project exists to show off *interface and interaction* work — animation,
layout, responsiveness — without a database in the way. The guide below
explains exactly how to make it real if you ever want to.

### Cinematic / 3D revision + Tailwind CLI (latest)

Read Section 12 and Section 13 at the bottom for the full walkthrough —
here's the short version:

- **The hero phone mockup now has a real photo in it** —
  `images/phone-preview.jpg` and `images/phone-preview-dark.jpg` are
  filled in already (cropped from a real screenshot), not placeholders
  anymore. Swap either file out any time.
- **You can add a widget by dragging it out of the panel, not just by
  tapping Select.** Press and drag any widget card in the "Add widget"
  panel out onto the dashboard and let go to add it — built the same way
  as the widget reordering, on Pointer Events, so it isn't mouse-only.
- **Found and fixed a real (if narrow) bug while testing that:** the
  site-wide 3D tilt effect assumed the thing under your pointer is always
  a normal element. In one rare dispatch path it wasn't, and `.closest`
  isn't a function on that kind of object — it would have thrown
  silently in that edge case. Guarded against it.

- **Found the actual cause of that recurring "big blank gap" on
  Dashboard and Reports — a real bug, not spacing.** KPI cards are built
  by JavaScript *after* a simulated loading delay, so they get created
  well after the page's one-time "fade in as you scroll" observer already
  ran and took its snapshot of the page. Those cards were never handed to
  that observer, so they sat at permanent `opacity: 0` forever — full
  height, zero visibility. It looked exactly like empty space because,
  visually, it was: invisible cards taking up real room. Content built by
  JavaScript after load now reveals itself immediately instead of
  waiting on an observer that will never see it.
- **Widget dragging now works with a finger, not just a mouse.** Rebuilt
  it on Pointer Events (the same technique SortableJS uses) instead of
  the old HTML5 drag-and-drop, which — this is a real browser limitation,
  not a bug I introduced — never fires on touchscreens at all.
- **Fixed the "Visitors by Device" donut sizing bug** from the last
  round: it had no width cap, so the square SVG stretched to the full
  card width and blew out the row height. Donut widgets now render in a
  capped, centered square with a value label under the ring.

- **Fixed a real layout bug: "Visitors by Device" was blowing out the
  whole widgets row.** Its donut chart is an SVG with a square aspect
  ratio; without a width cap, `w-full h-auto` scaled it to the full card
  width, which made it absurdly tall and pushed a huge gap into the page.
  Donut widgets now render in a capped, centered square with a value
  label under the ring, matching how Repeat Customer Rate already worked.
- **Widgets you add can be dragged to reorder them** — grab any added
  widget by its title row and drop it where you want, using the
  browser's native drag-and-drop, no library.
- **3 more widget types**: Cart Abandonment, Support Tickets, Revenue
  Forecast — 7 total now.
- **Product photos are now real, droppable placeholders**, the same
  pattern as the avatar and phone screenshot: `images/products/<sku>.jpg`
  on the Products grid, `images/products/<id>.jpg` on the Dashboard's
  Best Selling Products table. See `images/README.md`.
- **The phone mockup swaps for dark mode** if you drop in
  `images/phone-preview-dark.png` — falls back to the light one (or the
  placeholder icon) if you don't.
- **"Add widget" actually adds a widget now.** Picking one from the
  slide-over panel builds a real chart (donut, bar, or line, with its own
  mock data) and drops it onto the dashboard with a 3D pop-in animation,
  scrolls to it, and gives it a working remove (✕) button. Previously it
  only showed a toast and did nothing.
- **Charts have idle "alive" motion now, not just a one-time entrance:**
  line-chart dots pulse gently, donut rings get a soft breathing glow,
  and bars brighten and glow slightly on hover.
- **Dashboard, Reports, and now Orders are as tight as they'll
  comfortably get** — the page title lives inside the same card as the
  live-data banner (one block, not two stacked ones).
- **Fixed a real bug: `initTilt` and `initBackToTop` were silently never
  running, on every page.** A stray reference to an undefined variable
  inside the notifications code threw an error that JavaScript doesn't
  recover from mid-function — so every initializer listed *after* it in
  the startup sequence never even got a chance to run. Fixed, and tilt
  now uses one delegated listener instead of per-card listeners, so it
  also works automatically on KPI cards and anything else added to the
  page after load (including drag-and-drop widgets).
- **Notifications actually clear now.** Click one to mark just that one
  read, or just open the bell — it marks everything read shortly after,
  the way Gmail/Slack do.
- **KPI cards, the homepage stats row, and the banners all tilt in 3D
  now**, not just the big chart card, and the banners include a real
  live sparkline instead of static decoration. Background orbs also
  drift slightly as you scroll (parallax).

- **A whole new page: Reports.** The sidebar's grayed-out "Finances" item
  is now a real link (`reports.html`) with a Revenue vs Expenses chart, an
  Expense Ratio gauge, a Revenue by Category chart, and a searchable,
  sortable, exportable Invoices table. Six pages now, not five.
- **3D everywhere, kept subtle on purpose.** Every page now has softly
  floating blurred "orbs" drifting behind the content, cards tilt in 3D
  toward your cursor, and card-hover lifts got a slight rotation instead
  of a flat move. See Section 12.
- **Dashboard now matches the reference screenshot more closely:** KPI
  cards got icons, a new "Customers" breakdown bar (retailers /
  distributors / wholesalers), a "Most Day Active" weekday chart, and a
  real (if canned) **AI Assistant** widget with a pulsing CSS sphere.
- **A phone mockup placeholder in the hero**, built the same way the
  avatar photo works: drop a real screenshot at
  `images/phone-preview.png` and it appears automatically, no code
  changes needed. It sits in normal page flow next to the browser
  mockup so it can never drift into the stats row below it, on any
  screen size.
- **Notifications are now individually clickable** — click any single
  notification to mark just that one as read, not only "mark all read."
- **Tailwind is no longer loaded from a CDN.** It's now a proper CLI
  build (`css/tailwind.css`, generated from `css/input.css` +
  `tailwind.config.js`). This is faster, production-safe, and the normal
  way real projects use Tailwind. **You must run one command before the
  site will look right** — see Section 13, it's genuinely three steps.

### Bug fix and personalization pass (latest)

- **Fixed: the row detail panel (eye icon) never closed.** The panel's
  open/close state was being toggled correctly in JavaScript, but the CSS
  rules that actually hide it when closed were missing entirely, so it
  just sat there covering the page until a refresh wiped the DOM. Added
  the missing `#detail-overlay` / `#detail-panel` transition rules in
  `style.css` — see Section 7b below for the full explanation.
- **Removed every em dash (—) from the visible copy** across every page —
  titles now use `Page | Pulse` instead of `Page — Pulse`, and sentences
  that used to lean on a dash were rewritten with a period or comma instead.
- **Real contact info** in the footer and social icons: email, WhatsApp,
  Facebook, Instagram, LinkedIn, GitHub, and the portfolio link, all
  pointing at the real accounts instead of placeholders.
- **The avatar circle is now a real `<img>` tag** (`images/avatar.jpg`)
  with an `onerror` fallback that shows initials if no file exists yet —
  see Section 11 for how to drop in your own photo.
- Every "Justin" / generic placeholder name replaced with **Obioma
  Chibueze Justice** (default profile name, footer credit, `<meta
  name="author">` on every page).

### What's new in this revision (the big one)

- **Sortable tables** — click any column header on Orders, Customers, or
  the Dashboard's best-sellers table to sort by it; click again to reverse.
  Products (a grid, not a table) got a "Sort by" dropdown instead.
- **Real CSV export** — the Export button on every table page now downloads
  an actual `.csv` file built client-side, no library.
- **A working date-range picker** — Dashboard's "Last 30 days" is now a
  real dropdown (7/30/90 days). Switching ranges swaps in a different mock
  dataset and re-plays the skeleton → chart-animation sequence, so it reads
  as "new data just loaded" rather than a static label.
- **Undo on delete** — deleting a row (or a bulk selection) on Orders or
  Customers shows a toast with an Undo button for a few seconds instead of
  deleting silently.
- **Bulk actions** — checkboxes on Orders and Customers, with a floating
  bar that appears once you've selected at least one row, showing a count
  and a bulk Delete.
- **A real Ctrl+K command palette** — separate from each page's in-table
  search, this is a global "jump anywhere" palette: page names, plus a
  small hand-built index of orders/customers/products so you can search
  "Kwame Mensah" or "#10480" from any page and land on the right one.
- **Row detail panels** — the eye icon on Orders/Customers/Products/best-
  sellers now opens a real slide-over with more detail, instead of doing
  nothing.
- **A GitHub-style activity heatmap** — new section on the Analytics page,
  12 weeks × 7 days, hand-built SVG/CSS, same "fade in with a stagger"
  animation approach as everything else.
- **Notification center** — a bell icon with a dropdown of mock
  notifications and an unread-count badge, on every app page.
- **A real "System" theme option** — Settings now has a proper Light/Dark/
  System segmented control; System follows your OS setting live, even if
  you change it while Pulse is open in another tab.
- **Accessibility pass** — focus is now trapped inside the mobile drawer,
  the widget panel, the notification dropdown, the detail panel, and the
  command palette (Tab cycles inside, Escape closes and returns focus to
  whatever opened it); toasts are announced via `aria-live`; dialogs carry
  `role="dialog"`/`aria-modal`.
- **A 404 page**, and **Open Graph / Twitter Card meta tags** on every page
  so links preview properly when shared.

### What changed in the previous revision

- **Fixed home navigation** — the "Pulse" logo in the sidebar (and its
  mobile-drawer copy) now links to `index.html`. Below the `lg` breakpoint,
  where the sidebar is hidden, a small "Pulse" wordmark was added directly
  in the top bar of every app page so there's always a visible way back to
  the marketing site, on any screen size.
- **New typography** — Pulse now uses its own font pairing (Sora for
  headings, Plus Jakarta Sans for body text, JetBrains Mono for numbers/
  labels) instead of reusing Boardly's Space Grotesk/Inter/IBM Plex Mono,
  so the two portfolio pieces read as distinct products.
- **More animation** — KPI numbers and the "Total Profit" / "Repeat
  Customer Rate" / "Engagement Score" figures now count up from zero
  instead of appearing as static text; each KPI card grew a small animated
  sparkline; Analytics gained a two-line "Actual vs Target" comparison
  chart. Section 3 below covers all of these in detail.
- **Two new full pages** — `orders.html` (status filters + live search) and
  `products.html` (a card-grid catalog instead of another table, so the app
  doesn't feel like "table after table"). The sidebar's "Orders" and
  "Products" items are real links now instead of "Soon" placeholders.
- **Slightly different shape language** — primary buttons switched from
  fully-rounded pills to `rounded-xl`, and the hero's background motif
  changed from blurred color blobs to a dot-grid with a centered spotlight,
  again to separate Pulse's visual identity from Boardly's.

---

## 1. What's in the folder, and why

```
pulse/
├── index.html          ← marketing/landing page for the "product" (public)
├── dashboard.html         ← the main dashboard: KPIs, charts, best sellers table
├── orders.html               ← orders table: status filter chips + live search
├── products.html                ← product catalog, card-grid layout
├── analytics.html                  ← more charts: traffic, conversion, heatmap
├── customers.html                     ← a searchable customer table page
├── settings.html                         ← profile + notification + theme settings
├── 404.html                                  ← not-found page
├── css/
│   └── style.css                                ← the whole design system: cards, sidebar, charts, dark mode
└── js/
    ├── site.js                                      ← shared: theme (incl. system), mobile drawer, scroll reveal, notifications, focus-trap, toast
    ├── charts.js                                        ← hand-built chart types + counters + sparklines + heatmap
    ├── table-utils.js                                       ← shared: sortRows, exportToCSV, openDetailPanel
    ├── command-palette.js                                       ← global Ctrl+K palette
    ├── dashboard.js                                                ← mock data + logic for dashboard.html
    ├── orders.js                                                      ← mock data + logic for orders.html
    ├── products.js                                                       ← mock data + logic for products.html
    ├── analytics.js                                                         ← mock data + logic for analytics.html
    ├── customers.js                                                            ← mock data + logic for customers.html
    └── settings.js                                                                ← logic for settings.html
```

Same philosophy as Boardly and your other sites: plain HTML files, Tailwind
loaded from a CDN `<script>` tag, zero build step. Every page is a complete,
self-contained file you can open by double-clicking.

---

## 2. Run it on your computer

Because there's no backend, this one's even simpler than Boardly — there's
no Supabase project to create first.

1. Double-click `index.html`, or better, serve the folder with a local
   server (same as before):
   ```
   cd pulse
   python3 -m http.server 8000
   ```
   then open `http://localhost:8000`.
2. Click **Open the dashboard**.
3. Watch the skeletons — gray shimmering placeholders — for about
   three-quarters of a second, then watch the KPI cards, bar chart, line
   chart, and donut all animate into place at once.
4. Type into the search bar at the top — the "Best Selling Products" table
   filters instantly, no Enter key needed.
5. Hover over a table row — two small icons (eye / pencil) fade in on the
   right of that row only.
6. Click the sun/moon switch in the top right — the whole page, sidebar
   included, repaints to dark mode instantly. Refresh the page — it stays
   dark, because the choice was saved.
7. Shrink the browser window (or open dev tools' device toolbar) — the
   sidebar disappears and a hamburger icon appears in its place; tap it to
   open the same navigation as a slide-in drawer.
8. Click **Add widget** in the top bar — a panel slides in from the right,
   the same idea as the "Add Widget" panel in the Shopeers screenshot you
   shared. Click **Select** on any card — a small toast confirms it, then
   the panel closes.

---

## 3. How the charts work — the part built entirely by hand

No Chart.js, no D3, no charting library at all. `js/charts.js` has three
functions, and every chart on every page is one call to one of them. Here's
each one, explained slowly.

### The bar chart — `renderBarChart(container, data)`

Think of a bar chart as: for each item, draw a rectangle whose height is
proportional to its value. In code:

1. Find the largest value in the dataset (`Math.max(...)`), and pad it by
   15% so the tallest bar never quite touches the top of the chart.
2. For every data point, work out what percentage of that max value it
   represents — that percentage becomes the bar's CSS `height`.
3. Build one `<div>` per bar and drop them into the container as plain
   HTML.

That alone would just show the bars at full height immediately — not
"animating in." The trick is in `style.css`:

```css
.bar-fill{ transform: scaleY(0); transform-origin: bottom; transition: transform .8s ease; }
.bars-ready .bar-fill{ transform: scaleY(1); }
```

Every bar *starts* squashed flat (`scaleY(0)`, anchored to the bottom edge
via `transform-origin: bottom`). The JavaScript waits one animation frame
(`requestAnimationFrame`) — just long enough for the browser to actually
paint that squashed starting state — and *then* adds a `bars-ready` class
to the container. The instant that class appears, the CSS `transition`
kicks in and every bar grows from flat to full height over 0.8 seconds.
That single class toggle, timed one frame after the HTML is inserted, is
the entire "growing bars" animation.

### The line chart — `renderLineChart(container, values, labels)`

A line chart is a single SVG `<path>` connecting a series of points. The
math:
1. Decide on a fixed-size drawing area (`600 × 200` units — SVG doesn't
   care about real pixels, it scales to fit its container).
2. For each value, calculate an `(x, y)` position: `x` spaces points evenly
   left to right, `y` maps the value between the dataset's min and max onto
   the chart's vertical space (higher value = smaller `y`, because SVG's
   `y` axis points downward).
3. Turn that list of points into an SVG path string like
   `M10,80 L110,60 L210,90 ...` — `M` means "move to," `L` means "draw a
   line to."

The "drawing itself in" animation is a classic SVG trick called
**stroke-dasharray / stroke-dashoffset**:
```css
.line-path{ stroke-dasharray: 1000; stroke-dashoffset: 1000; transition: stroke-dashoffset 1.1s ease; }
.line-ready .line-path{ stroke-dashoffset: 0; }
```
`stroke-dasharray: 1000` tells the browser to draw the line as a dash
pattern with a 1000-unit-long dash (since our path is shorter than that,
it's effectively one unbroken dash covering the whole line, followed by a
huge gap). `stroke-dashoffset: 1000` then *shifts* that dash backward by
1000 units — which, because the dash is exactly as long as the offset,
makes the entire visible line disappear. Animating `stroke-dashoffset` from
1000 down to 0 slides the dash back into view, which looks exactly like the
line being drawn from start to end. The colored area underneath just fades
in a little after, and the small circles at each data point fade in last,
so the eye reads it as: line draws → area fills → points pop.

### The donut gauge — `renderDonut(container, percent, color)`

A donut/ring gauge is one full circle drawn in a muted color (the "empty"
track) with a second circle drawn on top of it in a bright color, using the
exact same dash trick as the line chart, but on a `<circle>` instead of a
`<path>`:
```
circumference = 2 × π × radius
```
If the gauge should show 68%, we want 68% of the circle's outline to be
"drawn" and the rest invisible — so we set `stroke-dasharray` to the full
circumference, and animate `stroke-dashoffset` from the full circumference
down to `circumference × (1 - 0.68)`. The circle is rotated -90° with CSS
so the drawing starts from the top instead of the default 3 o'clock
position, which is what makes it read as a normal "progress ring."

### The three new helpers — counting numbers, sparklines, comparison lines

**`animateCounter(el, target, duration, formatter)`** — counts a number up
from 0 to its final value using `requestAnimationFrame`, easing out so it
slows down near the end instead of stopping abruptly. The `formatter`
argument is what lets a KPI show `"16,431"` with a comma, or Total Profit
show `"$446.7K"`, while the counting math underneath just works with plain
numbers.

**`renderSparkline(container, values, color)`** — the tiny trend line
inside each KPI card. It's the exact same math as the full line chart
(`renderLineChart`), just scaled down to a `120×36` drawing area with no
axis labels or dots, so it reads as a texture rather than a chart you're
meant to read precise values from.

**`renderMultiLineChart(container, series, labels)`** — draws two or more
lines on one shared scale (used for "Actual vs Target" on the Analytics
page). Each series in the `series` array gets its own color and a slightly
later `transition-delay`, so when the chart appears, the first line draws
in, then a beat later the second one follows — which makes it easy to
visually tell the two apart as they animate rather than having both blur
together.

---

## 4. Skeleton loading, the same pattern on every page

Every page follows this exact recipe:
1. The HTML has **two sibling containers**: `#skeleton-layer` (visible by
   default, full of plain gray `.skeleton` boxes sized to match the real
   content) and `#real-content` (hidden by default, `class="hidden"`).
2. On `DOMContentLoaded`, a `setTimeout(..., 750)` stands in for "waiting on
   a server." In a real app with a real API, you'd replace this timeout
   with an actual `fetch()` call and do the same swap inside its
   `.then()`.
3. When the timer fires: fill in the real KPI numbers, render the charts,
   render the table rows — *then* hide `#skeleton-layer` and un-hide
   `#real-content` in the same breath. Because the charts only get rendered
   at that exact moment, their "grow in" / "draw in" animations play right
   as the user sees them for the first time, which is what makes the whole
   page feel like it just finished loading rather than like a static mockup.

The shimmering gray effect itself is one CSS animation
(`background-position` sliding across a gradient — see `.skeleton` in
`style.css`), applied to any element regardless of its size, so a skeleton
"card," "chart area," or "table row" is really just a plain box with that
one class on it, sized to roughly match what's coming.

---

## 5. The instant search — no submit button, ever

Both `dashboard.js` (filtering products) and `customers.js` (filtering
customers) use the identical approach — the same one your command palette
uses:

```js
searchInput.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = data.filter(item => item.searchableText.includes(q));
  renderTable(filtered);
});
```

The `input` event (not `keyup`, not a form `submit`) fires on every single
keystroke, paste, or even voice-dictation update. Each time it fires, we
filter the full in-memory array down to whatever matches, and completely
re-render the table from that filtered list. Because the datasets here are
small (a handful of rows), refiltering the whole array on every keystroke
is instant — for a dataset of thousands of rows you'd add a small delay
("debounce") before filtering, but for a table this size it isn't needed.

---

## 6. The hover-reveal table actions

Look at the CSS:
```css
.row-actions{ opacity:0; transition: opacity .15s ease; }
tr:hover .row-actions{ opacity:1; }
```
The view/edit buttons are in the DOM the whole time — they're just
invisible (`opacity:0`) until the specific `<tr>` they live inside is
hovered. `tr:hover .row-actions` is a plain CSS descendant-combinator rule:
"when the mouse is over *this* row, make *its* `.row-actions` children
visible." No JavaScript is involved in the hover effect at all — it's free,
instant, and automatically scoped to exactly the row the mouse is on.

---

## 7. The sidebar, and how the mobile drawer reuses it

The desktop sidebar (`<aside class="hidden lg:flex ...">`) is hidden below
the `lg` breakpoint and shown above it. Below that breakpoint, a hamburger
button appears in the top bar instead. Clicking it doesn't build a
*different* menu — it reveals `#mobile-menu`, an overlay that contains a
second copy of the exact same sidebar markup, styled to slide in from the
left. This is the same open/close JavaScript pattern (`data-open`
attribute + CSS `transform: translateX(...)` transition) used for
Boardly's mobile menu — see `initMobileMenu()` in `site.js`.

Each sidebar link that represents a page you can actually visit
(Dashboard, Analytics, Customers, Settings) has an `active` state applied
by hand on that page's copy of the sidebar (a highlighted background +
colored text). The other items (Orders, Products, Content, etc.) are
included because a real admin dashboard has that many sections — but
they're visually marked with a small "Soon" tag and don't link anywhere,
which is an honest way to show breadth without shipping ten empty pages.

---

## 8. Dark mode — identical mechanism to Boardly, different palette

Exactly the same trick as Boardly: `style.css` defines two full sets of CSS
variables (`:root` for light, `html.dark` for dark), and every page's
`tailwind.config` points color names like `bg-surface` or `text-text-soft`
at those variables instead of fixed hex values. Toggling the `dark` class
on `<html>` — done by any element with a `data-theme-toggle` attribute,
wired up in `site.js` — instantly repaints every element using those
classes, on every page, with the choice remembered in `localStorage` so it
survives a refresh or a visit to a different page.

---

## 7b. A real bug, and the lesson in it

The row detail panel (the eye icon on any table) used to open fine but
never close — clicking the X, clicking the backdrop, pressing Escape, all
did *something* in JavaScript, but the panel just stayed on screen until a
full page reload. Here's what was actually wrong, because it's a useful
pattern to recognize elsewhere:

The panel's JavaScript (`openDetailPanel`/`closeDetailPanel` in
`table-utils.js`) was correctly flipping a `data-open="true"` /
`data-open="false"` attribute on the panel's container element every time.
That part worked. But **nothing in `style.css` was reading that attribute.**
Every other overlay in the project (the mobile drawer, the widget panel,
the notification dropdown, the command palette) has a matching CSS rule
like:
```css
#widget-overlay[data-open="false"]{ opacity:0; visibility:hidden; pointer-events:none; }
#widget-overlay[data-open="true"]{ opacity:1; visibility:visible; }
```
The detail panel simply never got its version of those two rules written.
So the JavaScript was toggling an attribute that nothing was listening to
— the element stayed at its default (fully visible, fully interactive,
blocking the whole screen) no matter what the attribute said. The fix was
adding the missing `#detail-overlay` / `#detail-panel` rules, mirroring the
pattern already used everywhere else.

**The lesson:** when you build an "open/close" component by toggling a
data attribute, the JavaScript and the CSS are two separate promises that
both have to be kept — the JS promises to flip the attribute at the right
time, and the CSS promises to visually react to it. It's easy to finish
one and forget the other, and nothing will error or warn you, because
technically nothing is "broken" — the attribute really is changing, it's
just that no rule cares.

## 9. Personalize before you publish

Most of this is already done for you as of this revision:

- [x] **Footer contact details** — real email, WhatsApp, Facebook,
      Instagram, LinkedIn, GitHub, and portfolio links are filled in.
- [x] **Avatar initials** — replaced with a real `<img src="images/avatar.jpg">`
      tag with a graceful fallback (see below).
- [x] **Your name** — set as the default profile name, the footer credit,
      and the `<meta name="author">` tag on every page.

What's still worth doing:

- [ ] **Add your own photo** — drop a square image (200×200px or larger
      works well) into an `images/` folder next to the HTML files, named
      exactly `avatar.jpg`. Every app page already has an `<img
      src="images/avatar.jpg">` tag wired up in the top-right corner; the
      moment that file exists, your photo replaces the "OJ" initials
      automatically, no code changes needed. Until then, the `onerror`
      handler on that tag quietly hides the broken image and the initials
      show through instead — so nothing looks broken either way.
- [ ] **Mock data** — everything in `KPI_DATA`, `PRODUCTS`, `CUSTOMERS`, etc.
      at the top of each JS file is fictional and safe to rewrite with your
      own example numbers.

## 10. Making it real (optional next step)

If you ever want Pulse to show real numbers instead of mock data, the
skeleton-then-render pattern already supports it with almost no changes:
replace the `setTimeout(() => { ... }, 750)` block in each page's JS file
with a real request, for example:
```js
fetch("/api/dashboard-stats")
  .then(res => res.json())
  .then(data => {
    // use data instead of the hard-coded KPI_DATA / PRODUCTS arrays here
    document.getElementById("skeleton-layer").classList.add("hidden");
    document.getElementById("real-content").classList.remove("hidden");
  });
```
Everything downstream — the chart-growing animation, the skeleton swap, the
search filtering — keeps working exactly the same way, because none of it
actually depends on where the data came from.

---

## 11. Deploy it (same as your other sites)

```
cd pulse
git init
git add .
git commit -m "Initial commit: Pulse analytics dashboard"
git branch -M main
git remote add origin https://github.com/Justixxprime/pulse.git
git push -u origin main
```
Then in the repo on GitHub: **Settings → Pages → Source: Deploy from a
branch → main → / (root) → Save.** Add the resulting URL to your portfolio
next to Boardly, First Experts Logistics, and Amani Community Trust.

## 12. The 3D / cinematic system, explained slowly

Nothing here is a real 3D engine (no Three.js, no WebGL) — it's plain CSS
doing three cheap tricks that read as "depth." Baby steps:

**Trick 1: blurred floating orbs (ambient depth).**
In `style.css` there's a class called `.ambient-orb`. It's just a circle
(`border-radius:50%`) filled with a color, then blurred so hard
(`filter:blur(70px)`) that it turns into a soft glow instead of a hard
shape. A `@keyframes` animation nudges it a few pixels every few seconds
so it drifts, like a lava lamp. Every page drops two or three of these
behind the real content (`position:absolute`, `z-index:-1`, so they always
sit *behind* your cards, never on top of them). That's the whole trick —
one blurry circle, gently moving, given a low opacity so it never fights
with the text on top of it.

**Trick 2: pointer-tilt (the "3D tilt" on cards).**
Open `js/site.js` and search for `initTilt`. Any element wrapped like this:
```html
<div class="tilt-wrap" data-tilt-max="5">
  <div class="tilt-el">...the actual card...</div>
</div>
```
gets watched for mouse movement. The math: take the mouse's X position
inside the box, turn it into "how far from the center, as a percentage"
(so dead-center = 0, far-left = -0.5, far-right = +0.5), multiply by how
many degrees you want it to tilt (`data-tilt-max`), and write that number
into a CSS variable (`--rx` / `--ry`) directly on the element's `style`.
The CSS rule `transform: rotateX(var(--rx)) rotateY(var(--ry))` then just
*reads* whatever number is currently there. When your mouse leaves, the
numbers reset to `0deg` and a CSS `transition` eases it back to flat. You
never have to touch this file to use the effect elsewhere — just wrap
anything in `.tilt-wrap > .tilt-el`.

**Trick 3: everything eases in as you scroll (`data-reveal`).**
This one already existed before this revision — any element with
`data-reveal` starts invisible and slides up slightly, then an
`IntersectionObserver` (a browser API that watches when something enters
the screen) adds a class that fades/slides it into place. Combined with
tricks 1 and 2, a page feels like it has "depth" and "motion" even though
it's 100% CSS and about 40 lines of JavaScript total.

**Where the phone/photo placeholder fits in.**
The `.phone-frame` / `.phone-screen` classes in `style.css` draw a plain
CSS phone shell (rounded rectangle, a notch, a screen area). Inside that
screen sits a normal `<img>` pointed at `images/phone-preview.png` with
`onerror="this.style.display='none'"` — if that file doesn't exist yet,
the browser hides the broken image automatically and you just see the
placeholder icon and caption sitting behind it instead. Drop a real 9:19.5
screenshot at that exact path and it replaces the placeholder with zero
code changes, exactly like `images/avatar.jpg` already works for the
profile photo. One honest limit: a `.png` is just pixels, it can't
"repaint itself" for dark mode the way CSS can — only the phone's frame
(the bezel around your photo) is theme-aware, not a photo you drop inside
it. If you want a dark-mode and light-mode screenshot, save two files
(e.g. `phone-preview.png` and `phone-preview-dark.png`) and swap the `src`
based on `document.documentElement.classList.contains('dark')` — ask if
you want that wired up.

## 13. Optional: switching Tailwind to a compiled build later

**This section is no longer something you need to do.** Every page uses
the Tailwind CDN again — see the note at the very top of this guide for
why. Everything below is here in case you ever deploy this behind a real
build pipeline and specifically want to remove the CDN dependency for a
production launch; until then, skip this section entirely.

Every page loads `https://cdn.tailwindcss.com` directly in the browser.
That's the *easiest* way to use Tailwind — it just works the moment you
open the page, nothing to install or run — but it does compile its
utility classes fresh in every visitor's browser on every page load,
which Tailwind's own docs note isn't ideal for a high-traffic production
site. The project already has everything needed to switch to the
**Tailwind CLI** instead, which does that compiling once, ahead of time,
into one small `css/tailwind.css` file containing only the classes your
pages actually use — you'd just need to redo the steps below and swap
each page's CDN `<script>` tag for a `<link>` to that file, then
remember to rebuild it every time you add a new class anywhere (that
"remember to rebuild" step is exactly what caused problems earlier, so
only take this on if you're comfortable owning that step).

**What's already in place, ready to use whenever you want it:**
- `package.json` — a small file that lists this project's tools. Right
  now it lists one: `tailwindcss`.
- `tailwind.config.js` — the exact same color/font settings that live in
  the `<script>tailwind.config = {...}</script>` tag on every page right
  now, already extracted into one shared file.
- `css/input.css` — three lines (`@tailwind base/components/utilities`)
  that the CLI expands into the real stylesheet.
- What you'd still need to change yourself: each `.html` file's
  `<head>` currently has the CDN `<script>` tag plus an inline
  `tailwind.config = {...}` script — you'd delete both and add one line
  instead: `<link rel="stylesheet" href="css/tailwind.css" />`.

**If you do want to go ahead with it, the three commands (baby steps):**

1. Install [Node.js](https://nodejs.org) if you don't have it already
   (the installer includes `npm`, which is what runs the next steps).
2. Open a terminal *inside the `pulse` folder* (the one with
   `package.json` in it) and run:
   ```
   npm install
   ```
   This downloads Tailwind onto your computer, into a new `node_modules`
   folder. You'll only ever need to do this once per computer (or again
   if you delete that folder).
3. Then run:
   ```
   npm run build:css
   ```
   This is the step that actually creates `css/tailwind.css`. Until
   you've also done the `<head>` edit above, this step alone doesn't
   change anything visible — the pages are still reading from the CDN
   script, not this file.

Once you've made the `<head>` edit on every page, the site will look
completely unstyled until `css/tailwind.css` exists and is current —
that's expected, not a bug, the same way a `.scss` file does nothing
until it's compiled to `.css`. If you're mid-way through editing and
want the CSS to rebuild itself automatically every time you save a file,
run `npm run watch:css` instead and leave that terminal window open
while you work — and remember to rebuild (or run the watcher) every time
you add a new class name anywhere, or it'll quietly go stale exactly the
way it did before this reverted back to the CDN.

**One thing to double check if you do this:** `tailwind.config.js` has
a `content` list telling Tailwind which files to scan for class names —
right now it's `["./*.html", "./js/**/*.js"]`, which covers everything in
this project. If you ever add a new folder of pages, add it to that list
too, or Tailwind won't know to keep those classes and they'll silently
disappear from the compiled CSS.

## 14. The "world class" pass, explained slowly

Four small features, each one a well-known trick from real product
sites, explained the same baby-steps way as Section 12.

**Page transitions (`@view-transition { navigation: auto; }`).**
This is the whole feature — one line in `style.css`. It tells the
browser "when the user clicks a link to another page on this site,
don't just replace the page instantly — take a snapshot of the old
page and the new page, and crossfade between them." No JavaScript
involved at all; the browser does the screenshotting and animating
itself. It's a newer browser feature, so if someone's using an older
browser, that one line does nothing and pages just load normally like
they always did — there's no "broken" state, only "fancy" or "plain."

**The theme toggle's circular reveal.**
This one *does* need JavaScript, because it needs to know exactly
where you clicked (the View Transition API doesn't know that on its
own). `site.js` reads the click's X/Y position, calculates how far
that point is from the *farthest* corner of the screen (that distance
becomes the final circle's radius, so it's guaranteed to cover the
whole screen), then starts a transition and separately animates a
`clip-path: circle(...)` growing from 0 to that radius. `clip-path` is
just "only show the part of this element inside this shape" — animating
the circle's radius from 0 up is what makes it look like the new theme
is expanding outward from your cursor. If your browser doesn't support
`document.startViewTransition`, the code checks for that
(`if (document.startViewTransition && ...)`) and just calls the plain
old instant theme switch instead — same safety pattern as everywhere
else in this project.

**Cursor-spotlight on cards.**
Two pieces working together. `site.js` has one `pointermove` listener
on the whole page (`initSpotlight`) that, whenever your mouse is over
a `.card`, calculates how far across and down that specific card your
mouse is, as a percentage, and writes those two numbers into CSS
variables (`--mx`, `--my`) directly on that card. Meanwhile, `style.css`
gives every card an invisible `::before` layer — a css radial-gradient
"spotlight" shape positioned at `var(--mx) var(--my)` — that fades in
on hover. The JavaScript never draws anything; it only ever updates two
numbers, and the CSS reads them 60 times a second as your mouse moves.
That split (JS moves data, CSS does the rendering) is why it stays
buttery smooth even on a low-powered laptop.

One thing worth knowing if you build more of these yourself: getting a
glow to sit *behind* your card's text but *in front of* the card's
background is a classic CSS trap (an element with `z-index: 0` actually
paints **above** plain, non-positioned content, not below it — surprising
the first time you hit it). The fix here is `isolation: isolate` on
`.card`, which boxes up all of that layering math so it only ever
happens *inside* that one card and can never accidentally interact with
z-indexed things elsewhere on the page, like the sidebar or a dropdown.

**Scrollbar, selection color, and grain.**
All three are plain CSS, no JavaScript except one line that injects the
grain layer once (`site.js` creates a `<div class="grain-overlay">` and
appends it to `<body>`, so all 9 pages get it without editing 9 files).
The grain itself is a tiny inline SVG "noise" filter, repeated as a
background image at 3.5% opacity with `mix-blend-mode: overlay` — just
enough to break up perfectly flat colors without being visible as
"a texture" if you're not looking for it.
