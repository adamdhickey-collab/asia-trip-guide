# Mom & Dad in Southeast Asia

A private, mobile-first, offline-first trip guide for a 16-day Kensington
Tours itinerary (Vietnam, Cambodia, Thailand; Jan 27 to Feb 11, 2027).
No build step and **no dependencies**: plain ES modules, a service worker,
and Node's own standard library for scripts. Do not add a package.json.

Serve it with any static server over `http://localhost`, never `file://`:

    python3 -m http.server 4173

## What matters here

- **Opens on today.** `js/clock.js` decides the day in `Asia/Bangkok`
  (every stop is UTC+7) so a sister in the US sees the same day the parents
  are living. `?date=2027-02-04` previews any day.
- **Works with no signal.** `sw.js` precaches every file, photos included.
  `node scripts/verify-cache.mjs` fails if a file on disk is not listed.
- **Readable at arm's length.** Body text is 19px minimum, tap targets are
  48px minimum, and every gesture has a visible button equivalent.
- **Design tokens are law.** Colors, sizes, spacing and timings live at the
  top of `css/app.css`. Never write a raw color or pixel size elsewhere.

## Where things live

| File | Holds |
| --- | --- |
| `js/itinerary.js` | Every trip fact: days, steps, hotels, notes. Edit here only. |
| `js/places.js` | City coordinates, route legs, coarse country outlines for the map. |
| `js/clock.js` | Pure date logic. Tested. |
| `js/app.js` | Rendering, routing (`#/day/9`, `#/map`, `#/hotels`, `#/info`), swipe. |
| `js/version.js` | `APP_VERSION`. Bump on every deploy or nobody gets the update. |
| `scripts/fetch-images.mjs` | Source of every photo (Kensington CDN paths). |

## Checks (run before committing)

    node --test scripts/*.test.mjs
    node scripts/verify-cache.mjs

## Deploy

`.github/workflows/deploy-pages.yml` publishes the repo root on every push to
`main`; there is no build and no gate. Work on a branch. Bump `APP_VERSION`
in the same change as anything user-visible.
