// TRADE90 verified forward-rate math.
// This accepts only licensed, comparable market-implied POLICY-LEVEL estimates.
// An OIS par yield, a single-meeting probability, a policy statement, a news report
// or an economist survey is NOT a usable value for this schema.
import { PAIR_SYMBOLS } from "./trade90-rates.js";
export const HORIZONS = ["3M","6M","12M"];
export const CURRENCIES = ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"];
export const MAX_FRESH_AGE_MS = 96 * 60 * 60 * 1000; // weekends included
const MAX_PAIR_OBSERVATION_SKEW_MS = 15 * 60 * 1000;
const roundBp = x => Math.round(x * 1000) / 1000;
const validISO = s => typeof s === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s) && Number.isFinite(Date.parse(s));
const validUrl = s => typeof s === "string" && /^https:\/\//.test(s);
const observationTime = record => Date.parse(record.observedAt);

export function validateForwardSnapshot(snapshot, nowMs=Date.now()) {
  if (!snapshot || snapshot.schemaVersion !== 1) return {valid:false,reason:"Invalid forward-rate data format"};
  if (snapshot.status === "awaiting_licensed_data") return {valid:false,reason:"Market-implied forward-rate feed not connected"};
  if (snapshot.status !== "verified") return {valid:false,reason:"Forward-rate dataset is not verified"};
  if (snapshot.dataKind !== "market_implied_policy_level") return {valid:false,reason:"Data must represent implied policy-level expectations, not OIS par yields"};
  if (!snapshot.license || snapshot.license.publicRedisplayAuthorized !== true || typeof snapshot.license.reference !== "string" || snapshot.license.reference.trim().length < 8) return {valid:false,reason:"Public redistribution license has not been confirmed"};
  if (!snapshot.provider || snapshot.provider.trim().length < 2 || !snapshot.methodology || snapshot.methodology.trim().length < 30) return {valid:false,reason:"Provider and published method are required"};
  if (!validISO(snapshot.observedAt)) return {valid:false,reason:"Invalid source observation timestamp"};
  const age = nowMs - Date.parse(snapshot.observedAt);
  if (age < -5 * 60 * 1000) return {valid:false,reason:"Source observation time is in the future"};
  if (age > MAX_FRESH_AGE_MS) return {valid:false,reason:"Forward-rate dataset is stale; numeric expected gaps withheld"};
  if (!snapshot.rates || typeof snapshot.rates !== "object" || Array.isArray(snapshot.rates)) return {valid:false,reason:"No forward-rate records"};
  const seen = new Set();
  for (const [currency,horizons] of Object.entries(snapshot.rates)) {
    if (!CURRENCIES.includes(currency) || seen.has(currency)) return {valid:false,reason:"Unrecognized currency"};
    seen.add(currency);
    if (!horizons || typeof horizons !== "object") return {valid:false,reason:"Invalid horizon records"};
    for (const [horizon,record] of Object.entries(horizons)) {
      if (!HORIZONS.includes(horizon)) return {valid:false,reason:"Unexpected maturity"};
      if (!record || !Number.isFinite(record.ratePct) || record.ratePct < -5 || record.ratePct > 30) return {valid:false,reason:"Invalid forward-rate value"};
      if (!validUrl(record.sourceUrl) || typeof record.instrument !== "string" || record.instrument.trim().length < 3) return {valid:false,reason:"Missing instrument and source URL"};
      if (!validISO(record.observedAt)) return {valid:false,reason:"Missing observation timestamp"};
      const delta = Math.abs(observationTime(record) - Date.parse(snapshot.observedAt));
      if (delta > MAX_PAIR_OBSERVATION_SKEW_MS) return {valid:false,reason:"Inconsistent snapshot observation times"};
    }
  }
  return {valid:true,reason:null,asOf:snapshot.observedAt};
}

