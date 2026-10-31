import assert from 'node:assert/strict';
import {getExpectedRows} from '../src/lib/trade90-forward-rates.js';
import {DIVERGENCE_WORKFLOW_VERSION,MARKET_GAP_MATERIALITY_BP,MACRO_SCORE_CONTRAST,buildPairDivergenceWorkflow} from '../src/lib/trade90-divergence-workflow.js';
const now=Date.parse('2026-10-31T12:00:00Z');
const observed='2026-10-31T11:00:00Z';
const source='https://test-source.example.com/official-licensed-fixture';
const currentBanks=[
 {code:'AUD',rate:4}, {code:'CHF',rate:2}, {code:'USD',rate:3},
 {code:'EUR',rate:2.5},{code:'GBP',rate:3.5},{code:'JPY',rate:1},
 {code:'NZD',rate:2.5},{code:'CAD',rate:2.5}
];
const bank=(currency,state,score=1,reviewed=true)=>({
 currency,state,score,policyEvidenceReviewed:reviewed,reasonCode:reviewed?'reviewed_policy_bias':'policy_review_due',
 evidenceStatus:{macro:'validated',policy:reviewed?'reviewed_current':'review_due'},
 scoreComponents:{inflation:1,employment:0,growth:0,total:score},
 economicPressure:'Balanced or conflicting pressure',
 expiresAt:'2026-11-02T12:00:00Z',
 guidance:{source:'https://example.org/bank'}
});
const banks={AUD:bank('AUD','hike_hold',2),CHF:bank('CHF','hold',0)};
const pair={base:'AUD',quote:'CHF',baseRate:4,quoteRate:2,symbol:'AUDCHF'};
const qualitative={state:'widening',label:'Widening bias',reason:'Prior reviewed policy bias',reasonCode:'reviewed_relative_policy_bias'};
const makeSnapshot=(aud,chf,license=true)=>({
 schemaVersion:1,status:'verified',dataKind:'market_implied_policy_level',provider:'Licensed provider fixture',
 observedAt:observed,methodology:'A properly sourced normalized forward policy-rate level methodology.',
 license:{publicRedisplayAuthorized:license,reference:'fixture-license-reference'},
 rates:{
  AUD:{'3M':{ratePct:aud,observedAt:observed,sourceUrl:source,instrument:'AUD 3M policy-level derivative'}},
  CHF:{'3M':{ratePct:chf,observedAt:observed,sourceUrl:source,instrument:'CHF 3M policy-level derivative'}}
 }
});
const calculate=(snapshot,b=banks,q=qualitative,time=now)=>{
 const calculated=getExpectedRows(snapshot,currentBanks,'3M',time);
 return buildPairDivergenceWorkflow(pair,b,q,calculated.rows.find(x=>x.symbol==='AUDCHF'),calculated.health,time);
};
assert.equal(DIVERGENCE_WORKFLOW_VERSION,'1.2.0');
assert.equal(MACRO_SCORE_CONTRAST,2);
assert.equal(MARKET_GAP_MATERIALITY_BP,5);
const noFeed=calculate({schemaVersion:1,status:'awaiting_licensed_data',dataKind:'market_implied_policy_level',rates:{},license:{publicRedisplayAuthorized:false}});
assert.equal(noFeed.state,'widening','Reviewed policy direction should not disappear when licensed market data is absent');
assert.equal(noFeed.reasonCode,'reviewed_policy_scenario');
assert.equal(noFeed.classificationBasis,'reviewed_policy_scenario');
assert.equal(noFeed.evidenceTier,'reviewed_qualitative');
assert.equal(noFeed.uncalibratedResearchScenario,true);
assert.equal(noFeed.market.expectedSignedGapBp,null);
assert.equal(noFeed.qualitativeCandidate.state,'widening','Preserve reviewed qualitative candidate without pretending it is verified 3M pricing');
assert.equal(noFeed.qualitativeCandidate.is90DayForecast,false);
assert.equal(noFeed.stages.macro.status,'validated');
assert.equal(noFeed.stages.policy.status,'reviewed');
const widening=calculate(makeSnapshot(4.25,2));
assert.equal(widening.state,'widening');
assert.equal(widening.expectedAbsoluteGapChangeBp,25);
assert.equal(widening.reasonCode,'market_implied_supported_by_policy_review');
assert.equal(widening.classificationBasis,'market_implied_and_reviewed_context');
assert.equal(widening.market.baseExpectedRatePct,4.25);
assert.equal(widening.market.confidenceProbability,null);
assert.equal(widening.market.crossingRisk,false);
const narrowing=calculate(makeSnapshot(3.75,2),banks,{...qualitative,state:'narrowing'});
assert.equal(narrowing.state,'narrowing');
assert.equal(narrowing.expectedAbsoluteGapChangeBp,-25);
const conflict=calculate(makeSnapshot(3.75,2));
assert.equal(conflict.state,'unclear','A genuine reviewed signal conflict must not be disguised as widening or narrowing');
assert.equal(conflict.reasonCode,'market_policy_disagreement');
assert.equal(conflict.stages.comparison.marketVersusPolicy,'conflict');
const unreviewed={AUD:bank('AUD','uncertain',2,false),CHF:bank('CHF','hold',0)};
const marketOnly=calculate(makeSnapshot(4.25,2),unreviewed,{state:'unclear',reasonCode:'policy_review_due'});
assert.equal(marketOnly.state,'widening');
assert.equal(marketOnly.reasonCode,'market_implied_policy_review_pending');
assert.equal(marketOnly.classificationBasis,'market_implied_only');
assert.equal(marketOnly.stages.policy.status,'review_due_or_conflicting');
const crossing=calculate(makeSnapshot(1,2.5),banks,{state:'unclear'});
assert.equal(crossing.state,'narrowing','Absolute-gap change controls direction even if signed gap crosses zero');
assert.equal(crossing.crossingRisk,true);
assert.equal(crossing.expectedAbsoluteGapChangeBp,-50);
const small=calculate(makeSnapshot(4.02,2),banks,qualitative);
assert.equal(small.state,'unclear');
assert.equal(small.reasonCode,'small_market_gap_change');
const missing=calculate(makeSnapshot(4.25,2),{AUD:bank('AUD','unavailable'),CHF:banks.CHF});
assert.equal(missing.state,'unavailable','An unavailable bank must not be treated as fully validated');
const noMacro=calculate(makeSnapshot(4.25,2),{AUD:{...banks.AUD,evidenceStatus:{macro:'unavailable'}},CHF:banks.CHF});
assert.equal(noMacro.state,'unavailable');
assert.equal(noMacro.reasonCode,'macro_evidence_incomplete');
const unauthorized=calculate(makeSnapshot(4.25,2,false));
assert.equal(unauthorized.state,'widening','No licensed source should mean qualitative scenario, not fabricated priced forecast');
assert.equal(unauthorized.market.baseExpectedRatePct,null,'Never publish unlicensed quantitative prices');
const stale=calculate(makeSnapshot(4.25,2),banks,qualitative,now+5*86400000);
assert.equal(stale.state,'widening','A stale market feed must leave the independent research scenario available when underlying research is current');
assert.equal(stale.market.baseExpectedRatePct,null);
const partial=calculate({...makeSnapshot(4.25,2),rates:{AUD:makeSnapshot(4.25,2).rates.AUD}});
assert.equal(partial.state,'widening','Partial feed must not masquerade as a verified price but should not erase reviewed research');
assert.equal(partial.market.baseExpectedRatePct,null);
// Source-independent macro screen: only a material *relative* economic-pressure
// difference can produce an exploratory scenario; never an implied bp forecast.
const macroHigh=bank('AUD','uncertain',3,false);
const macroLow=bank('CHF','uncertain',1,false);
const macroPair={AUD:macroHigh,CHF:macroLow};
const noLicensed={schemaVersion:1,status:'awaiting_licensed_data',dataKind:'market_implied_policy_level',rates:{},license:{publicRedisplayAuthorized:false}};
const macroWiden=calculate(noLicensed,macroPair,{state:'unclear',reasonCode:'policy_review_due'});
assert.equal(macroWiden.state,'widening');
assert.equal(macroWiden.classificationBasis,'macro_pressure_screen');
assert.equal(macroWiden.evidenceTier,'exploratory_macro');
assert.equal(macroWiden.expectedAbsoluteGapChangeBp,null);
assert.equal(macroWiden.expectedGapBp,null);
assert.equal(macroWiden.backtestedProbability,null);
assert.equal(macroWiden.macroDirectionalScreen.scoreDifference,2);
assert.equal(macroWiden.stages.comparison.status,'research_scenario');
const macroNarrow=buildPairDivergenceWorkflow(
 {...pair,baseRate:2,quoteRate:4},macroPair,{state:'unclear'},
 getExpectedRows(noLicensed,currentBanks,'3M',now).rows.find(x=>x.symbol==='AUDCHF'),{valid:false,reason:'No feed'},now
);
assert.equal(macroNarrow.state,'narrowing','Higher macro pressure in the lower-rate currency implies a possible narrowing of the absolute gap');
assert.equal(macroNarrow.expectedAbsoluteGapChangeBp,null);
const marginal=calculate(noLicensed,{AUD:bank('AUD','uncertain',2,false),CHF:macroLow},{state:'unclear'});
assert.equal(marginal.state,'unclear','Difference smaller than research screening threshold is insufficient');
const zeroGap=buildPairDivergenceWorkflow({...pair,baseRate:2,quoteRate:2},
 macroPair,{state:'unclear'},null,{valid:false,reason:'No feed'},now);
