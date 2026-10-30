import fs from "node:fs";
const data=JSON.parse(fs.readFileSync("public/data/policy-outlook.json","utf8"));
const summary={generatedAt:data.generatedAt,modelVersion:data.modelVersion,banks:{},pairs:{},unavailablePairs:[]};
for(const [code,bank] of Object.entries(data.banks||{})){summary.banks[code]={state:bank.state,expiresAt:bank.expiresAt,unusableInputs:(bank.coverage||[]).filter(c=>!c.usable).map(c=>c.key),reasons:bank.reasons||[]};}
for(const [symbol,pair] of Object.entries(data.pairs||{})){summary.pairs[pair.state]=(summary.pairs[pair.state]||0)+1;if(pair.state==="unavailable")summary.unavailablePairs.push({symbol,baseBank:summary.banks[pair.base],quoteBank:summary.banks[pair.quote]});}
console.log(JSON.stringify(summary,null,2));
if(summary.unavailablePairs.length){console.warn(`WARNING: ${summary.unavailablePairs.length}/28 pair assessments unavailable. Review source-linked central-bank statements and dated assessments; never advance reviewedAt without review.`);}
