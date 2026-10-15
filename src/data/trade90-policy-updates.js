import snapshot from "./trade90-policy-snapshot.json" with { type: "json" };
import { PAIR_SYMBOLS } from "../lib/trade90-rates.js";

export const policyCollectionAsOf = "2026-10-15";
export const bankCodes = ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"];

const officialDomains = {
  USD:"federalreserve.gov",EUR:"ecb.europa.eu",GBP:"bankofengland.co.uk",
  JPY:"boj.or.jp",AUD:"rba.gov.au",NZD:"rbnz.govt.nz",
  CAD:"bankofcanada.ca",CHF:"snb.ch"
};

const decisionNote = (bank) => {
  const effective = bank.effectiveDate === bank.decisionDate
    ? "Effective from the decision date."
    : "Effective " + bank.effectiveDate + ".";
  const action = bank.decision.startsWith("Hike") ? "raised its benchmark rate" :
    bank.decision === "Hold" ? "kept its benchmark rate unchanged" : "announced an adjustment to its benchmark rate";
  return bank.short + " " + action + "; Trade90's selected " + bank.benchmark.toLowerCase()
    + " is " + bank.rate.toFixed(bank.rate===3.875?3:2) + "%. " + effective;
};

// Beyond rate decisions: independently checked official central-bank documents.
// publishedDate always means PUBLICATION date, not date of the meeting discussed.
const supplemental = [
  {
    id:"fed-fomc-minutes-2026-10-07",currency:"USD",bank:"Fed",type:"Minutes",
    publishedDate:"2026-10-07",meetingDate:"2026-09-16",
    title:"Fed publishes minutes from September 15–16 FOMC meeting",
    summary:"The Federal Reserve released the minutes of its September monetary policy meeting. Minutes describe policymakers' discussion at the time of the meeting; they are not a new interest-rate decision or a new forward-rate quote.",
    source:"https://www.federalreserve.gov/newsevents/pressreleases/monetary20261007a.htm",
    takeAway:"Meeting discussion, not a fresh rate change."
  },
  {
    id:"boc-deliberations-2026-09-16",currency:"CAD",bank:"BoC",type:"Minutes",
    publishedDate:"2026-09-16",meetingDate:"2026-09-02",
    title:"BoC releases September policy deliberations",
    summary:"The Bank of Canada's Governing Council discussed inflation risks, high energy costs, trade uncertainty and economic activity before keeping the overnight target at 2.25%. The record reports deliberations, not a new rate change.",
    source:"https://www.bankofcanada.ca/2026/09/summary-of-governing-council-deliberations-fixed-announcement-date-of-september-2-2026/",
    takeAway:"The council weighed elevated inflation risks against economic uncertainty."
  },
  {
    id:"ecb-press-conference-2026-09-10",currency:"EUR",bank:"ECB",type:"Policy statement",
    publishedDate:"2026-09-10",meetingDate:"2026-09-10",
    title:"ECB explains September monetary policy decision",
    summary:"The ECB's September monetary policy statement and Q&A explain the Governing Council's interest-rate decision and inflation outlook. This policy communication is separate from derivatives-market expectations.",
    source:"https://www.ecb.europa.eu/press/press_conference/monetary-policy-statement/2026/html/ecb.is260910~6a45359cfc.en.html",
    takeAway:"Official reasoning behind the announced September policy decision."
  },
  {
    id:"rbnz-mps-2026-09-02",currency:"NZD",bank:"RBNZ",type:"Policy report",
    publishedDate:"2026-09-02",meetingDate:"2026-09-02",
    title:"RBNZ publishes September Monetary Policy Statement",
    summary:"The RBNZ explained its decision to increase the Official Cash Rate to 2.75%, alongside its assessment of inflation, economic activity and risks. Its policy projections are not identical to market-implied rates.",
    source:"https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement/monetary-policy-statements/2026/sep-0209/monetary-policy-statement-september-2026",
    takeAway:"Official inflation and activity outlook alongside the OCR decision."
  }
];

