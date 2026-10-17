/**
 * TRADE90 IndexNow: notify supported engines of deployed canonical URLs.
 * --dry-run validates generated sitemap offline. --check-live checks the deployment.
 * --submit verifies ownership
 * on the deployed site, then sends URLs (does not guarantee indexing).
 * Google's general webpages must use Search Console/sitemaps, not Indexing API.
 */
import { readFileSync } from "node:fs";

const ORIGIN = "https://tradeninety.com";
const HOST = "tradeninety.com";
const SITEMAP = ORIGIN + "/sitemap.xml";
const KEY_LOCATION = ORIGIN + "/indexnow-key.txt";
const ENDPOINT = "https://www.bing.com/indexnow";
const localKey = new URL("../public/indexnow-key.txt", import.meta.url);
const localMap = new URL("../dist/sitemap.xml", import.meta.url);

export function readIndexNowKey(filepath = localKey) {
  const value = readFileSync(filepath, "utf8").trim();
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(value)) throw Error("Invalid IndexNow key");
  return value;
}

export function urlsFromSitemap(xml, origin = ORIGIN) {
  if (!/<urlset(?:\s|>)/.test(xml)) throw Error("Not an XML urlset sitemap");
  const entries = [...xml.matchAll(/<url(?:\s[^>]*)?>[\s\S]*?<loc>\s*([^<]+)\s*<\/loc>[\s\S]*?<\/url>/g)];
  if (!entries.length) throw Error("No canonical URLs found in sitemap");
  const seen = new Set();
  for (const [, raw] of entries) {
    const str = raw.trim().replaceAll("&amp;", "&");
    let u;
    try { u = new URL(str); } catch { throw Error("Invalid sitemap URL: " + str); }
    if (u.origin !== origin || u.search || u.hash || !u.pathname.endsWith("/"))
      throw Error("Not a canonical same-origin URL: " + str);
    if (/^\/(?:404\/?|calculator\/|tools\/|research\/)/i.test(u.pathname))
      throw Error("Retired or error page cannot be submitted: " + str);
    if (seen.has(u.href)) throw Error("Duplicate sitemap URL: " + str);
    seen.add(u.href);
  }
  const mandatory = ["/", "/pairs/", "/rate-gaps/", "/central-banks/", "/decisions/", "/data-policy/"];
  for (const path of mandatory) if (!seen.has(origin + path))
    throw Error("Required TRADE90 page missing from sitemap: " + path);
  const list = [...seen];
  const pairCount = list.filter(u=>/\/pairs\/[a-z]{3}-[a-z]{3}\/$/.test(u)).length;
  const bankCount = list.filter(u=>/\/central-banks\/(fed|ecb|boe|boj|rba|rbnz|boc|snb)\/$/.test(u)).length;
  if (pairCount !== 28 || bankCount !== 8)
    throw Error("Incomplete deployed research coverage: " + pairCount + " pairs and " + bankCount + " banks");
  if (list.length > 10000) throw Error("Unexpected excessive sitemap size");
  return list.sort();
}

async function fetchText(url) {
  const result = await fetch(url, { headers: { "user-agent": "TRADE90-IndexNow/1.0 (+https://tradeninety.com/)" }, signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!result.ok) throw Error(url + " returned HTTP " + result.status);
  return result.text();
}

async function main() {
  const mode = process.argv[2] || "--dry-run";
  if (!["--dry-run","--check-live","--submit"].includes(mode)) throw Error("Use --dry-run, --check-live, or --submit");
  const key = readIndexNowKey();
  if (mode === "--dry-run") {
    const urls = urlsFromSitemap(readFileSync(localMap, "utf8"));
    console.log("IndexNow dry run: " + urls.length + " canonical URLs, all 28 pairs and 8 banks. No notification sent.");
    return;
  }
  // Fail closed until the deployed site proves ownership with the new key.
  const verifiedKey = (await fetchText(KEY_LOCATION)).trim();
  if (verifiedKey !== key) throw Error("Live IndexNow verification key differs from repository key");
  const urls = urlsFromSitemap(await fetchText(SITEMAP));
  if (mode === "--check-live") { console.log("Live site verified: IndexNow key and " + urls.length + " canonical sitemap URLs are accessible."); return; }
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", "user-agent": "TRADE90-IndexNow/1.0" },
    body: JSON.stringify({ host: HOST, key, keyLocation: KEY_LOCATION, urlList: urls }),
    signal: AbortSignal.timeout(20000)
  });
  const body = (await response.text()).slice(0,400);
  if (![200, 202].includes(response.status)) throw Error("IndexNow response " + response.status + ": " + (body || "(empty)"));
  console.log("IndexNow HTTP " + response.status + ": " + urls.length + " published URLs submitted. This does not confirm crawl or indexing.");
}
if (process.argv[1]?.endsWith("/indexnow-submit.mjs")) {
  main().catch(e => { console.error("IndexNow error:", e.message); process.exitCode = 1; });
}
