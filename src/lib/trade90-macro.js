export const macroMetrics = [
 {key:'inflation',title:'Inflation',unit:'Headline CPI · year-on-year %',note:'National headline CPI; euro area uses HICP. Baskets and national methods differ. Quarterly readings remain quarterly.'},
 {key:'unemployment',title:'Unemployment',unit:'% of labour force · seasonally adjusted',note:'Labour-force survey measure. Euro-area unemployment uses Eurostat’s 21-country aggregate. Switzerland and New Zealand report quarterly; other economies report monthly. UK observations are rolling three-month averages dated to the middle month; age coverage can differ.'},
 {key:'gdp',title:'Real GDP growth',unit:'Quarter-on-quarter % · seasonally adjusted',note:'Real output growth from the previous quarter, not annualised. Euro area uses the 21-country aggregate. Revisions may change historical values.'}
];
export function periodLabel(date,frequency){
 if(!date)return 'Unavailable';
 return frequency==='Quarterly'?`${date.slice(0,4)} Q${Math.floor((Number(date.slice(5,7))-1)/3)+1}`:new Date(date+'T00:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'});
}
export function isStale(series,now=Date.now()){
 const last=series?.points?.at(-1);return !!last && now-Date.parse(last.periodEnd||last.date)>(series.frequency==='Quarterly'?240:120)*86400000;
}
export function chartData(series,years,now=Date.now()){
 const end=now,start=new Date(now); start.setUTCFullYear(start.getUTCFullYear()-years);
 const from=start.getTime();
 const lines=series.map(s=>(s?.points||[]).filter(p=>Date.parse(p.date)>=from&&Date.parse(p.date)<=end));
 const all=lines.flat().map(p=>p.value);let min=Math.min(0,...all),max=Math.max(0,...all);
 const pad=(max-min||1)*.1;min-=pad;max+=pad;
 const x=d=>58+(Date.parse(d)-from)/(end-from)*780;
 const y=v=>220-(v-min)/(max-min)*184;
 const paths=lines.map((points,i)=>{
  let previous=null;
  return points.map(p=>{const time=Date.parse(p.date), gap=previous!==null&&time-previous>(series[i]?.frequency==='Quarterly'?110:40)*86400000;const command=previous===null||gap?'M':'L';previous=time;return `${command}${x(p.date).toFixed(2)},${y(p.value).toFixed(2)}`;}).join(' ');
 });
 return {lines,paths,x,y,ticks:Array.from({length:5},(_,i)=>min+(max-min)*i/4),dates:Array.from({length:5},(_,i)=>new Date(from+(end-from)*i/4).toISOString().slice(0,10))};
}
