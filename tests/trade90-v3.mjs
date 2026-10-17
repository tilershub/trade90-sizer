import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {allTrade90Pairs,majors,crosses,pairSlug,pairFromSlug,pairUrl,pairInsight,rateSnapshot,currencyContext} from "../src/lib/trade90-v3.js";
import {PAIR_SYMBOLS} from "../src/lib/trade90-rates.js";
import {officialDecisionSources,getNextPolicyDecisions} from "../src/data/trade90-decision-calendar.js";
import {getPairPolicyUpdates} from "../src/data/trade90-policy-updates.js";
assert.equal(allTrade90Pairs.length,28);
assert.equal(majors.length,7);
assert.equal((await import("../src/lib/trade90-v3.js")).formatPercent(2.5),"2.50%");
assert.equal((await import("../src/lib/trade90-v3.js")).formatPercent(4.6),"4.60%");
assert.equal((await import("../src/lib/trade90-v3.js")).formatPercent(3.875),"3.875%");
assert.equal(crosses.length,21);
assert.equal(new Set(allTrade90Pairs.map(p=>pairSlug(p.symbol))).size,28);
for (const p of allTrade90Pairs){
  assert.equal(pairFromSlug(pairSlug(p.symbol)).symbol,p.symbol);
  assert.equal(pairFromSlug(p.symbol).symbol,p.symbol);
  assert.equal(pairUrl(p.symbol),"/pairs/"+pairSlug(p.symbol)+"/");
  assert.equal(pairInsight(p).summary.includes(p.label),true);
  assert.equal(pairInsight(p).developments.includes(p.base),true);
  assert.equal(pairInsight(p).developments.includes(p.quote),true);
  assert.ok(getPairPolicyUpdates(p).every(e=>e.currency===p.base||e.currency===p.quote));
  assert.equal(getNextPolicyDecisions(p,"2026-10-15").length,2);
}
assert.equal(Object.keys(currencyContext).length,8);
assert.equal(Object.keys(officialDecisionSources).length,8);
assert.equal(PAIR_SYMBOLS.length,28);
assert.equal(rateSnapshot.status,"verified_snapshot");
assert.equal(rateSnapshot.forwardRatesAvailable,false);
assert.ok(existsSync(new URL("../src/pages/pairs/[pair].astro",import.meta.url)));
assert.ok(existsSync(new URL("../src/pages/central-banks/[bank].astro",import.meta.url)));
for(const file of ["rate-gaps/index.astro","pairs/index.astro","decisions/index.astro"]){
 assert.ok(existsSync(new URL("../src/pages/"+file,import.meta.url)));
}
const layout=readFileSync(new URL("../src/layouts/Trade90V2Layout.astro",import.meta.url),"utf8");
assert.match(layout,/href="\/pairs\/"/);
assert.match(layout,/href="\/rate-gaps\/"/);
assert.match(layout,/href="\/decisions\/"/);
assert.match(layout,/trade90-appearance/);
const og=readFileSync(new URL("../public/og-v3.svg",import.meta.url),"utf8");
assert.match(og,/Central Bank Rate Divergence/);
assert.doesNotMatch(og,/Position Size Calculator/);
console.log("V3 architecture verified: 28 canonical pair URLs, 8 central bank hubs, source-specific pair updates and responsive navigation.");
