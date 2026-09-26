// Rendering and routing. Trip facts live in itinerary.js, date logic in
// clock.js; this file only turns them into screens.
//
// Routes: #/today  #/day/N  #/days  #/map  #/hotels  #/info  #/driver/SLUG  #/print
// `?date=YYYY-MM-DD` on the URL previews any day (see clock.resolveNow).

import { trip, days, hotels, essentials } from './itinerary.js';
import { cities, legs, outlines } from './places.js';
import * as clock from './clock.js';
import { APP_VERSION } from './version.js';

const TZ = trip.timeZone;
const LAST = days.length;
const view = document.getElementById('view');
const topStatus = document.getElementById('top-status');
const toast = document.getElementById('toast');
const viewerTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const previewing = new URLSearchParams(location.search).has('date');

const now = () => clock.resolveNow(location.search, TZ);
const status = () => clock.tripStatus(now(), trip, LAST);

// --- data helpers ----------------------------------------------------------

const HOTEL_PHOTOS = {
  'Oriental Jade Hotel': { slug: 'oriental-jade', n: 3, city: 'hanoi' },
  'Lyra Grandeur Cruise': { slug: 'lyra', n: 4, city: 'halong' },
  'Caravelle Saigon': { slug: 'caravelle', n: 5, city: 'hcmc' },
  'Jaya House River Park': { slug: 'jaya', n: 4, city: 'siemreap' },
  'Amanor Hotel Chiang Mai': { slug: 'amanor', n: 5, city: 'chiangmai' },
  'Avani+ Riverside Bangkok Hotel': { slug: 'avani', n: 5, city: 'bangkok' },
};
const hotelBySlug = (slug) => hotels.find((h) => HOTEL_PHOTOS[h.name].slug === slug);
const hotelPhotos = (name) => {
  const m = HOTEL_PHOTOS[name];
  return Array.from({ length: m.n }, (_, i) => `img/hotels/${m.slug}-${i + 1}.jpg`);
};
const dayImage = (n) => (n === LAST ? 'img/cover/chiang-mai-pagoda.jpg' : `img/days/d${String(n).padStart(2, '0')}.jpg`);
const cityOfDay = (n) => cities.find((c) => c.days.includes(n));
const mapsUrl = (name, city) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}`)}`;

