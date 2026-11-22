#!/usr/bin/env node
// Automatic publication is strictly opt-in per official decision format.
// Unknown markup, PDFs, undated documents and conflicting figures fail closed.
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {getPairs} from "../src/lib/trade90-rates.js";
export const snapshotPath=resolve("src/data/trade90-policy-snapshot.json");
export const monitorPath=resolve("public/data/official-source-monitor.json");
const months={january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
export function dateParts(y,m,d){
 const s=String(y)+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
 return new Date(s+"T12:00:00Z").toISOString().startsWith(s)?s:null;
}
const englishDate=t=>{const m=t.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i);return m?dateParts(m[3],months[m[2].toLowerCase()],m[1]):null};
const clean=s=>String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/&nbsp;|&#160;|&#xA0;/gi," ").replace(/&frac14;|&#188;/gi,"1/4").replace(/&amp;/gi,"&").replace(/\s+/g," ");
const pct=s=>{const n=Number(s);return Number.isFinite(n)&&n>=-2&&n<=25?n:null};
const fraction=s=>{const m=s.match(/^(\d{1,2})(?:[ -](1\/4|1\/2|3\/4))?$/);return m?+m[1]+({undefined:0,"1/4":.25,"1/2":.5,"3/4":.75}[m[2]]??0):null};
export function officialDecisionLink(item,code){
 if(!item||!item.url||!item.title)return false;
 let u;try{u=new URL(item.url)}catch{return false}
 if(u.protocol!=="https:"||u.username||u.password||u.port)return false;
 const p=u.pathname,t=item.title;
 const tests={
 USD:["www.federalreserve.gov",/\/newsevents\/pressreleases\/monetary20\d{6}a\.htm$/i,/Federal Reserve issues FOMC statement/i],
 EUR:["www.ecb.europa.eu",/\/press\/pr\/date\/20\d{2}\/html\/ecb\.mp\d{6}~[^/]+\.en\.html$/i,/Monetary policy decisions/i],
 GBP:["www.bankofengland.co.uk",/\/monetary-policy-summary-and-minutes\/20\d{2}\/[a-z]+-20\d{2}$/i,/Bank rate .*Monetary Policy Summary and Minutes/i],
 AUD:["www.rba.gov.au",/\/media-releases\/20\d{2}\/mr-\d{2}-\d+\.html$/i,/Statement by the Monetary Policy Board: Monetary Policy Decision/i],
 NZD:["www.rbnz.govt.nz",/\/news-and-events\/news\/20\d{2}\/\d{2}\/(?:ocr-|official-cash-rate)/i,/(?:OCR|official cash rate)/i],
 CAD:["www.bankofcanada.ca",/\/20\d{2}\/\d{2}\/fad-press-release-20\d{2}-\d{2}-\d{2}\/?$/i,/Bank of Canada .*policy rate/i],
 CHF:["www.snb.ch",/\/publications\/communication\/press-releases-restricted\/pre_20\d{6}$/i,/Monetary policy assessment/i]
 };
 const test=tests[code];return !!test&&u.hostname===test[0]&&test[1].test(p)&&test[2].test(t);
}
export function parseOfficialDecision(item,code,html){
 if(!officialDecisionLink(item,code)||typeof html!=="string"||html.length>2000000)return null;
 const t=clean(html),p=new URL(item.url).pathname;
 let decisionDate,rate,eff,range;
 let m;
 if(code==="USD"){
  m=p.match(/monetary(20\d{2})(\d{2})(\d{2})a\.htm$/);
  decisionDate=m&&dateParts(m[1],m[2],m[3]);
  const match=[...t.matchAll(/target range for the federal funds rate[\s\S]{0,140}?\b(?:at|to)\s+(\d{1,2}(?:[ -](?:1\/4|1\/2|3\/4))?)\s+to\s+(\d{1,2}(?:[ -](?:1\/4|1\/2|3\/4))?)\s+percent/gi)];
  if(match.length!==1||!/Committee decided/i.test(t))return null;
  const low=fraction(match[0][1]),hi=fraction(match[0][2]);
  if(low===null||hi===null||Math.abs(hi-low-.25)>1e-7)return null;
  rate=(low+hi)/2;range=[low,hi];
  // FOMC decisions may take effect the following day. The FOMC press release
  // itself is NOT evidence of the implementation effective date.
  return {code,rate,decisionDate,effectiveDate:null,range,source:item.url,reason:"fed_effective_date_unverified"};
 }

 // Effective-date phrases used by the banks. A hold never needs one: an unchanged
 // rate keeps the effective date of the last change (resolved in resolveCandidate).
 const effectivePhrase=()=>englishDate(t.match(/(?:with effect from|effective(?: from| on)?|applies from tomorrow,?)\s+(?:[A-Za-z]+,?\s+)?\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"");
 const RATE="(-?\\d{1,2}(?:\\.\\d{1,3})?)";
 let hold=false;
 if(code==="EUR"){
  m=p.match(/ecb\.mp(\d{2})(\d{2})(\d{2})~/i);
  decisionDate=m&&dateParts(2000+(+m[1]),m[2],m[3]);
  // Hold: "...the deposit facility, the main refinancing operations and the marginal
  // lending facility will remain unchanged at 2.50%, 2.65% and 2.90% respectively."
  const held=t.match(new RegExp("interest rates on the deposit facility[\\s\\S]{0,200}?\\bremain unchanged at\\s+"+RATE+"\\s*%","i"));
  if(held){hold=true;rate=pct(held[1]);}
  else{
   const r=t.match(/interest rates on the deposit facility[\s\S]{0,180}?\bto\s+(\d{1,2}(?:\.\d{1,3})?)\s*%/i);
   rate=pct(r?.[1]);eff=englishDate(t.match(/with effect from\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"");
  }
 }
 if(code==="GBP"){
  // Only the Committee's own vote counts; later sentences describe dissenting members.
  // e.g. "the Monetary Policy Committee (MPC) voted by a majority of 8–1 to increase
  // Bank Rate by 0.25 percentage points, to 4%." / "...voted unanimously to maintain Bank Rate at 3.75%."
  const vote=t.match(new RegExp("Monetary Policy Committee(?:\\s*\\(MPC\\))?\\s+voted(?:\\s+unanimously|\\s+by\\s+a\\s+majority\\s+of\\s+\\S+)?\\s+to\\s+(maintain|hold|keep|increase|raise|reduce|cut|lower)\\s+Bank Rate(?:\\s+by\\s+\\d+(?:\\.\\d+)?\\s+percentage points?,?)?\\s+(?:at|to)\\s+"+RATE+"\\s*%","i"));
  if(vote){rate=pct(vote[2]);hold=/^(maintain|hold|keep)$/i.test(vote[1]);}
  // The announcement ("Published on 05 November 2026") is the decision date TRADE90 records;
  // the meeting itself ends the day before.
  decisionDate=englishDate(t.match(/Published on\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"")
   ||englishDate(t.match(/Monetary Policy Committee meeting on\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"");
  const monthPath=p.match(/\/(20\d{2})\/([a-z]+)-20\d{2}$/i);
  if(decisionDate&&monthPath&&(decisionDate.slice(0,4)!==monthPath[1]||+decisionDate.slice(5,7)!==months[monthPath[2].toLowerCase()]))decisionDate=null;
  // Bank Rate changes take effect on the announcement date.
  eff=hold?null:decisionDate;
 }
 if(code==="AUD"){
  decisionDate=englishDate(t.match(/\bDate:?\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"");
  // Hold: "the Board decided to leave the cash rate unchanged at 3.60 per cent" or, with no figure,
  // "the Board decided to leave the cash rate target unchanged".
  const held=t.match(new RegExp("decided to leave the cash rate(?: target)? unchanged(?: at\\s+"+RATE+"\\s*(?:per\\s*cent|percent|%))?","i"));
  if(held){hold=true;rate=held[1]===undefined?undefined:pct(held[1]);}
  else{
   rate=pct(t.match(/cash rate target[\s\S]{0,130}?\bto\s+(\d{1,2}(?:\.\d{1,3})?)\s*(?:per\s*cent|percent|%)/i)?.[1]);
   // RBA statements do not restate it: a new cash rate target applies from the day after the announcement.
   eff=effectivePhrase()||(decisionDate?new Date(Date.parse(decisionDate+"T12:00:00Z")+864e5).toISOString().slice(0,10):null);
  }
 }
 if(code==="CAD"){
  m=p.match(/fad-press-release-(20\d{2})-(\d{2})-(\d{2})/);
  decisionDate=m&&dateParts(m[1],m[2],m[3]);
  rate=pct(t.match(/target for the overnight rate\s+(?:by\s+\d+(?:\.\d+)?\s+basis points\s+)?(?:at|to)\s+(\d{1,2}(?:\.\d{1,3})?)\s*%/i)?.[1]);eff=decisionDate;
  hold=/\b(?:maintains?|holds?|held)\b[^.]{0,60}target for the overnight rate/i.test(t);
 }
 if(code==="CHF"){
  m=p.match(/pre_(20\d{2})(\d{2})(\d{2})/);decisionDate=m&&dateParts(m[1],m[2],m[3]);
  rate=pct(t.match(/SNB policy rate[\s\S]{0,105}?\b(?:at|to)\s+(-?\d{1,2}(?:\.\d{1,3})?)\s*%/i)?.[1]);
  // "Swiss National Bank leaves SNB policy rate unchanged at 0%"
  hold=/SNB policy rate unchanged at/i.test(t);
  eff=hold?null:effectivePhrase();
 }
 if(code==="NZD"){
  // Hold: "The Monetary Policy Committee today voted 4 – 3 to hold the OCR at 2.75 percent."
  const held=t.match(new RegExp("(?:hold|keep|leave|maintain)\\s+the\\s+(?:OCR|Official Cash Rate)\\s+(?:unchanged\\s+)?at\\s+"+RATE+"\\s*(?:%|percent|per cent)","i"));
  if(held){hold=true;rate=pct(held[1]);}
  else{
   rate=pct(t.match(/(?:Official Cash Rate|OCR)[\s\S]{0,80}?\bto\s+(\d{1,2}(?:\.\d{1,3})?)\s*(?:%|percent)/i)?.[1]);
   eff=effectivePhrase();
  }
  decisionDate=englishDate(t.match(/(?:Wednesday|Tuesday|Monday|Thursday|Friday)\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}/i)?.[0]||"")||englishDate(t.slice(0,600));
  const month=p.match(/\/news\/(20\d{2})\/(\d{2})\//);
  if(decisionDate&&(!month||decisionDate.slice(0,7)!==month[1]+"-"+month[2]))decisionDate=null; // date must agree with the URL
 }
 if(hold){
  if(rate===null||!decisionDate)return null;
  return {code,rate:rate===undefined?null:rate,hold:true,decisionDate,effectiveDate:null,source:item.url,decision:"Verified official policy decision"};
 }
 return rate!==null&&rate!==undefined&&decisionDate&&eff?{code,rate,decisionDate,effectiveDate:eff,source:item.url,decision:"Verified official policy decision"}:null;
}
// Cross-verify a Fed press-release range against its separate same-day
// Implementation Note, including the actual effective date.
export function completeFedDecision(parsed,implementationHtml){
 if(parsed?.code!=="USD"||!parsed.range||!implementationHtml)return null;
 const t=clean(implementationHtml);
 if(!/Implementation Note issued/i.test(t)||!/Federal Open Market Committee directs the Desk/i.test(t))return null;
 const matches=[...t.matchAll(/Effective\s+(\w+\s+\d{1,2},?\s+20\d{2})[\s\S]{0,170}?federal funds rate in a target range of\s+(\d{1,2}(?:[ -](?:1\/4|1\/2|3\/4))?)\s+to\s+(\d{1,2}(?:[ -](?:1\/4|1\/2|3\/4))?)\s+percent/gi)];
 if(matches.length!==1)return null;
 const [m]=matches;
 const dateUs=m[1].match(/(\w+)\s+(\d{1,2}),?\s+(20\d{2})/);
 const eff=dateUs?dateParts(dateUs[3],months[dateUs[1].toLowerCase()],dateUs[2]):null;
 const lower=fraction(m[2]),upper=fraction(m[3]);
 if(!eff||lower!==parsed.range[0]||upper!==parsed.range[1]||eff<parsed.decisionDate)return null;
 return {...parsed,effectiveDate:eff,reason:undefined};
}

// A hold says "unchanged": its rate is the current rate and the effective date of that rate
// does not move. A hold that names a different figure from the one on record is a conflict.
export function resolveCandidate(candidate,bank){
 if(!candidate?.hold)return candidate;
 if(candidate.rate!==null&&candidate.rate!==undefined&&Math.abs(candidate.rate-bank.rate)>.000001)return {...candidate,conflict:true};
 return {...candidate,rate:bank.rate,effectiveDate:bank.effectiveDate};
}
export function decisionSafety(raw,bank,today){
 const candidate=resolveCandidate(raw,bank);
 if(candidate?.conflict)return "conflicting_hold";
 if(!candidate||candidate.code!==bank.code||!Number.isFinite(candidate.rate)||!candidate.decisionDate||!candidate.effectiveDate)return "not_verified";
 if(candidate.decisionDate>today||candidate.effectiveDate>today)return "future_decision";
 if(candidate.decisionDate<bank.decisionDate)return "older_decision";
 if(candidate.decisionDate===bank.decisionDate)return Math.abs(candidate.rate-bank.rate)<.000001?"unchanged":"conflicting_same_date";
 if(Math.abs(candidate.rate-bank.rate)>1.000001)return "unusually_large_change";
 if(!candidate.hold&&candidate.effectiveDate<candidate.decisionDate)return "invalid_effective_date";
 return "publish";
}
// Append-only public record of accepted OFFICIAL decisions, never guesses.
// Rates come exclusively from proposals that passed decisionSafety.
export function appendRateHistory(history,previous,next,changed,stamp){
 if(!Array.isArray(history))throw Error("Invalid official rate audit history");
 const records=changed.map(code=>{
  const old=previous.banks.find(x=>x.code===code);
  const bank=next.banks.find(x=>x.code===code);
  if(!old||!bank||!bank.source||!bank.decisionDate||!bank.effectiveDate)throw Error("Incomplete rate audit entry: "+code);
  return {code,previousRatePct:old.rate,ratePct:bank.rate,
   benchmark:bank.benchmark,decisionDate:bank.decisionDate,effectiveDate:bank.effectiveDate,
   officialSource:bank.source,publishedBy:"trade90-autonomous-verified-policy-publisher",recordedAt:stamp};
 });
 const known=new Set(history.map(x=>[x.code,x.decisionDate,x.officialSource].join("|")));
 return [...history,...records.filter(x=>!known.has([x.code,x.decisionDate,x.officialSource].join("|")))].slice(-1000);
}

export function updateSnapshot(snapshot,proposals,today){
 if(snapshot?.banks?.length!==8)throw Error("Invalid eight-bank source snapshot");
 const changed=[],verdicts=[];
 const updated=snapshot.banks.map(bank=>{
  const found=proposals.find(p=>p.code===bank.code);if(!found)return bank;
  const c=resolveCandidate(found,bank);
  const reason=decisionSafety(c,bank,today);verdicts.push({code:bank.code,reason});
  if(reason!=="publish")return bank;
  changed.push(bank.code);
  const record={...bank,rate:c.rate,source:c.source,decision:Math.abs(c.rate-bank.rate)<0.000001?"Hold":(c.rate>bank.rate?"Hike +":"Cut -")+Math.round(Math.abs(c.rate-bank.rate)*100)+" bp",decisionDate:c.decisionDate,effectiveDate:c.effectiveDate};
  if(c.range)record.range=c.range;
  return record;
 });
 const next=changed.length?{...snapshot,banks:updated,asOf:today,status:"verified_snapshot",description:"Official-source automated verified decision observations, with last verified unchanged bank records retained. Not a streaming market feed."}:snapshot;
 getPairs(next.banks);
 return {next,changed,verdicts};
}
export async function fetchSource(url,fetcher=fetch){
 const u=new URL(url);
 if(!["www.federalreserve.gov","www.ecb.europa.eu","www.bankofengland.co.uk","www.rba.gov.au","www.rbnz.govt.nz","www.bankofcanada.ca","www.snb.ch"].includes(u.hostname)||u.protocol!=="https:")throw Error("Blocked non-official host");
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),11000);
 try{const r=await fetcher(url,{signal:ctl.signal,headers:{accept:"text/html","user-agent":"TRADE90PolicyVerification/1.0 (+https://tradeninety.com/data-policy/)"}});
  if(!r.ok)throw Error("HTTP "+r.status);
  if(new URL(r.url||url).hostname!==u.hostname)throw Error("Unexpected bank redirect");
  const ct=r.headers?.get("content-type")||"text/html";
  if(!/html|text/.test(ct))throw Error("Unsupported binary document");
  const body=await r.text();if(body.length>2000000)throw Error("Excessive source length");
  return body;
 }finally{clearTimeout(timer);}
}
export async function runAutomaticRateCheck({fetcher=fetch,now=()=>new Date().toISOString()}={}){
 const stamp=now(),today=stamp.slice(0,10);
 const snapshot=JSON.parse(readFileSync(resolve("src/data/trade90-policy-snapshot.json"),"utf8"));
 const monitor=JSON.parse(readFileSync(resolve("public/data/official-source-monitor.json"),"utf8"));
 const proposals=[],coverage=[],failures=[];
 for(const bank of snapshot.banks){
  const records=(monitor.sources||[]).find(s=>s.code===bank.code)?.items||[];
  const candidates=records.filter(x=>officialDecisionLink(x,bank.code)).slice(0,16);
  if(!candidates.length){coverage.push({code:bank.code,state:"No parseable decision in official feed"});continue;}
  let verified=false;
  for(const record of candidates){
   try{
    const html=await fetchSource(record.url,fetcher);let parsed=parseOfficialDecision(record,bank.code,html);
    if(parsed?.reason==="fed_effective_date_unverified"){
      const noteUrl=record.url.replace(/a\.htm$/,"a1.htm");
      try{parsed=completeFedDecision(parsed,await fetchSource(noteUrl,fetcher));}
      catch(e){parsed=null;}
    }
    const state=decisionSafety(parsed,bank,today);
    if(state==="publish"){proposals.push(parsed);coverage.push({code:bank.code,state:"Verified new decision",checkedAt:stamp,source:record.url,decisionDate:parsed.decisionDate});verified=true;break;}
    if(state==="unchanged"){coverage.push({code:bank.code,state:"Decision matches published benchmark",checkedAt:stamp,source:record.url,decisionDate:parsed.decisionDate});verified=true;break;}
    if(state!=="older_decision"){failures.push({code:bank.code,state,url:record.url});break;}
   }catch(e){failures.push({code:bank.code,state:String(e.message||e).slice(0,140),url:record.url});break;}
  }
  if(!verified)coverage.push({code:bank.code,state:"No safely verified new decision"});
 }
 const output=updateSnapshot(snapshot,proposals,today);
 if(output.changed.length){
  // Store an independently auditable public history alongside the immutable
  // Git history. Only confirmed changes can reach this code path.
  const auditPath=resolve("public/data/official-rate-history.json");
  let previous=[];try{previous=JSON.parse(readFileSync(auditPath,"utf8"))}catch{}
  const updated=appendRateHistory(previous,snapshot,output.next,output.changed,stamp);
  writeFileSync(auditPath,JSON.stringify(updated,null,2)+"\n");
  writeFileSync(resolve("src/data/trade90-policy-snapshot.json"),JSON.stringify(output.next,null,2)+"\n");
 }
 const report={checkedAt:stamp,changed:output.changed,coverage,failures,notes:"Official documents only. Uncertain rates remain unchanged."};
 writeFileSync("/tmp/trade90-auto-rates-result.json",JSON.stringify(report,null,2)+"\n");
 const statusPath=resolve("public/data/official-policy-automation.json");
 let prior=null;try{prior=JSON.parse(readFileSync(statusPath,"utf8"))}catch{}
 const publicStatus={schemaVersion:1,status:"automated_fail_closed",lastCheckedAt:stamp,changedBanks:output.changed,
  coverage:coverage.map(x=>({...x,attemptedAt:stamp})),
  failures:failures.map(x=>({code:x.code,state:x.state})).slice(0,16),
  explanation:"Strict policy decision parsing: only source-confirmed, dated, effective bank decisions are published; other bank observations retain their last verified values."};
 const last=Date.parse(prior?.lastCheckedAt||""),elapsed=Date.parse(stamp)-last;
 const changes=output.changed.length||JSON.stringify(publicStatus.coverage)!==JSON.stringify(prior?.coverage)||JSON.stringify(publicStatus.failures)!==JSON.stringify(prior?.failures);
 writeFileSync(statusPath,JSON.stringify(publicStatus,null,2)+"\n");
 console.log(JSON.stringify({changed:report.changed,coverage:coverage.map(x=>x.code+":"+x.state),failures:failures.length}));
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runAutomaticRateCheck().catch(e=>{console.error(e);process.exitCode=1});
