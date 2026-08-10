# Curated By Mami L — project reference

Detailed documentation for the site. `README.md` is the short entry point; this
file is the "how it actually works and how to change it" reference.

---

## 1. What this is

A five-page static marketing/catalog site for **Curated By Mami L**, a bag
reseller who takes orders over WhatsApp. There is no checkout: every product
links to a WhatsApp chat with the message pre-written.

Built from the Claude Design project *Canva design import request*
(`998b7d73-ee71-4afc-9681-3381eb33f043`).

**No framework, no build step, no `package.json`.** Plain HTML, one shared
stylesheet, three small scripts. Anything with a text editor can edit it.

| Page | Source design | Purpose |
| --- | --- | --- |
| `index.html` | `Home.dc.html` | Hero, three style categories, How to Order, newsletter |
| `collections.html` | `Collections.dc.html` | Three silhouettes, each linking into the catalog |
| `catalog.html` | `Catalog.dc.html` | Six bags, searchable and filterable, per-bag order links |
| `best-sellers.html` | `Best Sellers.dc.html` | Three featured bags with notes |
| `about.html` | `About.dc.html` | Story, How to Order, contact |

---

## 2. Running it

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Opening the `.html` files directly from disk mostly works, but **serve the folder
when testing Firebase** — Analytics needs a real http(s) origin and is skipped on
`file://`.

`.claude/launch.json` defines this server as `static` for Claude Code's preview.

---

## 3. File map

```
.
├── index.html            Home
├── collections.html      Featured Collections
├── catalog.html          Our Catalog  (+ filtering UI)
├── best-sellers.html     Best Sellers
├── about.html            Our Story
├── firebase.json         points the CLI at the rules file
├── firestore.rules       Firestore Security Rules (deployable)
├── assets/
│   ├── site.css          shared chrome + design tokens
│   ├── site.js           builds every wa.me link
│   ├── catalog.js        catalog search / filter / save hearts
│   ├── catalog-live.js   reads products from the shared Firestore
│   ├── firebase.js       Firebase app init
│   ├── logo.png          512×512 brand mark
│   └── README.md         asset notes
├── .claude/launch.json   dev-server config for the preview pane
├── README.md             short overview
└── PROJECT.md            this file
```

---

## 4. CSS architecture

### The one rule that governs everything

Every page loads `assets/site.css`, **then** defines its own layout in an inline
`<style>` block in `<head>`.

```html
<link rel="stylesheet" href="assets/site.css">
<style>
  /* ---- Page-only layout ---- */
</style>
```

Because the page block comes second, it wins on equal specificity. That means
page-specific CSS **never needs `!important`** — just restate the property.

Two consequences worth remembering:

- A page-local rule also outranks `site.css` media queries at equal specificity.
  Where that would break the mobile layout, the page-local rule is wrapped in
  `@media (min-width: 901px)` — see Home's taller footer.
- Overrides that must hold at *all* widths are written with two classes
  (e.g. `.product__media .image-slot`, specificity 0-2-0) so they beat the
  shared single-class breakpoint rules regardless of order.

### Design tokens

All in `:root` in `site.css`, taken from the source designs.

| Token | Value | Used for |
| --- | --- | --- |
| `--cream` | `#FDFBF7` | page background, text on dark |
| `--cream-warm` | `#FCF7F2` | hero and page-header bands |
| `--sand` | `#F3E8DC` | How to Order band, catalog band, image slots |
| `--line` | `#EFE3D4` | header border, slot borders |
| `--espresso` | `#3A2A1E` | body text, footer background, filled buttons |
| `--espresso-2` | `#58412F` | `.btn-primary` hover |
| `--bark` | `#5A4433` | newsletter input border |
| `--taupe` | `#6B5744` | inactive nav links, filter labels |
| `--stone` | `#7A6752` | body copy |
| `--mist` | `#9C8770` | footer legal line |
| `--linen` | `#C9B7A2` | footer lede and nav |
| `--gold` | `#C9A063` | active nav, numerals, gold pills |
| `--gold-lt` | `#D9B47B` | gold hover |
| `--gold-dk` | `#B8894B` | default link colour |
| `--placeholder` | `#B9A794` | input placeholders, slot captions |
| `--border-soft` | `#E3D2BE` | search field and filter pill borders |
| `--price` | `#C08B4A` | product prices |
| `--heart` | `#D8C6B2` | unsaved heart |
| `--muted` | `#8A7660` | empty-state text |
| `--serif` | Playfair Display | headings, product names, numerals |
| `--sans` | Jost | everything else |

Fonts load from Google Fonts — Playfair Display 400/500/600/700, Jost 300/400/500.

