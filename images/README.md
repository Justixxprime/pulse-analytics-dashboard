Every image on this site is a real placeholder that already has a spot
reserved for it — drop a file at the exact path and it appears automatically,
no code changes needed anywhere. If a file is missing, the page falls back
gracefully (an icon, initials, or a gradient swatch), so nothing ever breaks.

- **images/avatar.jpg** — your photo (square, 200x200px+), replaces the "OJ"
  initials in the top-right avatar circle on every dashboard page.
- **images/phone-preview.jpg** and **images/phone-preview-dark.jpg** — the
  hero phone mockup's light/dark screenshots. Both are already filled in
  with real crops of the homepage — swap either one out any time by
  overwriting the file (same filename, still .jpg, 9:19.5 aspect ratio
  works best, e.g. 420x910px). Dark mode uses the `-dark` file
  automatically when the theme switch is used. This one has an extra
  safety net the others don't: a copy of the current image is baked
  directly into `index.html` itself, so even if this file goes missing,
  gets renamed, or a server/cache issue keeps it from loading, the mockup
  still shows something correct — it just won't reflect a swap you made
  until the new file loads successfully.
- **images/products/<sku>.jpg** — a real product photo for the grid on the
  Products page. The filename must match that product's SKU in lowercase,
  e.g. Casio G-Shock (SKU-3001) → `images/products/sku-3001.jpg`. Falls back
  to a colored gradient + box icon if missing.
- **images/products/<id>.jpg** — the same idea for the "Best Selling
  Products" table on the Dashboard, but keyed by the product's numeric ID
  instead of its SKU, e.g. product #3009 → `images/products/3009.jpg`.
