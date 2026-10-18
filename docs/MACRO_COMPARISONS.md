# Pair economic comparisons

All 28 pair pages share `Trade90MacroComparison.svelte`. The base economy is blue; the quote economy is orange and dashed. Each of the three charts has one common percentage scale and preserves observed dates, missing periods and reporting frequency. History ranges are relative to today. Source links and exact observations remain available without hovering.

- Inflation: headline CPI year-on-year; euro-area HICP. Calculated from unadjusted indices using the exact same month/quarter a year earlier. No interpolation.
- Unemployment: OECD seasonally adjusted labour-force measures; US BLS UNRATE. Swiss/New Zealand quarterly observations are not converted into monthly figures. National survey coverage differs.
- GDP: real quarter-on-quarter growth, seasonally adjusted, not annualised. Euro-area growth is calculated from its constant-price GDP series (19-country composition).

`python scripts/update-macro-history.py` refreshes 24 histories from FRED public observation tables. Provider, series title, series ID, frequency, original update timestamp, retrieval timestamp and points are stored. Long FRED tables contain extra date/value rows; these are parsed as literals, never executed. Source metadata and numeric observations are validated before replacement; failures preserve previous data and display a warning. Nothing fills unavailable observations. Data older than 120 days (monthly) or 240 days (quarterly) is flagged; these are freshness indicators, not expected release dates. Some OECD headline CPI series are historical and stop before the present: the UI explicitly labels these as older series. A daily retrieval cannot make a discontinued source current.

The GitHub workflow checks daily at 05:43 UTC and on changes to the refresh implementation. It commits the snapshot. Hosting must deploy that commit for the public snapshot to update. Pages hydrate with their two economies only, then attempt a same-origin snapshot refresh. No third-party chart runtime or browser API credentials.

Validation:

```
python tests/macro-history.py
node tests/trade90-macro.mjs
npm run build
```
