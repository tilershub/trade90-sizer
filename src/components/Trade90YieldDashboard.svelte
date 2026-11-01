<script>
 import data from '../../src/data/trade90-yield-curves.json';
 import {YIELD_CURRENCIES,curveAt,historySlopeChange,pairYieldSpread} from '../lib/trade90-yield-research.js';
 let selected='USD';
 let compared='CAD';
 let now=new Date().toISOString();
 const labels={USD:'US Treasury',EUR:'Euro area',GBP:'United Kingdom',JPY:'Japan',AUD:'Australia',NZD:'New Zealand',CAD:'Canada',CHF:'Switzerland'};
 $: entry=data.currencies?.[selected];
 $: curve=curveAt(entry,now);
 $: history=curve.history.slice(-100);
 $: allValues=history.flatMap(x=>[x['2Y'],x['10Y']]);
 $: min=allValues.length?Math.min(...allValues)-.25:0;
 $: max=allValues.length?Math.max(...allValues)+.25:1;
 $: denom=Math.max(max-min,.1);
 $: points2=history.map((x,i)=>(20+i*720/Math.max(history.length-1,1)).toFixed(1)+','+(200-(x['2Y']-min)*160/denom).toFixed(1)).join(' ');
 $: points10=history.map((x,i)=>(20+i*720/Math.max(history.length-1,1)).toFixed(1)+','+(200-(x['10Y']-min)*160/denom).toFixed(1)).join(' ');
 $: comparisons=pairYieldSpread(data.currencies?.[selected],data.currencies?.[compared],'2Y',now);
 $: comparisons10=pairYieldSpread(data.currencies?.[selected],data.currencies?.[compared],'10Y',now);
 const pretty=v=>Number.isFinite(v)?(v>0?'+':'')+v.toFixed(1)+' bp':'Not enough observations';
 const percent=v=>Number.isFinite(v)?v.toFixed(2)+'%':'Not available';
 const view=v=>v==='current'?'Current observed data':v==='stale'?'Historical / stale':'Not connected';
