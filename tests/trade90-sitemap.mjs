import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { allTrade90Pairs, pairUrl, rateSnapshot } from "../src/lib/trade90-v3.js";
import { lessons } from "../src/data/v2-lessons.js";

const root = new URL("../dist/", import.meta.url);
const read = name => readFileSync(new URL(name, root), "utf8");
assert.ok(existsSync(new URL("sitemap.xml",root)), "Public /sitemap.xml must be generated");
const sitemap = read("sitemap.xml");
assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
assert.match(sitemap, /<\/urlset>\s*$/);
assert.doesNotMatch(sitemap, /<lastmod>/, "Never fabricate last modified dates just because the site was built");
const records = [...sitemap.matchAll(/<url(?:\s[^>]*)?>[\s\S]*?<\/url>/g)].map(m=>m[0]);
const locs = records.map(xml=>{
 const match = xml.match(/<loc>\s*([^<]+)\s*<\/loc>/);
 assert.ok(match,"Sitemap url record missing loc");
 return match[1].trim();
});
const urls = new Set(locs);
assert.equal(urls.size,locs.length, "Duplicate URLs in sitemap");
const required = [
 "/", "/rate-gaps/", "/pairs/", "/central-banks/", "/decisions/",
 "/methodology/", "/data-policy/", "/learn/", "/editorial-policy/",
 "/about/", "/contact/", "/disclaimer/", "/privacy/", "/tools/", "/tools/position-size-calculator/"
];
for (const p of allTrade90Pairs) required.push(pairUrl(p.symbol));
for (const bank of rateSnapshot.banks) required.push("/central-banks/"+bank.short.toLowerCase()+"/");
for (const guide of lessons) required.push("/learn/"+guide.slug+"/");
for (const p of required) {
 assert.ok(urls.has("https://tradeninety.com"+p), "Missing sitemap URL: "+p);
 const rel=p==="/"? "index.html":p.replace(/^\//,"")+"index.html";
 assert.ok(existsSync(new URL(rel,root)),"Listed canonical page was not built: "+rel);
}
assert.equal([...urls].filter(url=>/\/pairs\/[a-z]{3}-[a-z]{3}\/$/.test(url)).length,28);
assert.equal([...urls].filter(url=>/\/central-banks\/(?:fed|ecb|boe|boj|rba|rbnz|boc|snb)\/$/.test(url)).length,8);
for (const url of urls) {
 const parsed = new URL(url);
 assert.equal(parsed.origin,"https://tradeninety.com");
 assert.ok(parsed.pathname.endsWith("/"), "Noncanonical trailing-slash URL: "+url);
 assert.ok(!/\/(?:404|sign-in|calculator|research)\//.test(url),"Nonindexable/retired route in sitemap: "+url);
 const pagePath=parsed.pathname==="/"? "index.html" : parsed.pathname.slice(1)+"index.html";
 assert.ok(existsSync(new URL(pagePath,root)),"Orphan sitemap URL: "+url);
 const html=read(pagePath);
 assert.ok(html.includes('rel="canonical" href="'+url+'"'),"Canonical mismatch on "+url);
 assert.doesNotMatch(html,/<meta name="robots" content="noindex/i,"Noindex page present: "+url);
}
const robots=read("robots.txt");
assert.match(robots,/Sitemap:\s*https:\/\/tradeninety\.com\/sitemap\.xml/i,"robots.txt must advertise the primary sitemap.xml");
assert.ok(existsSync(new URL("sitemap-index.xml",root)),"Keep legacy Astro sitemap index for compatibility");
assert.ok(existsSync(new URL("sitemap-0.xml",root)),"Keep Astro sitemap shard for compatibility");
assert.ok(locs.length >= required.length, "Sitemap missing indexable routes");
console.log("TRADE90 sitemap checked: "+locs.length+" valid canonical pages, all 28 pairs, all 8 banks, "+lessons.length+" guides, robots.txt and sitemap-index.xml.");
