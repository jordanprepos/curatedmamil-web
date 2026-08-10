# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static implementation of the Claude Design project "Canva design import request"
(`998b7d73-ee71-4afc-9681-3381eb33f043`) — a 5-page marketing/catalog site for
"Curated By Mami L", a bag reseller that takes orders via WhatsApp. No framework,
no build step, no package.json.

## Commands

No build/lint/test tooling exists. To preview:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` (or any page).

## Architecture

**Pages** (`index.html`, `collections.html`, `catalog.html`, `best-sellers.html`,
`about.html`) each correspond 1:1 to a `.dc.html` source file from the design
project (see README.md table). Every page:
- loads `assets/site.css` then defines its own page-only layout in an inline
  `<style>` block in `<head>` — the inline block loads after `site.css` and wins
  ties on specificity, so page-specific CSS never needs `!important`.
- repeats the same header/nav/footer markup (no templating exists) — the nav's
  `aria-current="page"` attribute is the only per-page diff in that markup.
- sets `<body data-wa-message="…">` — the default prefilled WhatsApp message for
  every `.js-wa` link on that page unless a link overrides it with its own
  `data-wa-message`.

**`assets/site.css`**: shared chrome — design tokens (`:root`, from the Curated
By Mami L design) plus header, nav, page-header band, "How to Order" section,
buttons (`.btn-primary` / `.btn-outline` / `.btn-solid` / `.btn-gold` — each
styled for a specific context, not interchangeable), `.image-slot` placeholders,
footer, and the floating `.chat-pill`. Responsive breakpoints (900px, 480px) and
a `prefers-reduced-motion` guard were added on top of the source designs, which
were fixed-desktop.

**`assets/site.js`**: builds every `.js-wa` link's `href` from a single
`WHATSAPP_NUMBER` constant at the top of the file, so the number lives in one
place. Message resolution order: link's own `data-wa-message` → `<body
data-wa-message>` → hardcoded fallback string in the file.

**`assets/catalog.js`**: progressive enhancement for `catalog.html` only —
category filter, name search (`input` event, not `change`, so the grid narrows
live), and save-heart toggles (`aria-pressed`, in-session only, no persistence).
Bails out silently if the page doesn't have the expected `.js-search`/`.js-cats`/
`.product` elements, so it's safe to include site-wide if needed later.

**Products** are plain `<article class="product">` markup, one per bag, not
generated from data — this was a deliberate resolution of the source design's
`<sc-for>`/`DCLogic` array so every bag still lists and every Order button still
works with JS disabled. To add a bag: copy an `<article>` and edit its
`data-name`, `data-cat` (catalog.html only), price text, and `data-wa-message`.

**`<image-slot>` placeholders**: the source design's `<image-slot>` custom
element was resolved to plain `<div class="image-slot">` divs carrying the
original caption text. To land a real photo, replace one with
`<img class="slot-photo" src="assets/…" alt="…">` — both classes share sizing
rules in `site.css` so no other CSS changes are needed.

## Known gaps before this goes live

Tracked in detail in README.md § "Before this goes live":
1. `WHATSAPP_NUMBER` in `assets/site.js` is still the design's placeholder.
2. `assets/logo.png` is missing (referenced by every page); see
   `assets/README.md` for why it couldn't be pulled from the design project
   automatically and where to download it from.
3. Every `.image-slot` needs a real photo per the swap above.
4. The `.signup` form on `index.html` posts to `#` — no real mailing-list
   endpoint is wired up.
