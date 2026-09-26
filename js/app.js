// Rendering and routing. Trip facts live in itinerary.js, date logic in
// clock.js; this file only turns them into screens.
//
// Routes: #/today  #/day/N  #/days  #/map  #/hotels  #/info  #/driver/SLUG  #/print
// `?date=YYYY-MM-DD` on the URL previews any day (see clock.resolveNow).

import { trip, days, hotels, essentials, photoAlts } from './itinerary.js';
import { cities, legs, outlines, photoOffsets, photoOffsetsLarge } from './places.js';
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
const dayAlt = (n) => photoAlts.days[n] || '';
const hotelAlts = (name) => photoAlts.hotels[HOTEL_PHOTOS[name].slug] || [];
const cityAlt = (c) => { const key = c.photo.split('/').pop().replace('.jpg', ''); return photoAlts.covers[key] || dayAlt(parseInt(key.replace(/\D/g, ''), 10)) || c.name; };
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
  ? `<div class="badges o-badges">${list.map((b) => `<span class="badge${b.calm ? ' badge--calm' : ''}">${icon(b.icon)}${esc(b.text)}</span>`).join('')}</div>`
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
    return `<section class="card card--muted o-hotel"><h2 class="card__title">Tonight</h2>
      <p class="lead"><strong>Flying home.</strong> Check out of ${esc(days[day.n - 2].hotel.name)} this morning.</p></section>`;
  }
  const h = hotels.find((x) => x.name === day.hotel.name);
  const meta = HOTEL_PHOTOS[h.name];
  const city = cities.find((c) => c.id === meta.city);
  const night = nightOf(day);
  return `<section class="card o-hotel">
    <h2 class="card__title">${esc(title)}</h2>
    <div class="hotel">
      <img class="hotel__img" src="${hotelPhotos(h.name)[0]}" alt="${esc(hotelAlts(h.name)[0] || h.name)}" decoding="async">
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
  return `<section class="card card--accent o-notes"><h2 class="card__title">Good to know</h2>
    <ul class="notes">${day.notes.map((n) => `<li>${icon('i-check')}<span>${esc(n)}</span></li>`).join('')}</ul></section>`;
}

function heroHtml(day, { isToday }) {
  return `<section class="hero">
    <img class="hero__img" src="${dayImage(day.n)}" alt="${esc(dayAlt(day.n))}" decoding="async">
    <div class="hero__body">
      <div class="hero__kicker">
        ${isToday ? `<span class="pill pill--today">${icon('i-sun')} Today</span>` : ''}
        <span class="pill">Day ${day.n} of ${LAST}</span>
        <span class="pill pill--plain">${esc(clock.longDate(day.date))}</span>
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
  return `<div class="now o-now" id="now-line">${icon('i-alarm')}<span class="now__time">${text}</span></div>`;
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
      <a class="daybar__btn" href="#/day/${n - 1}" ${n === 1 ? 'aria-disabled="true"' : ''} aria-label="${isToday ? 'Yesterday' : `Day ${n - 1 || 1}`}">${icon('i-left')}<span>${isToday ? 'Yesterday' : `Day ${n - 1 || 1}`}</span></a>
      <div class="daybar__mid">
        <span class="daybar__label">Day ${n} of ${LAST}</span>
        ${!isToday && st.phase === 'during' ? `<a class="daybar__today" href="#/today">${icon('i-sun')} Today</a>` : ''}
      </div>
      <a class="daybar__btn" href="#/day/${n + 1}" ${n === LAST ? 'aria-disabled="true"' : ''} aria-label="${isToday ? 'Tomorrow' : `Day ${Math.min(n + 1, LAST)}`}"><span>${isToday ? 'Tomorrow' : `Day ${Math.min(n + 1, LAST)}`}</span>${icon('i-right')}</a>
      <div class="progress" role="img" aria-label="Day ${n} of ${LAST}${st.phase === 'during' ? `, today is day ${st.day}` : ''}">${days.map((d) => {
        const past = st.phase === 'after' || (st.phase === 'during' && d.n < st.day);
        const cls = ['progress__seg', past ? 'progress__seg--past' : '', st.phase === 'during' && d.n === st.day ? 'progress__seg--today' : '', d.n === n ? 'progress__seg--viewing' : ''].filter(Boolean).join(' ');
        return `<span class="${cls}"></span>`;
      }).join('')}</div>
    </nav>
    ${heroHtml(day, { isToday })}
    <div class="cols">
      <div class="col col--main">
        <section class="card o-plan"><h2 class="card__title">${isToday ? "Today's plan" : 'The plan'}</h2>${timelineHtml(day)}</section>
        <section class="card o-about"><h2 class="card__title">About the day</h2><div class="prose">${bodyText}</div></section>
      </div>
      <div class="col col--side">
        ${isToday ? nowLine() : ''}
        ${badgesHtml(badgesFor(day))}
        ${hotelCard(day)}
        ${notesHtml(day)}
        ${tomorrow ? `<a class="card peek o-peek" href="#/day/${n + 1}">
            <img class="peek__img" src="${dayImage(n + 1)}" alt="${esc(dayAlt(n + 1))}" decoding="async">
            <div class="peek__body">
              <div class="card__title" style="margin:0">${isToday ? 'Tomorrow' : 'Next'} · ${esc(clock.shortDate(tomorrow.date))}</div>
              <div class="h3">${esc(tomorrow.title)}</div>
              <div class="meta">${esc(tomorrow.route || tomorrow.place)}${tomorrowEarly ? ` · <strong>${esc(tomorrowEarly)} start</strong>` : ''}</div>
            </div>${icon('i-right')}</a>`
          : `<section class="card card--muted o-peek"><p class="lead"><strong>That's the whole trip.</strong> Safe travels home.</p></section>`}
      </div>
    </div>
    <div class="btn-row o-nav">
      ${n > 1 ? `<a class="btn btn--ghost" href="#/day/${n - 1}">${icon('i-left')} ${isToday ? 'Yesterday' : `Day ${n - 1}`}</a>` : ''}
      ${n < LAST ? `<a class="btn" href="#/day/${n + 1}">${isToday ? 'Tomorrow' : `Day ${n + 1}`} ${icon('i-right')}</a>` : ''}
    </div>`;
}

function renderToday() {
  const st = status();
  if (st.phase === 'during') return renderDay(st.day);
  const d1 = days[0];
  if (st.phase === 'before') {
    view.innerHTML = `
      <section class="hero hero--map">
        <div class="hero__band">
          <img class="hero__img" src="img/cover/halong-junk.jpg" alt="${esc(photoAlts.covers['halong-junk'])}" decoding="async">
          <div class="hero__band-body">
            <div class="hero__kicker"><span class="pill">${esc(trip.name)}</span></div>
            <h1 class="hero__title">${esc(clock.shortDate(trip.start, false))} to ${esc(clock.shortDate(trip.end, false))}, 2027</h1>
            <p class="hero__sub">16 days · 6 stops · 3 countries</p>
          </div>
        </div>
        <a class="hero__promo" href="#/map">
          ${mapSvg({ unfold: true, inert: true, big: true })}
          <span class="btn btn--accent btn--lg hero__cta">${icon('i-map')} Explore the route</span>
        </a>
      </section>
      <div class="cols cols--even">
        <div class="col col--main">
          <section class="card count o-1">
            <div class="count__num">${st.daysUntil}</div>
            <div class="lead">${st.daysUntil === 1 ? 'day' : 'days'} to go</div>
            <p class="muted">Day 1 is ${esc(clock.longDate(d1.date))}: arrive in Hanoi.</p>
          </section>
          <a class="card peek o-3" href="#/day/1">
            <img class="peek__img" src="${dayImage(1)}" alt="${esc(dayAlt(1))}" decoding="async">
            <div class="peek__body"><div class="card__title" style="margin:0">Day 1 preview</div><div class="h3">${esc(d1.title)}</div><div class="meta">${esc(d1.place)}, ${esc(d1.country)}</div></div>${icon('i-right')}</a>
        </div>
        <div class="col col--side">
          <section class="card o-4"><h2 class="card__title">Before you go</h2>
            <ul class="check">${essentials[0].items.map((i) => `<li>${icon('i-check')}<span>${esc(i)}</span></li>`).join('')}</ul>
            <p class="meta" style="margin-top:var(--sp-3)">More under <a href="#/info">Info</a>. Once the trip starts, this screen becomes today's plan.</p>
          </section>
        </div>
      </div>`;
    countUp(view.querySelector('.count__num'), st.daysUntil);
    return;
  }
  view.innerHTML = `
    <section class="hero">
      <img class="hero__img" src="img/cover/angkor.jpg" alt="${esc(photoAlts.covers.angkor)}" decoding="async">
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
          <img class="dayrow__img" src="${dayImage(d.n)}" alt="${esc(dayAlt(d.n))}" decoding="async">
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
const COUNTRY_LABELS = [['THAILAND', 14.6, 101.2], ['CAMBODIA', 11.7, 105.3], ['LAOS', 19.4, 102.5], ['VIETNAM', 15.6, 110.6, 'end']];

