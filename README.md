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
| `assets/site.js` | builds every `wa.me` link from one `WHATSAPP_NUMBER` |
| `assets/catalog.js` | catalog search, category filter, save hearts |
| `assets/firebase.js` | Firebase app + Analytics init (modular SDK from the CDN) |

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

Project `curated-mamil` (project number 933806785731). Because the site has no
build step, `assets/firebase.js` loads the modular SDK from `gstatic.com` (pinned
to 12.17.1) instead of npm, and every page includes it as `<script type="module">`.

**Analytics is not active.** Google Analytics has not been linked to this project,
so no `measurementId` exists and `analyticsReady` resolves to `null`. To turn it
on: enable Google Analytics for the project in the Firebase console, then add the
`G-XXXXXXX` it issues to `firebaseConfig` — the code picks it up from there. The
`isSupported()` guard additionally keeps it quiet when the files are opened
straight from disk rather than served.

To add Firestore, Auth, or Storage, import from the same pinned version inside
`assets/firebase.js` and export the instance; pages can then
`import { db } from "./assets/firebase.js"`.

The config values in that file are not secrets — a Firebase web config identifies
the project and does not grant access. Real protection comes from Security Rules
and App Check, neither of which is set up yet. Worth doing before storing any
customer data: restrict the API key to your domains in the Google Cloud console,
and write Security Rules for whatever products you enable.

## Before this goes live

1. **WhatsApp number.** `WHATSAPP_NUMBER` in `assets/site.js` is still the design's
   placeholder `6281234567890`. It drives every chat link on every page.
2. **Collection photos.** Replace each `<div class="image-slot">` with
   `<img class="slot-photo" src="assets/…" alt="…">`.
3. **Newsletter form.** The `.signup` form on Home posts to `#`; wire it to a real
   mailing-list endpoint.

All five pages from the design project are implemented.
