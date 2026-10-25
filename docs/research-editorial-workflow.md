# TRADE90 research publishing workflow

All research starts as an AI-assisted **draft**, outside the published registry. Never automatically approve or publish financial commentary.

## Review checklist
1. Identify pair, original research question and primary keyword without stuffing.
2. Cite at least two independently verifiable HTTPS sources; distinguish central-bank announcements, macroeconomic observation periods, and market prices.
3. Record actual publication dates, source observation dates, and data retrieval times separately. Never reset dates to imply new information.
4. Check policy-rate figures against verified snapshots and explain the experimental 90-day model limitations.
5. Do not invent current spot prices, support/resistance levels, economic calendar times, or market-implied probabilities. Omit unavailable technical sections.
6. Check that analysis is original and does not reproduce licensed third-party text or price feeds.
7. Human reviewer checks facts, framing, keywords, mobile readability and sources; explicit approval is required.

## Publication contract
Add an article object to `src/data/trade90-research-articles.json` only after approval.
Required fields:
- `status: "approved"`, `approvedBy` (reviewer name or team), `approvedAt` (YYYY-MM-DD)
- `symbol` (six uppercase letters from the supported 28 pairs)
- `slug` (lowercase URL-safe), `title`, `description`, `summary`
- `publishedAt` (real YYYY-MM-DD publication date); optional `modifiedAt` for substantive changes
- `sections: [{heading,paragraphs:[...]}, ...]` at least two sections
- `sources: [{title,url,observationDate?}, ...]` at least two sources

Only approved articles with valid publication fields are statically rendered. Drafts must not enter the registry, sitemap or public pair pages. The approved article list on each pair page is build-time generated, with no visitor-side API request.

## Speed
Use Astro prerendered HTML, no client-side editor, no automatic third-party trading chart. Add optional charts only after performance measurement and data licensing review.
