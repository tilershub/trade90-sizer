// Built-output checks for the weekly digest, decision pages and RSS feed.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const archive = JSON.parse(readFileSync(new URL('../public/data/decision-archive.json', import.meta.url), 'utf8')).decisions;
assert.ok(archive.length >= 8, 'Every tracked bank has at least its latest decision archived');
const sitemap = read('sitemap.xml');
const internal = (html, where) => { for (const m of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) { const p = m[1]; if (p.endsWith('/')) assert.ok(existsSync(new URL(p.slice(1) + 'index.html', root)), where + ' broken link ' + p); } };

const weekly = read('weekly/index.html');
assert.match(weekly, /<h1[^>]*>Central bank rates this week<\/h1>/);
assert.ok(weekly.includes('rel="canonical" href="https://tradeninety.com/weekly/"'));
assert.ok(weekly.includes('All 28 policy-rate gaps'), 'The index renders the current or latest digest');
assert.equal((weekly.match(/href="\/pairs\/[a-z]{3}-[a-z]{3}\/"/g) || []).length >= 28, true, 'Digest links to all 28 pair pages');
assert.ok(sitemap.includes('https://tradeninety.com/weekly/'));
internal(weekly, 'weekly index');
assert.doesNotMatch(weekly.replace(/<script[\s\S]*?<\/script>/g, ''), /undefined|NaN|\[object/);

for (const d of archive) {
  const path = 'decisions/' + d.id + '/index.html';
  assert.ok(existsSync(new URL(path, root)), 'Decision page not built: ' + d.id);
  const html = read(path), found = schemas(html);
  assert.ok(html.includes('rel="canonical" href="https://tradeninety.com/decisions/' + d.id + '/"'));
  assert.ok(html.includes('href="' + d.source + '"'), d.id + ' links to its official source');
  const article = found.find(s => s['@type'] === 'Article');
  assert.equal(article.datePublished, d.decisionDate); assert.deepEqual(article.citation, [d.source]);
  const faq = found.find(s => s['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 5);
  assert.match(faq.mainEntity[0].name, /^Did the .+ (raise|cut) interest rates on .+\?$/, "Decision-day yes/no question comes first");
  for (const q of faq.mainEntity) assert.ok(html.includes('<h3>' + q.name + '</h3>') || html.includes(q.name), d.id + ' FAQ schema matches visible question');
  assert.ok(found.some(s => s['@type'] === 'BreadcrumbList'));
  assert.ok(sitemap.includes('https://tradeninety.com/decisions/' + d.id + '/'), 'Decision page missing from sitemap: ' + d.id);
  assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /undefined|NaN|\[object/, d.id + ' renders clean text');
  internal(html, d.id);
}
const index = read('decisions/index.html');
assert.ok(archive.slice(0, 8).every(d => index.includes('href="/decisions/' + d.id + '/"')), 'Decisions index links to recent decision pages');

const rss = read('rss.xml');
assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss version="2\.0"/);
assert.match(rss, /<\/channel><\/rss>\s*$/);
const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
assert.ok(items.length >= archive.length, 'Feed carries decisions and guides');
const links = items.map(i => i.match(/<link>([^<]+)<\/link>/)[1]);
assert.equal(new Set(links).size, links.length, 'Duplicate feed items');
let previous = Infinity;
for (const item of items) {
  const link = item.match(/<link>([^<]+)<\/link>/)[1], date = Date.parse(item.match(/<pubDate>([^<]+)<\/pubDate>/)[1]);
  assert.ok(link.startsWith('https://tradeninety.com/') && link.endsWith('/'));
  assert.ok(existsSync(new URL(new URL(link).pathname.slice(1) + 'index.html', root)), 'Feed item points to a page that was not built: ' + link);
  assert.ok(Number.isFinite(date) && date <= previous, 'Feed is sorted newest first'); previous = date;
  assert.doesNotMatch(item, /undefined|NaN/);
}
assert.ok(read('index.html').includes('type="application/rss+xml"'), 'Pages advertise the feed');
console.log('Content pages checked: weekly index, ' + archive.length + ' decision pages with schema and sources, RSS feed with ' + items.length + ' items.');
