<script>
  import { onMount } from 'svelte';
  import ResearchOverview from './ResearchOverview.svelte';
  export let initialSymbol = 'USD/JPY';
  let previousSnapshot = null;
  let clock = Date.now();

  const SNAPSHOT_URL = '/api/terminal-snapshot';
  const STORAGE_KEY = 'trade90-terminal-snapshot-v3';
  const PANELS = [
    ['overview', 'Overview'],
    ['charts', 'Charts'],
    ['events', 'Events'],
    ['positioning', 'Positioning'],
    ['model', 'Model & validation'],
  ];

  let snapshot = null;
  let selected = initialSymbol;
  let activePanel = 'overview';
  let loading = true;
  let refreshing = false;
  let error = '';
  let usingSavedSnapshot = false;
  let lastChecked = null;

  $: pairs = snapshot?.pairs ?? [];
  $: active = pairs.find((pair) => pair.symbol === selected) ?? pairs[0];
  $: currentPrice = indicativePrice(active, clock);

  function indicativePrice(pair, now) {
    const price = pair?.live?.price;
    const age = now - Date.parse(pair?.live?.updated_at);
    return typeof price === 'number' && Number.isFinite(price) && price > 0 && Number.isFinite(age) && age >= -60000 && age <= 900000 ? price : null;
  }
  $: intradayChart = buildChart(active?.live?.intraday ?? [], ['close']);
  $: historyChart = buildChart(active?.history ?? [], ['close', 'ema_fast', 'ema_slow']);
  $: auditMax = Math.max(1, ...(active?.model?.audit ?? []).map((item) => Math.abs(Number(item.contribution) || 0)));

  const pct = (value, digits = 0) => value == null ? '—' : `${(Number(value) * 100).toFixed(digits)}%`;
  const signedPct = (value, digits = 2) => value == null ? '—' : `${Number(value) >= 0 ? '+' : ''}${(Number(value) * 100).toFixed(digits)}%`;
  const num = (value, digits = 2) => value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
  const signed = (value, digits = 1) => value == null || !Number.isFinite(Number(value)) ? '—' : `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(digits)}`;
  const scoreClass = (value) => value > 18 ? 'positive' : value < -18 ? 'negative' : 'neutral';
  const scoreLabel = (value) => value > 18 ? 'Bullish' : value < -18 ? 'Bearish' : 'Neutral';
  const changeClass = (value) => value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  const eventClass = (level) => ['Extreme', 'High'].includes(level) ? 'negative' : level === 'Elevated' ? 'caution' : 'neutral';

  function formatDate(value, withTime = true) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const options = withTime
      ? { dateStyle: 'medium', timeStyle: 'short' }
      : { dateStyle: 'medium' };
    return date.toLocaleString([], options);
  }

  function buildChart(rows, keys, width = 800, height = 260) {
    if (!Array.isArray(rows) || rows.length < 2) return null;
    const cleanRows = rows.filter((row) => keys.some((key) => Number.isFinite(Number(row?.[key]))));
    if (cleanRows.length < 2) return null;
    const values = cleanRows.flatMap((row) => keys.map((key) => Number(row?.[key])).filter(Number.isFinite));
    const low = Math.min(...values);
    const high = Math.max(...values);
    const range = high - low || Math.max(Math.abs(high) * 0.01, 1);
    const pad = range * 0.08;
    const min = low - pad;
    const max = high + pad;
    const x = (index) => (index / Math.max(cleanRows.length - 1, 1)) * width;
    const y = (value) => height - ((value - min) / (max - min)) * height;
    const paths = keys.map((key) => {
      let path = '';
      let drawing = false;
      cleanRows.forEach((row, index) => {
        const value = Number(row?.[key]);
        if (!Number.isFinite(value)) {
          drawing = false;
          return;
        }
        path += `${drawing ? ' L' : 'M'} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`;
        drawing = true;
      });
      return { key, path };
    }).filter((series) => series.path);
    return {
      width,
      height,
      paths,
      min,
      max,
      first: cleanRows[0]?.date ?? cleanRows[0]?.time,
      last: cleanRows.at(-1)?.date ?? cleanRows.at(-1)?.time,
    };
  }

  function savedSnapshot() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return data?.schema_version === 1 && Array.isArray(data?.pairs) ? data : null;
    } catch {
      return null;
    }
  }

  async function load(quiet = false) {
    if (quiet) refreshing = true;
    else loading = true;
    try {
      const response = await fetch(`${SNAPSHOT_URL}?v=${Date.now()}`, {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Terminal service unavailable (${response.status})`);
      const data = await response.json();
      if (data.schema_version !== 1 || !Array.isArray(data.pairs) || data.pairs.length === 0) {
        throw new Error('Unsupported terminal data');
      }
      const prior = snapshot ?? savedSnapshot();
      if (prior?.generated_at && Date.parse(prior.generated_at) < Date.parse(data.generated_at)) previousSnapshot = prior;
      snapshot = data;
      error = '';
      usingSavedSnapshot = false;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Research remains usable when storage is blocked. */ }
      if (!data.pairs.some((pair) => pair.symbol === selected)) selected = data.pairs[0]?.symbol;
    } catch (err) {
      const saved = snapshot ?? savedSnapshot();
      if (saved) {
        snapshot = saved;
        usingSavedSnapshot = true;
        error = 'Live refresh was interrupted. Showing the last saved research snapshot.';
      } else {
        error = err instanceof Error ? err.message : 'Terminal data is temporarily unavailable';
      }
    } finally {
      lastChecked = new Date();
      loading = false;
      refreshing = false;
    }
  }

  function trackResearch(event, values) {
    try {
      if (localStorage.getItem('cookieConsent') === 'accepted' && typeof window.gtag === 'function') window.gtag('event', event, values);
    } catch { /* Analytics never blocks research. */ }
  }

  function chooseMarket(symbol) {
    trackResearch('research_market_selected', { instrument: symbol });
    selected = symbol;
    activePanel = 'overview';
  }

  onMount(() => {
    load();
    const timer = setInterval(() => load(true), 300000);
    const clockTimer = setInterval(() => { clock = Date.now(); }, 60000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  });
</script>

<div class="terminal">
  <header class="terminal-bar">
    <div>
      <span class="eyebrow">TRADE90 · Native multi-asset intelligence</span>
      <h2>Research terminal</h2>
    </div>
    <div class="status-wrap">
      <div class="status" role="status" aria-live="polite">
        <span class:live={Boolean(snapshot) && !usingSavedSnapshot}></span>
        {#if usingSavedSnapshot}
          Saved snapshot
        {:else if snapshot?.live_quote_count > 0}
          Live prices online
        {:else if snapshot}
          Research snapshot online
        {:else}
          Connecting
        {/if}
      </div>
      <button class="refresh" type="button" on:click={() => load(true)} disabled={refreshing} aria-label="Refresh terminal data">
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  </header>

  {#if loading}
    <div class="notice" role="status" aria-live="polite">Loading live prices and the latest research model…</div>
  {:else if error && !snapshot}
    <div class="error">
      <strong>Terminal data is temporarily unavailable.</strong>
      <span>{error}</span>
      <button type="button" on:click={() => load()}>Retry</button>
    </div>
  {:else if active}
    {#if error}
      <div class="warning" role="status">{error}</div>
    {/if}

    <section class="freshness" aria-label="Data freshness">
      <div><span>Indicative prices</span><strong>{snapshot.live_quote_count ?? 0}/{pairs.length} markets</strong></div>
      <div><span>Price refresh</span><strong>Every 5 minutes</strong></div>
      <div><span>Research model</span><strong>{formatDate(snapshot.generated_at)}</strong></div>
      <div><span>Last checked</span><strong>{formatDate(lastChecked)}</strong></div>
    </section>

    <div class="pair-tabs" role="tablist" aria-label="Markets">
      {#each pairs as pair}
        <button
          type="button"
          role="tab"
          aria-selected={pair.symbol === active.symbol}
          class:active={pair.symbol === active.symbol}
          on:click={() => chooseMarket(pair.symbol)}
        >
          <span>{pair.symbol}</span>
          <small class={changeClass(pair.live?.change_pct)}>{signedPct(pair.live?.change_pct)}</small>
        </button>
      {/each}
    </div>

    <section class="scanner" aria-label="Multi-asset market scanner">
      <div class="scanner-head">
        <span>Market</span><span>Indicative price</span><span>Day</span><span>Model score</span><span>5D scenario</span><span>Event risk</span>
      </div>
      {#each pairs as pair}
        <button
          type="button"
          aria-label={`Open ${pair.symbol}: price ${num(indicativePrice(pair, clock), pair.decimals)}, model score ${signed(pair.score)}, ${pair.bias} five-day scenario`}
          aria-pressed={pair.symbol === active.symbol}
          class:chosen={pair.symbol === active.symbol}
          on:click={() => chooseMarket(pair.symbol)}
        >
          <strong>{pair.symbol}</strong>
          <span>{num(indicativePrice(pair, clock), pair.decimals)}</span>
          <span class={changeClass(pair.live?.change_pct)}>{signedPct(pair.live?.change_pct)}</span>
          <span class={scoreClass(pair.score)}>{signed(pair.score)}</span>
          <span>{pair.bias}</span>
          <span class={eventClass(pair.events?.risk?.level)}>{pair.events?.risk?.level ?? '—'}</span>
        </button>
      {/each}
    </section>

    <div class="selected-head">
      <div>
        <span class="eyebrow">Selected market</span>
        <h3>{active.symbol}</h3>
        <p>{active.asset_class ?? 'FX'} · {active.symbol === 'XAU/USD' ? 'Spot quote; futures-based historical research. Their price levels are not interchangeable.' : active.model.price_note}</p>
      </div>
      <div class="headline-price">
        <span>{active.symbol === 'XAU/USD' ? (currentPrice !== null ? 'Gold · USD per troy ounce' : 'Gold quote unavailable') : (currentPrice !== null ? 'Indicative price' : 'Quote unavailable')}</span>
        <strong>{num(currentPrice, active.decimals)}</strong>
        {#if active.symbol === 'XAU/USD'}
          <small>{active.live ? `${active.live.provider} · ${formatDate(active.live.updated_at)}` : 'No fresh spot quote available'}</small>
        {:else}
          <small class={changeClass(active.live?.change_pct)}>{signedPct(active.live?.change_pct)} today</small>
        {/if}
      </div>
    </div>

    <ResearchOverview pair={active} generatedAt={snapshot.generated_at} previous={previousSnapshot?.pairs?.find(pair => pair.symbol === active.symbol)} previousAt={previousSnapshot?.generated_at} now={clock} />

    <nav class="panel-tabs" aria-label={`${active.symbol} research sections`}>
      {#each PANELS as panel}
        <button
          type="button"
          aria-current={activePanel === panel[0] ? 'page' : undefined}
          class:active={activePanel === panel[0]}
          on:click={() => { activePanel = panel[0]; trackResearch('research_panel_opened', { instrument: selected, panel: panel[0] }); }}
        >{panel[1]}</button>
      {/each}
    </nav>

    {#if activePanel === 'overview'}
      <section class="panel" aria-label={`${active.symbol} overview`}>
        <div class="facts">
          <article><span>Indicative price</span><strong>{num(currentPrice, active.decimals)}</strong><small>{active.live ? formatDate(active.live.updated_at) : 'Live quote unavailable'}</small></article>
          <article><span>{active.symbol === 'XAU/USD' ? 'Futures model close' : 'Model close'}</span><strong>{num(active.price, active.decimals)}</strong><small>{formatDate(active.quality.last_price, false)}</small></article>
          <article><span>{active.market.macro_label ?? '10Y yield spread'}</span><strong>{signed(active.market.yield_spread, 2)} pp</strong></article>
          <article><span>20D volatility</span><strong>{pct(active.market.volatility)}</strong><small>{active.market.regime}</small></article>
          <article><span>Event risk</span><strong class={eventClass(active.events?.risk?.level)}>{active.events?.risk?.level ?? 'Unknown'}</strong><small>{active.events?.risk?.next_event ?? 'No supported event due'}</small></article>
          <article><span>Data quality</span><strong>Grade {active.quality.grade}</strong><small>{pct(active.quality.completeness)} usable</small></article>
        </div>

        <div class="layers">
          <article>
            <span class="step">01 · Model interpretation</span>
            <div class="score-row">
              <strong class={scoreClass(active.score)}>{signed(active.score)}</strong>
              <span>{scoreLabel(active.score)} model evidence</span>
            </div>
            <p>{active.model.thesis}</p>
            <small>Instrument-specific, bounded model. The score is interpretation, not an observed fact or trade instruction.</small>
          </article>

          <article>
            <span class="step">02 · Five-day probabilities</span>
            <div class="probabilities">
              <div><span>Bullish</span><strong>{pct(active.probabilities.Bullish)}</strong><i style={`width:${pct(active.probabilities.Bullish)}`}></i></div>
              <div><span>Range</span><strong>{pct(active.probabilities['Range/neutral'])}</strong><i style={`width:${pct(active.probabilities['Range/neutral'])}`}></i></div>
              <div><span>Bearish</span><strong>{pct(active.probabilities.Bearish)}</strong><i style={`width:${pct(active.probabilities.Bearish)}`}></i></div>
            </div>
            <small>{active.sample_size} similar observations · {active.confidence} confidence. Historical frequencies are not promises.</small>
          </article>
        </div>

        <div class="planning">
          <div><span>{active.symbol === 'XAU/USD' ? 'Futures 20D support' : '20D support'}</span><strong>{num(active.market.support20, active.decimals)}</strong></div>
          <div><span>{active.symbol === 'XAU/USD' ? 'Futures 20D resistance' : '20D resistance'}</span><strong>{num(active.market.resistance20, active.decimals)}</strong></div>
          <div><span>ATR-style range</span><strong>{num(active.market.atr20, active.decimals)}</strong></div>
          <div><span>Cross-asset driver</span><strong>{active.market.driver}</strong></div>
        </div>

        {#if active.quality.stale_inputs?.length}
          <div class="warning">Excluded stale inputs: {active.quality.stale_inputs.join(', ')}.</div>
        {/if}
      </section>
    {:else if activePanel === 'charts'}
      <section class="panel chart-panel" aria-label={`${active.symbol} charts`}>
        <article class="chart-card">
          <div class="card-head">
            <div><span class="step">Indicative market feed</span><h4>Current-session price</h4></div>
            <div class="chart-stat"><strong>{num(currentPrice, active.decimals)}</strong><small class={changeClass(active.live?.change_pct)}>{signedPct(active.live?.change_pct)}</small></div>
          </div>
          {#if intradayChart}
            <div class="chart-wrap">
              <svg viewBox={`0 0 ${intradayChart.width} ${intradayChart.height}`} preserveAspectRatio="none" role="img" aria-label={`${active.symbol} current-session price chart`}>
                <line x1="0" y1="65" x2="800" y2="65"></line><line x1="0" y1="130" x2="800" y2="130"></line><line x1="0" y1="195" x2="800" y2="195"></line>
                {#each intradayChart.paths as series}<path class="close" d={series.path}></path>{/each}
              </svg>
              <div class="chart-scale"><span>{num(intradayChart.max, active.decimals)}</span><span>{num(intradayChart.min, active.decimals)}</span></div>
            </div>
            <div class="chart-dates"><span>{formatDate(intradayChart.first)}</span><span>{formatDate(intradayChart.last)}</span></div>
          {:else}
            <div class="empty-state">{active.symbol === 'XAU/USD' ? 'This gold feed supplies the latest quote only; intraday history and daily change are unavailable.' : 'The current-session chart is unavailable while this market is closed or the quote provider is delayed.'}</div>
          {/if}
          <p class="source-note">{active.symbol === 'XAU/USD' ? 'Gold quote in USD per troy ounce' : 'Indicative 5-minute data'} from {active.live?.provider ?? 'the public market feed'}. Confirm executable prices with your broker.</p>
        </article>

        <article class="chart-card">
          <div class="card-head">
            <div><span class="step">Research structure</span><h4>{active.symbol === 'XAU/USD' ? '120-session futures history and moving averages' : '120-session price and moving averages'}</h4></div>
            <div class="legend"><span class="legend-close">Close</span><span class="legend-fast">EMA 20</span><span class="legend-slow">EMA 50</span></div>
          </div>
          {#if historyChart}
            <div class="chart-wrap">
              <svg viewBox={`0 0 ${historyChart.width} ${historyChart.height}`} preserveAspectRatio="none" role="img" aria-label={`${active.symbol} 120-session price structure chart`}>
                <line x1="0" y1="65" x2="800" y2="65"></line><line x1="0" y1="130" x2="800" y2="130"></line><line x1="0" y1="195" x2="800" y2="195"></line>
                {#each historyChart.paths as series}<path class={series.key} d={series.path}></path>{/each}
              </svg>
              <div class="chart-scale"><span>{num(historyChart.max, active.decimals)}</span><span>{num(historyChart.min, active.decimals)}</span></div>
            </div>
            <div class="chart-dates"><span>{formatDate(historyChart.first, false)}</span><span>{formatDate(historyChart.last, false)}</span></div>
          {:else}
            <div class="empty-state">Historical chart data will appear after the next enriched research refresh.</div>
          {/if}
        </article>
      </section>
    {:else if activePanel === 'events'}
      <section class="panel" aria-label={`${active.symbol} event risk`}>
        <div class="event-summary">
          <article><span>Current risk</span><strong class={eventClass(active.events?.risk?.level)}>{active.events?.risk?.level ?? 'Unknown'}</strong></article>
          <article><span>High-impact events / 24h</span><strong>{active.events?.risk?.count_24h ?? 0}</strong></article>
          <article><span>Next event</span><strong>{active.events?.risk?.hours == null ? 'None scheduled' : `${num(active.events.risk.hours, 1)}h`}</strong><small>{active.events?.risk?.next_event ?? 'No supported event due'}</small></article>
        </div>
        <div class="section-copy">
          <span class="step">Economic calendar</span>
          <h4>Upcoming pair-relevant events</h4>
          <p>Scheduled events change the risk label only. They never add bullish or bearish points to the model.</p>
        </div>
        {#if active.events?.upcoming?.length}
          <div class="event-list">
            {#each active.events.upcoming as event}
              <article>
                <time datetime={event.time}>{formatDate(event.time)}</time>
                <strong>{event.event}</strong>
                <span>{event.currency} · {event.side}</span>
                <small>Previous {event.previous ?? '—'} · Consensus {event.forecast ?? '—'}</small>
              </article>
            {/each}
          </div>
        {:else}
          <div class="empty-state">No supported high-impact events were returned for this market in the current window.</div>
        {/if}
        <p class="source-note">Calendar: {snapshot.sources?.calendar?.provider ?? 'Trading Economics'} · {snapshot.sources?.calendar?.mode ?? 'public feed'}. Event times and figures can change; verify them with the primary release source.</p>
      </section>
    {:else if activePanel === 'positioning'}
      <section class="panel" aria-label={`${active.symbol} positioning`}>
        <div class="section-copy">
          <span class="step">Weekly derivatives context</span>
          <h4>Leveraged-fund positioning</h4>
          <p>CFTC positioning is delayed weekly context, not a live signal and not part of the directional score.</p>
        </div>
        {#if active.positioning?.available}
          <div class="position-grid">
            <article>
              <span>{active.base} leveraged net</span>
              <strong>{Number(active.positioning.base.leveraged_net).toLocaleString()}</strong>
              <small>{pct(active.positioning.base.percentile_3y)} 3Y percentile · {active.positioning.base.crowding}</small>
            </article>
            <article>
              <span>{active.quote} leveraged net</span>
              <strong>{Number(active.positioning.quote.leveraged_net).toLocaleString()}</strong>
              <small>{pct(active.positioning.quote.percentile_3y)} 3Y percentile · {active.positioning.quote.crowding}</small>
            </article>
            <article>
              <span>Relative crowding</span>
              <strong>{signedPct(active.positioning.relative_percentile, 0)}</strong>
              <small>Base percentile minus quote percentile</small>
            </article>
            <article>
              <span>Latest report age</span>
              <strong>{Math.max(active.positioning.base.age_days, active.positioning.quote.age_days)} days</strong>
              <small>{formatDate(active.positioning.fetched_at)}</small>
            </article>
          </div>
          {#if active.positioning.warning}<div class="warning">{active.positioning.warning}</div>{/if}
        {:else}
          <div class="empty-state">
            <strong>Complete base/quote positioning is unavailable for this market.</strong>
            <span>{active.positioning?.warning ?? 'A verified derivatives series is not configured for both sides of this instrument.'}</span>
          </div>
        {/if}
        <p class="source-note">Provider: {active.positioning?.provider ?? 'CFTC Traders in Financial Futures'} · {active.positioning?.cadence ?? 'weekly and delayed'}.</p>
      </section>
    {:else if activePanel === 'model'}
      <section class="panel model-panel" aria-label={`${active.symbol} model and validation`}>
        <article class="audit-card">
          <div class="section-copy">
            <span class="step">Contribution audit</span>
            <h4>What is moving the score</h4>
            <p>Each contribution is bounded and explains the current model interpretation.</p>
          </div>
          {#if active.model?.audit?.length}
            <div class="audit-list">
              {#each active.model.audit as item}
                <div>
                  <span>{item.name}</span>
                  <div class="audit-track"><i class:negative-bar={item.contribution < 0} style={`width:${Math.max(2, Math.abs(item.contribution) / auditMax * 100)}%`}></i></div>
                  <strong class={changeClass(item.contribution)}>{signed(item.contribution, 2)}</strong>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">The contribution audit will appear after the next enriched research refresh.</div>
          {/if}
        </article>

        <article class="validation-card">
          <div class="section-copy">
            <span class="step">Out-of-sample checks</span>
            <h4>Directional validation</h4>
            <p>Validation measures historical behavior after the training window. It does not guarantee future performance.</p>
          </div>
          <div class="validation-summary">
            <div><span>OOS accuracy</span><strong>{pct(active.validation?.walk_forward?.['OOS directional accuracy'])}</strong></div>
            <div><span>OOS observations</span><strong>{num(active.validation?.walk_forward?.['OOS observations'], 0)}</strong></div>
            <div><span>Current sample</span><strong>{active.sample_size}</strong></div>
            <div><span>Confidence</span><strong>{active.confidence}</strong></div>
          </div>
          {#if active.validation?.horizons?.length}
            <div class="validation-table">
              <div class="validation-head"><span>Horizon</span><span>Model</span><span>Baseline</span><span>Lift</span><span>Observations</span></div>
              {#each active.validation.horizons as row}
                <div><strong>{row.Horizon}</strong><span>{pct(row['Model accuracy'])}</span><span>{pct(row['Majority baseline'])}</span><span class={changeClass(row['Lift vs baseline'])}>{signedPct(row['Lift vs baseline'], 1)}</span><span>{row['OOS observations']}</span></div>
              {/each}
            </div>
          {/if}
        </article>

        <div class="method-note">
          <strong>Method boundary</strong>
          <p>{active.model.thesis}. Model facts, judgement, historical frequencies, event risk, and positioning are kept separate so one layer cannot masquerade as another.</p>
        </div>
      </section>
    {/if}

    <footer>
      <span>{snapshot.cadence}</span>
      <span>Price feed: indicative only · Research and education, not a trade signal</span>
    </footer>
  {/if}
</div>

<style>
  .terminal{--ink:#0f172a;--muted:#64748b;--line:#dbe3ec;--green:#047857;--green-dark:#064e3b;--soft:#f8fafc;--red:#b91c1c;background:#fff;color:var(--ink);border:1px solid #cbd5e1;border-radius:20px;overflow:hidden;box-shadow:0 22px 55px rgba(15,23,42,.1)}
  .terminal-bar,.selected-head,footer{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .terminal-bar{padding:22px 24px;border-bottom:1px solid var(--line);background:linear-gradient(135deg,#f0fdf4,#fff 55%)}
  h2,h3,h4{margin:3px 0 0;color:#020617;font-weight:900;letter-spacing:-.04em}h2,h3{text-transform:uppercase}h2{font-size:1.35rem}h3{font-size:2rem}h4{font-size:1.05rem}
  p{color:#475569}.eyebrow,.step{font-size:.65rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--green)}
  .status-wrap{display:flex;align-items:center;gap:10px}.status{display:flex;align-items:center;gap:8px;font-size:.68rem;font-weight:800;text-transform:uppercase;color:#475569}.status>span{width:8px;height:8px;border-radius:50%;background:#ef4444}.status>span.live{background:#10b981;box-shadow:0 0 0 4px #d1fae5}
  .refresh{border:1px solid #a7f3d0;background:#fff;color:#065f46;border-radius:8px;padding:8px 10px;font-size:.65rem;font-weight:900;text-transform:uppercase;cursor:pointer}.refresh:disabled{opacity:.55;cursor:wait}
  .notice,.error{padding:52px 24px;text-align:center;color:#475569}.error{display:grid;gap:10px;background:#fff7ed}.error strong{color:#9a3412}.error button{justify-self:center;border:0;border-radius:8px;padding:10px 14px;font-weight:800;background:#047857;color:white;cursor:pointer}
  .warning{margin:12px 18px;padding:11px 13px;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;border-radius:9px;font-size:.75rem}
  .freshness{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line);background:#0f172a;color:#fff}.freshness>div{padding:12px 16px;border-right:1px solid #334155}.freshness>div:last-child{border:0}.freshness span{display:block;color:#94a3b8;font-size:.56rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.freshness strong{display:block;margin-top:4px;font-size:.7rem;color:#f8fafc}
  .pair-tabs{display:flex;gap:8px;padding:14px 16px;overflow-x:auto;border-bottom:1px solid var(--line);background:var(--soft)}.pair-tabs button{display:grid;gap:3px;min-width:88px;white-space:nowrap;border:1px solid var(--line);background:#fff;color:#334155;padding:9px 11px;border-radius:9px;font-size:.72rem;font-weight:900;cursor:pointer;text-align:left}.pair-tabs button small{font-size:.58rem}.pair-tabs button.active{background:var(--green-dark);color:#fff;border-color:var(--green-dark)}.pair-tabs button.active small{color:#d1fae5!important}
  .scanner{margin:18px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.scanner-head,.scanner button{display:grid;grid-template-columns:1fr 1fr .7fr .8fr 1fr .8fr;align-items:center;gap:10px;text-align:left;padding:10px 14px}.scanner-head{background:#f1f5f9;color:#64748b;font-size:.58rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.scanner button{width:100%;border:0;border-top:1px solid #eef2f7;background:#fff;color:#334155;font-size:.74rem;cursor:pointer}.scanner button:hover,.scanner button.chosen{background:#ecfdf5}.scanner strong{color:#0f172a}
  .positive{color:#047857!important}.negative{color:#b91c1c!important}.neutral{color:#475569!important}.caution{color:#b45309!important}
  .selected-head{padding:24px 20px 14px}.selected-head p{margin:4px 0 0;font-size:.72rem}.headline-price{text-align:right}.headline-price>span{display:block;color:#64748b;font-size:.58rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.headline-price>strong{display:block;font-size:1.8rem;color:#020617}.headline-price>small{font-size:.7rem;font-weight:800}
  .panel-tabs{display:flex;gap:4px;padding:0 20px 14px;overflow-x:auto;border-bottom:1px solid var(--line)}.panel-tabs button{white-space:nowrap;border:0;background:#f1f5f9;color:#475569;border-radius:8px;padding:9px 12px;font-size:.66rem;font-weight:900;cursor:pointer}.panel-tabs button.active{background:#064e3b;color:#fff}
  .panel{padding:18px 20px 22px}.facts{display:grid;grid-template-columns:repeat(6,1fr);gap:9px}.facts article,.layers article,.planning>div,.event-summary article,.position-grid article,.chart-card,.audit-card,.validation-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:15px}.facts span,.planning span,.event-summary span,.position-grid span,.validation-summary span{display:block;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:7px}.facts strong,.planning strong,.event-summary strong,.position-grid strong,.validation-summary strong{display:block;color:#0f172a;font-size:.96rem}.facts small,.event-summary small,.position-grid small{display:block;margin-top:4px;color:#64748b;font-size:.6rem;line-height:1.35}
  .layers{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.layers article{background:var(--soft)}.layers p{font-size:.82rem;line-height:1.55}.layers small{color:#64748b;line-height:1.45}.score-row{display:flex;align-items:baseline;gap:12px;margin-top:12px}.score-row strong{font-size:2rem}.score-row span{font-weight:800;color:#334155}
  .probabilities{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:13px 0}.probabilities>div{position:relative;overflow:hidden;padding:10px;border-radius:9px;background:#fff;border:1px solid var(--line)}.probabilities span{display:block;font-size:.61rem;color:#64748b}.probabilities strong{position:relative;z-index:1;color:#0f172a}.probabilities i{position:absolute;left:0;bottom:0;height:3px;background:#10b981}
  .planning{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.panel>.warning{margin:12px 0 0}
  .chart-panel{display:grid;gap:14px}.chart-card{padding:17px}.card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}.chart-stat{text-align:right}.chart-stat strong{display:block;font-size:1.25rem}.chart-stat small{font-size:.7rem;font-weight:800}.legend{display:flex;gap:12px;flex-wrap:wrap;color:#64748b;font-size:.62rem}.legend span:before{content:'';display:inline-block;width:14px;height:2px;margin-right:5px;vertical-align:middle}.legend-close:before{background:#047857}.legend-fast:before{background:#2563eb}.legend-slow:before{background:#7c3aed}
  .chart-wrap{position:relative;height:250px;padding-right:48px}.chart-wrap svg{width:100%;height:100%;overflow:visible}.chart-wrap line{stroke:#e2e8f0;stroke-width:1}.chart-wrap path{fill:none;stroke-width:3;vector-effect:non-scaling-stroke}.chart-wrap path.close{stroke:#047857}.chart-wrap path.ema_fast{stroke:#2563eb;stroke-width:2}.chart-wrap path.ema_slow{stroke:#7c3aed;stroke-width:2}.chart-scale{position:absolute;right:0;top:0;bottom:0;display:flex;flex-direction:column;justify-content:space-between;color:#64748b;font-size:.6rem}.chart-dates{display:flex;justify-content:space-between;margin-top:7px;color:#64748b;font-size:.6rem}.source-note{margin:13px 0 0;color:#64748b;font-size:.68rem;line-height:1.5}
  .section-copy{max-width:720px;margin-bottom:16px}.section-copy p{margin:5px 0 0;font-size:.77rem;line-height:1.5}.event-summary,.position-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.event-list{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.event-list article{display:grid;gap:4px;padding:13px;border:1px solid var(--line);border-radius:10px;background:#f8fafc}.event-list time{color:#047857;font-size:.62rem;font-weight:900}.event-list strong{font-size:.78rem}.event-list span,.event-list small{color:#64748b;font-size:.65rem}.position-grid{grid-template-columns:repeat(4,1fr)}
  .empty-state{display:grid;gap:5px;padding:24px;border:1px dashed #cbd5e1;border-radius:11px;background:#f8fafc;color:#64748b;text-align:center;font-size:.75rem}.empty-state strong{color:#334155}
  .model-panel{display:grid;grid-template-columns:1fr 1fr;gap:14px}.audit-card,.validation-card{padding:18px}.audit-list{display:grid;gap:10px}.audit-list>div{display:grid;grid-template-columns:120px 1fr 50px;align-items:center;gap:10px;font-size:.68rem}.audit-track{height:7px;border-radius:999px;background:#e2e8f0;overflow:hidden}.audit-track i{display:block;height:100%;border-radius:999px;background:#10b981}.audit-track i.negative-bar{background:#ef4444}.audit-list strong{text-align:right;font-size:.7rem}
  .validation-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.validation-summary>div{padding:11px;border-radius:9px;background:#f8fafc;border:1px solid var(--line)}.validation-table{border:1px solid var(--line);border-radius:9px;overflow:hidden}.validation-table>div{display:grid;grid-template-columns:.8fr 1fr 1fr 1fr 1.1fr;gap:6px;padding:9px 10px;border-top:1px solid #eef2f7;font-size:.63rem}.validation-table>div:first-child{border:0}.validation-head{background:#f1f5f9;color:#64748b;font-weight:900;text-transform:uppercase}.method-note{grid-column:1/-1;padding:16px;border:1px solid #a7f3d0;border-radius:11px;background:#ecfdf5}.method-note strong{color:#065f46}.method-note p{margin:4px 0 0;font-size:.75rem;line-height:1.5}
  footer{border-top:1px solid var(--line);background:#f8fafc;padding:13px 20px;font-size:.64rem;color:#64748b}footer span:last-child{text-align:right}
  @media(max-width:1050px){.facts{grid-template-columns:repeat(3,1fr)}.model-panel{grid-template-columns:1fr}.method-note{grid-column:auto}}
  @media(max-width:800px){.freshness{grid-template-columns:repeat(2,1fr)}.freshness>div:nth-child(2){border-right:0}.freshness>div:nth-child(-n+2){border-bottom:1px solid #334155}.scanner-head{display:none}.scanner button{grid-template-columns:1fr 1fr 1fr}.scanner button span:nth-of-type(3),.scanner button span:nth-of-type(4),.scanner button span:nth-of-type(5){display:none}.facts{grid-template-columns:repeat(2,1fr)}.layers{grid-template-columns:1fr}.planning,.position-grid{grid-template-columns:repeat(2,1fr)}.event-list{grid-template-columns:1fr}.event-summary{grid-template-columns:1fr 1fr}.event-summary article:last-child{grid-column:1/-1}.validation-summary{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.terminal{border-radius:14px}.terminal-bar,.selected-head,footer{align-items:flex-start;flex-direction:column}.terminal-bar{padding:18px}.status-wrap{width:100%;justify-content:space-between}.scanner{margin:12px}.scanner button{padding:11px}.selected-head{padding:20px 13px 12px}.headline-price{text-align:left}.panel-tabs{padding-left:12px;padding-right:12px}.panel{padding:14px 12px 18px}.facts{grid-template-columns:1fr 1fr}.facts article:nth-child(5),.facts article:nth-child(6){grid-column:auto}.planning{grid-template-columns:1fr 1fr}.probabilities{grid-template-columns:1fr 1fr 1fr}.chart-wrap{height:200px}.card-head{flex-direction:column}.chart-stat{text-align:left}.event-summary{grid-template-columns:1fr}.event-summary article:last-child{grid-column:auto}.position-grid{grid-template-columns:1fr 1fr}.audit-list>div{grid-template-columns:92px 1fr 42px}.validation-table{overflow-x:auto}.validation-table>div{min-width:480px}.freshness strong{font-size:.64rem}footer span:last-child{text-align:left}}
</style>