const KIND = {
  arrive: { icon: 'i-flag', label: 'Arrival' },
  transfer: { icon: 'i-car', label: 'Transfer' },
  flight: { icon: 'i-plane', label: 'Flight' },
  tour: { icon: 'i-compass', label: 'Tour' },
  cruise: { icon: 'i-ship', label: 'On the water' },
  hotel: { icon: 'i-bed', label: 'Tonight' },
  depart: { icon: 'i-home', label: 'Home' },
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

function hoursOf(str) {
  if (!str) return 0;
  const h = /([\d.]+)\s*hr/.exec(str);
  const m = /(\d+)\s*min/.exec(str);
  return (h ? parseFloat(h[1]) : 0) + (m ? parseInt(m[1], 10) / 60 : 0);
}

function earlyStart(day) {
  const s = day.steps.find((st) => /^\d{1,2}:\d{2}\s*am$/i.test(st.time || ''));
  if (!s) return null;
  const hour = parseInt(s.time, 10);
  return hour < 8 ? s.time : null;
}

/** Badges are the "pay attention" layer: derived from the steps, never typed twice. */
function badgesFor(day) {
  const out = [];
  const early = earlyStart(day);
  if (early) out.push({ icon: 'i-alarm', text: `Early start · ${early}` });
  const flights = day.steps.filter((s) => s.kind === 'flight').length;
  if (flights >= 2) out.push({ icon: 'i-plane', text: `${flights === 2 ? 'Two' : flights} flights` });
  else if (flights === 1) out.push({ icon: 'i-plane', text: 'Flight day', calm: true });
  const prev = days[day.n - 2];
  if (prev && prev.country !== day.country) out.push({ icon: 'i-flag', text: `New country: ${day.country}` });
  const hrs = day.steps.filter((s) => s.kind !== 'hotel').reduce((a, s) => a + hoursOf(s.duration), 0);
  if (hrs >= 8 && !flights) out.push({ icon: 'i-sun', text: 'Long day out', calm: true });
  if (day.notes.some((n) => /dress|shoulders|shorts/i.test(n))) out.push({ icon: 'i-check', text: 'Dress code today', calm: true });
  return out;
}
const badgesHtml = (list) => list.length
  ? `<div class="badges">${list.map((b) => `<span class="badge${b.calm ? ' badge--calm' : ''}">${icon(b.icon)}${esc(b.text)}</span>`).join('')}</div>`
  : '';

function nightOf(day) {
  if (!day.hotel) return null;
  let i = day.n - 1; let n = 0;
  while (i >= 0 && days[i].hotel?.name === day.hotel.name) { n++; i--; }
  return { n, of: day.hotel.nights };
}

function weekdayInZone(d, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(d);
}

// --- shared pieces ---------------------------------------------------------

function hotelCard(day, { title = 'Tonight' } = {}) {
  if (!day.hotel) {
    return `<section class="card card--muted"><div class="card__title">Tonight</div>
      <p class="lead"><strong>Flying home.</strong> Check out of ${esc(days[day.n - 2].hotel.name)} this morning.</p></section>`;
  }
  const h = hotels.find((x) => x.name === day.hotel.name);
  const meta = HOTEL_PHOTOS[h.name];
  const city = cities.find((c) => c.id === meta.city);
  const night = nightOf(day);
  return `<section class="card">
    <div class="card__title">${esc(title)}</div>
    <div class="hotel">
      <img class="hotel__img" src="${hotelPhotos(h.name)[0]}" alt="">
      <div class="hotel__body">
        <h3 class="h3">${esc(h.name)}</h3>
        <p class="muted">${esc(day.hotel.room)}</p>
        <p class="meta">${esc(city.name)} · Night ${night.n} of ${night.of}</p>
      </div>
      <div class="btn-row">
        <a class="btn" href="#/driver/${meta.slug}">${icon('i-car')} Show the driver</a>
        <a class="btn btn--ghost" href="${mapsUrl(h.name, city.name)}" target="_blank" rel="noopener">${icon('i-pin')} Open in Maps</a>
      </div>
    </div>
  </section>`;
}

function timelineHtml(day) {
  const steps = day.steps.filter((s) => s.kind !== 'hotel');
  return `<ol class="timeline">${steps.map((s) => {
    const k = KIND[s.kind];
    const early = s.time && /am$/i.test(s.time) && parseInt(s.time, 10) < 8;
    return `<li class="step">
      <div class="step__icon${early ? ' step__icon--accent' : ''}">${icon(k.icon)}</div>
      <div class="step__body">
        <div class="step__kind"><span>${esc(k.label)}</span>${s.time ? `<span class="step__time">${esc(s.time)}</span>` : ''}${s.duration ? `<span>${esc(s.duration)}</span>` : ''}</div>
        <div class="step__title">${esc(s.title)}</div>
        ${s.detail ? `<div class="step__detail">${esc(s.detail)}</div>` : ''}
      </div>
    </li>`;
  }).join('')}</ol>`;
}

function notesHtml(day) {
  if (!day.notes.length) return '';
  return `<section class="card card--accent"><div class="card__title">Good to know</div>
    <ul class="notes">${day.notes.map((n) => `<li>${icon('i-check')}<span>${esc(n)}</span></li>`).join('')}</ul></section>`;
}

function heroHtml(day, { isToday }) {
  return `<section class="hero">
    <img class="hero__img" src="${dayImage(day.n)}" alt="">
    <div class="hero__body">
      <div class="hero__kicker">
        ${isToday ? `<span class="pill pill--today">${icon('i-sun')} Today</span>` : ''}
        <span class="pill">Day ${day.n} of ${LAST}</span>
        <span>${esc(clock.longDate(day.date))}</span>
      </div>
      <h1 class="hero__title">${esc(day.title)}</h1>
      <p class="hero__sub">${esc(day.route || day.place)}${day.route ? '' : `, ${esc(day.country)}`}</p>
    </div>
  </section>`;
}

function nowLine() {
  const t = now();
  let text = `It's ${clock.timeInZone(t, TZ)} ${weekdayInZone(t, TZ)} in ${esc(cityOfDay(status().day).name)}`;
  const here = clock.timeInZone(t, viewerTZ);
  if (viewerTZ !== TZ && here !== clock.timeInZone(t, TZ)) {
    text += ` <span class="muted">· ${here} for you</span>`;
  }
  return `<div class="now" id="now-line">${icon('i-alarm')}<span class="now__time">${text}</span></div>`;
}

// --- screens ---------------------------------------------------------------

function renderDay(n) {
  const day = days[n - 1];
  const st = status();
  const isToday = st.phase === 'during' && st.day === n;
  const tomorrow = days[n];
  const tomorrowEarly = tomorrow && earlyStart(tomorrow);
  const bodyText = day.body.map((p) => `<p>${esc(p)}</p>`).join('');

  view.innerHTML = `
    <nav class="daybar" aria-label="Day navigation">
      <a class="daybar__btn" href="#/day/${n - 1}" ${n === 1 ? 'aria-disabled="true"' : ''} aria-label="Previous day">${icon('i-left')}<span>Day ${n - 1 || 1}</span></a>
      <div class="daybar__mid">
        <span class="daybar__label">${esc(clock.shortDate(day.date))}</span>
        ${!isToday && st.phase === 'during' ? `<a class="daybar__today" href="#/today">${icon('i-sun')} Today</a>` : ''}
      </div>
      <a class="daybar__btn" href="#/day/${n + 1}" ${n === LAST ? 'aria-disabled="true"' : ''} aria-label="Next day"><span>Day ${Math.min(n + 1, LAST)}</span>${icon('i-right')}</a>
    </nav>
    ${heroHtml(day, { isToday })}
    ${isToday ? nowLine() : ''}
    ${badgesHtml(badgesFor(day))}
    <section class="card"><div class="card__title">${isToday ? "Today's plan" : 'The plan'}</div>${timelineHtml(day)}</section>
    ${hotelCard(day)}
    ${notesHtml(day)}
    <section class="card"><div class="card__title">About the day</div><div class="prose">${bodyText}</div></section>
    ${tomorrow ? `<a class="card peek" href="#/day/${n + 1}">
        <img class="peek__img" src="${dayImage(n + 1)}" alt="">
        <div class="peek__body">
          <div class="card__title" style="margin:0">${isToday ? 'Tomorrow' : 'Next'} · ${esc(clock.shortDate(tomorrow.date))}</div>
          <div class="h3">${esc(tomorrow.title)}</div>
          <div class="meta">${esc(tomorrow.route || tomorrow.place)}${tomorrowEarly ? ` · <strong>${esc(tomorrowEarly)} start</strong>` : ''}</div>
        </div>${icon('i-right')}</a>`
      : `<section class="card card--muted"><p class="lead"><strong>That's the whole trip.</strong> Safe travels home.</p></section>`}
    <div class="btn-row">
      ${n > 1 ? `<a class="btn btn--ghost" href="#/day/${n - 1}">${icon('i-left')} Day ${n - 1}</a>` : ''}
      ${n < LAST ? `<a class="btn" href="#/day/${n + 1}">Day ${n + 1} ${icon('i-right')}</a>` : ''}
    </div>`;
}

function renderToday() {
  const st = status();
  if (st.phase === 'during') return renderDay(st.day);
  const d1 = days[0];
  if (st.phase === 'before') {
    view.innerHTML = `
      <section class="hero">
        <img class="hero__img" src="img/cover/halong-junk.jpg" alt="">
        <div class="hero__body">
          <div class="hero__kicker"><span class="pill">${esc(trip.name)}</span></div>
          <h1 class="hero__title">${esc(clock.shortDate(trip.start, false))} to ${esc(clock.shortDate(trip.end, false))}, 2027</h1>
          <p class="hero__sub">16 days · 6 stops · 3 countries</p>
        </div>
      </section>
      <section class="card count">
        <div class="count__num">${st.daysUntil}</div>
        <div class="lead">${st.daysUntil === 1 ? 'day' : 'days'} to go</div>
        <p class="muted">Day 1 is ${esc(clock.longDate(d1.date))}: arrive in Hanoi.</p>
      </section>
      <a class="card peek" href="#/day/1">
        <img class="peek__img" src="${dayImage(1)}" alt="">
        <div class="peek__body"><div class="card__title" style="margin:0">Day 1 preview</div><div class="h3">${esc(d1.title)}</div><div class="meta">${esc(d1.place)}, ${esc(d1.country)}</div></div>${icon('i-right')}</a>
      <section class="card"><div class="card__title">Before you go</div>
        <ul class="check">${essentials[0].items.map((i) => `<li>${icon('i-check')}<span>${esc(i)}</span></li>`).join('')}</ul>
        <p class="meta" style="margin-top:var(--sp-3)">More under <a href="#/info">Info</a>. Once the trip starts, this screen becomes today's plan.</p>
      </section>`;
    return;
  }
  view.innerHTML = `
    <section class="hero">
      <img class="hero__img" src="img/cover/angkor.jpg" alt="">
      <div class="hero__body"><div class="hero__kicker"><span class="pill">${esc(trip.name)}</span></div>
        <h1 class="hero__title">Welcome home</h1><p class="hero__sub">16 days, 6 stops, 3 countries. Look back any time.</p></div>
    </section>
    <a class="btn btn--lg btn--block" href="#/days">${icon('i-list')} Relive the trip, day by day</a>`;
}

function renderDays() {
  const st = status();
  const groups = [];
  for (const d of days) {
    const g = groups.at(-1);
    if (g && g.place === d.place) g.days.push(d); else groups.push({ place: d.place, country: d.country, days: [d] });
  }
  view.innerHTML = `<h1 class="h1">All 16 days</h1>${groups.map((g) => `
    <section class="city-group">
      <div class="city-group__head"><h2 class="h2">${esc(g.place)}</h2><span class="meta">${esc(g.country)} · ${esc(clock.shortDate(g.days[0].date, false))}${g.days.length > 1 ? ` – ${esc(clock.shortDate(g.days.at(-1).date, false))}` : ''}</span></div>
      ${g.days.map((d) => {
        const isToday = st.phase === 'during' && st.day === d.n;
        const past = st.phase === 'after' || (st.phase === 'during' && d.n < st.day);
        const early = earlyStart(d);
        return `<a class="dayrow${isToday ? ' dayrow--today' : ''}${past ? ' dayrow--past' : ''}" href="#/day/${d.n}">
          <img class="dayrow__img" src="${dayImage(d.n)}" alt="">
          <div class="dayrow__body">
            <div class="meta">${isToday ? '<strong>Today · </strong>' : ''}Day ${d.n} · ${esc(clock.shortDate(d.date))}</div>
            <div class="dayrow__title">${esc(d.title)}</div>
            <div class="meta">${esc(d.route || d.place)}${early ? ` · <strong>${esc(early)} start</strong>` : ''}</div>
          </div>${icon('i-right')}</a>`;
      }).join('')}
    </section>`).join('')}`;
}

// --- map ---------------------------------------------------------------------

const LON0 = 97; const LON1 = 111; const LAT1 = 23.5; const K = 360 / (LON1 - LON0);
const px = (lon) => (lon - LON0) * K;
const py = (lat) => (LAT1 - lat) * K;
const MAP_H = py(5.5);
const LABELS = { hanoi: [-10, -14, 'end'], halong: [8, 18, 'start'], hcmc: [-12, 6, 'end'], siemreap: [-12, -12, 'end'], chiangmai: [12, 2, 'start'], bangkok: [-12, 16, 'end'] };
const COUNTRY_LABELS = [['THAILAND', 15.6, 100.4], ['CAMBODIA', 11.7, 105.3], ['LAOS', 19.4, 102.5], ['VIETNAM', 15.6, 110.6, 'end']];

function renderMap() {
  const st = status();
  const here = st.phase === 'during' ? cityOfDay(st.day) : null;
  const land = Object.values(outlines).map((ring) => `<path class="map__land" d="M${ring.map(([la, lo]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join('L')}Z"/>`).join('');
  const byId = Object.fromEntries(cities.map((c) => [c.id, c]));
  const legPaths = legs.map((l) => {
    const a = byId[l.from]; const b = byId[l.to];
    const x1 = px(a.lon); const y1 = py(a.lat); const x2 = px(b.lon); const y2 = py(b.lat);
    if (l.mode !== 'air') return `<path class="map__leg" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2; const dx = x2 - x1; const dy = y2 - y1;
    const len = Math.hypot(dx, dy); const cx = mx - dy / len * len * 0.18; const cy = my + dx / len * len * 0.18;
    return `<path class="map__leg map__leg--air" d="M${x1} ${y1}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}"/>`;
  }).join('');
  const markers = cities.map((c, i) => {
    const [dx, dy, anchor] = LABELS[c.id];
    const x = px(c.lon); const y = py(c.lat);
    const isHere = here && here.id === c.id;
    const target = isHere ? st.day : c.days[0];
    return `<a class="map__city${isHere ? ' map__city--here' : ''}" href="#/day/${target}" aria-label="${esc(c.name)}, days ${c.days[0]} to ${c.days.at(-1)}">
      <circle class="map__hit" cx="${x}" cy="${y}" r="24"/>
      ${isHere ? `<circle class="map__pulse" cx="${x}" cy="${y}" r="9"/>` : ''}
      <circle cx="${x}" cy="${y}" r="${isHere ? 8 : 6.5}"/>
      <text x="${x + dx}" y="${y + dy + 4}" text-anchor="${anchor}">${esc(c.name)}</text>
    </a>`;
  }).join('');
  const countryLabels = COUNTRY_LABELS.map(([t, la, lo, an]) => `<text class="map__label" x="${px(lo)}" y="${py(la)}" text-anchor="${an || 'middle'}">${t}</text>`).join('');

  view.innerHTML = `
    <h1 class="h1">The route</h1>
    ${here ? `<div class="now">${icon('i-pin')}<span><strong>Day ${st.day}:</strong> Mom &amp; Dad are in ${esc(here.name)}, ${esc(here.country)}.</span></div>`
      : st.phase === 'before' ? `<div class="now">${icon('i-pin')}<span>The trip starts in Hanoi on ${esc(clock.shortDate(trip.start))}.</span></div>` : ''}
    <svg class="map" viewBox="0 0 360 ${MAP_H.toFixed(0)}" role="img" aria-label="Route map: Hanoi, Halong Bay, Ho Chi Minh City, Siem Reap, Chiang Mai, Bangkok">
      ${land}${countryLabels}${legPaths}${markers}
    </svg>
    <div class="legend"><span><i></i> Road or boat</span><span><i class="air"></i> Flight</span>${here ? '<span><b></b> They are here</span>' : ''}</div>
    <ol class="citylist">${cities.map((c, i) => `<li><a class="cityrow${here && here.id === c.id ? ' cityrow--here' : ''}" href="#/day/${here && here.id === c.id ? st.day : c.days[0]}">
        <span class="cityrow__n">${i + 1}</span>
        <span><strong>${esc(c.name)}</strong><br><span class="meta">Days ${c.days[0]}${c.days.length > 1 ? `–${c.days.at(-1)}` : ''} · ${esc(c.hotel)}</span></span>
        ${icon('i-right')}</a></li>`).join('')}</ol>
    <p class="meta">The map is a sketch for orientation, not for navigation. "Open in Maps" on any hotel gives real directions when you have a signal.</p>`;
}

