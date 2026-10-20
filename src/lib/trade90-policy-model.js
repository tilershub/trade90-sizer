// Transparent experimental heuristic. Scores are evidence flags, NOT rate estimates.
export const MODEL_VERSION='1.0.0';
const DAY=86400000;
const time=v=>Date.parse(v);
const age=(v,now)=>(now-time(v))/DAY;
const label={tightening:'Tightening lean',easing:'Easing lean',hold:'Hold lean',mixed:'Mixed evidence',unavailable:'Insufficient evidence'};
export function usableSeries(s,now){
 if(!s||s.status!=='ok'||!Number.isFinite(time(s.retrievedAt))||age(s.retrievedAt,now)>7||age(s.retrievedAt,now)<-1)return false;
 const p=s.points; if(!Array.isArray(p)||p.length<4)return false;
 const last=p.at(-1); const limit=s.frequency==='Quarterly'?240:120;
 return Number.isFinite(last.value)&&Number.isFinite(time(last.date))&&age(last.date,now)>=0&&age(last.periodEnd||last.date,now)<=limit;
}
function observation(s,months){
 const last=s.points.at(-1),d=new Date(last.date+'T00:00:00Z');d.setUTCMonth(d.getUTCMonth()-months);
 return s.points.find(p=>p.date===d.toISOString().slice(0,10));
}
export function bankOutlook(currency,data,guidance,now=Date.now()){
 const country=data?.countries?.[currency],series=country?.series||{};
 const reasons=[],drivers=[];
 for(const key of ['inflation','unemployment','gdp'])if(!usableSeries(series[key],now))reasons.push(`${key}: missing, stale or refresh failed`);
 if(currency==='EUR'&&['inflation','unemployment','gdp'].some(k=>series[k]?.geography!=='EA21'))reasons.push('Euro-area geographic coverage is not aligned');
 const g=guidance?.[currency];
 if(!g||!Number.isFinite(time(g.publishedDate))||age(g.publishedDate,now)>90||age(g.publishedDate,now)<0||age(g.reviewedAt,now)>14||!Number.isFinite(time(g.reviewedAt)))reasons.push('Official guidance needs a current review');
 if(g?.latestDecisionDate && g.latestDecisionDate>g.publishedDate)reasons.push('A newer policy decision supersedes this guidance review');
 if(reasons.length)return {currency,state:'unavailable',label:label.unavailable,reasons,drivers,guidance:g||null};
 const inf=series.inflation, jobs=series.unemployment, growth=series.gdp;
 const ip=observation(inf,inf.frequency==='Quarterly'?6:3),up=observation(jobs,jobs.frequency==='Quarterly'?6:3),gp=observation(growth,3);
 if(!ip||!up||!gp)return {currency,state:'unavailable',label:label.unavailable,reasons:['Comparable prior periods are missing'],drivers,guidance:g};
 const i=inf.points.at(-1),u=jobs.points.at(-1),v=growth.points.at(-1);
 // Trend, not a universal CPI target: USD's target is PCE, and mandates differ.
 const inflation=i.value-ip.value>=0.3?1:i.value-ip.value<=-0.3?-1:0;
 const labour=u.value-up.value<=-0.2?1:u.value-up.value>=0.2?-1:0;
 const output=v.value<0&&gp.value<0?-1:v.value>=0.5&&gp.value>=0.5?1:0;
 const policy=['tightening','easing','neutral'].includes(g.lean)?({tightening:1,easing:-1,neutral:0}[g.lean]):null;
 if(policy===null)return {currency,state:'unavailable',label:label.unavailable,reasons:['Guidance classification is unavailable'],drivers,guidance:g};
 const add=(metric,text,signal,s,p,prior)=>drivers.push({metric,text,signal,latest:p,previous:prior,source:s.sourceUrl,retrievedAt:s.retrievedAt});
 add('Inflation',inflation>0?'Headline inflation accelerating':inflation<0?'Headline inflation cooling':'Headline inflation broadly steady',inflation,inf,i,ip);
 add('Employment',labour>0?'Unemployment declining':labour<0?'Unemployment rising':'Unemployment broadly steady',labour,jobs,u,up);
 add('Growth',output>0?'Two quarters of firm growth':output<0?'Two quarters of contraction':'Growth gives no strong directional signal',output,growth,v,gp);
 const score=inflation*2+labour+output+policy*2;
 const positive=drivers.filter(d=>d.signal>0).length+(policy>0?1:0);
 const negative=drivers.filter(d=>d.signal<0).length+(policy<0?1:0);
 let state='mixed';
 if(score>=3&&positive>=2&&negative===0)state='tightening';
 else if(score<=-3&&negative>=2&&positive===0)state='easing';
 else if(positive===0&&negative===0)state='hold';
 return {currency,state,label:label[state],score,reasons:state==='mixed'?['Economic and policy evidence does not give a consistent direction']:[],drivers,guidance:g,evidenceStrength:state==='mixed'?'Mixed':'Moderate',limitations:['Headline CPI only; no core inflation, wages, forecasts or market pricing in v1']};
}
export function pairOutlook(pair,banks,snapshotDate,now=Date.now()){
 const base=banks[pair.base],quote=banks[pair.quote];const gap=pair.baseRate-pair.quoteRate;
 const common={base:pair.base,quote:pair.quote,higher:gap>0?pair.base:gap<0?pair.quote:'Equal',horizonDays:90};
 const answer=(state,reason)=>({...common,state,label:({widening:'Widening lean',narrowing:'Narrowing lean',unchanged:'Broadly unchanged',unclear:'Direction unclear',unavailable:'Insufficient evidence'})[state],reason});
 if(!Number.isFinite(gap)||!Number.isFinite(time(snapshotDate))||age(snapshotDate,now)>45||[base,quote].some(b=>!b||b.state==='unavailable'))return answer('unavailable','Fresh macro data, reviewed guidance and a recent policy-rate snapshot are required for both currencies.');
 if([base,quote].some(b=>b.state==='mixed'))return answer('unclear','The economic and policy evidence is mixed for at least one bank.');
 if(base.state==='hold'&&quote.state==='hold')return answer('unchanged','Both banks show a hold lean under the current rules.');
 if(base.state===quote.state)return answer('unclear','Both banks lean in the same direction; the relative size of their moves is unknown.');
 const direction={tightening:1,hold:0,easing:-1};const delta=direction[base.state]-direction[quote.state];
 if(gap===0)return answer('widening','Benchmarks are equal and the two bank outlooks differ.');
 const widen=delta*Math.sign(gap)>0;
 if(!widen&&Math.abs(gap)<1)return answer('unclear','The gap is small enough that a reversal could change which currency has the higher rate; v1 does not estimate move sizes.');
 return answer(widen?'widening':'narrowing',`${common.higher} currently has the higher benchmark. The two bank leans suggest ${widen?'greater':'less'} separation, conditional on the evidence persisting.`);
}
