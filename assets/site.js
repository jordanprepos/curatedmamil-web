/* ============================================================
   Curated By Mami L — ordering links
   Every "chat with us" link on the site is an <a class="js-wa">.
   This builds their wa.me href so the number lives in one place.

   The number itself is owned by the dashboard: Mami L edits it on
   the app's "Lainnya" tab, which writes shop/config.whatsappNumber
   in Firestore. assets/shop-live.js reads that and calls
   setWhatsAppNumber() below. WHATSAPP_NUMBER here is only the
   fallback for when that read hasn't finished, fails, or the page
   is opened straight off disk.

   The prefilled message is per page: set it once on <body
   data-wa-message="…">, or per link with the same attribute.

   Exposes window.CBML.wireWaLinks(root) so links rendered later
   (the live catalog) can be wired the same way.
   ============================================================ */

// Fallback only — the live value comes from Firestore (see above).
// Keep this in the same international format wa.me expects.
var WHATSAPP_NUMBER = "6281244805393";

var WHATSAPP_FALLBACK_MESSAGE =
  "Hello Curated By Mami L, I'd like to ask about a bag from your catalog.";

/* wa.me only accepts a full international number, digits only. The dashboard
   asks for that format but its validator also lets the local Indonesian one
   through, so what is actually stored may be "081244805393", "+62 812…", or
   "62812…". Normalise all three rather than shipping a dead link:

     leading "0"  → Indonesian local form, swap it for "62"
     leading "8"  → country code omitted entirely, prefix "62"
     leading "62" → already international, left alone

   Returns "" for anything that still doesn't look like a phone number, and the
   caller keeps the previous value. This is database input, so it is validated
   the same way catalog-live.js validates photo URLs. */
function normalizeWhatsAppNumber(value) {
  var digits = String(value == null ? "" : value).replace(/\D/g, "");
  if (!digits) return "";

  if (digits.charAt(0) === "0") {
    digits = "62" + digits.slice(1);
  } else if (digits.charAt(0) === "8") {
    digits = "62" + digits;
  }

  return /^\d{8,15}$/.test(digits) ? digits : "";
}

window.CBML = window.CBML || {};

/* Called by shop-live.js once Firestore answers. Returns false — leaving the
   fallback in place — if the stored value can't be made into a wa.me number. */
window.CBML.setWhatsAppNumber = function (value) {
  var normalized = normalizeWhatsAppNumber(value);
  if (!normalized) return false;

  WHATSAPP_NUMBER = normalized;
  return true;
};

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
