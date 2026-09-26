// Every file the service worker precaches must exist, and every image in
// img/ must be precached — a photo that is not in the list is a blank tile
// in a hotel lobby with no signal.
import { readFile, stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const sw = await readFile('sw.js', 'utf8');
const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
let bad = 0;
for (const f of listed) {
  try { await stat(f); } catch { console.error(`missing on disk: ${f}`); bad++; }
}
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    out.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return out;
}
for (const f of await walk('img')) {
  if (!listed.includes(f)) { console.error(`not precached: ${f}`); bad++; }
}
for (const f of ['index.html', 'css/app.css', 'js/app.js', 'js/itinerary.js', 'js/clock.js', 'js/places.js', 'js/version.js', 'manifest.webmanifest']) {
  if (!listed.includes(f)) { console.error(`core file not precached: ${f}`); bad++; }
}
if (bad) { console.error(`${bad} problem(s)`); process.exit(1); }
console.log(`ok: ${listed.length} files precached, all present`);
