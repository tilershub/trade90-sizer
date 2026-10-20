import fs from 'node:fs';
import crypto from 'node:crypto';
import {MODEL_VERSION,bankOutlook,pairOutlook} from '../src/lib/trade90-policy-model.js';
import {policyGuidance,policyGuidanceReviewedAt} from '../src/data/trade90-policy-guidance.js';
import {allTrade90Pairs} from '../src/lib/trade90-v3.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const macro=read('public/data/macro-history.json');
const snapshot=read('src/data/trade90-policy-snapshot.json');
// Explicit annotations of the existing source-linked editorial guidance, not keyword guesses.
// Neutral means no explicit forward commitment; it is not a promise of holding.
const leans={AUD:'tightening',NZD:'tightening',JPY:'tightening',USD:'neutral',EUR:'neutral',GBP:'neutral',CAD:'neutral',CHF:'neutral'};
const guidance=Object.fromEntries(Object.entries(policyGuidance).map(([c,g])=>[c,{...g,lean:leans[c],reviewedAt:policyGuidanceReviewedAt,latestDecisionDate:snapshot.banks.find(b=>b.code===c)?.decisionDate}]));
const now=Date.now(),generatedAt=new Date(now).toISOString();
const banks=Object.fromEntries(Object.keys(macro.countries).map(c=>[c,bankOutlook(c,macro,guidance,now)]));
const pairs=Object.fromEntries(allTrade90Pairs.map(p=>[p.symbol,pairOutlook(p,banks,snapshot.asOf,now)]));
const fingerprint=crypto.createHash('sha256').update(JSON.stringify({version:MODEL_VERSION,macro,guidance,snapshot})).digest('hex');
const output={schemaVersion:1,modelVersion:MODEL_VERSION,experimental:true,generatedAt,inputFingerprint:fingerprint,horizonDays:90,banks,pairs};
fs.writeFileSync('public/data/policy-outlook.json',JSON.stringify(output,null,2)+'\n');
const path='public/data/policy-outlook-history.json';
const history=fs.existsSync(path)?read(path):{schemaVersion:1,records:[]};
const states=Object.fromEntries(Object.entries(pairs).map(([p,v])=>[p,v.state]));
const last=history.records.at(-1);
if(!last||last.inputFingerprint!==fingerprint||JSON.stringify(last.states)!==JSON.stringify(states)){
 history.records.push({generatedAt,modelVersion:MODEL_VERSION,inputFingerprint:fingerprint,states,rates:Object.fromEntries(snapshot.banks.map(b=>[b.code,b.rate])),evidence:banks});
 fs.writeFileSync(path,JSON.stringify(history,null,2)+'\n');
}
console.log('Policy model:',Object.values(pairs).reduce((a,p)=>(a[p.state]=(a[p.state]||0)+1,a),{}));
