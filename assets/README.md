# assets

`site.css` and `site.js` are the shared chrome for every page. `catalog.js` is
catalog-only, `firebase.js` initializes Firebase.

## logo.png

512×512, resized with `sips` from the 2000×2000 original
(`Curated By Mami L Logo Design.png` in the design project's `uploads/`). 512 is
twice the largest on-page use (the 250px Home hero), so it stays sharp on
retina without shipping a 1.8 MB file.

Referenced by every page's header at 44px, plus the Home hero at 250px.

To regenerate from the original:

```bash
sips -Z 512 "Curated By Mami L Logo Design.png" --out assets/logo.png
```

## Product photos

Collection and product photos go here too — swap each `<div class="image-slot">`
in a page for `<img class="slot-photo" src="assets/…" alt="…">`. Both classes
share sizing rules in `site.css`, so no other CSS changes are needed.
