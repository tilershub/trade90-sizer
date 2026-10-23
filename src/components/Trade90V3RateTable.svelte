<script>
  export let pairs=[];
  let query="";
  let currency="ALL";
  let kind="ALL";
  let sort="largest";
  $: normalized=query.toUpperCase().replace(/[^A-Z]/g,"");
  $: visible=pairs.filter(p=>(!normalized||p.symbol.includes(normalized))&&(currency==="ALL"||p.base===currency||p.quote===currency)&&(kind==="ALL"||(kind==="USD"?(p.base==="USD"||p.quote==="USD"):(p.base!=="USD"&&p.quote!=="USD")))).sort((a,b)=>sort==="largest"?b.absBp-a.absBp||a.symbol.localeCompare(b.symbol):a.absBp-b.absBp||a.symbol.localeCompare(b.symbol));
  const href=p=>"/pairs/"+p.base.toLowerCase()+"-"+p.quote.toLowerCase()+"/";
  const fmt=v=>(v>0?"+":"")+v.toFixed(Number.isInteger(v)?0:1);
</script>
<section class="full-table" aria-label="All 28 central bank rate gaps">
<div class="tools">
<label>Search pair<input type="search" bind:value={query} placeholder="EUR/USD, AUDJPY…" aria-label="Find a currency pair"/></label>
<label>Currency<select bind:value={currency} aria-label="Currency filter"><option value="ALL">All currencies</option>{#each ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"] as code}<option value={code}>{code}</option>{/each}</select></label>
<label>Pair type<select bind:value={kind} aria-label="Pair group"><option value="ALL">All 28 pairs</option><option value="USD">USD pairs</option><option value="CROSS">Cross pairs</option></select></label>
<label>Order<select bind:value={sort} aria-label="Sort rate gaps"><option value="largest">Largest gap first</option><option value="smallest">Smallest gap first</option></select></label>
</div>
<p class="showing" aria-live="polite">Showing {visible.length} of 28 currency pairs · Verified official policy-rate snapshot</p>
<div class="scroll"><table><thead><tr><th>Currency pair</th><th class="number">Signed gap</th><th class="number">Absolute gap</th><th>Higher benchmark</th><th class="hide-small">Selected policy rates</th><th class="entry"></th></tr></thead><tbody>
{#each visible as p (p.symbol)}
<tr><td><a class="pair-link" href={href(p)}>{p.label}</a></td><td class="number">{fmt(p.signedBp)} bp</td><td class="number">{p.absBp.toFixed(Number.isInteger(p.absBp)?0:1)} bp</td><td>{p.higher}</td><td class="hide-small">{p.baseRate}% / {p.quoteRate}%</td><td class="entry"><a href={href(p)} aria-label={"Explore "+p.label+" monetary policy details"}>Research →</a></td></tr>
{/each}
</tbody></table></div>
{#if !visible.length}<p class="showing">No pairs match this search. Try one of the 28 supported symbols.</p>{/if}
<p class="note">Signed gap = base currency policy rate minus quote currency policy rate, in basis points. These are not forex spot quotes, broker swaps or directional trading signals.</p>
</section>
<style>
.full-table{margin:25px 0;background:#111c30;border:1px solid #334155;border-radius:14px;overflow:hidden}
.tools{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:12px;padding:18px}
.tools label{font-size:.73rem;font-weight:700;color:#cbd5e1;display:flex;flex-direction:column;gap:6px}
.tools input,.tools select{border:1px solid #475569;border-radius:8px;background:#0b1424;color:#f8fafc;padding:10px;min-width:0}
.showing{color:#94a3b8;font-size:.74rem;margin:0;padding:0 18px 16px}
.scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.84rem;font-variant-numeric:tabular-nums}th{font-size:.7rem;text-align:left;color:#cbd5e1;background:#1b2a3f;padding:13px 15px}td{padding:13px 15px;border-bottom:1px solid #283850;color:#e2e8f0}tbody tr:hover{background:#172538}
.number{text-align:right;white-space:nowrap}.pair-link,.entry a{color:#93c5fd;font-weight:780;text-decoration:none}.entry a{white-space:nowrap;font-size:.78rem}
.note{padding:10px 18px 18px;color:#94a3b8;font-size:.74rem;line-height:1.6;margin:0}
@media(max-width:760px){.tools{grid-template-columns:1fr 1fr}.tools label:first-child{grid-column:1/-1}.tools label:last-child{grid-column:1/-1}.hide-small{display:none}th,td{padding:11px 9px}.entry{white-space:nowrap}}
</style>