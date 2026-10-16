import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPairs, PAIR_SYMBOLS } from "../src/lib/trade90-rates.js";
import { outlookAsOf, outlookReports, repricingReports } from "../src/data/trade90-policy-outlook.js";
import { policyUpdates, validatePolicyUpdates, policyUpdateRelatedPairs, policyCollectionAsOf, getPairPolicyUpdates } from "../src/data/trade90-policy-updates.js";
import { getNextPolicyDecisions, validatePolicyDecisionCalendar, officialPolicyDecisionCalendar, decisionCalendarReviewedAt } from "../src/data/trade90-decision-calendar.js";
import { policyGuidance, getGuidanceForPair, guidanceCurrencies, validatePolicyGuidance, policyGuidanceReviewedAt } from "../src/data/trade90-policy-guidance.js";
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


const policyAudit=validatePolicyUpdates();
assert.equal(policyAudit.valid,true,policyAudit.reason);
assert.equal(policyAudit.bankCount,8);
assert.equal(policyUpdates.length,12);
assert.equal(policyCollectionAsOf,"2026-10-15");
assert.equal(new Set(policyUpdates.filter(e=>e.type==="Rate decision").map(e=>e.currency)).size,8);
assert.equal(policyUpdates[0].id,"fed-fomc-minutes-2026-10-07");
assert.equal(policyUpdateRelatedPairs("USD").length,7);
for(const item of policyUpdates){
 assert.ok(item.source.startsWith("https://"));
 assert.ok(item.publishedDate <= policyCollectionAsOf);
 assert.equal(policyUpdateRelatedPairs(item.currency).length,7);
 if(item.type !== "Rate decision")assert.equal(item.observedRatePct,undefined,"non-decision sources must not change the actual benchmark");
}
assert.equal(validatePolicyUpdates([...policyUpdates,policyUpdates[0]]).valid,false,"block duplicate policy news");
const forged=policyUpdates.map(e=>({...e}));
forged[0].source="https://untrusted-example.com/fake-policy";
assert.equal(validatePolicyUpdates(forged).valid,false,"block unsupported news sources");
// Each selected FX pair must receive exactly its two banks' official publications.
for(const pair of pairs) {
 const records=getPairPolicyUpdates(pair);
 assert.ok(records.length>=2,"Both banks should have a verified rate decision for "+pair.symbol);
 assert.ok(records.every(entry=>entry.currency===pair.base || entry.currency===pair.quote),"Unrelated central bank leaked into "+pair.symbol);
 assert.deepEqual(records.map(entry=>entry.id),getPairPolicyUpdates(pair.symbol).map(entry=>entry.id),"Object and symbol forms should match");
 assert.deepEqual(records.map(entry=>entry.id),getPairPolicyUpdates(pair.label).map(entry=>entry.id),"Slash pair symbol should match");
 assert.ok(records.every((entry,index)=>index===0 || records[index-1].publishedDate>=entry.publishedDate),"Updates must be newest first");
 assert.equal(new Set(records.filter(entry=>entry.type==="Rate decision").map(entry=>entry.currency)).size,2);
}
assert.equal(getPairPolicyUpdates("EURUSD").length,4,"EUR/USD should show only Fed and ECB publications");
assert.deepEqual(new Set(getPairPolicyUpdates("EURUSD").map(e=>e.currency)),new Set(["EUR","USD"]));
assert.equal(getPairPolicyUpdates("USDJPY").length,3,"USD/JPY should show only Fed and BoJ publications");
assert.equal(getPairPolicyUpdates("AUDCHF").length,2,"AUD/CHF should show only RBA and SNB publications");
assert.deepEqual(getPairPolicyUpdates("BTCUSD"),[],"Non-supported pairs cannot show unrelated updates");
assert.deepEqual(getPairPolicyUpdates(null),[],"Missing selection cannot show global updates");

console.log("Policy updates: "+policyUpdates.length+" official source records from eight banks validated.");


