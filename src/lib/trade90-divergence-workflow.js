// TRADE90 independent three-stage macro + central-bank divergence model.
// No market-implied rates, derivatives feeds, or future basis-point forecasts.
// 1. Validate source-dated macro evidence for both currencies.
// 2. Evaluate independently reviewed / explicitly provisional policy evidence.
// 3. Assess the possible direction of the absolute official-rate gap.
export const DIVERGENCE_WORKFLOW_VERSION='2.0.0';
export const MACRO_SCORE_CONTRAST=2; // Research screening threshold, not backtested.
const round=v=>Math.round(v*1000)/1000;
const labelFor={widening:'Widening scenario',narrowing:'Narrowing scenario',unclear:'Uncertain',unavailable:'Insufficient current evidence'};

function researchSummary(bank){
 return {currency:bank?.currency||null,pressure:bank?.economicPressure||'Unavailable',
  score:Number.isFinite(bank?.score)?bank.score:null,
  components:bank?.scoreComponents||null,state:bank?.state||'unavailable',
  reviewed:bank?.policyEvidenceReviewed===true,reasonCode:bank?.reasonCode||'missing_bank'};
}
function automatedPolicyQualified(bank){
 return bank?.policyEvidenceReviewed===true&&['hike_hold','cut_hold','hold'].includes(bank.state)||
  bank?.automatedAssessment?.status==='assessed'&&['hike_hold','cut_hold'].includes(bank.automatedAssessment.state);
}
export function buildPairDivergenceWorkflow(pair,banks,qualitative,automaticScenario=null,now=Date.now()){
 const a=banks?.[pair.base],b=banks?.[pair.quote];
 const macroOk=[a,b].every(x=>x&&x.state!=='unavailable'&&x.evidenceStatus?.macro==='validated'&&Number.isFinite(x.score));
 const policyOk=[a,b].every(x=>x?.policyEvidenceReviewed===true&&['hike_hold','cut_hold','hold'].includes(x.state));
 const automaticOk=[a,b].every(automatedPolicyQualified);
 const ratesOk=Number.isFinite(pair.baseRate)&&Number.isFinite(pair.quoteRate)&&
  !['stale_benchmark_snapshot','invalid_benchmark'].includes(qualitative?.reasonCode);
 const scoreDifference=macroOk?round(a.score-b.score):null;
 const signedGap=ratesOk?round(pair.baseRate-pair.quoteRate):null;
 const referenceSign=Math.sign(signedGap||0);
 // When the gap starts at zero, any material relative policy pressure would
 // widen its absolute magnitude, but the magnitude is NEVER estimated.
 const macroDirection=macroOk&&Math.abs(scoreDifference)>=MACRO_SCORE_CONTRAST?
  (referenceSign===0||Math.sign(scoreDifference)===referenceSign?'widening':'narrowing'):null;
 const reviewedDirection=policyOk&&['widening','narrowing'].includes(qualitative?.state)?qualitative.state:null;
 const automatedDirection=automaticOk&&['widening','narrowing'].includes(automaticScenario?.state)?automaticScenario.state:null;
 const macro={status:macroOk?'validated':'incomplete',base:researchSummary(a),quote:researchSummary(b),
  scoreDifference,minimumContrast:MACRO_SCORE_CONTRAST,
  directionalScreen:macroDirection||'unclear',comparison:'Relative economic pressure; not a future rate path, probability or basis-point estimate'};
 const policy={status:policyOk?'reviewed':automaticOk?'automated_provisional':'review_due_or_conflicting',
  base:{state:a?.state||'unavailable',reviewed:a?.policyEvidenceReviewed===true,source:a?.guidance?.source||null,automatic:a?.automatedAssessment||null},
  quote:{state:b?.state||'unavailable',reviewed:b?.policyEvidenceReviewed===true,source:b?.guidance?.source||null,automatic:b?.automatedAssessment||null},
  qualitativeBias:qualitative?.state||'unavailable',qualitativeReason:qualitative?.reason||null,
  qualitativeReasonCode:qualitative?.reasonCode||null};
 let state='unclear',reasonCode='insufficient_directional_evidence',classificationBasis='insufficient_evidence';
 let evidenceTier='undetermined',reason='Available evidence does not establish a reliable relative policy direction.';
 if(!ratesOk){
  state='unavailable';reasonCode='invalid_official_benchmark';
  reason='Current, verified official benchmark rates are required before assessing their relative gap.';
 }else if(!macroOk){
  state='unavailable';reasonCode='macro_evidence_incomplete';
  reason='At least one central bank has missing, stale or invalid macroeconomic inputs. No directional assessment is published.';
 }else if(reviewedDirection && macroDirection && reviewedDirection!==macroDirection){
  reasonCode='reviewed_policy_macro_disagreement';evidenceTier='conflicting_evidence';
  reason='Source-reviewed central-bank interpretation and relative macroeconomic pressure point in different directions. The 90-day research scenario remains uncertain.';
 }else if(reviewedDirection){
  state=reviewedDirection;reasonCode='reviewed_policy_scenario';
  classificationBasis='reviewed_policy_scenario';evidenceTier='reviewed_qualitative';
  reason=`Source-reviewed central-bank policy assessments suggest a conditional ${state} of the absolute official-rate gap. ${macroDirection===state?'Relative economic pressure supports the same direction.':'Macroeconomic scores alone do not establish a material directional contrast.'} No future policy-rate levels, probabilities or move sizes are estimated.`;
 }else if(automatedDirection && macroDirection && automatedDirection!==macroDirection){
  reasonCode='automated_policy_macro_disagreement';evidenceTier='conflicting_evidence';
  reason='Automated provisional policy context conflicts with relative economic-pressure evidence. Trade90 therefore makes no directional claim.';
 }else if(automatedDirection){
  state=automatedDirection;reasonCode='automated_policy_scenario';
  classificationBasis='automated_conditional_policy_pressure';evidenceTier='automated_provisional';
  reason=`Automated checks of source-dated central-bank decisions and macro observations support a provisional ${state} scenario. This is not a human-reviewed interpretation of the latest statements or a calibrated forecast.`;
 }else if(macroDirection){
  state=macroDirection;reasonCode='macro_pressure_scenario';
  classificationBasis='macro_pressure_screen';evidenceTier='exploratory_macro';
  reason=`The economic-pressure difference is ${Math.abs(scoreDifference)} model points (${pair.base} ${a.score}, ${pair.quote} ${b.score}). This suggests a possible ${state} of the absolute policy-rate gap if policy responds in that direction. It is an exploratory, uncalibrated scenario without a reviewed policy conclusion.`;
 }else{
  reason='Relative inflation, employment, growth and central-bank policy evidence do not establish a sufficiently clear divergence. Uncertain is a valid research outcome.';
 }
 const baseExpiry=Date.parse(a?.expiresAt),quoteExpiry=Date.parse(b?.expiresAt);
 const expiries=[baseExpiry,quoteExpiry].filter(Number.isFinite);
 const expiresAt=expiries.length?new Date(Math.min(...expiries)).toISOString():null;
 const directionalSignal=macroDirection?Math.sign(scoreDifference):0;
 const stages={macro,policy,comparison:{status:state==='unavailable'?'insufficient_data':state==='unclear'?'unresolved':'conditional_research_scenario',reasonCode}};
 return {
  base:pair.base,quote:pair.quote,signedGap,
  higher:signedGap===null?'Unavailable':signedGap>0?pair.base:signedGap<0?pair.quote:'Equal',
  horizonDays:90,state,label:labelFor[state],reason,reasonCode,classificationBasis,evidenceTier,
  uncalibratedResearchScenario:['widening','narrowing'].includes(state),
  backtestedProbability:null,stages,macro,policy,
  automaticCandidate:{state:automaticScenario?.state||'unavailable',label:automaticScenario?.label||'Unavailable',
   reasonCode:automaticScenario?.reasonCode||null,isVerifiedStatementInterpretation:false},
  qualitativeCandidate:{state:qualitative?.state||'unavailable',label:qualitative?.label||'Unavailable',
   reason:qualitative?.reason||null,reasonCode:qualitative?.reasonCode||null,is90DayForecast:false},
  sourceStatus:!macroOk?'macro_incomplete':policyOk?'macro_and_policy_reviewed':automaticOk?'macro_and_automated_policy':'macro_only',
  macroDirectionalScreen:{state:macroDirection||'unclear',scoreDifference,minimumContrast:MACRO_SCORE_CONTRAST,forecast:false},
  direction:directionalSignal,signedDirection:state==='unclear'||state==='unavailable'?'Direction not established':`Relative policy-rate gap may ${state==='widening'?'widen':'narrow'}`,
  tone:'neutral',unchangedPossible:true,expiresAt
 };
}
