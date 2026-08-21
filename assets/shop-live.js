/* ============================================================
   Curated By Mami L — live shop settings

   Mami L sets her WhatsApp number in the dashboard app, on the
   "Lainnya" tab. That writes shop/config in the same Firestore
   this site reads, so the number is entered in one place and the
   website follows it — no redeploy, no editing site.js.

   Included on every page, because .js-wa links (the floating chat
   pill included) are on every page.

   Same shape as the other live scripts: the value already in
   site.js is the fallback, and it is only replaced once a usable
   number comes back. A network failure, a missing document, or a
   number Firestore holds in an unusable form all leave the page
   exactly as it was rather than producing a dead wa.me link.
   ============================================================ */

import { app } from "./firebase.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

async function loadShopConfig() {
  // Nothing to wire on a page that somehow loaded without site.js.
  if (!window.CBML?.setWhatsAppNumber) return;

  const db = getFirestore(app);
  const snapshot = await getDoc(doc(db, "shop", "config"));

  if (!snapshot.exists()) {
    console.info("Shop config: no shop/config document; keeping the fallback number.");
    return;
  }

  const stored = snapshot.data().whatsappNumber;

  if (!window.CBML.setWhatsAppNumber(stored)) {
    console.warn(
      "Shop config: whatsappNumber is not a usable number; keeping the fallback."
    );
    return;
  }

  /* Re-wire the whole document, not a subtree: catalog-live.js may have already
     replaced the product grid, or may still be in flight. Doing every .js-wa
     link makes both orders correct. */
  window.CBML.wireWaLinks(document);
}

loadShopConfig().catch(function (err) {
  console.warn("Shop config unavailable, using the fallback number:", err.message);
});
