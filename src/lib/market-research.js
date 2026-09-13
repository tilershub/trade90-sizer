export const finite = value => typeof value === 'number' && Number.isFinite(value);
export function safeSource(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
export function contextFresh(context, now = Date.now()) {
  const age = now - Date.parse(context?.generated_at);
  return Number.isFinite(age) && age >= -60000 && age <= 8 * 3600000;
}
export function relevantIndicators(context, symbol) {
  const countries = symbol === 'USD/JPY' ? ['US','JP','Global'] : ['US','Global'];
  return (context?.indicators ?? []).filter(row => countries.includes(row.country));
}
export function technicalConditions(pair) {
  const rows = (pair?.history ?? []).filter(row => finite(row.close) && row.close > 0);
  const empty = {trend:'Unavailable', volatility:null, volatilityRank:null, averageMove:null, low:null, high:null, change20:null, date:null, observations:rows.length};
  if (rows.length < 21) return empty;
  const last = rows.at(-1), tail = rows.slice(-20);
  const returns = rows.slice(1).map((row,i) => row.close / rows[i].close - 1);
  const sd = arr => { const mean=arr.reduce((a,b)=>a+b,0)/arr.length; return Math.sqrt(arr.reduce((a,b)=>a+(b-mean)**2,0)/(arr.length-1)); };
  const recent = sd(returns.slice(-20));
  const windows = returns.slice(19).map((_,i)=>sd(returns.slice(i,i+20)));
  const annualization = pair?.symbol === 'BTC/USD' ? 365 : 252;
  return {trend:finite(last.ema_fast)&&finite(last.ema_slow) ? (last.ema_fast>last.ema_slow?'EMA 20 above EMA 50':last.ema_fast<last.ema_slow?'EMA 20 below EMA 50':'Moving averages equal') : 'Moving averages unavailable',
    volatility:recent*Math.sqrt(annualization), volatilityRank:windows.filter(x=>x<=recent).length/windows.length,
    annualization, rankWindows:windows.length, averageMove:rows.slice(-20).reduce((sum,row,i)=>sum+Math.abs(row.close-rows[rows.length-21+i].close),0)/20,
    low:Math.min(...tail.map(x=>x.close)), high:Math.max(...tail.map(x=>x.close)),
    change20:last.close/rows.at(-21).close-1, date:last.date, observations:rows.length};
}
export function evidenceNotes(context, symbol, now=Date.now()) {
  if (!contextFresh(context,now)) return ['Macro context is unavailable or beyond its refresh window. Check source dates before drawing conclusions.'];
  const rows = relevantIndicators(context,symbol).filter(x=>x.status==='available'&&finite(x.value));
  const notes=[];
  if (symbol==='USD/JPY') {
    const spread=context.comparisons?.find(x=>x.id==='USJP10Y'&&x.status==='available');
    if (spread&&finite(spread.value)) notes.push(`The aligned monthly US–Japan 10-year yield spread is ${spread.value.toFixed(2)} percentage points${finite(spread.change)?`, ${spread.change>0?'wider':spread.change<0?'narrower':'unchanged'} versus the preceding observation`:''}. This is historical context, not today's policy-rate gap.`);
  }
  for (const id of ['DFII10','VIXCLS','DCOILWTICO']) {
    const row=rows.find(x=>x.id===id);
    if (row&&finite(row.change)) notes.push(`${row.label}: ${row.change>0?'increased':row.change<0?'decreased':'unchanged'} versus the previous observation (${row.observed_at?.slice(0,10)}).`);
  }
  return notes.length?notes:['No sufficiently current comparable indicators are available.'];
}