/**
 * The route as inline SVG. `here` marks the current city (during the trip);
 * `unfold` draws the route stop by stop, used on the countdown screen.
 */
function mapSvg({ here = null, unfold = false, day = null, link = false, inert = false, progress = null, big = false } = {}) {
  inert = inert || link; // a linked map, or one inside another link, has no marker links of its own
  const prefix = inert ? 'home' : 'map';
  // Photo size: the promo (big labels, map shown small) uses 26; the Map tab
  // shows the photos at twice the original size so you can see what they are.
  const R = big ? 26 : 36; const PILL_H = 23; const CH = 9.5;
  const offsets = big ? photoOffsets : photoOffsetsLarge;
  const PAD = big ? 0 : 28; // room around the edge for the larger photos
  const land = Object.values(outlines).map((ring) => `<path class="map__land" d="M${ring.map(([la, lo]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join('L')}Z"/>`).join('');
  const byId = Object.fromEntries(cities.map((c) => [c.id, c]));
  // Reveal order: each leg, then the city it arrives at. A `via` leg is an
  // airport change (Bangkok on the way to Chiang Mai), so it does not reveal
  // the city; Bangkok's callout waits for the leg that arrives to stay.
  const cityStep = { hanoi: 0 };
  legs.forEach((l, i) => { if (!l.via && !(l.to in cityStep)) cityStep[l.to] = i + 1; });
  // During the trip, count travelled legs so the first leg ahead is step 1.
  const base = progress === null ? 0 : legs.filter((l) => l.day <= progress).length;
  const legPaths = legs.map((l, i) => {
    const a = byId[l.from]; const b = byId[l.to];
    const x1 = px(a.lon); const y1 = py(a.lat); const x2 = px(b.lon); const y2 = py(b.lat);
    let d;
    if (l.mode !== 'air') d = `M${x1} ${y1}L${x2} ${y2}`;
    else {
      const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2; const dx = x2 - x1; const dy = y2 - y1;
      const len = Math.hypot(dx, dy); const cx = mx - dy / len * len * 0.18; const cy = my + dx / len * len * 0.18;
      d = `M${x1} ${y1}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
    }
    const upcoming = progress !== null && l.day > progress;
    const cls = `map__leg${l.mode === 'air' ? ' map__leg--air' : ''}${upcoming ? ' map__leg--upcoming' : ''}`;
    // When unfolding, a mask with the same path "draws" the leg: pathLength=1
    // lets CSS animate stroke-dashoffset from 1 to 0 without knowing the length.
    // Legs already travelled are set instantly; only the road ahead draws.
    const draws = unfold && (progress === null || l.day > progress);
    const maskId = `${prefix}-leg-${i}`;
    const mask = draws ? `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="${-PAD}" y="${-PAD}" width="${360 + 2 * PAD}" height="${(MAP_H + 2 * PAD).toFixed(0)}"><path class="map__draw" style="--i:${i + 1 - base}" d="${d}" pathLength="1"/></mask>` : '';
    return `${mask}<path class="${cls}" d="${d}"${draws ? ` mask="url(#${maskId})"` : ''}/>`;
  }).join('');
  // Each stop is a round photo of its highlight with a day pill under it,
  // tied to the exact point by a short leader line. R and the pill are in
  // map units (the SVG is 360 wide), not CSS pixels.
  const markers = cities.map((c) => {
    const x = px(c.lon); const y = py(c.lat);
    const [ox, oy] = offsets[c.id];
    const cx = x + ox; const cy = y + oy;
    const isHere = here && here.id === c.id;
    const target = isHere ? day : c.days[0];
    const settled = progress !== null && cityStep[c.id] <= base; // already visited, or where they are
    const style = unfold && !settled ? ` style="--i:${cityStep[c.id] - base}"` : '';
    const tag = inert ? 'g' : 'a';
    const attrs = inert ? '' : ` href="#/day/${target}" data-stop="${c.id}" aria-label="${esc(c.name)}, days ${c.days[0]} to ${c.days.at(-1)}"`;
    const pillText = isHere ? String(day) : (c.days.length > 1 ? `${c.days[0]}–${c.days.at(-1)}` : String(c.days[0]));
    const pillW = 16 + pillText.length * CH;
    const clipId = `clip-${prefix}-${c.id}`;
    return `<${tag} class="map__city${isHere ? ' map__city--here' : ''}${unfold && settled ? ' map__city--set' : ''}"${style}${attrs}>
      <line class="map__leader" x1="${x}" y1="${y}" x2="${cx}" y2="${cy}"/>
      <circle class="map__point" cx="${x}" cy="${y}" r="3.5"/>
      ${isHere ? `<circle class="map__pulse" cx="${cx}" cy="${cy}" r="${R}"/>` : ''}
      <g class="map__callout" style="transform-origin: ${cx}px ${cy}px">
        <clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
        <image href="${c.photo}" aria-label="${esc(cityAlt(c))}" x="${cx - R}" y="${cy - R}" width="${R * 2}" height="${R * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>
        <circle class="map__ring" cx="${cx}" cy="${cy}" r="${R}"/>
        <rect class="map__pill" x="${cx - pillW / 2}" y="${cy + R - PILL_H / 2}" width="${pillW}" height="${PILL_H}" rx="${PILL_H / 2}"/>
        <text class="map__pill-text" x="${cx}" y="${cy + R + 5.5}" text-anchor="middle">${pillText}</text>
        <text class="map__name" x="${cx}" y="${cy + R + PILL_H + 12}" text-anchor="middle">${esc(c.name)}</text>
        <circle class="map__hit" cx="${cx}" cy="${cy}" r="${R + 8}"/>
      </g>
    </${tag}>`;
  }).join('');
  const countryLabels = COUNTRY_LABELS.map(([t, la, lo, an]) => `<text class="map__label" x="${px(lo)}" y="${py(la)}" text-anchor="${an || 'middle'}">${t}</text>`).join('');
  const svg = `<svg class="map${unfold ? ' map--unfold' : ''}${big ? ' map--big' : ''}" style="--legs:${legs.length}" viewBox="${-PAD} ${-PAD} ${360 + 2 * PAD} ${(MAP_H + 2 * PAD).toFixed(0)}" role="img" aria-label="Route map: Hanoi, Halong Bay, Ho Chi Minh City, Siem Reap, Chiang Mai, Bangkok">
      ${land}${countryLabels}${legPaths}${markers}
    </svg>`;
  return link ? `<a class="map-link" href="#/map" aria-label="Open the full route map">${svg}<span class="map-link__hint">${icon('i-map')} Tap to explore the route</span></a>` : svg;
}

/** Numbered stop chips: the tappable twin of the map for anyone who prefers a list. */
function stopsHtml(here = null, day = null) {
  return `<ol class="stops">${cities.map((c, i) => `<li><a class="stop${here && here.id === c.id ? ' stop--here' : ''}" href="#/day/${here && here.id === c.id ? day : c.days[0]}"><b>${i + 1}</b>${esc(c.name)}<span class="meta">Day${c.days.length > 1 ? 's' : ''} ${c.days[0]}${c.days.length > 1 ? `–${c.days.at(-1)}` : ''}</span></a></li>`).join('')}</ol>`;
}

function renderMap() {
  const st = status();
  const here = st.phase === 'during' ? cityOfDay(st.day) : null;
  const progress = st.phase === 'during' ? st.day : st.phase === 'after' ? LAST : null;
  view.innerHTML = `
    <h1 class="h1">The route</h1>
    ${here ? `<div class="now">${icon('i-pin')}<span><strong>Day ${st.day}:</strong> Mom &amp; Dad are in ${esc(here.name)}, ${esc(here.country)}.</span></div>${nowLine()}`
      : st.phase === 'before' ? `<div class="now">${icon('i-pin')}<span>The trip starts in Hanoi on ${esc(clock.shortDate(trip.start))}.</span></div>` : ''}
    ${mapSvg({ here, day: st.day, progress })}
    <div class="legend"><span><i></i> Road or boat</span><span><i class="air"></i> Flight</span>${here ? '<span><b></b> They are here</span><span><i class="faint"></i> Still to come</span>' : ''}</div>
    <p class="meta">Tap a stop on the map to see it up close.</p>
    <ol class="citylist">${cities.map((c, i) => `<li><a class="cityrow${here && here.id === c.id ? ' cityrow--here' : ''}" href="#/day/${here && here.id === c.id ? st.day : c.days[0]}" data-stop="${c.id}">
        <span class="cityrow__n">${i + 1}</span>
        <span><strong>${esc(c.name)}</strong><br><span class="meta">Days ${c.days[0]}${c.days.length > 1 ? `–${c.days.at(-1)}` : ''} · ${esc(c.hotel)}</span></span>
        ${icon('i-right')}</a></li>`).join('')}</ol>
    <p class="meta">The map is a sketch for orientation, not for navigation. "Open in Maps" on any hotel gives real directions when you have a signal.</p>
    <div class="sheet" id="stop-sheet" hidden>
      <div class="sheet__backdrop" data-close></div>
      <div class="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <img class="sheet__img" id="sheet-img" alt="" decoding="async">
        <div class="sheet__body">
          <h2 class="h2" id="sheet-title"></h2>
          <p class="meta" id="sheet-meta"></p>
          <p id="sheet-hotel"></p>
          <div class="btn-row"><a class="btn" id="sheet-day"></a><a class="btn btn--ghost" href="#/hotels">${icon('i-bed')} Hotels</a></div>
          <button type="button" class="btn btn--ghost btn--block" data-close>Close</button>
        </div>
      </div>
    </div>`;

  // Tapping a stop (on the map or in the list) opens the sheet instead of
  // leaving the map: a look before you go.
  const sheet = document.getElementById('stop-sheet');
  document.body.appendChild(sheet); // outside #view, which goes inert while the sheet is open
  let closeTimer = 0;
  const closeSheet = () => {
    if (sheet.hidden) return;
    sheet.classList.remove('sheet--open');
    overlayClose();
    view.querySelectorAll('.map__city--selected').forEach((m) => m.classList.remove('map__city--selected'));
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { sheet.hidden = true; }, reducedMotion.matches ? 0 : 320);
  };
  const openSheet = (id) => {
    const c = cities.find((x) => x.id === id);
    const first = days[c.days[0] - 1]; const last = days[c.days.at(-1) - 1];
    const isHere = here && here.id === id;
    const sheetImg = document.getElementById('sheet-img'); sheetImg.src = c.photo; sheetImg.alt = cityAlt(c);
    document.getElementById('sheet-title').textContent = `${c.name}, ${c.country}`;
    document.getElementById('sheet-meta').textContent = `Day${c.days.length > 1 ? 's' : ''} ${c.days[0]}${c.days.length > 1 ? `–${c.days.at(-1)}` : ''} · ${clock.shortDate(first.date)}${c.days.length > 1 ? ` to ${clock.shortDate(last.date)}` : ''}${isHere ? ' · They are here now' : ''}`;
    document.getElementById('sheet-hotel').innerHTML = `<strong>Staying at</strong> ${esc(c.hotel)}`;
    const dayLink = document.getElementById('sheet-day');
    dayLink.href = `#/day/${isHere ? st.day : c.days[0]}`;
    dayLink.innerHTML = `${icon('i-sun')} ${isHere ? `Today · Day ${st.day}` : `Open Day ${c.days[0]}`}`;
    view.querySelectorAll('.map__city--selected').forEach((m) => m.classList.remove('map__city--selected'));
    view.querySelector(`.map__city[data-stop="${id}"]`)?.classList.add('map__city--selected');
    clearTimeout(closeTimer);
    if (sheet.hidden) overlayOpen();
    sheet.hidden = false;
    setTimeout(() => sheet.classList.add('sheet--open'), 20); // next frame, so the transition runs
    sheet.querySelector('[data-close].btn').focus({ preventScroll: true });
  };
  view.querySelectorAll('[data-stop]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); openSheet(el.dataset.stop); }));
  // Hovering a marker lights up its list row, and hovering a row lights up its marker.
  view.querySelectorAll('[data-stop]').forEach((el) => {
    const twin = () => [...view.querySelectorAll(`[data-stop="${el.dataset.stop}"]`)].filter((x) => x !== el);
    const cls = (x) => (x.classList.contains('cityrow') ? 'cityrow--hover' : 'map__city--hover');
    el.addEventListener('mouseenter', () => twin().forEach((x) => x.classList.add(cls(x))));
    el.addEventListener('mouseleave', () => twin().forEach((x) => x.classList.remove(cls(x))));
  });
  sheet.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeSheet));
  sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
}

function renderHotels() {
  view.innerHTML = `<h1 class="h1">Where you're staying</h1>${hotels.map((h) => {
    const meta = HOTEL_PHOTOS[h.name];
    const city = cities.find((c) => c.id === meta.city);
    const first = days[h.days[0] - 1]; const last = days[h.days.at(-1) - 1];
    const photos = hotelPhotos(h.name);
    return `<section class="card stack">
      <div class="gallery" id="gallery-${meta.slug}" aria-label="${esc(h.name)} photos">${photos.map((p, i) => `<img src="${p}" alt="${esc(hotelAlts(h.name)[i] || h.name)}" loading="lazy" decoding="async">`).join('')}</div>
      ${photos.length > 1 ? `<div class="gallery__nav"><span class="gallery__hint">${photos.length} photos</span>
        <span class="gallery__btns">
          <button type="button" class="gallery__btn" data-gallery="gallery-${meta.slug}" data-dir="-1" aria-label="Previous photo">${icon('i-left')}</button>
          <button type="button" class="gallery__btn" data-gallery="gallery-${meta.slug}" data-dir="1" aria-label="Next photo">${icon('i-right')}</button>
        </span></div>` : ''}
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
  view.querySelectorAll('.gallery__btn').forEach((b) => b.addEventListener('click', () => {
    const g = document.getElementById(b.dataset.gallery);
    g.scrollBy({ left: g.clientWidth * 0.82 * Number(b.dataset.dir), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }));
  view.querySelectorAll('.gallery').forEach((g) => {
    const btns = view.querySelectorAll(`.gallery__btn[data-gallery="${g.id}"]`);
    const update = () => {
      // The strip has side padding and snaps to it, so "the start" is one padding in.
      const pad = parseFloat(getComputedStyle(g).paddingLeft) || 0;
      const atStart = g.scrollLeft <= pad + 2; const atEnd = g.scrollLeft + g.clientWidth >= g.scrollWidth - pad - 2;
      btns.forEach((b) => b.setAttribute('aria-disabled', String(b.dataset.dir === '-1' ? atStart : atEnd)));
    };
    let timer = 0;
    g.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(update, 80); }, { passive: true });
    update();
  });
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
      <h2 class="card__title">Help, any time</h2>
      <ul class="kv">
        <li><b>Your Kensington expert</b><span>${esc(trip.operator.expert)}</span><a class="tel" href="tel:+1${tel}">${icon('i-phone')} ${esc(trip.operator.phone)}</a></li>
        <li><b>24/7 in-destination support</b><span>${esc(trip.operator.note)}</span></li>
      </ul>
    </section>
    <section class="card card--muted">
      <h2 class="card__title">Right now</h2>
      <p class="lead">${standing}</p>
      <p>It's ${clock.timeInZone(t, TZ)} on ${weekdayInZone(t, TZ)} there.${viewerTZ !== TZ ? ` Everything in this guide is in local time (UTC+7).` : ''}</p>
      <p class="meta">${saved} Version ${APP_VERSION}.</p>
    </section>
    ${essentials.map((e) => `<section class="card"><h2 class="card__title">${esc(e.heading)}</h2>
      <ul class="check">${e.items.map((i) => `<li>${icon('i-check')}<span>${esc(i)}</span></li>`).join('')}</ul></section>`).join('')}
    <section class="card">
      <h2 class="card__title">Put it on your home screen</h2>
      <p><strong>iPhone:</strong> open this page in Safari, tap Share, then <em>Add to Home Screen</em>.</p>
      <p><strong>Android:</strong> open in Chrome, tap the three dots, then <em>Add to Home screen</em>.</p>
      <p class="meta">Do it once on Wi-Fi. After that it opens like an app and works anywhere.</p>
    </section>
    <section class="card">
      <h2 class="card__title">Print or preview</h2>
      <div class="btn-row">
        <a class="btn btn--ghost" href="#/print">Print all 16 days</a>
      </div>
      <details class="fold" style="margin-top:var(--sp-4)"><summary>For Adam: preview a date</summary>
      <form class="field" id="preview-form">
        <label for="preview-date">Preview the guide on a date</label>
        <input id="preview-date" type="date" min="${trip.start}" max="${clock.addDays(trip.end, 1)}" value="${st.phase === 'during' ? st.today : trip.start}">
        <div class="btn-row"><button class="btn btn--ghost" type="submit">Preview that day</button>
        ${previewing ? `<a class="btn" href="${location.pathname}#/today">Back to the real today</a>` : ''}</div>
      </form></details>
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
      <section class="card"><h2 class="card__title">The plan</h2>${timelineHtml(d)}</section>
      ${hotelCard(d)}
      ${notesHtml(d)}
      <section class="card"><div class="prose">${d.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div></section>
    </section>`).join('')}`;
  setTimeout(() => window.print(), 400);
}

/**
 * Everything an overlay needs to be a real dialog: the page behind it is
 * inert (no tabbing into the tab bar), the page cannot scroll, and focus
 * returns to whatever opened it. Used by the stop sheet and the lightbox.
 */
const overlay = { opener: null, depth: 0 };
const BEHIND = () => [document.getElementById('view'), document.querySelector('.top'), document.querySelector('.tabs')];
function overlayOpen() {
  if (overlay.depth++ === 0) {
    overlay.opener = document.activeElement;
    BEHIND().forEach((el) => { if (el) el.inert = true; });
    document.body.style.overflow = 'hidden';
  }
}
function overlayClose() {
  if (overlay.depth === 0) return;
  if (--overlay.depth === 0) {
    BEHIND().forEach((el) => { if (el) el.inert = false; });
    document.body.style.overflow = '';
    overlay.opener?.focus?.({ preventScroll: true });
    overlay.opener = null;
  }
}

/** Full-screen photo viewer for galleries and day heroes. One instance, reused. */
let lightbox = null; let lbSrcs = []; let lbAlts = []; let lbIndex = 0;
function openLightbox(srcs, index = 0, alts = []) {
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `<button type="button" class="lightbox__close" aria-label="Close">${icon('i-close')}</button>
      <img class="lightbox__img" alt="">
      <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous photo">${icon('i-left')}</button>
      <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next photo">${icon('i-right')}</button>
      <div class="lightbox__count" aria-live="polite"></div>`;
    document.body.appendChild(lightbox);
    const show = (i) => {
      lbIndex = (i + lbSrcs.length) % lbSrcs.length;
      const im = lightbox.querySelector('.lightbox__img'); im.src = lbSrcs[lbIndex]; im.alt = lbAlts[lbIndex] || '';
      lightbox.querySelector('.lightbox__count').textContent = lbSrcs.length > 1 ? `${lbIndex + 1} of ${lbSrcs.length}` : '';
      lightbox.classList.toggle('lightbox--single', lbSrcs.length < 2);
    };
    const close = () => { if (lightbox.hidden) return; lightbox.classList.remove('lightbox--open'); overlayClose(); setTimeout(() => { lightbox.hidden = true; }, reducedMotion.matches ? 0 : 220); };
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(lbIndex - 1));
    lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => show(lbIndex + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' && lbSrcs.length > 1) show(lbIndex + 1);
      if (e.key === 'ArrowLeft' && lbSrcs.length > 1) show(lbIndex - 1);
    });
    let sx = null;
    lightbox.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (sx === null || lbSrcs.length < 2) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (dx < -60) show(lbIndex + 1); else if (dx > 60) show(lbIndex - 1);
    }, { passive: true });
    lightbox.show = show; lightbox.close = close;
  }
  lbSrcs = srcs; lbAlts = alts;
  lightbox.show(index);
  overlayOpen();
  lightbox.hidden = false;
  setTimeout(() => lightbox.classList.add('lightbox--open'), 20);
  lightbox.querySelector('.lightbox__close').focus({ preventScroll: true });
}

