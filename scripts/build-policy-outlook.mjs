import fs from 'node:fs';
import crypto from 'node:crypto';
import {MODEL_VERSION,bankOutlook,pairOutlook} from '../src/lib/trade90-policy-model.js';
import {policyGuidance} from '../src/data/trade90-policy-guidance.js';
import {allTrade90Pairs} from '../src/lib/trade90-v3.js';
import {getExpectedRows} from '../src/lib/trade90-forward-rates.js';
import {DIVERGENCE_WORKFLOW_VERSION,buildPairDivergenceWorkflow} from '../src/lib/trade90-divergence-workflow.js';
import {AUTO_POLICY_VERSION,runAutomaticPolicyReview} from '../src/lib/trade90-auto-policy-review.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const macro=read('public/data/macro-history.json');
const extra=fs.existsSync('public/data/policy-inputs.json')?read('public/data/policy-inputs.json'):{countries:{}};
const snapshot=read('src/data/trade90-policy-snapshot.json');
const assessments=read('src/data/trade90-policy-assessments.json');
const forwards=read('public/data/forward-rate-snapshot.json');
const rateMonitor=read('public/data/official-policy-automation.json');
const sourceMonitor=read('public/data/official-source-monitor.json');
const guidance=Object.fromEntries(Object.entries(policyGuidance).map(([c,g])=>[c,{...g,assessment:assessments[c],latestDecisionDate:snapshot.banks.find(b=>b.code===c)?.decisionDate}]));
const now=Date.now(),generatedAt=new Date(now).toISOString();
const banks=Object.fromEntries(Object.keys(macro.countries).map(c=>[c,bankOutlook(c,macro,guidance,now,extra)]));
const DAY=86400000;
for(const bank of Object.values(banks)){
 // A stale editorial guidance review must not expire otherwise valid macro-only
 // uncertainty. Use its deadlines only when issuing a reviewed policy assessment.
 const limits=[now+2*DAY,Date.parse(snapshot.asOf)+45*DAY];
 if(bank.policyEvidenceReviewed){
  limits.push(Date.parse(bank.guidance?.publishedDate)+90*DAY);
  limits.push(Date.parse(bank.guidance?.assessment?.reviewedAt)+14*DAY);
 }
 for(const c of bank.coverage||[])if(c.usable){
  limits.push(Date.parse(c.retrievedAt)+7*DAY);
  // Expire against each series's actual period end; do not infer it from another driver.
  if(c.periodEnd)limits.push(Date.parse(c.periodEnd)+(c.frequency==='Quarterly'?210:100)*DAY);
 }
 bank.expiresAt=new Date(Math.min(...limits.filter(Number.isFinite))).toISOString();
}
// Re-evaluate every central bank automatically after the official-source and
// official-rate monitors. This is explicitly provisional macro/decision context;
 // it does not overwrite editorial annotations or pretend to read a new statement.
