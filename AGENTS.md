# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Static implementation of the Codex Design project "Canva design import request"
(`998b7d73-ee71-4afc-9681-3381eb33f043`) — a 5-page marketing/catalog site for
"Curated By Mami L", a bag reseller that takes orders via WhatsApp. No framework,
no build step, no package.json.

**`PROJECT.md` is the detailed reference** for this repo — full design-token
table, per-page CSS ownership, content recipes, and the complete Firebase
section. Read it before non-trivial changes; this file only covers what's
needed to get productive quickly. `README.md` is the short human-facing
overview; `assets/README.md` covers the logo/photo asset pipeline.

## Commands

No build/lint/test tooling exists. To preview:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` (or any page). `.Codex/launch.json`
defines this same command as the `static` configuration for Codex's
preview pane. Prefer serving over opening files directly from disk — Firebase
Analytics requires a real http(s) origin and is skipped on `file://`.

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
- includes `assets/firebase.js` as `<script type="module">` for Firebase init.

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

**`assets/firebase.js`**: initializes the Firebase app (project `mamiel-project`
— the same project the Mami L dashboard app uses, so both share one Firestore)
using the modular SDK loaded from `gstatic.com` and pinned to a fixed version —
not from npm, since there's no build step. Exports `app`, `firebaseConfig`, and
`analyticsReady`; Analytics is live on `G-SJP0HVJFN3`. To add another Firebase
product (Auth, Storage), import it in this file from the same pinned SDK version
and export the instance — see the comment block at the top of the file and
PROJECT.md §7. App Check is not configured yet.

**`assets/catalog-live.js`** (catalog.html only): reads the dashboard's
`products` collection and replaces the grid. Only `status == "Aktif"` bags are
published, and **that `where()` clause is required by the Security Rules, not a
preference** — drop it and the whole query fails with `permission-denied`. Maps
the dashboard's Indonesian categories (Tote/Selempang/Bahu/Clutch) onto the
site's filter labels and formats the integer `price` as rupiah. Cards are built
with `createElement`/`textContent`, never `innerHTML`, since the values come
from the database.

**`firestore.rules`** is the source of truth for Security Rules (`firebase.json`
points at it; deploy with `firebase deploy --only firestore`). Everything is
owner-only except public read of active products.

**`assets/best-sellers-live.js`** (best-sellers.html only): the same pattern for
the `.best__grid`. The products collection has **no best-seller flag**, so it
shows the first three `Aktif` bags rather than a curated set — the file's header
comment says how to make it a real selection. Live cards carry no description
paragraph because there is no such field in the database.

**Products** are plain `<article>` markup, one per bag. On both `catalog.html`
and `best-sellers.html` this is now the **no-JS fallback** — the live script
replaces it when Firestore returns at least one active bag, so a network failure
or an empty result leaves the static list rather than blanking the shop. Keep
those lists mirroring the `Aktif` bags only: a failed read must never advertise
sold or archived stock. To add a bag by hand: copy an `<article>` and edit its `data-name`,
`data-cat` (catalog.html only), price text, and `data-wa-message` (see PROJECT.md
§6 for the full recipe and current stock list).

Because the grid can be replaced at runtime, `catalog.js` never caches the
product nodes and handles the hearts by delegation; `site.js` exposes
`window.CBML.wireWaLinks()` so re-rendered order links get their `wa.me` hrefs.

**`<image-slot>` placeholders**: the source design's `<image-slot>` custom
element was resolved to plain `<div class="image-slot">` divs carrying the
original caption text. To land a real photo, replace one with
`<img class="slot-photo" src="assets/…" alt="…">` — both classes share sizing
rules in `site.css` so no other CSS changes are needed.

## Known gaps before this goes live

Tracked in detail in PROJECT.md § "Known gaps":
1. `WHATSAPP_NUMBER` in `assets/site.js` is still the design's placeholder
   (`6281234567890`) — drives every chat link on every page.
2. Every `.image-slot` (11 in the markup, plus one per live Firestore bag on
   Catalog and Best Sellers) needs a real photo per the swap
   above.
3. The `.signup` form on `index.html` posts to `#` — no real mailing-list
   endpoint is wired up.
4. The two fallback lists were synced to the `Aktif` bags on 2026-08-11, but
   nothing keeps them in sync — publishing or selling a bag in the dashboard
   won't update the hand-written markup.
5. App Check is not configured (Security Rules are).
6. No favicon — every page requests `/favicon.ico` and gets a 404.
