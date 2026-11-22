import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { newYorkToUtc, etZone, upcomingFomc, usContext, fedRangeText, usDate } from '../src/lib/trade90-us-context.js';
import { markets } from '../src/data/trade90-markets.js';
import { officialPolicyDecisionCalendar, validatePolicyDecisionCalendar } from '../src/data/trade90-decision-calendar.js';

// 2:00 p.m. New York time across daylight saving changes.
assert.equal(newYorkToUtc('2026-12-09', 14).toISOString(), '2026-12-09T19:00:00.000Z'); assert.equal(etZone('2026-12-09'), 'EST');
assert.equal(newYorkToUtc('2027-06-09', 14).toISOString(), '2027-06-09T18:00:00.000Z'); assert.equal(etZone('2027-06-09'), 'EDT');
assert.equal(newYorkToUtc('2027-03-17', 14, 30).toISOString(), '2027-03-17T18:30:00.000Z', 'US clocks change on 14 Mar 2027');
assert.equal(newYorkToUtc('2027-11-17', 14).toISOString(), '2027-11-17T19:00:00.000Z', 'Back to EST after 7 Nov 2027');
assert.equal(usDate('2026-12-09'), 'December 9, 2026');
assert.equal(fedRangeText({ rate: 3.875 }), '3.75%–4.00%');

// Revised 2027 FOMC schedule (Fed press release, 12 Nov 2026): seven decisions, none in October or December.
const fed2027 = officialPolicyDecisionCalendar.filter(e => e.currency === 'USD' && e.date.startsWith('2027')).map(e => e.date);
assert.deepEqual(fed2027, ['2027-01-27', '2027-03-17', '2027-04-28', '2027-06-09', '2027-07-28', '2027-09-15', '2027-11-17']);
assert.equal(validatePolicyDecisionCalendar().valid, true);
// A meeting stays "next" until the press conference is over.
assert.equal(upcomingFomc(Date.parse('2026-12-09T20:00:00Z'))[0].date, '2026-12-09');
assert.equal(upcomingFomc(Date.parse('2026-12-09T20:31:00Z'))[0].date, '2027-01-27');

const ctx = usContext({
  snapshot: { banks: [{ code: 'USD', rate: 3.875, effectiveDate: '2026-10-29' }] },
  macro: { countries: { USD: { series: { inflation: { status: 'ok', frequency: 'Monthly', points: [{ date: '2026-09-01', value: 3.74 }] }, unemployment: { status: 'stale', points: [{ date: '2026-01-01', value: 4 }] } } } } },
  yields: { currencies: { USD: { verified: true, asOf: '2026-11-20', yields: { '2Y': 4.63, '10Y': 4.92 } } } },
  archive: [{ code: 'USD', id: 'fed-2026-10-28', decisionDate: '2026-10-28', changeBp: 0 }, { code: 'GBP', decisionDate: '2026-11-05' }],
  nowMs: Date.parse('2026-11-22T00:00:00Z')
});
assert.equal(ctx.twoYearMinusFedBp, 75.5); assert.equal(ctx.realFed, 0.13); assert.equal(ctx.real10, 1.18);
assert.equal(ctx.unemployment, null, 'Stale series are not shown'); assert.equal(ctx.lastDecision.id, 'fed-2026-10-28');
const noYields = usContext({ snapshot: { banks: [{ code: 'USD', rate: 3.875 }] }, macro: {}, yields: { currencies: { USD: { verified: false, yields: { '2Y': 9 } } } }, archive: [], nowMs: 0 });
assert.equal(noYields.y2, null, 'Unverified yields are never shown'); assert.equal(noYields.real10, null);

assert.deepEqual(markets.map(m => m.slug), ['xauusd', 'us100', 'us30']);
for (const m of markets) { assert.ok(m.title.length + 10 <= 62, m.title); assert.ok(m.faq.length >= 3 && m.mechanisms.length >= 3 && m.caveat); }

// Built output, when present.
const read = p => readFileSync(new URL('../dist/' + p, import.meta.url), 'utf8');
if (existsSync(new URL('../dist/next-fed-meeting/index.html', import.meta.url))) {
  for (const p of ['next-fed-meeting/index.html', 'markets/index.html', 'markets/xauusd/index.html', 'markets/us100/index.html', 'markets/us30/index.html']) {
    const html = read(p);
    assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /undefined|NaN|\[object/, p);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'FAQPage');
    if (faq) for (const q of faq.mainEntity) assert.ok(html.includes(q.name.replace(/'/g, '&#39;')) || html.includes(q.name), p + ' FAQ visible: ' + q.name);
  }
  assert.match(read('next-fed-meeting/index.html'), /<title>Next Fed Meeting: [A-Z][a-z]{2} \d{1,2}, \d{4} at 2:00 PM E[SD]T \| TRADE90<\/title>/);
  assert.match(read('central-banks/fed/index.html'), /<title>Fed Interest Rate Today: \d\.\d{2}%–\d\.\d{2}% \| TRADE90<\/title>/);
  const sitemap = read('sitemap-0.xml');
  for (const p of ['/next-fed-meeting/', '/markets/', '/markets/xauusd/', '/markets/us100/', '/markets/us30/']) assert.ok(sitemap.includes('https://tradeninety.com' + p), 'Sitemap ' + p);
}
console.log('Fed and markets pages passed: ET/UTC times across daylight saving, revised 2027 FOMC schedule, US data rules, built pages and sitemap.');
