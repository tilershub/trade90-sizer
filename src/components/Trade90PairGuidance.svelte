<script>
  import {getGuidanceForPair,policyGuidance,policyGuidanceReviewedAt} from "../data/trade90-policy-guidance.js";
  export let pair;
  const dateLabel=s=>new Date(s+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
  $: selected=getGuidanceForPair(pair);
  $: label=pair?.label || ((pair?.base||"")+"/"+(pair?.quote||""));
</script>
<section class="guidance" aria-label={"Central bank outlook and forward guidance for "+label}>
 <header class="heading">
  <span class="eyebrow">Official statements · {label}</span>
  <h2>Central Bank Policy Outlook &amp; Forward Guidance</h2>
  <p>Compare what the two central banks have actually communicated. These are dated summaries of official policy, not market-priced rate expectations or trade recommendations.</p>
 </header>
 <div class="grid">
  {#each selected as item (item.currency)}
   <article class="item">
    <div class="line"><strong>{item.currency} · {item.short}</strong><time datetime={item.publishedDate}>{dateLabel(item.publishedDate)}</time></div>
    <div class="stance">{item.stance}</div>
    <h3>{item.headline}</h3>
    <p>{item.guidance}</p>
    <div class="watch"><strong>What could change the outlook?</strong><p>{item.watch}</p></div>
    <a href={item.source} target="_blank" rel="noopener noreferrer">{item.evidence} ↗</a>
   </article>
  {/each}
 </div>
 <p class="foot">Review date: {dateLabel(policyGuidanceReviewedAt)}. Different central-bank statements are not directly comparable forecasts. The next policy decision may materially change the guidance.</p>
</section>
<style>
.guidance{padding:23px 24px 22px;border-top:1px solid #334155;color:#e2e8f0}
.eyebrow{color:#34d399;letter-spacing:.1em;text-transform:uppercase;font-weight:790;font-size:.67rem}
.heading h2{color:#f8fafc;font-size:1.33rem;margin:5px 0;letter-spacing:-.02em}
.heading p{color:#a5b4c8;font-size:.83rem;max-width:790px;margin:5px 0 16px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.item{background:#111d2f;border:1px solid #334155;border-radius:13px;padding:17px;min-width:0}
.line{display:flex;justify-content:space-between;gap:12px;align-items:center}
.line strong{color:#a7f3d0;font-size:.85rem}
.line time{color:#9fb0c3;font-size:.73rem}
.stance{display:inline-block;color:#e8f4fb;background:#23354a;border:1px solid #405672;font-size:.72rem;font-weight:670;border-radius:7px;padding:4px 8px;margin:12px 0}
.item h3{color:#f8fafc;font-size:1rem;margin:2px 0 8px}
.item>p{color:#bdcbd9;font-size:.79rem;line-height:1.65;margin:0 0 15px}
.watch{padding:9px 12px;border-left:2px solid #10b981;background:#19283a;margin-bottom:14px}
.watch strong{color:#b7f7dc;font-size:.76rem}
.watch p{color:#cbd5e1;font-size:.75rem;margin:5px 0 0}
.item a{color:#6ee7b7;font-size:.78rem;font-weight:680}
.foot{color:#94a3b8;font-size:.73rem;line-height:1.6;margin:15px 0 0}
@media(max-width:680px){.guidance{padding:18px 14px}.grid{grid-template-columns:1fr}.item{padding:14px}.heading h2{font-size:1.18rem}}
</style>