### Shared components (`site.css`)

| Class | Notes |
| --- | --- |
| `.header` / `.nav` | Sticky, blurred. `aria-current="page"` marks the active link gold. **`:hover` must stay declared after `[aria-current]`** — equal specificity, so order decides; otherwise the active link never responds to hover. |
| `.page-head` | Title band on every page except Home. The lede `<p>` is optional (About has none); the `h1` carries no bottom margin and the lede carries a 16px top margin, so the two compose either way. |
| `.how` | The "How to Order" three-step band. Shared by Home and About. |
| `.section-title` | 27px centred serif heading. |
| `.btn-primary` | Large filled espresso CTA. Home hero. |
| `.btn-outline` | Outlined; **fills** on hover. Collections. |
| `.btn-solid` | Filled; **empties** on hover. Catalog and Best Sellers order buttons. Pages set their own width/padding. |
| `.btn-gold` | Gold pill. Footer CTAs. |
| `.image-slot` / `.slot-photo` | Photo placeholder and its real-image counterpart, sharing sizing so a swap needs no CSS change. |
| `.footer` and friends | `.footer__lede`, `.signup`, `.footer__nav`, `.footer__legal`. |
| `.chat-pill` | Fixed WhatsApp button, bottom right of every page. |

Every button's `:hover` sets **both** `background` and `color`. This is
deliberate: the global `a:hover { color: var(--espresso) }` would otherwise win
half the declaration and produce a half-applied hover state.

### Page-local layout

| Page | Owns |
| --- | --- |
| `index.html` | `.hero` (88/24/104, 44px h1, 250px logo), `.styles` grid, `.style-card`; footer overrides — 68px top padding above 901px, 28px lede margin |
| `collections.html` | `.collections` grid, `.collection-card`, 440px slots |
| `catalog.html` | `.filters`, `.filter-btn`, `.products` grid, `.product` card, `.product__fav`, `.empty`, 330px square-cornered slots |
| `best-sellers.html` | `.best` grid, `.best-card`, 420px square-cornered slots |
| `about.html` | `.story` two-column grid, 460px slot |

Slot heights and corners differ by design: Home 400px rounded, Collections 440px
rounded, About 460px rounded, Best Sellers 420px **square**, Catalog 330px
**square**. The square ones come from `shape="rect"` in the source designs and
override the shared 4px radius.

### Breakpoints

The source designs were fixed-desktop; the responsive behaviour is added on top.

- **≤900px** — header un-sticks and stacks (the wrapped five-item nav would
  otherwise eat a third of a phone screen), all three-column grids collapse,
  slots shrink to 320–340px, bands lose padding. Catalog goes to **two** columns
  here, then one at ≤600px.
- **≤480px** — headings step down, newsletter input goes full width, chat pill
  tucks into the corner.
- **`prefers-reduced-motion`** — all transitions disabled.

---

## 5. JavaScript

Three files, no dependencies, no bundler.

### `assets/site.js` — WhatsApp links

Every chat link on the site is `<a class="js-wa">` with `href="#"`. This script
rewrites them all so **the phone number exists in exactly one place**.

Message resolution order:

1. the link's own `data-wa-message`
2. the page's `<body data-wa-message="…">`
3. `WHATSAPP_FALLBACK_MESSAGE` in the script

Per-page defaults:

| Page | Default message |
| --- | --- |
| Home | *…I'd like to ask about a bag from your catalog.* |
| Collections | *…I'd like help choosing a bag from your collections.* |
| Catalog | *…I'm looking for a bag that isn't in the catalog.* |
| Best Sellers | *…I'd like to ask about your best sellers.* |
| About | *…I'd like to know more about your bags.* |

Individual products override this with their own name and price.

### `assets/catalog.js` — catalog interactivity

Progressive enhancement over the static product markup:

- **Search** — binds `input`, not `change`, so the grid narrows per keystroke.
  Matches the product **name only**, trimmed and case-insensitive.
- **Category filter** — `All / Totes / Crossbody / Clutch / Shoulder`, tracked
  with `aria-pressed`.
- **Combination is AND** — an active category and an active search both apply.
- **Empty state** — "No bags match that search." appears when nothing matches.
- **Save hearts** — `aria-pressed` toggles the gold fill. **In-session only, no
  persistence**, matching the design.

It bails out silently if the expected `.js-search` / `.js-cats` / `.product`
elements aren't present, so it's safe to load on other pages.

### `assets/firebase.js` — Firebase

See §7.

---

## 6. Content recipes

### Add or edit a bag (catalog)

Products are plain markup, not generated from a data array. Copy an `<article>`
in `catalog.html` and edit four things:

