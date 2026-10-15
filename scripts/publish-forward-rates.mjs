#!/usr/bin/env node
// Controlled manual import after acquiring licensed market-implied policy paths.
// Usage: TRADE90_REDISPLAY_APPROVED=yes TRADE90_RATE_SOURCE_VERIFIED=yes
//        TRADE90_PROVIDER_LICENSE_REF='license-account-reference'
//        node scripts/publish-forward-rates.mjs /private/path/provider-normalized.json
//
// Does NOT call a provider, infer probabilities from statements, or fetch Reuters.
// Never put provider credentials in this repository or output.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateForwardSnapshot, HORIZONS, CURRENCIES } from "../src/lib/trade90-forward-rates.js";
const input=process.argv[2];
if (!input || process.argv.length!==3) throw Error("Usage: node scripts/publish-forward-rates.mjs <normalized-private-source-file>");
if (process.env.TRADE90_REDISPLAY_APPROVED!=="yes" || process.env.TRADE90_RATE_SOURCE_VERIFIED!=="yes") throw Error("Separate public redisplay and data verification approvals required");
const licenseReference=process.env.TRADE90_PROVIDER_LICENSE_REF;
if (!licenseReference || licenseReference.length<8) throw Error("Documented provider license reference is required");
const source=JSON.parse(readFileSync(resolve(input),"utf8"));
if (source.license?.reference !== licenseReference) throw Error("Input license reference does not match approved license");
if (/synthetic|example\.org|test.not.real|mock/i.test(JSON.stringify(source))) throw Error("Synthetic and example data may never be published");
const verdict=validateForwardSnapshot(source);
if(!verdict.valid) throw Error("Invalid forward dataset: "+verdict.reason);
const recordCount=Object.values(source.rates).reduce((sum,curves)=>sum+Object.keys(curves).length,0);
if(recordCount<1) throw Error("Nothing publishable");
const sanitized={
 schemaVersion:1,status:"verified",dataKind:"market_implied_policy_level",
 provider:source.provider, observedAt:source.observedAt,
 methodology:source.methodology,
 license:{publicRedisplayAuthorized:true,reference:licenseReference},
 rates:{}
};
for (const currency of CURRENCIES){
 if (!source.rates[currency]) continue;
 sanitized.rates[currency]={};
 for(const horizon of HORIZONS){
  const r=source.rates[currency][horizon];
  if(!r)continue;
  sanitized.rates[currency][horizon]={ratePct:r.ratePct,observedAt:r.observedAt,sourceUrl:r.sourceUrl,instrument:r.instrument};
 }
}
const pathCurrent=new URL("../public/data/forward-rate-snapshot.json",import.meta.url);
const pathHistory=new URL("../public/data/forward-rate-history.json",import.meta.url);
const existing=JSON.parse(readFileSync(pathCurrent,"utf8"));
const previous=JSON.parse(readFileSync(pathHistory,"utf8"));
if(!Array.isArray(previous))throw Error("Corrupt forward history: expected an array");
if(existing.status==="verified"){
 if(Date.parse(existing.observedAt)>=Date.parse(sanitized.observedAt))throw Error("Source timestamp must advance before publication");
 const validation=validateForwardSnapshot(existing,Date.parse(existing.observedAt));
 if(validation.valid && existing.provider===sanitized.provider && existing.methodology===sanitized.methodology){
  previous.push(existing);
 }
}
const unique=new Map(previous.filter(s=>s?.status==="verified").map(s=>[s.observedAt,s]));
const last60=[...unique.values()].sort((a,b)=>Date.parse(b.observedAt)-Date.parse(a.observedAt)).slice(0,60);
const safeJSON=x=>JSON.stringify(x,null,2)+"\n";
// Write history before latest: an interrupted publish does not falsely confirm a new latest.
writeFileSync(pathHistory,safeJSON(last60));
writeFileSync(pathCurrent,safeJSON(sanitized));
console.log(JSON.stringify({published:true,provider:sanitized.provider,asOf:sanitized.observedAt,observations:recordCount,historySnapshots:last60.length,coverage:HORIZONS.map(h=>({h,currencies:CURRENCIES.filter(c=>sanitized.rates[c]?.[h]).length}))},null,2));
