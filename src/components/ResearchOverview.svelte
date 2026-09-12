<script>
  import { researchOverview } from '../lib/research-overview.js';
  export let pair;
  export let generatedAt;
  export let previous = null;
  export let previousAt = null;
  export let now = Date.now();
  $: view = researchOverview(pair, generatedAt, previous, now);
  const time = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString() : 'Unavailable';
  const number = v => typeof v === 'number' && Number.isFinite(v) ? v.toFixed(pair?.decimals ?? 2) : '—';
  const percent = v => typeof v === 'number' && Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : '—';
</script>
<section class="research-summary" aria-label="Research overview">
  <header><div><span class="kicker">Understand the evidence · five-day research</span><h4>{view.condition}</h4><p>{pair?.market?.regime ?? 'Volatility regime unavailable'} · {pair?.model?.thesis ?? 'The model has not supplied an explanation.'}</p></div><a href={`/research/${pair?.symbol?.replace('/', '').toLowerCase()}/`}>Open market research</a></header>
  <div class="freshness-grid">
    <div><strong>{view.quoteFresh ? 'Recent indicative quote' : 'Quote needs checking'}</strong><span>{pair?.live?.provider ?? 'No quote provider'} · {time(pair?.live?.updated_at)}</span></div>
    <div><strong>{view.modelFresh ? 'Research within update window' : 'Research needs checking'}</strong><span>{time(generatedAt)} · Quote freshness and research freshness are separate.</span></div>
  </div>
  <div class="evidence-grid">
    <article><h5>Bullish contributions</h5>{#each view.bullish as item}<p><strong>{item.name}</strong><span>+{item.contribution.toFixed(1)} points</span></p>{:else}<p>No positive contributions supplied.</p>{/each}</article>
    <article><h5>Bearish contributions</h5>{#each view.bearish as item}<p><strong>{item.name}</strong><span>{item.contribution.toFixed(1)} points</span></p>{:else}<p>No negative contributions supplied.</p>{/each}</article>
  </div>
  <p class="explain">Contributions describe the model score, not proven causes of price movement. Opposing factors can offset each other.</p>
  <details open><summary>What deserves caution · {view.gaps.length} checks</summary><ul>{#each view.gaps as gap}<li>{gap}</li>{/each}</ul></details>
  <div class="evidence-grid">
    <article><h5>How useful was the model?</h5><p>Five-day accuracy <strong>{percent(view.validation?.['Model accuracy'])}</strong></p><p>Majority baseline <strong>{percent(view.validation?.['Majority baseline'])}</strong></p><p>Difference <strong>{view.lift === null ? '—' : `${(view.lift*100).toFixed(1)} percentage points`}</strong></p><p>{view.validation?.['OOS observations'] ?? 'Unknown'} test observations.</p><small>The baseline always chooses the most frequent outcome. These are reported historical tests, not verified future performance.</small></article>
    <article><h5>What changed?</h5>{#if previousAt}<small>Compared with research saved on this browser: {time(previousAt)}</small>{#each view.changes as change}<p>{change}</p>{:else}<p>No comparable score, regime or scenario change was supplied.</p>{/each}{:else}<p>A comparison appears after this browser receives a newer research snapshot. Refreshing the same snapshot does not count as a new analysis.</p>{/if}</article>
  </div>
  <details><summary>How to interpret possible scenarios</summary>
    <p>Use the research timeframe consistently. A move above the reference resistance would be evidence to investigate a bullish continuation; a move below support would warrant examining the bearish case. Remaining between the levels supports monitoring the range.</p>
    <p>Reference support: {number(pair?.market?.support20)} · resistance: {number(pair?.market?.resistance20)}. These come from the model's 20-session series; they are not recommended orders or guaranteed reversal points.</p>
    {#if view.basisMismatch}<p><strong>For gold, compare these levels only with the matching futures series. Do not transfer them directly to spot gold.</strong></p>{/if}
    <p>A price break alone is insufficient: inspect the chart, opposing evidence, relevant events and data freshness. A historical scenario frequency is not your probability of a profitable trade.</p>
  </details>
  <nav aria-label="Research next steps"><a href="/tools/trading-plan-builder/">Write your thesis and invalidation</a><a href={`/calculator/${pair?.symbol?.replace('/', '').toLowerCase()}/`}>Check position size</a><a href="/journal/">Review your decisions</a></nav>
</section>
<style>
.research-summary{margin:16px;padding:24px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:16px;color:#0f172a;font-size:1rem;line-height:1.6}.research-summary header{display:flex;align-items:start;justify-content:space-between;gap:20px}.kicker{font-size:.875rem;color:#047857;font-weight:700}h4{font-size:1.6rem;line-height:1.2;margin:8px 0}h5{font-size:1.05rem;margin:0 0 12px}p{margin:8px 0}.evidence-grid,.freshness-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}article,.freshness-grid>div{background:white;border:1px solid #cbd5e1;border-radius:10px;padding:18px}.freshness-grid span{display:block;font-size:.875rem}article p{display:flex;gap:14px;justify-content:space-between;flex-wrap:wrap}small,.explain{font-size:.875rem;color:#475569}details{margin-top:18px;padding:16px;background:white;border:1px solid #cbd5e1;border-radius:10px}summary{cursor:pointer;font-weight:700;min-height:28px}ul{padding-left:24px}li{margin:8px 0}a{color:#065f46;text-decoration:underline;text-underline-offset:3px;display:inline-flex;min-height:44px;align-items:center}nav{display:flex;gap:20px;flex-wrap:wrap;margin-top:16px}a:focus-visible,summary:focus-visible{outline:3px solid #059669;outline-offset:4px}@media(max-width:700px){.research-summary{margin:10px;padding:16px}.research-summary header{display:block}.evidence-grid,.freshness-grid{grid-template-columns:1fr}h4{font-size:1.4rem}}
</style>
