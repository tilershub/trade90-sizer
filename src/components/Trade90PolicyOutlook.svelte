<script>
 import {onMount} from 'svelte';
 export let initialData; export let symbol; export let evidenceOnly=false;
 let data=initialData,now=Date.now();
 $: result=data?.pairs?.[symbol];
 $: expired=!Number.isFinite(Date.parse(result?.expiresAt))||now>=Date.parse(result.expiresAt);
 $: state=expired?'unavailable':result?.state||'unavailable';
 $: banks=result?[data?.banks?.[result.base],data?.banks?.[result.quote]]:[];
 const names={widening:'Rate gap may widen',narrowing:'Rate gap may narrow',unchanged:'Broadly unchanged bias',unclear:'Direction remains uncertain',unavailable:'Current outlook unavailable'};
 const labels={widening:'Widening bias',narrowing:'Narrowing bias',unchanged:'Unchanged bias',unclear:'Uncertain',unavailable:'Unavailable'};
 const rate=value=>Number.isFinite(value)?value.toFixed(2)+'%':'Unavailable';
 const bp=value=>Number.isFinite(value)?(value>0?'+':'')+Number((value*100).toFixed(2))+' bp':'Unavailable';
 const when=value=>value?value.replace('T',' ').slice(0,16)+' UTC':'Unavailable';
 const period=(point,frequency)=>!point?'—':frequency==='Quarterly'?point.date.slice(0,4)+' Q'+(Math.floor((Number(point.date.slice(5,7))-1)/3)+1):point.date.slice(0,7);
 onMount(()=>{now=Date.now();const timer=setInterval(()=>now=Date.now(),300000);return ()=>clearInterval(timer);});
