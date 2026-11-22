// A scheduled central-bank decision is "missed" when its announcement date has passed
// (plus a grace period for time zones and the hourly source check) but the published
// rate record still carries an older decision. Pure function: no I/O, no clock.
export const GRACE_HOURS = 36; // measured from 00:00 UTC on the announcement date

export function findMissedDecisions({ snapshot, calendar, now, graceHours = GRACE_HOURS }) {
  const missed = [];
  for (const bank of snapshot?.banks || []) {
    const due = (calendar || [])
      .filter(e => e.currency === bank.code && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
      .filter(e => Date.parse(e.date + 'T00:00:00Z') + graceHours * 3600e3 <= now)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!due || !(bank.decisionDate < due.date)) continue;
    missed.push({
      code: bank.code, bank: bank.short, name: bank.name, meetingDate: due.date, title: due.title,
      calendarSource: due.source, recordedDecisionDate: bank.decisionDate, recordedRatePct: bank.rate,
      hoursOverdue: Math.floor((now - Date.parse(due.date + 'T00:00:00Z')) / 3600e3)
    });
  }
  return missed.sort((a, b) => a.meetingDate.localeCompare(b.meetingDate) || a.code.localeCompare(b.code));
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const longDate = d => { const x = new Date(d + 'T12:00:00Z'); return x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); };
export const issueTitle = m => 'Missed rate decision: ' + m.bank + ' ' + longDate(m.meetingDate) + ' not recorded';
export function issueBody(m) {
  return [
    'The ' + m.name + ' (' + m.bank + ') was scheduled to announce a policy decision on **' + longDate(m.meetingDate) + '** (' + m.title + ').',
    '',
    'TRADE90 still shows the decision of **' + longDate(m.recordedDecisionDate) + '** (' + m.recordedRatePct + '%), ' + m.hoursOverdue + ' hours after the scheduled date. Every page that uses the ' + m.code + ' rate may be out of date until this is fixed.',
    '',
    'What to do:',
    '1. Open the official announcement: ' + m.calendarSource,
    '2. If the automatic parser should have read it, check the latest *TRADE90 hourly official-source watch* run log for `' + m.code + '`.',
    '3. Otherwise record the decision in `src/data/trade90-policy-snapshot.json` with the official source URL.',
    '',
    'This issue closes itself once the decision is recorded.'
  ].join('\n');
}
