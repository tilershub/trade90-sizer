<script>
  import { onMount } from "svelte";
  import { getExpectedRows, getExpectedChanges, HORIZONS } from "../lib/trade90-forward-rates.js";
  import { formatBp } from "../lib/trade90-rates.js";
  export let policyBanks;
  export let mode = "expected";
  export let horizon = "6M";
  export let selectedPair = null;
  export let onPairSelect = () => {};
  let latest = null;
  let history = [];
  let loading = true;
  let reason = null;
  let period = 24;
  const showSigned = number => (number>0?"+":"")+formatBp(number);
  const dateLabel = timestamp => timestamp ? new Date(timestamp).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})+" UTC" : "—";
  onMount(() => {
    let cancelled=false;
    (async () => {
      try {
        const [live,prior]=await Promise.all([
          fetch("/data/forward-rate-snapshot.json",{cache:"no-store"}),
          fetch("/data/forward-rate-history.json",{cache:"no-store"})
        ]);
        if (!live.ok || !prior.ok) throw Error("Forward-data publication is not accessible");
        const l=await live.json(),h=await prior.json();
        if (!cancelled){latest=l;history=h;reason=null;}
      } catch (err) {
        if (!cancelled) reason="Unable to retrieve the verified forward dataset";
      } finally {if (!cancelled) loading=false;}
    })();
    return ()=>{cancelled=true;};
  });
  $: curves = latest ? getExpectedRows(latest,policyBanks,horizon) : null;
  $: sorted = curves ? [...curves.rows].sort((a,b) =>
    Number(b.available)-Number(a.available)
    || (b.expectedAbsBp??Math.abs(b.currentSignedBp))-(a.expectedAbsBp??Math.abs(a.currentSignedBp))
    || a.symbol.localeCompare(b.symbol)) : [];
  $: revisions = latest ? getExpectedChanges(latest,history,policyBanks,horizon,period) : null;
  $: selected = selectedPair ? HORIZONS.map(h => getExpectedRows(latest,policyBanks,h).rows.find(r => r.symbol===selectedPair.symbol)) : [];

</script>

