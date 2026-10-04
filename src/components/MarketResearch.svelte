<script>
  import {finite, safeSource, relevantIndicators, contextFresh, evidenceNotes, technicalConditions, marketResearchBrief, researchTrustSummary, indicatorTrust, communicationRelevant} from '../lib/market-research.js';
  export let pair;
  export let context = null;
  export let panel = 'overview';
  export let now = Date.now();
  $: rows = relevantIndicators(context,pair?.symbol);
  $: fresh = contextFresh(context,now);
  $: technical = technicalConditions(pair);
  $: notes = evidenceNotes(context,pair?.symbol,now);
  $: brief = marketResearchBrief(context,pair,now);
  $: trust = researchTrustSummary(context,pair,now);
  $: currencies = [pair?.base,pair?.quote];
  $: positions = (context?.positioning ?? []).filter(p=>currencies.includes(p.currency));
  $: news = (context?.communications ?? []).filter(n=>(currencies.includes(n.currency)||['XAU','BTC'].includes(pair?.base)) && communicationRelevant(n));
  $: events = (context?.events ?? []).filter(e=>currencies.includes(e.currency));
  $: retail = context?.retail?.rows?.find(r=>r.symbol===pair?.symbol?.replace('/',''));
  const number=(v,d=2)=>finite(v)?v.toLocaleString(undefined,{maximumFractionDigits:d}):'—';
  const date=v=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleDateString():'Not supplied';
  const time=v=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleString():'Not supplied';
  const signedPercent=(v,d=1)=>finite(v)?`${v>=0?'+':''}${(v*100).toFixed(d)}%`:'—';
  const countdown=(ms)=>{
    if(!finite(ms)) return 'Time unavailable';
    const minutes=Math.max(0,Math.floor(ms/60000));
    if(minutes<60) return `${minutes}m`;
    const hours=Math.floor(minutes/60), rem=minutes%60;
    if(hours<48) return `${hours}h ${rem}m`;
    return `${Math.floor(hours/24)}d ${hours%24}h`;
  };
  const sections=[['policy','Rates and monetary conditions'],['economy','Growth, inflation and employment'],['yields','Yields and inflation expectations'],['liquidity','Money and balance sheets'],['risk','Cross-market risk conditions']];
