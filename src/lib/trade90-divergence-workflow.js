// TRADE90 v4: independent macroeconomic and central-bank policy research.
// No market-implied, forward-rate or paid pricing inputs enter this assessment.
// Direction is conditional; no expected basis-point change or probability is inferred.
export const DIVERGENCE_WORKFLOW_VERSION='2.0.0';
export const MACRO_SCORE_CONTRAST=2; // Heuristic research threshold, not calibrated.
const round=v=>Math.round(v*1000)/1000;
const labelFor={widening:'Widening scenario',narrowing:'Narrowing scenario',unclear:'Uncertain',unavailable:'Insufficient current evidence'};
function summary(bank){
 return {currency:bank?.currency||null,pressure:bank?.economicPressure||'Unavailable',
   score:Number.isFinite(bank?.score)?bank.score:null,
   components:bank?.scoreComponents||null,
   state:bank?.state||'unavailable',
   reviewed:bank?.policyEvidenceReviewed===true,
   reasonCode:bank?.reasonCode||'missing_bank'};
}
export function buildPairDivergenceWorkflow(pair,banks,qualitative,now=Date.now(),automaticScenario=null){
 const a=banks?.[pair.base],b=banks?.[pair.quote];
 const rateOk=Number.isFinite(pair.baseRate)&&Number.isFinite(pair.quoteRate)&&
  !['stale_benchmark_snapshot','invalid_benchmark'].includes(qualitative?.reasonCode);
 const macroOk=[a,b].every(x=>x?.evidenceStatus?.macro==='validated'&&Number.isFinite(x.score)&&x.state!=='unavailable');
 const policyOk=[a,b].every(x=>x?.policyEvidenceReviewed===true&&['hike_hold','cut_hold','hold'].includes(x.state));
 const qualifiedAutomated=[a,b].every(x=>
  (x?.policyEvidenceReviewed===true&&['hike_hold','cut_hold','hold'].includes(x.state))||
  (x?.automatedAssessment?.status==='assessed'&&['hike_hold','cut_hold'].includes(x.automatedAssessment.state)));
 const scoreDifference=macroOk?round(a.score-b.score):null;
 const signedGap=rateOk?round(pair.baseRate-pair.quoteRate):null;
 const macroDirection=macroOk&&Math.abs(scoreDifference)>=MACRO_SCORE_CONTRAST?
  (signedGap===0||Math.sign(scoreDifference)===Math.sign(signedGap)?'widening':'narrowing'):null;
 const reviewedDirection=policyOk&&['widening','narrowing'].includes(qualitative?.state)?qualitative.state:null;
 const automaticDirection=qualifiedAutomated&&['widening','narrowing'].includes(automaticScenario?.state)?automaticScenario.state:null;
 const macro={status:macroOk?'validated':'incomplete',base:summary(a),quote:summary(b),
  comparison:'Descriptive economic pressure; no predicted policy-rate moves, basis points or probabilities'};
 const policy={status:policyOk?'reviewed':automaticDirection?'automated_provisional':'review_due_or_conflicting',
  base:{state:a?.state||'unavailable',reviewed:a?.policyEvidenceReviewed===true,source:a?.guidance?.source||null,automatic:a?.automatedAssessment||null},
  quote:{state:b?.state||'unavailable',reviewed:b?.policyEvidenceReviewed===true,source:b?.guidance?.source||null,automatic:b?.automatedAssessment||null},
  qualitativeBias:qualitative?.state||'unavailable',qualitativeReason:qualitative?.reason||null,
  qualitativeReasonCode:qualitative?.reasonCode||null};
 let state='unclear',reasonCode='insufficient_directional_evidence',reason='No sufficiently strong relative policy evidence currently establishes a direction.';
 let classificationBasis='insufficient_macro_policy_evidence',evidenceTier='undetermined',directionalSignal=0;
 if(!rateOk){
  state='unavailable';reasonCode='invalid_official_benchmark';
  reason='A verified and sufficiently current pair of official benchmark rates is required to compare policy gaps.';
 }else if(!macroOk){
  state='unavailable';reasonCode='macro_evidence_incomplete';
  reason='At least one central bank lacks usable source-validated macroeconomic indicators. The current published policy-rate gap can still be viewed separately.';
 }else if(reviewedDirection){
  if(macroDirection&&macroDirection!==reviewedDirection){
   reasonCode='reviewed_policy_macro_conflict';evidenceTier='conflicting_evidence';classificationBasis='conflicting_macro_policy_evidence';
   reason='Reviewed central-bank policy biases and relative economic-pressure diagnostics disagree. Direction is withheld until this difference is resolved.';
  }else{
   state=reviewedDirection;reasonCode='reviewed_policy_scenario';classificationBasis='reviewed_policy_scenario';
   evidenceTier='reviewed_qualitative';directionalSignal=qualitative?.direction||Math.sign(scoreDifference||0);
   reason='Current source-reviewed central-bank policy evidence supports a conditional '+state+' of the absolute policy-rate gap. The outlook estimates neither move size nor probability. Either bank may hold rates.';
  }
 }else if(policyOk){
  reasonCode='reviewed_policy_non_directional';evidenceTier='reviewed_qualitative';
  reason='Both banks have current reviewed policy evidence, but relative rate-move timing and magnitude remain unresolved. Economic pressure alone cannot override that ambiguity.';
 }else if(automaticDirection){
  if(macroDirection&&macroDirection!==automaticDirection){
   reasonCode='provisional_policy_macro_conflict';evidenceTier='conflicting_evidence';classificationBasis='conflicting_macro_policy_evidence';
   reason='Automated provisional policy screens conflict with the relative macroeconomic diagnostic. Direction is withheld pending additional evidence.';
  }else{
   state=automaticDirection;reasonCode='automated_policy_scenario';classificationBasis='automated_conditional_policy_pressure';
   evidenceTier='automated_provisional';directionalSignal=automaticScenario?.direction||Math.sign(scoreDifference||0);
   reason='Source-linked, machine-generated policy-pressure assessments suggest a conditional '+state+' of the absolute policy-rate gap. These are not independently reviewed interpretations of new central-bank statements. No future rate level or probability is estimated.';
  }
 }else if(macroDirection){
  state=macroDirection;reasonCode='macro_pressure_scenario';classificationBasis='macro_pressure_screen';
  evidenceTier='exploratory_macro';directionalSignal=Math.sign(scoreDifference);
  reason='Relative economic-pressure scores differ by '+Math.abs(scoreDifference)+' research points ('+pair.base+' '+a.score+', '+pair.quote+' '+b.score+'). Assuming policy responds to those pressures, the absolute rate gap could '+(state==='widening'?'widen':'narrow')+'. Central-bank policy interpretation remains unreviewed or unresolved. This exploratory screen is not a validated 90-day forecast.';
 }
 const expires=[Date.parse(a?.expiresAt),Date.parse(b?.expiresAt),now+48*3600000].filter(Number.isFinite);
 const expiry=expires.length?new Date(Math.min(...expires)).toISOString():null;
 const stages={macro,policy,comparison:{status:state==='unavailable'?'insufficient_data':state==='unclear'?'unresolved':'research_scenario',
  reasonCode,method:'Comparison of current official benchmark gaps and qualitative relative policy evidence'}};
 return {
  base:pair.base,quote:pair.quote,signedGap,higher:signedGap===null?'Unavailable':signedGap>0?pair.base:signedGap<0?pair.quote:'Equal',
  horizonDays:90,state,label:labelFor[state],reason,reasonCode,classificationBasis,evidenceTier,
  uncalibratedResearchScenario:['widening','narrowing'].includes(state),backtestedProbability:null,
  stages,macro,policy,
  automaticCandidate:{state:automaticScenario?.state||'unavailable',label:automaticScenario?.label||'Unavailable',
   reasonCode:automaticScenario?.reasonCode||null,isVerifiedStatementInterpretation:false},
  qualitativeCandidate:{state:qualitative?.state||'unavailable',label:qualitative?.label||'Unavailable',
   reason:qualitative?.reason||null,reasonCode:qualitative?.reasonCode||null,is90DayForecast:false},
  sourceStatus:state==='unavailable'?'insufficient_verified_inputs':policyOk?'source_reviewed_policy':automaticDirection?'automated_policy_and_macro':'macro_evidence_only',
  expectedGapBp:null,expectedAbsoluteGapChangeBp:null,crossingRisk:null,
  macroDirectionalScreen:{state:macroDirection||'unclear',scoreDifference,minimumContrast:MACRO_SCORE_CONTRAST,forecast:false},
  direction:directionalSignal,tone:'neutral',
  signedDirection:directionalSignal>0?'Indicative pressure towards '+pair.base:directionalSignal<0?'Indicative pressure towards '+pair.quote:'Direction not established',
  unchangedPossible:true,expiresAt:expiry
 };
}