function pctBps(basePct,quotePct) {return roundBp((basePct-quotePct)*100)}
export function classifyExpectedGap(currentSignedBp,expectedSignedBp) {
  // Signed pair orientation is fixed: a crossing over zero is a reversal.
  if (currentSignedBp !== 0 && expectedSignedBp !== 0 && Math.sign(currentSignedBp)!==Math.sign(expectedSignedBp)) return "Reversal";
  const delta = roundBp(Math.abs(expectedSignedBp)-Math.abs(currentSignedBp));
  return Math.abs(delta)<0.001?"Unchanged":delta>0?"Widening":"Narrowing";
}
export function getExpectedRows(snapshot,policyBanks,horizon,nowMs=Date.now()) {
  if (!HORIZONS.includes(horizon)) throw new Error("Unsupported horizon");
  const health=validateForwardSnapshot(snapshot,nowMs);
  const policyRates=Object.fromEntries(policyBanks.map(b=>[b.code,b.rate]));
  const rows=PAIR_SYMBOLS.map(symbol=>{
    const base=symbol.slice(0,3),quote=symbol.slice(3),b=snapshot?.rates?.[base]?.[horizon],q=snapshot?.rates?.[quote]?.[horizon];
    const currentSignedBp=pctBps(policyRates[base],policyRates[quote]);
    if (!health.valid || !b || !q) return {symbol,base,quote,available:false,currentSignedBp,reason:health.valid?"Both currencies need same-horizon pricing":health.reason};
    const deltaMs=Math.abs(observationTime(b)-observationTime(q));
    if (deltaMs>MAX_PAIR_OBSERVATION_SKEW_MS) return {symbol,base,quote,available:false,currentSignedBp,reason:"Observation times are not comparable"};
    const expectedSignedBp=pctBps(b.ratePct,q.ratePct);
    return {
      symbol,base,quote,available:true,currentSignedBp,expectedSignedBp,
      expectedAbsBp:Math.abs(expectedSignedBp),
      changeVsCurrentBp:roundBp(expectedSignedBp-currentSignedBp),
      outlook:classifyExpectedGap(currentSignedBp,expectedSignedBp),
      baseForwardPct:b.ratePct,quoteForwardPct:q.ratePct,
      sourceBase:b.sourceUrl,sourceQuote:q.sourceUrl,observedAt:snapshot.observedAt,
      provider:snapshot.provider
    };
  });
  if (rows.length!==28) throw new Error("Invalid pair universe");
  return {health,rows,availableCount:rows.filter(r=>r.available).length,horizon};
}
export function getExpectedChanges(latest,history,policyBanks,horizon,hours,nowMs=Date.now()) {
  if (![24,168].includes(hours)) throw new Error("Only 24-hour and 7-day comparisons supported");
  const current=getExpectedRows(latest,policyBanks,horizon,nowMs);
  if (!current.health.valid || !Array.isArray(history)) return {available:false,reason:"No verified current dataset or historical snapshots",rows:[]};
  const currentTime=Date.parse(latest.observedAt);
  const target=currentTime-hours*60*60*1000;
  const window=hours===24?6:24;
  const candidates=history.filter(s=>s?.provider===latest.provider && s?.dataKind===latest.dataKind && s?.methodology===latest.methodology && s?.license?.publicRedisplayAuthorized===true && Number.isFinite(Date.parse(s?.observedAt)) && Math.abs(Date.parse(s.observedAt)-target) <= window*60*60*1000).sort((a,b)=>Math.abs(Date.parse(a.observedAt)-target)-Math.abs(Date.parse(b.observedAt)-target));
  // Historic validity: use its observation time as the reference, not today's time.
  const prior=candidates.find(s=>validateForwardSnapshot(s,Date.parse(s.observedAt)).valid);
  if (!prior) return {available:false,reason:"No comparable historical observation near the requested interval",rows:[]};
  const old=getExpectedRows(prior,policyBanks,horizon,Date.parse(prior.observedAt));
  const oldBySymbol=Object.fromEntries(old.rows.map(r=>[r.symbol,r]));
  const rows=current.rows.filter(r=>r.available && oldBySymbol[r.symbol]?.available).map(r=>({
    ...r,
    priorExpectedSignedBp:oldBySymbol[r.symbol].expectedSignedBp,
    revisionBp:roundBp(r.expectedSignedBp-oldBySymbol[r.symbol].expectedSignedBp),
    previousAsOf:prior.observedAt
  })).sort((a,b)=>Math.abs(b.revisionBp)-Math.abs(a.revisionBp)||a.symbol.localeCompare(b.symbol));
  return {available:rows.length>0,reason:rows.length?null:"No shared quoted pairs in both snapshots",rows,previousAsOf:prior.observedAt,latestAsOf:latest.observedAt};
}
