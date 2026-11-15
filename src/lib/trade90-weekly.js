// Weekly "what changed" digests, derived only from the append-only model history,
// the decision calendar and the decision archive. Pure functions: no I/O, no clock.
export const WEEKLY_START = '2026-11-09'; // first Monday covered by published digests
const DAY = 86400000;
const iso = ms => new Date(ms).toISOString().slice(0, 10);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const mondayOf = ms => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - ((d.getUTCDay() + 6) % 7) * DAY;
};
export function isoWeek(ms) {
  const monday = mondayOf(ms);
  const year = new Date(monday + 3 * DAY).getUTCFullYear(); // ISO year is the Thursday's year
  return { year, week: Math.round((monday - mondayOf(Date.UTC(year, 0, 4))) / (7 * DAY)) + 1 };
}
export const weekSlug = ms => { const { year, week } = isoWeek(ms); return year + '-w' + String(week).padStart(2, '0'); };
export function weekRangeLabel(startMs) {
  const a = new Date(startMs), b = new Date(startMs + 6 * DAY);
  const tail = b.getUTCDate() + ' ' + MONTHS[b.getUTCMonth()] + ' ' + b.getUTCFullYear();
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return a.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()] + ' ' + a.getUTCFullYear() + ' – ' + tail;
  if (a.getUTCMonth() !== b.getUTCMonth()) return a.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()] + ' – ' + tail;
  return a.getUTCDate() + '–' + tail;
}
export const longDate = isoDate => { const d = new Date(isoDate + 'T12:00:00Z'); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
export const formatBpSigned = n => { const v = Math.round(n * 10) / 10; return (v > 0 ? '+' : v < 0 ? '−' : '') + String(Math.abs(v)) + ' bp'; };
export const STATE_LABELS = { widening: 'Gap may widen', narrowing: 'Gap may narrow', unchanged: 'Gap may hold', unclear: 'Uncertain', unavailable: 'Unavailable' };
export const stateLabel = state => STATE_LABELS[state] || 'Not assessed';

const usable = r => r && !r.excludedFromEvaluation && Number.isFinite(Date.parse(r.generatedAt)) && r.rates && r.states;
function lastBefore(records, ms) {
  let best = null;
  for (const r of records) {
    if (!usable(r)) continue;
    const t = Date.parse(r.generatedAt);
    if (t < ms && (!best || t >= Date.parse(best.generatedAt))) best = r;
  }
  return best;
}
const gapBp = (rates, pair) => Number.isFinite(rates?.[pair.base]) && Number.isFinite(rates?.[pair.quote])
  ? Math.round((rates[pair.base] - rates[pair.quote]) * 10000) / 100 : null;

export function buildDigest({ records, calendar = [], decisions = [], pairs, startMs, now }) {
  const endMs = startMs + 7 * DAY;
  const complete = endMs <= now;
  const baseline = lastBefore(records, startMs);
  const closing = lastBefore(records, Math.min(endMs, now + 1));
  if (!baseline || !closing) return null;
  const start = iso(startMs), end = iso(endMs - DAY);
  const inWeek = date => date >= start && date <= end;

  const rateChanges = Object.keys(closing.rates).sort().flatMap(code => {
    const from = baseline.rates[code], to = closing.rates[code];
    if (!Number.isFinite(from) || !Number.isFinite(to) || Math.abs(to - from) < 1e-9) return [];
    const decision = decisions.filter(d => d.code === code && d.decisionDate <= end).sort((a, b) => b.decisionDate.localeCompare(a.decisionDate))[0] || null;
    return [{ code, from, to, changeBp: Math.round((to - from) * 10000) / 100, decision }];
  });

  const gapRows = pairs.map(pair => {
    const gap = gapBp(closing.rates, pair), prev = gapBp(baseline.rates, pair);
    const state = closing.states[pair.symbol] || null, prevState = baseline.states[pair.symbol] || null;
    return { symbol: pair.symbol, label: pair.label, base: pair.base, quote: pair.quote, gapBp: gap, prevGapBp: prev,
      changeBp: gap !== null && prev !== null ? Math.round((gap - prev) * 100) / 100 : null,
      state, prevState, stateChanged: Boolean(state && prevState && state !== prevState) };
  });
  const stateChanges = gapRows.filter(r => r.stateChanged);
  const gapChanges = gapRows.filter(r => r.changeBp);
  const counts = gapRows.reduce((a, r) => (a[r.state] = (a[r.state] || 0) + 1, a), {});
  const widest = gapRows.filter(r => r.gapBp !== null).sort((a, b) => Math.abs(b.gapBp) - Math.abs(a.gapBp))[0] || null;
  const modelChanged = baseline.modelVersion !== closing.modelVersion;

  const decisionsThisWeek = calendar.filter(e => inWeek(e.date)).sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ ...e, outcome: decisions.find(d => d.code === e.currency && d.decisionDate === e.date) || null }));
  const upcomingFrom = iso(endMs), upcomingTo = iso(endMs + 13 * DAY);
  const upcoming = calendar.filter(e => e.date >= upcomingFrom && e.date <= upcomingTo).sort((a, b) => a.date.localeCompare(b.date));

  const nextScheduled = calendar.filter(e => e.date >= upcomingFrom).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const digest = { slug: weekSlug(startMs), start, end, rangeLabel: weekRangeLabel(startMs), complete,
    baselineAt: baseline.generatedAt, closingAt: closing.generatedAt, modelFrom: baseline.modelVersion, modelTo: closing.modelVersion, modelChanged,
    rateChanges, gapRows, gapChanges, stateChanges, counts, widest, decisionsThisWeek, upcoming, nextScheduled };
  digest.summary = digestSummary(digest);
  return digest;
}

