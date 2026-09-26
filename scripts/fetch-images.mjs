// Downloads the trip photos from the Kensington Tours quote page into img/.
// The list is the source of truth for where every picture came from: each
// path is a Cloudinary public id read from the quote's own API response
// (clients.kensingtontours.com/api/client-quotes/get/4976169Hic2).
//
//   node scripts/fetch-images.mjs          fetch anything missing
//   node scripts/fetch-images.mjs --force  refetch everything
//
// Photos are the property of Kensington Tours and its partners; Adam has
// permission to use them in this private family app.

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

// 1000px wide is sharp on a 2x phone and about a third smaller than 1200px.
const CDN = 'https://media.kensingtontours.com/image/upload/q_auto:good,f_jpg,w_1000,c_limit/';

export const images = [
  // --- covers (from the quote's summary strip) ---
  ['cover/halong-junk.jpg', 'kt/live/pictures/asia/southeast-asia/southeast-asia/itinerary/southeast-asia-grand-journey/sunset-junk-boat-halong-bay-quang-ninh-vietnam-tours'],
  ['cover/hanoi-raft.jpg', 'kt/live/pictures/asia/southeast-asia/southeast-asia/itinerary/southeast-asia-grand-journey/woman-traditional-bamboo-raft-hanoi-vietnam-tours'],
  ['cover/chiang-mai-pagoda.jpg', 'kt/live/pictures/global-country/global-location/brand-approved-images/locale/sunset-pagoda-inthanon-mountain-chiang-mai-thailand-tours'],
  ['cover/angkor.jpg', 'kt/live/pictures/asia/southeast-asia/southeast-asia/itinerary/vietnam--cambodia-signature/angkor-wat-cambodia-asia-tours'],

  // --- one hero per day ---
  ['days/d01.jpg', 'kt-custom/live/pictures/quote/sd/20477481/customservice/px-1'],
  ['days/d02.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/hanoi/service/service_34917/military-history-museum'],
  ['days/d03.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/hanoi/service/service_2703/bat-trang-pottery'],
  ['days/d04.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/exterior-capella-cruise-halong-bay-vietnam-tours'],
  ['days/d05.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/pool-capella-cruise-halong-bay-vietnam-tours'],
  ['days/d06.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle/ho-chi-minh-city-caravelle'],
  ['days/d07.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/service/service_3262/floating-market-'],
  ['days/d08.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/hotel/jaya-house-riverpark/jaya-house-river-park'],
  ['days/d09.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/service/service_55732/sunrise-angkor-wat-siem-reap-cambodia-tours'],
  ['days/d09b.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/service/service_38635/angkor-wat-temple'],
  ['days/d10.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/angkor-ban/locale/cambodia-angkor-wat-gettyimages-540432879'],
  ['days/d10b.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/service/service_76911/sunset-chnnea-chivit-siem-reap-cambodia-tours'],
  ['days/d11.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/amanor-hotels-chiang-mai-thailand-tours'],
  ['days/d12.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/service/service_49858/asian-elephant-chiang-mai-thailand-tours'],
  ['days/d13.jpg', 'kt/live/pictures/asia/southeast-asia/thailand/chiang-mai/service/service_40075/doi-suthep'],
  ['days/d14.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
  ['days/d15.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/locale/wat-pho-temple'],
  // Day 16 has no photo on the quote; reuse the summary pagoda sunset.

  // --- hotel galleries ---
  ['hotels/oriental-jade-1.jpg', 'kt-custom/live/pictures/quote/sd/20477481/customservice/px-1'],
  ['hotels/oriental-jade-2.jpg', 'kt-custom/live/pictures/quote/sd/20477481/customservice/sd-1'],
  ['hotels/oriental-jade-3.jpg', 'kt-custom/live/pictures/quote/sd/20477481/customservice/0'],
  ['hotels/lyra-1.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/exterior-capella-cruise-halong-bay-vietnam-tours'],
  ['hotels/lyra-2.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/pool-capella-cruise-halong-bay-vietnam-tours'],
  ['hotels/lyra-3.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/spa-capella-cruise-halong-bay-vietnam-tours'],
  ['hotels/lyra-4.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/halong-bay/hotel/capella-cruise/restaurant-capella-cruise-halong-bay-vietnam-tours'],
  ['hotels/caravelle-1.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle/ho-chi-minh-city-caravelle'],
  ['hotels/caravelle-2.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle/lobby'],
  ['hotels/caravelle-3.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle-saigon/swimming-pool-caravelle-hotel-ho-chi-minh-city-vietnam-tours'],
  ['hotels/caravelle-4.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle-saigon/dining-caravelle-hotel-ho-chi-minh-city-vietnam-tours'],
  ['hotels/caravelle-5.jpg', 'kt/live/pictures/asia/southeast-asia/vietnam/ho-chi-minh-city/hotel/caravelle/signature-room-caravelle-hotel-ho-chi-minh-city-vietnam-tours'],
  ['hotels/jaya-1.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/hotel/jaya-house-riverpark/jaya-house-river-park'],
  ['hotels/jaya-2.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/hotel/jaya-house-riverpark/jaya-house-riverpark-pool-siem-reap-cambodia-tours'],
  ['hotels/jaya-3.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/hotel/jaya-house-riverpark/jaya-house-riverpark-dining-siem-reap-cambodia-tours'],
  ['hotels/jaya-4.jpg', 'kt/live/pictures/asia/southeast-asia/cambodia/siem-reap/hotel/jaya-house-riverpark/jaya-house-riverpark-deluxe-room-siem-reap-cambodia-tours'],
  ['hotels/amanor-1.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/amanor-hotels-chiang-mai-thailand-tours'],
  ['hotels/amanor-2.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/imgi_29_rise'],
  ['hotels/amanor-3.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/rooftopa-amanor-hotels-chiang-mai-thailand-tours'],
  ['hotels/amanor-4.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/dining-amanor-hotels-chiang-mai-thailand-tours'],
  ['hotels/amanor-5.jpg', 'kt/live/pictures/asia/thailand/thailand/chiang-mai/hotel/amanor-hotel-chiang-mai/manor-suite-amanor-hotels-chiang-mai-thailand-tours'],
  ['hotels/avani-1.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
  ['hotels/avani-2.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/swimmingpool-avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
  ['hotels/avani-3.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/rooftop-lounge-avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
  ['hotels/avani-4.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/dining-avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
  ['hotels/avani-5.jpg', 'kt/live/pictures/asia/thailand/thailand/bangkok/hotel/avani+-riverside-bangkok-hotel/avani-panorama-river-view-room-avani-riverside-bangkok-hotel-bangkok-thailand-tours'],
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes('--force');
  let total = 0;
  for (const [local, path] of images) {
    const dest = `img/${local}`;
    if (!force) {
      try { const s = await stat(dest); if (s.size > 0) { total += s.size; continue; } } catch {}
    }
    const res = await fetch(CDN + path);
    if (!res.ok) { console.error(`FAIL ${res.status} ${dest}`); process.exitCode = 1; continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    total += buf.length;
    console.log(`${dest}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
  console.log(`total ${(total / 1024 / 1024).toFixed(1)} MB across ${images.length} images`);
}
