/* ============================================================
   Curated By Mami L — live best sellers

   Same Firestore, same rule as the catalog: only bags with status
   "Aktif" are published, and that filter is required by the Security
   Rules, not a preference — drop it and the read is rejected.

   There is no "best seller" flag in the dashboard's product schema,
   so this page shows the first few active bags rather than a curated
   set. Give the products a bestSeller field in the dashboard and this
   becomes a real selection: add where("bestSeller", "==", true) to
   the query below (two equality filters need no composite index).

   Card text is stamped with i18n keys rather than written out, so
   a live card follows the header's language switch just like the
   hand-written markup does.

   The hand-written markup in best-sellers.html stays as the no-JS
   fallback and is only replaced once at least one live bag comes
   back, so a network failure leaves the page as it was.
   ============================================================ */

import { app } from "./firebase.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const PUBLISHED_STATUS = "Aktif";

/* i18n.js loads before this file, but the optional call keeps a missing
   dictionary from taking the whole grid down — the same defensive idiom as
   the window.CBML?. calls at the end of the render. */
function t(key, vars) {
  return window.CBML?.t ? window.CBML.t(key, vars) : key;
}

/* The design lays this page out as three across. */
const MAX_CARDS = 3;

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

/* A real photo when the bag has one, the captioned placeholder when it doesn't.
   Both classes share their sizing rules in site.css, so the grid is unchanged. */
function buildSlot(bag) {
  if (bag.photo) {
    const img = document.createElement("img");
    img.className = "slot-photo";
    img.src = bag.photo;
    img.alt = bag.name;
    img.loading = "lazy";
    return img;
  }

  const slot = document.createElement("div");
  slot.className = "image-slot";
  slot.textContent = bag.name;
  return slot;
}

/* Built with DOM methods rather than innerHTML: these values come from the
   database, so they are treated as untrusted text, never as markup.

   No description paragraph here — the products collection has no such field,
   and the point of this page reading the database is that nothing about a bag
   is hand-written any more. */
function buildCard(bag) {
  const article = document.createElement("article");
  article.className = "best-card";

  const slot = buildSlot(bag);

  const body = document.createElement("div");
  body.className = "best-card__body";

  const name = document.createElement("div");
  name.className = "best-card__name";
  name.textContent = bag.name;

  const price = document.createElement("div");
  price.className = "best-card__price";
  price.textContent = bag.price;

  const order = document.createElement("a");
  order.className = "btn-solid js-wa";
  order.href = "#";
  order.target = "_blank";
  order.rel = "noopener";
  order.dataset.waMessage = t("product.wa", { name: bag.name, price: bag.price });
  order.textContent = t("product.order");
  // Re-filled by applyI18n() on a language switch, so no re-render is needed.
  order.dataset.i18n = "product.order";
  order.dataset.i18nAttr = "data-wa-message:product.wa";
  order.dataset.i18nVarName = bag.name;
  order.dataset.i18nVarPrice = bag.price;

  body.append(name, price, order);
  article.append(slot, body);
  return article;
}

async function loadBestSellers() {
  const grid = document.querySelector(".js-best");
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
        photo: safePhotoUrl(d.imageUrl)
      };
    })
    .filter(function (b) {
      return b.name;
    })
    // sorted here rather than in the query: an orderBy alongside the status
    // filter would need a composite index for no real benefit at this size
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    })
    .slice(0, MAX_CARDS);

  if (!bags.length) {
    console.info("Live best sellers: no active products; keeping the static list.");
    return;
  }

  grid.replaceChildren(...bags.map(buildCard));

  // i18n first — it writes the data-wa-message that wireWaLinks then reads.
  window.CBML?.applyI18n?.(grid);
  window.CBML?.wireWaLinks(grid);

  grid.dataset.source = "firestore";
}

loadBestSellers().catch(function (err) {
  console.warn("Live best sellers unavailable, showing the static list:", err.message);
});
