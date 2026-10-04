import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalConditions,contextFresh,evidenceNotes,safeSource,nextCatalyst,marketResearchBrief,researchContextChanges,researchTrustSummary,indicatorTrust,communicationRelevant} from '../src/lib/market-research.js';
import {onRequestGet} from '../functions/api/research-context.js';
test('null and zero prices never become technical data',()=>{
 assert.equal(technicalConditions({history:Array(30).fill({close:null})}).volatility,null);
 assert.equal(technicalConditions({history:Array(30).fill({close:0})}).volatility,null);
});
test('crypto annualization uses its own calendar',()=>{
 const history=Array.from({length:50},(_,i)=>({date:`2026-01-${i+1}`,close:100+i+(i%2),ema_fast:125,ema_slow:120}));
 const fx=technicalConditions({symbol:'USD/JPY',history}), btc=technicalConditions({symbol:'BTC/USD',history});
 assert.ok(Math.abs(btc.volatility/fx.volatility-Math.sqrt(365/252))<1e-9);
 assert.equal(fx.trend,'EMA 20 above EMA 50');
 assert.equal(fx.averageMove,1);
});
test('stale macro data does not generate a current-condition summary',()=>{
 const context={generated_at:'2026-01-01',indicators:[{country:'Global',id:'VIXCLS',label:'VIX',status:'available',value:20,change:2}]};
 assert.equal(contextFresh(context,Date.parse('2026-09-13')),false);
 assert.match(evidenceNotes(context,'USD/JPY',Date.parse('2026-09-13'))[0],/unavailable/);
 assert.equal(safeSource('javascript:alert(1)'),null);
});
test('macro API fails visibly on malformed payload',async()=>{
 const old=global.fetch;
 try { global.fetch=async()=>new Response(JSON.stringify({schema_version:1,indicators:[]})); const r=await onRequestGet(); assert.equal(r.status,502); assert.equal(r.headers.get('cache-control'),'no-store'); }
 finally {global.fetch=old;}
});


test('catalyst mode selects the next relevant market event',()=>{
 const now=Date.parse('2026-10-04T10:00:00Z');
 const context={events:[
  {currency:'EUR',event:'CPI',time:'2026-10-04T11:00:00Z',forecast:2.4,previous:2.3},
  {currency:'JPY',event:'Tankan',time:'2026-10-04T10:30:00Z'},
  {currency:'USD',event:'Payrolls',time:'2026-10-04T12:00:00Z'}
 ]};
 const catalyst=nextCatalyst(context,'EUR/USD',now);
 assert.equal(catalyst.status,'upcoming');
 assert.equal(catalyst.event.event,'CPI');
 assert.equal(catalyst.msUntil,3600000);
});

test('research brief explains evidence limits without inventing a directional score',()=>{
 const history=Array.from({length:60},(_,i)=>({
   date:new Date(Date.UTC(2026,0,i+1)).toISOString(),
   close:100+i,
   ema_fast:120+i,
   ema_slow:110+i
 }));
 const pair={symbol:'EUR/USD',base:'EUR',quote:'USD',history,live:{change_pct:0.002}};
 const context={
   generated_at:'2026-10-04T09:00:00Z',
   indicators:[{id:'VIXCLS',country:'Global',label:'VIX',status:'available',value:18,change:-1}],
   positioning:[],
   events:[],
   policy_expectations:{}
 };
 const brief=marketResearchBrief(context,pair,Date.parse('2026-10-04T10:00:00Z'));
 assert.equal(brief.structure,'EMA 20 above EMA 50');
 assert.ok(brief.supporting.length>0);
 assert.ok(brief.missing.some(item=>item.includes('second-economy')));
 assert.equal('score' in brief,false);
 assert.equal('probability' in brief,false);
});

test('research-context change detection captures new observations and communications',()=>{
 const previous={
   generated_at:'2026-10-03T08:00:00Z',
   indicators:[{id:'VIXCLS',country:'Global',label:'VIX',status:'available',value:18,observed_at:'2026-10-02T00:00:00Z'}],
   communications:[{currency:'USD',source:'Federal Reserve',headline:'FOMC monetary policy statement',published_at:'2026-10-03T06:00:00Z'}],
   positioning:[]
 };
 const current={
   generated_at:'2026-10-04T08:00:00Z',
   indicators:[{id:'VIXCLS',country:'Global',label:'VIX',status:'available',value:20,observed_at:'2026-10-03T00:00:00Z'}],
   communications:[{currency:'USD',source:'Federal Reserve',headline:'FOMC monetary policy statement and interest rate decision',published_at:'2026-10-04T06:00:00Z'}],
   positioning:[]
 };
 const changes=researchContextChanges(previous,current,'EUR/USD',Date.parse('2026-10-04T09:00:00Z'));
 assert.ok(changes.some(item=>item.includes('New VIX observation')));
 assert.ok(changes.some(item=>item.includes('New Federal Reserve communication')));
});


test('data trust separates live, delayed and derived evidence without claiming certainty',()=>{
 const now=Date.parse('2026-10-04T10:00:00Z');
 const history=Array.from({length:30},(_,i)=>({
   date:new Date(Date.UTC(2026,8,i+1)).toISOString(),
   close:100+i,
   ema_fast:120+i,
   ema_slow:110+i
 }));
 const pair={
   symbol:'EUR/USD',base:'EUR',quote:'USD',history,
   live:{price:1.1,updated_at:'2026-10-04T09:55:00Z',provider:'Test feed'}
 };
 const context={
   generated_at:'2026-10-04T09:30:00Z',
   indicators:[{
     id:'CPI',country:'US',status:'available',value:3.1,frequency:'Monthly',
     publisher:'BLS',observed_at:'2026-09-01T00:00:00Z',age_days:33,max_age_days:75
   }],
   positioning:[{currency:'EUR',available:true,date:'2026-09-29T00:00:00Z',stale:false}],
   events:[]
 };
 const trust=researchTrustSummary(context,pair,now);
 assert.equal(trust.items.find(x=>x.key==='price').status,'LIVE');
 assert.equal(trust.items.find(x=>x.key==='macro').status,'CURRENT');
 assert.equal(trust.items.find(x=>x.key==='positioning').status,'DELAYED');
 assert.equal(trust.items.find(x=>x.key==='technical').status,'DERIVED');
 assert.equal(trust.items.find(x=>x.key==='calendar').status,'UNAVAILABLE');
 assert.equal(indicatorTrust({...context.indicators[0],observed_at:'2026-06-01T00:00:00Z'},now).status,'STALE');
});

test('administrative central-bank headlines do not trigger Research Delta',()=>{
 assert.equal(communicationRelevant({headline:'Federal Reserve Board announces approval of application by Example Corporation'}),false);
 assert.equal(communicationRelevant({headline:'FOMC monetary policy statement and interest rate decision'}),true);
 const previous={generated_at:'2026-10-03T08:00:00Z',indicators:[],positioning:[],communications:[]};
 const current={
   generated_at:'2026-10-04T08:00:00Z',
   indicators:[],positioning:[],
   communications:[{currency:'USD',source:'Federal Reserve',headline:'Federal Reserve Board issues enforcement action with Example Bank',published_at:'2026-10-04T06:00:00Z'}]
 };
 assert.deepEqual(researchContextChanges(previous,current,'EUR/USD',Date.parse('2026-10-04T09:00:00Z')),[]);
});
