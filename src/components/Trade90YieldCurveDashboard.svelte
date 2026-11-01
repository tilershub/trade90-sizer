<script>
 import data from '../data/trade90-yield-curves.json';
 const codes=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
 const names={USD:'United States',EUR:'Euro area',GBP:'United Kingdom',JPY:'Japan',AUD:'Australia',NZD:'New Zealand',CAD:'Canada',CHF:'Switzerland'};
 const params=typeof window==='undefined'?null:new URLSearchParams(window.location.search);
 let currency=params&&codes.includes(params.get('currency'))?params.get('currency'):'USD';
 let compare=params&&codes.includes(params.get('quote'))?params.get('quote'):'';
 let windowDays='90';
 const today=Date.parse(new Date().toISOString().slice(0,10)+'T00:00:00Z');
 const age=x=>x?.asOf?Math.floor((today-Date.parse(x.asOf+'T00:00:00Z'))/86400000):null;
 const valid=x=>x?.verified===true&&x?.yields&&Number.isFinite(x.yields['2Y'])&&Number.isFinite(x.yields['10Y'])&&Number.isFinite(age(x))&&age(x)>=0&&age(x)<=(x.frequency==='monthly'?50:x.frequency==='weekly_publication'?12:7);
 const bp=v=>Number.isFinite(v)?(v>0?'+':'')+Math.round(v)+' bp':'—';
 const pct=v=>Number.isFinite(v)?v.toFixed(2)+'%':'—';
 const getRows=x=>(x?.history||[]).filter(r=>r&&Number.isFinite(r['2Y'])&&Number.isFinite(r['10Y'])).sort((a,b)=>a.date.localeCompare(b.date));
 const trend=(x,n)=>{const rows=getRows(x),last=rows.at(-1),prior=[...rows].reverse().find(r=>r.date<=new Date(Date.parse(last?.date||'1970-01-01')-n*86400000).toISOString().slice(0,10));return last&&prior?(last['10Y']-last['2Y']-prior['10Y']+prior['2Y'])*100:null};
 function graph(series){
  if(series.length<2)return '';
  const vals=series.flatMap(s=>[s['2Y'],s['10Y']]);
  const low=Math.min(...vals)-0.2,high=Math.max(...vals)+0.2;
  return ['2Y','10Y'].map((key,i)=>({name:key,color:i===0?'#60a5fa':'#34d399',points:series.map((r,j)=>{const x=18+(j/(series.length-1))*664,y=171-((r[key]-low)/Math.max(.01,high-low))*144;return x.toFixed(1)+','+y.toFixed(1)}).join(' ')}));
 }
 $: current=data.currencies?.[currency]||null;
 $: context=data.health?.[currency]||null;
 $: other=compare&&compare!==currency?data.currencies?.[compare]||null:null;
 $: dateCut=new Date(today-Number(windowDays)*86400000).toISOString().slice(0,10);
 $: rows=getRows(current).filter(r=>r.date>=dateCut);
 $: curves=graph(rows);
 $: instrumentsCompatible=Boolean(current?.kind&&other?.kind&&current.kind===other.kind);
 $: matched=valid(current)&&valid(other)&&instrumentsCompatible&&Math.abs(Date.parse(current.asOf)-Date.parse(other.asOf))<=3*86400000;
 $: compare2=matched?(current.yields['2Y']-other.yields['2Y'])*100:null;
 $: compare10=matched?(current.yields['10Y']-other.yields['10Y'])*100:null;
 $: spread=valid(current)?(current.yields['10Y']-current.yields['2Y'])*100:null;
 $: slope7=valid(current)?trend(current,7):null;
 $: slope30=valid(current)?trend(current,30):null;
 $: slope90=valid(current)?trend(current,90):null;
 $: insufficient=valid(current)&&rows.length<2;
 $: level=valid(current)?(spread>10?'Upward sloping':spread< -10?'Inverted':'Approximately flat'):'Unavailable';
</script>

