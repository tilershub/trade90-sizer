import assert from 'node:assert/strict';
import {buildRefreshStatus} from '../src/lib/trade90-refresh-status.js';
const now='2026-10-23T07:30:00Z';
const simple={status:'ok',retrievedAt:'2026-10-23T06:00:00Z',points:[{date:'2026-08-01',value:1}]};
const base={
 macro:{checkedAt:'2026-10-23T06:00:00Z',countries:{USD:{series:{inflation:simple}}}},
 extras:{checkedAt:'2026-10-23T06:01:00Z',countries:{USD:{series:{core:simple}}}},
 sourceMonitor:{lastScanAt:'2026-10-23T07:00:00Z',sources:['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'].map(code=>({code,status:'available'}))},
 rateMonitor:{lastCheckedAt:'2026-10-23T07:00:00Z',coverage:['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'].map(code=>({code,state:'Decision matches published benchmark'}))},
 policyModel:{generatedAt:'2026-10-23T07:00:00Z',pairs:{AUDCHF:{expiresAt:'2026-10-25T07:00:00Z'}}},
 rateSnapshot:{asOf:'2026-10-15'},
 assessments:Object.fromEntries(['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'].map(code=>[code,{reviewedAt:'2026-10-20'}])),
 calendarReviewedAt:'2026-10-20',publicationReviewedAt:'2026-10-20',marketReportsReviewedAt:'2026-10-20',guidanceReviewedAt:'2026-10-20',
 upcomingByBank:['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'].map(currency=>({currency,date:'2026-11-10'}))
};
const report=buildRefreshStatus(base,now);
assert.equal(report.categories.macro.status,'checked');
assert.equal(report.categories.sourceDiscovery.status,'checked');
assert.equal(report.categories.model.status,'checked');
assert.equal(report.reviewed.benchmarkSnapshot,'2026-10-15','Do not relabel the official benchmark decision/snapshot');
assert.equal(report.reviewed.policyStatements,'2026-10-20','Do not fake a manual review date');
assert.equal(report.warnings.length,0);
const stale=buildRefreshStatus({...base,sourceMonitor:{lastScanAt:'2026-10-10T00:00:00Z',sources:base.sourceMonitor.sources},calendarReviewedAt:'2026-09-15'},now);
assert.equal(stale.categories.sourceDiscovery.status,'overdue');
assert.ok(stale.warnings.some(x=>x.category==='meetingCalendar'&&x.status==='manual_review_due'));
const partiallyChecked=buildRefreshStatus({...base,rateMonitor:{...base.rateMonitor,coverage:[{code:'USD',state:'Decision matches published benchmark'}, {code:'AUD',state:'No parseable decision in official feed'}]}},now);
assert.equal(partiallyChecked.categories.rateDecisionChecks.status,'partial','Attempted checks do not equal confirmed verification');
assert.equal(partiallyChecked.reviewed.benchmarkSnapshot,'2026-10-15');
console.log('Daily freshness report: checked-vs-curated, overdue, partial coverage and immutable review dates verified.');