export function digestSummary(d) {
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const rates = d.rateChanges.length
    ? plural(d.rateChanges.length, 'tracked central bank changed its policy rate', 'tracked central banks changed their policy rates') + ' (' + d.rateChanges.map(c => c.code + ' ' + formatBpSigned(c.changeBp)).join(', ') + ')'
    : 'no tracked central bank changed its policy rate';
  const outlook = d.stateChanges.length
    ? plural(d.stateChanges.length, 'pair outlook changed', 'pair outlooks changed') + ' out of ' + d.gapRows.length
    : 'no pair outlook changed';
  const widest = d.widest ? ' The widest policy-rate gap is ' + d.widest.label + ' at ' + formatBpSigned(d.widest.gapBp) + '.' : '';
  return (d.complete ? 'In the week of ' : 'So far in the week of ') + d.rangeLabel + ', ' + rates + ' and ' + outlook + '.' + widest;
}

export function buildWeeklyDigests({ records, calendar, decisions, pairs, now, start = WEEKLY_START }) {
  const first = mondayOf(Date.parse(start + 'T00:00:00Z'));
  const completed = [];
  let current = null;
  for (let startMs = first; startMs <= now; startMs += 7 * DAY) {
    const digest = buildDigest({ records, calendar, decisions, pairs, startMs, now });
    if (!digest) continue;
    if (digest.complete) completed.push(digest); else current = digest;
  }
  return { completed: completed.reverse(), current };
}

// Self-contained question/answer pairs, rendered visibly and as FAQPage schema.
export function digestFaq(d) {
  const period = (d.complete ? 'in the week of ' : 'so far in the week of ') + d.rangeLabel;
  const rate = d.rateChanges.length
    ? d.rateChanges.map(c => c.code + ' moved from ' + c.from.toFixed(2) + '% to ' + c.to.toFixed(2) + '% (' + formatBpSigned(c.changeBp) + ')').join('; ') + ' ' + period + ', based on the benchmarks TRADE90 tracks.'
    : 'None of the eight central banks tracked by TRADE90 (Fed, ECB, BoE, BoJ, SNB, BoC, RBA, RBNZ) changed its policy benchmark ' + period + '.';
  const outlook = d.stateChanges.length
    ? d.stateChanges.length + ' of ' + d.gapRows.length + ' pair outlooks changed ' + period + ': ' + d.stateChanges.map(r => r.label + ' (' + stateLabel(r.prevState) + ' to ' + stateLabel(r.state) + ')').join(', ') + '.' + (d.modelChanged ? ' The model was updated during the week (version ' + d.modelFrom + ' to ' + d.modelTo + '), so some changes reflect methodology, not new economic evidence.' : '')
    : 'No pair outlook changed ' + period + '.';
  const faq = [
    { q: 'Which central banks changed interest rates ' + period + '?', a: rate },
    { q: 'Which forex pair rate-gap outlooks changed ' + period + '?', a: outlook }
  ];
  if (d.widest) faq.push({ q: 'Which major forex pair has the widest interest rate gap?', a: 'Among the 28 pairs TRADE90 tracks, ' + d.widest.label + ' has the widest policy-rate gap at ' + formatBpSigned(d.widest.gapBp) + ' (' + d.widest.base + ' benchmark minus ' + d.widest.quote + ' benchmark), as of the model snapshot dated ' + longDate(d.closingAt.slice(0, 10)) + '.' });
  const next = d.nextScheduled[0];
  if (next) faq.push({ q: 'When is the next major central bank rate decision?', a: 'The next scheduled decision in the TRADE90 calendar after this week is ' + next.currency + ' on ' + longDate(next.date) + ' (' + next.title + '). Official schedules can change, so confirm on the central bank calendar.' });
  return faq;
}
