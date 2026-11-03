import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPairDivergenceWorkflow} from '../src/lib/trade90-divergence-workflow.js';

const expiresAt='2030-01-01T00:00:00.000Z';
const bank=(currency,score,state='uncertain',reviewed=false,macro='validated')=>({
 currency,score,state,policyEvidenceReviewed:reviewed,evidenceStatus:{macro},
 economicPressure:score>0?'Tightening pressure':score<0?'Easing pressure':'Balanced',
 expiresAt,automatedAssessment:{status:'not_evaluated'},guidance:{source:'https://example.org/statement'}
});
const pair={symbol:'USDEUR',base:'USD',quote:'EUR',baseRate:4,quoteRate:2.5};
const run=(a,b,qualitative={state:'unclear'},automatic={state:'unclear'})=>
 buildPairDivergenceWorkflow(pair,{USD:a,EUR:b},qualitative,automatic);

test('reviewed policy plus matching macro contrast supports widening',()=>{
 const out=run(bank('USD',3,'hike_hold',true),bank('EUR',0,'cut_hold',true),{state:'widening',direction:1});
 assert.equal(out.state,'widening');assert.equal(out.evidenceTier,'reviewed_qualitative');
 assert.equal(out.stages.macro.status,'validated');assert.equal(out.stages.policy.status,'reviewed');
 assert.equal(out.stages.market,undefined);assert.equal(out.market,undefined);
 assert.equal(out.expectedGapBp,undefined);assert.equal(out.backtestedProbability,null);
});

test('reviewed policy conflict with macro evidence must remain uncertain',()=>{
 const out=run(bank('USD',3,'cut_hold',true),bank('EUR',0,'hike_hold',true),{state:'narrowing'});
 assert.equal(out.state,'unclear');assert.equal(out.reasonCode,'reviewed_policy_macro_disagreement');
});

test('source validation failure blocks directional claims',()=>{
 const out=run(bank('USD',3,'hike_hold',true,'unavailable'),bank('EUR',0,'cut_hold',true),{state:'widening'});
 assert.equal(out.state,'unavailable');assert.equal(out.reasonCode,'macro_evidence_incomplete');
});

test('material macro contrast is explicitly exploratory when policy is unresolved',()=>{
 const out=run(bank('USD',2),bank('EUR',0));
 assert.equal(out.state,'widening');assert.equal(out.evidenceTier,'exploratory_macro');
 assert.equal(out.classificationBasis,'macro_pressure_screen');
});

test('the same macro relative pressure can narrow a negative official-rate gap',()=>{
 const opposite={...pair,baseRate:1,quoteRate:4};
 const a=bank('USD',2),b=bank('EUR',0);
 const out=buildPairDivergenceWorkflow(opposite,{USD:a,EUR:b},{state:'unclear'});
 assert.equal(out.state,'narrowing');
});

test('a sub-threshold macro difference without bank guidance remains uncertain',()=>{
 const out=run(bank('USD',1),bank('EUR',0));
 assert.equal(out.state,'unclear');
});
