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
