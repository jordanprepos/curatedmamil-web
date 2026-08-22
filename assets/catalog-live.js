/* ============================================================
   Curated By Mami L — live catalog

   Reads the same Firestore the Mami L dashboard writes to, so the
   website and the app share one product list. Only bags with
   status "Aktif" are published; the Security Rules enforce that,
   which is why the query below MUST keep its status filter — drop
   it and Firestore rejects the whole read.

   Every string these cards carry is stamped on as an i18n key
   rather than written out, so a card built here follows the
   header's language switch exactly like the hand-written markup
   does. window.CBML.t() gives the first render its text; the
   applyI18n() pass below re-fills it on every later switch.

   The hand-written product markup in catalog.html stays as the
   no-JS fallback. It is only replaced once at least one live bag
   comes back, so a network failure or an empty result leaves the
   page as it was rather than blanking the shop.
   ============================================================ */

import { app } from "./firebase.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

/* The dashboard stores categories in Indonesian; the site's filter buttons
   match on the English key in their data-cat (their visible label is
   translated, the key is not). Anything unmapped falls back to its raw value. */
const CATEGORY_LABELS = {
  Tote: "Totes",
  Selempang: "Crossbody",
  Clutch: "Clutch",
  Bahu: "Shoulder"
};

const PUBLISHED_STATUS = "Aktif";

/* i18n.js loads before this file on every page that uses it, but the optional
   call keeps a missing dictionary from taking the whole grid down — same
   defensive idiom as the window.CBML?. calls at the end of the render. */
function t(key, vars) {
  return window.CBML?.t ? window.CBML.t(key, vars) : key;
}

/* Marks a node for re-translation, so the language switch can re-fill it
   without this file having to re-render the grid. */
function i18n(el, spec, vars) {
  if (spec.text) el.dataset.i18n = spec.text;
  if (spec.attrs) el.dataset.i18nAttr = spec.attrs;
  for (const name in vars || {}) el.dataset["i18nVar" + name[0].toUpperCase() + name.slice(1)] = vars[name];
}

/* Matches MAX_PHOTOS in the dashboard's "Tambah" screen. Nothing in Firestore
   or the Security Rules enforces that ceiling, so it is re-applied here rather
   than trusted: a document with a hundred URLs must not build a hundred nodes. */
const MAX_PHOTOS = 8;

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return "Rp " + n.toLocaleString("id-ID");
}

/* The dashboard uploads product photos to Storage and stores the download URL
   on the document. Older bags predate that field, so a photo is optional and
   the caption placeholder stays the fallback.

   The value is database input, so only http(s) URLs are accepted — anything
   else (a javascript: or data: string) is treated as no photo at all. */
function safePhotoUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, document.baseURI);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (err) {
    return "";
  }
}

/* Every photo on a bag, in display order.

   The dashboard's schema (dashboard-curatedmamil/src/data/products.ts) writes
   `imageUrls` — the whole gallery, cover first — and keeps the cover duplicated
   in `imageUrl` precisely so this site keeps working. So `imageUrls` wins when
   it is there and `imageUrl` is the fallback for bags written before galleries
   existed; there is no backfill, and reading the two together is what stands in
   for one. Never concatenate them — the cover is in both, and it would show up
   twice.

   Deduped by resolved href as well, since the owner can paste a URL that is
   also one of the uploads, and capped at MAX_PHOTOS. */
function collectPhotos(data) {
  const raw = Array.isArray(data.imageUrls) && data.imageUrls.length
    ? data.imageUrls
    : [data.imageUrl];

  const seen = new Set();
  const photos = [];

  for (const value of raw) {
    const url = safePhotoUrl(value);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    photos.push(url);
    if (photos.length === MAX_PHOTOS) break;
  }

  return photos;
}

function buildPhoto(bag, index) {
  const img = document.createElement("img");
  img.className = "slot-photo";
  img.src = bag.photos[index];
  /* The first photo is the bag; the rest are the same bag from another angle,
     so they are numbered rather than repeating the name verbatim. */
  if (index === 0) {
    img.alt = bag.name;
  } else {
    const vars = { name: bag.name, n: index + 1, m: bag.photos.length };
    img.alt = t("gallery.alt", vars);
    i18n(img, { attrs: "alt:gallery.alt" }, vars);
  }
  /* Defers photos on cards below the fold. It does not defer the other slides
     of a gallery: they are stacked on top of each other, so once the card is on
     screen every one of them is in the viewport and fetches. Fine at this shop's
     size — revisit with a data-src swap if a bag ever carries eight photos. */
  img.loading = "lazy";
  return img;
}

/* The card's media box. Three shapes, and the first two are exactly what this
   file has always produced — a bag with one photo gains no gallery chrome:

     no photos  → the captioned .image-slot placeholder
     one photo  → a bare <img class="slot-photo">
     two or more→ a .gallery stack with arrows and dots, driven by catalog.js

   .image-slot and .slot-photo share their sizing rules in site.css, so the grid
   is unchanged either way. */
