# Trade90 market-implied forward-rate integration

## Delivered foundation
The homepage can now read /data/forward-rate-snapshot.json and /data/forward-rate-history.json, validate them in the browser, compute 28 expected policy-gap comparisons per horizon, and show 24-hour/7-day changes when there are two comparable observations. The current public snapshot intentionally has status \`awaiting_licensed_data\`: NO forward rates have been invented or extracted from an unlicensed source.

8 currencies: USD, EUR, GBP, JPY, AUD, NZD, CAD, CHF.
Horizons: 3M, 6M, 12M. Signed basis points = (base expected policy rate % - quote expected policy rate %) * 100.
No automatic buy/sell labels. A sign reversal is identified separately from widening or narrowing.
A missing or stale observation never becomes a numerical expected rate. Quote time synchronization must be within 15 minutes. Snapshots are considered stale after 96 hours (weekend-safe); display clearly stops claiming current implied data.

## Required paid market-data capability
Obtain either (1) a redistributable, explicit eight-bank MARKET-IMPLIED POLICY-LEVEL forward path or (2) licensed underlying derivatives quotes with an independently verified conversion model and consistent observation cut-offs. OIS par swap yields, central bank meeting probabilities, fixed-term FX forwards and market economists' forecasts are NOT interchangeable with future central-bank policy levels.

Potential procurement routes (not connected or approved yet):
- LSEG Workspace / LSEG Data Platform money market and OIS coverage: https://www.lseg.com/en/data-analytics and https://developers.lseg.com/
- CME FedWatch API: https://www.cmegroup.com/market-data/market-data-api/fedwatch-api.html ; Fed meeting probabilities, NOT a complete 8-bank 3M/6M/12M comparable policy path. API price is not a public redisplay license.
- ASX RBA Rate Tracker: https://www.asx.com.au/markets/trade-our-derivatives-market/futures-market/rba-rate-tracker ; RBA futures implied meeting probabilities, display use rights to check.
- Bank of England OIS curve: https://www.bankofengland.co.uk/statistics/yield-curves ; UK sterling OIS forward rates are NOT mechanically the future Bank Rate, even if close; check permission and pricing methodology.
- Trading Economics API: https://tradingeconomics.com/api/forecasts.aspx ; its published rate forecasts are forecasts, NOT guaranteed market-implied futures rates. If used, they require a separately labelled non-market-pricing mode.
For commercial use and public site redistribution, get explicit terms from data rights team. Cost and currency coverage must be confirmed directly before purchasing.

## Source contract
A private normalized provider snapshot is JSON:
\`\`\`json
{
  "schemaVersion": 1,
  "status": "verified",
  "dataKind": "market_implied_policy_level",
  "provider": "LICENSED_PROVIDER_NAME",
  "observedAt": "2026-10-15T12:00:00Z",
  "methodology": "Documented model mapping verified derivatives inputs to comparable market-implied central-bank policy levels.",
  "license": {
    "publicRedisplayAuthorized": true,
    "reference": "YOUR_CONFIRMED_REDISTRIBUTION_AGREEMENT_REF"
  },
  "rates": {
    "USD": {
      "3M": {
        "ratePct": null,
        "observedAt": "2026-10-15T12:00:00Z",
        "sourceUrl": "https://provider.example/authorized-documentation",
        "instrument": "PROVIDER_MARKET_IMPLIED_POLICY_SERIES_USD_3M"
      }
    }
  }
}
\`\`\`
The null above is a FIELD PLACEHOLDER, not publishable. Values must come from real, verified licensed provider observations. UTC asOf timestamps and individual record timestamps are required; all records must be synchronized. A provider-specific ingestion adapter still must be implemented after a vendor is selected and authenticated, because no vendor credentials or payload schema currently exist.

## Publishing once rights and data are available
1. Verify the provider's business license explicitly permits public redisplay of the computed rates and their history. Record any attribution, usage limits, and rights notices.
2. Independently test the mapping of short-term derivatives instrument prices into central bank POLICY LEVEL (not a swap par rate); verify term premia/conventions or use a directly supplied provider model.
3. Put normalized input in a private path outside Git. Do not commit credentials. Validate that each currency/horizon has an observedAt and official source URL or appropriately licensed vendor data URL.
4. Set \`TRADE90_REDISPLAY_APPROVED=yes\`, \`TRADE90_RATE_SOURCE_VERIFIED=yes\`, and \`TRADE90_PROVIDER_LICENSE_REF=<reference>\`; run \`node scripts/publish-forward-rates.mjs /private/path/approved-input.json\`. This writes a sanitized public snapshot and archives a prior verified snapshot.
5. Run \`node scripts/check-forward-publication.mjs\`, \`node tests/trade90-v2.mjs\`, \`npm run build\`. Preview changes, then commit only sanitized JSON files; never raw vendor responses.
6. Schedule ingestion after actual rights approval and provider integration. Each new observation advances the timestamp. The 24-hour or seven-day comparison activates only once appropriately spaced source snapshots are recorded.
7. Revalidate that expired or missing data is labelled; do not silently fall back to old forecasts. Correct source/licensing mappings are a precondition for public rate values.

## Known limitations
- Without a redisplay-licensed feed, the pair and cross-pair expected-rate widgets show a concise, honest availability explanation instead of a full table of empty placeholders. Pair pages link to the separate 90-day macro policy-divergence model and bank decision calendar. A partially available feed displays only validated currency pairs or horizons; missing values never become zero.
- A 24h/7d date comparison is not a causality claim. CPI, employment, and monetary statements require their own sources before connecting any narrative to derivatives repricing.
- Snapshot history in this implementation is committed through a controlled publishing step. A production-grade vendor integration should store many immutable measurements securely in a database/data lake, publish only a sanitized latest snapshot, and record source failures and validation alerts.
- Each country's overnight index, policy-rate target, rate-range midpoint, settlement conventions and risk premiums can differ. Do not compare unadjusted overnight swap yields as future TARGET policy rates.