<section class="dashboard" aria-label="Yield curve country and spread analysis">
 <div class="controls">
  <label>Country / currency
   <select bind:value={currency} aria-label="Yield curve country">{#each codes as code}<option value={code}>{code} · {names[code]}</option>{/each}</select>
  </label>
  <label>Compare against
   <select bind:value={compare} aria-label="Compare country"><option value="">None</option>{#each codes.filter(c=>c!==currency) as code}<option value={code}>{code} · {names[code]}</option>{/each}</select>
  </label>
  <label>History window
   <select bind:value={windowDays} aria-label="Historical window"><option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option></select>
  </label>
 </div>
 <div class="market-note"><b>{currency} — {names[currency]}</b> · {current?.provider||'Source not yet verified'} · {current?.kind?.replaceAll('_',' ')||'Yield unavailable'} · {current?.frequency?.replaceAll('_',' ')||'—'} · <span>{valid(current)?'Verified observation':'Awaiting current verified data'}</span>{#if current?.asOf} · Observed {current.asOf} ({age(current)} days ago){/if}</div>
 <div class="metrics">
  <div><span>2-year sovereign yield</span><strong>{pct(valid(current)?current.yields['2Y']:null)}</strong></div>
  <div><span>10-year sovereign yield</span><strong>{pct(valid(current)?current.yields['10Y']:null)}</strong></div>
  <div><span>10Y − 2Y slope</span><strong>{bp(spread)}</strong><small>{level}</small></div>
 </div>
 {#if context?.error}<p class="data-warning">Latest source retrieval: {context.error}. The dashboard does not substitute an estimate for a missing or unverified quote.</p>{/if}
 <section class="trend">
  <div class="section-heading"><h3>Historical 2Y and 10Y yield observations</h3><span>Yield % per annum · {windowDays} days</span></div>
  {#if valid(current)&&!insufficient}
   <svg viewBox="0 0 700 200" role="img" aria-label="{currency} 2-year and 10-year sovereign yield observations over {windowDays} days" preserveAspectRatio="xMidYMid meet">
    <path d="M18 176 H682" stroke="#64748b" stroke-width="1" opacity=".65"/>
    {#each curves as line}<polyline fill="none" points={line.points} stroke={line.color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>{/each}
    <text x="18" y="195" fill="#94a3b8" font-size="11">{rows[0]?.date||''}</text><text x="682" y="195" text-anchor="end" fill="#94a3b8" font-size="11">{rows.at(-1)?.date||''}</text>
   </svg>
   <p class="legend"><span class="two">● 2Y</span> <span class="ten">● 10Y</span> · {rows.length} published observations</p>
  {:else}
   <p class="empty">Historical chart unavailable. {valid(current)?'At least two dated observations are required.':'The selected currency lacks a currently verified source pair.'} <a href="/data-policy/">View source verification status</a>.</p>
  {/if}
 </section>
 <section class="changes"><h3>Change in the curve slope</h3><div class="change-grid"><div><span>7-day change</span><strong>{bp(slope7)}</strong></div><div><span>30-day change</span><strong>{bp(slope30)}</strong></div><div><span>90-day change</span><strong>{bp(slope90)}</strong></div></div><p>Changes are displayed only when the requested period has an observed starting value; missing historical periods are never assigned zero.</p></section>
 {#if compare}
 <section class="cross"><h3>{currency} − {compare} sovereign yield spreads</h3>
 {#if matched}<div class="change-grid"><div><span>2-year spread</span><strong>{bp(compare2)}</strong></div><div><span>10-year spread</span><strong>{bp(compare10)}</strong></div><div><span>Observation dates</span><strong>{current.asOf} / {other.asOf}</strong></div></div><p>These government yield measures may use different instruments, methodologies and compounding; the comparison is research context, not an identical-instrument or policy-path spread.</p>
 {:else}<p class="empty">A spread is withheld unless both curves are current, from the same yield-definition category, and observed within three days. Benchmark/par/fitted spot measures must not be treated as identical. No value is fabricated.</p>{/if}
 </section>{/if}
 {#if current}<p class="source">Data: <a href={current.source} target="_blank" rel="noopener noreferrer">{current.provider} ↗</a>. Daily or monthly frequency is source-specific. Stale data and retrieval failures are retained as historical context and labelled accordingly.</p>{/if}
</section>
<style>
.dashboard{display:grid;gap:19px}.controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.controls label{font-size:.77rem;color:var(--muted);font-weight:700}.controls select{display:block;width:100%;margin-top:7px;background:var(--soft);border:1px solid var(--line);border-radius:9px;padding:12px;color:var(--ink);min-height:44px}.market-note{font-size:.84rem;line-height:1.7;color:var(--muted)}.market-note b{color:var(--ink)}.metrics,.change-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.metrics>div,.change-grid>div{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:16px;min-width:0}.metrics span,.change-grid span{font-size:.76rem;color:var(--muted);display:block}.metrics strong,.change-grid strong{display:block;font-size:1.42rem;color:var(--ink);margin:7px 0;overflow-wrap:anywhere}.metrics small{color:var(--muted);font-size:.72rem}.trend,.changes,.cross{padding:19px;background:var(--surface);border:1px solid var(--line);border-radius:14px}.trend h3,.changes h3,.cross h3{color:var(--ink);margin:0 0 13px;font-size:1.05rem}.section-heading{display:flex;justify-content:space-between;gap:10px;align-items:center}.section-heading span{font-size:.76rem;color:var(--muted)}svg{display:block;width:100%;height:auto;max-height:270px;background:#101a2b;border-radius:9px}.legend{font-size:.78rem;color:var(--muted)}.legend .two{color:#60a5fa}.legend .ten{color:#34d399}.change-grid strong{font-size:1.2rem}.changes>p,.cross p,.source{font-size:.78rem;color:var(--muted);line-height:1.6}.source a,.empty a{color:var(--blue)}.empty,.data-warning{font-size:.84rem;padding:17px;background:var(--soft);border:1px dashed var(--line);border-radius:10px;color:var(--muted)}@media(max-width:720px){.controls{grid-template-columns:1fr}.metrics,.change-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metrics>div:last-child,.change-grid>div:last-child{grid-column:1/-1}.section-heading{display:block}.trend,.changes,.cross{padding:12px}.metrics>div{padding:12px}}
</style>