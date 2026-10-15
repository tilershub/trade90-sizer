import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPairs, PAIR_SYMBOLS } from "../src/lib/trade90-rates.js";
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
console.log("Trade90 V2: 8 verified-source records, 28 pairs, formulas, ranking, source metadata and 7-pair impact checks passed.");
