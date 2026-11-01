import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('src/data/trade90-yield-curves.json','utf8'));
const codes=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
assert.ok([1,2].includes(data.schemaVersion));
assert.ok(typeof data.asOf==='string'||data.asOf===null);
const health=data.health||{};
if(data.schemaVersion===2)assert.deepEqual(Object.keys(health).sort(),codes.slice().sort(),'Every currency must be checked and reported');
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
for(const code of codes){
 const x=data.currencies?.[code],h=health[code];
 if(h)assert.ok(['current','stale_or_source_failed','unavailable'].includes(h.status),code);
 if(!x)continue;
 assert.ok(isDate(x.asOf),code+' observation date');
 assert.ok(x.source?.startsWith('https://'),code+' source');
 for(const k of ['2Y','10Y'])assert.ok(Number.isFinite(x.yields[k])&&x.yields[k]>-10&&x.yields[k]<35,code+' '+k);
 if(x.verified)assert.notEqual(h?.status,'stale_or_source_failed','Never mark stale data verified');
 if(x.history){
  let previous='';
  for(const record of x.history){
   assert.ok(isDate(record.date)&&record.date>previous,code+' history order');
   for(const k of ['2Y','10Y'])assert.ok(Number.isFinite(record[k])&&record[k]>-10&&record[k]<35,code+' '+k);
   previous=record.date;
  }
  assert.equal(x.history.at(-1).date,x.asOf,code+' latest history consistent');
 }
}
if(data.schemaVersion===2){
 assert.equal(data.coverage.total,8);
 assert.equal(data.coverage.current+data.coverage.stale+data.coverage.unavailable,8);
 assert.ok(existsSync('public/data/yield-curve-status.json'));
 const report=JSON.parse(readFileSync('public/data/yield-curve-status.json','utf8'));
 assert.equal(report.coverage.current,data.coverage.current);
}
console.log('Yield-curve publication audit passed: strict dates, 2Y/10Y normalization, per-currency health and no fabricated gaps');