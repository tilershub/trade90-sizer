# TRADE90 — Central Bank Policy Updates

## Shipped structure

- Homepage: four latest dated official publications below the rate divergence tool.
- Dedicated index: \`/central-banks/\` with all currently curated releases, bank filter, publication-type filter and search.
- Bank coverage: USD/Fed, EUR/ECB, GBP/BoE, JPY/BoJ, AUD/RBA, NZD/RBNZ, CAD/BoC and CHF/SNB.
- Source types are kept distinct: **Rate decision**, **Minutes**, **Policy statement**, **Policy report**. No earnings/FX-price predictions.
- Affected pairs are seven currency combinations that include the bank's currency, not predicted trades.
- Source registry: \`src/data/trade90-policy-updates.js\`; actual official benchmarks continue to come from \`src/data/trade90-policy-snapshot.json\`.
- Date convention: \`publishedDate\` is public release date, not event date, unless the bank publishes the decision on its meeting date. For minutes, use the minutes RELEASE date.
- The page clearly labels a manual source collection dated 2026-10-15. It is **not** a real-time policy feed and may be outdated after a bank release.
- Tests: unique article IDs, type checks, fixed eight-bank decision coverage, official central bank host checks, no unsupported event dates, no forward-rate claims on nondecision records.

## Updating the section safely

1. Watch official central bank **policy** release lists and RSS feeds, not general economic blogs:
   - Fed: https://www.federalreserve.gov/newsevents/pressreleases/2026-press-fomc.htm
   - ECB: https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html
   - BoE: https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes
   - BoJ: https://www.boj.or.jp/en/mopo/
   - RBA: https://www.rba.gov.au/monetary-policy/int-rate-decisions/
   - RBNZ: https://www.rbnz.govt.nz/monetary-policy/monetary-policy-decisions
   - BoC: https://www.bankofcanada.ca/press/press-releases/
   - SNB: https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/monetary-policy-assessment
2. Check official article URL, publication date, and what was actually decided. Never treat a speech, minutes, or forecast as an adopted policy rate.
3. For rate decisions, update and re-verify the separate policy-rate snapshot (bank source, effective date, source publication time and actual benchmark definition), then all 28 pair calculations continue using the same coherent snapshot.
4. For published minutes/statement/report, add a separately dated source entry to the supplemental list, with a factual summary (no AI-invented policy direction, no implied market odds).
5. Advance \`policyCollectionAsOf\` only after an editorial/source verification review. Run \`node tests/trade90-v2.mjs\`, \`npm run build\` and desktop/mobile checks.
6. When a genuinely licensed market expectations feed is connected, its implied paths remain a different dataset and the two publication types must never be conflated.

## Future automation

A scheduled official RSS/HTML watcher could identify new releases and suggest draft updates. Do not automatically publish inferred policy rates from unreviewed text. Treat the watcher as **discovery**; official source verification and a tested publication update are needed for release. This feature is not implemented yet and must not be advertised as live.
