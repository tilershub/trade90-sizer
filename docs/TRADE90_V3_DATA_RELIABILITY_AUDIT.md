# TRADE90 V3 — Data Source Reliability and Publishing Standards

**Status:** AUDIT AND DESIGN SPECIFICATION ONLY — not implemented on the live website
**Audited:** 2026-10-16
**Scope:** Actual policy-rate benchmark snapshot, supporting central-bank publications, policy updates, official decision calendar, reported market expectations, forward-rate engine and its validation rules.
**Source of truth:** Official central-bank publications for enacted policy; verified and properly licensed derivatives-market observations for market-implied expectations.

## Executive risk assessment
Trade90's core policy-rate calculations are deterministic, and sampled source-linked official policy values match original publications. However, high *source quality* is not the same as reliable *publishing operations*. As of this audit, the site has a fixed 2026-10-15 policy snapshot; dated manually curated policy/news/calendar collections; and an **empty, unlicensed** forward-rate dataset, with no historical market-data observations. Accordingly, neither 3/6/12-month market-implied gaps nor 1D/7D repricing can legitimately be presented as current numerical measurements.

The V3 release should optimize data integrity **before** indexing 28 permanent pair pages. Eight authoritative source inputs influence all 28 currency pairs; one wrong policy rate can misstate seven pairs.

### Actual files examined
- `src/data/trade90-policy-snapshot.json`: eight rates, `asOf=2026-10-15`, status `verified_snapshot`, stored rate values.
- `src/data/trade90-policy-updates.js`: eight derived rate decisions + additional official documents; static review date; validates URL domain and metadata but does not fetch and parse original document contents to verify assertions.
- `src/data/trade90-decision-calendar.js`: manually maintained upcoming meeting dates with official links and a curated review date; auto-excludes past dates but does not ingest updated meeting schedules.
- `src/data/trade90-policy-outlook.js`: dated reported market pricing, economist surveys, bank statements; **not current market quotations**.
- `public/data/forward-rate-snapshot.json`: status `awaiting_licensed_data`; zero market-implied observations, public redistribution permission not approved.
- `public/data/forward-rate-history.json`: empty.
- `src/lib/trade90-forward-rates.js`: enforces numerical ranges, ISO dates, source URLs, metadata, same-snapshot time alignment, <=96h freshness, and license-declaration flag. These are useful *format* gates, but the browser cannot certify that the claimed source, license, instrument-to-policy mapping, rate, provider or timestamp is genuine.

## Sampled original-source verification
| Currency | Published dataset | Original-source finding | Risk / next verification action |
| --- | --- | --- | --- |
| AUD | RBA cash-rate target 4.60%, September 29 | Official release confirms +25bp and 4.60% | Verify effective-day convention and compare after next meeting. |
| USD | Fed target range 3.75–4.00%; midpoint 3.875%, September 16 | Official FOMC statement confirms range | Midpoint is Trade90's *calculated convention*, not an independently announced official target. Display both range and midpoint definition. |
| GBP | BoE Bank Rate 3.75%, September 17 | Official MPC summary confirms hold | Distinguish meeting end date versus decision publication date. |
| EUR | ECB deposit facility 2.50%, effective September 16 | Official rate decision confirms 2.50% | Distinguish announced date (September 10) versus effective date. |
| NZD | RBNZ OCR 2.75%, September 2 | Official media release confirms increase | OCR execution/effective conventions require careful time labelling. |
| CAD | BoC target 2.25%, September 2 | Linked opening statement supports 2.25% | **Replace supportive speech source with primary policy-rate announcement**, keep speech as additional interpretation. |
| JPY | BoJ complementary deposit rate 1.25% | Linked terms confirm the numerical facility rate | **Verify the current policy target in the monetary-policy meeting statement**, benchmark equivalence and valid effective date; facility terms alone do not prove a fresh policy decision. |
| CHF | SNB policy rate 0%, September 24 | Official policy assessment confirms hold | Distinguish conditional inflation forecast (assuming rates constant) from market-implied expectation. |

Reviewed original sources:
- https://www.rba.gov.au/media-releases/2026/mr-26-27.html
- https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm
- https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/september-2026
- https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html
- https://www.rbnz.govt.nz/news-and-events/news/2026/09/ocr-increased-by-25-basis-points-to-2-75
- https://www.bankofcanada.ca/2026/09/opening-statement-2026-09-02/
- https://www.boj.or.jp/en/mopo/measures/term_cond/yoryo36.htm
- https://www.snb.ch/en/publications/communication/press-releases-restricted/pre_20260924

