import assert from "node:assert/strict";
import {officialDecisionLink,parseOfficialDecision,completeFedDecision,decisionSafety,updateSnapshot,appendRateHistory,runAutomaticRateCheck} from "../scripts/auto-policy-rates.mjs";
import seed from "../src/data/trade90-policy-snapshot.json" with {type:"json"};
// Test rates/dates must remain fixed when the production updater advances.
const fixture={AUD:[4.6,'2026-09-29'],USD:[3.875,'2026-09-16'],GBP:[3.75,'2026-09-17'],NZD:[2.75,'2026-09-02'],EUR:[2.5,'2026-09-10'],CAD:[2.25,'2026-09-02'],JPY:[1.25,'2026-09-18'],CHF:[0,'2026-09-24']};
const baseline={...seed,banks:seed.banks.map(b=>({...b,rate:fixture[b.code][0],decisionDate:fixture[b.code][1]}))};
const cases=[
 ["USD",{title:"Federal Reserve issues FOMC statement",url:"https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm"},"The Federal Reserve issues FOMC statement. The Committee decided to raise the target range for the federal funds rate by 1/4 percentage point to 4 to 4-1/4 percent.",4.125],
 ["EUR",{title:"Monetary policy decisions",url:"https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp261029~abc123.en.html"},"Monetary policy decisions. Key ECB interest rates. Accordingly, the interest rates on the deposit facility, the main refinancing operations and the marginal lending facility will be increased to 2.75%, 2.90% and 3.10% respectively, with effect from 4 November 2026.",2.75],
 ["GBP",{title:"Bank Rate increased to 4.00% - November 2026 Monetary Policy Summary and Minutes",url:"https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/november-2026"},"Monetary Policy Summary and minutes of the Monetary Policy Committee meeting on 5 November 2026. The Monetary Policy Committee voted to increase Bank Rate to 4.00%.",4],
 ["AUD",{title:"Statement by the Monetary Policy Board: Monetary Policy Decision",url:"https://www.rba.gov.au/media-releases/2026/mr-26-30.html"},"Statement by the Monetary Policy Board. Date 3 November 2026. At its meeting today the Board decided to increase the cash rate target by 25 basis points to 4.85 per cent, effective from 4 November 2026.",4.85],
 ["NZD",{title:"OCR increased by 25 basis points to 3.00%",url:"https://www.rbnz.govt.nz/news-and-events/news/2026/10/ocr-increased-to-3-percent"},"The Monetary Policy Committee on Wednesday 28 October 2026 decided to increase the OCR by 25 basis points to 3.00 percent, with effect from 29 October 2026.",3],
 ["CAD",{title:"Bank of Canada raises the policy rate",url:"https://www.bankofcanada.ca/2026/10/fad-press-release-2026-10-28/"},"Bank of Canada: The Bank of Canada today raised its target for the overnight rate to 2.50%, with the Bank Rate at 2.75%.",2.5],
 ["CHF",{title:"Monetary policy assessment of 10 December 2026",url:"https://www.snb.ch/en/publications/communication/press-releases-restricted/pre_20261210"},"Swiss National Bank raises SNB policy rate to 0.25%, effective from 11 December 2026.",.25]
];
for(const [code,doc,html,wanted] of cases){
 assert.ok(officialDecisionLink(doc,code),"Bank decision document should be approved "+code);
 const parsed=parseOfficialDecision(doc,code,html);
 assert.ok(parsed,"Expected validated parse for "+code);
 assert.equal(parsed.rate,wanted,"Wrong interest-rate parse "+code);
 assert.equal(parsed.code,code);
 assert.equal(parsed.source,doc.url);
 assert.ok(parsed.decisionDate);
 const prior=baseline.banks.find(b=>b.code===code);
 if(code==="USD"){
   assert.equal(parsed.effectiveDate,null,"Never guess Fed implementation date");
   const note='<h1>Implementation Note issued October 28, 2026</h1><p>Effective October 29, 2026, the Federal Open Market Committee directs the Desk to: Undertake open market operations to maintain the federal funds rate in a target range of 4 to 4-1/4 percent.</p>';
   const ready=completeFedDecision(parsed,note);
   assert.equal(ready?.effectiveDate,"2026-10-29");
   assert.equal(decisionSafety(ready,prior,"2026-10-30"),"publish");
   assert.equal(completeFedDecision(parsed,note.replace("4-1/4","4-1/2")),null,"Mismatched implementation range rejected");
 }else assert.equal(decisionSafety(parsed,prior,"2026-12-31"),"publish");
 assert.equal(decisionSafety({...parsed,rate:prior.rate+2},prior,"2026-12-31"),code==="USD"?"not_verified":"unusually_large_change");
 assert.equal(decisionSafety(code==="USD"?completeFedDecision(parsed,'<h1>Implementation Note issued October 28, 2026</h1>Effective October 29, 2026, the Federal Open Market Committee directs the Desk to: Undertake open market operations to maintain the federal funds rate in a target range of 4 to 4-1/4 percent.'):parsed,prior,"2026-10-01"),"future_decision");
}
const doc=cases[3][1],txt=cases[3][2];
assert.equal(parseOfficialDecision(doc,"AUD",txt.replace(", effective from 4 November 2026","")),null,"RBA effective date may not be guessed");
assert.equal(parseOfficialDecision(cases[6][1],"CHF",cases[6][2].replace(", effective from 11 December 2026","")),null,"SNB effective date may not be guessed");
assert.equal(parseOfficialDecision(cases[4][1],"NZD",cases[4][2].replace(", with effect from 29 October 2026","")),null,"RBNZ effective date may not be guessed");
for (const word of ["Minutes","Press conference","Research","Speech"]){
 assert.equal(officialDecisionLink({...cases[0][1],title:word+" of FOMC meeting"},"USD"),false,"Reject unrelated Fed documents");
}
assert.equal(officialDecisionLink({...cases[5][1],url:"https://bankofcanada.ca/2026/10/fad-press-release-2026-10-28/"},"CAD"),false);
assert.equal(officialDecisionLink({...cases[3][1],url:"https://evil.rba.gov.au/media-releases/2026/mr-26-30.html"},"AUD"),false);
assert.equal(officialDecisionLink({title:"BoJ monetary policy meeting",url:"https://www.boj.or.jp/en/mopo/2026/decision.pdf"},"JPY"),false,"No unverified PDF rate inference");
const fedParsed=completeFedDecision(parseOfficialDecision(cases[0][1],"USD",cases[0][2]),'<h1>Implementation Note issued October 28, 2026</h1>Effective October 29, 2026, the Federal Open Market Committee directs the Desk to: Undertake open market operations to maintain the federal funds rate in a target range of 4 to 4-1/4 percent.');
const results=updateSnapshot(baseline,[fedParsed,parseOfficialDecision(cases[5][1],"CAD",cases[5][2])],"2026-10-30");
assert.deepEqual(new Set(results.changed),new Set(["USD","CAD"]));
assert.equal(results.next.banks.length,8);
assert.equal(results.next.asOf,"2026-10-30");
assert.equal(results.next.banks.find(b=>b.code==="EUR").rate,baseline.banks.find(b=>b.code==="EUR").rate);
assert.equal(updateSnapshot(baseline,[{...fedParsed,decisionDate:"2026-09-16"}],"2026-10-30").changed.length,0);
assert.equal(updateSnapshot(baseline,[],"2026-10-17").next,baseline);
const audit=appendRateHistory([],baseline,results.next,results.changed,"2026-10-30T12:00:00Z");
assert.equal(audit.length,2);
assert.deepEqual(new Set(audit.map(x=>x.code)),new Set(["USD","CAD"]));
assert.ok(audit.every(x=>x.officialSource.startsWith("https://")));
assert.equal(appendRateHistory(audit,baseline,results.next,results.changed,"2026-10-30T13:00:00Z").length,2,"Published rate decisions must be idempotent");
assert.deepEqual(appendRateHistory(audit,baseline,baseline,[],"2026-10-30T13:00:00Z"),audit,"No invented audit updates on an unchanged run");

