# Curated By Mami L — website

## About this project

This is a website for my mom's small personal business. She resells handbags and
takes every order herself over WhatsApp, so the site isn't a store — there's no
cart, no checkout, no payment processing. Its whole job is to show what's in
stock and make it effortless for a customer to start a chat about a specific bag,
with the name and price already written into the message.

That shapes most of the decisions here. It's deliberately small and plain: no
framework, no build step, no dependencies to keep updated. Anyone can open a file
in a text editor, copy a block, change a name and a price, and the site is
updated. It also means the pages work with JavaScript disabled — every bag still
lists and every order button still opens WhatsApp.

Static implementation of the Claude Design project `Canva design import request`
(`998b7d73-ee71-4afc-9681-3381eb33f043`).

**[PROJECT.md](PROJECT.md) is the detailed reference** — architecture, design
tokens, how to add a bag, Firebase, and the full list of known gaps.

No build step. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Files

| File | Source design |
| --- | --- |
| `index.html` | `Home.dc.html` |
| `collections.html` | `Collections.dc.html` |
| `catalog.html` | `Catalog.dc.html` |
| `best-sellers.html` | `Best Sellers.dc.html` |
| `about.html` | `About.dc.html` |
| `assets/site.css` | shared chrome — tokens, header, page header, footer, buttons, image slots, How to Order, chat pill |
| `assets/i18n.js` | the `COPY` tables and the Indonesia/English switch (Indonesian is the default and lives in the markup) |
| `assets/site.js` | builds every `wa.me` link from one number, and normalises it |
| `assets/catalog.js` | catalog search, category filter, save hearts |
| `assets/firebase.js` | Firebase app + Analytics init (modular SDK from the CDN) |
| `assets/catalog-live.js` | reads active products from the shared Firestore |
| `assets/best-sellers-live.js` | the same, for the Best Sellers grid |
| `assets/shop-live.js` | reads the WhatsApp number the dashboard stores in `shop/config` |
| `firestore.rules` | Security Rules, deployed with `firebase deploy --only firestore:rules` |

Each page keeps its own layout in an inline `<style>` block, which loads after
`site.css` and so wins on equal specificity.

## What was converted

The sources are `.dc.html` authoring files that run inside the Design Canvas runtime
(`support.js` + `image-slot.js`). Those runtime files are not shipped here — the
constructs they provide were resolved into plain web code instead:

| Source construct | Implementation |
| --- | --- |
| `<helmet>` block | real `<head>` (fonts, meta, stylesheet link) |
| inline `style="…"` | classes; design tokens in `:root` |
| `style-hover="…"` | real `:hover` rules |
| `{{ waGeneral }}` | `<a class="js-wa">` wired up by `site.js`; per-page message from `<body data-wa-message="…">` |
| `<image-slot>` | `.image-slot` placeholder divs, keeping the original caption text |
| `Home.dc.html` etc. | lowercase hyphenated filenames, self-links updated |
| `<sc-for>` / `<sc-if>` + `DCLogic` state | static product markup + `catalog.js` (see below) |

Added on top of the designs, which were fixed-desktop: responsive breakpoints at
900px and 480px, and a `prefers-reduced-motion` guard.

## Products

The designs render products from `DCLogic` arrays. Here they are plain markup —
one `<article>` per bag carrying a `data-wa-message` that `site.js` turns into
that bag's order link, so without JS every bag is still listed and every Order
button still works. To add a bag, copy an `<article>` and edit its attributes.

On `catalog.html` each product also carries `data-name` and `data-cat`, and
`catalog.js` adds search, category filtering, and the save hearts on top. Saved
hearts are in-session only, matching the design.

## Firebase

The site runs on **`mamiel-project`** — the same Firebase project as the Mami L
dashboard app, so the two share one Firestore. The catalog reads the dashboard's
`products` collection live; bags marked `Aktif` are published, everything else
stays private. Analytics is active.

Because the site has no build step, `assets/firebase.js` loads the modular SDK
from `gstatic.com` (pinned to 12.17.1) instead of npm, and every page includes it
as `<script type="module">`.

See [PROJECT.md §7](PROJECT.md) for the product schema, the Security Rules and
how the live catalog falls back to static markup.

To add Firestore, Auth, or Storage, import from the same pinned version inside
`assets/firebase.js` and export the instance; pages can then
`import { db } from "./assets/firebase.js"`.

The config values in that file are not secrets — a Firebase web config identifies
the project and does not grant access. Real protection comes from Security Rules
and App Check, neither of which is set up yet. Worth doing before storing any
customer data: restrict the API key to your domains in the Google Cloud console,
and write Security Rules for whatever products you enable.

## Deploying

The site is hosted on Firebase Hosting, in the same `mamiel-project` it reads
Firestore from, so one command ships the site and the Security Rules together.
`.firebaserc` pins the project, so no `--project` flag is needed.

Check what would be uploaded, share a temporary copy, then publish:

```bash
firebase deploy --only hosting --dry-run
firebase hosting:channel:deploy preview --expires 7d
firebase deploy
```

`public` is the repo root — there is no build step, the folder *is* the site.
Documentation and `firestore.rules` are excluded by the `ignore` list in
`firebase.json`.

**[DEPLOY.md](DEPLOY.md) is the step-by-step runbook** — first-time CLI setup,
the preview-channel workflow, rollback, and troubleshooting. See
[PROJECT.md §10](PROJECT.md) for why there is deliberately no `cleanUrls` or SPA
rewrite.

## Before this goes live

1. **Collection photos.** Replace each `<div class="image-slot">` with
   `<img class="slot-photo" src="assets/…" alt="…">`.
2. **Newsletter form.** The `.signup` form on Home posts to `#`; wire it to a real
   mailing-list endpoint.

All five pages from the design project are implemented.
