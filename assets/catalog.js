/* ============================================================
   Curated By Mami L — catalog filtering
   Progressive enhancement over the product markup: category
   filter, name search, the save hearts, and the per-bag photo
   galleries. Without JS every bag is still listed, every Order
   link still opens WhatsApp, and each gallery shows its cover
   photo — the first slide is marked active in the markup, so
   nothing here has to run for a card to look right.

   Products may be re-rendered from Firestore by catalog-live.js,
   so nothing here caches the product nodes and the hearts and
   galleries are handled by delegation. Exposes
   window.CBML.applyCatalogFilters() for the live loader to call
   after it swaps the grid.
   ============================================================ */

(function () {
  var search = document.querySelector(".js-search");
  var cats = document.querySelector(".js-cats");
  var grid = document.querySelector(".js-products");
  var empty = document.querySelector(".js-empty");

  if (!search || !cats || !grid) return;

  var activeCat = "All";

  function apply() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;

    // queried fresh each time — the grid's contents can be replaced
    grid.querySelectorAll(".product").forEach(function (el) {
      var matchesCat = activeCat === "All" || el.dataset.cat === activeCat;
      var matchesQuery = !q || (el.dataset.name || "").toLowerCase().indexOf(q) !== -1;
      var visible = matchesCat && matchesQuery;
      el.hidden = !visible;
      if (visible) shown++;
    });

    if (empty) empty.hidden = shown > 0;
  }

  // "input", not "change" — the grid narrows as you type.
  search.addEventListener("input", apply);

  cats.addEventListener("click", function (e) {
    var btn = e.target.closest(".filter-btn");
    if (!btn) return;

    activeCat = btn.dataset.cat;
    cats.querySelectorAll(".filter-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    apply();
  });

  /* ---- Photo galleries ----
     The slides are a stack, not a scroller: which one shows is a class, so
     there is no scroll position to read back. That matters here because
     .product[hidden] collapses a filtered-out card to zero width, which would
     break any index-from-scroll maths. Wraps around at both ends. */
  function showPhoto(gallery, index) {
    var photos = gallery.querySelectorAll(".gallery__photo");
    if (photos.length < 2) return;

    var next = ((index % photos.length) + photos.length) % photos.length;
    gallery.dataset.index = String(next);

    photos.forEach(function (photo, i) {
      photo.classList.toggle("is-active", i === next);
    });

    gallery.querySelectorAll(".gallery__dot").forEach(function (dot, i) {
      if (i === next) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  // Saved bags are in-session only, same as the design. Delegated — along with
  // the gallery controls — so it keeps working after the grid is re-rendered.
  grid.addEventListener("click", function (e) {
    var fav = e.target.closest(".product__fav");
    if (fav) {
      var faved = fav.getAttribute("aria-pressed") === "true";
      fav.setAttribute("aria-pressed", String(!faved));
      return;
    }

    var control = e.target.closest(".gallery__nav, .gallery__dot");
    if (!control) return;

    var gallery = control.closest(".gallery");
    if (!gallery) return;

    var current = Number(gallery.dataset.index) || 0;
    var target = control.dataset.goto !== undefined
      ? Number(control.dataset.goto)
      : current + Number(control.dataset.step || 0);

    showPhoto(gallery, target);
  });

  // Left/right arrows move the gallery whose control has focus.
  grid.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    var gallery = e.target.closest ? e.target.closest(".gallery") : null;
    if (!gallery) return;

    e.preventDefault();
    var current = Number(gallery.dataset.index) || 0;
    showPhoto(gallery, current + (e.key === "ArrowRight" ? 1 : -1));
  });

  window.CBML = window.CBML || {};
  window.CBML.applyCatalogFilters = apply;
})();