function buildMedia(bag) {
  if (!bag.photos.length) {
    const slot = document.createElement("div");
    slot.className = "image-slot";
    slot.textContent = bag.name;
    return slot;
  }

  if (bag.photos.length === 1) return buildPhoto(bag, 0);

  const gallery = document.createElement("div");
  gallery.className = "gallery";
  gallery.dataset.index = "0";
  gallery.setAttribute("role", "group");
  gallery.setAttribute("aria-label", t("gallery.group", { name: bag.name }));
  i18n(gallery, { attrs: "aria-label:gallery.group" }, { name: bag.name });

  const dots = document.createElement("div");
  dots.className = "gallery__dots";

  bag.photos.forEach(function (url, i) {
    const photo = buildPhoto(bag, i);
    photo.classList.add("gallery__photo");
    if (i === 0) photo.classList.add("is-active");
    gallery.append(photo);

    const dot = document.createElement("button");
    dot.className = "gallery__dot";
    dot.type = "button";
    dot.dataset.goto = String(i);
    const dotVars = { n: i + 1, m: bag.photos.length };
    dot.setAttribute("aria-label", t("gallery.dot", dotVars));
    i18n(dot, { attrs: "aria-label:gallery.dot" }, dotVars);
    if (i === 0) dot.setAttribute("aria-current", "true");
    dots.append(dot);
  });

  gallery.append(
    buildNav("prev", "gallery.prev", bag.name, "‹"),
    buildNav("next", "gallery.next", bag.name, "›"),
    dots
  );

  return gallery;
}

function buildNav(direction, labelKey, name, glyph) {
  const btn = document.createElement("button");
  btn.className = "gallery__nav gallery__nav--" + direction;
  btn.type = "button";
  btn.dataset.step = direction === "prev" ? "-1" : "1";
  btn.setAttribute("aria-label", t(labelKey, { name: name }));
  i18n(btn, { attrs: "aria-label:" + labelKey }, { name: name });
  btn.textContent = glyph;
  return btn;
}

/* Built with DOM methods rather than innerHTML: these values come from the
   database, so they are treated as untrusted text, never as markup. */
function buildCard(bag) {
  const article = document.createElement("article");
  article.className = "product";
  article.dataset.name = bag.name;
  article.dataset.cat = bag.category;

  const media = document.createElement("div");
  media.className = "product__media";

  const fav = document.createElement("button");
  fav.className = "product__fav";
  fav.type = "button";
  fav.setAttribute("aria-pressed", "false");
  fav.setAttribute("aria-label", t("product.save", { name: bag.name }));
  i18n(fav, { attrs: "aria-label:product.save" }, { name: bag.name });
  fav.textContent = "♥";

  // The heart stays last so it keeps painting over the photos.
  media.append(buildMedia(bag), fav);

  const body = document.createElement("div");
  body.className = "product__body";

  const name = document.createElement("div");
  name.className = "product__name";
  name.textContent = bag.name;

  const price = document.createElement("div");
  price.className = "product__price";
  price.textContent = bag.price;

  const order = document.createElement("a");
  order.className = "btn-solid product__order js-wa";
  order.href = "#";
  order.target = "_blank";
  order.rel = "noopener";
  const orderVars = { name: bag.name, price: bag.price };
  order.dataset.waMessage = t("product.wa", orderVars);
  order.textContent = t("product.order");
  i18n(order, { text: "product.order", attrs: "data-wa-message:product.wa" }, orderVars);

  body.append(name, price, order);
  article.append(media, body);
  return article;
}

async function loadCatalog() {
  const grid = document.querySelector(".js-products");
  if (!grid) return;

  const db = getFirestore(app);

  // The status filter is required by the Security Rules, not just a preference.
  const snapshot = await getDocs(
    query(collection(db, "products"), where("status", "==", PUBLISHED_STATUS))
  );

  const bags = snapshot.docs
    .map(function (doc) {
      const d = doc.data();
      return {
        name: String(d.name || "").trim(),
        price: formatPrice(d.price),
        category: CATEGORY_LABELS[d.cat] || d.cat || "",
        photos: collectPhotos(d)
      };
    })
    .filter(function (b) {
      return b.name;
    })
    // sorted here rather than in the query: an orderBy alongside the status
    // filter would need a composite index for no real benefit at this size
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

  if (!bags.length) {
    console.info("Live catalog: no active products; keeping the static list.");
    return;
  }

  grid.replaceChildren(...bags.map(buildCard));

  // i18n first — it writes the data-wa-message that wireWaLinks then reads.
  window.CBML?.applyI18n?.(grid);
  window.CBML?.wireWaLinks(grid);
  window.CBML?.applyCatalogFilters?.();

  grid.dataset.source = "firestore";
}

loadCatalog().catch(function (err) {
  console.warn("Live catalog unavailable, showing the static list:", err.message);
});