</script>
<section class="research" aria-label={`${pair?.symbol} market conditions`}>
  {#if panel === 'overview'}
    <header><span class="eyebrow">Evidence first</span><h4>Understand the current conditions</h4><p>Start with the research brief, then inspect the underlying evidence. TRADE90 does not convert these observations into a buy/sell signal.</p></header>

    <section class="brief" aria-label="Research brief">
      <div class="brief-head">
        <div>
          <span class="eyebrow">Research brief</span>
          <h5>{pair?.symbol} at a glance</h5>
        </div>
        <span class:warning={!brief.quality.fresh}>{brief.quality.fresh ? 'Macro fresh' : 'Macro needs refresh'}</span>
      </div>

      <div class="brief-grid">
        <article>
          <span>Market structure</span>
          <strong>{brief.structure}</strong>
          <small>{signedPercent(brief.change20)} over 20 observations</small>
        </article>
        <article>
          <span>Volatility regime</span>
          <strong>{brief.volatilityLabel}</strong>
          <small>{finite(brief.volatilityRank) ? number(brief.volatilityRank*100,0)+'th percentile of supplied rolling history' : 'Insufficient history'}</small>
        </article>
        <article>
          <span>Macro / policy</span>
          <strong>{brief.quality.available}/{brief.quality.total} relevant indicators available</strong>
          <small>{brief.macro}</small>
        </article>
        <article>
          <span>Positioning</span>
          <strong>{brief.positioning.label}</strong>
          <small>{brief.positioning.detail}{brief.positioning.date ? ' · '+date(brief.positioning.date) : ''}</small>
        </article>
      </div>
    </section>

    <section class="trust" aria-label="TRADE90 data trust">
      <div class="trust-head">
        <div><span class="eyebrow">Data Trust</span><h5>Know what is live, delayed, stale or calculated</h5></div>
        <a href="/research-guide/">Methodology</a>
      </div>
      <div class="trust-grid">
        {#each trust.items as item}
          <article>
            <span class="trust-status" class:live={item.status==='LIVE'} class:current={item.status==='CURRENT'} class:delayed={item.status==='DELAYED'} class:stale={item.status==='STALE'} class:unavailable={item.status==='UNAVAILABLE'} class:derived={item.status==='DERIVED'}>{item.status}</span>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </article>
        {/each}
      </div>
      <p class="trust-note">A status describes freshness and lineage, not certainty. “Current” does not mean predictive, and “derived” means TRADE90 calculated the observation from sourced data.</p>
    </section>

    <section class="catalyst" class:unavailable={brief.catalyst.status==='unavailable'} aria-label="Next market catalyst">
      <div>
        <span class="eyebrow">Catalyst</span>
        {#if brief.catalyst.status==='upcoming'}
          <h5>{brief.catalyst.event?.currency} · {brief.catalyst.event?.event}</h5>
          <p><strong>{countdown(brief.catalyst.msUntil)}</strong> until the scheduled release · {time(brief.catalyst.event?.time)}</p>
          <small>Consensus {brief.catalyst.event?.forecast ?? '—'} · Previous {brief.catalyst.event?.previous ?? '—'}{brief.catalyst.event?.unit ? ' '+brief.catalyst.event.unit : ''}. Reassess the research after the release rather than treating the event as a directional instruction.</small>
        {:else if brief.catalyst.status==='released'}
          <h5>{brief.catalyst.event?.currency} · {brief.catalyst.event?.event}</h5>
          <p>Released {time(brief.catalyst.event?.time)} · Actual <strong>{brief.catalyst.event?.actual ?? '—'}</strong> · Consensus {brief.catalyst.event?.forecast ?? '—'}</p>
          <small>{finite(brief.catalyst.surprise) ? `Numerical surprise: ${brief.catalyst.surprise>0?'+':''}${number(brief.catalyst.surprise)}. ` : ''}Check yields, policy expectations and the subsequent price response before attributing causation.</small>
        {:else}
          <h5>No verified upcoming catalyst in the current feed</h5>
          <p>{brief.catalyst.calendarStatus}</p>
          <small>{brief.catalyst.note}</small>
          <a class="calendar-link" href="/economic-calendar/">Open the economic calendar →</a>
        {/if}
      </div>
    </section>

    <section class="evidence-balance" aria-label="Evidence balance">
      <div class="balance-head"><span class="eyebrow">Evidence balance</span><h5>What aligns, what conflicts, what is missing</h5></div>
      <div class="balance-grid">
        <article class="support"><span>Supporting / aligned</span>{#each brief.supporting as item}<p>{item}</p>{/each}</article>
        <article class="conflict"><span>Conflicting / caution</span>{#each brief.conflicts as item}<p>{item}</p>{/each}</article>
        <article class="missing"><span>Missing / uncertain</span>{#each brief.missing as item}<p>{item}</p>{/each}</article>
      </div>
      <small class="balance-note">“Supporting” means consistent with the displayed price structure, not evidence that a future move is more likely.</small>
    </section>

    <div class="quality" class:warning={!fresh} role="status">{fresh?'Macro snapshot within refresh window':'Macro snapshot unavailable or needs refresh'} · {time(context?.generated_at)}. Each source has its own observation date.</div>
    {#if pair?.symbol!=='USD/JPY'}<p class="notice">Macro coverage currently includes US conditions and global context{pair?.base==='XAU'?'; gold-specific flows are listed under source coverage':pair?.base==='BTC'?'; crypto-specific flows are listed under source coverage':'. The other economy’s full indicator set is not yet connected'}. USD/JPY has the first two-country comparison.</p>{/if}
    <div class="grid">
      <details class="research-detail"><summary>What changed in the data?</summary>{#each notes as note}<p>{note}</p>{/each}<small>Calculated observations. These do not establish what caused a price movement.</small></details>
      <details class="research-detail"><summary>Price structure and volatility</summary><p>{technical.trend}</p><dl><dt>20-observation return</dt><dd>{finite(technical.change20)?number(technical.change20*100)+'%':'—'}</dd><dt>20-observation annualized volatility</dt><dd>{finite(technical.volatility)?number(technical.volatility*100)+'%':'—'}</dd><dt>Volatility percentile in supplied history</dt><dd>{finite(technical.volatilityRank)?number(technical.volatilityRank*100,0)+'%':'—'}</dd></dl><small>Close-to-close returns; {technical.annualization ?? '—'} observations/year. Percentile uses {technical.rankWindows ?? 0} overlapping windows, not a probability of a future move. Price history: {date(technical.date)}.</small></details>
    </div>
    <details class="research-detail"><summary>Read the forces together</summary><p>{pair?.symbol==='USD/JPY'?'Compare the expected Fed and BOJ paths, matching yield maturities, policy communications and yen positioning. A wide rate gap may already be reflected in price.':pair?.base==='XAU'?'Compare real yields, dollar conditions, energy prices and investment demand. Uncertainty and rising real yields can create competing pressures.':pair?.base==='BTC'?'Compare dollar and funding conditions with crypto participation. Macro liquidity measures do not identify flows into Bitcoin.':'Compare both economies, expected policy paths and the observed price response. US data alone cannot explain the pair.'}</p><p>Before drawing a conclusion, check the expected outcome, the actual release, subsequent repricing and opposing evidence. The same headline can accompany different market reactions.</p></details>
    <div class="grid"><details class="research-detail"><summary>Historical reference range</summary><dl><dt>Lowest close / 20 observations</dt><dd>{number(technical.low,pair?.decimals)}</dd><dt>Highest close / 20 observations</dt><dd>{number(technical.high,pair?.decimals)}</dd><dt>Average absolute daily close change</dt><dd>{number(technical.averageMove,pair?.decimals)}</dd></dl><small>Historical closing levels, not resting orders or stop locations. The range measure is not full high/low ATR. {pair?.base==='XAU'?'Gold levels use futures history, not spot CFD prices.':''}</small></details><details class="research-detail"><summary>Research checklist</summary><ul><li>Check data dates and the price basis.</li><li>Separate policy guidance from market expectations.</li><li>Look for disagreement between price and the narrative.</li><li>Record what would change your assessment.</li><li>Waiting is a valid decision when evidence is incomplete.</li></ul><a href={`/tools/trading-plan-builder/?market=${encodeURIComponent(pair?.symbol ?? 'USD/JPY')}`}>Write your research plan</a></details></div>
  {:else if panel==='macro'}
    <h4>{pair?.symbol==='USD/JPY'?'US–Japan economic comparison':'US and global macro context'}</h4>
    <p>Values retain their source frequency and units. Observation dates describe the period measured, not when markets first received the information.</p>
    {#if !fresh}<p class="quality warning">Snapshot is unavailable or beyond its refresh window. Values below are historical context only.</p>{/if}
    {#each sections as [key,title]}<article><h5>{title}</h5><div class="table-scroll"><table><thead><tr><th>Indicator</th><th>Value</th><th>Change*</th><th>Observation</th><th>Availability</th></tr></thead><tbody>{#each rows.filter(r=>r.section===key) as row}<tr><td><a href={safeSource(row.source_url)} target="_blank" rel="noopener noreferrer">{row.country} · {row.label}</a><small>{row.publisher} · {row.frequency}<br />{row.note}</small></td><td>{number(row.value)} <small>{row.unit}</small></td><td>{number(row.change)}</td><td>{date(row.observed_at)}</td><td><span class="table-trust" class:stale={indicatorTrust(row,now).status==='STALE'}>{indicatorTrust(row,now).status}</span></td></tr>{:else}<tr><td colspan="5">No data supplied for this section.</td></tr>{/each}</tbody></table></div></article>{/each}
    <p>*Change from previous available observation in the displayed units. Changes in percentage rates are percentage points. Latest-vintage data may be revised.</p>
    {#if pair?.symbol==='USD/JPY'}{#each context?.comparisons ?? [] as comparison}<article><h5>{comparison.label}</h5><strong>{number(comparison.value)} {comparison.unit}</strong><p>{comparison.status} · {date(comparison.observed_at)} · change {number(comparison.change)}</p><small>{comparison.method}</small></article>{/each}{/if}
  {:else if panel==='policy'}
    <h4>Policy, expectations and intervention</h4><p>Central-bank guidance, market pricing and confirmed operations are separate evidence.</p>
    <article><h5>US market-implied reference windows</h5><p>{context?.policy_expectations_note ?? 'Expectations feed unavailable.'}</p><small>Status: {context?.policy_expectations_status ?? 'Unavailable'} · observed {date(context?.policy_expectations?.observed)}</small><div class="table-scroll"><table><thead><tr><th>Reference start</th><th>Expected rate</th><th>25th–75th percentile</th></tr></thead><tbody>{#each context?.policy_expectations?.outlook ?? [] as item}<tr><td>{date(item.reference_start)}</td><td>{finite(item.expected_rate_bps)?number(item.expected_rate_bps/100)+'%':'—'}</td><td>{number(finite(item.rate_25th_bps)?item.rate_25th_bps/100:null)}–{number(finite(item.rate_75th_bps)?item.rate_75th_bps/100:null)}%</td></tr>{:else}<tr><td colspan="3">No verified reference-window estimates available.</td></tr>{/each}</tbody></table></div><a href="https://www.atlantafed.org/research-and-data/data/market-probability-tracker" target="_blank" rel="noopener noreferrer">Atlanta Fed methodology</a><p>These are modelled reference windows, not probabilities of the next meeting decision. Japanese market-implied policy expectations are not connected.</p></article>
    <div class="grid"><article><h5>Official communications</h5><p>Headlines and original documents. Changes in guidance have not been automatically classified.</p>{#each news as item}<p><a href={safeSource(item.url)} target="_blank" rel="noopener noreferrer">{item.headline}</a><small>{item.source} · {time(item.published_at)}</small></p>{:else}<p>No relevant communications returned.</p>{/each}</article><article><h5>FX intervention watch</h5><p>Confirmation status: <strong>not independently checked in this snapshot</strong>.</p><p>Japan’s Ministry of Finance directs currency intervention; the BOJ executes it. A price spike is not proof of intervention.</p><p>Use the official operations record below. Warnings, reported activity and confirmed operations must remain distinct.</p><a href="https://www.mof.go.jp/english/policy/international_policy/reference/feio/index.html" target="_blank" rel="noopener noreferrer">Japan MOF intervention record</a></article></div>
    <article><h5>Policy and fiscal source library</h5><p>Official references for further reading. These links are not a claim that all documents have been analysed.</p>{#each context?.official_references ?? [] as source}<p><a href={safeSource(source.url)} target="_blank" rel="noopener noreferrer">{source.name}</a><small>{source.section} · {source.status}</small></p>{/each}</article>
  {:else if panel==='events'}
    <h4>Expectations versus releases</h4><p>Calendar status: {context?.calendar_status ?? 'Unavailable'}.</p><p>{context?.calendar_note ?? 'Calendar access is not established.'}</p><div class="table-scroll"><table><thead><tr><th>Release / time</th><th>Actual</th><th>Consensus</th><th>Previous</th><th>Revision</th></tr></thead><tbody>{#each events as event}<tr><td>{event.currency} · {event.event}<small>{time(event.time)} {event.unit ?? ''}</small>{#if safeSource(event.source_url)}<a href={safeSource(event.source_url)} target="_blank" rel="noopener noreferrer">Official source</a>{/if}</td><td>{event.actual ?? '—'}</td><td>{event.forecast ?? '—'}</td><td>{event.previous ?? '—'}</td><td>{event.revised ?? '—'}</td></tr>{:else}<tr><td colspan="5">No verified calendar records available. This does not mean no events are scheduled.</td></tr>{/each}</tbody></table></div><article><h5>How to read a surprise</h5><p>Compare the release with expectations recorded before publication, then examine yields, guidance and price response. The size of a surprise is not a guaranteed opportunity or a directional instruction.</p></article>
  {:else if panel==='positioning'}
    <h4>Positioning and participation</h4><p>CFTC positions describe individual futures markets. USD index positions are not USD/JPY positions; yen futures exposure has the opposite currency orientation to USD/JPY. Do not subtract contract counts across instruments.</p><div class="grid">{#each positions as item}<article><h5>{item.currency} futures</h5>{#if item.available}<dl><dt>{item.speculative_label} net contracts</dt><dd>{number(item.leveraged_net,0)}</dd><dt>Change from previous report</dt><dd>{number(item.leveraged_change,0)}</dd><dt>{item.intermediary_label} net contracts</dt><dd>{number(item.asset_manager_net,0)}</dd><dt>Open interest</dt><dd>{number(item.open_interest,0)}</dd><dt>Open-interest change</dt><dd>{number(item.open_interest_change,0)}</dd><dt>Net-position percentile</dt><dd>{number(finite(item.percentile_3y)?item.percentile_3y*100:null,0)}%</dd></dl><small>{item.report} · positions dated {date(item.date)} · {item.stale?'STALE':'Weekly, delayed'} · percentile across {item.history_observations ?? 'up to 156'} reports.</small>{:else}<p>Positioning unavailable.</p>{/if}</article>{:else}<article>No CFTC data supplied.</article>{/each}</div><p><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC definitions and release schedule</a></p>
    <article><h5>Retail positioning · Myfxbook</h5><p>{context?.retail?.status ?? 'Credentials and display permission required'}</p>{#if retail}<p>Long {number(retail.long_percent)}% · Short {number(retail.short_percent)}%</p><small>{retail.basis} · retrieved {time(context?.retail?.retrieved_at)}</small>{/if}<p>{context?.retail?.note ?? 'Provider samples remain separate. Retail positioning is not automatically wrong and institutions are not automatically right.'}</p></article><article><h5>Volume is not net money flow</h5><p>Open interest counts outstanding contracts; volume counts traded contracts. Positions can reflect hedging or arbitrage. Neither measure alone identifies institutional conviction or a complete view of spot-FX activity.</p></article>
  {:else if panel==='sources'}
    <h4>Sources, coverage and method</h4><p>Current research uses sourced observations and reproducible comparisons. Directional scores and trade probabilities are not used in this dashboard.</p><p>Snapshot: {time(context?.generated_at)} · {rows.filter(r=>indicatorTrust(r,now).status==='CURRENT').length}/{rows.length} relevant indicators currently within their configured source-specific research windows.</p>
    <article class="trust-legend"><h5>TRADE90 Data Trust states</h5><div>{#each Object.entries(trust.legend) as [status,description]}<p><span class="table-trust">{status}</span><strong>{description}</strong></p>{/each}</div></article>
    <div class="grid">{#each context?.services ?? [] as service}<article><h5>{service.name}</h5><strong>{service.status}</strong><p>{service.source}</p></article>{:else}<article>Source coverage will appear when the research feed is available.</article>{/each}</div><article><h5>Research boundaries</h5><ul>{#each context?.limitations ?? ['Source context is unavailable.'] as item}<li>{item}</li>{/each}<li>Gold research uses futures history; crypto and FX have different trading calendars.</li><li>No claim of a validated win rate or a single correct market value.</li></ul></article>
  {/if}
</section>
<style>
.brief,.trust,.catalyst,.evidence-balance{margin:16px 0;border:1px solid #dbe3ec;border-radius:14px;background:#fff;padding:18px}.brief-head,.balance-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.brief-head>span{font-size:.7rem;font-weight:800;border:1px solid #bbf7d0;background:#ecfdf5;color:#047857;border-radius:999px;padding:6px 9px}.brief-head>span.warning{border-color:#fde68a;background:#fffbeb;color:#a16207}.brief-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.brief-grid article{margin:0;padding:14px;background:#f8fafc}.brief-grid article>span,.balance-grid article>span{display:block;color:#64748b;font-size:.64rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}.brief-grid article>strong{display:block;color:#0f172a;font-size:.92rem;line-height:1.35}.brief-grid article>small{margin-top:5px}.trust{background:#0f172a;border-color:#1e293b;color:#e2e8f0}.trust .eyebrow{color:#6ee7b7}.trust-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.trust-head h5{color:#fff;margin:2px 0 0}.trust-head a{color:#a7f3d0;font-size:.72rem;font-weight:900}.trust-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:13px}.trust-grid article{margin:0;padding:13px;background:#111827;border:1px solid #334155}.trust-grid article>strong{display:block;margin-top:7px;color:#f8fafc;font-size:.77rem}.trust-grid article>small{margin-top:5px;color:#94a3b8;font-size:.66rem;line-height:1.42}.trust-status,.table-trust{display:inline-flex;align-items:center;width:max-content;border:1px solid #64748b;border-radius:999px;padding:3px 6px;color:#cbd5e1;font-size:.53rem;font-weight:950;letter-spacing:.07em}.trust-status.live,.trust-status.current{border-color:#10b981;color:#6ee7b7}.trust-status.delayed{border-color:#60a5fa;color:#93c5fd}.trust-status.stale,.table-trust.stale{border-color:#f59e0b;color:#fbbf24}.trust-status.unavailable{border-color:#64748b;color:#94a3b8}.trust-status.derived{border-color:#a78bfa;color:#c4b5fd}.trust-note{margin:10px 0 0;color:#94a3b8;font-size:.66rem;line-height:1.45}.trust-legend{background:#f8fafc}.trust-legend>div{display:grid;grid-template-columns:1fr 1fr;gap:5px 12px}.trust-legend p{display:flex;align-items:center;gap:9px;margin:4px 0;font-size:.72rem}.trust-legend .table-trust{color:#334155}.catalyst{border-color:#a7f3d0;background:#f0fdf4}.catalyst.unavailable{border-color:#cbd5e1;background:#f8fafc}.catalyst h5{margin:3px 0 6px}.catalyst p{margin:5px 0}.calendar-link{display:inline-flex;margin-top:9px;font-size:.75rem;font-weight:900}.evidence-balance{background:#f8fafc}.balance-head{display:block}.balance-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.balance-grid article{margin:0;padding:14px;background:#fff}.balance-grid article.support{border-top:3px solid #10b981}.balance-grid article.conflict{border-top:3px solid #f59e0b}.balance-grid article.missing{border-top:3px solid #94a3b8}.balance-grid p{font-size:.78rem;line-height:1.45;margin:8px 0}.balance-note{margin-top:10px;max-width:none}.research-detail{padding:16px;background:white;border:1px solid #dbe3ec;border-radius:12px;margin:12px 0}.grid .research-detail{margin:0;min-width:0}.research-detail summary{cursor:pointer;font-weight:700;min-height:44px;align-content:center;font-size:1rem}.research-detail summary:focus-visible{outline:3px solid #059669;outline-offset:3px}

.research{padding:22px;color:#172b3a;font-size:1rem;line-height:1.65;background:#f8fafc}.eyebrow{color:#047857;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}h4{font-size:1.65rem;line-height:1.25;margin:0 0 14px}h5{font-size:1.05rem;margin:0 0 12px}p{margin:10px 0}article{padding:20px;background:white;border:1px solid #dbe3ec;border-radius:12px;margin:16px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid article{margin:0}.grid{margin:16px 0}small{display:block;font-size:.82rem;line-height:1.5;color:#526474;max-width:55ch}a{color:#066747;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #059669;outline-offset:3px}.quality,.notice{padding:12px 16px;background:#eaf4f0;border:1px solid #bfd9ce;border-radius:8px}.warning{background:#fffbeb;border-color:#e9d6a0}dl{display:grid;grid-template-columns:1fr auto;gap:10px}dt{font-size:.9rem}dd{margin:0;font-weight:650;text-align:right}.table-scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:650px;text-align:left}th{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#526474}td,th{padding:13px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}td:first-child{min-width:240px}li{margin:8px 0}ul{padding-left:20px}@media(max-width:1050px){.trust-grid{grid-template-columns:1fr 1fr 1fr}}@media(max-width:900px){.brief-grid{grid-template-columns:1fr 1fr}.balance-grid{grid-template-columns:1fr}.trust-grid{grid-template-columns:1fr 1fr}.trust-legend>div{grid-template-columns:1fr}}@media(max-width:700px){.research{padding:16px 12px}.grid{grid-template-columns:1fr}.brief-grid{grid-template-columns:1fr}.brief,.trust,.catalyst,.evidence-balance{padding:14px}.trust-grid{grid-template-columns:1fr}.brief-head{align-items:flex-start;flex-direction:column}article{padding:16px}h4{font-size:1.4rem}dl{grid-template-columns:minmax(0,1fr) auto}}
</style>
