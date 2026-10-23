<script>
  import {onMount} from "svelte";
  export let pair=null;
  export let currency=null;
  export let limit=6;
  let data=null;
  let error=false;
  let loaded=false;
  const banks=new Set(["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"]);
  $: codes=pair?[pair.base,pair.quote].filter(code=>banks.has(code)) : currency?[currency].filter(code=>banks.has(code)) : [...banks];
  $: selected=(data?.items||[]).filter(item=>codes.includes(item.code)).slice(0,limit);
  $: observed=data?.lastSourceScanAt;
  $: stale=!observed||Date.now()-Date.parse(observed)>30*3600*1000;
  const dateLabel=d=>d?new Date(d).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"})+" UTC":"Unavailable";
  onMount(()=>{
    let mounted=true;
    fetch("/data/official-release-feed.json",{cache:"no-store"})
      .then(r=>{if(!r.ok)throw Error("feed unavailable");return r.json()})
      .then(json=>{if(mounted){if(json?.kind!=="official_discovered_publications"||!Array.isArray(json.items))throw Error("feed invalid");data=json;}})
      .catch(()=>{if(mounted)error=true})
      .finally(()=>{if(mounted)loaded=true});
    return ()=>{mounted=false};
  });
</script>
<section class="release-feed" aria-label="Automatically discovered official central bank publications">
  <header class="release-head">
    <div><span class="eyebrow">AUTOMATIC OFFICIAL SOURCE WATCH</span>
      <h2>Recently detected central-bank publications</h2>
      <p>Links detected on official bank websites for {pair?pair.label:currency||"eight central banks"}. Titles are from the original sources. TRADE90 does not treat link discovery as confirmation of a new interest rate.</p>
    </div>
  </header>
  {#if !loaded}<p class="feed-state">Checking the official-source archive…</p>
  {:else if error}<p class="feed-state">Official-source archive is temporarily unavailable. Published policy snapshots remain dated.</p>
  {:else}
    <p class="feed-meta">{stale?"Source archive may be stale":"Most recent published scan"}: <time datetime={observed}>{dateLabel(observed)}</time> · {selected.length} source links shown</p>
    {#if selected.length}
      <ul class="feed-list">
        {#each selected as item (item.url)}
        <li><span class="bank">{item.code} · {item.bank}</span><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></li>
        {/each}
      </ul>
    {:else}
      <p class="feed-state">No official links were available for this currency in the last successful collection. Check the central bank's original website.</p>
    {/if}
    <p class="feed-note">First detection is not the original release date. Publication discovery is automated; numerical policy rates require separate strict validation. <a href="/data-policy/">Read the data and automation policy.</a></p>
  {/if}
</section>
<style>
.release-feed{border:1px solid #334155;background:#111c30;border-radius:13px;padding:20px;color:#e2e8f0;margin:18px 0}
.release-head .eyebrow{color:#60a5fa;font-weight:800;letter-spacing:.07em;font-size:.74rem}
.release-head h2{font-size:1.25rem;margin:7px 0;color:#f8fafc}
.release-head p{font-size:.91rem;line-height:1.65;color:#cbd5e1;max-width:790px}
.feed-meta,.feed-state,.feed-note{font-size:.82rem;color:#cbd5e1;line-height:1.65}
.feed-meta{border-top:1px solid #334155;padding-top:12px}
.feed-list{padding:0;list-style:none;margin:10px 0}
.feed-list li{display:flex;align-items:baseline;gap:13px;border-bottom:1px solid #334155;padding:13px 0;line-height:1.45}
.feed-list li:last-child{border:0}
.feed-list .bank{font-size:.78rem;color:#bfdbfe;font-weight:740;white-space:nowrap;min-width:66px}
.feed-list a,.feed-note a{color:#93c5fd;text-decoration:underline;text-underline-offset:3px;font-size:.89rem}
@media(max-width:600px){.release-feed{padding:14px}.feed-list li{display:block;padding:12px 0}.feed-list .bank{display:block;margin-bottom:4px}}
</style>