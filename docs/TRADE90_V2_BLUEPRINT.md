# TRADE90 V2 — Central Bank Rate Divergence Product Blueprint
Status: Strategy and build specification (not yet deployed)
Date: 2026-10-15
Repository: tilershub/trade90-sizer
Branch: trade90-v2-rate-divergence

## Naming and truthfulness policy (founder-confirmed)
Brand: **Trade90**. Main page title: **Central Bank Rate Divergence**. Avoid describing the product as \"intelligence,\" \"AI analysis,\" \"signals,\" or an ability to predict prices. Use plain, literal feature names: **Current Rate Gaps**, **Expected Rate Gaps**, **What Changed**, **Currency Pair Details**. Never imply a policy-rate differential represents actual trader swap yield or proves future FX direction. Label observations, forward market pricing, forecasts and commentary with their respective provenance and dates. Show clearly when forecast values are unavailable. Keep numerical precision appropriate to their sources. Editorial material must not state causality or certainty not supported by evidence.

## Product decision
Rebuild Trade90 as a single-purpose, source-verified forex monetary-policy intelligence product. The CENTRAL BANK RATE DIVERGENCE dashboard with CURRENT RATE GAPS, EXPECTED RATE GAPS, WHAT CHANGED, and CURRENCY PAIR DETAILS is the homepage, not one tool among many.

Primary promise: "Compare the rate gap. Track the expected shift. Understand what changed."

## Four inseparable core features (founder-confirmed)
The redesigned Trade90 V2 homepage is built around four integrated core functions, not one static rate calculator:
1. CURRENT RATE GAPS — all 28 currency pair combinations; verified central bank rate gap ranking from highest absolute difference to lowest, plus signed base-quote spread, source timestamps and higher-yielding currency.
2. EXPECTED RATE GAPS — forward-looking 3M, 6M and 12M market-implied central-bank rate paths; expected signed/absolute gaps and widening, narrowing, or reversal, based only on verified appropriately licensed and timestamped comparable sources.
3. WHAT CHANGED — 1D and 7D changes to expected spreads (distinguished from actual policy-rate decision changes), pair rankings for biggest expectation revisions, and timestamped sourced economic/news catalysts. Do not claim a news release caused a market move without evidence.
4. CURRENCY PAIR DETAILS — select any of the 28 pairs to inspect both banks, policy rate history, forward-rate paths, key catalysts, next decisions, scenarios and risk caveats.

These are FOUR PRIMARY UI AREAS on the new homepage and FOUR MANDATORY TARGET CAPABILITIES of V2; neither Expected nor Today is an optional unrelated product. Implementation can be staged exclusively to guard accuracy and data licensing: mark unverified datasets as unavailable rather than substituting invented numbers. Treat acquisition of trustworthy eight-bank forward-rate data as a critical-path delivery requirement, not a forgotten enhancement. A launch without data for Expected/Today is an intentionally disclosed limited release, never a claim that complete V2 has shipped.
Audience: FX swing traders first, then position and intraday traders who use macroeconomic context.
Do NOT promise profitable trades, forecast returns, or use unsupported bullish/bearish AI scores.

## Scope: full PUBLIC-SITE reset
Remove all legacy features from the new site navigation and public UX:
- Existing generic Market Intelligence and research-terminal UI
- Today dashboard, journal, performance/workspace, member-login prompts
- Position-size, prop-firm, drawdown, compounding, trading-plan, FX and other calculators
- General-purpose research pages and unrelated content hubs
- Existing generic newsletter and promotional blocks unless redesigned for the new use case

This is a PUBLIC EXPERIENCE replacement, not permission to erase repositories, database records, analytics, user accounts or backup data without a separately verified migration. Keep a production backup and rollback path. Inventory old indexed URLs before removal. Use 301 redirects ONLY when a genuinely relevant replacement exists; otherwise return a real 410 Gone or 404 and clean up links/sitemaps. Do not redirect all legacy URLs to home.

## V2 Site IA
- / = the entire Central Bank Rate Divergence dashboard (first screen shows ranking)
- /pairs/[pair]/ = pair-specific rate comparison, factual history, monetary-policy outlook, methodology, cited drivers
- /central-banks/ = 8 banks overview
- /central-banks/[bank]/ = documented bank decision timeline and policy details
- /learn/ = focused educational content and guides
- /learn/[slug]/ = articles about rates, carry, expectations, FX and central banks
- /methodology/ = benchmark definitions, calculations, feed sources, freshness, limitations
- /about/ and /privacy/ = minimal trust/legal infrastructure; no unrelated old tools