function renderHotels() {
  view.innerHTML = `<h1 class="h1">Where you're staying</h1>${hotels.map((h) => {
    const meta = HOTEL_PHOTOS[h.name];
    const city = cities.find((c) => c.id === meta.city);
    const first = days[h.days[0] - 1]; const last = days[h.days.at(-1) - 1];
    const photos = hotelPhotos(h.name);
    return `<section class="card stack">
      <div class="gallery" aria-label="${esc(h.name)} photos">${photos.map((p) => `<img src="${p}" alt="" loading="lazy">`).join('')}</div>
      ${photos.length > 1 ? `<div class="gallery__hint">${photos.length} photos · slide sideways</div>` : ''}
      <h2 class="h2">${esc(h.name)}</h2>
      <p class="meta">${esc(city.name)}, ${esc(city.country)} · Days ${h.days[0]}–${h.days.at(-1)} · ${esc(clock.shortDate(first.date))} to ${esc(clock.shortDate(last.date))} · ${first.hotel.nights} night${first.hotel.nights > 1 ? 's' : ''}</p>
      <p><strong>${esc(first.hotel.room)}</strong></p>
      <p class="muted">${esc(h.blurb)}</p>
      <div class="btn-row">
        <a class="btn" href="#/driver/${meta.slug}">${icon('i-car')} Show the driver</a>
        <a class="btn btn--ghost" href="${mapsUrl(h.name, city.name)}" target="_blank" rel="noopener">${icon('i-pin')} Open in Maps</a>
      </div>
    </section>`;
  }).join('')}`;
}

