// Four-stage TRADE90 divergence workflow.
// 1. Verified market-implied policy levels (3M proxy, not an exact 90-day contract)
// 2. Independent macro-pressure diagnostics
// 3. Source-dated central-bank policy assessment
// 4. Pair-level absolute-gap comparison and evidence reconciliation
//
// A policy *bias* is never converted to a fictional 3M interest-rate level.
// Market pricing is an expectation snapshot, not a calibrated forecast of outcomes.

import {MAX_FRESH_AGE_MS} from './trade90-forward-rates.js';

export const DIVERGENCE_WORKFLOW_VERSION='1.2.0';
// Conservative research screen, NOT a policy-rate change or probability estimate.
export const MACRO_SCORE_CONTRAST=2;
export const MARKET_GAP_MATERIALITY_BP=5; // Explicit uncalibrated research guardrail, not statistically optimized.
const round=v=>Math.round(v*1000)/1000;
const labelFor={widening:'Widening scenario',narrowing:'Narrowing scenario',unclear:'Uncertain',unavailable:'Insufficient current evidence'};

function researchSummary(bank){
 return {currency:bank?.currency||null,pressure:bank?.economicPressure||'Unavailable',
   score:Number.isFinite(bank?.score)?bank.score:null,
   components:bank?.scoreComponents||null,
   state:bank?.state||'unavailable',
   reviewed:bank?.policyEvidenceReviewed===true,
   reasonCode:bank?.reasonCode||'missing_bank'};
}

