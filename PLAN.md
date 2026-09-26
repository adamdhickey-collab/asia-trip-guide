# Plan: Mom & Dad in Southeast Asia

A private, offline-first phone guide to the Kensington Tours trip
(Vietnam, Cambodia, Thailand; Wed Jan 27 to Thu Feb 11, 2027). Built for two
travelers in their seventies, and for their kids at home who want to know
"where are they today?"

## What it must do

1. **Open on today.** No tapping, no scrolling: the day's plan is the first
   thing on screen. "Today" is decided in the trip's time zone (all three
   countries are UTC+7), so a sister in the US sees the same day the parents
   are living, not her own calendar date.
2. **Work with no signal.** Every screen and every photo is saved to the
   phone the first time it opens on Wi-Fi. Nothing is fetched later.
3. **Be readable at arm's length.** 19px body text, 48px tap targets, 7:1
   contrast on anything that answers "where do we need to be".
4. **Go to yesterday and tomorrow with buttons**, not hidden gestures, and
   always offer a one-tap "Today" to snap back.
5. **Share by link.** No accounts, no app store. Anyone with the link sees
   Day N of 16, the city, the local time there, and a dot on the map.

## What was built (v1, this repo)

| Screen | What it shows |
| --- | --- |
| **Today** | Hero photo, Day N of 16, date, city. "It's 7:42 pm Thursday in Siem Reap · 8:42 am for you." Attention badges (early start, two flights, new country, dress code). The plan as an ordered timeline. Tonight's hotel with **Show the driver** and **Open in Maps**. Good-to-know notes. The full description. A **Tomorrow** card with its start time. Big Day N-1 / Day N+1 buttons. |
| **Before the trip** | Countdown, Day 1 preview, the documents checklist. |
| **After the trip** | "Welcome home" and the list, to look back. |
| **All days** | Sixteen rows grouped by city, with thumbnails; today highlighted, past days dimmed. |
| **Map** | Offline SVG route map of the six stops with road/flight legs, a pulsing dot on where they are, tap any city to jump to its day. City list underneath as the accessible twin. |
| **Hotels** | Each hotel with its photo gallery, dates, room type, blurb, driver card and Maps link. |
| **Show the driver** | Full-screen hotel name and city in the largest type in the app. |
| **Info** | Kensington expert's phone (tap to call), 24/7 support note, documents / dress / early-start / not-included checklists, home-screen install steps, offline status and version, print all 16 days, preview any date. |

Everything above works offline after the first visit and is covered by
`node --test` (date logic) and `node scripts/verify-cache.mjs` (precache
completeness). Photos are the quote's own, fetched by
`scripts/fetch-images.mjs` from the Kensington CDN with permission.

## Design decisions, and why

- **One time zone.** Vietnam, Cambodia and Thailand are all UTC+7, so
  "today" is unambiguous for the whole trip. The app never asks the phone
  what day it is; it asks what day it is in Bangkok.
- **No swipe-only navigation.** Research on older users (NN/g, Frontiers
  2026 review) puts "visible buttons over gestures" at the top of the list.
  Swipe and arrow keys work as a bonus; the buttons are always there.
- **Return to now.** Copied from TripIt's widget: once you have wandered to
  another day, a single yellow "Today" pill snaps you back.
- **Whole-trip precache, not on-demand.** Travefy caches only the days you
  opened while online; that is how a parent ends up with a blank screen in a
  hotel lobby. We save all 60 files (5 MB) on install.
- **Hotel card always one tap away.** Kensington's own app treats hotels,
  transfers and emergency contacts as first-class; so does this.
- **Photos at 1200px, JPEG, quality auto.** Sharp on a phone, 5 MB total.
- **No dependencies, no build.** Same approach as lucy-learns: plain ES
  modules, one service worker, GitHub Pages. Nothing to break in a year.

## Deploy and share

1. Push to GitHub, enable Pages (Source: GitHub Actions). The workflow
   publishes on every push to `main`.
2. Send the link to Mom, Dad, and the sisters with the two-step "Add to Home
   Screen" instructions from `docs/install-on-your-phone.md` (also under Info
   in the app).
3. To change anything after that: edit `js/itinerary.js`, bump
   `APP_VERSION`, push. Phones pick it up next time they open the app on
   Wi-Fi and show an "Update" toast.

## Before departure (things only you can fill in)

- **Hotel addresses and phone numbers** from the final Kensington travel
  documents, into `js/itinerary.js` `hotels[]`, so the driver card can show
  a street address and the Info page can list hotel phones.
- **Flight numbers and times** for the five internal flights, once ticketed.
- **The Kensington 24/7 local office number** from the documents.
- Confirm Day 3's title: the quote reuses "See the Signature Sights in
  Style"; the app calls it "Pottery Village & Street Food".

## Ideas for v2 (not built)

- **Daily postcard.** Parents tap "Send today's postcard", pick a photo, add
  one line; sisters get it. Needs a small backend or a shared album link.
- **Weather** for the current city (needs a signal; show only when online).
- **Hotel names in Vietnamese, Khmer and Thai** on the driver card.
- **Real map tiles** for the current city when online, with the offline
  sketch as the fallback.
- **Time-of-day awareness**: after 6 pm local, lead with tomorrow's plan.