/** Wire every gallery photo and day hero on the current screen to the lightbox. */
function bindLightbox() {
  view.querySelectorAll('.gallery').forEach((g) => {
    const imgs = [...g.querySelectorAll('img')];
    imgs.forEach((img, i) => { img.setAttribute('role', 'button'); img.tabIndex = 0; img.setAttribute('aria-label', `${img.alt}. See it full screen`);
      img.addEventListener('click', () => openLightbox(imgs.map((x) => x.src), i, imgs.map((x) => x.alt)));
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(imgs.map((x) => x.src), i, imgs.map((x) => x.alt)); } }); });
  });
  view.querySelectorAll('.hero:not(.hero--map) .hero__img').forEach((img) => {
    img.setAttribute('role', 'button'); img.tabIndex = 0; img.setAttribute('aria-label', `${img.alt}. See it full screen`);
    img.addEventListener('click', () => openLightbox([img.src], 0, [img.alt]));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox([img.src], 0, [img.alt]); } });
  });
}

/** Tick a number up from zero so the countdown reads as a live figure, not a label. */
function countUp(el, target) {
  if (!el || reducedMotion.matches || target < 2) return;
  const ms = 700; const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / ms);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// --- router ----------------------------------------------------------------

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let lastDay = null;
let quietRender = false; // true for re-renders the user did not ask for (waking the phone): no replayed animations


