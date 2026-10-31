import assert from 'node:assert/strict';
import {AUTO_BANKS,AUTO_POLICY_VERSION,datedPolicyRelease,assessAutomaticPolicyBank,runAutomaticPolicyReview} from '../src/lib/trade90-auto-policy-review.js';
import {buildPairDivergenceWorkflow} from '../src/lib/trade90-divergence-workflow.js';
const now='2026-10-31T12:00:00Z';
const source='https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm';
const sourceRecord={code:'USD',decisionDate:'2026-10-28',rate:3.875,source};
const check={code:'USD',state:'Decision matches published benchmark',checkedAt:now,source,decisionDate:'2026-10-28'};
const monitor={code:'USD',status:'available',lastSuccessAt:now,items:[
 {title:'Federal Reserve issues FOMC statement',url:source}
]};
const strong={currency:'USD',state:'uncertain',policyEvidenceReviewed:false,score:2,
 scoreComponents:{inflation:2,employment:0,growth:0,total:2},
 evidenceStatus:{macro:'validated'},cautions:[],
 expiresAt:'2026-11-02T12:00:00.000Z'
};
const assess=(changes={})=>assessAutomaticPolicyBank({
 currency:'USD',bank:strong,snapshotBank:sourceRecord,rateCheck:check,
 source:monitor,benchmarkAsOf:'2026-10-29',checkedAt:now,...changes
});
assert.equal(AUTO_POLICY_VERSION,'1.0.0');
assert.equal(AUTO_BANKS.length,8);
const usd=assess();
assert.equal(usd.status,'assessed');
assert.equal(usd.state,'hike_hold');
assert.equal(usd.evidence.verifiedDecisionThisRun,true);
assert.equal(usd.isEditorialReview,false);
assert.equal(usd.isVerifiedStatementInterpretation,false);
assert.equal(usd.expectedChangeBp,null);
assert.equal(usd.probability,null);
assert.equal(usd.evidence.decisionSource,source);
assert.equal(assess({rateCheck:{...check,source:'https://www.federalreserve.gov/another'}}).evidence.verifiedDecisionThisRun,false);
const newer={...monitor,items:[...monitor.items,
 {title:'Federal Reserve issues FOMC statement',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261030a.htm'}
]};
const blocked=assess({source:newer});
assert.equal(blocked.state,'uncertain');
assert.equal(blocked.status,'new_decision_requires_verification');
assert.equal(blocked.evidence.newerOfficialDecision.date,'2026-10-30');
assert.equal(assess({source:{...monitor,items:[...monitor.items,{title:'Fed monetary policy speech',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261030a.htm'}]}}).status,'assessed','Speeches cannot be mistaken for fresh policy decisions');
assert.equal(assess({source:{...monitor,status:'unavailable'},rateCheck:{...check,state:'No safely verified new decision'}}).status,'source_check_unavailable');
assert.equal(assess({benchmarkAsOf:'2026-07-20'}).status,'benchmark_unverified');
assert.equal(assess({bank:{...strong,evidenceStatus:{macro:'unavailable'}}}).status,'macro_unavailable');
assert.equal(assess({bank:{...strong,scoreComponents:{...strong.scoreComponents,inflation:0},score:2}}).state,'uncertain');
assert.equal(assess({bank:{...strong,cautions:['Material activity weakness makes policy trade-off uncertain']}}).state,'uncertain');
assert.equal(assess({bank:{...strong,score:-2,scoreComponents:{inflation:-2,employment:0,growth:0,total:-2}}}).state,'cut_hold');
assert.equal(datedPolicyRelease({title:'Monetary policy decisions',url:'https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp261029~9a493adf17.en.html'},'EUR').date,'2026-10-29');
assert.equal(datedPolicyRelease({title:'Statement on Monetary Policy',url:'https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2026/k261030a.pdf'},'JPY').date,'2026-10-30');
assert.equal(datedPolicyRelease({title:'Federal Reserve issues FOMC statement',url:'https://evil.example.net/newsevents/pressreleases/monetary20261030a.htm'},'USD'),null,'No external hosts');
assert.equal(datedPolicyRelease({title:'Minutes of the Federal Open Market Committee',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261030a.htm'},'USD'),null,'Minutes are not policy decisions');
const result=runAutomaticPolicyReview({
 banks:Object.fromEntries(AUTO_BANKS.map(x=>[x,{...strong,currency:x}])),
 snapshot:{asOf:'2026-10-29',banks:AUTO_BANKS.map(x=>({...sourceRecord,code:x,source:({USD:source,EUR:'https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~abc.en.html',GBP:'https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/september-2026',JPY:'https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2026/k260918a.pdf',AUD:'https://www.rba.gov.au/media-releases/2026/mr-26-27.html',NZD:'https://www.rbnz.govt.nz/news-and-events/news/2026/09/ocr-increased-by-25-basis-points-to-2-75',CAD:'https://www.bankofcanada.ca/2026/10/fad-press-release-2026-10-28/',CHF:'https://www.snb.ch/en/publications/communication/press-releases-restricted/pre_20260924'})[x]}))},
 rateMonitor:{coverage:[check]},
 sourceMonitor:{sources:[monitor]},
 checkedAt:now
});
assert.equal(Object.keys(result.banks).length,8);
assert.equal(result.totalBanks,8);
assert.equal(result.banks.USD.status,'assessed');
assert.equal(result.banks.EUR.status,'source_check_unavailable');
const chf={currency:'CHF',state:'hold',score:1,policyEvidenceReviewed:true,evidenceStatus:{macro:'validated'},
 expiresAt:'2026-11-02T12:00:00Z',guidance:{source:'https://www.snb.ch/en'}};
const output=buildPairDivergenceWorkflow(
 {base:'USD',quote:'CHF',baseRate:3.875,quoteRate:0},
 {...{USD:{...strong,automatedAssessment:usd}},CHF:chf},
 {state:'unclear',reasonCode:'policy_review_due'},
 null,{valid:false,reason:'No licensed market data'},Date.parse(now),
 {state:'widening',direction:1,reasonCode:'reviewed_relative_policy_bias'}
);
assert.equal(output.state,'widening');
assert.equal(output.evidenceTier,'automated_provisional');
assert.equal(output.reasonCode,'automated_policy_scenario');
assert.equal(output.expectedAbsoluteGapChangeBp,null);
assert.equal(output.backtestedProbability,null);
assert.equal(output.policy.status,'automated_provisional');
assert.equal(output.policy.base.automatic.isEditorialReview,false);
console.log('Eight-bank automatic assessment: direct vs snapshot checks, newer official release blocking, invalid source safety, macro conditional scenarios and USD/CHF example passed');
