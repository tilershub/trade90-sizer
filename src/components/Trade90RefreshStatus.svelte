<script>
 import {onMount} from 'svelte';
 import initialStatus from '../../public/data/refresh-status.json';
 import {refreshStatusAt} from '../lib/trade90-refresh-status.js';
 export let compact=false;
 let status=refreshStatusAt(initialStatus,new Date().toISOString()),failed=false;
 onMount(()=>{
   let alive=true;
   fetch('/data/refresh-status.json',{cache:'no-store',signal:AbortSignal.timeout(10000)})
     .then(r=>{if(!r.ok)throw Error('Audit file unavailable');return r.json();})
     .then(value=>{if(alive&&value?.schemaVersion===1)status=refreshStatusAt(value,new Date().toISOString());else if(alive)failed=true;})
     .catch(()=>{if(alive)failed=true;});
   const timer=setInterval(()=>{if(alive)status=refreshStatusAt(status,new Date().toISOString());},60000);
   return ()=>{alive=false;clearInterval(timer)};
 });
 const when=v=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC':'Not recorded';
 const day=v=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Not recorded';
 const label=s=>s==='checked'?'Checked successfully':s==='partial'?'Partial coverage':s==='overdue'?'Check overdue':'Not available';
</script>
{#if compact}
 <div class="compact" aria-label="Latest verified research check information">
  {#if status}
   <span><b>Economic data check:</b> {when(status.categories.macro.checkedAt)} ({label(status.categories.macro.status)})</span>
   <span><b>Bank source scan:</b> {when(status.categories.sourceDiscovery.checkedAt)} ({label(status.categories.sourceDiscovery.status)})</span>
   <span><b>Rate decision verification:</b> {status.categories.rateDecisionChecks.okCount}/{status.categories.rateDecisionChecks.total} banks · {label(status.categories.rateDecisionChecks.status)}</span>
   {#if status.warnings?.length}<span class="attention">Some sources or reviews need attention. See details below.</span>{/if}
   {#if failed}<span>Live status refresh unavailable; showing the last published check.</span>{/if}
   <a href="/data-policy/">See source health and analyst review dates →</a>
  {:else if failed}
   <a href="/data-policy/">View research update status and source dates →</a>
  {:else}
   <span>Loading last source-check dates…</span>
  {/if}
 </div>
{:else}
 <section class="audit" aria-label="Daily research freshness audit">
  <h2>Automatic data checks and last verified reviews</h2>
  {#if status}
   <p class="summary"><b>Latest website research audit:</b> <time datetime={status.auditedAt}>{when(status.auditedAt)}</time>. This is the audit run date, not the date economic figures changed or an analyst re-reviewed a policy statement.</p>
   <div class="audit-grid">
    {#each [{key:'macro',name:'Economic histories (CPI, jobs, GDP)'},{key:'extra',name:'Additional economic indicators'},{key:'sourceDiscovery',name:'Official central-bank sources'},{key:'rateDecisionChecks',name:'Automated policy-decision verification'}] as item}
     <div>
      <strong>{item.name}</strong>
      <p>{label(status.categories[item.key].status)} · {status.categories[item.key].okCount}/{status.categories[item.key].total} inputs or channels</p>
      <time datetime={status.categories[item.key].checkedAt||undefined}>Last attempted {when(status.categories[item.key].checkedAt)}</time>
     </div>
    {/each}
    <div>
     <strong>90-day policy-divergence model</strong>
     <p>{status.categories.model.activePairs}/{status.categories.model.totalPairs} pair assessments still within model validity windows</p>
     <time datetime={status.categories.model.generatedAt||undefined}>Generated {when(status.categories.model.generatedAt)}</time>
    </div>
   </div>
   {#if status.bankChecks?.length}
    <h3>Latest rate verification by bank</h3>
    {#each status.bankChecks as bank}
     <p><b>{bank.code}:</b> {bank.state}{#if bank.checkedAt} · Verified {when(bank.checkedAt)}{/if}</p>
    {/each}
   {/if}
   <h3>Curated source material — original review dates</h3>
   <div class="manual-grid">
    <p><b>Official-rate snapshot dated:</b> {day(status.reviewed.benchmarkSnapshot)}</p>
    <p><b>Policy publication summaries:</b> {day(status.reviewed.policyPublications)}</p>
    <p><b>Meeting calendar reviewed:</b> {day(status.reviewed.meetingCalendar)}</p>
    <p><b>Central-bank guidance reviewed:</b> {day(status.reviewed.policyStatements)}</p>
    <p><b>Oldest policy-model assessment review:</b> {day(status.reviewed.oldestPolicyAssessment)}</p>
    <p><b>Reported market research:</b> {day(status.reviewed.marketReports)}</p>
   </div>
   {#if status.warnings?.length}
    <p class="attention"><strong>{status.warnings.length} refresh or review checks need attention.</strong> Some source checks may be partial or older analyst-reviewed records may need reassessment. Previously published figures remain dated.</p>
   {/if}
   <p class="fine">{status.disclaimer}</p>
  {:else if failed}
   <p>The daily refresh audit file is not available. The dated source records and links below remain the authoritative references.</p>
  {:else}
   <p>Loading the most recently published research audit…</p>
  {/if}
 </section>
{/if}
<style>
 .compact{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:.82rem;line-height:1.55;color:var(--muted)}
 .compact b{color:var(--ink)}.compact a,.audit a{color:var(--blue)}
 .audit{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:12px;padding:20px;margin:18px 0}
 .audit h2{margin:0 0 7px;font-size:1.2rem}.audit h3{font-size:1rem;margin:21px 0 9px}
 .audit p{font-size:.85rem;line-height:1.55;color:var(--muted)}
 .audit .summary{font-size:.91rem}
 .audit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .audit-grid>div{border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--soft)}
 .audit-grid strong{font-size:.83rem}.audit-grid p{margin:4px 0;font-size:.81rem}.audit-grid time{font-size:.73rem;color:var(--muted)}
 .manual-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 20px}.manual-grid p{margin:5px 0}
 .manual-grid b{color:var(--ink)}.attention{border-left:3px solid #d97706;padding:9px 13px}
 .audit .fine{font-size:.77rem;line-height:1.5}
 :global(html[data-theme="light"]) .audit{background:#fff;color:#0f172a;border-color:#cbd5e1}
 :global(html[data-theme="light"]) .audit-grid>div{background:#f8fafc;border-color:#cbd5e1}
 :global(html[data-theme="light"]) .audit h2,:global(html[data-theme="light"]) .audit h3,
 :global(html[data-theme="light"]) .audit-grid strong,:global(html[data-theme="light"]) .manual-grid b,
 :global(html[data-theme="light"]) .compact b{color:#0f172a}
 :global(html[data-theme="light"]) .audit p,:global(html[data-theme="light"]) .audit time,
 :global(html[data-theme="light"]) .compact{color:#475569}
 :global(html[data-theme="light"]) .audit a,:global(html[data-theme="light"]) .compact a{color:#1d4ed8}
 :global(html[data-theme="light"]) .audit .attention{border-left-color:#d97706}
 @media(max-width:700px){.audit{padding:14px}.audit-grid,.manual-grid{grid-template-columns:1fr}}
</style>