function renderDriver(slug) {
  const h = hotelBySlug(slug);
  if (!h) return renderHotels();
  const city = cities.find((c) => c.id === HOTEL_PHOTOS[h.name].city);
  view.innerHTML = `<div class="driver">
    <div><a class="btn btn--ghost" href="#/today" onclick="history.length > 1 && (event.preventDefault(), history.back())">${icon('i-left')} Back</a></div>
    <div class="driver__main">
      <p class="lead muted">Please take us to</p>
      <h1 class="driver__name">${esc(h.name)}</h1>
      <p class="driver__city">${esc(city.name)}, ${esc(city.country)}</p>
    </div>
    <a class="btn btn--lg btn--block" href="${mapsUrl(h.name, city.name)}" target="_blank" rel="noopener">${icon('i-pin')} Open in Maps</a>
  </div>`;
}

function renderInfo() {
  const st = status();
  const t = now();
  const standing = st.phase === 'before' ? `${st.daysUntil} days until Day 1.`
    : st.phase === 'during' ? `Day ${st.day} of ${LAST}: ${esc(cityOfDay(st.day).name)}.` : 'The trip is over. Welcome home.';
  const saved = navigator.serviceWorker?.controller ? 'Saved on this phone: works without Wi-Fi or data.' : 'Saving to this phone… open once more on Wi-Fi to finish.';
  const tel = trip.operator.phone.replace(/\D/g, '').replace(/4144$/, '');
  view.innerHTML = `
    <h1 class="h1">Info &amp; help</h1>
    <section class="card">
      <div class="card__title">Help, any time</div>
      <ul class="kv">
        <li><b>Your Kensington expert</b><span>${esc(trip.operator.expert)}</span><a class="tel" href="tel:+1${tel}">${icon('i-phone')} ${esc(trip.operator.phone)}</a></li>
        <li><b>24/7 in-destination support</b><span>${esc(trip.operator.note)}</span></li>
      </ul>
    </section>
    <section class="card card--muted">
      <div class="card__title">Right now</div>
      <p class="lead">${standing}</p>
      <p>It's ${clock.timeInZone(t, TZ)} on ${weekdayInZone(t, TZ)} there.${viewerTZ !== TZ ? ` Everything in this guide is in local time (UTC+7).` : ''}</p>
      <p class="meta">${saved} Version ${APP_VERSION}.</p>
    </section>
    ${essentials.map((e) => `<section class="card"><div class="card__title">${esc(e.heading)}</div>
      <ul class="check">${e.items.map((i) => `<li>${icon('i-check')}<span>${esc(i)}</span></li>`).join('')}</ul></section>`).join('')}
    <section class="card">
      <div class="card__title">Put it on your home screen</div>
      <p><strong>iPhone:</strong> open this page in Safari, tap Share, then <em>Add to Home Screen</em>.</p>
      <p><strong>Android:</strong> open in Chrome, tap the three dots, then <em>Add to Home screen</em>.</p>
      <p class="meta">Do it once on Wi-Fi. After that it opens like an app and works anywhere.</p>
    </section>
    <section class="card">
      <div class="card__title">Print or preview</div>
      <div class="btn-row">
        <a class="btn btn--ghost" href="#/print">Print all 16 days</a>
      </div>
      <form class="field" id="preview-form" style="margin-top:var(--sp-4)">
        <label for="preview-date">Preview the guide on a date</label>
        <input id="preview-date" type="date" min="${trip.start}" max="${clock.addDays(trip.end, 1)}" value="${st.phase === 'during' ? st.today : trip.start}">
        <div class="btn-row"><button class="btn btn--ghost" type="submit">Preview that day</button>
        ${previewing ? `<a class="btn" href="${location.pathname}#/today">Back to the real today</a>` : ''}</div>
      </form>
    </section>
    <p class="meta">Photos courtesy of Kensington Tours. Built with love for Mom &amp; Dad.</p>`;
  document.getElementById('preview-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = document.getElementById('preview-date').value;
    if (v) location.href = `${location.pathname}?date=${v}#/today`;
  });
}

