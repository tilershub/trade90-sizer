import assert from 'node:assert/strict';
import { mondayOf, isoWeek, weekSlug, weekRangeLabel, buildDigest, buildWeeklyDigests, digestFaq, formatBpSigned } from '../src/lib/trade90-weekly.js';
import { mergeDecisionArchive, previousRate, archiveRateText, decisionVerb, decisionId } from '../src/lib/trade90-decision-archive.js';
const at = s => Date.parse(s);

// ISO week arithmetic, including year boundaries.
assert.equal(new Date(mondayOf(at('2026-11-15T23:59:00Z'))).toISOString().slice(0,10), '2026-11-09', 'Sunday belongs to the week that started Monday');
assert.equal(weekSlug(at('2026-11-09T00:00:00Z')), '2026-w46');
assert.deepEqual(isoWeek(at('2027-01-01T00:00:00Z')), { year: 2026, week: 53 }, '1 Jan 2027 is in ISO week 53 of 2026');
assert.deepEqual(isoWeek(at('2024-12-30T00:00:00Z')), { year: 2025, week: 1 });
assert.equal(weekRangeLabel(at('2026-11-09T00:00:00Z')), '9–15 November 2026');
assert.equal(weekRangeLabel(at('2026-11-30T00:00:00Z')), '30 November – 6 December 2026');
assert.equal(weekRangeLabel(at('2026-12-28T00:00:00Z')), '28 December 2026 – 3 January 2027');
assert.equal(formatBpSigned(-137.5), '−137.5 bp'); assert.equal(formatBpSigned(25), '+25 bp'); assert.equal(formatBpSigned(0), '0 bp');

const pairs = [{ symbol: 'EURUSD', label: 'EUR/USD', base: 'EUR', quote: 'USD' }, { symbol: 'USDJPY', label: 'USD/JPY', base: 'USD', quote: 'JPY' }];
const record = (generatedAt, rates, states, modelVersion = '4.0.1', extra = {}) => ({ generatedAt, modelVersion, rates, states, ...extra });
const records = [
  record('2026-11-06T10:00:00Z', { EUR: 2.5, USD: 3.875, JPY: 1.25 }, { EURUSD: 'unclear', USDJPY: 'unclear' }),
  record('2026-11-11T10:00:00Z', { EUR: 2.5, USD: 3.625, JPY: 1.25 }, { EURUSD: 'narrowing', USDJPY: 'unclear' }),
  record('2026-11-13T10:00:00Z', { EUR: 2.5, USD: 3.625, JPY: 1.25 }, { EURUSD: 'narrowing', USDJPY: 'unclear' }),
  record('2026-11-14T10:00:00Z', { EUR: 9, USD: 9, JPY: 9 }, { EURUSD: 'widening', USDJPY: 'widening' }, '4.0.1', { excludedFromEvaluation: true })
];
const calendar = [{ currency: 'USD', date: '2026-11-11', title: 'FOMC policy decision' }, { currency: 'EUR', date: '2026-11-19', title: 'Governing Council decision' }, { currency: 'JPY', date: '2026-12-18', title: 'Monetary Policy Meeting' }];
const decisions = [{ id: 'fed-2026-11-11', code: 'USD', short: 'Fed', decisionDate: '2026-11-11', ratePct: 3.625, previousRatePct: 3.875, changeBp: -25 }];
const start = at('2026-11-09T00:00:00Z');
const d = buildDigest({ records, calendar, decisions, pairs, startMs: start, now: at('2026-11-16T03:00:00Z') });
assert.equal(d.complete, true); assert.equal(d.slug, '2026-w46'); assert.equal(d.start, '2026-11-09'); assert.equal(d.end, '2026-11-15');
assert.equal(d.baselineAt, '2026-11-06T10:00:00Z'); assert.equal(d.closingAt, '2026-11-13T10:00:00Z', 'Excluded records are never used');
assert.deepEqual(d.rateChanges.map(c => [c.code, c.from, c.to, c.changeBp, c.decision.id]), [['USD', 3.875, 3.625, -25, 'fed-2026-11-11']]);
const eur = d.gapRows.find(r => r.symbol === 'EURUSD'), jpy = d.gapRows.find(r => r.symbol === 'USDJPY');
assert.deepEqual([eur.prevGapBp, eur.gapBp, eur.changeBp, eur.stateChanged], [-137.5, -112.5, 25, true], 'USD cut narrows a negative EUR/USD gap by 25 bp');
assert.deepEqual([jpy.prevGapBp, jpy.gapBp, jpy.changeBp, jpy.stateChanged], [262.5, 237.5, -25, false]);
assert.equal(d.widest.symbol, 'USDJPY'); assert.equal(d.modelChanged, false);
assert.deepEqual(d.decisionsThisWeek.map(e => [e.currency, e.outcome?.id]), [['USD', 'fed-2026-11-11']]);
assert.deepEqual(d.upcoming.map(e => e.currency), ['EUR'], 'Only the following 14 days');
assert.deepEqual(d.nextScheduled.map(e => e.currency), ['EUR', 'JPY']);
assert.match(d.summary, /^In the week of 9–15 November 2026, 1 tracked central bank changed its policy rate \(USD −25 bp\) and 1 pair outlook changed out of 2\. The widest policy-rate gap is USD\/JPY at \+237\.5 bp\.$/);
const faq = digestFaq(d);
assert.ok(faq.length >= 3 && faq.every(x => x.q.endsWith('?') && x.a.length > 30 && !/undefined|NaN|null/.test(x.q + x.a)));

