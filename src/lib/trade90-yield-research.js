// Yield Curve Intelligence: observed government bond curves, not forward policy-rate forecasts.
// All date comparisons use the observation date and require compatible instrument definitions.
export const YIELD_CURRENCIES=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
export const YIELD_MAX_AGE_DAYS=7;
const MS=86400000;
export function validDate(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d}
export function daysBetween(a,b){return validDate(a)&&validDate(b)?Math.abs((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/MS):Infinity}
export function normalizeYieldHistory(rows,{maxRows=450}={}){
 const data=new Map();
 for(const r of rows||[]){
  const y2=r?.['2Y']==null?NaN:Number(r['2Y']),y10=r?.['10Y']==null?NaN:Number(r['10Y']);
  if(validDate(r?.date)&&Number.isFinite(y2)&&Number.isFinite(y10)&&y2>-5&&y2<35&&y10>-5&&y10<35) data.set(r.date,{date:r.date,'2Y':y2,'10Y':y10});
 }
 return [...data.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-maxRows);
}
export function curveAt(currencyData,now=new Date().toISOString()){
 const rows=normalizeYieldHistory(currencyData?.history||[]);
 const latest=rows.at(-1);
 const today=now.slice(0,10);
 if(!latest||!validDate(today)||latest.date>today)return {status:'missing',date:null,slopeBp:null,history:rows};
 const age=daysBetween(today,latest.date);
 const limit=currencyData.frequency==='monthly'?50:currencyData.frequency==='weekly_publication'?12:YIELD_MAX_AGE_DAYS;
 const sourceAge=!currencyData.verified||age>limit?'stale':'current';
 return {status:sourceAge,date:latest.date,ageDays:age,history:rows,
  yields:{'2Y':latest['2Y'],'10Y':latest['10Y']},
  slopeBp:Math.round((latest['10Y']-latest['2Y'])*1000)/10,
  yieldType:currencyData.kind||currencyData.yieldType||'unclassified',
  provider:currencyData.provider||null,source:currencyData.source||null};
}
export function historySlopeChange(rows,lookbackDays,nowDate){
 const hist=normalizeYieldHistory(rows);
 const latest=hist.at(-1);
 if(!latest||![7,30,90].includes(lookbackDays))return null;
 const cutoff=new Date(Date.parse((nowDate||latest.date)+'T00:00:00Z')-lookbackDays*MS).toISOString().slice(0,10);
 const prev=[...hist].reverse().find(r=>r.date<=cutoff&&daysBetween(r.date,cutoff)<=5);
 if(!prev)return null;
 return Math.round((((latest['10Y']-latest['2Y'])-(prev['10Y']-prev['2Y']))*100)*10)/10;
}
export function pairYieldSpread(baseData,quoteData,tenor,now=new Date().toISOString()){
 const a=curveAt(baseData,now),b=curveAt(quoteData,now);
 if(a.status!=='current'||b.status!=='current')return {status:'unavailable',reason:'Both yields must be current and source-verified'};
 if(!['2Y','10Y'].includes(tenor))return {status:'unavailable',reason:'Unsupported maturity'};
 // An ECB modeled spot rate cannot be treated as a quoted coupon-bond benchmark.
 if(a.yieldType!==b.yieldType||a.yieldType==='unclassified')return {status:'not_comparable',reason:'Incompatible yield definitions: government benchmarks and modeled zero-coupon spot rates'};
 if(daysBetween(a.date,b.date)>3)return {status:'not_comparable',reason:'Observation dates differ by more than 3 days'};
 return {status:'current',baseDate:a.date,quoteDate:b.date,spreadBp:Math.round((a.yields[tenor]-b.yields[tenor])*1000)/10,yieldType:a.yieldType};
}
export function coverageReport(snapshot,now=new Date().toISOString()){
 return Object.fromEntries(YIELD_CURRENCIES.map(code=>{
 const v=snapshot?.currencies?.[code],c=curveAt(v,now);
 return [code,{status:c.status,asOf:c.date,ageDays:c.ageDays??null,slopeBp:c.status==='current'?c.slopeBp:null,sevenDayChangeBp:c.status==='current'?historySlopeChange(c.history,7,c.date):null,thirtyDayChangeBp:c.status==='current'?historySlopeChange(c.history,30,c.date):null,ninetyDayChangeBp:c.status==='current'?historySlopeChange(c.history,90,c.date):null,yieldType:c.yieldType||null,source:c.source||null,reason:snapshot?.failures?.[code]||null}];
 }));
}
