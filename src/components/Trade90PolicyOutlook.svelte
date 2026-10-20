<script>
 import {onMount} from 'svelte';
 export let initialData; export let symbol;
 let data=initialData;let now=Date.now();
 $: result=data?.pairs?.[symbol];
 $: expired=!data?.generatedAt||now-Date.parse(data.generatedAt)>48*3600000;
 $: state=expired?'unavailable':result?.state||'unavailable';
 $: banks=result?[data.banks[result.base],data.banks[result.quote]]:[];
 const names={widening:'Widening lean',narrowing:'Narrowing lean',unchanged:'Broadly unchanged',unclear:'Direction unclear',unavailable:'Insufficient evidence'};
 const arrows={widening:'↗',narrowing:'↘',unchanged:'→',unclear:'↔',unavailable:'—'};
 const format=v=>Number.isFinite(v)?v.toFixed(2)+'%':'Unavailable';
 onMount(()=>{const timer=setInterval(()=>now=Date.now(),60000);return ()=>clearInterval(timer);});
</script>
<div class="outlook">
 <span class="eyebrow">TRADE90 MODEL · EXPERIMENTAL</span>
 <h2>Policy Divergence Outlook</h2>
 <p>Next 3 months · Economic evidence and reviewed central-bank guidance</p>
 <div class="verdict" class:widening={state==='widening'} class:narrowing={state==='narrowing'}><span aria-hidden="true">{arrows[state]}</span><strong>{names[state]}</strong></div>
 <p>{expired?'This assessment has expired. A fresh model run is required before showing a directional outlook.':result?.reason}</p>
 <p class="meta">Higher-rate currency: <strong>{result?.higher||'Unavailable'}</strong> · Evidence: {state==='unavailable'?'Insufficient':state==='unclear'?'Mixed':'Moderate'} · Predictive accuracy: not yet established</p>
 <div class="banks">{#each banks as bank}{#if bank}<article>
  <h3>{bank.currency} <span>{expired?'Assessment expired':bank.label}</span></h3>
  {#if bank.reasons?.length}<ul>{#each bank.reasons as reason}<li>{reason}</li>{/each}</ul>{/if}
  {#each bank.drivers||[] as driver}<div class="driver"><strong>{driver.metric}: {driver.text}</strong><p>{format(driver.previous.value)} ({driver.previous.date.slice(0,7)}) → {format(driver.latest.value)} ({driver.latest.date.slice(0,7)}) · <a href={driver.source} target="_blank" rel="noopener noreferrer">Source ↗</a></p></div>{/each}
  {#if bank.guidance}<div class="driver"><strong>Official guidance</strong><p>{bank.guidance.guidance}</p><p class="meta">Published {bank.guidance.publishedDate} · Editorial review {bank.guidance.reviewedAt} · <a href={bank.guidance.source} target="_blank" rel="noopener noreferrer">Original statement ↗</a></p></div>{/if}
 </article>{/if}{/each}</div>
 <details><summary>What this model means</summary>
 <p>Version {data?.modelVersion}. An uncalibrated rules-based research outlook, not a market-implied forecast, probability or buy/sell signal. It measures the absolute separation between official policy benchmarks. Both banks leaning the same way is not enough to determine whether the gap widens.</p>
 <p>Headline inflation trends, unemployment changes, two quarters of growth and explicit reviewed forward guidance determine each bank's lean. Conflicting evidence stays mixed. Geopolitical headlines and risk sentiment do not directly change the score: their effects must appear in macroeconomic evidence or official policy interpretation.</p>
 <p>Core inflation, wages, central-bank forecasts and market pricing are not included in v1. Fresh macro data alone cannot validate a forecast. Guidance is source-linked editorial interpretation; new publications are not automatically interpreted by this model.</p>
 <p>Reassessed when the website builds. Macro checks run daily; source failures or expired guidance can withhold the outlook. This card expires after 48 hours without a model rebuild.</p>
 <a href="/policy-model/">Full rules, limitations and version history →</a>
 </details>
 <p class="meta">Model run: {data?.generatedAt?.replace('T',' ').slice(0,19)} UTC · <a href="/data/policy-outlook-history.json">Recorded assessments (JSON)</a></p>
</div>
<style>
.outlook{padding:24px;color:var(--ink);background:var(--surface)}.eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.08em;color:var(--blue)}h2{margin:8px 0;font-size:1.5rem}p{font-size:.9rem;line-height:1.65;color:var(--muted);margin:8px 0}.verdict{display:flex;align-items:center;gap:12px;font-size:1.65rem;padding:17px 0;color:var(--ink)}.verdict>span{font-size:2rem}.widening{color:#059669}.narrowing{color:#dc2626}.meta{font-size:.78rem}.banks{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}article{padding:18px;border:1px solid var(--line);border-radius:10px;background:var(--soft)}h3{font-size:1.05rem;margin:0 0 12px}h3 span{display:block;font-size:.85rem;color:var(--muted);margin-top:5px}.driver{border-top:1px solid var(--line);padding:10px 0}.driver strong{font-size:.85rem}.driver p,li{font-size:.8rem}ul{padding-left:18px;color:var(--muted)}summary{cursor:pointer;font-weight:650;padding:8px 0}a{color:var(--blue)}:global(html[data-theme='dark']) .widening{color:#6ee7b7}:global(html[data-theme='dark']) .narrowing{color:#fca5a5}@media(max-width:650px){.outlook{padding:16px}.banks{grid-template-columns:1fr}.verdict{font-size:1.35rem}}
</style>