</script>
<section class="yield-dashboard" aria-label="Yield curve dashboard">
 <div class="currency-list" role="group" aria-label="Choose country yield curve">
  {#each YIELD_CURRENCIES as currency}
   <button type="button" class:selected={selected===currency} aria-pressed={selected===currency} on:click={()=>selected=currency}>
    <strong>{currency}</strong><span>{view(curveAt(data.currencies?.[currency],now).status)}</span>
   </button>
  {/each}
 </div>
 <div class="panel">
  <div class="heading"><div><h2>{selected} · {labels[selected]} yield curve</h2><p>{entry?.definition||'Waiting for an approved 2-year and 10-year government bond data source.'}</p></div><span class="status">{view(curve.status)}</span></div>
  {#if curve.status==='current'||curve.status==='stale'}
   <div class="metrics">
    <div><small>2-year yield</small><strong>{percent(curve.yields['2Y'])}</strong></div>
    <div><small>10-year yield</small><strong>{percent(curve.yields['10Y'])}</strong></div>
    <div><small>10Y minus 2Y slope</small><strong>{pretty(curve.slopeBp)}</strong></div>
   </div>
   <div class="moves">
    <div><small>7-day slope change</small><strong>{pretty(historySlopeChange(curve.history,7,curve.date))}</strong></div>
    <div><small>30-day slope change</small><strong>{pretty(historySlopeChange(curve.history,30,curve.date))}</strong></div>
    <div><small>90-day slope change</small><strong>{pretty(historySlopeChange(curve.history,90,curve.date))}</strong></div>
   </div>
   {#if history.length>=2}
    <div class="chart-container">
     <svg viewBox="0 0 760 230" role="img" aria-label={'Historical 2-year and 10-year yields for '+labels[selected]}>
      <path d="M20 40 V200 H740" stroke="currentColor" stroke-opacity=".26" fill="none"/>
      <polyline points={points2} stroke="#60a5fa" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points={points10} stroke="#34d399" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="22" y="26" font-size="13" fill="currentColor">{max.toFixed(2)}%</text>
      <text x="22" y="222" font-size="13" fill="currentColor">{history[0].date}</text>
      <text x="620" y="222" font-size="13" fill="currentColor">{history.at(-1).date}</text>
     </svg>
     <div class="legend"><span><i class="two"></i> 2Y</span><span><i class="ten"></i> 10Y</span></div>
    </div>
   {:else}
    <p class="notice">Only one dated observation is available. A historical trend cannot be calculated until more source-verified data is collected.</p>
   {/if}
   <p class="source">Observation date <strong>{curve.date}</strong>{curve.status==='stale'?' · Historical value, not current pricing':''}. Source: <a href={entry.source} target="_blank" rel="noopener noreferrer">{entry.provider} ↗</a>. Yields are observed market rates, not future policy-rate forecasts.</p>
  {:else}
   <div class="pending"><strong>No current verified yield curve for {selected}.</strong><p>We do not substitute estimated yields or unrelated bonds. Source configuration and observation dates are tracked in the <a href="/data-policy/">research data-status page</a>.</p></div>
  {/if}
 </div>
 <div class="panel compare">
  <h2>Compare government yields across currencies</h2>
  <label for="yield-compare">Compare {selected} against</label>
  <select id="yield-compare" bind:value={compared}>
   {#each YIELD_CURRENCIES.filter(code=>code!==selected) as code}<option value={code}>{code} · {labels[code]}</option>{/each}
  </select>
  {#if compared===selected}
   <p>Select another currency to compare.</p>
  {:else if comparisons.status==='current'&&comparisons10.status==='current'}
   <div class="compare-values"><strong>2Y differential: {pretty(comparisons.spreadBp)}</strong><strong>10Y differential: {pretty(comparisons10.spreadBp)}</strong></div>
   <p>Observation dates: {comparisons.baseDate} vs {comparisons.quoteDate}. These are observed bond-market differentials, not central-bank policy-rate differences.</p>
  {:else}
   <p>{comparisons.reason||'The selected bond series cannot be compared reliably yet.'} Choose matching observed market conventions and dates before interpreting any spread.</p>
  {/if}
  <p>Bond-yield changes can reflect term premiums, liquidity, inflation and growth expectations. They are not mechanically equivalent to central-bank rate expectations or FX returns.</p>
 </div>
</section>
<style>
.yield-dashboard{display:grid;gap:18px}.currency-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.currency-list button{border:1px solid #334155;background:#111c30;color:#e2e8f0;text-align:left;border-radius:12px;padding:13px;cursor:pointer;min-width:0}.currency-list button.selected{background:#1d3a59;border-color:#60a5fa;box-shadow:inset 0 0 0 1px #60a5fa}.currency-list strong,.currency-list span{display:block}.currency-list strong{font-size:1rem}.currency-list span{color:#b8c7d7;font-size:.7rem}.panel{background:#111c30;border:1px solid #334155;border-radius:14px;padding:20px}.heading{display:flex;justify-content:space-between;gap:18px}.panel h2{color:#f8fafc;font-size:1.25rem;margin:0 0 10px}.panel p{font-size:.83rem;line-height:1.65;color:#cbd5e1}.status{color:#bfdbfe;font-size:.77rem;white-space:nowrap}.metrics,.moves{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}.metrics>div,.moves>div{padding:13px;border:1px solid #334155;border-radius:10px;background:#142238}.metrics small,.moves small{display:block;font-size:.73rem;color:#b8c7d7}.metrics strong,.moves strong{font-size:1.35rem;color:#f8fafc}.moves strong{font-size:.98rem}.chart-container{border:1px solid #334155;border-radius:12px;padding:10px;overflow:hidden}.chart-container svg{max-width:100%;display:block}.legend{display:flex;gap:20px;font-size:.75rem;color:#cbd5e1}.legend i{width:12px;height:3px;display:inline-block;vertical-align:middle;margin-right:5px}.legend .two{background:#60a5fa}.legend .ten{background:#34d399}.source{margin-bottom:0}.source a,.pending a{color:#bfdbfe}.pending{background:#152238;border:1px dashed #475569;border-radius:10px;padding:18px}.pending strong{color:#e2e8f0}.compare label{font-size:.83rem;margin-right:12px}.compare select{background:#0f172a;border:1px solid #64748b;color:#fff;border-radius:9px;padding:9px;max-width:100%}.compare-values{display:flex;gap:18px;flex-wrap:wrap;margin:15px 0;color:#f8fafc;font-size:.9rem}@media(max-width:650px){.currency-list{grid-template-columns:repeat(2,minmax(0,1fr))}.panel{padding:14px}.heading{display:block}.status{display:block;margin:6px 0}.metrics,.moves{grid-template-columns:repeat(2,minmax(0,1fr))}.metrics strong{font-size:1.14rem}}
:global(html[data-theme="light"]) .currency-list button,:global(html[data-theme="light"]) .panel,:global(html[data-theme="light"]) .metrics>div,:global(html[data-theme="light"]) .moves>div{background:#fff;color:#0f172a;border-color:#cbd5e1}
:global(html[data-theme="light"]) .currency-list button.selected{background:#dbeafe;border-color:#2563eb}
:global(html[data-theme="light"]) .panel h2,:global(html[data-theme="light"]) .metrics strong,:global(html[data-theme="light"]) .moves strong{color:#0f172a}
:global(html[data-theme="light"]) .panel p,:global(html[data-theme="light"]) .currency-list span,:global(html[data-theme="light"]) .metrics small,:global(html[data-theme="light"]) .moves small{color:#475569}
:global(html[data-theme="light"]) .compare select{background:#fff;color:#0f172a}
</style>