export function buildPairDivergenceWorkflow(pair,banks,qualitative,forwardRow,forwardHealth,now=Date.now(),automaticScenario=null){
 const a=banks?.[pair.base],b=banks?.[pair.quote];
 const macroOk=[a,b].every(x=>x?.state!=='unavailable' && x?.evidenceStatus?.macro==='validated' && Number.isFinite(x.score));
 const policyOk=[a,b].every(x=>x?.policyEvidenceReviewed===true && ['hike_hold','cut_hold','hold'].includes(x.state));
 const marketOk=forwardHealth?.valid===true && forwardRow?.available===true;
 const crossing=marketOk && Math.sign(forwardRow.currentSignedBp)!==0 &&
   Math.sign(forwardRow.expectedSignedBp)!==0 &&
   Math.sign(forwardRow.currentSignedBp)!==Math.sign(forwardRow.expectedSignedBp);
 const expectedAbsoluteChangeBp=marketOk?round(Math.abs(forwardRow.expectedSignedBp)-Math.abs(forwardRow.currentSignedBp)):null;
 const marketDirection=!marketOk?null:expectedAbsoluteChangeBp>=MARKET_GAP_MATERIALITY_BP?'widening':
   expectedAbsoluteChangeBp<=-MARKET_GAP_MATERIALITY_BP?'narrowing':'unclear';
 const market={
   status:marketOk?'verified':'pending',
   horizon:'3M',horizonRelation:'Three calendar months is a proxy for, not exactly, 90 days',
   reason:marketOk?null:(forwardRow?.reason||forwardHealth?.reason||'No licensed market-implied policy path is connected'),
   provider:marketOk?forwardRow.provider:null,observedAt:marketOk?forwardRow.observedAt:null,
   baseExpectedRatePct:marketOk?forwardRow.baseForwardPct:null,
   quoteExpectedRatePct:marketOk?forwardRow.quoteForwardPct:null,
   expectedSignedGapBp:marketOk?forwardRow.expectedSignedBp:null,
   currentSignedGapBp:marketOk?forwardRow.currentSignedBp:null,
   expectedAbsoluteGapChangeBp:expectedAbsoluteChangeBp, marketDirection,
   crossingRisk:crossing,
   sources:marketOk?[forwardRow.sourceBase,forwardRow.sourceQuote]:[],
   materialityThresholdBp:MARKET_GAP_MATERIALITY_BP,
   confidenceProbability:null
 };
 const macro={status:macroOk?'validated':'incomplete',base:researchSummary(a),quote:researchSummary(b),
   comparison:'Descriptive independent economic pressure only; no probabilities or expected basis-point moves'};
 const qualifiedAutomated=[a,b].every(x=>x?.policyEvidenceReviewed===true&&['hike_hold','cut_hold','hold'].includes(x.state)||x?.automatedAssessment?.status==='assessed'&&['hike_hold','cut_hold'].includes(x.automatedAssessment.state));
 const automatedDirection=qualifiedAutomated&&['widening','narrowing'].includes(automaticScenario?.state)?automaticScenario.state:null;
 const policy={status:policyOk?'reviewed':automatedDirection?'automated_provisional':'review_due_or_conflicting',
   base:{state:a?.state||'unavailable',reviewed:a?.policyEvidenceReviewed===true,source:a?.guidance?.source||null,automatic:a?.automatedAssessment||null},
   quote:{state:b?.state||'unavailable',reviewed:b?.policyEvidenceReviewed===true,source:b?.guidance?.source||null,automatic:b?.automatedAssessment||null},
   qualitativeBias:qualitative?.state||'unavailable',qualitativeReason:qualitative?.reason||null,
   qualitativeReasonCode:qualitative?.reasonCode||null};
 const stages={market,macro,policy,comparison:{status:'unresolved',marketVersusPolicy:'not_comparable'}};
 // The fallback is a qualitative *scenario screen* and must never be mistaken
 // for a quantified, statistically validated 90-day policy-path projection.
 const scoreDifference=macroOk?round(a.score-b.score):null;
 const macroDirection=macroOk&&Math.abs(scoreDifference)>=MACRO_SCORE_CONTRAST?
   (pair.baseRate===pair.quoteRate||Math.sign(scoreDifference)===Math.sign(pair.baseRate-pair.quoteRate)?'widening':'narrowing'):null;
 const reviewedDirection=policyOk&&['widening','narrowing'].includes(qualitative?.state)?qualitative.state:null;
 let state='unclear',reasonCode='market_implied_path_unavailable',reason='';
 let classificationBasis='insufficient_market_evidence';
 let evidenceTier='undetermined';
 let directionalSignal=0;
 if(!Number.isFinite(pair.baseRate)||!Number.isFinite(pair.quoteRate) || qualitative?.reasonCode==='stale_benchmark_snapshot'||qualitative?.reasonCode==='invalid_benchmark'){
   state='unavailable';reasonCode='invalid_official_benchmark';
   reason='A verified, current pair of official benchmark rates is required to compare policy gaps.';
 }else if(!macroOk){
   state='unavailable';reasonCode='macro_evidence_incomplete';
   reason='At least one currency lacks validated macroeconomic indicators. Market pricing, if present, is shown for context only.';
 }else if(!marketOk){
   // Independent fallback: published economic observations and genuinely
   // reviewed policy interpretations are still useful without a paid feed.
   if(reviewedDirection){
     state=reviewedDirection;
     reasonCode='reviewed_policy_scenario';
     classificationBasis='reviewed_policy_scenario';
     evidenceTier='reviewed_qualitative';
     directionalSignal=qualitative.direction||0;
     reason=`Reviewed central-bank policy biases suggest the absolute gap may ${state==='widening'?'widen':'narrow'}. This is a conditional research scenario; no future policy-rate levels, basis-point changes or probabilities are estimated. Market-implied 3M policy pricing is not connected.`;
   }else if(automatedDirection){
     state=automatedDirection;
     reasonCode='automated_policy_scenario';
     classificationBasis='automated_conditional_policy_pressure';
     evidenceTier='automated_provisional';
     directionalSignal=automaticScenario.direction||0;
     reason=`Automated assessment of the latest recorded official rate decisions and source-validated economic indicators suggests a conditional ${state} scenario. This is a machine-generated policy-pressure screen, NOT a human-reviewed interpretation of the new official statement, nor a predicted rate change. ${[a,b].map(x=>x.currency+': '+(x.automatedAssessment?.reason||'retains separately reviewed conditional guidance')).join(' ')}`;
   }else if(macroDirection){
     state=macroDirection;
     reasonCode='macro_pressure_scenario';
     classificationBasis='macro_pressure_screen';
     evidenceTier='exploratory_macro';
     directionalSignal=Math.sign(scoreDifference);
     reason=`Economic-pressure scores differ by ${Math.abs(scoreDifference)} model points (${pair.base} ${a.score}, ${pair.quote} ${b.score}). Relative macro pressure suggests a possible ${state} of the absolute policy-rate gap, assuming central banks respond in that direction. This is an exploratory scenario, NOT a verified 90-day policy forecast. ${policyOk?'Reviewed policy context does not establish a separate directional pair bias.':'Central-bank policy interpretations remain unreviewed or unresolved.'} Market-implied 3M pricing is unavailable.`;
   }else {
     reason='Verified market-implied policy paths are unavailable, and neither reviewed central-bank divergence nor a material relative macro-pressure contrast establishes a directional research scenario.';
     reasonCode='insufficient_directional_evidence';
   }
 }else if(marketDirection==='unclear'){
   reasonCode='small_market_gap_change';
   classificationBasis='market_implied_policy_levels';
   evidenceTier='verified_market';
   reason='The implied change in the absolute policy-rate gap is smaller than the disclosed 5 bp research materiality threshold. A directional classification would overstate the evidence.';
 }else if(policyOk && ['widening','narrowing'].includes(qualitative?.state) && qualitative.state!==marketDirection){
   reasonCode='market_policy_disagreement';
   classificationBasis='conflicting_verified_layers';
   evidenceTier='conflicting_evidence';
   reason='Verified market-implied rate paths and reviewed qualitative central-bank biases point in opposite directions. The combined conclusion is uncertain rather than falsely choosing one.';
   stages.comparison.marketVersusPolicy='conflict';
 }else {
   state=marketDirection;
   evidenceTier='verified_market';
   directionalSignal=Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp);
   reasonCode=policyOk?'market_implied_supported_by_policy_review':'market_implied_policy_review_pending';
   classificationBasis=policyOk?'market_implied_and_reviewed_context':'market_implied_only';
   reason=`Verified 3M market-implied policy levels indicate that the absolute gap ${state==='widening'?'increases':'decreases'} by ${Math.abs(expectedAbsoluteChangeBp).toFixed(1)} bp. ${policyOk?'Reviewed central-bank policy evidence is available for context.':'One or both central-bank outlook reviews are pending, so this is market pricing only, not an independently confirmed policy forecast.'}${crossing?' The implied signed differential crosses zero.':''}`;
   stages.comparison.marketVersusPolicy=policyOk?(qualitative?.state===state?'aligned':'non_directional'):'review_pending';
 }
 if(stages.comparison.marketVersusPolicy==='not_comparable' && marketOk){
   stages.comparison.marketVersusPolicy=policyOk?'unresolved':'review_pending';
 }
 stages.comparison.status=state==='unavailable'?'insufficient_data':state==='unclear'?'unresolved':marketOk?'market_implied_direction':'research_scenario';
 stages.comparison.reasonCode=reasonCode;
 const futureDeadline=marketOk?Date.parse(forwardRow.observedAt)+MAX_FRESH_AGE_MS:Infinity;
 const baseExpiry=Date.parse(a?.expiresAt),quoteExpiry=Date.parse(b?.expiresAt);
 const expiries=[baseExpiry,quoteExpiry,futureDeadline].filter(Number.isFinite);
 const expiry=expiries.length?new Date(Math.min(...expiries)).toISOString():null;
 const signedGap=Number.isFinite(pair.baseRate)&&Number.isFinite(pair.quoteRate)?round(pair.baseRate-pair.quoteRate):null;
 const result={
   base:pair.base,quote:pair.quote,signedGap,higher:signedGap>0?pair.base:signedGap<0?pair.quote:'Equal',
   horizonDays:90,state,label:labelFor[state],reason,reasonCode,classificationBasis,evidenceTier,
   uncalibratedResearchScenario:!marketOk&&['widening','narrowing'].includes(state),
   backtestedProbability:null,
   stages,market,macro,policy,
   automaticCandidate:{state:automaticScenario?.state||'unavailable',label:automaticScenario?.label||'Unavailable',reasonCode:automaticScenario?.reasonCode||null,isVerifiedStatementInterpretation:false},
   qualitativeCandidate:{state:qualitative?.state||'unavailable',label:qualitative?.label||'Unavailable',
     reason:qualitative?.reason||null,reasonCode:qualitative?.reasonCode||null,
     is90DayForecast:false},
   sourceStatus:marketOk?'verified_market_path':'market_data_unavailable',
   expectedGapBp:marketOk?forwardRow.expectedSignedBp:null,
   expectedAbsoluteGapChangeBp:expectedAbsoluteChangeBp, crossingRisk:crossing,
   macroDirectionalScreen:{state:macroDirection||'unclear',scoreDifference,minimumContrast:MACRO_SCORE_CONTRAST,forecast:false},
   direction:marketOk?Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp):directionalSignal,
   tone:'neutral',signedDirection:directionalSignal?
      (directionalSignal>0?`Indicative pressure towards ${pair.base}`:`Indicative pressure towards ${pair.quote}`):
      marketOk?(Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp)>0?`Market pricing towards ${pair.base}`:
       Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp)<0?`Market pricing towards ${pair.quote}`:'No supported direction'):
       'Direction not established',
   unchangedPossible:true,expiresAt:expiry
 };
 // No probabilities, future prices, or empirical accuracy implied by these rules.
 return result;
}
