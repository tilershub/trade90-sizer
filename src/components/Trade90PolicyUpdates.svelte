<script>
  import { policyUpdates, policyCollectionAsOf, bankCodes, policyUpdateRelatedPairs } from "../data/trade90-policy-updates.js";
  export let compact = false;
  let bank = "ALL";
  let category = "ALL";
  let query = "";
  let showRelated = "";
  const types = ["Rate decision","Minutes","Policy statement","Policy report"];
  const formatted = date => new Date(date+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
  $: visible = compact
    ? policyUpdates.slice(0,4)
    : policyUpdates.filter(update =>
        (bank === "ALL" || update.currency === bank)
        && (category === "ALL" || update.type === category)
        && (!query.trim() || [update.title,update.summary,update.currency,update.bank].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
      );
</script>

<section class="policy-section" aria-label="Central bank policy updates" class:compact>
  <div class="policy-header">
    <div>
      <div class="eyebrow">Official central-bank publications</div>
      <h2>Central Bank Policy Updates</h2>
      <p>Rate decisions, meeting minutes and monetary policy statements from the eight central banks. Every item links to its original publication.</p>
    </div>
    {#if compact}<a href="/central-banks/" class="alllink">All policy updates →</a>{/if}
  </div>
  <div class="collection-note">Last curated review: {formatted(policyCollectionAsOf)} · <strong>Dated source collection — not a live news feed</strong></div>
  {#if !compact}
    <div class="policy-controls">
      <label>Central bank
        <select bind:value={bank} aria-label="Filter policy updates by currency">
          <option value="ALL">All eight banks</option>
          {#each bankCodes as code}<option value={code}>{code}</option>{/each}
        </select>
      </label>
      <label>Update type
        <select bind:value={category} aria-label="Filter by publication type">
          <option value="ALL">All publications</option>
          {#each types as type}<option value={type}>{type}</option>{/each}
        </select>
      </label>
      <label>Search updates
        <input type="search" bind:value={query} placeholder="Search topics or banks" aria-label="Search central bank policy updates" />
      </label>
    </div>
    <p class="results" aria-live="polite">{visible.length} source-linked {visible.length===1?"publication":"publications"} found.</p>
  {/if}
  <div class="updates">
    {#each visible as entry (entry.id)}
      <article class="update-card">
        <div class="meta">
          <span class="currency">{entry.currency} · {entry.bank}</span>
          <span class="publication-type">{entry.type}</span>
          <time datetime={entry.publishedDate}>{formatted(entry.publishedDate)}</time>
        </div>
        <h3>{entry.title}</h3>
        <p>{entry.summary}</p>
        {#if !compact}
          <div class="takeaway"><strong>What this publication confirms:</strong> {entry.takeAway}</div>
          <div class="related">
            <button type="button" on:click={() => showRelated = showRelated === entry.id ? "" : entry.id}
              aria-expanded={showRelated === entry.id}>
              Related currency pairs {showRelated === entry.id ? "−" : "+"}
            </button>
            {#if showRelated === entry.id}
              <p>These seven pairs include {entry.currency}; this does not imply any trading direction.</p>
              <div class="pairs">{#each policyUpdateRelatedPairs(entry.currency) as pair}<span>{pair}</span>{/each}</div>
            {/if}
          </div>
        {/if}
        <a class="source-link" href={entry.source} target="_blank" rel="noopener noreferrer">Official {entry.bank} publication ↗</a>
      </article>
    {/each}
  </div>
  {#if visible.length === 0}<p class="noresults">No policy publications match your filters.</p>{/if}
  {#if compact}<p class="more"><a href="/central-banks/">Browse decisions, minutes and policy reports for all eight banks →</a></p>{/if}
</section>
<style>
.policy-section{margin:28px 0 4px;color:#e2e8f0}
.policy-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:12px}
.eyebrow{color:#34d399;text-transform:uppercase;font-size:.66rem;font-weight:800;letter-spacing:.12em}
.policy-header h2{font-size:1.55rem;letter-spacing:-.025em;margin:4px 0;color:#f8fafc}
.policy-header p{font-size:.84rem;color:#94a3b8;max-width:730px;margin:5px 0}
.alllink,.more a{white-space:nowrap;color:#6ee7b7;font-size:.81rem;font-weight:700}
.collection-note{font-size:.72rem;color:#9fb0c3;padding:10px 13px;border:1px solid #334155;background:#142037;border-radius:9px;margin:11px 0 16px}
.collection-note strong{color:#e2e8f0}
.policy-controls{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:10px;padding:13px;background:#101b2c;border:1px solid #334155;border-radius:12px;margin-bottom:7px}
.policy-controls label{display:flex;flex-direction:column;gap:5px;color:#cbd5e1;font-size:.73rem;font-weight:700}
.policy-controls select,.policy-controls input{padding:10px;background:#0b1424;color:#f8fafc;border:1px solid #475569;border-radius:8px;min-width:0}
.policy-controls input::placeholder{color:#94a3b8}
.results{font-size:.75rem;color:#94a3b8;margin:10px 0}
.updates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.update-card{background:#111d2f;border:1px solid #334155;border-radius:13px;padding:18px;min-width:0}
.meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.currency{font-size:.75rem;font-weight:780;color:#a7f3d0}
.publication-type{font-size:.65rem;font-weight:700;padding:4px 8px;border:1px solid #2c6955;border-radius:8px;color:#a7f3d0;background:#0d3e32}
.meta time{font-size:.73rem;color:#b2c3d5;margin-left:auto}
.update-card h3{font-size:1.02rem;line-height:1.4;color:#f8fafc;margin:4px 0 8px}
.update-card>p{font-size:.8rem;line-height:1.62;color:#b3c3d4;margin:0 0 12px}
.takeaway{font-size:.75rem;color:#cbd5e1;border-left:2px solid #10b981;padding:7px 10px;background:#19283a;margin:9px 0 12px}
.takeaway strong{color:#e2e8f0}
.source-link{color:#6ee7b7;font-size:.79rem;text-underline-offset:3px;font-weight:670}
.related{margin:10px 0}
.related button{border:0;background:none;color:#9dddc5;padding:2px 0;font-size:.75rem;font-weight:650;text-decoration:underline;cursor:pointer}
.related p{font-size:.73rem;color:#94a3b8;margin:7px 0}
.pairs{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 12px}
.pairs span{border:1px solid #475569;border-radius:5px;padding:3px 6px;color:#d9e5f3;font-size:.69rem;background:#16243a}
.noresults{background:#172538;color:#cbd5e1;border:1px solid #334155;padding:18px;border-radius:12px}
.more{margin:17px 0 0}
.compact{margin-top:29px}
.compact .update-card{padding:17px}
.compact .update-card>p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
@media(max-width:730px){.updates{grid-template-columns:1fr}.policy-header{align-items:flex-start;flex-direction:column}.policy-controls{grid-template-columns:1fr 1fr}.policy-controls label:last-child{grid-column:1/-1}.alllink{white-space:normal}.compact .updates{grid-template-columns:1fr}}
</style>
