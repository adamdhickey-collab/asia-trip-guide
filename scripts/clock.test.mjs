import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateInZone, daysBetween, addDays, tripStatus, resolveNow, longDate } from '../js/clock.js';
import { trip, days } from '../js/itinerary.js';

const TZ = 'Asia/Bangkok';

test('the itinerary is 16 consecutive days matching the trip span', () => {
  assert.equal(days.length, 16);
  days.forEach((d, i) => {
    assert.equal(d.n, i + 1);
    assert.equal(d.date, addDays(trip.start, i));
  });
  assert.equal(days.at(-1).date, trip.end);
});

test('a US evening is already the next day in Bangkok', () => {
  // 2027-02-03 20:00 in Chicago (UTC-6) = 2027-02-04 02:00 UTC = 09:00 in Bangkok
  const now = new Date('2027-02-04T02:00:00Z');
  assert.equal(dateInZone(now, TZ), '2027-02-04');
  assert.equal(dateInZone(now, 'America/Chicago'), '2027-02-03');
});

test('tripStatus before, during and after', () => {
  const before = tripStatus(new Date('2027-01-20T12:00:00+07:00'), trip, days.length);
  assert.deepEqual([before.phase, before.day, before.daysUntil], ['before', 1, 7]);

  const day1 = tripStatus(new Date('2027-01-27T00:30:00+07:00'), trip, days.length);
  assert.deepEqual([day1.phase, day1.day], ['during', 1]);

  const day9 = tripStatus(new Date('2027-02-04T05:00:00+07:00'), trip, days.length);
  assert.deepEqual([day9.phase, day9.day], ['during', 9]);

  const last = tripStatus(new Date('2027-02-11T23:59:00+07:00'), trip, days.length);
  assert.deepEqual([last.phase, last.day], ['during', 16]);

  const after = tripStatus(new Date('2027-02-12T00:01:00+07:00'), trip, days.length);
  assert.deepEqual([after.phase, after.day, after.daysSince], ['after', 16, 1]);
});

test('daysBetween is exact across the month boundary', () => {
  assert.equal(daysBetween('2027-01-27', '2027-02-11'), 15);
  assert.equal(daysBetween('2027-02-11', '2027-01-27'), -15);
});

test('?date= preview overrides now; garbage is ignored', () => {
  const real = new Date('2026-09-26T12:00:00Z');
  assert.equal(resolveNow('?date=2027-02-04', TZ, real).toISOString(), '2027-02-04T02:00:00.000Z');
  assert.equal(resolveNow('?date=2027-02-04T22:30', TZ, real).toISOString(), '2027-02-04T15:30:00.000Z');
  assert.equal(resolveNow('?date=nope', TZ, real), real);
  assert.equal(resolveNow('', TZ, real), real);
});

test('longDate renders the weekday the parents will see', () => {
  assert.equal(longDate('2027-02-04'), 'Thursday, February 4');
  assert.equal(longDate('2027-01-27'), 'Wednesday, January 27');
});
