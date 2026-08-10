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

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return "Rp " + n.toLocaleString("id-ID");
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

  const slot = document.createElement("div");
  slot.className = "image-slot";
  slot.textContent = bag.name;

  const fav = document.createElement("button");
  fav.className = "product__fav";
  fav.type = "button";
  fav.setAttribute("aria-pressed", "false");
  fav.setAttribute("aria-label", "Save " + bag.name);
  fav.textContent = "♥";

  media.append(slot, fav);

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
        category: CATEGORY_LABELS[d.cat] || d.cat || ""
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
