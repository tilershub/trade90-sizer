// CI gate: the public forward files must be honest and schema-valid.
import { readFileSync } from "node:fs";
import { validateForwardSnapshot } from "../src/lib/trade90-forward-rates.js";
const latest=JSON.parse(readFileSync(new URL("../public/data/forward-rate-snapshot.json",import.meta.url),"utf8"));
const history=JSON.parse(readFileSync(new URL("../public/data/forward-rate-history.json",import.meta.url),"utf8"));
if(!Array.isArray(history))throw Error("Forward-history publication must be an array");
if(latest.status==="awaiting_licensed_data"){
 if(latest.license?.publicRedisplayAuthorized!==false || Object.keys(latest.rates||{}).length!==0)throw Error("Disconnected market feed contains misleading values");
 if(history.length!==0)throw Error("Disconnected feed must not contain prior invented snapshots");
 console.log("No forward license configured; values are withheld as required.");
}else{
 const v=validateForwardSnapshot(latest);
 if(!v.valid)throw Error("Invalid or stale public expected-rate values: "+v.reason);
 if(/synthetic|mock|example\.org/i.test(JSON.stringify(latest)))throw Error("Example data must never be published");
 for(const old of history){
  const check=validateForwardSnapshot(old,Date.parse(old.observedAt));
  if(!check.valid)throw Error("Invalid historical snapshot: "+check.reason);
  if(Date.parse(old.observedAt)>=Date.parse(latest.observedAt))throw Error("Historical snapshot is not older");
 }
 console.log("Verified "+Object.keys(latest.rates).length+" source-backed policy paths; history="+history.length);
}
