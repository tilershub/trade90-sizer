# TRADE90 Search indexing and discovery

## Site architecture

TRADE90 publishes a canonical sitemap at https://tradeninety.com/sitemap.xml with 52 public URLs, including 28 currency pair research pages, eight bank research hubs, education, methodology and decision calendars. The static Astro build validates that sitemap and creates robots.txt advertising it.

## IndexNow automation — Bing and participating engines

The live IndexNow implementation is .github/workflows/indexnow-discovery.yml with the publisher scripts/submit-indexnow.mjs and tests/indexnow.mjs. Its domain-ownership key is the public root file /16fd9ce1153b9709c9289b771fdbc3c9afd1d0be.txt.

The workflow runs on relevant main-branch content changes, detects changed URLs, verifies that the published domain serves the matching IndexNow key, and notifies the IndexNow API. It also supports manual submission through GitHub Actions workflow_dispatch. Unlike an unnecessary blanket ping of the entire site on every change, this implementation normally selects changed indexable URLs.

The first main-branch workflow run returned **HTTP 202** from IndexNow for 52 canonical URLs on 17 October 2026. That confirms the service received the submission, **not** that its engines crawled, indexed or ranked them. Pending key validation is possible; verify indexing results in Bing Webmaster Tools.

## Google Search Console — one-time owner step

Google does not accept IndexNow requests and its Indexing API does not cover these general forex research pages. Use ordinary discovery through a verified Search Console property and sitemap.

1. Verify ownership of tradeninety.com at https://search.google.com/search-console using its supported DNS or other verification method, if not already verified.
2. Open Indexing > Sitemaps and submit https://tradeninety.com/sitemap.xml.
3. Use URL Inspection for https://tradeninety.com/ and representative new pages such as https://tradeninety.com/pairs/eur-usd/ and https://tradeninety.com/rate-gaps/.
4. Review the indexing report for crawl errors, canonical mismatches and old indexed calculator/terminal URLs. Allow real 404/410 responses for retired content; redirect only to equivalent replacements.
5. Check index coverage and search clicks over the following days/weeks. Submission never guarantees indexing or search traffic.

Search Console account access is required for property verification and sitemap submission; the GitHub workflow does not impersonate a logged-in Search Console account.

## Official references

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/apis/indexing-api/v3/using-api
- https://www.indexnow.org/documentation
- https://www.bing.com/indexnow