const decisionCalendarAudit = validatePolicyDecisionCalendar();
assert.equal(decisionCalendarAudit.valid,true,decisionCalendarAudit.reason);
assert.equal(decisionCalendarReviewedAt,"2026-10-15");
assert.equal(new Set(officialPolicyDecisionCalendar.map(r=>r.currency)).size,8);
for (const pair of pairs) {
 const two = getNextPolicyDecisions(pair,"2026-10-15");
 assert.equal(two.length,2,"Every pair must list exactly its two central bank decisions");
 assert.deepEqual(new Set(two.map(e=>e.currency)),new Set([pair.base,pair.quote]),"Unrelated decision was shown: "+pair.symbol);
 assert.ok(two.every(e=>e.date && e.date>="2026-10-15" && /^https:\/\//.test(e.source)),"All scheduled decisions have official source dates");
 assert.deepEqual(two.map(e=>e.currency),getNextPolicyDecisions(pair.symbol,"2026-10-15").map(e=>e.currency));
}
const eu=getNextPolicyDecisions("EURUSD","2026-10-15");
assert.deepEqual(eu.map(e=>e.currency),["USD","EUR"]);
assert.deepEqual(eu.map(e=>e.date),["2026-10-28","2026-10-29"]);
const uj=getNextPolicyDecisions("USDJPY","2026-10-15");
assert.deepEqual(uj.map(e=>e.currency),["USD","JPY"]);
assert.deepEqual(uj.map(e=>e.date),["2026-10-28","2026-10-30"]);
const ac=getNextPolicyDecisions("AUDCHF","2026-10-15");
assert.deepEqual(ac.map(e=>e.currency),["AUD","CHF"]);
assert.deepEqual(ac.map(e=>e.date),["2026-11-03","2026-12-10"]);
const zn=getNextPolicyDecisions("NZDCAD","2026-10-15");
assert.deepEqual(new Set(zn.map(e=>e.date)),new Set(["2026-10-28"]));
assert.deepEqual(getNextPolicyDecisions("EURUSD","2027-01-01").map(e=>e.date),[null,null],"Never show expired calendar items as upcoming");
assert.deepEqual(getNextPolicyDecisions("BTCUSD","2026-10-15"),[],"Unknown pairs must not show dates");
assert.equal(validatePolicyDecisionCalendar([...officialPolicyDecisionCalendar,officialPolicyDecisionCalendar[0]]).valid,false,"Reject duplicated policy meeting");
console.log("Official decision schedule: 8 banks, 28 pair views, dates and source links verified.");


const verifiedGuidance=validatePolicyGuidance();
assert.equal(verifiedGuidance.valid,true,verifiedGuidance.reason);
assert.equal(verifiedGuidance.count,8);
assert.equal(guidanceCurrencies.length,8);
assert.equal(policyGuidanceReviewedAt,"2026-10-16");
for(const pair of pairs){
  const guidance=getGuidanceForPair(pair);
  assert.equal(guidance.length,2,"Each pair gets two central-bank guidance statements");
  assert.deepEqual(guidance.map(e=>e.currency),[pair.base,pair.quote],"No unrelated outlook in "+pair.symbol);
  assert.deepEqual(getGuidanceForPair(pair.symbol).map(e=>e.currency),[pair.base,pair.quote]);
  for(const record of guidance){
    assert.ok(record.source.startsWith("https://"),"Official guidance must cite source");
    assert.ok(record.publishedDate<="2026-10-16","Must not show a future document as current guidance");
    assert.equal(record.notMarketPricing,true,"Policy remarks are not derivative-market pricing");
  }
}
assert.deepEqual(getGuidanceForPair("EURUSD").map(e=>e.short),["ECB","Fed"]);
assert.deepEqual(getGuidanceForPair("AUDCHF").map(e=>e.short),["RBA","SNB"]);
assert.deepEqual(getGuidanceForPair("USDAUD").map(e=>e.short),["Fed","RBA"]);
assert.deepEqual(getGuidanceForPair("USDUSD"),[],"Same-currency pairs unsupported");
assert.deepEqual(getGuidanceForPair(null),[],"No pair must not leak all-bank records");
const biggestSix = [...pairs].sort((a,b)=>b.absBp-a.absBp||a.symbol.localeCompare(b.symbol)).slice(0,6);
assert.equal(biggestSix.length,6);
assert.ok(biggestSix.every((p,i)=>i===0||biggestSix[i-1].absBp>=p.absBp),"Homepage gap ranking is deterministic");
console.log("Outlook and featured divergences: 8 official sourced banks and 28 pair filters verified.");

console.log("Trade90 V2: 8 verified-source records, 28 pairs, formulas, ranking, source metadata and 7-pair impact checks passed.");
