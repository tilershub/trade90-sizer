import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalConditions,contextFresh,evidenceNotes,safeSource} from '../src/lib/market-research.js';
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
