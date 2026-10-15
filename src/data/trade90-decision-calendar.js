// Officially scheduled policy meetings. This is a dated curated calendar,
// not an automatic real-time data feed or a forecast of any rate decision.
// Official announcement dates take priority over meeting start dates.
import { PAIR_SYMBOLS } from "../lib/trade90-rates.js";

export const decisionCalendarReviewedAt = "2026-10-15";
export const officialDecisionSources = {
  USD:{bank:"Federal Reserve",short:"Fed",url:"https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    watch:"Interest-rate decision, FOMC statement and Chair's press conference"},
  EUR:{bank:"European Central Bank",short:"ECB",url:"https://www.ecb.europa.eu/press/pr/date/2025/html/ecb.pr250424~2643533670.en.html",
    watch:"Deposit facility rate decision and monetary policy press conference"},
  GBP:{bank:"Bank of England",short:"BoE",url:"https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates",
    watch:"Bank Rate decision, MPC vote and Monetary Policy Report"},
  JPY:{bank:"Bank of Japan",short:"BoJ",url:"https://www.boj.or.jp/en/mopo/mpmsche_minu/",
    watch:"Policy-rate decision and Outlook for Economic Activity and Prices"},
  AUD:{bank:"Reserve Bank of Australia",short:"RBA",url:"https://www.rba.gov.au/schedules-events/board-meeting-schedules.html",
    watch:"Cash-rate target decision, policy statement and economic outlook"},
  NZD:{bank:"Reserve Bank of New Zealand",short:"RBNZ",url:"https://www.rbnz.govt.nz/news-and-events/how-we-release-information/ocr-decision-dates-and-financial-stability-report-dates-to-feb-2028",
    watch:"Official Cash Rate announcement and Monetary Policy Review or Statement"},
  CAD:{bank:"Bank of Canada",short:"BoC",url:"https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/",
    watch:"Overnight-rate target decision and Monetary Policy Report when scheduled"},
  CHF:{bank:"Swiss National Bank",short:"SNB",url:"https://www.snb.ch/en/services-events/digital-services/event-schedule",
    watch:"SNB policy-rate assessment, inflation outlook and press release"}
};
// Each entry's date is the policy announcement or meeting final day.
// Do NOT publish speculative rates or unverified meetings here.
export const officialPolicyDecisionCalendar = [
  {currency:"USD",date:"2026-10-28",startDate:"2026-10-27",title:"FOMC policy decision"},
  {currency:"USD",date:"2026-12-09",startDate:"2026-12-08",title:"FOMC policy decision and projections"},
  {currency:"EUR",date:"2026-10-29",title:"Governing Council monetary policy decision"},
  {currency:"EUR",date:"2026-12-17",title:"Governing Council monetary policy decision"},
  {currency:"GBP",date:"2026-11-05",title:"MPC rate decision and Monetary Policy Report"},
  {currency:"GBP",date:"2026-12-17",title:"MPC rate decision"},
  {currency:"JPY",date:"2026-10-30",startDate:"2026-10-29",title:"Monetary Policy Meeting and Outlook"},
  {currency:"JPY",date:"2026-12-18",startDate:"2026-12-17",title:"Monetary Policy Meeting"},
  {currency:"AUD",date:"2026-11-03",startDate:"2026-11-02",title:"Monetary Policy Board decision"},
  {currency:"AUD",date:"2026-12-08",startDate:"2026-12-07",title:"Monetary Policy Board decision"},
  {currency:"NZD",date:"2026-10-28",title:"OCR decision and Monetary Policy Review"},
  {currency:"NZD",date:"2026-12-09",title:"OCR decision and Monetary Policy Statement"},
  {currency:"CAD",date:"2026-10-28",title:"Rate decision and Monetary Policy Report"},
  {currency:"CAD",date:"2026-12-09",title:"Rate decision"},
  {currency:"CHF",date:"2026-12-10",title:"Monetary policy assessment"},
  {currency:"CHF",date:"2027-03-18",title:"Monetary policy assessment"}
].map(entry=>({...entry,bank:officialDecisionSources[entry.currency].short,
  source:officialDecisionSources[entry.currency].url,
  watch:officialDecisionSources[entry.currency].watch}));

export function getNextPolicyDecisions(pair, asOf=new Date().toISOString().slice(0,10)) {
  const symbol=typeof pair==="string"?pair.replace("/","").toUpperCase()
    :pair?.symbol || (pair?.base&&pair?.quote?pair.base+pair.quote:"");
  if(!PAIR_SYMBOLS.includes(symbol)) return [];
  const currencies=[symbol.slice(0,3),symbol.slice(3)];
  // At most one next decision from EACH side. Do not fall back to expired events.
  return currencies.map(currency=>{
    const next=officialPolicyDecisionCalendar
      .filter(event=>event.currency===currency && event.date>=asOf)
      .sort((a,b)=>a.date.localeCompare(b.date))[0];
    return next || {
      currency,bank:officialDecisionSources[currency].short,
      title:"Next decision not yet confirmed in this collection",date:null,
      source:officialDecisionSources[currency].url,
      watch:officialDecisionSources[currency].watch
    };
  }).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")||a.currency.localeCompare(b.currency));
}

export function validatePolicyDecisionCalendar(entries=officialPolicyDecisionCalendar) {
  const validDate=value=>typeof value==="string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value+"T00:00:00Z"));
  if(!Array.isArray(entries)||entries.length<8)return {valid:false,reason:"Missing official decision schedules"};
  for(const [currency,source] of Object.entries(officialDecisionSources)){
    if(!/^https:\/\//.test(source.url))return {valid:false,reason:"Invalid official calendar link"};
    const dates=entries.filter(event=>event.currency===currency);
    if(!dates.length)return {valid:false,reason:"Missing calendar for "+currency};
    if(dates.some(event=>!validDate(event.date)||(event.startDate&&(!validDate(event.startDate)||event.startDate>event.date))))return {valid:false,reason:"Invalid announcement date for "+currency};
  }
  if(new Set(entries.map(event=>event.currency+"|"+event.date)).size!==entries.length)return {valid:false,reason:"Duplicate policy calendar entries"};
  if(entries.some(event=>event.date<decisionCalendarReviewedAt))return {valid:false,reason:"Expired meeting in calendar collection"};
  return {valid:true,reason:null,count:entries.length};
}
