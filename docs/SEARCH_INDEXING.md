# TRADE90 — Search indexing and crawl notifications

## Implemented

TRADE90 builds /sitemap.xml from its canonical public routes, including all 28 FX pair research pages and eight central-bank hubs. The generated /robots.txt advertises https://tradeninety.com/sitemap.xml. The Astro sitemap index and shard are also retained.

IndexNow site ownership is proven through the public file /indexnow-key.txt. The key file is intentionally public as part of the IndexNow protocol; it is not a password or site administration secret.

On main-branch public-page changes, the new .github/workflows/indexnow.yml builds and validates the sitemap, waits for the key to become accessible at the deployed domain, and sends the current deployed canonical URLs to Bing IndexNow. The workflow is also manually runnable from GitHub Actions.

IndexNow script commands: node scripts/indexnow-submit.mjs --dry-run, --check-live, --submit. The script refuses an unverified domain, different key, incomplete pair/bank coverage, retired pages and noncanonical URLs. CI tests its sitemap and candidate URL validation.

## Important limitations

A successful IndexNow request does not guarantee that pages are crawled, indexed, or ranked. Google does not support IndexNow for ordinary research pages; Google's Indexing API is only documented for eligible JobPosting or livestream BroadcastEvent pages, not forex research. Never use deceptive structured data or promise instant Google indexing.

The GitHub automation does not imply that Google Search Console was connected or that a GSC sitemap was submitted. A separate authenticated Search Console action is required. IndexNow does not update TRADE90 financial data or improve the accuracy of policy-rate snapshots.

## One-time setup for Google

1. Verify domain property tradeninety.com in Google Search Console if not already verified (usually by DNS verification).
2. Under Indexing > Sitemaps submit https://tradeninety.com/sitemap.xml.
3. Inspect the homepage, https://tradeninety.com/pairs/eur-usd/, https://tradeninety.com/rate-gaps/, and a representative bank hub. Request indexing selectively if useful.
4. Inspect Page Indexing, canonical conflicts, exclusions and old indexed URLs. Old calculator, journal and research-terminal URLs may remain in search results until recrawled.
5. Serve real 404/410 responses for gone pages; use permanent redirects only for truly equivalent replacements. Avoid homepage catch-all redirects.
6. Verify site ownership in Bing Webmaster Tools and review IndexNow diagnostics for acceptance and actual indexed-page reports.

## Sources
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/apis/indexing-api/v3/using-api
- https://www.indexnow.org/documentation
- https://www.bing.com/indexnow
