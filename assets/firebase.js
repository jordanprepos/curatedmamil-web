/* ============================================================
   Curated By Mami L — Firebase

   This site has no build step, so the modular SDK is loaded from
   Google's CDN rather than npm. Included on every page as
   <script type="module" src="assets/firebase.js"></script>.

   To add a product (Firestore, Auth, Storage…), import it from the
   same pinned version and export the instance from here:

     import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
     export const db = getFirestore(app);

   Then use it from a page with:
     <script type="module">
       import { db } from "./assets/firebase.js";
     </script>
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-check.js";

// Firebase web config is public by design — it identifies the project, it does
// not authorise anything. Access is controlled by Security Rules and App Check.
/* Same project as the Mami L dashboard app, so both read one Firestore. */
export const firebaseConfig = {
  apiKey: "AIzaSyAQNC27PX0iEpzQ_sbbyA0VzfdrsZv4LVc",
  authDomain: "mamiel-project.firebaseapp.com",
  projectId: "mamiel-project",
  storageBucket: "mamiel-project.firebasestorage.app",
  messagingSenderId: "481440432212",
  appId: "1:481440432212:web:743e98928f02a6745c2dc1",
  measurementId: "G-SJP0HVJFN3"
};

export const app = initializeApp(firebaseConfig);

/* ---- App Check ----

   Proves to Firebase that a request came from this website rather than from a
   script hitting the API directly. Security Rules decide *what* may be read;
   App Check attests *who is asking*. They are complementary, and the Rules stay
   the real access boundary.

   Paste the reCAPTCHA v3 **site** key here to switch this on. It is a public
   key and belongs in client code — the matching *secret* key is registered once
   in the Firebase console and must never appear in this repo.

   Left empty, the whole block is skipped: no tokens are sent and the site
   behaves exactly as it does today. That is deliberate, so this file can ship
   before the key exists.

   BEFORE TURNING ON ENFORCEMENT, read PROJECT.md §7 — the Mami L dashboard app
   shares this project *and this very app ID*, and it cannot produce App Check
   tokens. Enforcing while that is true locks the owner out of her own shop. */
const RECAPTCHA_SITE_KEY = "";

/* Debug tokens, localhost only.

   The SDK prints a token to the console that you register once under App Check
   → Apps → Manage debug tokens. It is not a bypass on its own: an unregistered
   debug token is rejected like any other bad attestation. Restricted to
   localhost so a deployed page can never ask for one. */
const onLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
if (onLocalhost) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

export const appCheck = (function () {
  if (!RECAPTCHA_SITE_KEY) {
    console.info("Firebase App Check skipped: no reCAPTCHA site key set.");
    return null;
  }

  try {
    return initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      /* Refreshes the token in the background so a visitor who lingers on the
         catalog does not hit an expired one mid-session. */
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    /* Never fatal. If attestation cannot start, the page still renders and the
       reads either succeed (unenforced) or fail the same way any other network
       error does — catalog-live.js already falls back to the static list. */
    console.warn("Firebase App Check not initialized:", err.message);
    return null;
  }
})();

/* Analytics is off until Google Analytics is linked to the project.
   Without a measurementId, getAnalytics() still "succeeds" but loads gtag with
   id=undefined and reports nowhere — so require the id explicitly rather than
   pretending it works. Enable Google Analytics in the Firebase console, then
   add the G-XXXXXXX it issues to firebaseConfig above.

   isSupported() covers the other case: no usable origin (opening these files
   straight from disk), where getAnalytics() would throw. */
export const analyticsReady = (async function () {
  if (!firebaseConfig.measurementId) {
    console.info("Firebase Analytics skipped: no measurementId in config.");
    return null;
  }
  try {
    return (await isSupported()) ? getAnalytics(app) : null;
  } catch (err) {
    console.warn("Firebase Analytics not initialized:", err.message);
    return null;
  }
})();