function renderPrint() {
  view.innerHTML = `<h1 class="h1">${esc(trip.name)}: every day</h1>${days.map((d) => `
    <section class="print-day stack">
      ${heroHtml(d, { isToday: false })}
      ${badgesHtml(badgesFor(d))}
      <section class="card"><div class="card__title">The plan</div>${timelineHtml(d)}</section>
      ${hotelCard(d)}
      ${notesHtml(d)}
      <section class="card"><div class="prose">${d.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div></section>
    </section>`).join('')}`;
  setTimeout(() => window.print(), 400);
}

// --- router ----------------------------------------------------------------

function route() {
  const hash = location.hash || '#/today';
  const [, section = 'today', arg] = hash.split('/');
  let tab = section;
  switch (section) {
    case 'day': {
      const n = Math.min(LAST, Math.max(1, parseInt(arg, 10) || 1));
      renderDay(n); tab = 'today'; break;
    }
    case 'days': renderDays(); break;
    case 'map': renderMap(); break;
    case 'hotels': renderHotels(); break;
    case 'info': renderInfo(); break;
    case 'driver': renderDriver(arg); tab = 'hotels'; break;
    case 'print': renderPrint(); tab = 'days'; break;
    default: renderToday(); tab = 'today';
  }
  document.querySelectorAll('.tabs a').forEach((a) => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  updateTopStatus();
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
}

function updateTopStatus() {
  const st = status();
  topStatus.textContent = previewing ? `Preview: ${clock.shortDate(st.today, false)}`
    : st.phase === 'before' ? `${st.daysUntil} days to go`
    : st.phase === 'during' ? `Day ${st.day} of ${LAST}` : 'Welcome home';
}

window.addEventListener('hashchange', route);
route();

// Keep the clock honest without a reload: refresh the "It's 7:42 pm" line
// every half minute, and when the phone wakes up on a new day, go to it.
let lastSeen = Date.now();
setInterval(() => {
  const line = document.getElementById('now-line');
  if (line) line.outerHTML = nowLine();
  updateTopStatus();
}, 30_000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { lastSeen = Date.now(); return; }
  const away = Date.now() - lastSeen;
  const onDay = /^#\/(today|day)/.test(location.hash) || !location.hash;
  if (onDay && away > 3 * 3_600_000) location.hash = '#/today';
  route();
});

// Swipe is a bonus on the day screen, never the only way: the buttons stay.
let touchX = null; let touchY = null;
view.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
view.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX; const dy = e.changedTouches[0].clientY - touchY;
  touchX = null;
  const m = /^#\/day\/(\d+)/.exec(location.hash) || (/^#\/today|^$/.test(location.hash) && status().phase === 'during' ? [null, status().day] : null);
  if (!m || Math.abs(dx) < 80 || Math.abs(dy) > 60) return;
  const n = parseInt(m[1], 10);
  if (dx < 0 && n < LAST) location.hash = `#/day/${n + 1}`;
  if (dx > 0 && n > 1) location.hash = `#/day/${n - 1}`;
}, { passive: true });
document.addEventListener('keydown', (e) => {
  const m = /^#\/day\/(\d+)/.exec(location.hash);
  if (!m || e.target.tagName === 'INPUT') return;
  const n = parseInt(m[1], 10);
  if (e.key === 'ArrowRight' && n < LAST) location.hash = `#/day/${n + 1}`;
  if (e.key === 'ArrowLeft' && n > 1) location.hash = `#/day/${n - 1}`;
});

// --- offline ---------------------------------------------------------------

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`).then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          showToast('A newer version of the guide is ready.', 'Update', () => { w.postMessage('skipWaiting'); });
        }
      });
    });
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloading) { reloading = true; location.reload(); } });
}

function showToast(text, action, onAction) {
  toast.innerHTML = `<span>${esc(text)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  toast.hidden = false;
  toast.querySelector('button')?.addEventListener('click', () => { toast.hidden = true; onAction?.(); });
  if (!action) setTimeout(() => { toast.hidden = true; }, 4000);
}
