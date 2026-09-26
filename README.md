# Mom & Dad in Southeast Asia

A private, offline-first phone guide for a 16-day trip through Vietnam,
Cambodia and Thailand (Jan 27 to Feb 11, 2027). Opens on today, works
with no signal, and shows the family at home where the travelers are.

- [PLAN.md](PLAN.md): what it does, why, and what's next
- [docs/install-on-your-phone.md](docs/install-on-your-phone.md): the two-step
  setup to send to Mom and Dad
- [CLAUDE.md](CLAUDE.md): how the code is organised and the checks to run

## Run it locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. Add `?date=2027-02-04` to preview any day.

## Checks

```bash
node --test scripts/*.test.mjs && node scripts/verify-cache.mjs
```

Photos are from the Kensington Tours quote, used with permission.