const decisionUpdates = snapshot.banks.map(bank => ({
  id:bank.code.toLowerCase()+"-decision-"+bank.decisionDate,
  currency:bank.code,
  bank:bank.short,
  type:"Rate decision",
  publishedDate:bank.decisionDate,
  meetingDate:bank.decisionDate,
  title:bank.short+" "+(bank.decision==="Hold"?"holds":bank.decision.startsWith("Hike")?"raises":"adjusts")+" "+bank.benchmark+" · "+bank.rate.toFixed(bank.rate===3.875?3:2)+"%",
  summary:decisionNote(bank),
  source:bank.source,
  decision:bank.decision,
  observedRatePct:bank.rate,
  effectiveDate:bank.effectiveDate,
  takeAway:"Official policy benchmark, not a market-implied future rate."
}));

export const policyUpdates = [...decisionUpdates,...supplemental].sort((a,b)=>
  b.publishedDate.localeCompare(a.publishedDate)||a.currency.localeCompare(b.currency)||a.id.localeCompare(b.id)
);


// Return only official policy publications from the TWO central banks in a
// market-standard currency pair. This is a strict source filter, not a
// keyword match, so unrelated bank updates cannot leak into pair details.
export function getPairPolicyUpdates(pair, items=policyUpdates) {
  const symbol = typeof pair === "string"
    ? pair.replace("/", "").trim().toUpperCase()
    : typeof pair?.symbol === "string"
      ? pair.symbol.replace("/", "").trim().toUpperCase()
      : typeof pair?.base === "string" && typeof pair?.quote === "string"
        ? pair.base.toUpperCase() + pair.quote.toUpperCase()
        : "";
  if (!PAIR_SYMBOLS.includes(symbol)) return [];
  const base = symbol.slice(0,3);
  const quote = symbol.slice(3);
  return items.filter(item=>item.currency===base||item.currency===quote)
    .sort((a,b)=>b.publishedDate.localeCompare(a.publishedDate)||a.id.localeCompare(b.id));
}

export function policyUpdateRelatedPairs(currency) {
  if (!bankCodes.includes(currency)) return [];
  return PAIR_SYMBOLS.filter(symbol=>symbol.startsWith(currency)||symbol.endsWith(currency))
    .map(symbol=>symbol.slice(0,3)+"/"+symbol.slice(3));
}
export function validatePolicyUpdates(items=policyUpdates) {
  if (!Array.isArray(items)||items.length<8) return {valid:false,reason:"Incomplete policy update dataset"};
  if (new Set(items.map(item=>item.id)).size!==items.length) return {valid:false,reason:"Duplicate update ID"};
  if (new Set(items.filter(item=>item.type==="Rate decision").map(item=>item.currency)).size!==8) return {valid:false,reason:"Eight rate decision sources required"};
  for(const item of items){
    if(!bankCodes.includes(item.currency))return {valid:false,reason:"Unsupported currency"};
    if(!["Rate decision","Minutes","Policy statement","Policy report"].includes(item.type))return {valid:false,reason:"Unknown policy publication type"};
    if(!/^\d{4}-\d\d-\d\d$/.test(item.publishedDate)||!Number.isFinite(Date.parse(item.publishedDate+"T00:00:00Z")))return {valid:false,reason:"Invalid publication date"};
    if(item.publishedDate>policyCollectionAsOf) return {valid:false,reason:"Publication date beyond collection date"};
    if(typeof item.title!=="string"||item.title.length<15||typeof item.summary!=="string"||item.summary.length<70)return {valid:false,reason:"Missing factual description"};
    try {
      const url=new URL(item.source);
      if(url.protocol!=="https:"||!(url.hostname===officialDomains[item.currency]||url.hostname.endsWith("."+officialDomains[item.currency])))return {valid:false,reason:"Not an official central bank source"};
    }catch{return {valid:false,reason:"Invalid official source URL"}}
    if(policyUpdateRelatedPairs(item.currency).length!==7)return {valid:false,reason:"Each currency must match seven FX pairs"};
    if(item.type!=="Rate decision"&&item.observedRatePct!==undefined) return {valid:false,reason:"Only official rate decisions can carry a benchmark rate"};
  }
  return {valid:true,reason:null,count:items.length,bankCount:8};
}
