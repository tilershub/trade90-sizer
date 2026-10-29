// Display the Fed's published range; keep bank.rate numeric for gap arithmetic.
export const formatPercent=value=>Number(value).toFixed(Number.isInteger(Number(value)*100)?2:3)+'%';
export function displayRate(bank){
 if(bank?.code==='USD'){
  const range=bank.range;
  if(Array.isArray(range)&&range.length===2&&range.every(Number.isFinite)&&range[0]<=range[1])return range.map(formatPercent).join('–');
  return 'Target range unavailable';
 }
 return formatPercent(bank.rate);
}
export const displayBenchmark=bank=>bank.code==='USD'?'Federal funds target range':bank.benchmark;
export const midpointNote=bank=>bank.code==='USD'?'Rate-gap calculations use the '+formatPercent(bank.rate)+' midpoint.':'';
