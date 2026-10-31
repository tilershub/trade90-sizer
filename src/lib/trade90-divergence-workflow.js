// Four-stage TRADE90 divergence workflow.
// 1. Verified market-implied policy levels (3M proxy, not an exact 90-day contract)
// 2. Independent macro-pressure diagnostics
// 3. Source-dated central-bank policy assessment
// 4. Pair-level absolute-gap comparison and evidence reconciliation
//
// A policy *bias* is never converted to a fictional 3M interest-rate level.
// Market pricing is an expectation snapshot, not a calibrated forecast of outcomes.

import {MAX_FRESH_AGE_MS} from './trade90-forward-rates.js';

export const DIVERGENCE_WORKFLOW_VERSION='1.0.0';
export const MARKET_GAP_MATERIALITY_BP=5; // Explicit uncalibrated research guardrail, not statistically optimized.
const round=v=>Math.round(v*1000)/1000;
const labelFor={widening:'Market-implied widening',narrowing:'Market-implied narrowing',unclear:'Uncertain',unavailable:'Insufficient verified evidence'};

function researchSummary(bank){
 return {currency:bank?.currency||null,pressure:bank?.economicPressure||'Unavailable',
   score:Number.isFinite(bank?.score)?bank.score:null,
   components:bank?.scoreComponents||null,
   state:bank?.state||'unavailable',
   reviewed:bank?.policyEvidenceReviewed===true,
   reasonCode:bank?.reasonCode||'missing_bank'};
}

export function buildPairDivergenceWorkflow(pair,banks,qualitative,forwardRow,forwardHealth,now=Date.now()){
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
 const policy={status:policyOk?'reviewed':'review_due_or_conflicting',
   base:{state:a?.state||'unavailable',reviewed:a?.policyEvidenceReviewed===true,source:a?.guidance?.source||null},
   quote:{state:b?.state||'unavailable',reviewed:b?.policyEvidenceReviewed===true,source:b?.guidance?.source||null},
   qualitativeBias:qualitative?.state||'unavailable',qualitativeReason:qualitative?.reason||null,
   qualitativeReasonCode:qualitative?.reasonCode||null};
 const stages={market,macro,policy,comparison:{status:'unresolved',marketVersusPolicy:'not_comparable'}};
 let state='unclear',reasonCode='market_implied_path_unavailable',reason='';
 let classificationBasis='insufficient_market_evidence';
 if(!Number.isFinite(pair.baseRate)||!Number.isFinite(pair.quoteRate) || qualitative?.reasonCode==='stale_benchmark_snapshot'||qualitative?.reasonCode==='invalid_benchmark'){
   state='unavailable';reasonCode='invalid_official_benchmark';
   reason='A verified, current pair of official benchmark rates is required to compare policy gaps.';
 }else if(!macroOk){
   state='unavailable';reasonCode='macro_evidence_incomplete';
   reason='At least one currency lacks validated macroeconomic indicators. Market pricing, if present, is shown for context only.';
 }else if(!marketOk){
   reason='The verified 3-month market-implied policy-rate path for both currencies is not available. Macro and central-bank evidence remain visible, but the model does not invent a 90-day gap classification.';
   reasonCode='market_implied_path_unavailable';
 }else if(marketDirection==='unclear'){
   reasonCode='small_market_gap_change';
   classificationBasis='market_implied_policy_levels';
   reason='The implied change in the absolute policy-rate gap is smaller than the disclosed 5 bp research materiality threshold. A directional classification would overstate the evidence.';
 }else if(policyOk && ['widening','narrowing'].includes(qualitative?.state) && qualitative.state!==marketDirection){
   reasonCode='market_policy_disagreement';
   classificationBasis='conflicting_verified_layers';
   reason='Verified market-implied rate paths and reviewed qualitative central-bank biases point in opposite directions. The combined conclusion is uncertain rather than falsely choosing one.';
   stages.comparison.marketVersusPolicy='conflict';
 }else {
   state=marketDirection;
   reasonCode=policyOk?'market_implied_supported_by_policy_review':'market_implied_policy_review_pending';
   classificationBasis=policyOk?'market_implied_and_reviewed_context':'market_implied_only';
   reason=`Verified 3M market-implied policy levels indicate that the absolute gap ${state==='widening'?'increases':'decreases'} by ${Math.abs(expectedAbsoluteChangeBp).toFixed(1)} bp. ${policyOk?'Reviewed central-bank policy evidence is available for context.':'One or both central-bank outlook reviews are pending, so this is market pricing only, not an independently confirmed policy forecast.'}${crossing?' The implied signed differential crosses zero.':''}`;
   stages.comparison.marketVersusPolicy=policyOk?(qualitative?.state===state?'aligned':'non_directional'):'review_pending';
 }
 if(stages.comparison.marketVersusPolicy==='not_comparable' && marketOk){
   stages.comparison.marketVersusPolicy=policyOk?'unresolved':'review_pending';
 }
 stages.comparison.status=state==='unavailable'?'insufficient_data':state==='unclear'?'unresolved':'market_implied_direction';
 stages.comparison.reasonCode=reasonCode;
 const futureDeadline=marketOk?Date.parse(forwardRow.observedAt)+MAX_FRESH_AGE_MS:Infinity;
 const baseExpiry=Date.parse(a?.expiresAt),quoteExpiry=Date.parse(b?.expiresAt);
 const expiries=[baseExpiry,quoteExpiry,futureDeadline].filter(Number.isFinite);
 const expiry=expiries.length?new Date(Math.min(...expiries)).toISOString():null;
 const signedGap=Number.isFinite(pair.baseRate)&&Number.isFinite(pair.quoteRate)?round(pair.baseRate-pair.quoteRate):null;
 const result={
   base:pair.base,quote:pair.quote,signedGap,higher:signedGap>0?pair.base:signedGap<0?pair.quote:'Equal',
   horizonDays:90,state,label:labelFor[state],reason,reasonCode,classificationBasis,
   stages,market,macro,policy,
   qualitativeCandidate:{state:qualitative?.state||'unavailable',label:qualitative?.label||'Unavailable',
     reason:qualitative?.reason||null,reasonCode:qualitative?.reasonCode||null,
     is90DayForecast:false},
   sourceStatus:marketOk?'verified_market_path':'market_data_unavailable',
   expectedGapBp:marketOk?forwardRow.expectedSignedBp:null,
   expectedAbsoluteGapChangeBp, crossingRisk:crossing,
   direction:marketOk?Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp):0,
   tone:'neutral',signedDirection:marketOk?
     (Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp)>0?`Towards ${pair.base}`:
       Math.sign(forwardRow.expectedSignedBp-forwardRow.currentSignedBp)<0?`Towards ${pair.quote}`:'No supported direction'):
       'No verified market path',
   unchangedPossible:true,expiresAt:expiry
 };
 // No probabilities, future prices, or empirical accuracy implied by these rules.
 return result;
}
