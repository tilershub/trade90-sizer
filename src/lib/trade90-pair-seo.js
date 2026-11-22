// Search-facing copy for the 28 pair pages: titles, descriptions, names and the
// decisions that moved each gap. Pure functions; every figure comes from the data.
import { formatBp } from './trade90-rates.js';

export const CURRENCY_NAMES = { USD: 'US dollar', EUR: 'euro', GBP: 'British pound', JPY: 'Japanese yen', CHF: 'Swiss franc', CAD: 'Canadian dollar', AUD: 'Australian dollar', NZD: 'New Zealand dollar' };
// Widely used market nicknames only; pairs without a well-established one are left out.
export const PAIR_NICKNAMES = { EURUSD: 'Fiber', GBPUSD: 'Cable', USDCHF: 'Swissy', USDCAD: 'Loonie', AUDUSD: 'Aussie', NZDUSD: 'Kiwi', GBPJPY: 'Guppy', EURGBP: 'Chunnel' };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
export const signedBp = n => (n > 0 ? '+' : n < 0 ? '−' : '') + formatBp(Math.abs(n));
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const shortDate = d => { const x = new Date(d + 'T12:00:00Z'); return x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); };
const pct = n => n.toFixed(Math.abs(n * 100 - Math.round(n * 100)) < 1e-8 ? 2 : 3) + '%';
const rateText = bank => bank.code === 'USD' ? pct(bank.rate - 0.125) + '–' + pct(bank.rate + 0.125) : pct(bank.rate);

export const pairNames = pair => cap(CURRENCY_NAMES[pair.base]) + ' vs ' + CURRENCY_NAMES[pair.quote];

// The layout appends " | TRADE90" (10 characters). Keep the whole title within ~62 characters so
// Google shows it in full; lead with the query people type and the live gap.
export const TITLE_SUFFIX_LENGTH = 10;
export function pairTitle(pair) {
  const core = pair.label + ' Interest Rate Differential: ' + signedBp(pair.signedBp) + ' bp';
  const withBanks = core + ' (' + pair.baseBank.short + ' vs ' + pair.quoteBank.short + ')';
  return withBanks.length + TITLE_SUFFIX_LENGTH <= 62 ? withBanks : core;
}

export function pairDescription(pair, asOf, nextDecision) {
  const who = pair.higher === 'Equal' ? 'The two benchmarks are equal.' : pair.higher + "'s rate is " + formatBp(pair.absBp) + ' bp higher.';
  let text = pair.baseBank.short + ' ' + rateText(pair.baseBank) + ' vs ' + pair.quoteBank.short + ' ' + rateText(pair.quoteBank) + '. ' + who + ' Updated ' + shortDate(asOf) + '.';
  if (nextDecision) text += ' Next decision: ' + nextDecision.bank + ' ' + shortDate(nextDecision.date) + '.';
  const tail = ' Gap history, macro data and 90-day outlook.';
  return (text + tail).length <= 158 ? text + tail : text;
}

// Every recorded decision by either bank, with its effect on this pair's gap (base minus quote).
export function gapMovingDecisions(pair, archive, limit = 8) {
  return archive
    .filter(d => d.code === pair.base || d.code === pair.quote)
    .map(d => ({ ...d, gapEffectBp: d.changeBp === null || d.changeBp === undefined ? null : (d.code === pair.base ? d.changeBp : -d.changeBp) || 0 }))
    .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate) || a.code.localeCompare(b.code))
    .slice(0, limit);
}

export function latestDecisionAnswer(pair, moves) {
  const d = moves[0];
  if (!d) return null;
  const effect = d.gapEffectBp === null ? 'TRADE90 has not verified the size of that change, so its effect on the ' + pair.label + ' gap is not quantified'
    : d.gapEffectBp === 0 ? 'it left the ' + pair.label + ' policy-rate gap unchanged'
    : 'it moved the ' + pair.label + ' policy-rate gap by ' + signedBp(d.gapEffectBp) + ' bp';
  const what = d.changeBp === 0 ? 'held its benchmark at ' + pct(d.ratePct) : d.changeBp > 0 ? 'raised its benchmark by ' + d.changeBp + ' bp' : d.changeBp < 0 ? 'cut its benchmark by ' + Math.abs(d.changeBp) + ' bp' : 'changed its benchmark';
  return 'The most recent decision by either central bank was the ' + d.short + ' on ' + shortDate(d.decisionDate) + ', which ' + what + '; ' + effect + '. The gap is now ' + signedBp(pair.signedBp) + ' bp.';
}