/** Replay an entrance animation on the view: 'forward' | 'back' | 'settle'. */
function enter(kind) {
  view.classList.remove('view--forward', 'view--back', 'view--settle');
  void view.offsetWidth; // restart the animation even if the class repeats
  view.classList.add(`view--${kind}`);
}

function route() {
  document.getElementById('stop-sheet')?.remove(); // a sheet parked in <body> by the Map screen
  while (overlay.depth) overlayClose();
  const hash = location.hash || '#/today';
  const [, section = 'today', arg] = hash.split('/');
  let tab = section;
  const dayBefore = lastDay;
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
  view.className = `view view--${section}`;
  const dayNow = /^#\/day\/(\d+)/.exec(location.hash) ? parseInt(arg, 10) : (section === 'today' && status().phase === 'during' ? status().day : null);
  if (quietRender) { /* no entrance on a wake-up re-render */ }
  else if (dayNow !== null && dayBefore !== null && dayNow !== dayBefore) { enter(dayNow > dayBefore ? 'forward' : 'back'); navigator.vibrate?.(8); }
  else if (section !== 'driver') enter('settle');
  lastDay = dayNow;
  document.querySelectorAll('.tabs a').forEach((a) => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  updateTopStatus();
  fitChrome();
  bindLightbox();
  lightbox?.close?.();
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
}

// A phone's text-size setting is invisible to media queries, so measure:
// if the day bar or tab bar is wider than the screen, step down a tier
// (see the "large text" block in app.css) until everything fits.
function fitChrome() {
  const root = document.documentElement;
  const bars = [document.querySelector('.tabs'), view.querySelector('.daybar'), ...view.querySelectorAll('.daybar__btn'), ...document.querySelectorAll('.tabs a')].filter(Boolean);
  // Compare against the real viewport: on a phone an overflowing bar widens
  // the layout viewport, so a bar can never be wider than "itself".
  const overflows = () => bars.some((b) => b.scrollWidth > Math.min(b.clientWidth, root.clientWidth) + 1);
  root.removeAttribute('data-text');
  if (!overflows()) return;
  root.dataset.text = 'large';
  if (overflows()) root.dataset.text = 'xl';
}
window.addEventListener('resize', fitChrome);

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
  quietRender = true; route(); quietRender = false;
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
  // First install: the worker reports how many files it has saved so far.
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type !== 'precache') return;
    if (e.data.done < e.data.total) showToast(`Saving for offline… ${e.data.done} of ${e.data.total}`, null, null, true);
    else showToast('Saved. The guide now works without a signal.');
  });
}

let toastTimer = 0;
function showToast(text, action, onAction, sticky = false) {
  toast.innerHTML = `<span>${esc(text)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  toast.hidden = false;
  toast.querySelector('button')?.addEventListener('click', () => { toast.hidden = true; onAction?.(); });
  clearTimeout(toastTimer);
  if (!action && !sticky) toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
}
