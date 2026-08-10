/* ============================================================
   Curated By Mami L — ordering links
   Every "chat with us" link on the site is an <a class="js-wa">.
   This builds their wa.me href so the number lives in one place.

   The prefilled message is per page: set it once on <body
   data-wa-message="…">, or per link with the same attribute.
   ============================================================ */

// TODO: replace with the real business WhatsApp number (country code, digits only).
// This value is the placeholder that shipped with the design.
var WHATSAPP_NUMBER = "6281234567890";

var WHATSAPP_FALLBACK_MESSAGE =
  "Hello Curated By Mami L, I'd like to ask about a bag from your catalog.";

(function () {
  var pageMessage = document.body.getAttribute("data-wa-message");

  document.querySelectorAll(".js-wa").forEach(function (el) {
    var message =
      el.getAttribute("data-wa-message") || pageMessage || WHATSAPP_FALLBACK_MESSAGE;
    el.href =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  });
})();
