<script>
  import { policyGuidance, guidanceCurrencies, policyGuidanceReviewedAt } from "../data/trade90-policy-guidance.js";
  import { officialPolicyDecisionCalendar, decisionCalendarReviewedAt } from "../data/trade90-decision-calendar.js";
  import { formatBp } from "../lib/trade90-rates.js";
  export let pairs = [];
  export let snapshotAsOf = "";
  export let onPairSelect = () => {};
  const date = value => new Date(value+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
  const today = new Date().toISOString().slice(0,10);
  const guidance = guidanceCurrencies.map(code=>policyGuidance[code]);
  $: biggest = [...pairs].sort((a,b)=>b.absBp-a.absBp || a.symbol.localeCompare(b.symbol)).slice(0,6);
  $: nextMeetings = [...officialPolicyDecisionCalendar].filter(e=>e.date>=today)
    .sort((a,b)=>a.date.localeCompare(b.date)||a.currency.localeCompare(b.currency))
    .filter((entry,index,all)=>all.findIndex(e=>e.currency===entry.currency)===index)
    .slice(0,6);
  function openPair(symbol){
    onPairSelect(symbol);
    if(typeof document!=="undefined")document.getElementById("rate-dashboard")?.scrollIntoView({behavior:"smooth",block:"start"});
  }
</script>

<div class="overview" aria-label="Trade90 policy outlook and divergence watch">
 <section class="section" aria-labelledby="key-divergences">
  <div class="intro">
   <div><span class="eyebrow">Forex policy divergence watch</span><h2 id="key-divergences">Most Important Divergences for Forex Traders Right Now</h2><p>A transparent watchlist of the <strong>six largest current policy-rate gaps</strong> out of 28 pairs. Ranking is by absolute official rate difference—not by predicted FX returns, liquidity or trading opportunity.</p></div>
   <span class="snapshot">Policy rates checked {date(snapshotAsOf)}</span>
  </div>
  <div class="divergence-grid">
   {#each biggest as pair,i (pair.symbol)}
    <article class="divergence-card">
     <div class="pair-top"><span class="rank">#{i+1} · Current spread ranking</span><span class="gap">{formatBp(pair.absBp)} <small>bp</small></span></div>
     <h3>{pair.label}</h3>
     <p class="higher">Higher policy benchmark: <strong>{pair.higher}</strong></p>
     <div class="stancelines">
      <p><strong>{pair.base}:</strong> {policyGuidance[pair.base]?.stance}</p>
      <p><strong>{pair.quote}:</strong> {policyGuidance[pair.quote]?.stance}</p>
     </div>
     <button type="button" class="open-pair" on:click={() => openPair(pair.symbol)}>Explore {pair.label} →</button>
    </article>
   {/each}
  </div>
  <p class="note">Rate differences reflect the stated policy benchmarks, not actual FX carry yields. Large spreads are not automatically useful trading signals; forward expectations may already be priced. Full methodology: <a href="/methodology/">how gaps are calculated ↗</a></p>
 </section>

 <section class="section" aria-labelledby="central-bank-guidance">
  <div class="intro">
   <div><span class="eyebrow">Policy communication</span><h2 id="central-bank-guidance">Central Bank Policy Outlook &amp; Forward Guidance</h2><p>What each bank most recently communicated about inflation and the direction of policy risks. These are <strong>official-source summaries</strong>, not futures-implied rate paths.</p></div>
   <span class="snapshot">Guidance reviewed {date(policyGuidanceReviewedAt)}</span>
  </div>
  <div class="guidance-grid">
   {#each guidance as bank (bank.currency)}
    <article class="mini-guidance">
     <div class="mini-top"><strong>{bank.currency} · {bank.short}</strong><time datetime={bank.publishedDate}>{date(bank.publishedDate)}</time></div>
     <div class="stance">{bank.stance}</div>
     <p>{bank.headline}</p>
     <a href={bank.source} target="_blank" rel="noopener noreferrer">Official source ↗</a>
    </article>
   {/each}
  </div>
  <p class="note">To compare only two banks side by side, open a currency pair's details. Historical guidance should not be treated as live market positioning.</p>
 </section>

 <section class="section" aria-labelledby="next-major">
  <div class="intro">
   <div><span class="eyebrow">Upcoming official monetary policy meetings</span><h2 id="next-major">Next Major Decisions to Watch</h2><p>Upcoming announcement dates across the eight banks. The corresponding pair view shows only its two relevant decisions.</p></div>
   <span class="snapshot">Calendar reviewed {date(decisionCalendarReviewedAt)}</span>
  </div>
  <div class="decision-grid">
   {#each nextMeetings as event (event.currency)}
    <article class="decision-card">
     <span class="decision-date"><time datetime={event.date}>{date(event.date)}</time></span>
     <strong>{event.currency} · {event.bank}</strong>
     <p>{event.title}</p>
     <a href={event.source} target="_blank" rel="noopener noreferrer">Official calendar ↗</a>
    </article>
   {/each}
  </div>
  <p class="note">Dates are the bank's scheduled announcements, not a prediction of a hike or cut. Calendars can change, and unscheduled decisions are possible.</p>
 </section>
</div>

<style>
.overview{color:#e2e8f0}
.section{padding:25px 0 4px}
.intro{display:flex;justify-content:space-between;align-items:flex-start;gap:17px;margin:0 0 15px}
.eyebrow{color:#34d399;text-transform:uppercase;font-weight:780;font-size:.68rem;letter-spacing:.1em}
.intro h2{font-size:1.5rem;line-height:1.3;color:#f8fafc;letter-spacing:-.03em;margin:5px 0}
.intro p{font-size:.82rem;color:#a5b4c8;max-width:830px;margin:5px 0}
.snapshot{font-size:.7rem;color:#cbd5e1;background:#1e293b;border:1px solid #475569;border-radius:8px;padding:6px 9px;white-space:nowrap}
.divergence-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.divergence-card,.mini-guidance,.decision-card{background:#111d2f;border:1px solid #334155;border-radius:12px;padding:16px;min-width:0}
.pair-top{display:flex;justify-content:space-between;align-items:center;gap:12px}
.rank{font-size:.67rem;color:#a5b4c8}
.gap{font-size:1.21rem;font-weight:800;color:#a7f3d0;white-space:nowrap}
.gap small{font-size:.66em}
.divergence-card h3{color:#fff;font-size:1.36rem;letter-spacing:-.03em;margin:2px 0}
.higher{font-size:.76rem;color:#b5c5d5;margin:0 0 13px}
.stancelines{border-top:1px solid #344254;padding-top:8px;min-height:92px}
.stancelines p{font-size:.73rem;color:#cbd5e1;margin:4px 0;line-height:1.45}
.open-pair{border:1px solid #147a5b;background:#064e3b;color:#d1fae5;font-size:.79rem;font-weight:700;padding:8px 12px;border-radius:8px;cursor:pointer;margin-top:7px}
.open-pair:hover{background:#075c49}
.note{color:#9aacbd;font-size:.76rem;line-height:1.65;margin:11px 0}
.note a,.mini-guidance a,.decision-card a{color:#6ee7b7;text-underline-offset:3px}
.guidance-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}
.mini-top{display:flex;justify-content:space-between;gap:6px;align-items:center}
.mini-top strong{color:#b8f3d5;font-size:.82rem}
.mini-top time{color:#a5b4c8;font-size:.66rem}
.stance{display:inline-flex;max-width:100%;color:#d5eaf9;background:#21354b;border:1px solid #405672;border-radius:6px;padding:4px 7px;font-size:.65rem;line-height:1.3;margin-top:12px}
.mini-guidance p{color:#dbe4ee;font-size:.79rem;line-height:1.5;min-height:55px}
.mini-guidance a,.decision-card a{font-size:.76rem;font-weight:690}
.decision-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}
.decision-card{display:flex;flex-direction:column;align-items:flex-start}
.decision-date{font-size:1.04rem;color:#f8fafc;font-weight:840;letter-spacing:-.025em;margin-bottom:8px}
.decision-card strong{color:#a7f3d0;font-size:.81rem}
.decision-card p{color:#b3c5d7;font-size:.75rem;line-height:1.45;margin:5px 0 12px;flex:1}
@media(max-width:900px){.divergence-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.guidance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.decision-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.intro{display:block}.snapshot{display:inline-flex;margin-top:8px}.divergence-grid,.guidance-grid{grid-template-columns:1fr}.decision-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.section{padding:23px 0 1px}.stancelines{min-height:0}.mini-guidance p{min-height:0}.decision-date{font-size:.87rem}.decision-card{padding:12px}.intro h2{font-size:1.24rem}}
</style>