<div class="forward">
  {#if loading}
    <p class="status">Checking forward-rate source availability…</p>
  {:else if reason}
    <p class="status">Forward-rate information unavailable: {reason}. Previous published policy-rate comparisons remain visible.</p>
  {:else if mode === "expected"}
    <div class="forward-head">
      <div><strong>Comparable forward-rate gaps</strong><p>Expected policy-level estimates for {horizon}, not a buy/sell signal. Each displayed value requires two synchronized market observations and verified public-display rights.</p></div>
      {#if curves?.health?.valid}
        <div class="state-ok">{curves.availableCount}/28 pairs covered</div>
      {:else}
        <div class="state-muted">Numeric feed not connected</div>
      {/if}
    </div>
    {#if curves?.health?.valid}
      <p class="updated">Provider: {latest.provider} · Observed: {dateLabel(latest.observedAt)} · Source type: market-implied policy level</p>
    {:else}
      <p class="updated">{curves?.health?.reason || "No verified forward dataset"}. Showing sourced policy outlook reports elsewhere in this section.</p>
    {/if}
    <div class="tablewrap">
      <table aria-label="Expected interest-rate gaps across 28 pairs">
        <thead><tr><th>Pair</th><th class="right">Current signed gap</th><th class="right">Expected {horizon} gap</th><th class="right">Change vs current</th><th>Gap outlook</th></tr></thead>
        <tbody>
          {#each sorted as row (row.symbol)}
            <tr>
              <td><button class="pairbutton" on:click={() => onPairSelect(row.symbol)}>{row.base}/{row.quote}</button></td>
              <td class="right">{showSigned(row.currentSignedBp)} bp</td>
              <td class="right value">{row.available ? showSigned(row.expectedSignedBp)+" bp" : "—"}</td>
              <td class="right">{row.available ? showSigned(row.changeVsCurrentBp)+" bp" : "—"}</td>
              <td>{row.available ? row.outlook : "Not available"}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="disclaimer">The expected values, when available, reflect licensed source methodology and observation times. Current gaps use official policy benchmarks; the difference from current is not a forecast of currency performance.</p>
  {:else if mode === "changes"}
    <div class="forward-head">
      <div><strong>Changes in expected gaps</strong><p>Difference in market-implied policy-rate spreads between comparable source snapshots. This is separate from changes to official rates.</p></div>
      <div class="periods" aria-label="Comparison period"><button class:chosen={period===24} on:click={() => period=24}>24 hours</button><button class:chosen={period===168} on:click={() => period=168}>7 days</button></div>
    </div>
    {#if revisions?.available}
      <p class="updated">Provider: {latest.provider} · {dateLabel(revisions.previousAsOf)} → {dateLabel(revisions.latestAsOf)} · Horizon: {horizon}</p>
      <div class="tablewrap">
        <table aria-label="Market-implied spread repricing">
          <thead><tr><th>Currency pair</th><th class="right">Previous {horizon} gap</th><th class="right">Latest {horizon} gap</th><th class="right">Revision</th></tr></thead>
          <tbody>{#each revisions.rows as row (row.symbol)}
            <tr><td><button class="pairbutton" on:click={() => onPairSelect(row.symbol)}>{row.base}/{row.quote}</button></td><td class="right">{showSigned(row.priorExpectedSignedBp)} bp</td><td class="right">{showSigned(row.expectedSignedBp)} bp</td><td class="right value">{showSigned(row.revisionBp)} bp</td></tr>
          {/each}</tbody>
        </table>
      </div>
    {:else}
      <p class="status">{revisions?.reason || "Historical implied rates have not yet been captured for this period."} Dated published repricing reports remain available above.</p>
    {/if}
  {:else if mode === "pair"}
    <div class="forward-head"><div><strong>Market-implied gap path · {selectedPair?.label}</strong><p>Each horizon is calculated from matching market-implied policy levels for both currencies.</p></div></div>
    <div class="tablewrap"><table aria-label="Pair forward-rate path">
      <thead><tr><th>Horizon</th><th class="right">Base implied rate</th><th class="right">Quote implied rate</th><th class="right">Expected signed gap</th><th>Source</th></tr></thead>
      <tbody>{#each HORIZONS as h,i}
      <tr><td>{h}</td><td class="right">{selected[i]?.available ? selected[i].baseForwardPct.toFixed(3)+"%" : "—"}</td><td class="right">{selected[i]?.available ? selected[i].quoteForwardPct.toFixed(3)+"%" : "—"}</td><td class="right value">{selected[i]?.available ? showSigned(selected[i].expectedSignedBp)+" bp" : "Not available"}</td><td>{#if selected[i]?.available}<a href={selected[i].sourceBase} target="_blank" rel="noopener noreferrer">Base ↗</a> · <a href={selected[i].sourceQuote} target="_blank" rel="noopener noreferrer">Quote ↗</a>{:else}—{/if}</td></tr>
      {/each}</tbody>
    </table></div>
    <p class="disclaimer">Source-aligned policy-level estimates are not guaranteed outcomes. Rates may change after economic releases; this display is not a trade recommendation.</p>
  {/if}
</div>
<style>
.forward{background:#0d182a;border-top:1px solid #334155;border-bottom:1px solid #334155;padding:18px 24px;color:#e2e8f0}
.forward-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin:0 0 10px}
.forward-head strong{font-size:1.02rem;color:#f8fafc}
.forward-head p{font-size:.78rem;color:#94a3b8;margin:5px 0;max-width:720px}
.status{border:1px solid #385166;background:#172538;padding:13px;border-radius:9px;color:#cbd5e1;font-size:.83rem}
.state-ok{background:#064e3b;color:#a7f3d0;border:1px solid #10b981;padding:6px 10px;border-radius:9px;white-space:nowrap;font-size:.73rem}
.state-muted{color:#f5dbaa;border:1px solid #755426;background:#37291c;padding:6px 10px;border-radius:9px;white-space:nowrap;font-size:.73rem}
.updated,.disclaimer{font-size:.75rem;color:#a5b4c8;margin:8px 0 13px}
.tablewrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:.8rem}
th{background:#1b2a3f;color:#cbd5e1;text-align:left;letter-spacing:.04em;font-size:.67rem;text-transform:uppercase;padding:11px}
td{border-bottom:1px solid #25364b;color:#e2e8f0;padding:10px}
.right{text-align:right;white-space:nowrap}
.value{color:#6ee7b7;font-weight:750}
.pairbutton{border:0;background:none;cursor:pointer;color:#6ee7b7;font-weight:740}
.periods{display:flex;gap:7px;white-space:nowrap}
.periods button{color:#cbd5e1;background:#1e293b;border:1px solid #475569;padding:7px 10px;border-radius:8px;cursor:pointer}
.periods button.chosen{color:white;background:#065f46;border-color:#10b981}
a{color:#6ee7b7}
@media(max-width:680px){.forward{padding:13px 14px}.forward-head{display:block}.state-ok,.state-muted,.periods{display:inline-flex;margin-top:6px}td,th{padding:9px 7px}}
</style>