console.log("Autonomous central-bank publication parser: 7 official bank adapters, effective-date safety, exact Fed range cross-check, 28-pair arithmetic, no speculative changes.");

// Regression: a real hold uses "at", and a Canadian hike includes the size before "to".
const hold=parseOfficialDecision(cases[0][1],'USD','The Committee decided to maintain the target range for the federal funds rate at 3-3/4 to 4 percent.');
assert.equal(hold.rate,3.875);
assert.equal(hold.effectiveDate,null);
const cadHike=parseOfficialDecision(cases[5][1],'CAD','The Bank of Canada today increased its target for the overnight rate by 25 basis points to 2.5%, with the Bank Rate at 2.75%.');
assert.equal(cadHike.rate,2.5);

// A failed newest decision must not silently fall through to a verified old one.
const fs=await import('node:fs');
const os=await import('node:os');
const path=await import('node:path');
const cwd=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trade90-rate-test-'));
try{
 process.chdir(tmp);
 fs.mkdirSync('src/data',{recursive:true});fs.mkdirSync('public/data',{recursive:true});
 fs.writeFileSync('src/data/trade90-policy-snapshot.json',JSON.stringify(baseline));
 fs.writeFileSync('public/data/official-source-monitor.json',JSON.stringify({sources:[{code:'USD',items:[cases[0][1],{...cases[0][1],url:baseline.banks.find(b=>b.code==='USD').source}]}]}));
 const result=await runAutomaticRateCheck({now:()=> '2026-10-29T12:00:00Z',fetcher:async url=>({ok:true,url,headers:new Headers({'content-type':'text/html'}),text:async()=>'<p>Unsupported decision content</p>'})});
 assert.equal(result.changed.length,0);
 assert.equal(result.coverage.find(x=>x.code==='USD').state,'No safely verified new decision');
 assert.equal(result.failures.filter(x=>x.code==='USD').length,1);
}finally{process.chdir(cwd);fs.rmSync(tmp,{recursive:true,force:true});}

assert.ok(results.next.banks.every(bank=>typeof bank.decision==='string'&&bank.decision.length>0),'Every automated update must retain the decision label required by pages');
const held=updateSnapshot(baseline,[{...fedParsed,rate:3.875,range:[3.75,4]}],'2026-10-30');
assert.equal(held.next.banks.find(b=>b.code==='USD').decision,'Hold');
