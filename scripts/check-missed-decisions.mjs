// Hourly: find scheduled decisions that were not recorded, write a public status file,
// and open (or close) one GitHub issue per missed meeting so the owner is notified.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findMissedDecisions, issueTitle, issueBody } from '../src/lib/trade90-missed-decisions.js';
import { officialPolicyDecisionCalendar } from '../src/data/trade90-decision-calendar.js';
export const STATUS_PATH = 'public/data/missed-decisions.json';
export const LABEL = 'missed-rate-decision';

export async function syncIssues({ missed, repo, token, fetcher = fetch }) {
  const api = (path, init = {}) => fetcher('https://api.github.com/repos/' + repo + path, { ...init, headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } })
    .then(async r => { if (!r.ok) throw new Error('GitHub API ' + (init.method || 'GET') + ' ' + path + ': HTTP ' + r.status); return r.status === 204 ? null : r.json(); });
  const open = (await api('/issues?state=open&labels=' + LABEL + '&per_page=100')).filter(i => !i.pull_request);
  const log = [];
  if (missed.length) {
    // Create the label once; GitHub returns 404 for a label that does not exist yet.
    const has = await fetcher('https://api.github.com/repos/' + repo + '/labels/' + LABEL, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' } });
    if (has.status === 404) await api('/labels', { method: 'POST', body: JSON.stringify({ name: LABEL, color: 'd73a4a', description: 'A scheduled central-bank decision is not recorded on TRADE90' }) });
    else if (!has.ok) throw new Error('GitHub API GET /labels: HTTP ' + has.status);
  }
  for (const m of missed) {
    const title = issueTitle(m);
    if (open.some(i => i.title === title)) { log.push('Already open: ' + title); continue; }
    const created = await api('/issues', { method: 'POST', body: JSON.stringify({ title, body: issueBody(m), labels: [LABEL] }) });
    log.push('Opened #' + created.number + ': ' + title);
  }
  const wanted = new Set(missed.map(issueTitle));
  for (const issue of open.filter(i => !wanted.has(i.title))) {
    await api('/issues/' + issue.number + '/comments', { method: 'POST', body: JSON.stringify({ body: 'The decision is now recorded on TRADE90. Closing automatically.' }) });
    await api('/issues/' + issue.number, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
    log.push('Closed #' + issue.number + ': ' + issue.title);
  }
  return log;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const snapshot = JSON.parse(readFileSync('src/data/trade90-policy-snapshot.json', 'utf8'));
  const now = Date.now();
  const missed = findMissedDecisions({ snapshot, calendar: officialPolicyDecisionCalendar, now });
  const status = { schemaVersion: 1, meaning: 'Scheduled central-bank decisions whose announcement date has passed but which TRADE90 has not yet recorded.', missed };
  let previous = null; try { previous = JSON.parse(readFileSync(STATUS_PATH, 'utf8')); } catch {}
  if (JSON.stringify(previous?.missed) !== JSON.stringify(missed)) writeFileSync(STATUS_PATH, JSON.stringify({ ...status, changedAt: new Date(now).toISOString() }, null, 2) + '\n');
  console.log(missed.length ? 'MISSED: ' + missed.map(m => m.bank + ' ' + m.meetingDate).join(', ') : 'No missed decisions.');
  if (process.env.GH_TOKEN && process.env.GITHUB_REPOSITORY) {
    for (const line of await syncIssues({ missed, repo: process.env.GITHUB_REPOSITORY, token: process.env.GH_TOKEN })) console.log(line);
  } else console.log('No GitHub token: issues not synchronised.');
}
