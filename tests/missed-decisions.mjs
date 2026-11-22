import assert from 'node:assert/strict';
import { findMissedDecisions, issueTitle, issueBody, GRACE_HOURS } from '../src/lib/trade90-missed-decisions.js';
import { syncIssues } from '../scripts/check-missed-decisions.mjs';
const snap = banks => ({ banks: banks.map(([code, short, decisionDate, rate]) => ({ code, short, name: short + ' bank', decisionDate, rate })) });
const cal = [
  { currency: 'GBP', date: '2026-11-05', title: 'MPC decision', source: 'https://www.bankofengland.co.uk/x' },
  { currency: 'GBP', date: '2026-12-17', title: 'MPC decision', source: 'https://www.bankofengland.co.uk/x' },
  { currency: 'AUD', date: '2026-11-03', title: 'Board decision', source: 'https://www.rba.gov.au/x' },
  { currency: 'USD', date: '2026-10-28', title: 'FOMC', source: 'https://www.federalreserve.gov/x' }
];
const at = s => Date.parse(s);
const stale = snap([['GBP', 'BoE', '2026-09-17', 3.75], ['AUD', 'RBA', '2026-09-29', 4.6], ['USD', 'Fed', '2026-10-28', 3.875]]);
// Reproduces the November 2026 failure: BoE and RBA decisions passed unrecorded.
const missed = findMissedDecisions({ snapshot: stale, calendar: cal, now: at('2026-11-22T08:00:00Z') });
assert.deepEqual(missed.map(m => [m.bank, m.meetingDate, m.recordedDecisionDate]), [['RBA', '2026-11-03', '2026-09-29'], ['BoE', '2026-11-05', '2026-09-17']]);
assert.equal(missed[1].hoursOverdue, 17 * 24 + 8);
// Grace period: not missed until 36 hours after 00:00 UTC on the announcement date.
assert.equal(GRACE_HOURS, 36);
assert.equal(findMissedDecisions({ snapshot: stale, calendar: cal.slice(0, 1), now: at('2026-11-06T11:59:00Z') }).length, 0);
assert.equal(findMissedDecisions({ snapshot: stale, calendar: cal.slice(0, 1), now: at('2026-11-06T12:00:00Z') }).length, 1);
// Recorded decisions and future meetings never alert.
const fresh = snap([['GBP', 'BoE', '2026-11-05', 4], ['AUD', 'RBA', '2026-11-03', 4.85], ['USD', 'Fed', '2026-10-28', 3.875]]);
assert.deepEqual(findMissedDecisions({ snapshot: fresh, calendar: cal, now: at('2026-12-18T11:00:00Z') }), []);
assert.deepEqual(findMissedDecisions({ snapshot: fresh, calendar: cal, now: at('2026-12-18T12:00:00Z') }).map(m => m.meetingDate), ['2026-12-17']);
assert.equal(issueTitle(missed[1]), 'Missed rate decision: BoE 5 November 2026 not recorded');
assert.match(issueBody(missed[1]), /still shows the decision of \*\*17 September 2026\*\* \(3\.75%\)/);

// Issue synchronisation against a fake GitHub API: open once, never duplicate, close when fixed.
const calls = []; let issues = []; let labelMade = false;
const gh = async (url, init = {}) => {
  const path = url.replace('https://api.github.com/repos/o/r', ''), method = init.method || 'GET';
  calls.push(method + ' ' + path.split('?')[0]); assert.equal(init.headers.Authorization, 'Bearer t');
  const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
  if (method === 'GET' && path.startsWith('/labels/')) return labelMade ? ok({}) : { ok: false, status: 404 };
  if (method === 'POST' && path === '/labels') { labelMade = true; return ok({}, 201); }
  if (method === 'GET') { assert.match(path, /labels=missed-rate-decision/); return ok(issues.filter(i => i.state === 'open')); }
  if (method === 'POST' && path === '/issues') { const b = JSON.parse(init.body); const i = { number: issues.length + 1, title: b.title, state: 'open' }; issues.push(i); assert.deepEqual(b.labels, ['missed-rate-decision']); return ok(i, 201); }
  if (method === 'POST' && /comments$/.test(path)) return ok({}, 201);
  if (method === 'PATCH') { const n = +path.split('/')[2]; issues.find(i => i.number === n).state = 'closed'; return ok({}); }
  throw new Error('unexpected ' + method + ' ' + path);
};
assert.deepEqual(await syncIssues({ missed, repo: 'o/r', token: 't', fetcher: gh }), ['Opened #1: Missed rate decision: RBA 3 November 2026 not recorded', 'Opened #2: Missed rate decision: BoE 5 November 2026 not recorded']);
assert.equal(calls.filter(c => c === 'POST /labels').length, 1, 'Label created once');
assert.deepEqual(await syncIssues({ missed, repo: 'o/r', token: 't', fetcher: gh }), ['Already open: Missed rate decision: RBA 3 November 2026 not recorded', 'Already open: Missed rate decision: BoE 5 November 2026 not recorded'], 'Hourly runs never duplicate an issue');
assert.deepEqual(await syncIssues({ missed: missed.slice(0, 1), repo: 'o/r', token: 't', fetcher: gh }), ['Already open: Missed rate decision: RBA 3 November 2026 not recorded', 'Closed #2: Missed rate decision: BoE 5 November 2026 not recorded']);
await assert.rejects(syncIssues({ missed, repo: 'o/r', token: 't', fetcher: async () => ({ ok: false, status: 403 }) }), /HTTP 403/, 'API failures are loud, not silent');
console.log('Missed-decision alert passed: grace period, recorded and future meetings, issue open/dedupe/close, loud API errors.');
