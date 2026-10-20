<script>
 import {onMount} from 'svelte';
 export let initialData; export let symbol;
 let data=initialData;let now=Date.now();
 $: result=data?.pairs?.[symbol];
 $: expired=!Number.isFinite(Date.parse(result?.expiresAt))||now>=Date.parse(result.expiresAt);
 $: state=expired?'unavailable':result?.state||'unavailable';
 $: tone=expired?'neutral':result?.tone||'neutral';
 $: banks=result?[data.banks[result.base],data.banks[result.quote]]:[];
 const names={widening:'Gap expected to widen — bias',narrowing:'Gap expected to narrow — bias',unchanged:'Broadly unchanged — bias',unclear:'Direction uncertain',unavailable:'Insufficient current evidence'};
 const format=v=>Number.isFinite(v)?v.toFixed(2)+'%':'Unavailable';
 const period=(p,f)=>f==='Quarterly'?`${p.date.slice(0,4)} Q${Math.floor((Number(p.date.slice(5,7))-1)/3)+1}`:p.date.slice(0,7);
 onMount(()=>{now=Date.now();const timer=setInterval(()=>now=Date.now(),60000);return ()=>clearInterval(timer);});
</script>
<div class="outlook">
 <span class="eyebrow">TRADE90 RESEARCH · EXPERIMENTAL MODEL {data?.modelVersion}</span>
 <h2>Policy Divergence Outlook</h2>
 <p>Next 90 days · Economic evidence and official central-bank guidance</p>
 <div class="verdict" class:positive={tone==='positive'} class:negative={tone==='negative'}><span aria-hidden="true">{tone==='positive'?'↑':tone==='negative'?'↓':state==='unchanged'?'→':'—'}</span><strong>{names[state]}</strong></div>
 <p>{expired?'This assessment has expired. Current inputs and policy guidance are required before showing a directional outlook.':result?.reason}</p>
 <div class="reading">
  <p><strong>Current signed gap:</strong> {Number.isFinite(result?.signedGap)?`${result.signedGap>0?'+':''}${result.signedGap.toFixed(2)} percentage points`:'Unavailable'} ({result?.base} minus {result?.quote})</p>
  <p><strong>Higher-rate currency:</strong> {result?.higher||'Unavailable'}</p>
  <p><strong>Expected signed-gap movement:</strong> {expired?'Unavailable':result?.signedDirection}</p>
 </div>
 <p class="legend">Green: the signed rate gap moves towards {result?.base}. Red: towards {result?.quote}. Grey: no supported direction. Colours describe policy rates, not exchange-rate forecasts or trade instructions.</p>
 <div class="banks">{#each banks as bank}{#if bank}<article>
  <h3>{bank.currency}<span>{expired?'Assessment expired':bank.label}</span></h3>
  <p><strong>Economic pressure:</strong> {bank.economicPressure}</p>
  <p class="meta">Current input coverage: {bank.coverage?.filter(c=>c.usable).length||0}/{bank.coverage?.length||4} required series · Predictive accuracy not yet established</p>
  {#if bank.framework}<p class="meta"><a href={bank.framework.source} target="_blank" rel="noopener noreferrer">Policy objective ↗</a>: {bank.framework.description}. An inflation objective is not a mechanical rate trigger.</p>{/if}
  {#if bank.reasons?.length}<ul>{#each bank.reasons as reason}<li>{reason}</li>{/each}</ul>{/if}
  {#each bank.drivers||[] as driver}<div class="driver"><strong>{driver.metric}: {driver.text}</strong><p>{format(driver.previous.value)} ({period(driver.previous,driver.frequency)}) → {format(driver.latest.value)} ({period(driver.latest,driver.frequency)}) · <a href={driver.source} target="_blank" rel="noopener noreferrer">Source ↗</a></p></div>{/each}
  {#if bank.guidance}<div class="driver"><strong>Official policy context</strong><p>{bank.guidance.guidance}</p>{#if bank.guidance.assessment}<p>{bank.guidance.assessment.rationale}</p>{/if}<p class="meta">Published {bank.guidance.publishedDate} · Interpretation reviewed {bank.guidance.assessment?.reviewedAt||'Unavailable'} · <a href={bank.guidance.source} target="_blank" rel="noopener noreferrer">Original statement ↗</a></p></div>{/if}
  {#if bank.cautions?.length}<details><summary>Counter-evidence & limitations</summary><ul>{#each bank.cautions as caution}<li>{caution}</li>{/each}</ul></details>{/if}
  <p class="watch"><strong>What could change this?</strong> {bank.watch}</p>
 </article>{/if}{/each}</div>
 <details><summary>How to read this research</summary>
 <p>The model assesses the absolute policy-rate gap; the colour describes movement in the signed first-currency-minus-second-currency gap. A negative gap widening is red; a negative gap narrowing is green. Equal rates can diverge in either direction. Narrowing could eventually cross zero, so the higher-rate currency may reverse.</p>
 <p>Hike-or-hold and cut-or-hold are conditional biases, not promises. An unchanged gap remains possible. If both banks lean the same way, the gap remains uncertain because the relative timing and size of changes are unknown.</p>
 <p>Official inflation objectives, headline and underlying inflation, jobs, growth and reviewed policy statements inform this research. Headlines and risk sentiment are not scored directly. Their expected economic effects can be reflected in official guidance before appearing in released data.</p>
 <p>No numerical future rate gap, probabilities, market-pricing comparison or trading recommendations. Thresholds remain uncalibrated. Wages and a complete set of central-bank forecasts are not included. Underlying inflation measures differ across countries.</p>
 <p>Macro inputs refresh daily. Policy interpretations are dated and expire; discovery of a new publication does not automatically validate an interpretation. Freshness limits cannot guarantee that every newest release has been captured.</p>
 <a href="/policy-model/">Full model rules, sources and version history →</a>
 </details>
 <p class="meta">Model run: {data?.generatedAt?.replace('T',' ').slice(0,19)} UTC · Valid until {result?.expiresAt?.replace('T',' ').slice(0,19)} UTC · <a href="/data/policy-outlook-history.json">Recorded assessments</a></p>
</div>
<style>
.outlook{padding:24px;color:var(--ink);background:var(--surface)}.eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.08em;color:var(--blue)}h2{margin:8px 0;font-size:1.5rem}p{font-size:.9rem;line-height:1.65;color:var(--muted);margin:8px 0}.verdict{display:flex;align-items:center;gap:12px;font-size:1.5rem;padding:17px 0;color:var(--ink)}.verdict>span{font-size:2rem}.positive{color:#047857}.negative{color:#b91c1c}.meta,.legend{font-size:.78rem}.reading{border:1px solid var(--line);border-radius:8px;padding:12px 16px}.banks{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}article{padding:18px;border:1px solid var(--line);border-radius:10px;background:var(--soft);min-width:0}h3{font-size:1.05rem;margin:0 0 12px}h3 span{display:block;font-size:.9rem;color:var(--ink);margin-top:5px}.driver{border-top:1px solid var(--line);padding:10px 0}.driver strong{font-size:.85rem}.driver p,li{font-size:.8rem}ul{padding-left:18px;color:var(--muted)}summary{cursor:pointer;font-weight:650;padding:8px 0}a{color:var(--blue)}.watch{border-top:1px solid var(--line);padding-top:12px}:global(html[data-theme='dark']) .positive{color:#6ee7b7}:global(html[data-theme='dark']) .negative{color:#fca5a5}@media(max-width:650px){.outlook{padding:16px}.banks{grid-template-columns:1fr}.verdict{font-size:1.2rem}.reading{padding:10px}.meta{overflow-wrap:anywhere}}
</style>
