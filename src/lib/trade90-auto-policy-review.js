// Deterministic, daily *provisional* policy assessment for all eight central banks.
// Never impersonate an analyst or claim to have interpreted a full statement.
// Source check: decision snapshot + discovered official links + strict parser outcome.
// A checked timestamp is NOT a new publication/review date or forward-rate quote.
export const AUTO_POLICY_VERSION='1.0.0';
export const AUTO_BANKS=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
const DAY=86400000;
const hosts={
 USD:'www.federalreserve.gov',EUR:'www.ecb.europa.eu',GBP:'www.bankofengland.co.uk',
 JPY:'www.boj.or.jp',AUD:'www.rba.gov.au',NZD:'www.rbnz.govt.nz',
 CAD:'www.bankofcanada.ca',CHF:'www.snb.ch'
};
const isoDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const age=(s,now)=>(now-Date.parse(s))/DAY;
const current=(s,max,now)=>Number.isFinite(age(s,now))&&age(s,now)>=-5/1440&&age(s,now)<=max;
const officialUrl=(url,code)=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.port&&!u.username&&!u.password&&u.hostname===hosts[code]}catch{return false}};
// Extract source-dated *decision publications*, not monetary-policy speeches/minutes,
// and never use discovery time as the decision's publication date.
export function datedPolicyRelease(link,code){
 if(!officialUrl(link?.url,code))return null;
 const path=new URL(link.url).pathname;
 const title=String(link.title||'');
 let date=null,m;
 if(code==='USD'&&/FOMC statement/i.test(title)){
  m=path.match(/\/pressreleases\/monetary(20\d{2})(\d{2})(\d{2})a\.htm$/i);
  if(m)date=m[1]+'-'+m[2]+'-'+m[3];
 }
 if(code==='EUR'&&/monetary policy decisions/i.test(title)){
  m=path.match(/\/ecb\.mp(\d{2})(\d{2})(\d{2})~/i);
  if(m)date='20'+m[1]+'-'+m[2]+'-'+m[3];
 }
 if(code==='CAD'&&/policy rate|target for the overnight rate|bank of canada (?:raises|lowers|reduces|holds)/i.test(title)){
  m=path.match(/fad-press-release-(20\d{2})-(\d{2})-(\d{2})/i);
  if(m)date=m[1]+'-'+m[2]+'-'+m[3];
 }
 if(code==='CHF'&&/monetary policy assessment/i.test(title)){
  m=path.match(/pre_(20\d{2})(\d{2})(\d{2})/i);
  if(m)date=m[1]+'-'+m[2]+'-'+m[3];
 }
 if(code==='JPY'&&/statement on monetary policy/i.test(title)){
  m=path.match(/\/(?:mpr_20\d{2}|state_20\d{2})\/k(\d{2})(\d{2})(\d{2})[a-z]\.pdf?$/i);
  if(m)date='20'+m[1]+'-'+m[2]+'-'+m[3];
  m=path.match(/\/state_20\d{2}\/k(\d{2})(\d{2})(\d{2})[a-z]\.htm$/i);
  if(m)date='20'+m[1]+'-'+m[2]+'-'+m[3];
 }
 if(!isoDay(date))return null;
 return {date,url:link.url,title};
}
export function assessAutomaticPolicyBank({currency,bank,snapshotBank,rateCheck,source,benchmarkAsOf,checkedAt}){
 const now=Date.parse(checkedAt),out={
  currency,checkedAt,assessmentMethod:'deterministic_macro_plus_official_decision_context',
  isEditorialReview:false,isVerifiedStatementInterpretation:false,
  provisional:true,expectedChangeBp:null,probability:null,state:'uncertain',
  label:'No supported automated direction',status:'not_evaluated',
  evidence:{macro:bank?.evidenceStatus?.macro||'unavailable',
   benchmarkRate:snapshotBank?.rate??null,decisionDate:snapshotBank?.decisionDate||null,
   decisionSource:snapshotBank?.source||null,
   verifiedDecisionThisRun:false,sourceScanCurrent:false,
   newerOfficialDecision:null,sourceCheck:rateCheck?.state||'not_checked'},
  reason:'Insufficient evidence to issue an automated conditional bias'
 };
 if(!AUTO_BANKS.includes(currency)||!Number.isFinite(now))return {...out,status:'invalid_bank'};
 if(!Number.isFinite(snapshotBank?.rate)||!isoDay(snapshotBank?.decisionDate)||
    !officialUrl(snapshotBank?.source,currency)||!current(benchmarkAsOf,45,now)||
    !current(snapshotBank.decisionDate,90,now)){
  return {...out,status:'benchmark_unverified',reason:'Missing, stale or invalid benchmark decision evidence'};
 }
 const match=rateCheck&&/^(Decision matches published benchmark|Verified new decision)$/.test(rateCheck.state||'')&&
  rateCheck.decisionDate===snapshotBank.decisionDate&&rateCheck.source===snapshotBank.source&&
  current(rateCheck.checkedAt,2,now);
 out.evidence.verifiedDecisionThisRun=Boolean(match);
 out.evidence.sourceScanCurrent=source?.status==='available'&&current(source?.lastSuccessAt,2,now);
 if(!out.evidence.sourceScanCurrent&&!match){
  return {...out,status:'source_check_unavailable',reason:'Neither a current official release scan nor a directly verified latest decision is available'};
 }
 const releases=(source?.items||[]).map(item=>datedPolicyRelease(item,currency))
  .filter(x=>x&&x.date>snapshotBank.decisionDate&&x.date<=checkedAt.slice(0,10))
  .sort((a,b)=>b.date.localeCompare(a.date));
 if(releases.length){
  out.evidence.newerOfficialDecision=releases[0];
  return {...out,status:'new_decision_requires_verification',
    reason:'A newer dated official policy publication was discovered. The older benchmark decision cannot support a current automated policy bias until the new document and effective rate are verified.'};
 }
 if(bank?.state==='unavailable'||bank?.evidenceStatus?.macro!=='validated'||
    !Number.isFinite(bank?.score)||!bank?.scoreComponents){
  return {...out,status:'macro_unavailable',reason:'Required current macroeconomic evidence is missing'};
 }
 const components=bank.scoreComponents;
 if(![components.inflation,components.employment,components.growth].every(Number.isFinite)||
    components.total!==bank.score){
  return {...out,status:'macro_unavailable',reason:'Inflation, employment and growth pillar scores are incomplete'};
 }
 out.status='assessed';
 out.evidence.macroScore=bank.score;
 out.evidence.inflationPillar=components.inflation;
 const materialWeakness=(bank.cautions||[]).some(x=>/Material activity weakness/i.test(x));
 if(components.inflation>=2&&bank.score>=2&&!materialWeakness){
  out.state='hike_hold';out.label='Automated tightening-pressure scenario';
  out.reason='Source-validated inflation pressure and the total macro score support a conditional tightening-versus-hold research scenario. This is NOT a verified forward-looking central-bank statement or a predicted rate increase.';
 }else if(components.inflation<=-1&&bank.score<=-2&&!materialWeakness){
  out.state='cut_hold';out.label='Automated easing-pressure scenario';
  out.reason='Source-validated disinflation and the total macro score support a conditional easing-versus-hold research scenario. This is NOT a verified forward-looking central-bank statement or a predicted rate cut.';
 }else{
  out.reason='Current economic pressure is insufficient or conflicting. The latest published rate decision alone does not establish a prospective hike, cut or hold.';
 }
 return out;
}
export function runAutomaticPolicyReview({banks,snapshot,rateMonitor,sourceMonitor,checkedAt}){
 const rateByCode=new Map((rateMonitor?.coverage||[]).map(x=>[x.code,x]));
 const sourceByCode=new Map((sourceMonitor?.sources||[]).map(x=>[x.code,x]));
 const snapshotByCode=new Map((snapshot?.banks||[]).map(x=>[x.code,x]));
 const result=Object.fromEntries(AUTO_BANKS.map(code=>[code,assessAutomaticPolicyBank({
  currency:code,bank:banks?.[code],snapshotBank:snapshotByCode.get(code),
  rateCheck:rateByCode.get(code),source:sourceByCode.get(code),
  benchmarkAsOf:snapshot?.asOf,checkedAt
 })]));
 return {
  schemaVersion:1,model:'automated_provisional_policy_review',methodVersion:AUTO_POLICY_VERSION,
  generatedAt:checkedAt,meaning:'Eight automatically assessed macro/decision contexts. Not a statement interpretation, not market pricing or editorial review.',
  totalBanks:AUTO_BANKS.length,assessedBanks:Object.values(result).filter(x=>x.status==='assessed').length,
  directlyVerifiedDecisions:Object.values(result).filter(x=>x.evidence.verifiedDecisionThisRun).length,
  flaggedNewOfficialDecisions:Object.values(result).filter(x=>x.status==='new_decision_requires_verification').length,
  banks:result
 };
}