**Qualification:** these checks support specified documents and numbers, not a full independent forensic confirmation that *each* document is the latest effective policy decision. Before production release, verify the newest official publication/series for every bank and recheck subsequent decisions.

## Five-tier source hierarchy
**Tier A — Official primary records:** monetary policy rate announcements, signed monetary-policy decisions, effective-rate tables, official decision calendars, official release dates, official corrections. Publish only after numeric/document consistency and freshness check.

**Tier B — Market pricing with validated publication rights:** exchange-traded short-rate futures, CME meeting distribution via licensed API, licensed OIS instrument prices and model-provided paths. Market-implied pricing is a conditional market measure, *not* a future central-bank promise. Raw OIS par yields are not identical to future policy levels; instrument conventions, risk premia and overnight fixings matter. A provider must verify or disclose the transformation method.

**Tier C — Dated reported market observations:** an attributable news agency reporting a point-in-time CME/ASX probability or price. May appear under `Reported market pricing` with original report date and timestamp where present; never show as 'live' or infer a full 3/6/12-month path.

**Tier D — Published opinions, projections and surveys:** central bank conditional economic projections, economists' survey medians, sell-side bank forecasts. Show `Forecast or survey, NOT market-implied`; cannot be silently added to Tier B spread calculation.

**Tier E — Social/AI commentary:** unverified posts, AI-generated explanatory text and speculation. Cannot publish as a factual rate or a data-derived probability.

## Mandatory provenance for every datum
Store both original and normalized representations:
`currency`, `centralBank`, `value`, `unit`, `benchmarkName`, `dataKind`, `instrument`, `sourcePublisher`, `sourceURL`, `documentID`, `sourcePublishedAt`, `decisionMeetingDate`, `effectiveAt`, `observedAtUTC`, `retrievedAtUTC`, `verifiedAtUTC`, `verifier`, `sourceVersionOrHash`, `normalizationRule`, `status`, `lastError`, `publicDisplayRights`.
Keep immutable audit history of corrections and values instead of silently overwriting the past. For Fed, store both range endpoints separately; deriving its midpoint is explicit.

## Recommended update policy — proposals, NOT currently running
| Category | Acquisition | Publish rule | Stale policy |
| --- | --- | --- | --- |
| Enacted policy rates | Official bank calendars plus daily source checks, **increase checking around meeting decisions**, optional source RSS/API/webhook where actually supported | Parse numeric benchmark/decision/effective date, crosscheck bank's current-rate page; flag discrepancies for manual review | Do not change published value from an unverifiable source. Display last verified date and a 'verification overdue' flag after missed expected event |
| Upcoming policy decisions | Recheck official schedules weekly, immediately on announced reschedule, and again 24h before scheduled event | Crosscheck announcement day versus meeting first day, local timezone and next-date rollover | Flag 'calendar check overdue'; never retain past meeting as future |
| Dated policy publications | Daily or after the bank's release; tag publication/meeting dates separately | Original source page plus matching extracted claims, editor review for interpretation | Keep as historical; do not rewrite as new events |
| Market-implied 3M/6M/12M | Licensed supplier EOD feed as the first production tier | Instrument-to-policy mapping documented, all 8 currencies aligned to comparable horizons + evidence of redistribution license | State exact observed UTC time, market session and last successful refresh. Show stale or unavailable, not fabricated live updates |
| Market-implied intraday | Only if justified by traders and provider licenses, with actual available cadence | Automatically ingest *fresh provider observations*, not text summaries generated after CPI | Fail closed after provider-defined session-aware TTL; 96h blanket expiration is too crude around holidays/weekends |
| Rate-expectation news | Dated attributable articles with supporting quoted source | Publish as reported historical observation, with no 'live' badge | Do not update a probability by changing the article timestamp |

**Important:** current code's <=96h recency threshold and <=15-minute alignment rule are helpful conservative defaults, **not guarantees** of model accuracy or correct provider licensing. Implement a trading-calendar-aware freshness policy before the commercial feed goes live.