// A week in progress uses only records up to "now" and is not published as an archive page.
const live = buildDigest({ records, calendar, decisions, pairs, startMs: start, now: at('2026-11-12T00:00:00Z') });
assert.equal(live.complete, false); assert.equal(live.closingAt, '2026-11-11T10:00:00Z'); assert.match(live.summary, /^So far in the week of/);
const all = buildWeeklyDigests({ records, calendar, decisions, pairs, now: at('2026-11-18T00:00:00Z'), start: '2026-11-09' });
assert.deepEqual(all.completed.map(x => x.slug), ['2026-w46']); assert.equal(all.current.slug, '2026-w47');
assert.equal(all.current.rateChanges.length, 0); assert.equal(all.current.stateChanges.length, 0);
assert.match(all.current.summary, /no tracked central bank changed its policy rate and no pair outlook changed/);
// No baseline before the week: no digest is invented.
assert.equal(buildDigest({ records: records.slice(1), calendar, decisions, pairs, startMs: start, now: at('2026-11-16T03:00:00Z') }), null);
// A model version change is disclosed.
const versioned = buildDigest({ records: [record('2026-11-06T10:00:00Z', { EUR: 2.5, USD: 3.875, JPY: 1.25 }, { EURUSD: 'unavailable', USDJPY: 'unclear' }, '4.0.0'), records[1]], calendar, decisions, pairs, startMs: start, now: at('2026-11-16T03:00:00Z') });
assert.equal(versioned.modelChanged, true); assert.match(digestFaq(versioned)[1].a, /version 4\.0\.0 to 4\.0\.1/);

// Decision archive.
const bank = (o = {}) => ({ code: 'CAD', name: 'Bank of Canada', short: 'BoC', benchmark: 'Target for overnight rate', rate: 2.5, decision: 'Hike +25 bp', decisionDate: '2026-10-28', effectiveDate: '2026-10-28', source: 'https://www.bankofcanada.ca/x', ...o });
assert.equal(previousRate(bank()), 2.25); assert.equal(previousRate(bank({ decision: 'Hold' })), 2.5); assert.equal(previousRate(bank({ decision: 'Cut -50 bp' })), 3);
assert.equal(previousRate(bank({ decision: 'Policy rate adjustment' })), null, 'Never guess an unstated change');
assert.equal(previousRate(bank({ decision: 'Policy rate adjustment' }), [{ code: 'CAD', decisionDate: '2026-10-28', previousRatePct: 2.0, ratePct: 2.5 }]), 2.0, 'Recorded history wins');
assert.equal(decisionId('BoC', '2026-10-28'), 'boc-2026-10-28');
const first = mergeDecisionArchive(null, { banks: [bank(), bank({ code: 'USD', short: 'Fed', name: 'Federal Reserve', rate: 3.875, range: [3.75, 4], decision: 'Hold', source: 'https://www.federalreserve.gov/x' }), bank({ short: 'Bad', source: 'http://insecure' })] }, [], '2026-11-15T00:00:00Z');
assert.equal(first.changed, true); assert.deepEqual(first.archive.decisions.map(x => x.id).sort(), ['boc-2026-10-28', 'fed-2026-10-28'], 'Invalid entries are skipped');
const fed = first.archive.decisions.find(x => x.code === 'USD');
assert.equal(archiveRateText(fed), '3.75%–4.00%'); assert.equal(decisionVerb(fed), 'held'); assert.equal(fed.changeBp, 0);
const boc = first.archive.decisions.find(x => x.code === 'CAD');
assert.equal(archiveRateText(boc), '2.50%'); assert.equal(archiveRateText(boc, boc.previousRatePct), '2.25%'); assert.equal(decisionVerb(boc), 'raised');
const same = mergeDecisionArchive(first.archive, { banks: [bank()] }, [], '2026-11-16T00:00:00Z');
assert.equal(same.changed, false, 'Re-running without new information does not rewrite the archive');
const next = mergeDecisionArchive(first.archive, { banks: [bank({ rate: 2.25, decision: 'Cut -25 bp', decisionDate: '2026-12-09', effectiveDate: '2026-12-10' })] }, [], '2026-12-10T00:00:00Z');
assert.equal(next.changed, true); assert.equal(next.archive.decisions.length, 3, 'A new decision is appended; earlier decisions are kept');
assert.equal(next.archive.decisions[0].id, 'boc-2026-12-09'); assert.equal(decisionVerb(next.archive.decisions[0]), 'cut');
const corrected = mergeDecisionArchive(first.archive, { banks: [bank({ source: 'https://www.bankofcanada.ca/corrected' })] }, [], '2026-11-20T00:00:00Z');
assert.equal(corrected.archive.decisions.find(x => x.code === 'CAD').recordedAt, '2026-11-15T00:00:00Z'); assert.equal(corrected.archive.decisions.find(x => x.code === 'CAD').correctedAt, '2026-11-20T00:00:00Z');
console.log('Weekly digest and decision archive passed: ISO weeks, diffs, summaries, FAQ, in-progress weeks and append-only decisions.');
