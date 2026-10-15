import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPairs, PAIR_SYMBOLS } from "../src/lib/trade90-rates.js";
import { outlookAsOf, outlookReports, repricingReports } from "../src/data/trade90-policy-outlook.js";
import { getExpectedRows, getExpectedChanges, validateForwardSnapshot, classifyExpectedGap } from "../src/lib/trade90-forward-rates.js";
const snapshot=JSON.parse(readFileSync(new URL("../src/data/trade90-policy-snapshot.json",import.meta.url),"utf8"));
assert.equal(snapshot.banks.length,8);
assert.equal(new Set(snapshot.banks.map(b=>b.code)).size,8);
assert.match(snapshot.asOf,/^\d{4}-\d\d-\d\d$/);
for (const bank of snapshot.banks){
 assert.ok(Number.isFinite(bank.rate));
 assert.ok(/^https:\/\//.test(bank.source));
 assert.ok(Date.parse(bank.effectiveDate));
 assert.ok(Date.parse(bank.decisionDate));
}
const pairs=getPairs(snapshot.banks);
assert.equal(pairs.length,28);
assert.equal(PAIR_SYMBOLS.length,28);
assert.equal(new Set(pairs.map(p=>p.symbol)).size,28);
assert.equal(new Set(pairs.map(p=>[p.base,p.quote].sort().join("-"))).size,28);
for (let i=1;i<pairs.length;i++) assert.ok(pairs[i-1].absBp >= pairs[i].absBp,"sort descending");
for (const pair of pairs) {
 assert.equal(pair.absBp,Math.abs(pair.signedBp));
 assert.ok(Math.abs(pair.signedBp - Math.round((pair.baseRate-pair.quoteRate)*1000)/10)<0.00001,"correct basis point scaling");
 assert.equal(pair.higher,pair.signedBp===0?"Equal":(pair.signedBp>0?pair.base:pair.quote));
}
assert.equal(pairs[0].symbol,"AUDCHF");
assert.equal(pairs[0].absBp,460);
assert.equal(pairs.find(p=>p.symbol==="USDCHF").absBp,387.5);
assert.equal(pairs.find(p=>p.symbol==="EURUSD").signedBp,-137.5);
assert.equal(pairs[pairs.length-1].absBp,12.5);
const changed=snapshot.banks.map(bank=>({...bank,rate:bank.code==="AUD"?bank.rate+0.25:bank.rate}));
const updated=getPairs(changed);
let modified=0;
for(const prev of pairs){
 const next=updated.find(p=>p.symbol===prev.symbol);
 if(prev.absBp!==next.absBp || prev.signedBp!==next.signedBp) modified++;
}
assert.equal(modified,7,"changing one bank affects exactly seven currency pairs");
assert.equal(snapshot.forwardRatesAvailable,false,"do not mark forwards as available without licensed data");
assert.equal(outlookAsOf,"2026-10-15");
assert.equal(outlookReports.length,8);
assert.equal(new Set(outlookReports.map(r=>r.currency)).size,8);
for (const report of outlookReports) {
 assert.ok(/^https:\/\//.test(report.source));
 assert.ok(report.detail.length>45,"source commentary should explain data status");
 assert.ok(report.kind.length>7);
 if(report.value?.type==="hold_probability") {
  assert.ok(report.kind==="Reported market pricing");
  assert.ok(report.value.percent>=0 && report.value.percent<=100);
 }
 if(report.value?.type==="economist_forecast") assert.ok(report.kind.includes("Economist"),"economist survey != market pricing");
}
assert.equal(repricingReports.length,2);
assert.ok(repricingReports.every(report=>report.before&&report.after&&report.source.startsWith("https://")));

const awaiting = JSON.parse(readFileSync(new URL("../public/data/forward-rate-snapshot.json",import.meta.url),"utf8"));
const emptyHistory = JSON.parse(readFileSync(new URL("../public/data/forward-rate-history.json",import.meta.url),"utf8"));
assert.equal(awaiting.status,"awaiting_licensed_data","ship no unlicensed or synthetic numerical rate feed");
assert.equal(Object.keys(awaiting.rates).length,0);
assert.deepEqual(emptyHistory,[]);
assert.equal(validateForwardSnapshot(awaiting).valid,false);
const fixedNow = Date.parse("2026-10-15T12:00:00Z");
const asof = "2026-10-15T11:55:00Z";
const synthetic = {
 schemaVersion:1,status:"verified",dataKind:"market_implied_policy_level",
 provider:"SYNTHETIC TEST PROVIDER — NEVER PUBLISH",
 observedAt:asof,
 methodology:"Synthetic fixture for automated formula testing only, not genuine market expectations.",
 license:{publicRedisplayAuthorized:true,reference:"SYNTHETIC-TEST-NO-REAL-LICENSE"},
 rates:Object.fromEntries(snapshot.banks.map(bank=>[
  bank.code,
  Object.fromEntries(["3M","6M","12M"].map((h,i)=>[h,{
    ratePct:bank.rate+(i+1)*0.05+(bank.code==="USD"?0.1:0),
    observedAt:asof,sourceUrl:"https://example.org/test-not-real",instrument:"SYNTHETIC-TEST-POLICY-LEVEL"
  }]))
 ]))
};
const serialized=JSON.stringify(synthetic);
assert.equal(validateForwardSnapshot(synthetic,fixedNow).valid,true);
const result=getExpectedRows(synthetic,snapshot.banks,"3M",fixedNow);
assert.equal(result.availableCount,28);
assert.equal(result.rows.length,28);
assert.equal(result.rows.find(p=>p.symbol==="USDCHF").expectedSignedBp,397.5);
assert.equal(result.rows.find(p=>p.symbol==="USDCHF").changeVsCurrentBp,10);
assert.equal(classifyExpectedGap(100,120),"Widening");
assert.equal(classifyExpectedGap(-100,-70),"Narrowing");
assert.equal(classifyExpectedGap(100,-20),"Reversal");
assert.equal(classifyExpectedGap(0,0),"Unchanged");
const withoutLicense=JSON.parse(serialized);
withoutLicense.license.publicRedisplayAuthorized=false;
assert.equal(getExpectedRows(withoutLicense,snapshot.banks,"3M",fixedNow).availableCount,0);
const skewed=JSON.parse(serialized);
skewed.rates.USD["3M"].observedAt="2026-10-15T11:00:00Z";
assert.equal(validateForwardSnapshot(skewed,fixedNow).valid,false);
const staleNow=fixedNow+100*60*60*1000;
assert.equal(getExpectedRows(synthetic,snapshot.banks,"3M",staleNow).availableCount,0);
const partial=JSON.parse(serialized);
delete partial.rates.USD;
const partialResult=getExpectedRows(partial,snapshot.banks,"3M",fixedNow);
assert.equal(partialResult.availableCount,21,"seven USD related pair gaps withheld");
const prior=JSON.parse(serialized);
prior.observedAt="2026-10-14T11:55:00Z";
for (const horizons of Object.values(prior.rates)) for(const entry of Object.values(horizons)) entry.observedAt=prior.observedAt;
for (const entry of Object.values(prior.rates.USD)) entry.ratePct-=0.1;
const changedForward=getExpectedChanges(synthetic,[prior],snapshot.banks,"3M",24,fixedNow);
assert.equal(changedForward.available,true);
assert.equal(changedForward.rows.length,28);
assert.equal(changedForward.rows.filter(row=>Math.abs(row.revisionBp)>0.001).length,7,"USD forward repricing impacts seven pairs");
assert.equal(getExpectedChanges(synthetic,[],snapshot.banks,"3M",24,fixedNow).available,false);
assert.throws(()=>getExpectedRows(synthetic,snapshot.banks,"2M",fixedNow));
assert.throws(()=>getExpectedChanges(synthetic,[prior],snapshot.banks,"3M",12,fixedNow));

console.log("Trade90 V2: 8 verified-source records, 28 pairs, formulas, ranking, source metadata and 7-pair impact checks passed.");
