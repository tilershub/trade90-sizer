// US rate context shared by the Fed pages and the XAUUSD / US100 / US30 pages.
// Every figure comes from TRADE90's published data files, with its own date.
import { officialPolicyDecisionCalendar } from '../data/trade90-decision-calendar.js';

const US_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const usDate = iso => { const d = new Date(iso + 'T12:00:00Z'); return US_MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
export const usShortDate = iso => { const d = new Date(iso + 'T12:00:00Z'); return US_MONTHS[d.getUTCMonth()].slice(0, 3) + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
const pct = n => n.toFixed(Math.abs(n * 100 - Math.round(n * 100)) < 1e-8 ? 2 : 3) + '%';
export const fedRangeText = fed => pct(fed.rate - 0.125) + '–' + pct(fed.rate + 0.125);

// UTC instant of a wall-clock time in New York on a date, handling daylight saving.
export function newYorkToUtc(isoDate, hour, minute = 0) {
  for (const offset of [4, 5]) {
    const t = Date.UTC(+isoDate.slice(0, 4), +isoDate.slice(5, 7) - 1, +isoDate.slice(8, 10), hour + offset, minute);
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(t));
    const h = +parts.find(p => p.type === 'hour').value, m = +parts.find(p => p.type === 'minute').value;
    if (h === hour && m === minute) return new Date(t);
  }
  throw new Error('Could not resolve New York time for ' + isoDate);
}
export const etZone = isoDate => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' }).formatToParts(newYorkToUtc(isoDate, 14)).find(p => p.type === 'timeZoneName').value; // EST or EDT
const hhmm = d => String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');

// The FOMC releases its statement at 2:00 p.m. ET on the second day; the Chair's press conference follows at 2:30 p.m. ET.
export function fomcMeeting(entry) {
  const statement = newYorkToUtc(entry.date, 14), press = newYorkToUtc(entry.date, 14, 30);
  return { ...entry, zone: etZone(entry.date), statementUtc: statement.toISOString(), statementUtcText: hhmm(statement) + ' UTC', pressUtcText: hhmm(press) + ' UTC', projections: /projection/i.test(entry.title) };
}

export function upcomingFomc(nowMs, calendar = officialPolicyDecisionCalendar) {
  // A meeting stays "next" until its press conference has ended (about 3:30 p.m. ET).
  return calendar.filter(e => e.currency === 'USD').map(fomcMeeting)
    .filter(m => Date.parse(m.statementUtc) + 90 * 60e3 > nowMs)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function usContext({ snapshot, macro, yields, archive, nowMs }) {
  const fed = snapshot.banks.find(b => b.code === 'USD');
  const usd = yields?.currencies?.USD;
  const series = macro?.countries?.USD?.series || {};
  const last = key => { const s = series[key]; const p = s?.points?.[s.points.length - 1]; return s && p && s.status === 'ok' ? { value: p.value, date: p.date, frequency: s.frequency } : null; };
  const cpi = last('inflation'), unemployment = last('unemployment'), gdp = last('gdp');
  const y2 = usd?.verified && Number.isFinite(usd?.yields?.['2Y']) ? usd.yields['2Y'] : null;
  const y10 = usd?.verified && Number.isFinite(usd?.yields?.['10Y']) ? usd.yields['10Y'] : null;
  const fedDecisions = (archive || []).filter(d => d.code === 'USD').sort((a, b) => b.decisionDate.localeCompare(a.decisionDate));
  return {
    fed, fedRange: fedRangeText(fed), fedMid: fed.rate, lastDecision: fedDecisions[0] || null, fedDecisions,
    upcoming: upcomingFomc(nowMs), yieldsAsOf: usd?.asOf || null, y2, y10, yieldSource: usd?.source || null,
    twoYearMinusFedBp: y2 === null ? null : Math.round((y2 - fed.rate) * 1000) / 10,
    cpi, unemployment, gdp,
    // Approximate, backward-looking: nominal minus the latest headline CPI year-on-year rate. Not a TIPS real yield.
    realFed: cpi ? Math.round((fed.rate - cpi.value) * 100) / 100 : null,
    real10: cpi && y10 !== null ? Math.round((y10 - cpi.value) * 100) / 100 : null
  };
}
export const signedPct = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(2) + ' pp';
