<script>
  import { outlookAsOf, outlookReports, repricingReports } from "../data/trade90-policy-outlook.js";
  export let mode = "expected";
  export let pair = null;
  let filter = "all";
  $: visible = outlookReports
    .filter(report => mode !== "pair" || (pair && [pair.base,pair.quote].includes(report.currency)))
    .filter(report => filter === "all" || (filter === "market" ? report.kind === "Reported market pricing" : filter === "survey" ? report.kind.startsWith("Economist") : !report.kind.startsWith("Reported market") && !report.kind.startsWith("Economist")));
</script>

{#if mode === "expected" || mode === "pair"}
  <section class="outlook-evidence" aria-label="Verified interest-rate outlook evidence">
    <div class="outlook-head">
      <div>
        <h3>{mode === "pair" ? "Published outlooks for " + pair.label : "Published rate-pricing observations"}</h3>
        <p>Source-dated reporting and official statements. These are <strong>not</strong> a live eight-bank futures curve or comparable 3/6/12-month rate forecasts.</p>
      </div>
      <span class="asof">Collection: {outlookAsOf}</span>
    </div>
    {#if mode === "expected"}
      <div class="source-filters" aria-label="Observation type">
        <button class:chosen={filter === "all"} on:click={() => filter="all"}>All sources</button>
        <button class:chosen={filter === "market"} on:click={() => filter="market"}>Market pricing</button>
        <button class:chosen={filter === "survey"} on:click={() => filter="survey"}>Economist surveys</button>
        <button class:chosen={filter === "policy"} on:click={() => filter="policy"}>Other context</button>
      </div>
    {/if}
    <div class="outlook-grid" class:pair-grid={mode === "pair"}>
      {#each visible as report (report.currency)}
        <article class="outlook-card">
          <div class="outlook-top"><strong>{report.currency} <small>· {report.bank}</small></strong><span>{report.published}</span></div>
          <div class="obs-kind" class:priced={report.kind === "Reported market pricing"}>{report.kind}</div>
          <h4>{report.headline}</h4>
          <div class="horizon">{report.horizon}</div>
          <p>{report.detail}</p>
          <a href={report.source} target="_blank" rel="noopener noreferrer">Read published source ↗</a>
        </article>
      {/each}
    </div>
    {#if visible.length === 0}
      <p class="no-evidence">No observations of this source type in the verified collection.</p>
    {/if}
  </section>
{:else if mode === "changes"}
  <section class="outlook-evidence" aria-label="Dated market repricing evidence">
    <div class="outlook-head"><div><h3>Verified, dated repricing reports</h3><p>Published comparisons before and after a release. Values may have changed again since publication; this is <strong>not</strong> a live intraday feed.</p></div><span class="asof">Collection: {outlookAsOf}</span></div>
    <div class="outlook-grid changes-grid">
      {#each repricingReports as report (report.id)}
        <article class="outlook-card">
          <div class="outlook-top"><strong>{report.currency} · {report.date}</strong><span>Reported change</span></div>
          <div class="obs-kind priced">{report.type}</div>
          <h4>{report.title}</h4>
          <div class="beforeafter">
            <div><small>Before</small><strong>{report.before}</strong></div>
            <div class="move-arrow" aria-hidden="true">→</div>
            <div><small>After</small><strong>{report.after}</strong></div>
          </div>
          <p>{report.detail}</p>
          <a href={report.source} target="_blank" rel="noopener noreferrer">Read published source ↗</a>
        </article>
      {/each}
    </div>
  </section>
{/if}

<style>
.outlook-evidence{padding:6px 24px 23px;border-bottom:1px solid #334155;color:#e2e8f0}
.outlook-head{display:flex;align-items:start;justify-content:space-between;gap:18px;margin-bottom:13px}
.outlook-head h3{font-size:1.07rem;color:#f8fafc;margin:0 0 5px}
.outlook-head p{color:#94a3b8;font-size:.79rem;max-width:710px;margin:0}
.asof{flex:none;color:#a5b4c8;border:1px solid #475569;font-size:.7rem;padding:5px 9px;border-radius:8px}
.source-filters{display:flex;gap:7px;overflow-x:auto;white-space:nowrap;padding:3px 0 14px}
.source-filters button{color:#cbd5e1;background:#1e293b;border:1px solid #475569;border-radius:8px;padding:7px 11px;font-size:.75rem;font-weight:650;cursor:pointer}
.source-filters button.chosen{background:#1d4ed8;border-color:#3b82f6;color:#fff}
.outlook-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.outlook-card{border:1px solid #334155;border-radius:12px;padding:15px;background:#0e1a2c;min-width:0}
.outlook-top{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#e2e8f0;font-size:.79rem}
.outlook-top small{color:#a5b4c8;font-size:.75rem}.outlook-top span{color:#94a3b8;font-size:.72rem;white-space:nowrap}
.obs-kind{display:inline-flex;max-width:100%;font-size:.65rem;color:#faccaa;background:#473324;border:1px solid #78553f;border-radius:7px;padding:3px 7px;margin:12px 0 7px}
.obs-kind.priced{background:#063e33;border-color:#126b52;color:#9bf5c5}
.outlook-card h4{font-size:.98rem;margin:0;color:#f8fafc;line-height:1.4}
.horizon{color:#cbd5e1;font-size:.74rem;margin-top:4px}
.outlook-card p{color:#a5b4c8;font-size:.78rem;line-height:1.6}
.outlook-card a{color:#93c5fd;font-size:.75rem;text-underline-offset:3px}
.beforeafter{display:flex;gap:9px;align-items:center;margin:12px 0;background:#172538;border-radius:9px;padding:10px}
.beforeafter>div:not(.move-arrow){flex:1;min-width:0}
.beforeafter small{display:block;color:#94a3b8;font-size:.69rem}
.beforeafter strong{display:block;color:#f8fafc;font-size:.78rem;line-height:1.45}
.move-arrow{color:#60a5fa;font-size:1.1rem}
.no-evidence{padding:18px;color:#94a3b8}
@media(max-width:680px){.outlook-evidence{padding:8px 14px 18px}.outlook-grid{grid-template-columns:1fr}.outlook-head{display:block}.asof{display:inline-flex;margin-top:10px}.outlook-card{padding:13px}}
</style>
