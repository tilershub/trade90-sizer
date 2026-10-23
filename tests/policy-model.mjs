import assert from 'node:assert/strict';
import {MODEL_VERSION,bankOutlook,pairOutlook,changeSignal,usableSeries,observationPeriodEnd} from '../src/lib/trade90-policy-model.js';
const now=Date.parse('2026-10-20T00:00:00Z');
assert.equal(MODEL_VERSION,'2.0.1','Versioned model history must reflect quarterly freshness change');
assert.equal(changeSignal(3.3,3,.3),1);
assert.equal(changeSignal(6.4,6.6,.2),-1);
assert.equal(changeSignal(5.6,5.4,.2),1);
assert.equal(changeSignal(3.299,3,.3),0);
assert.equal(changeSignal(NaN,3,.3),null);
const pair={base:'AUD',quote:'CHF',baseRate:4,quoteRate:1};
const test=(a,b,p=pair,date='2026-10-19')=>pairOutlook(p,{AUD:{state:a},CHF:{state:b}},date,now);
for(const [a,b,rates,state,tone] of [
 ['hike_hold','hold',[4,1],'widening','positive'],
 ['cut_hold','hold',[4,1],'narrowing','negative'],
 ['hold','hike_hold',[1,4],'widening','negative'],
 ['hike_hold','hold',[1,4],'narrowing','positive'],
 ['hold','cut_hold',[4,1],'widening','positive'],
 ['hold','cut_hold',[1,4],'narrowing','positive']
]){
 const p={...pair,baseRate:rates[0],quoteRate:rates[1]},r=test(a,b,p);
 assert.equal(r.state,state);assert.equal(r.tone,tone);
 const reversed=pairOutlook({...p,base:'CHF',quote:'AUD',baseRate:rates[1],quoteRate:rates[0]},{AUD:{state:a},CHF:{state:b}},'2026-10-19',now);
 assert.equal(reversed.state,r.state);assert.equal(reversed.direction,-r.direction);
}
assert.equal(test('hold','hold').state,'unchanged');
assert.equal(test('hike_hold','hike_hold').state,'unclear');
assert.equal(test('cut_hold','cut_hold').state,'unclear');
assert.equal(test('uncertain','hold').state,'unclear');
assert.equal(test('unavailable','hold').state,'unavailable');
assert.equal(test('hike_hold','hold',pair,'2026-10-21').state,'unavailable');
assert.equal(test('hike_hold','hold',{...pair,baseRate:NaN}).state,'unavailable');
assert.equal(test('hike_hold','hold',{...pair,baseRate:1}).state,'widening');
assert.equal(test('cut_hold','hold',{...pair,baseRate:1.25}).crossingRisk,true);
const monthly=values=>({frequency:'Monthly',status:'ok',retrievedAt:'2026-10-19',sourceUrl:'https://example.com',sourceTitle:'Fixture CPI',points:values.map((value,i)=>({date:`2026-0${i+6}-01`,value}))});
const gdp={frequency:'Quarterly',status:'ok',retrievedAt:'2026-10-19',sourceUrl:'https://example.com',points:[{date:'2025-07-01',value:.1},{date:'2025-10-01',value:.1},{date:'2026-01-01',value:.1},{date:'2026-04-01',value:.1}]};
const country=(headline,core,unemployment,bias='neutral')=>{
 const data={countries:{CHF:{series:{inflation:monthly(headline),unemployment:monthly(unemployment),gdp}}}};
 const extra={countries:{CHF:{series:{coreInflation:monthly(core)}}}};
 const guidance={CHF:{publishedDate:'2026-09-01',source:'https://example.com/decision',assessment:{publishedDate:'2026-09-01',source:'https://example.com/decision',reviewedAt:'2026-10-19',bias}}};
 return {data,extra,guidance};
};
const run=x=>bankOutlook('CHF',x.data,x.guidance,now,x.extra);
const low=country([.4,.6,.8,1],[.5,.5,.6,.6],[5,5,5,5]);
assert.equal(run(low).state,'uncertain','No inflation-target pressure is not a hold forecast');
assert.equal(run(low).economicPressure,'Balanced or conflicting pressure','Low inflation rising does not mean tightening');
low.guidance.CHF.assessment.bias='hold_context';assert.equal(run(low).state,'hold');
const hike=country([3,3.1,3.2,3.3],[2.6,2.7,2.8,2.9],[5,5.1,5.1,5.2],'tightening');
assert.equal(run(hike).state,'hike_hold','Mild labour offset must be visible without blanket veto');
assert.ok(run(hike).cautions.some(s=>s.includes('unemployment offsets')));
hike.data.countries.CHF.series.unemployment=monthly([5,5.2,5.4,5.5]);assert.equal(run(hike).state,'uncertain','Severe labour weakness blocks hike bias');
const cut=country([-.1,-.2,-.3,-.5],[.5,.4,.3,.2],[5,5.1,5.2,5.3]);assert.equal(run(cut).state,'cut_hold');
const stale=structuredClone(low);stale.extra.countries.CHF.series.coreInflation.status='refresh_failed';assert.equal(run(stale).state,'unavailable');
const future=structuredClone(low);future.guidance.CHF.assessment.reviewedAt='2026-10-21';assert.equal(run(future).state,'unavailable');
const mismatch=structuredClone(low);mismatch.guidance.CHF.source='https://example.com/new';assert.equal(run(mismatch).state,'unavailable');
const superseded=structuredClone(low);superseded.guidance.CHF.latestDecisionDate='2026-09-20';assert.equal(run(superseded).state,'unavailable');
const bad=monthly([1,2,3,4]);bad.points[1].value=NaN;assert.equal(usableSeries(bad,now),false);
const dup=monthly([1,2,3,4]);dup.points[1].date=dup.points[0].date;assert.equal(usableSeries(dup,now),false);
const usd=bankOutlook('USD',{countries:{USD:low.data.countries.CHF}},{},now,{});assert.equal(usd.state,'unavailable','US cannot substitute CPI for missing PCE');
const quarter={frequency:'Quarterly',status:'ok',retrievedAt:'2026-10-19',points:[{date:'2025-07-01',value:1},{date:'2025-10-01',value:1},{date:'2026-01-01',value:1},{date:'2026-04-01',value:1}]};
assert.equal(observationPeriodEnd(quarter,quarter.points.at(-1)),'2026-06-30');
assert.equal(usableSeries(quarter,now),true,'Completed Q2 data remains current in October when checked by period end');
quarter.retrievedAt='2027-02-01';
assert.equal(usableSeries(quarter,Date.parse('2027-02-01T00:00:00Z')),false,'Quarterly data expires after period end');
assert.equal(observationPeriodEnd({frequency:'Quarterly'},{date:'2026-01-01',periodEnd:'2026-03-31'}),'2026-03-31');
assert.equal(observationPeriodEnd({frequency:'Quarterly'},{date:'2026-05-15',value:1}),'2026-05-15','Nonstandard quarterly dates should not artificially extend evidence life');
console.log('Policy v2: thresholds, four colours, reversal, uncertainty, policy context and input validation passed');
