// Shadow evaluation only. No output from this file is allowed to affect
// the live Widening/Narrowing policy-rate model until out-of-sample validated.
import {YIELD_CURRENCIES,curveAt} from './trade90-yield-research.js';
export const MIN_INDEPENDENT_OUTCOMES=30;
export function evaluateYieldIntegration(yieldData,rateHistory,now=new Date().toISOString()){
 const events=Array.isArray(rateHistory)?rateHistory:[];
 const cutoff=Date.parse(now)-90*86400000;
 const byCode=Object.fromEntries(YIELD_CURRENCIES.map(code=>[code,events
  .filter(e=>e.code===code&&Number.isFinite(e.ratePct)&&/^\d{4}-\d{2}-\d{2}$/.test(e.effectiveDate||''))
  .sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate))]));
 const coverage=Object.fromEntries(YIELD_CURRENCIES.map(code=>{
  const curve=curveAt(yieldData?.currencies?.[code],now);
  return [code,{sourceStatus:curve.status,historyPoints:curve.history.length,
   earliestObservation:curve.history[0]?.date||null,
   latestObservation:curve.date,
   recordedPolicyDecisions:byCode[code].length,
   outcomesWithAtLeast90DaysElapsed:byCode[code].filter(e=>Date.parse(e.effectiveDate+'T00:00:00Z')<=cutoff).length}];
 }));
 // An archived policy-decision update is NOT a complete daily rate path.
 // Without before-and-after decision records for BOTH currencies spanning
 // 90 days, do not report hit rates, probabilities or sample outcomes.
 const completed=YIELD_CURRENCIES.filter(code=>byCode[code].filter(e=>Date.parse(e.effectiveDate+'T00:00:00Z')<=cutoff).length>=2);
 const availableCompletePairs=completed.length*(completed.length-1)/2;
 return {schemaVersion:1,generatedAt:now,purpose:'Independent research validation only; not used by policy divergence engine',
  horizonDays:90,minimumIndependentOutcomes:MIN_INDEPENDENT_OUTCOMES,
  status:'insufficient_verified_policy_outcomes',
  completedBacktestOutcomes:0,
  comparablePairCountWithCompleteRateHistory:availableCompletePairs,
  recordedPolicyDecisionEvents:events.length,
  hitRate:null,confidence:null,improvementVsMacroBaseline:null,
  productionModelUsesYieldCurves:false,
  limitations:[
   'A complete historical policy-rate path for both currencies, with source-dated starting and 90-day outcome levels, is required before scoring yield inputs.',
   'Historical bonds may differ by benchmark conventions and observation dates; compare compatible instrument definitions.',
   'Backtesting must use information available only at the forecast timestamp and hold out later dates for evaluation.',
   'No Widening/Narrowing label or model weight is changed by this diagnostic.'
  ],
  coverage};
}