const automatedReview=runAutomaticPolicyReview({banks,snapshot,rateMonitor,sourceMonitor,checkedAt:generatedAt});
for(const [code,bank] of Object.entries(banks)){
 bank.automatedAssessment=automatedReview.banks[code];
 bank.evidenceStatus.automatedPolicy=bank.automatedAssessment?.status||'not_evaluated';
 // Newly discovered dated official decisions supersede older manually reviewed
 // commentary even if the benchmark importer cannot safely parse the new rate.
 if(bank.automatedAssessment?.status==='new_decision_requires_verification'&&bank.policyEvidenceReviewed){
  bank.policyEvidenceReviewed=false;
  bank.state='uncertain';bank.label='Policy direction uncertain';
  bank.reasonCode='new_official_decision_unverified';
  bank.evidenceStatus.policy='superseded_official_release';
  bank.reasons.push('A newer dated official policy decision was found. Earlier editorial guidance is superseded until its decision and rate are verified.');
 }
}
fs.writeFileSync('public/data/automated-policy-review.json',JSON.stringify(automatedReview,null,2)+'\\n');
// Market pricing is the first stage. Missing licensed provider data is not replaced
// with a synthetic forecast or a manually maintained policy-rate ranking.
const forwardRows=getExpectedRows(forwards,snapshot.banks,'3M',now);
const forwardBySymbol=Object.fromEntries(forwardRows.rows.map(r=>[r.symbol,r]));
const pairs=Object.fromEntries(allTrade90Pairs.map(p=>{
 const qualitative=pairOutlook(p,banks,snapshot.asOf,now);
 const provisionalBanks=Object.fromEntries([p.base,p.quote].map(code=>{
  const original=banks[code],automatic=original.automatedAssessment;
  const replacement=original.policyEvidenceReviewed?original.state:
   automatic?.status==='assessed'&&['hike_hold','cut_hold'].includes(automatic.state)?automatic.state:'uncertain';
  return [code,{...original,state:replacement}];
 }));
 const automaticScenario=pairOutlook(p,provisionalBanks,snapshot.asOf,now);
 const result=buildPairDivergenceWorkflow(p,banks,qualitative,forwardBySymbol[p.symbol],forwardRows.health,now,automaticScenario);

 return [p.symbol,result];
}));
// Successful polling is not new economic evidence. Revisions, source/status changes,
// policy annotations and classifications still change the fingerprint.
const semantic=(value)=>Array.isArray(value)?value.map(semantic):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>!['retrievedAt','checkedAt','sourceUpdated','generatedAt','expiresAt'].includes(k)).map(([k,v])=>[k,semantic(v)])):value;
const fingerprint=crypto.createHash('sha256').update(JSON.stringify(semantic({version:MODEL_VERSION,workflowVersion:DIVERGENCE_WORKFLOW_VERSION,autoVersion:AUTO_POLICY_VERSION,macro,extra,guidance,snapshot,forwards,rateMonitor,sourceMonitor,automatedReview}))).digest('hex');
const output={schemaVersion:5,automatedPolicyCoverage:{assessed:automatedReview.assessedBanks,total:automatedReview.totalBanks,verifiedDecisions:automatedReview.directlyVerifiedDecisions,unverifiedNewDecisions:automatedReview.flaggedNewOfficialDecisions,generatedAt},scenarioPolicy:'market_verified_or_qualitative_research',modelVersion:MODEL_VERSION,workflowVersion:DIVERGENCE_WORKFLOW_VERSION,experimental:true,generatedAt,inputFingerprint:fingerprint,horizonDays:90,marketHorizon:'3M',marketCoverage:{validated:forwardRows.health.valid,currencyPairCount:forwardRows.availableCount,totalPairs:28,reason:forwardRows.health.reason},banks,pairs};
fs.writeFileSync('public/data/policy-outlook.json',JSON.stringify(output,null,2)+'\n');
const path='public/data/policy-outlook-history.json';
const history=fs.existsSync(path)?read(path):{schemaVersion:1,records:[]};
// Preserve records from machines with skewed clocks, but never use them as
// correctly timed prospective forecasts. Do not rewrite their original evidence.
let archiveChanged=false;
for(const record of history.records){
 if(Date.parse(record.generatedAt)>now+5*60000&&!record.excludedFromEvaluation){
  record.excludedFromEvaluation=true;
  record.exclusionReason='Recorded timestamp was ahead of the publication runner clock';
  archiveChanged=true;
 }
}
const states=Object.fromEntries(Object.entries(pairs).map(([p,v])=>[p,v.state]));
const last=history.records.at(-1);
if(!last||last.inputFingerprint!==fingerprint||JSON.stringify(last.states)!==JSON.stringify(states)){
 history.records.push({generatedAt,modelVersion:MODEL_VERSION,inputFingerprint:fingerprint,states,rates:Object.fromEntries(snapshot.banks.map(b=>[b.code,b.rate])),pairs,evidence:banks});
 archiveChanged=true;
}
if(archiveChanged)fs.writeFileSync(path,JSON.stringify(history,null,2)+'\n');
console.log('Policy model:',Object.values(pairs).reduce((a,p)=>(a[p.state]=(a[p.state]||0)+1,a),{}));