</script>
<div class="outlook">
 {#if evidenceOnly}
 <div class="heading">
  <div><span class="eyebrow">SOURCE-LINKED RESEARCH · HOW THE MODEL REACHED THIS VIEW</span>
   <h2>{result?.base}/{result?.quote} · Economic drivers and central-bank evidence</h2>
   <p>Underlying policy assessments, offsetting risks, observation periods and official publication links.</p>
  </div>
  <a class="method-link" href="/policy-model/">Model methodology ↗</a>
 </div>
 {:else}
 <div class="heading">
  <div>
   <span class="eyebrow">TRADE90 POLICY RESEARCH · EXPERIMENTAL {data?.modelVersion}</span>
   <h2>{result?.base}/{result?.quote} Policy Divergence Outlook</h2>
   <p>Conditional 90-day assessment · Official economic data and central-bank statements</p>
  </div>
  <a class="method-link" href="/policy-model/">Model methodology ↗</a>
 </div>
 {/if}
 {#if !evidenceOnly}
 <div class="verdict" class:wide={state==='widening'} class:narrow={state==='narrowing'} class:uncertain={state==='unclear'||state==='unavailable'}>
  <div class="verdict-top"><div><span class="eyebrow">90-DAY RATE DIFFERENCE</span><h3>{names[state]}</h3></div><span class="state-label">{labels[state]}</span></div>
  <p class="reason">{expired?'This assessment has expired. Updated inputs and reviewed bank guidance are required before showing a direction.':result?.reason||'Not enough current information to evaluate relative policy changes.'}</p>
  <div class="metrics">
   <div><span>Official rate gap today</span><strong>{bp(result?.signedGap)}</strong><small>{result?.base} minus {result?.quote}</small></div>
   <div><span>Higher current benchmark</span><strong>{result?.higher||'Unavailable'}</strong><small>Selected central-bank rates</small></div>
   <div><span>Gap movement</span><strong>{expired?'Unavailable':state==='widening'?'Possibly wider':state==='narrowing'?'Possibly narrower':state==='unchanged'?'Broadly stable':'Unresolved'}</strong><small>Direction only · no rate-size estimate</small></div>
  </div>
 </div>
 <div class="interpretation">
  <strong>How to interpret this result</strong>
  {#if !expired && (state==='widening'||state==='narrowing')}
   <p>Verified 3M market-implied policy levels suggest the <b>absolute difference between policy rates</b> may {state==='widening'?'increase':'decrease'} over 90 days. {result?.signedDirection}. This is a market-expectations snapshot, not a calibrated forecast of what banks will actually do.</p>
  {:else if !expired && state==='unchanged'}
   <p>Both banks have supported conditional hold baselines. This does not guarantee that either policy rate will stay unchanged.</p>
  {:else}
   <p>The available evidence does not support a reliable relative direction. That is a research finding, not a missing buy/sell signal.</p>
  {/if}
  <p class="no-price">This is <b>not</b> a bullish or bearish forecast for {result?.base}/{result?.quote}, a prediction of FX returns or a broker swap-rate estimate.</p>
 </div>
 {/if}
 {#if result?.stages}
 <section class="model-stages" aria-label="Market, macro, policy and gap comparison">
  <h3>Four-stage evidence assessment</h3>
  <p><b>01 · Market-implied 3M policy rates:</b> {result.stages.market.status==='verified'?'Verified provider observation':'Not connected or unverified'}.
   {#if result.stages.market.status==='verified'}
     {result.base}: {rate(result.stages.market.baseExpectedRatePct)} · {result.quote}: {rate(result.stages.market.quoteExpectedRatePct)} · expected absolute-gap change {result.stages.market.expectedAbsoluteGapChangeBp} bp.
     <a href={result.stages.market.sources[0]} target="_blank" rel="noopener noreferrer">Base data source ↗</a> · <a href={result.stages.market.sources[1]} target="_blank" rel="noopener noreferrer">Quote data source ↗</a>.
   {:else}{result.stages.market.reason}{/if}</p>
  <p><b>02 · Macroeconomic evidence:</b> {result.stages.macro.status}; economic score {result.base}: {result.stages.macro.base.score??'—'}, {result.quote}: {result.stages.macro.quote.score??'—'}. Scores describe fundamentals, not the number of basis points expected.</p>
  <p><b>03 · Central-bank evidence:</b> {result.stages.policy.status==='reviewed'?'Both central-bank interpretations reviewed':'At least one central-bank interpretation needs review or has unresolved evidence'}.</p>
  <p><b>04 · Relative policy-rate gap:</b> {result.reasonCode?.replaceAll('_',' ')}. {result.stages.market.crossingRisk?'Implied rates cross; absolute-gap direction is calculated separately.':''}</p>
  {#if result.qualitativeCandidate&&['widening','narrowing','unchanged'].includes(result.qualitativeCandidate.state)}
    <p><b>Separate qualitative policy candidate:</b> {result.qualitativeCandidate.label}. This is not a market-implied rate forecast and should not be counted as one.</p>
  {/if}
 </section>
 {/if}
 <div class="bank-grid">
  {#each banks as bank}
   {#if bank}
    <article class="bank">
     <div class="bank-title"><h3>{bank.currency} <span>Central-bank outlook</span></h3><strong class="bank-label">{expired?'Expired':bank.label}</strong></div>
     <p><b>Economic pressure:</b> {bank.economicPressure}</p>
     <p class="coverage">Validated input coverage: {bank.coverage?.filter(c=>c.usable).length||0}/{bank.coverage?.length||4} series · Predictive accuracy not yet established</p>
     {#if bank.reasons?.length}<p class="caution">{bank.reasons.join(' · ')}</p>{/if}
     <div class="drivers">
      <h4>Evidence currently evaluated</h4>
      {#each bank.drivers||[] as driver}
       <div class="driver">
        <div class="driver-line"><strong>{driver.metric}</strong><span>{driver.text}</span></div>
        <p>{rate(driver.previous?.value)} ({period(driver.previous,driver.frequency)}) → {rate(driver.latest?.value)} ({period(driver.latest,driver.frequency)}) · <a href={driver.source} target="_blank" rel="noopener noreferrer">Source ↗</a></p>
       </div>
      {/each}
     </div>
     <div class="watch"><b>What could change the outlook?</b><p>{bank.watch}</p></div>
     <details class="evidence">
      <summary>Official guidance, opposing evidence &amp; input details</summary>
      {#if bank.framework}<p><b>Inflation objective:</b> {bank.framework.description}. <a href={bank.framework.source} target="_blank" rel="noopener noreferrer">Official framework ↗</a></p>{/if}
      {#if bank.guidance}<p><b>Central-bank statement:</b> {bank.guidance.guidance} <a href={bank.guidance.source} target="_blank" rel="noopener noreferrer">Original statement ↗</a></p><p class="meta">Published {bank.guidance.publishedDate} · Review {bank.guidance.assessment?.reviewedAt||'Unavailable'}</p>{/if}
      {#if bank.cautions?.length}<ul>{#each bank.cautions as note}<li>{note}</li>{/each}</ul>{/if}
     </details>
    </article>
   {/if}
  {/each}
 </div>
 <details class="about">
  <summary>What is included, what is missing, and how to read the rate gap</summary>
  <p>The current rules evaluate headline and underlying inflation, unemployment, GDP and source-reviewed central-bank guidance. The inflation measures are not always the same as each bank's preferred policy measure.</p>
  <p>Market-implied policy paths enter only when the licensed 3M dataset is verified. Without them, qualitative policy candidates are disclosed separately. Wage growth, inflation expectations, services inflation, policy projections and credit conditions are not yet scored. The current thresholds have not been calibrated against historical forecast outcomes.</p>
  <p>Rates are compared as base minus quote; a negative signed gap can become more negative even when the absolute gap widens. Widening or narrowing should never be interpreted as an FX buy/sell signal. If both banks have similar directional biases, timing and move sizes may make the relative gap uncertain. <a href="/policy-model/">Read the complete model rules and limitations ↗</a></p>
 </details>
 <p class="meta bottom">Model generated {when(data?.generatedAt)} · Valid until {when(result?.expiresAt)} · <a href="/data/policy-outlook-history.json">Historical assessment archive ↗</a></p>
</div>
<style>
.outlook{padding:22px;color:var(--ink);background:var(--surface);line-height:1.6}
.heading,.verdict-top,.bank-title{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.heading h2{font-size:1.35rem;line-height:1.25;margin:6px 0}
.heading p,.bank p,.interpretation p,.about p{color:var(--muted);font-size:.88rem;line-height:1.64}
.eyebrow{font-size:.68rem;letter-spacing:.075em;font-weight:800;color:var(--blue)}
.method-link{font-size:.78rem;white-space:nowrap;color:var(--blue)}
.verdict{margin:18px 0 14px;border:1px solid var(--line);border-left:4px solid #64748b;background:var(--soft);padding:17px;border-radius:8px}
.verdict.wide{border-left-color:#60a5fa}.verdict.narrow{border-left-color:#f59e0b}
.verdict h3{font-size:clamp(1.26rem,3vw,1.75rem);letter-spacing:-.025em;margin:4px 0 2px;color:var(--ink)}
.state-label{color:var(--ink);font-size:.75rem;font-weight:750;padding:5px 9px;border-radius:5px;border:1px solid var(--line);white-space:nowrap}
.reason{font-size:.88rem;max-width:90ch;color:var(--muted);margin:8px 0 14px}
.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.metrics>div{padding:12px;border:1px solid var(--line);border-radius:7px;min-width:0;background:var(--surface)}
.metrics span,.metrics small{display:block;font-size:.72rem;color:var(--muted)}
.metrics strong{display:block;font-size:1.04rem;font-weight:800;color:var(--ink);margin:4px 0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.interpretation{padding:8px 1px 14px}
.interpretation>strong{font-size:.92rem;color:var(--ink)}
.interpretation p{margin:7px 0}
.no-price{padding-left:12px;border-left:2px solid var(--line)}
.bank-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.bank{min-width:0;padding:15px;border:1px solid var(--line);border-radius:8px;background:var(--soft)}
.bank-title h3{font-size:1.06rem;margin:0;color:var(--ink)}
.bank-title h3 span{display:block;font-size:.72rem;font-weight:500;color:var(--muted)}
.bank-label{font-size:.78rem;color:var(--blue);text-align:right;max-width:46%}
.bank p{margin:8px 0}.coverage,.meta{font-size:.74rem!important;color:var(--muted)}
.caution{border-left:2px solid #f59e0b;padding-left:9px}
.drivers{margin-top:12px}.drivers h4{font-size:.85rem;margin:0 0 5px}
.driver{padding:9px 0;border-top:1px solid var(--line)}
.driver-line{display:flex;flex-direction:column;gap:2px}
.driver-line strong{font-size:.82rem}
.driver-line span,.driver p{font-size:.76rem;color:var(--muted);margin:2px 0}
.watch{margin:12px 0 4px;padding:10px 0;border-top:1px solid var(--line)}
.watch b{font-size:.82rem}.watch p{margin:3px 0}
.evidence,.about{border-top:1px solid var(--line);padding-top:7px;margin-top:10px}
summary{cursor:pointer;font-size:.82rem;font-weight:720;color:var(--blue);padding:6px 0}
a{color:var(--blue);text-underline-offset:3px}
li{font-size:.8rem;line-height:1.65;color:var(--muted);margin:6px 0}
.bottom{margin:14px 0 0}
@media(max-width:650px){.outlook{padding:15px}.heading{flex-wrap:wrap}.heading h2{font-size:1.2rem}.metrics{grid-template-columns:1fr}.metrics>div{padding:10px}.bank-grid{grid-template-columns:1fr}.method-link{white-space:normal}.bank{padding:13px}.verdict{padding:13px}}
.model-stages{padding:14px 16px;border:1px solid var(--line);border-radius:9px;background:var(--soft);margin:15px 0}.model-stages h3{font-size:1.03rem;color:var(--ink);margin:0 0 8px}.model-stages p{font-size:.8rem;line-height:1.7;color:var(--muted)}.model-stages b{color:var(--ink)}.model-stages a{color:var(--blue)}
</style>
