# Umbre Studio — Complete Lamps 2–22 catalogue patch

This bundle is specifically intended for the repository that currently contains The Halo as its only original lamp. It keeps The Halo and replaces the starter/mock catalogue with the full sequential collection from Lamp 2 through Lamp 22.

## Included
- `src/catalog.js`: complete replacement catalogue with The Halo + Lamps 2–22 (22 products total).
- `public/product-images/`: actual concept images extracted from each lamp's individual package, including multiple gallery images where supplied. Lamp 13 (The Eclipse) did not have an individual package available in the workspace, so a clearly conceptual SVG illustration is included.
- `integration/main.jsx-changes.txt`: exact small UI changes to keep concepts out of cart and switch image for selected Nook/Sentinel colour variants.
- `integration/supabase-lamps-2-22.sql`: optional database upsert for Lamps 2–22; all are inactive and zero inventory.

## Apply to your repo
1. Back up your current `src/catalog.js`.
2. Replace it with this bundle's `src/catalog.js`.
3. Copy all files from this bundle's `public/product-images/` into the same folder in your repo. Do not delete the existing Halo images.
4. Apply the small changes in `integration/main.jsx-changes.txt` to your existing `src/main.jsx`. These are provided as exact snippets because your repo may have moved since the last snapshot.
5. Add the CSS snippet from that file to the end of `src/styles.css`.
6. Run `npm run build` and inspect the site locally.
7. Commit and push the changes.

## Important
- This replaces the starter fake 22-item `raw` list with the actual named collection: The Halo and Lamps 2–22.
- All new items are `prototypeOnly:true`; the UI patch hides quick-add and displays a prototype-only notice rather than permitting purchase.
- Optional SQL keeps all Lamp 2–22 records inactive (`is_active=false`) with zero stock. Do not run it unless you want rows in Supabase; the static catalogue does not require it.
- Product photos/render boards are concept imagery. Prices and dimensions are preliminary and should be verified.
- This ZIP does not push to GitHub or deploy to Vercel.
