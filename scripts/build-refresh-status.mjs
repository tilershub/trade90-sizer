import {readFileSync,writeFileSync} from 'node:fs';
import {buildRefreshStatus} from '../src/lib/trade90-refresh-status.js';
import {policyCollectionAsOf} from '../src/data/trade90-policy-updates.js';
import {decisionCalendarReviewedAt,officialPolicyDecisionCalendar} from '../src/data/trade90-decision-calendar.js';
import {policyGuidanceReviewedAt} from '../src/data/trade90-policy-guidance.js';
import {outlookAsOf} from '../src/data/trade90-policy-outlook.js';

const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const stamp=new Date().toISOString();
const report=buildRefreshStatus({
 macro:read('public/data/macro-history.json'),
 extras:read('public/data/policy-inputs.json'),
 sourceMonitor:read('public/data/official-source-monitor.json'),
 rateMonitor:read('public/data/official-policy-automation.json'),
 automatedReview:read('public/data/automated-policy-review.json'),
 policyModel:read('public/data/policy-outlook.json'),
 rateSnapshot:read('src/data/trade90-policy-snapshot.json'),
 assessments:read('src/data/trade90-policy-assessments.json'),
 calendarReviewedAt:decisionCalendarReviewedAt,
 publicationReviewedAt:policyCollectionAsOf,
 marketReportsReviewedAt:outlookAsOf,
 guidanceReviewedAt:policyGuidanceReviewedAt,
 upcomingByBank:officialPolicyDecisionCalendar
},stamp);
writeFileSync(new URL('../public/data/refresh-status.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('Daily research freshness audit',JSON.stringify({auditedAt:report.auditedAt,statuses:Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,v.status])),warnings:report.warnings.length},null,2));
