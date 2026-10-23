// Report factual refresh timestamps. Never change the publication or human review date.
const MS_DAY=86400000;
export const ageDays=(time,now)=>{const diff=Date.parse(now)-Date.parse(time);return Number.isFinite(diff)&&diff>=-5*60000?Math.max(0,diff)/MS_DAY:Infinity};
const recent=(timestamp,limit,now)=>ageDays(timestamp,now)<=limit;
const iso=(time)=>typeof time==='string'&&Number.isFinite(Date.parse(time))?time:null;
const info=(checkedAt,okCount,total,limit,now)=>{
 const completed=total>0 && okCount===total;
 return {checkedAt:iso(checkedAt),okCount,total,status:!recent(checkedAt,limit,now)?'overdue':completed?'checked':'partial'};
};
export function buildRefreshStatus({macro,extras,sourceMonitor,rateMonitor,policyModel,rateSnapshot,calendarReviewedAt,publicationReviewedAt,marketReportsReviewedAt,guidanceReviewedAt,assessments,upcomingByBank=[]},nowIso){
 if(!Number.isFinite(Date.parse(nowIso)))throw Error('Valid audit time required');
 const macroSeries=Object.values(macro?.countries||{}).flatMap(c=>Object.values(c?.series||{}));
 const extraSeries=Object.values(extras?.countries||{}).flatMap(c=>Object.values(c?.series||{}));
 const good=s=>s?.status==='ok'&&recent(s.retrievedAt,8,nowIso);
 const scan=sourceMonitor?.sources||[];
 const rateCoverage=rateMonitor?.coverage||[];
 const directlyValidated=x=>/matches published benchmark|matches|verified new decision/i.test(x?.state||'');
 const generated=policyModel?.generatedAt;
 const expiries=Object.values(policyModel?.pairs||{}).map(p=>p?.expiresAt);
 const currentPairs=expiries.filter(t=>t&&Date.parse(t)>Date.parse(nowIso)).length;
 const manualDates=Object.values(assessments||{}).map(a=>a?.reviewedAt).filter(Boolean);
 const oldestManual=manualDates.length?manualDates.sort()[0]:null;
 const byBank=new Set(upcomingByBank.filter(e=>e?.date>=nowIso.slice(0,10)).map(e=>e.currency));
 const categories={
  macro:info(macro?.checkedAt,macroSeries.filter(good).length,macroSeries.length,1.5,nowIso),
  extra:info(extras?.checkedAt,extraSeries.filter(good).length,extraSeries.length,1.5,nowIso),
  sourceDiscovery:info(sourceMonitor?.lastScanAt,scan.filter(x=>x.status==='available').length,8,1.5,nowIso),
  rateDecisionChecks:info(rateMonitor?.lastCheckedAt,rateCoverage.filter(directlyValidated).length,8,1.5,nowIso),
  model:{generatedAt:iso(generated),activePairs:currentPairs,totalPairs:expiries.length,status:!recent(generated,1.5,nowIso)?'overdue':currentPairs===expiries.length?'checked':'partial'}
 };
 const reviewed={
  benchmarkSnapshot:rateSnapshot?.asOf||null,
  policyPublications:publicationReviewedAt||null,
  meetingCalendar:calendarReviewedAt||null,
  policyStatements:guidanceReviewedAt||null,
  oldestPolicyAssessment:oldestManual,
  marketReports:marketReportsReviewedAt||null
 };
 const warnings=[];
 for(const [key,value] of Object.entries(categories))if(value.status!=='checked')warnings.push({category:key,reason:value.status==='overdue'?'Automatic data check is overdue':'Not all inputs could be verified',status:value.status});
 for(const [key,value] of Object.entries(reviewed)){
  if(!value||key==='benchmarkSnapshot')continue;
  if(ageDays(value,nowIso)>14)warnings.push({category:key,reason:'Curated material has not received a new documented review within 14 days',status:'manual_review_due'});
 }
 if(manualDates.length!==8)warnings.push({category:'oldestPolicyAssessment',reason:'Some policy assessment review records are missing',status:'manual_review_due'});
 if(byBank.size<8)warnings.push({category:'meetingCalendar',reason:'Not all eight central banks have a forthcoming dated meeting in the curated calendar',status:'manual_review_due'});
 return {schemaVersion:1,auditedAt:nowIso,disclaimer:'Audit time is when TRADE90 evaluated its saved datasets. It is NOT the time each source observation, benchmark or analyst note was verified.',categories,reviewed,warnings};
}
