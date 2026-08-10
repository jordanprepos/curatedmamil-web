/* ============================================================
   Curated By Mami L — ordering links
   Every "chat with us" link on the site is an <a class="js-wa">.
   This builds their wa.me href so the number lives in one place.

   The prefilled message is per page: set it once on <body
   data-wa-message="…">, or per link with the same attribute.

   Exposes window.CBML.wireWaLinks(root) so links rendered later
   (the live catalog) can be wired the same way.
   ============================================================ */

// TODO: replace with the real business WhatsApp number (country code, digits only).
// This value is the placeholder that shipped with the design.
var WHATSAPP_NUMBER = "6281234567890";

var WHATSAPP_FALLBACK_MESSAGE =
  "Hello Curated By Mami L, I'd like to ask about a bag from your catalog.";

window.CBML = window.CBML || {};

window.CBML.waLink = function (message) {
  return (
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message || WHATSAPP_FALLBACK_MESSAGE)
  );
};

window.CBML.wireWaLinks = function (root) {
  var pageMessage = document.body.getAttribute("data-wa-message");

  (root || document).querySelectorAll(".js-wa").forEach(function (el) {
    el.href = window.CBML.waLink(
      el.getAttribute("data-wa-message") || pageMessage
    );
  });
};

window.CBML.wireWaLinks(document);
