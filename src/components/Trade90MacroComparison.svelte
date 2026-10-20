<script>
 import {onMount} from 'svelte';
 import {macroMetrics,periodLabel,isStale,chartData} from '../lib/trade90-macro.js';
 export let base; export let quote; export let initialData;
 let data=initialData;let years=5;let refreshError=false;
 $: currencies=[base,quote];
 $: countries=currencies.map(c=>data?.countries?.[c]);
 $: charts=macroMetrics.map(metric=>{const series=countries.map(c=>c?.series?.[metric.key]);return {...metric,series,chart:chartData(series,years)};});
 onMount(async()=>{try{const r=await fetch('/data/macro-history.json',{cache:'no-cache'});if(!r.ok)throw Error();const next=await r.json();if(next.schemaVersion!==1||!next.countries)throw Error();data=next;}catch{refreshError=true;}});
 const percent=value=>`${value.toFixed(2)}%`;
</script>
<div class="macro">
 <div class="macro-heading"><div><span class="kicker">ECONOMIC COMPARISON</span><h2>{countries[0]?.name || base} vs {countries[1]?.name || quote}</h2><p>Compare inflation, jobs and growth behind {base}/{quote}.</p></div>
 <div class="ranges" role="group" aria-label="Economic history range">{#each [1,3,5,10] as n}<button type="button" aria-pressed={years===n} on:click={()=>years=n}>{n}Y</button>{/each}</div></div>
 <p class="context">Published economic observations, not live prices. Each line keeps its original reporting frequency. Missing observations are not estimated.</p>
 {#if refreshError}<p role="status">Showing the saved data snapshot; the refresh could not be checked.</p>{/if}
 {#each charts as item}
 <article class="macro-card">
  <h3>{item.title}</h3><p class="unit">{item.unit}</p>
  <div class="legend">
   {#each item.series as s,i}<div class:base-series={i===0} class:quote-series={i===1}>
    <span class="legend-name"><i aria-hidden="true"></i>{countries[i]?.name || currencies[i]} · {currencies[i]}</span>
    {#if s?.points?.length}<strong>{percent(s.points.at(-1).value)}</strong><span>{periodLabel(s.points.at(-1).date,s.frequency)} · {s.frequency}</span>
     {#if isStale(s)}<b class="warning">Older series — latest available observation</b>{/if}
     {#if s.status==='stale'}<b class="warning">Provider history is stale · excluded from model</b>{/if}
     {#if s.status==='refresh_failed'}<b class="warning">Refresh failed · saved history</b>{/if}
    {:else}<strong>Unavailable</strong><span>No verified history available.</span>{/if}
   </div>{/each}
  </div>
  {#if item.chart.lines.some(line=>line.length)}
  <div class="plot"><svg viewBox="0 0 870 264" role="img" aria-label={`${item.title}: ${countries[0]?.name} and ${countries[1]?.name}, past ${years} years. Exact observations in the data table below.`}>
   {#each item.chart.ticks as tick}<line x1="58" x2="838" y1={item.chart.y(tick)} y2={item.chart.y(tick)} class="grid"/><text x="49" y={item.chart.y(tick)+4} text-anchor="end">{tick.toFixed(1)}%</text>{/each}
   <line x1="58" x2="838" y1={item.chart.y(0)} y2={item.chart.y(0)} class="zero"/>
   {#each item.chart.dates as date,i}<text x={item.chart.x(date)} y="249" text-anchor={i===0?'start':i===4?'end':'middle'}>{new Date(date+'T00:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'2-digit',timeZone:'UTC'})}</text>{/each}
   {#each item.chart.paths as path,i}<path d={path} class:line-base={i===0} class:line-quote={i===1}/>{/each}
   {#each item.chart.lines as line,i}{#each line as point}<circle cx={item.chart.x(point.date)} cy={item.chart.y(point.value)} r="3" class:dot-base={i===0} class:dot-quote={i===1}><title>{countries[i]?.name}: {periodLabel(point.date,item.series[i]?.frequency)} · {percent(point.value)}</title></circle>{/each}{/each}
  </svg></div>
  {:else}<p class="empty">No observations in this time range. Choose a longer range to view older history.</p>{/if}
  <p class="method">{item.note}</p>
  <details><summary>Sources &amp; exact observations</summary>
   <div class="tables">{#each item.series as s,i}<div><h4>{countries[i]?.name || currencies[i]}</h4><p><a href={s?.sourceUrl} target="_blank" rel="noopener noreferrer">{s?.source || 'Provider'} · {s?.provider || 'FRED'} ↗</a></p><p>{s?.sourceTitle || 'History unavailable'}{s?.transform ? ` · Trade90 calculates ${s.transform==='yoy'?'year-on-year':'quarter-on-quarter'} percentage change from the source index.`:''}</p><p>Provider updated: {s?.sourceUpdated || 'Not supplied by provider'}<br/>Retrieved: {s?.retrievedAt?.slice(0,10) || 'Unavailable'}</p>
    <div class="table-scroll"><table><caption>{countries[i]?.name} {item.title.toLowerCase()} — selected range</caption><thead><tr><th>Period</th><th>Value</th></tr></thead><tbody>{#each [...item.chart.lines[i]].reverse() as point}<tr><td>{periodLabel(point.date,s.frequency)}</td><td>{percent(point.value)}</td></tr>{/each}</tbody></table></div></div>{/each}</div>
  </details>
 </article>
 {/each}
 <p class="context">Sources: OECD, Eurostat and the U.S. Bureau of Labor Statistics, retrieved through official OECD and Eurostat APIs or the Federal Reserve Bank of St. Louis (FRED). Data may be revised. Refresh check: {data?.checkedAt?.slice(0,10) || 'not yet available'}. Higher or lower readings alone do not determine currency direction.</p>
</div>
<style>
 .macro{padding:24px;color:var(--ink);background:var(--surface)}.macro-heading{display:flex;justify-content:space-between;gap:20px;align-items:center}.kicker{color:var(--blue);font-size:.75rem;font-weight:800;letter-spacing:.08em}.macro h2{font-size:1.5rem;margin:5px 0}.macro p{color:var(--muted);margin:6px 0;font-size:.9rem}.ranges{display:flex;gap:4px;flex-shrink:0}.ranges button{border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:7px;padding:9px 12px;cursor:pointer}.ranges button[aria-pressed=true]{background:var(--ink);color:var(--surface)}.macro .context{font-size:.82rem;margin:14px 0}.macro-card{border-top:1px solid var(--line);padding:25px 0 10px}.macro h3{font-size:1.2rem;margin:0}.macro .unit{font-size:.82rem}.legend{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.legend>div{display:flex;flex-direction:column;gap:3px}.legend-name{font-size:.9rem;font-weight:650}.legend i{display:inline-block;width:20px;height:3px;background:#60a5fa;margin-right:7px;vertical-align:middle}.quote-series i{background:#fb923c}.legend strong{font-size:1.5rem;font-variant-numeric:tabular-nums}.legend span:not(.legend-name){color:var(--muted);font-size:.8rem}.warning{font-size:.75rem;font-weight:600;color:var(--ink)}.plot{margin:18px 0 4px}.plot svg{width:100%;display:block;min-height:180px}.plot text{fill:var(--muted);font-size:13px}.grid{stroke:var(--line);stroke-width:1}.zero{stroke:var(--muted);stroke-dasharray:3 5;opacity:.5}.plot path{fill:none;stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}.line-base{stroke:#60a5fa}.line-quote{stroke:#fb923c;stroke-dasharray:7 3}.dot-base{fill:#60a5fa}.dot-quote{fill:#fb923c}.macro .method{font-size:.8rem}.macro details{margin:12px 0;font-size:.85rem}.macro summary{cursor:pointer;color:var(--blue);padding:8px 0}.tables{display:grid;grid-template-columns:1fr 1fr;gap:24px}.tables h4{margin:8px 0}.tables p{font-size:.78rem}.table-scroll{max-height:230px;overflow:auto;margin:12px 0}.macro table{border-collapse:collapse;width:100%;font-size:.85rem}.macro th,.macro td{text-align:left;border-bottom:1px solid var(--line);padding:7px}.macro caption{text-align:left;font-size:.75rem}.empty{padding:30px 0}
 :global(html[data-theme="light"]) .line-base{stroke:#1d4ed8}:global(html[data-theme="light"]) .dot-base,:global(html[data-theme="light"]) .base-series i{fill:#1d4ed8;background:#1d4ed8}:global(html[data-theme="light"]) .line-quote{stroke:#c2410c}:global(html[data-theme="light"]) .dot-quote,:global(html[data-theme="light"]) .quote-series i{fill:#c2410c;background:#c2410c}
 @media(max-width:600px){.macro{padding:16px}.macro-heading{align-items:flex-start;flex-direction:column;gap:12px}.macro h2{font-size:1.25rem}.ranges button{min-width:48px}.legend{gap:10px}.legend-name{font-size:.78rem}.tables{grid-template-columns:1fr}.plot svg{min-height:140px}.plot text{font-size:17px}}
</style>
