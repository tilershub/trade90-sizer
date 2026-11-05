<script>
  import model from '../../public/data/policy-outlook.json';
  import snapshot from '../data/trade90-policy-snapshot.json';
  import {policyContext} from '../lib/trade90-research-presentation.js';
  export let pair;
  const dateLabel=s=>s?new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Unavailable';
  $: selected=[pair?.base,pair?.quote].filter(Boolean).map(code=>({code,bank:model.banks[code],context:policyContext(model.banks[code],snapshot.banks.find(b=>b.code===code))}));
  $: label=pair?.label || ((pair?.base||'')+'/'+(pair?.quote||''));
</script>
<section class="guidance" aria-label={'Central bank outlook and forward guidance for '+label}>
 <header class="heading">
  <span class="eyebrow">Official decisions · {label}</span>
  <h2>Central Bank Policy Outlook &amp; Forward Guidance</h2>
  <p>Latest recorded decisions, automated policy context and separately dated historical commentary.</p>
 </header>
 <div class="grid">
  {#each selected as item (item.code)}
   <article class="item">
    <div class="line"><strong>{item.code}</strong><time datetime={item.context.decisionDate}>{dateLabel(item.context.decisionDate)}</time></div>
    <div class="stance">Latest recorded official decision</div>
    <h3>{item.context.headline}</h3>
    <p>Effective {dateLabel(item.context.effectiveDate)}. A past decision does not establish the next policy move.</p>
    {#if item.context.source}<a href={item.context.source} target="_blank" rel="noopener noreferrer">Official decision ↗</a>{/if}
    {#if item.context.newer}<p class="pending">A newer decision publication dated {dateLabel(item.context.newer.date)} needs verification. The recorded benchmark above has not yet been updated. <a href={item.context.newer.url} target="_blank" rel="noopener noreferrer">Read newer publication ↗</a></p>{/if}
    <h3>{item.context.label}</h3><p>{item.context.interpretation}</p>
    {#if item.context.checkedAt}<p class="foot">Automated assessment: {item.context.checkedAt.replace('T',' ').slice(0,16)} UTC</p>{/if}
    <div class="watch"><strong>What could change the outlook?</strong><p>{item.bank?.watch}</p></div>
    {#if item.context.guidance && !item.context.current}
     <details><summary>{item.context.historicalLabel} · {dateLabel(item.context.guidance.publishedDate)}</summary>
      <h3>{item.context.guidance.headline}</h3><p>{item.context.guidance.guidance}</p>
      <p>Historical context only; excluded from the current reviewed-policy assessment.</p>
      <a href={item.context.guidance.source} target="_blank" rel="noopener noreferrer">Historical statement ↗</a>
     </details>
    {/if}
   </article>
  {/each}
 </div>
 <p class="foot">Decision dates, automated checks and editorial review dates are separate. Automated context is not a human-reviewed interpretation of a statement.</p>
</section>
<style>
.guidance{padding:23px 24px 22px;border-top:1px solid #334155;color:#e2e8f0}
.eyebrow{color:#60a5fa;letter-spacing:.1em;text-transform:uppercase;font-weight:790;font-size:.67rem}
.heading h2{color:#f8fafc;font-size:1.33rem;margin:5px 0;letter-spacing:-.02em}
.heading p{color:#a5b4c8;font-size:.83rem;max-width:790px;margin:5px 0 16px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.item{background:#111d2f;border:1px solid #334155;border-radius:13px;padding:17px;min-width:0}
.line{display:flex;justify-content:space-between;gap:12px;align-items:center}
.line strong{color:#bfdbfe;font-size:.85rem}
.line time{color:#9fb0c3;font-size:.73rem}
.stance{display:inline-block;color:#e8f4fb;background:#23354a;border:1px solid #405672;font-size:.72rem;font-weight:670;border-radius:7px;padding:4px 8px;margin:12px 0}
.item h3{color:#f8fafc;font-size:1rem;margin:2px 0 8px}
.item>p{color:#bdcbd9;font-size:.79rem;line-height:1.65;margin:0 0 15px}
.watch{padding:9px 12px;border-left:2px solid #3b82f6;background:#19283a;margin-bottom:14px}
.watch strong{color:#b7f7dc;font-size:.76rem}
.watch p{color:#cbd5e1;font-size:.75rem;margin:5px 0 0}
.item a{color:#93c5fd;font-size:.78rem;font-weight:680}
summary{cursor:pointer;font-size:.85rem;line-height:1.6}details{margin-top:14px}details p,.pending{font-size:.9rem;line-height:1.65}.item h3{margin-top:14px}.foot{color:#94a3b8;font-size:.73rem;line-height:1.6;margin:15px 0 0}
@media(max-width:680px){.guidance{padding:18px 14px}.grid{grid-template-columns:1fr}.item{padding:14px}.heading h2{font-size:1.18rem}}
</style>