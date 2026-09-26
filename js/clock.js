// "What day of the trip is it?" — the one question the app exists to answer.
//
// The answer is worked out in the trip's own time zone, not the phone's. All
// three countries on this trip are UTC+7, so when it is Tuesday evening in
// Wisconsin it is already Wednesday morning in Siem Reap, and a sister at
// home should see the day Mom and Dad are actually living. The parents'
// phones will be on local time anyway, so for them both answers agree.
//
// Pure functions, no DOM: everything here takes `now` as a Date so it can be
// tested and so `?date=` can preview any day.

const DAY_MS = 86_400_000;

/** ISO calendar date (YYYY-MM-DD) for `now` as seen in `timeZone`. */
export function dateInZone(now, timeZone) {
  // en-CA formats as YYYY-MM-DD; the parts API avoids locale surprises.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Local wall-clock time in `timeZone`, e.g. "7:42 pm". */
export function timeInZone(now, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(now).toLowerCase();
}

/** Whole days from ISO date a to ISO date b (b - a). Dates are treated as UTC noon to dodge DST. */
export function daysBetween(a, b) {
  return Math.round((Date.UTC(...split(b)) - Date.UTC(...split(a))) / DAY_MS);
}

function split(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m - 1, d];
}

/** Add n days to an ISO date. */
export function addDays(iso, n) {
  const [y, m, d] = split(iso);
  return new Date(Date.UTC(y, m, d + n)).toISOString().slice(0, 10);
}

/**
 * Where the trip stands right now.
 *   phase: 'before' | 'during' | 'after'
 *   day:   1-based day number when during; clamped to 1 / last otherwise
 *   daysUntil: days until day 1 (before), or days since the last day (after)
 */
export function tripStatus(now, trip, dayCount) {
  const today = dateInZone(now, trip.timeZone);
  const offset = daysBetween(trip.start, today); // 0 on day 1
  if (offset < 0) {
    return { phase: 'before', day: 1, daysUntil: -offset, today };
  }
  if (offset >= dayCount) {
    return { phase: 'after', day: dayCount, daysSince: offset - dayCount + 1, today };
  }
  return { phase: 'during', day: offset + 1, today };
}

/** Long weekday + date for a day header: "Thursday, February 4". */
export function longDate(iso) {
  const [y, m, d] = split(iso);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m, d)));
}

/** Short form for lists and the day strip: "Thu, Feb 4" / "Feb 4". */
export function shortDate(iso, withWeekday = true) {
  const [y, m, d] = split(iso);
  return new Intl.DateTimeFormat('en-US', {
    ...(withWeekday ? { weekday: 'short' } : {}), month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m, d)));
}

/**
 * Resolve the `now` to use. `?date=YYYY-MM-DD` (optionally `T HH:MM`) lets
 * anyone preview a day before the trip. The override is treated as a wall
 * clock in the trip's zone.
 */
export function resolveNow(search, timeZone, real = new Date()) {
  const raw = new URLSearchParams(search).get('date');
  if (!raw || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(raw)) return real;
  // Interpret as UTC+7 wall clock (every stop on this trip); good enough for previews.
  const iso = raw.length === 10 ? `${raw}T09:00` : raw;
  return new Date(`${iso}:00+07:00`);
}
