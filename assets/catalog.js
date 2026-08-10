/* ============================================================
   Curated By Mami L — catalog filtering
   Progressive enhancement over the product markup: category
   filter, name search, and the save hearts. Without JS every bag
   is still listed and every Order link still opens WhatsApp.

   Products may be re-rendered from Firestore by catalog-live.js,
   so nothing here caches the product nodes and the hearts are
   handled by delegation. Exposes window.CBML.applyCatalogFilters()
   for the live loader to call after it swaps the grid.
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

  // Saved bags are in-session only, same as the design. Delegated so it keeps
  // working after the grid is re-rendered.
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".product__fav");
    if (!btn) return;

    var faved = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!faved));
  });

  window.CBML = window.CBML || {};
  window.CBML.applyCatalogFilters = apply;
})();
