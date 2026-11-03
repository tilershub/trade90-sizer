import assert from 'node:assert/strict';
import {DIVERGENCE_WORKFLOW_VERSION,MACRO_SCORE_CONTRAST,buildPairDivergenceWorkflow} from '../src/lib/trade90-divergence-workflow.js';
const now=Date.parse('2026-10-31T12:00:00Z');
const pair={base:'AUD',quote:'CHF',baseRate:4,quoteRate:1};
const bank=(currency,state,score,reviewed=false)=>({
 currency,state,score,economicPressure:'Research pressure',
 scoreComponents:{inflation:score,employment:0,growth:0,total:score},
 policyEvidenceReviewed:reviewed,evidenceStatus:{macro:'validated'},
 expiresAt:'2026-11-02T12:00:00Z',
 guidance:{source:'https://centralbank.example/'+currency},
 automatedAssessment:{status:'review_due',state:'uncertain',reason:'Source-bound review not available'}
});
const reviewed={AUD:bank('AUD','hike_hold',3,true),CHF:bank('CHF','hold',1,true)};
const macro={AUD:bank('AUD','uncertain',3),CHF:bank('CHF','uncertain',1)};
const evaluate=(banks=macro,qualitative={state:'unclear'},p=pair,automated=null)=>
 buildPairDivergenceWorkflow(p,banks,qualitative,now,automated);
assert.equal(DIVERGENCE_WORKFLOW_VERSION,'2.0.0');
assert.equal(MACRO_SCORE_CONTRAST,2);
const r=evaluate(reviewed,{state:'widening',direction:1});
assert.equal(r.state,'widening');assert.equal(r.evidenceTier,'reviewed_qualitative');
assert.equal(r.stages.policy.status,'reviewed');
assert.equal(r.classificationBasis,'reviewed_policy_scenario');
assert.equal(r.stages.macro.status,'validated');
assert.equal(r.expectedAbsoluteGapChangeBp,null);
assert.equal(r.expectedGapBp,null);
assert.equal(r.backtestedProbability,null);
assert.equal(r.stages.comparison.status,'research_scenario');
assert.equal(Object.prototype.hasOwnProperty.call(r,'market'),false);
assert.equal(Object.prototype.hasOwnProperty.call(r.stages,'market'),false);
const conflict=evaluate(reviewed,{state:'narrowing',direction:-1});
assert.equal(conflict.state,'unclear');
assert.equal(conflict.reasonCode,'reviewed_policy_macro_conflict');
const exploratory=evaluate();
assert.equal(exploratory.state,'widening');
assert.equal(exploratory.classificationBasis,'macro_pressure_screen');
assert.equal(exploratory.evidenceTier,'exploratory_macro');
assert.equal(exploratory.macroDirectionalScreen.scoreDifference,2);
const narrow=evaluate(macro,{state:'unclear'},{...pair,baseRate:1,quoteRate:4});
assert.equal(narrow.state,'narrowing');
const reverse=evaluate({AUD:macro.AUD,CHF:macro.CHF},{state:'unclear'},
 {base:'CHF',quote:'AUD',baseRate:1,quoteRate:4});
assert.equal(reverse.state,exploratory.state,'Pair orientation must not reverse absolute gap classification');
const marginal=evaluate({AUD:bank('AUD','uncertain',2),CHF:macro.CHF});
assert.equal(marginal.state,'unclear','One-point contrast insufficient');
const missing=evaluate({...macro,AUD:{...macro.AUD,evidenceStatus:{macro:'unavailable'}}});
assert.equal(missing.state,'unavailable');
assert.equal(missing.reasonCode,'macro_evidence_incomplete');
const stale=evaluate(macro,{state:'unavailable',reasonCode:'stale_benchmark_snapshot'});
assert.equal(stale.state,'unavailable');
assert.equal(stale.reasonCode,'invalid_official_benchmark');
const equalReviewed=evaluate({AUD:bank('AUD','hike_hold',3,true),CHF:bank('CHF','hike_hold',1,true)},{state:'unclear'});
assert.equal(equalReviewed.state,'unclear','Strong score cannot override ambiguous matching reviewed policy biases');
const autoBanks={AUD:{...macro.AUD,automatedAssessment:{status:'assessed',state:'hike_hold',reason:'Provisional'}},CHF:{...macro.CHF,automatedAssessment:{status:'assessed',state:'cut_hold',reason:'Provisional'}}};
const provisional=evaluate(autoBanks,{state:'unclear'},pair,{state:'widening',direction:1});
assert.equal(provisional.state,'widening');
assert.equal(provisional.evidenceTier,'automated_provisional');
const against=evaluate(autoBanks,{state:'unclear'},pair,{state:'narrowing',direction:-1});
assert.equal(against.state,'unclear');
assert.equal(against.reasonCode,'provisional_policy_macro_conflict');
assert.equal(r.uncalibratedResearchScenario,true);
assert.equal(r.horizonDays,90);
assert.equal(Date.parse(r.expiresAt)<=now+48*3600000,true);
console.log('Macro-policy-only workflow: reviewed, provisional, macro, conflicts, stale inputs and 28-pair orientation safeguards passed');
