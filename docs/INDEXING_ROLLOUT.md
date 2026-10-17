# TRADE90 search-engine indexing rollout
Updated: October 2026.

## What is deployed in repository code
- Canonical, statically rendered pages for 28 FX pairs, eight central-bank profiles, rates, calendar, learning and source policy.
- A build-generated \`https://tradeninety.com/sitemap.xml\` created from Astro's canonical sitemap entries, validated by \`tests/trade90-sitemap.mjs\`; no fake last-modification dates. An Astro sitemap-index.xml is also generated.
- robots.txt generated with permissive / rules and the official primary sitemap URL.
- Public IndexNow verification file at the site's root. IndexNow can inform Bing and other participating engines about newly published canonical pages; it does not guarantee that any engine indexes or ranks them.
- A separate GitHub Actions IndexNow workflow triggered by qualifying main-branch updates (and manually dispatchable for an initial full-sitemap submission).
- A guarded script \`scripts/submit-indexnow.mjs\` which validates origin, excludes retired URLs, verifies the public key file is actually reachable from the live domain, then checks the IndexNow API response. For content commits it limits notifications to known relevant routes when possible. For full manual dispatch it submits the entire valid sitemap.
- No direct call to Google's restricted Indexing API: TRADE90 pair pages are neither JobPosting nor BroadcastEvent livestream URLs.

## Initial release sequence
1. Merge the feature branch and wait for Cloudflare Pages deployment, including the public verification key.
2. Observe the GitHub Action named "TRADE90 IndexNow discovery" on the main-branch push. The workflow waits for and checks the live key file before announcing URLs. Status 200 means acknowledged, 202 means accepted pending verification; neither is proof of search indexing.
3. If its main push checks only changed code URLs or key wasn't live yet, manually dispatch this workflow for a full sitemap submission **after** confirming the key file responds with the exact text. Workflow is configured for \`workflow_dispatch\`.
4. Periodically review Bing Webmaster Tools URL Inspection and IndexNow reports, and Google Search Console Pages/Sitemaps reports.

## Required owner step for Google
1. Open https://search.google.com/search-console/ and select/verify the property for \`tradeninety.com\`. DNS verification is commonly useful for domain properties.
2. Under Indexing > Sitemaps, enter \`https://tradeninety.com/sitemap.xml\` (or just \`sitemap.xml\` when the UI supplies the domain), and submit.
3. Inspect the homepage, \`https://tradeninety.com/pairs/eur-usd/\`, \`https://tradeninety.com/rate-gaps/\`, and the pair directory with URL Inspection; request indexing for the highest-priority URLs when the console permits.
4. Watch the Pages report for "Discovered – currently not indexed", "Crawled – currently not indexed", canonical mismatches or access issues. Correct actual problems instead of repeatedly submitting.
5. The standard Google Search Console sitemap and recrawl route is appropriate here; Google's **Indexing API cannot legitimately be used for general forex research pages**. Search Console ownership/account access is required; code changes alone cannot submit the sitemap on the owner's behalf.

## Reporting limits
The site being discoverable by Bing does not establish how many URLs Google has indexed. Webmaster dashboards, analytics and actual indexing reports are needed. An accepted IndexNow notification is **not** an instant-indexing promise. Page-content quality and freshness also influence whether a crawler chooses to index.
