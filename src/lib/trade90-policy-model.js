import {policyFrameworks} from '../data/trade90-policy-frameworks.js';
export const MODEL_VERSION='3.0.0';
const DAY=86400000;
const age=(v,now)=>(now-Date.parse(v))/DAY;
const validAge=(v,max,now)=>Number.isFinite(age(v,now))&&age(v,now)>=0&&age(v,now)<=max;
// Date.parse can normalize impossible calendar dates: validate exact ISO days.
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const round=v=>Math.round(v*1e8)/1e8;
export const changeSignal=(latest,prior,threshold)=>{
 if(![latest,prior,threshold].every(Number.isFinite)||threshold<=0)return null;
 const delta=round(latest-prior);
 return delta>=threshold?1:delta<=-threshold?-1:0;
};
export function observationPeriodEnd(series,point){
 if(!point)return null;
 if(point.periodEnd)return point.periodEnd;
 if(series?.frequency!=='Quarterly')return point.date;
 const date=new Date(`${point.date}T00:00:00Z`);
 if(!Number.isFinite(date.getTime()))return point.date;
 // Only derive period end from a standard first-day quarterly label.
 // Non-standard observation dates must not receive an artificially extended validity.
 if(date.getUTCDate()!==1||date.getUTCMonth()%3!==0)return point.date;
 // Quarterly time-series label the FIRST day of a quarter, not the release/period end.
 return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+3,0)).toISOString().slice(0,10);
}
export function usableSeries(s,now){
 if(!s||s.status!=='ok'||!validAge(s.retrievedAt,7,now)||!['Monthly','Quarterly'].includes(s.frequency))return false;
 if(!Array.isArray(s.points)||s.points.length<4)return false;
 if(s.points.some((p,i)=>!Number.isFinite(p.value)||!validDate(p.date)||age(p.date,now)<0||(i&&p.date<=s.points[i-1].date)))return false;
 const p=s.points.at(-1),end=observationPeriodEnd(s,p);
 if(!validDate(end)||end<p.date)return false;
 return validAge(end,s.frequency==='Quarterly'?210:100,now);
}
export function priorObservation(s,months){
 const d=new Date(s.points.at(-1).date+'T00:00:00Z');d.setUTCMonth(d.getUTCMonth()-months);
 return s.points.find(p=>p.date===d.toISOString().slice(0,10));
}
const labels={hike_hold:'Hike or hold bias',cut_hold:'Cut or hold bias',hold:'Conditional hold bias',uncertain:'Policy direction uncertain',unavailable:'Policy outlook unavailable'};
const median=arr=>{const a=[...arr].sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;};
export function bankOutlook(currency,data,guidance,now=Date.now(),additional={}){
 const s=data?.countries?.[currency]?.series||{},extra=additional?.countries?.[currency]?.series||{};
 const framework=policyFrameworks[currency],g=guidance?.[currency];
 const result={currency,state:'unavailable',label:labels.unavailable,economicPressure:'Unavailable',drivers:[],reasons:[],cautions:[],guidance:g||null,framework,coverage:[],watch:g?.watch||'Inflation, labour releases and the next policy decision',reasonCode:'missing_macro_inputs',evidenceStatus:{macro:'unavailable',policy:'unreviewed'}};
 const required={inflation:['USD','AUD'].includes(currency)?extra.targetInflation:s.inflation,core:extra.coreInflation,unemployment:s.unemployment,gdp:s.gdp};
 for(const [key,series] of Object.entries(required)){
  const usable=usableSeries(series,now);
  result.coverage.push({key,usable,latestDate:series?.points?.at(-1)?.date||null,periodEnd:observationPeriodEnd(series,series?.points?.at(-1)),frequency:series?.frequency||null,retrievedAt:series?.retrievedAt||null,source:series?.sourceUrl||null});
  if(!usable)result.reasons.push(`${key}: missing, stale, invalid or refresh failed`);
 }
 if(!framework)result.reasons.push('Policy framework unavailable');
 if(currency==='EUR'&&[required.inflation,required.core,s.unemployment,s.gdp].some(x=>x?.geography!=='EA21'))result.reasons.push('Euro-area geographic coverage is not aligned');
 if(result.reasons.length)return result;
 const {inflation:inf,core,unemployment:jobs,gdp}=required;
 const ip=priorObservation(inf,inf.frequency==='Quarterly'?6:3),cp=priorObservation(core,core.frequency==='Quarterly'?6:3),up=priorObservation(jobs,jobs.frequency==='Quarterly'?6:3),gp=priorObservation(gdp,3);
 if(!ip||!cp||!up||!gp){result.reasonCode='missing_comparison_period';result.reasons.push('Comparable prior observations are missing');return result;}
 const i=inf.points.at(-1),c=core.points.at(-1),u=jobs.points.at(-1),v=gdp.points.at(-1);
 const it=changeSignal(i.value,ip.value,.3),ct=changeSignal(c.value,cp.value,.3),labour=-changeSignal(u.value,up.value,.2);
 const above=i.value>framework.high||(currency==='CHF'&&i.value===framework.high),below=i.value<framework.low;
 const within=!above&&!below;
 // Headline and core are one inflation pillar, not independent votes.
 let inflation=0;
 if(above&&it>=0&&c.value>framework.reference&&ct>=0)inflation=2;
 else if(below&&it<=0&&c.value<framework.reference&&ct<=0)inflation=-2;
 else if(it<0&&ct<0)inflation=-1;
 const history=gdp.points.filter(p=>p.date<gp.date).slice(-20);
 const baseline=history.length>=12?median(history.map(p=>p.value)):null;
 const contraction=v.value<0&&gp.value<0;
 const growth=contraction?-1:baseline!==null&&v.value>Math.max(0,baseline)&&gp.value>Math.max(0,baseline)?1:0;
 const trendText=n=>n>0?'rising':n<0?'falling':'broadly steady';
 const add=(metric,text,signal,series,latest,previous)=>result.drivers.push({metric,text,signal,latest,previous,frequency:series.frequency,source:series.sourceUrl,title:series.sourceTitle,retrievedAt:series.retrievedAt});
 add(framework.measure,`${above?'Above':below?'Below':'Within'} the model reference zone; ${trendText(it)}`,inflation,inf,i,ip);
 add('Underlying inflation',`${core.sourceTitle}; ${trendText(ct)}`,ct,core,c,cp);
 add('Employment',`Unemployment ${trendText(-labour)}`,labour,jobs,u,up);
 add('Real GDP',contraction?'Two quarters of contraction':growth>0?'Two quarters above the economy’s prior five-year median':'No sustained growth signal relative to recent history',growth,gdp,v,gp);
 const score=inflation+labour+growth;
 result.score=score;
 result.scoreComponents={inflation,employment:labour,growth,total:score,headlineTrend:it,underlyingTrend:ct};
 result.evidenceStatus.macro='validated';
 result.economicPressure=inflation>0&&score>=1?'Tightening pressure':inflation<0&&score<=-1?'Easing pressure':'Balanced or conflicting pressure';
 result.cautions.push('Core definitions differ across countries; these are supporting indicators, not separate official targets.');
 if(currency==='AUD')result.cautions.push('OECD CPI excluding food and energy is not the RBA trimmed-mean measure. Monthly model CPI and quarterly comparison-chart CPI cover different periods.');
 if(currency==='CAD')result.cautions.push('Exclusion-based CPI is not the Bank of Canada’s CPI-trim or CPI-median.');
 if(currency==='JPY')result.cautions.push('OECD CPI excluding food and energy differs from Japan’s commonly cited CPI excluding fresh food.');
 if(it!==ct)result.cautions.push('Headline and underlying inflation trends differ; energy, food or other components may matter.');
 if(inflation>0&&labour<0)result.cautions.push('Rising unemployment offsets inflation pressure and could favour holding.');
 if(inflation<0&&labour>0)result.cautions.push('Falling unemployment offsets disinflation and could favour holding.');
 const severeLabour=round(u.value-up.value)>=.5;
 if(severeLabour||contraction)result.cautions.push('Material activity weakness makes the policy trade-off more uncertain.');
 const annotation=g?.assessment;
 const guidanceValid=g&&validAge(g.publishedDate,90,now)&&validAge(annotation?.reviewedAt,14,now)&&annotation?.publishedDate===g.publishedDate&&annotation?.source===g.source&&(!g.latestDecisionDate||g.latestDecisionDate<=g.publishedDate);
 // Current macro observations can support an evidence-based uncertainty assessment
 // even when an editorial summary is stale. Never manufacture a directional policy
 // signal, nor treat a successful source poll as a new manual guidance review.
 result.policyEvidenceReviewed=Boolean(guidanceValid);
 result.evidenceStatus.policy=guidanceValid?'reviewed_current':'review_due';
 if(!guidanceValid){
  result.reasonCode='policy_review_due';
  result.state='uncertain';
  result.label=labels.uncertain;
  result.reasons.push('Official policy guidance is expired, unreviewed or superseded; no directional policy assessment is issued');
  result.cautions.push('Economic indicators are source-checked, but the prior central-bank commentary is not treated as current.');
  return result;
 }
 let state='uncertain';
 const bias=annotation.bias;
 if(!['tightening','easing','neutral','hold_context'].includes(bias)){
  result.state='uncertain';result.label=labels.uncertain;
  result.policyEvidenceReviewed=false;
  result.evidenceStatus.policy='invalid_classification';
  result.reasonCode='unsupported_policy_classification';
  result.reasons.push('Unsupported policy guidance classification; no directional policy assessment is issued');
  return result;
 }
 if(bias==='tightening'&&inflation>=0&&score>=0&&!severeLabour&&!contraction)state='hike_hold';
 else if(bias==='easing'&&inflation<=0&&score<=0)state='cut_hold';
 else if(bias==='neutral'&&inflation===2&&score>=3&&!severeLabour&&!contraction)state='hike_hold';
 else if(bias==='neutral'&&inflation<=-1&&score<=-3)state='cut_hold';
 else if(bias==='hold_context'&&within&&c.value>=framework.low&&c.value<=framework.high&&Math.abs(score)<=1&&!severeLabour&&!contraction)state='hold';
 result.state=state;result.label=labels[state];
 result.reasonCode=state==='uncertain'?'conflicting_policy_evidence':'reviewed_policy_bias';
 if(state==='uncertain')result.reasons.push('The evidence does not establish a sufficiently supported hike, cut or hold bias');
 if(state==='hold')result.cautions.push('Hold is a conditional research baseline supported by policy context, not a commitment by the bank.');
 result.guidanceDirection=bias;
 return result;
}
export function pairOutlook(pair,banks,snapshotDate,now=Date.now()){
 const a=banks[pair.base],b=banks[pair.quote],gap=round(pair.baseRate-pair.quoteRate);
 // A descriptive comparison of economic scores, never a forecast or probability.
 const baseScore=Number.isFinite(a?.score)?a.score:null,quoteScore=Number.isFinite(b?.score)?b.score:null;
 const macroComparison={baseScore,quoteScore,scoreDifference:baseScore!==null&&quoteScore!==null?baseScore-quoteScore:null,forecast:false};
 const common={base:pair.base,quote:pair.quote,signedGap:gap,higher:gap>0?pair.base:gap<0?pair.quote:'Equal',horizonDays:90,macroComparison};
 const answer=(state,reason,direction=0,reasonCode='unclassified')=>({...common,state,label:({widening:'Widening bias',narrowing:'Narrowing bias',unchanged:'Broadly unchanged bias',unclear:'Uncertain',unavailable:'Insufficient current evidence'})[state],reason,reasonCode,direction,tone:direction>0?'positive':direction<0?'negative':'neutral',signedDirection:direction>0?`Towards ${pair.base}`:direction<0?`Towards ${pair.quote}`:'No supported direction',crossingRisk:state==='narrowing',unchangedPossible:true});
 if(!Number.isFinite(pair.baseRate)||!Number.isFinite(pair.quoteRate))return answer('unavailable','One or both policy-rate benchmarks are not valid finite numbers.',0,'invalid_benchmark');
 if(!validAge(snapshotDate,45,now))return answer('unavailable','The published central-bank policy-rate snapshot is missing or older than 45 days.',0,'stale_benchmark_snapshot');
 const missing=[pair.base,pair.quote].filter(c=>!banks[c]||banks[c].state==='unavailable');
 if(missing.length)return answer('unavailable',`Required economic inputs are missing or invalid for ${missing.join(' and ')}; a policy-rate gap is still available separately.`,0,'missing_macro_evidence');
 const unresolved=[pair.base,pair.quote].filter(c=>!['hike_hold','cut_hold','hold'].includes(banks[c].state));
 if(unresolved.length){
  const reviewDue=unresolved.filter(c=>banks[c].reasonCode==='policy_review_due');
  return answer('unclear',reviewDue.length?`A source-bound policy assessment needs renewed review for ${reviewDue.join(' and ')}. Current economic data is validated, but its score alone cannot forecast the bank's next move.`:`The evidence for ${unresolved.join(' and ')} does not establish a supported future policy direction.`,0,reviewDue.length?'policy_review_due':'unresolved_policy_direction');
 }
 if(a.state==='hold'&&b.state==='hold')return answer('unchanged','Both banks have a supported conditional hold baseline; new evidence may change it.',0,'both_hold');
 if(a.state===b.state)return answer('unclear','Both banks have the same directional bias. Without the timing and size of their moves, relative divergence is unresolved.',0,'matching_policy_bias');
 const rank={hike_hold:1,hold:0,cut_hold:-1};
 const direction=Math.sign(rank[a.state]-rank[b.state]);
 const state=gap===0||direction*Math.sign(gap)>0?'widening':'narrowing';
 return answer(state,`${gap===0?'Benchmarks are currently equal.':common.higher+' currently has the higher policy rate.'} Relative policy biases support ${state}. An unchanged gap remains possible because either bank may hold.${state==='narrowing'?' Move sizes are not estimated: the rates could cross, reversing which currency is higher.':''}`,direction,'reviewed_relative_policy_bias');
}
