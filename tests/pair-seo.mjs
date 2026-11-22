import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pairTitle, pairDescription, gapMovingDecisions, latestDecisionAnswer, signedBp, TITLE_SUFFIX_LENGTH } from '../src/lib/trade90-pair-seo.js';
import { allTrade90Pairs, rateSnapshot } from '../src/lib/trade90-v3.js';
const bank = (code, short, rate) => ({ code, short, name: short, rate });
const pair = (base, quote, br, qr, bs, qs) => { const signedBp = Math.round((br - qr) * 10000) / 100; return { symbol: base + quote, label: base + '/' + quote, base, quote, baseBank: bank(base, bs, br), quoteBank: bank(quote, qs, qr), signedBp, absBp: Math.abs(signedBp), higher: signedBp > 0 ? base : signedBp < 0 ? quote : 'Equal' }; };
const gbpusd = pair('GBP', 'USD', 4, 3.875, 'BoE', 'Fed');
assert.equal(signedBp(-137.5), '−137.5'); assert.equal(signedBp(12.5), '+12.5'); assert.equal(signedBp(0), '0');
for (const p of allTrade90Pairs) {
  const t = pairTitle(p);
  assert.ok(t.startsWith(p.label + ' Interest Rate Differential: '), t);
  assert.ok(t.length + TITLE_SUFFIX_LENGTH <= 62, 'Title shown in full: ' + t);
  const d = pairDescription(p, rateSnapshot.asOf, { bank: 'Fed', date: '2026-12-09' });
  assert.ok(d.length <= 158 && d.includes(p.baseBank.short) && d.includes(p.quoteBank.short), d);
}
assert.equal(pairDescription(gbpusd, '2026-11-22', { bank: 'Fed', date: '2026-12-09' }), "BoE 4.00% vs Fed 3.75%–4.00%. GBP's rate is 12.5 bp higher. Updated 22 Nov 2026. Next decision: Fed 9 Dec 2026. Gap history, macro data and 90-day outlook.");
assert.match(pairDescription(pair('EUR', 'CHF', 0, 0, 'ECB', 'SNB'), '2026-11-22', null), /The two benchmarks are equal\. Updated 22 Nov 2026\./);
const archive = [
  { id: 'fed-2026-10-28', code: 'USD', short: 'Fed', decisionDate: '2026-10-28', decision: 'Hold', changeBp: 0, ratePct: 3.875 },
  { id: 'boe-2026-11-05', code: 'GBP', short: 'BoE', decisionDate: '2026-11-05', decision: 'Hike +25 bp', changeBp: 25, ratePct: 4 },
  { id: 'rba-2026-11-03', code: 'AUD', short: 'RBA', decisionDate: '2026-11-03', decision: 'Hike +25 bp', changeBp: 25, ratePct: 4.85 },
  { id: 'boj-2026-09-18', code: 'JPY', short: 'BoJ', decisionDate: '2026-09-18', decision: 'Policy rate adjustment', changeBp: null, ratePct: 1.25 }
];
assert.deepEqual(gapMovingDecisions(gbpusd, archive).map(d => [d.id, d.gapEffectBp]), [['boe-2026-11-05', 25], ['fed-2026-10-28', 0]], 'Only this pair’s banks, newest first');
assert.deepEqual(gapMovingDecisions(pair('USD', 'GBP', 3.875, 4, 'Fed', 'BoE'), archive).map(d => d.gapEffectBp), [-25, 0], 'A quote-currency hike moves the gap towards the quote currency');
assert.equal(gapMovingDecisions(pair('USD', 'JPY', 3.875, 1.25, 'Fed', 'BoJ'), archive).find(d => d.code === 'JPY').gapEffectBp, null, 'Unverified size stays unquantified');
assert.equal(latestDecisionAnswer(gbpusd, gapMovingDecisions(gbpusd, archive)), 'The most recent decision by either central bank was the BoE on 5 Nov 2026, which raised its benchmark by 25 bp; it moved the GBP/USD policy-rate gap by +25 bp. The gap is now +12.5 bp.');
assert.equal(latestDecisionAnswer(gbpusd, []), null);

// Built pages, when present.
const page = new URL('../dist/pairs/gbp-usd/index.html', import.meta.url);
if (existsSync(page)) {
  const html = readFileSync(page, 'utf8');
  assert.ok(html.includes('id="gap-history"'), 'Gap history section rendered');
  const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity[0].name, 'How did the latest central bank decision change the GBP/USD interest rate gap?');
  for (const q of faq.mainEntity) assert.ok(html.includes(q.name.replace(/&/g, '&amp;')) || html.includes(q.name), 'FAQ schema question is visible: ' + q.name);
}
console.log('Pair SEO passed: 28 titles within display length, descriptions, gap-moving decisions and FAQ parity.');
