import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {allTrade90Pairs,pairSlug,rateSnapshot} from "../src/lib/trade90-v3.js";
const builtRoot=new URL("../dist/",import.meta.url);
const read=path=>readFileSync(new URL(path,builtRoot),"utf8");
const home=read("index.html");
assert.match(home,/Your daily/);
assert.match(home,/central-bank research routine\./);
assert.match(home,/href="\/pairs\/eur-usd\/"/,"Homepage should link to most requested pair");
assert.doesNotMatch(home,/Most Important Divergences for Forex Traders Right Now/,"Old V2 homepage has been retired");
assert.match(home,/https:\/\/tradeninety\.com\/og-v3\.svg/);
assert.match(home,/type="application\/ld\+json"/);
assert.match(home,/website appearance|Website appearance/i);
const index=read("pairs/index.html");
const all=read("rate-gaps/index.html");
const decisions=read("decisions/index.html");
assert.match(index,/Explore a Forex Currency Pair/);
assert.match(all,/Compare All 28 Forex Rate Gaps/);
assert.match(decisions,/Next Major Interest Rate Decisions/);
assert.doesNotMatch(all,/Live-Status Policy Snapshot/,"Never call the static rate data live");
for(const pair of allTrade90Pairs){
 const slug=pairSlug(pair.symbol);
 const path="pairs/"+slug+"/index.html";
 assert.ok(existsSync(new URL(path,builtRoot)),path+" is not a generated route");
 const html=read(path);
 assert.ok(html.includes(pair.label+" 90-Day Policy Rate Outlook"),"Missing unique pair heading for "+slug);
 assert.ok(html.includes('https://tradeninety.com/pairs/'+slug+'/'),"Wrong canonical for "+slug);
 assert.ok(html.includes("Next Major Decisions to Watch"),"Missing bank decision watch for "+slug);
 assert.ok(html.includes("What the "+pair.label+" Policy-Rate Gap Means"),"Missing indexable pair context for "+slug);
 assert.ok(html.includes('data-divergence-hero'),"Missing prominent divergence research summary on "+slug);
 assert.ok(html.includes('id="policy-outlook"'),"Missing hero anchor on "+slug);
 assert.ok(html.includes('id="policy-evidence"'),"Missing detailed source evidence anchor on "+slug);
 assert.ok(html.indexOf('data-divergence-hero')<html.indexOf('class="comparison"'),"90-day policy outlook must appear before the rate cards on "+slug);
 assert.ok(html.indexOf('data-divergence-hero')<html.indexOf('pair-switcher"'),"Primary outlook must appear before the pair switcher on "+slug);
 assert.ok(html.includes('data-outlook-label'),"Headline status must render directly in HTML on "+slug);
 assert.ok(html.includes('href="#policy-evidence"'),"Research verdict must link to bank evidence on "+slug);
 assert.ok(html.includes("90-DAY POLICY DIVERGENCE"),"90-day outlook must be the page headline for "+slug);
 assert.ok(html.includes('href="/daily/"'),"Daily changes link missing from primary outlook on "+slug);
 
 assert.ok(html.includes(pair.baseBank.source),"No source for base "+slug);
 assert.ok(html.includes(pair.quoteBank.source),"No source for quote "+slug);
 assert.ok(!html.includes('id="expected"'),"Retired market-implied section should not exist on "+slug);
 assert.ok(!html.includes('href="#expected"'),"Retired section must not be in pair navigation "+slug);
}
for(const bank of rateSnapshot.banks){
 const path="central-banks/"+bank.short.toLowerCase()+"/index.html";
 assert.ok(existsSync(new URL(path,builtRoot)),path+" missing");
 const html=read(path);
 assert.ok(html.includes(bank.name),"Missing bank profile "+bank.short);
 assert.ok(html.includes(bank.source),"Missing official bank source "+bank.short);
}
for(const p of ["central-banks/index.html","pairs/index.html","rate-gaps/index.html","decisions/index.html","methodology/index.html","learn/index.html"]){
 assert.ok(existsSync(new URL(p,builtRoot)),p);
}
assert.ok(existsSync(new URL("robots.txt",builtRoot)),"robots.txt must be generated for crawlers");
assert.ok(existsSync(new URL("sitemap-index.xml",builtRoot)),"Sitemap index must be present");
const sitemapIndex=read("sitemap-index.xml");
assert.ok(sitemapIndex.includes("sitemap"),"Invalid sitemap index");
const notFound=read("404.html");
assert.match(notFound,/noindex, follow/,"404 page must not be indexed");
const headers=read("_headers");
assert.match(headers,/Cache-Control: no-cache, max-age=0, must-revalidate/);
assert.match(headers,/\/_astro\/\*/);
const manifest=JSON.parse(read("site.webmanifest"));
assert.ok(manifest.shortcuts.some(s=>s.url==="/pairs/"));
assert.ok(manifest.shortcuts.some(s=>s.url==="/rate-gaps/"));
console.log("V3 static SEO audit passed: 28 canonical pair pages, 8 bank hubs, source links, route canonicals, homepage, robots, sitemap, 404 and deployment cache policy.");
