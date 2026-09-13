# Research terminal upgrade

The dashboard displays market conditions instead of legacy directional scores,
trade probabilities, confidence grades or win-rate tables. Legacy backend fields
remain compatible but are no longer used by the terminal presentation.

New sections: overview, macro comparison, policy/intervention, expectations versus
releases, CFTC and retail positioning, sources/coverage; existing charts remain.
The macro endpoint is fetched independently, so it can display even when price
research fails. No quote is synthesized when price data is missing.

`/api/research-context` proxies the upstream `public/research-context.json` with a
short cache and strict envelope validation. Source failures return 502/no-store.
Macro and price timestamps remain separate. Source links are restricted to HTTP(S).

Daily price-derived volatility uses 365 observations/year for BTC and 252 for
FX/futures. Reference ranges use historical closes; they are not stop maps or
resting liquidity. The volatility percentile is over supplied overlapping windows,
not a forecast confidence measure. Gold history remains explicitly futures-based.

Macro comparisons use US/Japan as the first country pair. Other assets explicitly
identify limited US/global coverage. Official fiscal/intervention links are source
references, not completed analyses. Paid/unconfigured services are labelled.

The corresponding upstream research-context PR must be published before this
endpoint can supply data. This UI still renders its unavailable state beforehand.
No data subscriptions or permissions are created by this change.

Verification: Node tests cover missing prices, BTC annualization, stale macro
summaries, safe links and malformed proxy payloads. Astro production build passes.
Cloud browser could not access the local preview, so visual browser QA remains
unverified. A static local preview was prepared using actual source snapshots.
