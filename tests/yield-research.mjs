import assert from 'node:assert/strict';
import {normalizeYieldHistory,curveAt,pairYieldSpread,historySlopeChange,coverageReport} from '../src/lib/trade90-yield-research.js';
import {evaluateYieldIntegration,MIN_INDEPENDENT_OUTCOMES} from '../src/lib/trade90-yield-evaluation.js';
const now='2026-11-01T08:00:00Z';
const hist=[
 {date:'2026-08-01','2Y':2.3,'10Y':2.8},
 {date:'2026-09-30','2Y':2.4,'10Y':2.9},
 {date:'2026-10-01','2Y':2.6,'10Y':3.1},
 {date:'2026-10-23','2Y':2.7,'10Y':3.2},
 {date:'2026-10-30','2Y':2.8,'10Y':3.3}
];
const spot={verified:true,asOf:'2026-10-30',source:'https://example.org/data',frequency:'daily',kind:'fitted_sovereign_spot',history:hist};
const spot2={...spot,history:hist.map(x=>({...x,'2Y':x['2Y']-.2,'10Y':x['10Y']-.2}))};
const bond={...spot,kind:'sovereign_benchmark_yield'};
assert.equal(MIN_INDEPENDENT_OUTCOMES,30);
assert.equal(normalizeYieldHistory([{date:'2026-10-01','2Y':null,'10Y':4}]).length,0,'Null cannot become zero yield');
assert.equal(normalizeYieldHistory([{date:'2026-10-01','2Y':2,'10Y':3},{date:'2026-10-01','2Y':3,'10Y':4}])[0]['2Y'],3);
assert.equal(curveAt(spot,now).status,'current');
assert.equal(curveAt({...spot,verified:false},now).status,'stale','Failed source must not be labelled verified');
assert.equal(curveAt({...spot,frequency:'monthly',verified:true,history:[{date:'2026-10-01','2Y':2,'10Y':3}]},now).status,'current');
assert.equal(curveAt({...spot,history:[{date:'2025-10-01','2Y':2,'10Y':3}]},now).status,'stale');
assert.equal(curveAt(spot,now).slopeBp,50);
assert.equal(historySlopeChange(hist,7,'2026-10-30'),0);
assert.equal(historySlopeChange(hist,30,'2026-10-30'),0);
assert.equal(historySlopeChange(hist,90,'2026-10-30'),null);
assert.equal(pairYieldSpread(spot,spot2,'2Y',now).status,'current');
assert.equal(pairYieldSpread(spot,spot2,'2Y',now).spreadBp,20);
assert.equal(pairYieldSpread(spot,bond,'2Y',now).status,'not_comparable');
assert.equal(pairYieldSpread(spot,{...spot2,history:[{date:'2026-10-21','2Y':2,'10Y':3}]},'2Y',now).status,'unavailable');
const snap={currencies:{EUR:spot,GBP:spot2}};
const report=coverageReport(snap,now);
assert.equal(report.EUR.status,'current');
assert.equal(report.CAD.status,'missing');
const evalReport=evaluateYieldIntegration(snap,[
 {code:'EUR',ratePct:2.5,effectiveDate:'2026-10-29'},
 {code:'GBP',ratePct:3.75,effectiveDate:'2026-10-29'}
],now);
assert.equal(evalReport.status,'insufficient_verified_policy_outcomes');
assert.equal(evalReport.completedBacktestOutcomes,0);
assert.equal(evalReport.hitRate,null);
assert.equal(evalReport.productionModelUsesYieldCurves,false);
assert.equal(evalReport.coverage.EUR.historyPoints,5);
console.log('Yield research tests passed: dates, true observations, same-definition spreads, slope history, stale status and fail-closed policy outcome evaluation');
