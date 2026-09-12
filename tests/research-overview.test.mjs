import assert from 'node:assert/strict';
import test from 'node:test';
import { researchOverview } from '../src/lib/research-overview.js';
const now = Date.parse('2026-09-11T15:00:00Z');
const stamp = new Date(now).toISOString();
const pair = {symbol:'XAU/USD', price_basis:'COMEX futures', sample_size:120, live:{price:4300,updated_at:stamp},model:{audit:[{name:'Trend',contribution:20},{name:'Rates',contribution:-25},{name:'Missing',contribution:null}]},validation:{horizons:[{Horizon:'5D','Model accuracy':.53,'Majority baseline':.58}]}};
test('mixed evidence exposes basis mismatch and underperforming baseline',()=>{
 const v=researchOverview(pair,stamp,null,now);
 assert.equal(v.condition,'Evidence is mixed');assert.equal(v.bullish.length,1);assert.equal(v.bearish.length,1);assert.equal(v.basisMismatch,true);assert.ok(v.lift<0);assert.ok(v.gaps.some(x=>x.includes('did not outperform')));assert.ok(v.gaps.some(x=>x.includes('calendar is clear')));
});
test('missing and stale observations do not imply reliable data',()=>{
 const v=researchOverview({},null,null,now);assert.equal(v.quoteFresh,false);assert.equal(v.modelFresh,false);assert.equal(v.lift,null);
 const old=researchOverview(pair,'2026-09-10T00:00:00Z',null,now);assert.equal(old.condition,'Research needs refreshing');
});
test('future and null quotes are not fresh',()=>{
 assert.equal(researchOverview({...pair,live:{price:null,updated_at:stamp}},stamp,null,now).quoteFresh,false);
 assert.equal(researchOverview({...pair,live:{price:4300,updated_at:'2026-09-12T15:00:00Z'}},stamp,null,now).quoteFresh,false);
});
test('comparison uses score points and detects scenario and regime changes',()=>{
 const v=researchOverview({...pair,score:5,bias:'Bullish',market:{regime:'High'}},stamp,{symbol:'XAU/USD',score:2,bias:'Bearish',market:{regime:'Low'}},now);
 assert.equal(v.changes.length,3);assert.match(v.changes[0],/3.0 points/);
 assert.equal(researchOverview(pair,stamp,{symbol:'EUR/USD',score:2},now).changes.length,0);
});