## Verification pipeline before public use
1. **Acquire:** pull provider data on server, never leak secrets to client or static repo.
2. **Authenticate & retain:** validate transport, identify actual publisher/contract/license, store raw response privately with immutable timestamp/hash.
3. **Normalize:** map rates to an instrument + exact benchmark. Preserve headline rate range and date conventions.
4. **Validate:** run source-specific assertions (numeric values, units, policy effective dates, allowed instrument, expected range, timestamps, duplicate detection, no future publication, latest version).
5. **Crosscheck:** two independent official primary pages/series where possible; bank decision announcement and current-rate table; reject contradictory data.
6. **Human review:** approval required for a new source family, benchmark redefinition, large/out-of-schedule change or discrepancy; keep automated happy path for established feeds after validation.
7. **Publish atomically:** only approved normalized values to a public read-only snapshot, with source metadata, last verified and last ingestion status. Never treat a manually set `publicRedisplayAuthorized: true` flag as evidence of an actual license.
8. **Monitor:** alert for missing scheduled decision, unchanged observation age after open market, failed retrieval, broken source link, unexpected change, source document revision, or a detected mismatch.
9. **Correct:** visible correction log and retraction process, with affected pair recalculation. One bank impacts seven pairs.

## Reader-facing trust design (per pair and headline)
Show concise status: **Official rate · Verified [UTC date]**, **Market-implied · Observed [UTC] · Provider**, **Reported historical estimate · Published [date]**, **Not available — no licensed comparable feed**, **Verification overdue** or **Stale**.
A rate gap is not a broker swap rate and not a recommendation. An economist survey/conditional central bank path may sit in a context card but must NEVER be presented as a market probability.
Market prices change after CPI/NFP/meetings; show actual source observation date, don't imply continuously streaming updates. Clarify decision date vs effective date vs last checked date.

## Source operations dashboard
Maintain a private eight-bank source ledger with:
- Most recent official rate decision, original source URL and timestamp.
- Latest verified numeric benchmark and current publicly displayed value.
- Next official policy release date, zone and scheduled release time where confirmed.
- Ingestion jobs: last attempted / last succeeded / last reviewed.
- Status: current, requires verification, source conflict, broken link, stale market price, license pending.
- Number of affected FX pairs and contact/owner for alerts.
- Dataset-level coverage: 8/8 official banks; 28/28 derived current pairs; x/8 comparable market-implied bank curves per horizon; x/28 forward gap pairs per horizon; x/28 historical changes available.
These are intended dashboard fields, not actual running monitoring infrastructure.

## Release gate — measurable and non-negotiable
**Phase 0, before V3 pair SEO launch:** verify all 8 current central bank values AND benchmark types with primary sources. Correct CAD and JPY source links, track decision/effective/review timestamps, inspect any changed bank value, fix source link errors, implement event-aware update checklist and stale data UI. Publish `Last confirmed from official release` instead of unexplained `Live`.

**Phase 1, before calling a market feed 'live':** obtain written redisplay rights, provider coverage of eight banks, independent instrument mapping review, correct alignment and cadence, end-to-end daily QA, error monitoring, historical snapshots and a tested failure mode that withholds stale data.

**Ongoing quality objectives (targets, not observed):**
- 100% public numeric official policy rates backed by exact documents and labeled benchmarks.
- 0 fabricated or silently interpolated forward rates.
- 100% shown numerical expectations have source, instrument, observedAt and rights record.
- New rate decision approved/published within a defined SLA after the bank release (proposed <=1 hour on covered trading days, subject to operational capacity).
- Coverage and ingestion failure visibly reported; no misleading freshness badge.
- All affected pairs recalculated after approval, and known errors recorded with their correction date.

## Key official references
- Fed monetary-policy release: https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm
- ECB September rate decision: https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html
- BoE MPC hold and OIS-risk-premium discussion: https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/september-2026
- RBA September decision: https://www.rba.gov.au/media-releases/2026/mr-26-27.html
- BoJ meeting listing: https://www.boj.or.jp/en/mopo/mpmsche_minu/
- BoC policy rate: https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/
- CME FedWatch methodology: https://www.cmegroup.com/articles/2023/understanding-the-cme-group-fedwatch-tool-methodology.html
- Bank of England OIS curve: https://www.bankofengland.co.uk/statistics/yield-curves

**This document does not authorize product, production database, hosting or website changes.**
