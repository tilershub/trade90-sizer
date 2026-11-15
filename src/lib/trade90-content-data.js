// Build-time loader shared by the weekly pages, decision pages and RSS feed.
import fs from 'node:fs';
import { buildWeeklyDigests } from './trade90-weekly.js';
import { allTrade90Pairs } from './trade90-v3.js';
import { officialPolicyDecisionCalendar } from '../data/trade90-decision-calendar.js';
const read = (path, fallback) => { try { return JSON.parse(fs.readFileSync(path, 'utf8')); } catch { return fallback; } };
// TRADE90_NOW lets tests render a fixed date; production uses the build clock.
export const contentNow = () => { const fixed = Date.parse(process.env.TRADE90_NOW || ''); return Number.isFinite(fixed) ? fixed : Date.now(); };
export const decisionArchive = () => (read('public/data/decision-archive.json', { decisions: [] }).decisions || []);
let cached = null;
export function weeklyDigests() {
  if (cached) return cached;
  const records = read('public/data/policy-outlook-history.json', { records: [] }).records || [];
  const pairs = allTrade90Pairs.map(p => ({ symbol: p.symbol, label: p.label, base: p.base, quote: p.quote }));
  cached = buildWeeklyDigests({ records, calendar: officialPolicyDecisionCalendar, decisions: decisionArchive(), pairs, now: contentNow() });
  return cached;
}