Start with one high-quality homepage and methodology. Pair pages can be accessible via UI without indexing until each has substantive unique information. Homepage prominently contains all four sections, with Current and Expected as prominent comparison views, Today changes immediately accessible and pair drilldowns close at hand.

## Homepage design
Above fold:
- Compact Trade90 wordmark; nav: Divergence / Central Banks / Learn / Methodology
- "Central Bank Rate Divergence" headline, clear one-line description
- Visible data-as-of time + source and freshness status
- Two neutral fact cards: largest absolute policy-rate gap; coverage (8 banks / 28 pairs)
- Primary dashboard begins immediately; no generic hero video or unrelated terminal.

Primary sections/tabs:
1. CURRENT RATE GAPS: 28 pairs sorted descending by absolute rate gap on load.
2. EXPECTED RATE GAPS: validated market-implied 3M / 6M / 12M rates; a core product commitment, enabled on verified/licensed data acquisition.
3. WHAT CHANGED: daily/weekly changes in forward expectations with source timestamps, ranked by magnitude; a core commitment enabled once real observations are captured.
4. CURRENCY PAIR DETAILS: 28 selectable rate-path, history and source-rich drilldowns, integrated in all three analytical views.
If forecast data is missing, render explicit "Not available — verified forward-rate data not connected"; do not insert examples or synthesize numbers into production.

Current pair table: rank, symbol, signed base-minus-quote gap (bps), absolute gap (bps), higher-yielding currency, official rate pair, rate effective dates. Hide optional columns on mobile but preserve drill-down detail. Filters: search, major/cross, currency, ascending/descending. Clearly label absolute ranking versus signed gap. Selecting any pair opens pair detail. Empty/unavailable data states must be useful.

Pair detail: two benchmark rates, effective timestamps, computed spread, high/low policy-rate side, bank source links, rate history, relevant upcoming decisions, factors that could alter the gap, methodology/carry disclaimer. Do not conflate central-bank policy spread with actual broker swap, implied yield, or future exchange-rate direction.

Below dashboard: "What changed in policy" verified dated decisions, next calendar catalysts; 2–3 relevant learning links; trust/methodology.

Design: responsive mobile-first, fast, accessible, minimal off-white/dark navy optional; system fonts, clear typography, no decorative charts that imply uncollected data; desktop side panel, mobile detail drawer/card.

## Currency & pair universe
Currencies: USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD.
Exactly C(8,2) = 28 unique unordered currency combinations, each displayed in a consistent market-standard orientation, with a single canonical symbol. No duplicates or synthetic invented trading symbols.
The pair identity/orientation must remain stable when rate leadership reverses. Rankings use abs(baseRate - quoteRate), not alphabetical or quote-direction order.
SignedSpreadBps = 100 * (basePolicyRatePct - quotePolicyRatePct).
AbsoluteSpreadBps = abs(SignedSpreadBps).
HigherCurrency = base if signed >= 0 else quote; ties show "equal".
Federal Reserve target range requires explicit benchmark choice (midpoint or upper/lower), consistent timestamp/source and labeled methodology. ECB uses deposit facility; explain why policy benchmarks are not strictly identical to market yield curves.

## Data pipeline
Canonical official-source registry per bank: central_bank_code, currency, source URL, source_document, retrieval_at, published_at, effective_at, benchmark_name, rate_value_pct or range bounds, status, verifier.
Store immutable rate decisions and versioned derived snapshots. Never overwrite history.
Polling alone is not verification: ingest official decisions; validate schema and effective date; compare with prior; flag discrepancies for review before publishing. Date/time handling should be ISO UTC and source-local where useful.
One validated same-origin read API for homepage, with last_good_snapshot fallback plus visible STALE indicator. Do not silently show stale rates as current. Expose status: verified/current, stale, unavailable. Cache and checksum. Formula pure and unit-tested.
No coupling to the legacy Render research backend for the core dashboard; deployment routing/cloud infra to be confirmed by technical audit. Existing repo currently uses Astro + Svelte + Cloudflare Pages functions; verify real production origin/deployment before touching live paths.
No secrets in browser or Git. Recheck public repositories for accidentally committed credentials.

