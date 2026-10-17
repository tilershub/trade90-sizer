import { PAIR_SYMBOLS, getPairs, formatBp } from "./trade90-rates.js";
import snapshot from "../data/trade90-policy-snapshot.json" with {type:"json"};
export const allTrade90Pairs=getPairs(snapshot.banks);
export const bySymbol=Object.fromEntries(allTrade90Pairs.map(p=>[p.symbol,p]));
export const pairSlug=s=>s.slice(0,3).toLowerCase()+"-"+s.slice(3).toLowerCase();
export const pairUrl=s=>"/pairs/"+pairSlug(s)+"/";
export const pairFromSlug=s=>bySymbol[(s||"").replace(/[-/_]/g,"").toUpperCase()]||null;
export const formatPercent=v=>Number(v).toFixed(Number.isInteger(v*100)?2:3)+"%";
export const reportDate=s=>new Date(s+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
export const currencyContext={
 USD:{country:"United States",drivers:"US inflation, payrolls, Fed communications and Treasury-market repricing",benchmark:"Federal funds target range midpoint"},
 EUR:{country:"euro area",drivers:"euro-area inflation, growth indicators and ECB Governing Council communications",benchmark:"ECB deposit facility rate"},
 GBP:{country:"United Kingdom",drivers:"UK inflation, wage growth and Monetary Policy Committee votes",benchmark:"Bank Rate"},
 JPY:{country:"Japan",drivers:"Japanese wage settlements, inflation and Bank of Japan policy normalization",benchmark:"Bank of Japan selected interest-rate benchmark"},
 AUD:{country:"Australia",drivers:"Australian labour-market data, quarterly inflation and RBA assessments",benchmark:"RBA cash rate target"},
 NZD:{country:"New Zealand",drivers:"New Zealand CPI, labour data and RBNZ Monetary Policy Statements",benchmark:"Official Cash Rate"},
 CAD:{country:"Canada",drivers:"Canadian inflation, employment and Bank of Canada deliberations",benchmark:"overnight-rate target"},
 CHF:{country:"Switzerland",drivers:"Swiss inflation, franc exchange-rate developments and SNB assessments",benchmark:"SNB policy rate"}
};
export function pairInsight(pair){
 const a=currencyContext[pair.base],b=currencyContext[pair.quote];
 const higher=pair.signedBp===0?"Both currencies currently use identical selected benchmark levels":(pair.higher+" has the higher selected official policy-rate benchmark");
 return {
  summary:pair.label+" compares the "+pair.base+" ("+a.country+") and "+pair.quote+" ("+b.country+") monetary-policy benchmarks. "+higher+" in Trade90's "+reportDate(snapshot.asOf)+" snapshot. The signed base-minus-quote gap is "+(pair.signedBp>0?"+":"")+formatBp(pair.signedBp)+" basis points; this is a comparison of official policy levels, not a currency-price signal.",
  developments:"For "+pair.base+", monitor "+a.drivers+". For "+pair.quote+", monitor "+b.drivers+". A change in future market expectations may move an exchange rate even while the current official policy gap remains unchanged.",
  nuances:"Trade90 compares "+a.benchmark+" against "+b.benchmark+". Each country defines its policy benchmark differently. The signed difference is not an FX forward, an investable interest-rate spread, or a broker's overnight swap charge."
 };
}
export const rateSnapshot=snapshot;
export const majors=allTrade90Pairs.filter(p=>p.base==="USD"||p.quote==="USD");
export const crosses=allTrade90Pairs.filter(p=>p.base!=="USD"&&p.quote!=="USD");
export const pairCount=PAIR_SYMBOLS.length;
