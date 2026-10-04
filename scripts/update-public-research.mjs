import { writeFile } from 'node:fs/promises';

const TERMINAL_URL = 'https://raw.githubusercontent.com/tilershub/usdjpy-research-lab/main/public/terminal-snapshot.json';
const CONTEXT_URL = 'https://raw.githubusercontent.com/tilershub/usdjpy-research-lab/main/public/research-context.json';

function finite(v){ return typeof v === 'number' && Number.isFinite(v); }
async function fetchJson(url){
  const res = await fetch(url, { headers:{accept:'application/json'} });
  if(!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
}
function technical(pair){
  const rows=(pair.history||[]).filter(r=>finite(r.close)&&r.close>0);
  if(rows.length<21) return {trend:'Unavailable',change20:null,volatilityRank:null,historyDate:rows.at(-1)?.date??null};
  const last=rows.at(-1);
  const returns=rows.slice(1).map((r,i)=>r.close/rows[i].close-1);
  const sd=arr=>{
    if(arr.length<2) return 0;
    const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
    return Math.sqrt(arr.reduce((a,b)=>a+(b-mean)**2,0)/(arr.length-1));
  };
  const recent=sd(returns.slice(-20));
  const windows=returns.slice(19).map((_,i)=>sd(returns.slice(i,i+20)));
  return {
    trend:finite(last.ema_fast)&&finite(last.ema_slow)
      ? (last.ema_fast>last.ema_slow?'EMA 20 above EMA 50':last.ema_fast<last.ema_slow?'EMA 20 below EMA 50':'Moving averages equal')
      : 'Moving averages unavailable',
    change20:last.close/rows.at(-21).close-1,
    volatilityRank:windows.length?windows.filter(x=>x<=recent).length/windows.length:null,
    historyDate:last.date??null
  };
}
function countries(symbol){ return symbol==='USD/JPY'?['US','JP','Global']:['US','Global']; }
function position(context,symbol){
  const [base,quote]=symbol.split('/');
  const rows=(context.positioning||[]).filter(x=>[base,quote].includes(x.currency)&&x.available);
  const crowded=rows.find(x=>x.crowding&&x.crowding!=='Balanced');
  const x=crowded||rows[0];
  return x?{label:x.crowding||'Available',currency:x.currency,date:x.date,stale:!!x.stale}:null;
}

const [terminal,context] = await Promise.all([fetchJson(TERMINAL_URL),fetchJson(CONTEXT_URL)]);
if(terminal?.schema_version!==1 || !Array.isArray(terminal?.pairs)) throw new Error('Invalid terminal snapshot');
if(context?.schema_version!==1 || !Array.isArray(context?.indicators)) throw new Error('Invalid research context');

const out={
  schema_version:1,
  generated_at:new Date().toISOString(),
  terminal_generated_at:terminal.generated_at,
  context_generated_at:context.generated_at,
  markets:{}
};

for(const pair of terminal.pairs){
  const tech=technical(pair);
  const indicators=context.indicators.filter(r=>countries(pair.symbol).includes(r.country));
  out.markets[pair.symbol]={
    symbol:pair.symbol,
    slug:pair.symbol.replace('/','').toLowerCase(),
    asset_class:pair.asset_class,
    decimals:pair.decimals,
    research_price:finite(pair.live_price)?pair.live_price:finite(pair.price)?pair.price:null,
    research_price_at:pair.live_price_at??pair.quality?.last_price??null,
    structure:tech.trend,
    change20:tech.change20,
    volatility_percentile:tech.volatilityRank,
    history_date:tech.historyDate,
    event_risk:pair.events?.risk?.level??'Unknown',
    next_event:pair.events?.risk?.next_event??null,
    event_hours:finite(pair.events?.risk?.hours)?pair.events.risk.hours:null,
    positioning:position(context,pair.symbol),
    macro_available:indicators.filter(r=>r.status==='available'&&finite(r.value)).length,
    macro_total:indicators.length,
    macro_context:pair.symbol==='USD/JPY'
      ? 'US + Japan + global'
      : pair.symbol==='XAU/USD'
        ? 'US + global; gold-specific flow coverage limited'
        : pair.symbol==='BTC/USD'
          ? 'US + global; crypto venue-flow coverage limited'
          : 'US + global; second-economy coverage incomplete',
    quality_grade:pair.quality?.grade??null,
    completeness:finite(pair.quality?.completeness)?pair.quality.completeness:null
  };
}

await writeFile('src/data/public-research.json', JSON.stringify(out,null,2)+'\n', 'utf8');
console.log(`Updated public research snapshot for ${Object.keys(out.markets).length} markets at ${out.generated_at}`);