assert.equal(zeroGap.state,'widening','Qualitative pressure divergence from equal starting rates is only an exploratory possibility');
const reverseMacro=buildPairDivergenceWorkflow({base:'CHF',quote:'AUD',baseRate:2,quoteRate:4},
 macroPair,{state:'unclear'},null,{valid:false,reason:'No feed'},now);
assert.equal(reverseMacro.state,macroWiden.state,'Reversing the pair quote direction must not change whether the absolute gap widens or narrows');
const noScores=calculate(noLicensed,{AUD:{...macroHigh,score:null},CHF:macroLow},{state:'unclear'});
assert.equal(noScores.state,'unavailable','Invalid source metrics cannot yield directional scenarios');
const bothHold=calculate(noLicensed,{AUD:bank('AUD','hold',1),CHF:bank('CHF','hold',1)},{state:'unchanged'});
assert.equal(bothHold.state,'unclear','Shared hold bias alone should not create artificial widening or narrowing');
const reversedPair={base:'CHF',quote:'AUD',baseRate:2,quoteRate:4};
const two={AUD:bank('AUD','uncertain',2,false),CHF:bank('CHF','uncertain',0,false)};
const rows=getExpectedRows(makeSnapshot(4.25,2),currentBanks,'3M',now);
const direct=buildPairDivergenceWorkflow(pair,two,{state:'unclear'},rows.rows.find(r=>r.symbol==='AUDCHF'),rows.health,now);
const reverseMarket={...rows.rows.find(r=>r.symbol==='AUDCHF'),baseForwardPct:2,quoteForwardPct:4.25,currentSignedBp:-200,expectedSignedBp:-225,base:'CHF',quote:'AUD'};
const reverse=buildPairDivergenceWorkflow(reversedPair,two,{state:'unclear'},reverseMarket,rows.health,now);
assert.equal(direct.state,reverse.state);
assert.equal(direct.expectedAbsoluteGapChangeBp,reverse.expectedAbsoluteGapChangeBp);
assert.equal(direct.direction,-reverse.direction);
assert.equal(widening.market.horizonRelation.includes('not exactly'),true);
assert.equal(widening.expiresAt,'2026-11-02T12:00:00.000Z');
console.log('TRADE90 four-stage model: missing-licensed data, market-only, reviewed conflicts, crossing, reversals, freshness, data licensing and 28-pair math passed');
