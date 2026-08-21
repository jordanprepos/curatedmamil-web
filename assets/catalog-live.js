/* ============================================================
   Curated By Mami L — live catalog

   Reads the same Firestore the Mami L dashboard writes to, so the
   website and the app share one product list. Only bags with
   status "Aktif" are published; the Security Rules enforce that,
   which is why the query below MUST keep its status filter — drop
   it and Firestore rejects the whole read.

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

/* The dashboard stores categories in Indonesian; the site's filter
   buttons are English. Anything unmapped falls back to its raw value. */
const CATEGORY_LABELS = {
  Tote: "Totes",
  Selempang: "Crossbody",
  Clutch: "Clutch",
  Bahu: "Shoulder"
};

const PUBLISHED_STATUS = "Aktif";

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
  img.alt = index === 0
    ? bag.name
    : bag.name + " — photo " + (index + 1) + " of " + bag.photos.length;
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
  gallery.setAttribute("aria-label", "Photos of " + bag.name);

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
    dot.setAttribute("aria-label", "Photo " + (i + 1) + " of " + bag.photos.length);
    if (i === 0) dot.setAttribute("aria-current", "true");
    dots.append(dot);
  });

  gallery.append(
    buildNav("prev", "Previous photo of " + bag.name, "‹"),
    buildNav("next", "Next photo of " + bag.name, "›"),
    dots
  );

  return gallery;
}

function buildNav(direction, label, glyph) {
  const btn = document.createElement("button");
  btn.className = "gallery__nav gallery__nav--" + direction;
  btn.type = "button";
  btn.dataset.step = direction === "prev" ? "-1" : "1";
  btn.setAttribute("aria-label", label);
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
  fav.setAttribute("aria-label", "Save " + bag.name);
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
  order.dataset.waMessage =
    "Hello Curated By Mami L, I'd like to order the " +
    bag.name +
    " (" +
    bag.price +
    "). Is it still available?";
  order.textContent = "Order on WhatsApp";

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

  // Give the new nodes their wa.me hrefs, then re-run any active filter.
  window.CBML?.wireWaLinks(grid);
  window.CBML?.applyCatalogFilters?.();

  grid.dataset.source = "firestore";
}

loadCatalog().catch(function (err) {
  console.warn("Live catalog unavailable, showing the static list:", err.message);
});
