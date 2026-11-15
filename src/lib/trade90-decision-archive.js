// Append-only archive of verified central-bank decisions, so each decision keeps a
// permanent page after the live snapshot moves on to the next meeting. Pure functions.
export const decisionId = (short, date) => String(short).toLowerCase() + '-' + date;
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s + 'T00:00:00Z'));
const round = n => Math.round(n * 100000) / 100000;

export function previousRate(bank, rateHistory = []) {
  const recorded = rateHistory.find(r => r.code === bank.code && r.decisionDate === bank.decisionDate && Number.isFinite(r.previousRatePct) && Math.abs(r.ratePct - bank.rate) < 1e-9);
  if (recorded) return round(recorded.previousRatePct);
  const text = String(bank.decision || '');
  if (/^hold\b/i.test(text)) return round(bank.rate);
  const size = text.match(/(\d+(?:\.\d+)?)\s*bp/i);
  if (size && /^hike\b/i.test(text)) return round(bank.rate - Number(size[1]) / 100);
  if (size && /^cut\b/i.test(text)) return round(bank.rate + Number(size[1]) / 100);
  return null; // direction or size not stated: never guess
}

export function toArchiveEntry(bank, rateHistory, recordedAt) {
  if (!bank || !isDate(bank.decisionDate) || !isDate(bank.effectiveDate) || !Number.isFinite(bank.rate)) return null;
  if (!/^https:\/\//.test(String(bank.source || '')) || !bank.short || !bank.code || !bank.decision) return null;
  const previous = previousRate(bank, rateHistory);
  const entry = { id: decisionId(bank.short, bank.decisionDate), code: bank.code, short: bank.short, bank: bank.name, benchmark: bank.benchmark,
    decision: bank.decision, decisionDate: bank.decisionDate, effectiveDate: bank.effectiveDate, ratePct: round(bank.rate),
    previousRatePct: previous, changeBp: previous === null ? null : Math.round((bank.rate - previous) * 10000) / 100, source: bank.source, recordedAt };
  if (Array.isArray(bank.range) && bank.range.length === 2 && bank.range.every(Number.isFinite)) entry.rangePct = bank.range.map(round);
  return entry;
}

const SAME = ['decision', 'effectiveDate', 'ratePct', 'previousRatePct', 'changeBp', 'source', 'benchmark'];
export function mergeDecisionArchive(archive, snapshot, rateHistory = [], recordedAt = new Date().toISOString()) {
  const decisions = Array.isArray(archive?.decisions) ? archive.decisions.map(d => ({ ...d })) : [];
  let changed = !Array.isArray(archive?.decisions);
  for (const bank of snapshot?.banks || []) {
    const entry = toArchiveEntry(bank, rateHistory, recordedAt);
    if (!entry) continue;
    const index = decisions.findIndex(d => d.id === entry.id);
    if (index === -1) { decisions.push(entry); changed = true; continue; }
    const old = decisions[index];
    if (SAME.some(k => JSON.stringify(old[k]) !== JSON.stringify(entry[k])) || JSON.stringify(old.rangePct) !== JSON.stringify(entry.rangePct)) {
      decisions[index] = { ...entry, recordedAt: old.recordedAt, correctedAt: recordedAt };
      changed = true;
    }
  }
  decisions.sort((a, b) => b.decisionDate.localeCompare(a.decisionDate) || a.code.localeCompare(b.code));
  return { changed, archive: { schemaVersion: 1, description: 'Append-only record of verified central-bank policy decisions published by TRADE90.', decisions } };
}

const pct = n => { const h = n * 100; return n.toFixed(Math.abs(h - Math.round(h)) < 1e-8 ? 2 : 3) + '%'; };
// The Fed publishes a 25 bp target range; the archive stores its midpoint.
export const archiveRateText = (entry, value = entry.ratePct) => value === null || value === undefined ? null
  : entry.code === 'USD' ? pct(value - 0.125) + '–' + pct(value + 0.125) : pct(value);
export function decisionVerb(entry) {
  if (entry.changeBp === null) return 'adjusted';
  return entry.changeBp > 0 ? 'raised' : entry.changeBp < 0 ? 'cut' : 'held';
}