```html
<article class="product" data-name="Elara Tote" data-cat="Totes">
  <div class="product__media">
    <div class="image-slot">Elara Tote</div>
    <button class="product__fav" type="button" aria-pressed="false"
            aria-label="Save Elara Tote">♥</button>
  </div>
  <div class="product__body">
    <div class="product__name">Elara Tote</div>
    <div class="product__price">Rp 2.850.000</div>
    <a class="btn-solid product__order js-wa" href="#" target="_blank" rel="noopener"
       data-wa-message="Hello Curated By Mami L, I'd like to order the Elara Tote (Rp 2.850.000). Is it still available?">Order on WhatsApp</a>
  </div>
</article>
```

- `data-name` — what search matches against
- `data-cat` — must be one of the five filter values (note: **`Clutch`**,
  singular, unlike the Collections page's "Clutches" card)
- the visible name and price
- `data-wa-message` — repeat the name and price here

Best Sellers works the same way, minus `data-cat` and the heart.

Both grids are now no-JS fallbacks — the live pages come from Firestore, so
Firestore is the source of truth for stock and this markup only has to mirror
the bags whose `status` is `Aktif`. Anything sold, archived or on hold must stay
out of it: a failed read would otherwise advertise stock that cannot be bought.

Fallback contents, both pages (last synced 2026-08-11):

| Bag | Price | Category |
| --- | --- | --- |
| Elara Tote | Rp 2.850.000 | Totes |
| Mira Clutch | Rp 1.650.000 | Clutch |

The other three seeded bags — Selene Crossbody (`Ditahan`), Aurelia Shoulder Bag
(`Terjual`), Luna Tote (`Arsip`) — are intentionally unpublished, so they appear
in neither grid. Firestore also holds two placeholder docs, "Test" (Rp 50.000)
and "Test 2" (Rp 1.000), which *are* `Aktif` and so render on the live pages;
they are left out of the fallbacks as test data, not real stock.

### Drop in a real photo

Replace the placeholder div with an image — the two classes share sizing rules,
so nothing else changes:

```html
<div class="image-slot">Totes collection photo</div>
```
```html
<img class="slot-photo" src="assets/totes.jpg" alt="Totes collection">
```

### Change the WhatsApp number

One line, `assets/site.js`:

```js
var WHATSAPP_NUMBER = "6281234567890";   // country code, digits only, no +
```

### Change a page's default message

The `data-wa-message` attribute on that page's `<body>`.

### Add a page

Copy the closest existing page, then:

1. update `<title>` and `<meta name="description">`
2. move `aria-current="page"` to the new nav link
3. add the page to the nav and footer nav in **all** pages
4. set the page's `<body data-wa-message>`
5. keep only genuinely page-specific CSS in the inline `<style>`

---

## 7. Firebase and the shared database

The site is on project **`mamiel-project`** (project number `481440432212`) —
**the same project the Mami L dashboard app uses**, so both read one Firestore.

Because there is no build step, `assets/firebase.js` loads the modular SDK from
`gstatic.com` **pinned to 12.17.1** rather than npm, and every page includes it
as `<script type="module">`. It exports `app`, `firebaseConfig` and
`analyticsReady`. Analytics is live on `G-SJP0HVJFN3`.

### The products collection

The dashboard owns the data; the website only reads it.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | e.g. "Elara Tote" |
| `price` | integer | rupiah, unformatted — `2850000` |
| `cat` | string | **Indonesian**: `Tote`, `Selempang`, `Clutch`, `Bahu` |
| `status` | string | `Aktif`, `Ditahan`, `Terjual`, `Arsip` |
| `sku` | string | e.g. `CBML-001` |
| `createdAt` / `updatedAt` / `soldAt` | timestamp | |

`assets/catalog-live.js` maps the categories to the site's filter labels —
Tote→Totes, Selempang→Crossbody, Bahu→Shoulder, Clutch→Clutch — and formats
`price` with `toLocaleString("id-ID")`.

### Security Rules

Rules live in `firestore.rules` and deploy with `firebase deploy --only firestore`.
`firebase.json` wires the two together.

Everything is owner-only (gated on an `owners/{uid}` marker document) **except**
one public read:

```
match /products/{productId} {
  allow read: if resource.data.status == 'Aktif' || isOwner();
  allow write: if isOwner();
}
```

So the storefront can list bags that are on the shelf, and nothing else — sold,
held and archived bags stay private, `orders` and `shop` stay private, and every
write still requires the owner.

**This constrains the client query, not just the rule.** A read of the
collection must filter on `status == "Aktif"` or Firestore rejects it outright.
That is why the `where()` clause in `catalog-live.js` is load-bearing rather
than cosmetic — removing it breaks the page with `permission-denied`.

### How the live catalog loads

1. `catalog.html` ships the hand-written product markup, which is what a visitor
   without JavaScript sees.
2. `catalog-live.js` queries the active products and, **if at least one comes
   back**, replaces the grid and sets `data-source="firestore"` on it. A network
   failure or an empty result leaves the static list in place rather than
   blanking the shop.
3. It then calls `window.CBML.wireWaLinks()` to give the new order links their
   `wa.me` hrefs, and `window.CBML.applyCatalogFilters()` to re-apply whatever
   filter was active.

Because the grid can be replaced, `catalog.js` never caches the product nodes
and handles the hearts by delegation.

Cards are built with `createElement`/`textContent`, never `innerHTML` — the
values come from a database and are treated as untrusted text.

### Adding another Firebase product

Import it in `firebase.js` from the same pinned version and export the instance:

```js
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
export const db = getFirestore(app);
```

### On the config values

A Firebase web config is public by design — it identifies the project, it does
not authorise anything. Protection comes from Security Rules (above) and App
Check, **which is not set up**. Worth adding before the shop gets traffic, along
with restricting the API key to your domains in the Google Cloud console.

---

## 8. How the designs were converted

The sources are `.dc.html` authoring files that run inside the Design Canvas
runtime (`support.js` + `image-slot.js`). Those runtime files are **not** shipped
here — the constructs they provide were resolved into plain web code.

| Source construct | Became |
| --- | --- |
| `<helmet>` | a real `<head>` — fonts, meta, stylesheet link |
| inline `style="…"` | classes, with the palette lifted into `:root` |
| `style-hover="…"` | real `:hover` rules |
| `{{ waGeneral }}` | `<a class="js-wa">` wired up by `site.js` |
| `<image-slot>` | `.image-slot` divs keeping the original caption text |
| `<sc-for>` / `<sc-if>` + `DCLogic` state | static markup + `catalog.js` |
| `Home.dc.html` etc. | lowercase hyphenated filenames, self-links updated |

### Why products are static markup

The designs render products from a `DCLogic` array. Rendering them client-side
here would break two things: the products wouldn't exist when `site.js` runs its
`querySelectorAll(".js-wa")`, so every order link would stay `href="#"`; and the
catalog would be empty without JavaScript.

Static markup means **all nine bags are listed and every order link works with
JavaScript disabled.** Only search, filtering and the hearts need it.

### Deliberate additions

Not in the source designs, added on top:

- responsive breakpoints and the reduced-motion guard (§4)
- `aria-current`, `aria-pressed`, `aria-label`s, `role="group"`, `role="status"`
- `<title>` and `<meta name="description">` per page
- semantic `<main>`, `<header>`, `<footer>`, `<article>`, `<nav>`

---

## 9. Known gaps

1. **The WhatsApp number is a placeholder.** `WHATSAPP_NUMBER` in
   `assets/site.js` is still the design's `6281234567890`. It drives every chat
   link on every page. **This blocks launch.**
2. **All product and collection photos are placeholders.** 11 `.image-slot` divs
   in the markup — 3 on Home, 3 on Collections, 2 on Catalog, 2 on Best Sellers,
   1 on About. Catalog and Best Sellers are the fallback lists only; the live
   grids build one slot per bag returned by Firestore, so the real number of
   photos needed tracks the active stock.
3. **The newsletter form posts to `#`.** `.signup` on Home needs a real
   mailing-list endpoint.
4. **The fallback lists need re-syncing whenever stock changes.** Both grids were
   trimmed to the `Aktif` bags on 2026-08-11, but nothing enforces this — a bag
   published or sold in the dashboard will not update the hand-written markup.
5. **Best Sellers is not really curated.** It reads Firestore, but the products
   collection has no best-seller flag, so it just shows the first three `Aktif`
   bags. Add a `bestSeller` boolean in the dashboard and the query in
   `assets/best-sellers-live.js` becomes a real selection (see the comment
   at the top of that file).
6. **No App Check.** Rules are in place (§7) but App Check is not configured.
7. **No favicon** — every page requests `/favicon.ico` and gets a 404.

### Cosmetic, noted but not changed

- The logo PNG has a near-white background baked in (~`#FFFDFA`), so on Home's
  `#FCF7F2` hero band its square edge is faintly visible. Adding
  `border-radius: 50%` to `.hero__logo` would clip exactly the mismatched
  corners, since the artwork is a circle inside a square.
- At 44px in the header the full lockup isn't legible. A mark-only variant
  (bag and monogram, no wordmark) would read better at that size.
