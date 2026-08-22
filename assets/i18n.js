/* ============================================================
   Curated By Mami L — language switch (Bahasa Indonesia / English)

   Indonesian is this shop's language: it is what is written in the
   HTML, what <html lang> says, and what a visitor gets on their
   first visit. This file holds the English translation of that copy
   and swaps it in when the header's EN button is pressed. Writing
   the default into the markup rather than into a dictionary is what
   keeps the default path free of a flash of the wrong language and
   correct with JS off.

   Marking a node up for translation:

     data-i18n="key"                     → replaces the text
     data-i18n-attr="placeholder:key"    → replaces an attribute;
                                           separate pairs with ";"
     data-i18n-var-name="Elara Tote"     → fills {name} in the string

   Any attribute works, including data-wa-message — which is how the
   prefilled WhatsApp text follows the language. site.js reads that
   attribute, so applyI18n() must run before wireWaLinks(); both
   call sites below and in the live loaders keep that order.

   Exposes window.CBML.t / .applyI18n / .setLanguage / .getLanguage,
   so nodes rendered later (catalog-live.js, best-sellers-live.js)
   are translated the same way. The choice is remembered in
   localStorage under CBML_LANG_KEY.
   ============================================================ */

(function () {
  var DEFAULT_LANG = "id";
  var LANGS = ["id", "en"];
  var CBML_LANG_KEY = "cbml-lang";

  var STRINGS = {
    id: {
      /* ---- Shared chrome ---- */
      "brand.homeAria": "Curated By Mami L — beranda",
      "nav.main": "Navigasi utama",
      "nav.footer": "Navigasi footer",
      "nav.home": "Beranda",
      "nav.collections": "Koleksi",
      "nav.catalog": "Katalog",
      "nav.best": "Terlaris",
      "nav.about": "Tentang",
      "lang.aria": "Pilih bahasa",
      "chat.pill": "Chat dengan kami",
      "cta.waChat": "Chat di WhatsApp",
      "footer.legal": "© 2026 Curated By Mami L. Hak cipta dilindungi.",
      "footer.waUs": "Hubungi kami di WhatsApp",

      /* ---- How to Order (Beranda + Tentang) ---- */
      "how.title": "Cara Memesan",
      "how.1.step": "Jelajahi katalog",
      "how.1.body": "Saring berdasarkan gaya atau cari dari namanya. Semua yang tampil tersedia.",
      "how.2.step": "Ketuk untuk memesan",
      "how.2.body": "WhatsApp terbuka dengan nama tas dan harganya sudah dituliskan untuk Anda.",
      "how.3.step": "Kami simpan untuk Anda",
      "how.3.body": "Konfirmasi pembayaran dan pengiriman lewat chat. Setiap tas kami tahan 24 jam.",

      /* ---- Beranda ---- */
      "home.pageTitle": "Curated By Mami L — Keanggunan Abadi, Dikurasi untuk Anda",
      "home.h1": "Keanggunan Abadi, Dikurasi untuk Anda",
      "home.lede": "Setiap tas di katalog kami tersedia dan siap dikirim. Pilih milik Anda, lalu chat kami di WhatsApp untuk memesannya.",
      "home.cta": "Lihat Koleksi",
      "home.styles": "Belanja per Gaya",
      "home.wa": "Halo Curated By Mami L, saya ingin bertanya tentang tas di katalog Anda.",
      "footer.loop.h2": "Tetap Terhubung",
      "footer.loop.p": "Jadilah yang pertama tahu tentang koleksi baru dan penawaran eksklusif.",
      "form.email": "Alamat email Anda",
      "form.subscribe": "Berlangganan",

      /* ---- Kategori ---- */
      "cat.totes": "Tote",
      "cat.crossbody": "Selempang",
      "cat.clutch": "Clutch",
      "cat.shoulder": "Bahu",
      "slot.totes": "Foto koleksi Tote",
      "slot.crossbody": "Foto koleksi Selempang",
      "slot.clutch": "Foto koleksi Clutch",

      /* ---- Koleksi ---- */
      "coll.pageTitle": "Koleksi Pilihan — Curated By Mami L",
      "coll.h1": "Koleksi Pilihan",
      "coll.lede": "Tiga cara membawa hari Anda. Pilih siluetnya, lalu jelajahi semua yang tersedia dalam gaya itu.",
      "coll.totes.p": "Lapang, terstruktur, dibuat untuk hari yang panjang.",
      "coll.crossbody.p": "Bebas genggam, jatuh lembut, mudah dipadupadankan.",
      "coll.clutch.p": "Pilihan untuk malam hari, mungil dan penuh pertimbangan.",
      "coll.totes.cta": "Lihat Tote",
      "coll.crossbody.cta": "Lihat Selempang",
      "coll.clutch.cta": "Lihat Clutch",
      "coll.wa": "Halo Curated By Mami L, saya ingin dibantu memilih tas dari koleksi Anda.",
      "coll.footer.h2": "Belum yakin yang mana?",
      "coll.footer.p": "Kirim pesan dan kami bantu memilihkan.",

      /* ---- Katalog ---- */
      "cat.pageTitle": "Katalog Kami — Curated By Mami L",
      "cat.h1": "Katalog Kami",
      "cat.lede": "Semua yang ada di sini tersedia. Ketuk Pesan lewat WhatsApp dan pesannya sudah dituliskan untuk Anda.",
      "cat.search": "Cari tas...",
      "cat.search.aria": "Cari tas berdasarkan nama",
      "cat.filter.aria": "Saring berdasarkan kategori",
      "cat.all": "Semua",
      "cat.empty": "Tidak ada tas yang cocok dengan pencarian itu.",
      "cat.wa": "Halo Curated By Mami L, saya mencari tas yang belum ada di katalog.",
      "cat.footer.h2": "Mencari sesuatu yang lain?",
      "cat.footer.p": "Beri tahu kami keinginan Anda dan kami carikan.",

      /* ---- Kartu produk (markup dan Firestore) ---- */
      "product.order": "Pesan lewat WhatsApp",
      "product.save": "Simpan {name}",
      "product.wa": "Halo Curated By Mami L, saya ingin memesan {name} ({price}). Apakah masih tersedia?",
      "gallery.group": "Foto {name}",
      "gallery.prev": "Foto sebelumnya dari {name}",
      "gallery.next": "Foto berikutnya dari {name}",
      "gallery.dot": "Foto {n} dari {m}",
      "gallery.alt": "{name} — foto {n} dari {m}",
      "slot.elara.side": "Elara Tote — samping",
      "slot.elara.inside": "Elara Tote — bagian dalam",

      /* ---- Terlaris ---- */
      "best.pageTitle": "Terlaris — Curated By Mami L",
      "best.h1": "Terlaris",
      "best.lede": "Produk yang selalu dicari pelanggan kami. Distok ulang dalam jumlah terbatas.",
      "best.wa": "Halo Curated By Mami L, saya ingin bertanya tentang produk terlaris Anda.",
      "best.footer.h2": "Lihat katalog lengkap",
      "best.footer.p": "Semua yang kami miliki saat ini.",
      "best.footer.cta": "Jelajahi Katalog",

      /* ---- Tentang ---- */
      "about.pageTitle": "Kisah Kami — Curated By Mami L",
      "about.h1": "Kisah Kami",
      "about.slot": "Foto atelier / bengkel kerja",
      "about.body": "Curated By Mami L lahir dari kecintaan pada aksesori yang tak lekang waktu. Setiap produk dalam koleksi kami dipilih langsung karena kualitas pengerjaan, desain yang elegan, dan keserbagunaannya. Kami percaya tas yang tepat bukan sekadar melengkapi penampilan — ia menceritakan kisah Anda. Dari bengkel para perajin hingga lemari Anda, kami menghadirkan kemewahan yang bertahan lama.",
      "about.wa": "Halo Curated By Mami L, saya ingin tahu lebih banyak tentang tas Anda.",
      "about.footer.h2": "Sapa kami",
      "about.footer.p": "Kami membalas setiap pesan, biasanya dalam satu jam."
    },

    en: {
      /* ---- Shared chrome ---- */
      "brand.homeAria": "Curated By Mami L — home",
      "nav.main": "Main",
      "nav.footer": "Footer",
      "nav.home": "Home",
      "nav.collections": "Collections",
      "nav.catalog": "Catalog",
      "nav.best": "Best Sellers",
      "nav.about": "About",
      "lang.aria": "Choose language",
      "chat.pill": "Chat with us",
      "cta.waChat": "Chat on WhatsApp",
      "footer.legal": "© 2026 Curated By Mami L. All rights reserved.",
      "footer.waUs": "WhatsApp us",

      /* ---- How to Order (Home + About) ---- */
      "how.title": "How to Order",
      "how.1.step": "Browse the catalog",
      "how.1.body": "Filter by style or search by name. Everything shown is in stock.",
      "how.2.step": "Tap to order",
      "how.2.body": "WhatsApp opens with the bag and price already written for you.",
      "how.3.step": "We hold it for you",
      "how.3.body": "Confirm payment and delivery in the chat. Each bag is reserved 24 hours.",

      /* ---- Home ---- */
      "home.pageTitle": "Curated By Mami L — Timeless Elegance, Curated for You",
      "home.h1": "Timeless Elegance, Curated for You",
      "home.lede": "Every bag in our catalog is in stock and ready to ship. Choose yours, then chat with us on WhatsApp to reserve it.",
      "home.cta": "Explore Collection",
      "home.styles": "Shop by Style",
      "home.wa": "Hello Curated By Mami L, I'd like to ask about a bag from your catalog.",
      "footer.loop.h2": "Stay in the Loop",
      "footer.loop.p": "Be the first to know about new arrivals and exclusive offers.",
      "form.email": "Your email address",
      "form.subscribe": "Subscribe",

      /* ---- Categories ---- */
      "cat.totes": "Totes",
      "cat.crossbody": "Crossbody",
      "cat.clutch": "Clutch",
      "cat.shoulder": "Shoulder",
      "slot.totes": "Totes collection photo",
      "slot.crossbody": "Crossbody collection photo",
      "slot.clutch": "Clutches collection photo",

      /* ---- Collections ---- */
      "coll.pageTitle": "Featured Collections — Curated By Mami L",
      "coll.h1": "Featured Collections",
      "coll.lede": "Three ways to carry the day. Pick a silhouette, then browse everything available in that style.",
      "coll.totes.p": "Roomy, structured, built for long days.",
      "coll.crossbody.p": "Hands free, softly worn, easy to dress up.",
      "coll.clutch.p": "Evening pieces, small and deliberate.",
      "coll.totes.cta": "View Totes",
      "coll.crossbody.cta": "View Crossbody",
      "coll.clutch.cta": "View Clutches",
      "coll.wa": "Hello Curated By Mami L, I'd like help choosing a bag from your collections.",
      "coll.footer.h2": "Not sure which suits you?",
      "coll.footer.p": "Message us and we'll help you choose.",

      /* ---- Catalog ---- */
      "cat.pageTitle": "Our Catalog — Curated By Mami L",
      "cat.h1": "Our Catalog",
      "cat.lede": "Everything here is in stock. Tap Order on WhatsApp and the message is written for you.",
      "cat.search": "Search bags...",
      "cat.search.aria": "Search bags by name",
      "cat.filter.aria": "Filter by category",
      "cat.all": "All",
      "cat.empty": "No bags match that search.",
      "cat.wa": "Hello Curated By Mami L, I'm looking for a bag that isn't in the catalog.",
      "cat.footer.h2": "Looking for something else?",
      "cat.footer.p": "Tell us what you have in mind and we'll source it.",

      /* ---- Product cards (markup and Firestore) ---- */
      "product.order": "Order on WhatsApp",
      "product.save": "Save {name}",
      "product.wa": "Hello Curated By Mami L, I'd like to order the {name} ({price}). Is it still available?",
      "gallery.group": "Photos of {name}",
      "gallery.prev": "Previous photo of {name}",
      "gallery.next": "Next photo of {name}",
      "gallery.dot": "Photo {n} of {m}",
      "gallery.alt": "{name} — photo {n} of {m}",
      "slot.elara.side": "Elara Tote — side",
      "slot.elara.inside": "Elara Tote — inside",

      /* ---- Best Sellers ---- */
      "best.pageTitle": "Best Sellers — Curated By Mami L",
      "best.h1": "Best Sellers",
      "best.lede": "The pieces our customers come back for. Restocked in small runs.",
      "best.wa": "Hello Curated By Mami L, I'd like to ask about your best sellers.",
      "best.footer.h2": "See the full catalog",
      "best.footer.p": "Every piece we have in stock right now.",
      "best.footer.cta": "Browse Catalog",

      /* ---- About ---- */
      "about.pageTitle": "Our Story — Curated By Mami L",
      "about.h1": "Our Story",
      "about.slot": "Atelier / workshop photo",
      "about.body": "Curated By Mami L was born from a passion for timeless accessories. Every piece in our collection is hand-selected for its quality craftsmanship, elegant design, and versatility. We believe the right bag doesn't just complete an outfit — it tells your story. From artisan workshops to your wardrobe, we bring you luxury that lasts.",
      "about.wa": "Hello Curated By Mami L, I'd like to know more about your bags.",
      "about.footer.h2": "Say hello",
      "about.footer.p": "We reply to every message, usually within the hour."
    }
  };

  var current = DEFAULT_LANG;

  function stored() {
    try {
      var saved = window.localStorage.getItem(CBML_LANG_KEY);
      return LANGS.indexOf(saved) !== -1 ? saved : "";
    } catch (err) {
      // Private browsing can throw on access alone; the default is fine.
      return "";
    }
  }

  function remember(lang) {
    try {
      window.localStorage.setItem(CBML_LANG_KEY, lang);
    } catch (err) {
      /* not being able to remember the choice is not worth an error */
    }
  }

  /* The vars for a node live on it as data-i18n-var-*, so a string like
     "Simpan {name}" can be re-filled on every language change without the
     caller having to hold on to the values. */
  function varsOf(el) {
    var vars = {};
    for (var key in el.dataset) {
      if (key.indexOf("i18nVar") === 0 && key.length > 7) {
        var name = key.charAt(7).toLowerCase() + key.slice(8);
        vars[name] = el.dataset[key];
      }
    }
    return vars;
  }

  /* Unknown keys return the key itself rather than "" — a visible key is a
     bug report; a blank label is a mystery. */
  function t(key, vars, lang) {
    var table = STRINGS[lang || current] || STRINGS[DEFAULT_LANG];
    var text = table[key];
    if (text === undefined) return key;
    if (!vars) return text;

    return text.replace(/\{(\w+)\}/g, function (match, name) {
      return vars[name] !== undefined ? vars[name] : match;
    });
  }

  function translate(el) {
    var vars = varsOf(el);

    var textKey = el.getAttribute("data-i18n");
    if (textKey) el.textContent = t(textKey, vars);

    var attrSpec = el.getAttribute("data-i18n-attr");
    if (!attrSpec) return;

    attrSpec.split(";").forEach(function (pair) {
      var parts = pair.split(":");
      var attr = (parts[0] || "").trim();
      var key = (parts[1] || "").trim();
      if (attr && key) el.setAttribute(attr, t(key, vars));
    });
  }

  /* Translates root and everything under it. Called on load, on every
     language change, and by the live loaders on the cards they build —
     always before site.js re-reads data-wa-message. */
  function applyI18n(root) {
    var scope = root || document;

    if (scope.nodeType === 1 && (scope.hasAttribute("data-i18n") || scope.hasAttribute("data-i18n-attr"))) {
      translate(scope);
    }

    scope.querySelectorAll("[data-i18n], [data-i18n-attr]").forEach(translate);
  }

  function setLanguage(lang, options) {
    if (LANGS.indexOf(lang) === -1) return false;

    current = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll(".js-lang [data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    applyI18n(document);
    // The WhatsApp text just changed language; rebuild every wa.me href.
    if (window.CBML && window.CBML.wireWaLinks) window.CBML.wireWaLinks(document);

    if (!options || options.remember !== false) remember(lang);
    return true;
  }

  window.CBML = window.CBML || {};
  window.CBML.t = t;
  window.CBML.applyI18n = applyI18n;
  window.CBML.setLanguage = setLanguage;
  window.CBML.getLanguage = function () {
    return current;
  };

  document.querySelectorAll(".js-lang").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (btn) setLanguage(btn.dataset.lang);
    });
  });

  /* Indonesian is already in the markup, so the default costs nothing to
     honour: only a remembered English choice needs a pass here. site.js has
     not run yet, so it will pick up the translated data-wa-message itself. */
  var saved = stored();
  if (saved && saved !== DEFAULT_LANG) setLanguage(saved, { remember: false });
})();
