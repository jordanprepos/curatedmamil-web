/* ============================================================
   Curated By Mami L — catalog filtering
   Progressive enhancement over the static product markup:
   category filter, name search, and the save hearts.
   Without JS every bag is still listed and every Order link
   still opens WhatsApp.
   ============================================================ */

(function () {
  var search = document.querySelector(".js-search");
  var cats = document.querySelector(".js-cats");
  var products = [].slice.call(document.querySelectorAll(".js-products .product"));
  var empty = document.querySelector(".js-empty");

  if (!search || !cats || !products.length) return;

  var activeCat = "All";

  function apply() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;

    products.forEach(function (el) {
      var matchesCat = activeCat === "All" || el.dataset.cat === activeCat;
      var matchesQuery = !q || el.dataset.name.toLowerCase().indexOf(q) !== -1;
      var visible = matchesCat && matchesQuery;
      el.hidden = !visible;
      if (visible) shown++;
    });

    empty.hidden = shown > 0;
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

  // Saved bags are in-session only, same as the design.
  document.querySelectorAll(".product__fav").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var faved = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!faved));
    });
  });
})();
