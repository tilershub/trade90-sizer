<script>
 export let pairs = [];
 export let placeholder = "Search a pair — e.g. EUR/USD or USDJPY";
 export let limit = 8;
 let query="";
 let focused=false;
 $: normalized=query.toUpperCase().replace(/[^A-Z]/g,"");
 $: found = normalized ? pairs.filter(p=>p.symbol.includes(normalized)).slice(0,28) : pairs.slice(0,limit);
 $: showList=focused || query.trim().length>0;
 const url=p=>"/pairs/"+p.symbol.slice(0,3).toLowerCase()+"-"+p.symbol.slice(3).toLowerCase()+"/";
 function submit(e){
   if(!found.length){e.preventDefault();return;}
   window.location.href=url(found[0]);
   e.preventDefault();
 }
</script>
<div class="finder">
  <form on:submit={submit} role="search" aria-label="Find a forex currency pair">
    <label for="trade90-pair-search">Find a currency pair</label>
    <div class="find-field">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="trade90-pair-search" type="search" autocomplete="off" spellcheck="false" bind:value={query} placeholder={placeholder} on:focus={()=>focused=true} aria-controls="trade90-pair-results" aria-expanded={showList} />
      <button type="submit" disabled={!found.length}>Open pair →</button>
    </div>
  </form>
  {#if showList}
    <div id="trade90-pair-results" class="results" role="region" aria-label="Currency pair search results">
      {#if found.length}
        <div class="result-head">{normalized ? found.length+" matching pairs" : "Popular and available pairs"}</div>
        <div class="result-items">
          {#each found as p (p.symbol)}
          <a href={url(p)}><strong>{p.label}</strong><span>{p.baseBank.short} / {p.quoteBank.short}</span><span class="gap">{p.signedBp>0?"+":""}{p.signedBp.toFixed(p.signedBp%1?1:0)} bp</span></a>
          {/each}
        </div>
      {:else}
        <p class="no-results">No match among the 28 supported currency pairs.</p>
      {/if}
    </div>
  {/if}
</div>
<style>
.finder{position:relative;z-index:5;width:100%;max-width:690px}
label{display:block;color:#cbd5e1;font-size:.79rem;font-weight:750;margin-bottom:8px}
.find-field{display:flex;align-items:center;gap:9px;border:1px solid #64748b;background:#fff;color:#64748b;border-radius:12px;padding:6px 7px 6px 15px;box-shadow:0 8px 25px rgba(0,0,0,.18)}
.find-field:focus-within{outline:2px solid #3b82f6}
input{border:0;outline:none;flex:1;min-width:0;min-height:41px;color:#0f172a;background:transparent;font-size:.95rem}
input::placeholder{color:#64748b}
button{background:#1d4ed8;color:#fff;border:0;border-radius:8px;font-weight:780;padding:12px 15px;white-space:nowrap;cursor:pointer}
button:hover{background:#1d4ed8}
button:disabled{opacity:.6}
.results{position:absolute;left:0;right:0;top:100%;border:1px solid #475569;background:#111c30;color:#e2e8f0;border-radius:12px;margin-top:8px;box-shadow:0 18px 40px rgba(0,0,0,.35);max-height:360px;overflow:auto}
.result-head{font-size:.7rem;color:#94a3b8;padding:9px 13px;border-bottom:1px solid #334155}
.result-items a{display:flex;align-items:center;gap:12px;color:#e2e8f0;text-decoration:none;padding:11px 13px;border-bottom:1px solid #25364b;font-size:.83rem}
.result-items a:hover,.result-items a:focus{background:#1e293b}
.result-items a strong{font-size:.9rem;color:#bfdbfe;min-width:68px}
.result-items a span:nth-child(2){flex:1;color:#94a3b8}
.gap{font-variant-numeric:tabular-nums;white-space:nowrap}
.no-results{padding:13px;color:#94a3b8;margin:0;font-size:.83rem}
@media(max-width:570px){.find-field{padding-left:9px}.find-field button{padding:12px 9px;font-size:.72rem}.find-field input{font-size:.8rem}.result-items a{gap:7px}.result-items a span:nth-child(2){font-size:.67rem}}
</style>