<script>
  import { getNextPolicyDecisions, decisionCalendarReviewedAt } from "../data/trade90-decision-calendar.js";
  export let pair;
  const dateLabel = value=>new Date(value+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
  $: upcoming = getNextPolicyDecisions(pair);
  $: pairLabel = pair?.label || (pair?.base && pair?.quote ? pair.base+"/"+pair.quote : "");
</script>
<section class="decision-watch" aria-label={"Next major decisions to watch for "+pairLabel}>
  <header class="watch-head">
    <div>
      <div class="eyebrow">Policy calendar · {pairLabel}</div>
      <h2>Next Major Decisions to Watch</h2>
      <p>The next scheduled monetary-policy announcement for each of the two central banks in this pair. Dates are official schedules, not forecasts of rate increases or cuts.</p>
    </div>
  </header>
  <div class="watch-grid">
    {#each upcoming as event (event.currency)}
      <article class="watch-card">
        <div class="watch-card-top"><strong>{event.currency} · {event.bank}</strong><span class:unconfirmed={!event.date}>{event.date ? "Scheduled" : "Date not confirmed"}</span></div>
        {#if event.date}
          <div class="event-date"><time datetime={event.date}>{dateLabel(event.date)}</time></div>
          {#if event.startDate && event.startDate!==event.date}
            <p class="meeting-start">Meeting: {dateLabel(event.startDate)}–{dateLabel(event.date)} · Decision on final day</p>
          {:else}
            <p class="meeting-start">Policy announcement date</p>
          {/if}
        {:else}
          <p class="missing-date">No later meeting has been verified in this curated schedule.</p>
        {/if}
        <h3>{event.title}</h3>
        <div class="watch-for"><strong>What to watch</strong><p>{event.watch}</p></div>
        <a href={event.source} target="_blank" rel="noopener noreferrer">Official {event.bank} calendar ↗</a>
      </article>
    {/each}
  </div>
  <p class="watch-note">Schedules checked {dateLabel(decisionCalendarReviewedAt)}. Central banks may reschedule meetings or announce unscheduled decisions. For the newest schedule, use the linked official calendars.</p>
</section>
<style>
.decision-watch{padding:22px 24px 24px;border-top:1px solid #334155;color:#e2e8f0}
.watch-head{margin:0 0 14px}
.eyebrow{text-transform:uppercase;letter-spacing:.09em;font-size:.66rem;font-weight:750;color:#34d399}
.watch-head h2{font-size:1.34rem;letter-spacing:-.025em;color:#f8fafc;margin:5px 0}
.watch-head p{font-size:.82rem;color:#a5b4c8;max-width:780px;margin:4px 0}
.watch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.watch-card{background:#111d2f;border:1px solid #334155;border-radius:12px;padding:17px;min-width:0}
.watch-card-top{display:flex;justify-content:space-between;align-items:center;gap:9px}
.watch-card-top strong{color:#d1fae5;font-size:.83rem}
.watch-card-top span{font-size:.69rem;border:1px solid #147d60;background:#073a2f;color:#a7f3d0;border-radius:8px;padding:3px 7px}
.watch-card-top .unconfirmed{background:#3b2a20;border-color:#88653f;color:#f9dcad}
.event-date{font-weight:820;color:#f8fafc;font-size:1.6rem;letter-spacing:-.05em;margin:12px 0 0;line-height:1.25}
.meeting-start,.missing-date{color:#94a3b8;font-size:.74rem;min-height:18px;margin:5px 0 13px}
.missing-date{margin-top:15px}
.watch-card h3{color:#e2e8f0;font-size:.91rem;margin:0 0 12px;font-weight:750}
.watch-for{border-left:2px solid #10b981;padding:8px 11px;background:#182a3d;margin-bottom:14px}
.watch-for strong{font-size:.73rem;color:#b5e9d8}
.watch-for p{font-size:.76rem;color:#d0dce8;margin:4px 0 0}
.watch-card a{font-size:.78rem;color:#6ee7b7;font-weight:700;text-underline-offset:3px}
.watch-note{color:#94a3b8;font-size:.73rem;line-height:1.55;margin:13px 0 0}
@media(max-width:650px){.decision-watch{padding:18px 14px}.watch-grid{grid-template-columns:1fr}.watch-card{padding:15px}.event-date{font-size:1.38rem}.watch-head h2{font-size:1.2rem}}
</style>