# Yield curve intelligence — verified data contract

This feature is informational and initially separate from the 90-day official policy-rate divergence model. No fabricated yields, inferred market-implied probabilities, or automated buy/sell signals.

Data file: `src/data/trade90-yield-curves.json`. Each currency entry must have:
- `verified: true` only after primary-source verification and licensing review
- `asOf: "YYYY-MM-DD"` — observation date, not retrieval date
- `source: "https://..."` — actual primary data series URL
- `yields: {"2Y": number, "10Y": number}` — annual yield percentages, e.g. 3.5 means 3.5%
- Optional `license`, `retrievedAt`, `seriesIds` and historical series data

Display a pair comparison only when **both currencies** have verified 2Y and 10Y observations for the **same observation date**. Display a historical/stale label for observations older than seven days. Do not label stale observations as live. If unavailable, show a transparent data-pending state.

For EUR, use German Bund yields as a clearly labelled euro-area market proxy; Germany is not a euro-area sovereign aggregate. Compare matched maturities and consistent yield conventions. Public availability does not itself grant redistribution rights.

Initial verification targets: USD, EUR, GBP and JPY, then AUD, NZD, CAD and CHF. Build a dated, reproducible historical data pipeline before showing 7/30/90-day changes, curve charts, real yields or using the signal in predictive models. Backtest out of sample before changing the policy outlook.

Performance: Astro static HTML; no chart vendor JS, no browser fetches, no hydration.