## Market-implied forward divergence (later, gated)
Market-implied 3M, 6M, 12M forward policy-rate expectations need a legally usable data source with eight-bank coverage, consistent observation times, derivation conventions and licensing.
ExpectedSignedGapBps(horizon) = 100 * (marketImpliedBaseRatePct(horizon) - marketImpliedQuoteRatePct(horizon)).
ChangeFromCurrentBps = expectedSignedGapBps - currentSignedGapBps.
"Widening / narrowing" must be calculated with sign-awareness and stable pair orientation. A sign flip is "reversal", not simply narrower. Store snapshots so 1D and 1W revisions can be computed.
Separate market-implied pricing from economist forecasts or editorial judgment. Disclose horizon convention, source, pricing timestamp, delayed status, and missing coverage.
No fake probabilities, invented market levels, LLM-generated implied values, or automatically asserted causality.

## SEO/content strategy
Retain domain authority safely; inventory indexed legacy routes and backlinks before retiring pages.
New topical cluster:
- What is interest rate divergence in forex?
- Calculate FX policy rate differentials (with examples)
- Central-bank policy rate vs real FX carry/swap
- Why high rates do not guarantee currency appreciation
- How rate futures and OIS imply future decisions
- Fed versus BoJ: USD/JPY policy divergence
- ECB versus Fed: EUR/USD policy divergence
- RBA versus RBNZ: AUD/NZD policy divergence
Original, human-reviewed, sourced, evergreen lessons; link each to matching live tool and primary sources; no thin daily AI articles.
Use unique page titles, meta descriptions, canonical, schema where appropriate, source dates, timestamps, RSS/sitemap only for valid indexable URLs. Track Search Console indexing and engagement.

## Build and launch gates
A. Preflight: identify current production deployment and Git branch; map live routes, identify Cloudflare/Render/Supabase responsibilities, backup deployed assets/config/DB where needed, establish rollback.
B. Isolated v2 branch with homepage, source registry, unit tests and staged preview; no destructive production deletion.
C. Validate 8 official benchmarks; 28 unique pairs; correct sign, decimals, midpoint treatment, sorting and ties; fresh-source timestamps and fallbacks.
D. Review mobile UI, accessibility, Core Web Vitals, SEO, legal/privacy and endpoint failure modes; inspect source-generated pages.
E. Publish replacement homepage only when credible data and rollback are tested. Retire old features/routes methodically with 301/410, site navigation and sitemap updates; monitor errors, crawl/indexing and real data freshness.
F. Complete and activate the already-designed Expected Divergence and What Changed Today core sections after the eight-bank forward-rate feed licensing, timestamp normalization, historical observations and quality gates pass. This is part of the V2 product, not optional scope creep.

## Acceptance criteria for public V2
- Landing page immediately shows 28 accurately ranked pair combinations from 8 verified source decisions.
- All rates link to official evidence and show explicit source/effective/update timestamps.
- No invented live prices, future policy rates, percentage probabilities or directional trade recommendations.
- Changing any one bank rate recomputes precisely its seven related pair spreads.
- Missing/stale sources are clearly indicated; page stays usable, never spins forever.
- Phone layout easy to scan; details reachable with keyboard and touch.
- Legacy public navigation/UI removed; stored historical data and recoverable previous site retained safely.
- The four product areas are navigable and coherently integrated; accurate Current and Pair Intelligence works; Expected and Today show genuine verified data when enabled and accurate missing-data states until then.
- Educational pages are substantial and connected to the tool; 404/410/301 routing decisions documented.
- Staging tests and rollback plan complete before production cutover.

## Strategic KPI definitions
Primary: returning users who inspect rate rankings or pair details; daily/weekly active tool users; pair detail open rate.
Data reliability: proportion of time verified snapshot available, decision-to-publish latency, validation failure count.
Organic: non-branded impressions/clicks to new policy-divergence cluster, qualified landing sessions, onward tool usage.
Do not interpret engagement alone as evidence of trader profitability or better trading results.

## Execution note
This document records agreed public product scope. It is not a completed implementation or deployment authorization for irreversible deletion. No existing production features are changed by adding this blueprint to an isolated branch.
