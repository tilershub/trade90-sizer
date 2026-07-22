<script>
  import { onMount } from 'svelte';

  const SNAPSHOT_URL = 'https://raw.githubusercontent.com/tilershub/usdjpy-research-lab/main/public/terminal-snapshot.json';
  const ADVANCED_URL = 'https://usdjpy-research-lab-f8nkfpp3xx4tgonywqxappk.streamlit.app/';

  let snapshot = null;
  let selected = 'USD/JPY';
  let loading = true;
  let error = '';

  $: pairs = snapshot?.pairs ?? [];
  $: active = pairs.find((pair) => pair.symbol === selected) ?? pairs[0];

  const pct = (value) => value == null ? '—' : `${(value * 100).toFixed(0)}%`;
  const num = (value, digits = 2) => value == null ? '—' : Number(value).toFixed(digits);
  const signed = (value, digits = 1) => value == null ? '—' : `${value >= 0 ? '+' : ''}${Number(value).toFixed(digits)}`;
  const scoreClass = (value) => value > 18 ? 'positive' : value < -18 ? 'negative' : 'neutral';

  async function load() {
    try {
      error = '';
      const response = await fetch(`${SNAPSHOT_URL}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Snapshot unavailable (${response.status})`);
      const data = await response.json();
      if (data.schema_version !== 1 || !Array.isArray(data.pairs)) throw new Error('Unsupported terminal data');
      snapshot = data;
      if (!data.pairs.some((pair) => pair.symbol === selected)) selected = data.pairs[0]?.symbol;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Terminal data is temporarily unavailable';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();
    const timer = setInterval(load, 300000);
    return () => clearInterval(timer);
  });
</script>

<div class="terminal">
  <header class="terminal-bar">
    <div>
      <span class="eyebrow">TRADE90 · Multi-asset intelligence</span>
      <h2>FX, gold &amp; Bitcoin terminal</h2>
    </div>
    <div class="status">
      <span class:live={!error}></span>
      {error ? 'Data interrupted' : snapshot ? 'Snapshot online' : 'Connecting'}
    </div>
  </header>

  {#if loading}
    <div class="notice">Loading the latest research snapshot…</div>
  {:else if error}
    <div class="error">
      <strong>Native terminal data is temporarily unavailable.</strong>
      <span>{error}. The advanced workspace remains available during this migration.</span>
      <div class="actions">
        <button on:click={load}>Retry</button>
        <a href={ADVANCED_URL} target="_blank" rel="noopener noreferrer">Open advanced workspace ↗</a>
      </div>
    </div>
  {:else if active}
    <div class="pair-tabs" role="tablist" aria-label="Markets">
      {#each pairs as pair}
        <button class:active={pair.symbol === active.symbol} on:click={() => selected = pair.symbol}>
          {pair.symbol}
        </button>
      {/each}
    </div>

    <section class="scanner" aria-label="Multi-asset market scanner">
      <div class="scanner-head">
        <span>Market</span><span>Price</span><span>Score</span><span>Bias</span><span>Quality</span>
      </div>
      {#each pairs as pair}
        <button class:chosen={pair.symbol === active.symbol} on:click={() => selected = pair.symbol}>
          <strong>{pair.symbol}</strong>
          <span>{num(pair.price, pair.decimals)}</span>
          <span class={scoreClass(pair.score)}>{signed(pair.score)}</span>
          <span>{pair.bias}</span>
          <span class="grade">Grade {pair.quality.grade}</span>
        </button>
      {/each}
    </section>

    <div class="section-title">
      <div>
        <span class="eyebrow">Selected research brief</span>
        <h3>{active.symbol}</h3>
      </div>
      <span class="updated">Updated {new Date(snapshot.generated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
    </div>

    <section class="facts">
      <article><span>Observed close</span><strong>{num(active.price, active.decimals)}</strong></article>
      <article><span>{active.market.macro_label ?? '10Y yield spread'}</span><strong>{signed(active.market.yield_spread, 2)} pp</strong></article>
      <article><span>20D volatility</span><strong>{pct(active.market.volatility)}</strong></article>
      <article><span>Market regime</span><strong>{active.market.regime}</strong></article>
      <article><span>Data quality</span><strong>Grade {active.quality.grade}</strong><small>{pct(active.quality.completeness)} usable</small></article>
    </section>

    <div class="layers">
      <article>
        <span class="step">01 · Model interpretation</span>
        <div class="score-row">
          <strong class={scoreClass(active.score)}>{signed(active.score)}</strong>
          <span>{active.bias} evidence</span>
        </div>
        <p>{active.model.thesis}</p>
        <small>{active.asset_class ?? 'FX'} · {active.model.price_note ?? 'End-of-day public market data'}</small><br />
        <small>Transparent instrument-specific model. A score is interpretation, not an observed fact.</small>
      </article>

      <article>
        <span class="step">02 · Five-day probabilities</span>
        <div class="probabilities">
          <div><span>Bullish</span><strong>{pct(active.probabilities.Bullish)}</strong></div>
          <div><span>Range</span><strong>{pct(active.probabilities['Range/neutral'])}</strong></div>
          <div><span>Bearish</span><strong>{pct(active.probabilities.Bearish)}</strong></div>
        </div>
        <small>{active.sample_size} similar observations · {active.confidence} confidence. Historical frequencies are not promises.</small>
      </article>
    </div>

    <section class="planning">
      <div><span>20D support</span><strong>{num(active.market.support20, active.decimals)}</strong></div>
      <div><span>20D resistance</span><strong>{num(active.market.resistance20, active.decimals)}</strong></div>
      <div><span>ATR-style range</span><strong>{num(active.market.atr20, active.decimals)}</strong></div>
      <div><span>Cross-asset driver</span><strong>{active.market.driver}</strong></div>
    </section>

    {#if active.quality.stale_inputs?.length}
      <div class="warning">Excluded stale inputs: {active.quality.stale_inputs.join(', ')}.</div>
    {/if}

    <footer>
      <span>{snapshot.cadence}</span>
      <a href={ADVANCED_URL} target="_blank" rel="noopener noreferrer">Open validation, events and positioning ↗</a>
    </footer>
  {/if}
</div>

<style>
  .terminal{--ink:#0f172a;--muted:#64748b;--line:#dbe3ec;--green:#047857;--soft:#f8fafc;background:#fff;color:var(--ink);border:1px solid #cbd5e1;border-radius:20px;overflow:hidden;box-shadow:0 22px 55px rgba(15,23,42,.1)}
  .terminal-bar,.section-title,footer{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .terminal-bar{padding:22px 24px;border-bottom:1px solid var(--line);background:linear-gradient(135deg,#f0fdf4,#fff 55%)}
  h2,h3{margin:3px 0 0;color:#020617;font-weight:900;letter-spacing:-.04em;text-transform:uppercase}
  h2{font-size:1.35rem} h3{font-size:1.8rem}
  .eyebrow,.step{font-size:.65rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--green)}
  .status{display:flex;align-items:center;gap:8px;font-size:.68rem;font-weight:800;text-transform:uppercase;color:#475569}
  .status span{width:8px;height:8px;border-radius:50%;background:#ef4444}.status span.live{background:#10b981;box-shadow:0 0 0 4px #d1fae5}
  .notice,.error{padding:50px 24px;text-align:center;color:#475569}
  .error{display:grid;gap:10px;background:#fff7ed}.error strong{color:#9a3412}.actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
  .actions button,.actions a{border:0;border-radius:8px;padding:10px 14px;font-weight:800;background:#047857;color:white;text-decoration:none;cursor:pointer}
  .pair-tabs{display:flex;gap:8px;padding:14px 16px;overflow-x:auto;border-bottom:1px solid var(--line);background:var(--soft)}
  .pair-tabs button{white-space:nowrap;border:1px solid var(--line);background:#fff;color:#334155;padding:8px 11px;border-radius:8px;font-size:.72rem;font-weight:900;cursor:pointer}
  .pair-tabs button.active{background:#064e3b;color:#fff;border-color:#064e3b}
  .scanner{margin:18px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .scanner-head,.scanner button{display:grid;grid-template-columns:1fr 1fr .7fr 1.1fr .8fr;align-items:center;gap:10px;text-align:left;padding:10px 14px}
  .scanner-head{background:#f1f5f9;color:#64748b;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em}
  .scanner button{width:100%;border:0;border-top:1px solid #eef2f7;background:#fff;color:#334155;font-size:.76rem;cursor:pointer}
  .scanner button:hover,.scanner button.chosen{background:#ecfdf5}.scanner strong{color:#0f172a}.grade{font-size:.66rem;font-weight:800}
  .positive{color:#047857!important}.negative{color:#b91c1c!important}.neutral{color:#475569!important}
  .section-title{padding:22px 20px 12px}.updated{font-size:.7rem;color:var(--muted)}
  .facts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:0 20px 20px}
  .facts article,.layers article,.planning div{border:1px solid var(--line);border-radius:12px;background:#fff;padding:15px}
  .facts span,.planning span{display:block;font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:7px}
  .facts strong,.planning strong{display:block;color:#0f172a;font-size:1rem}.facts small{color:#64748b}
  .layers{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px 12px}
  .layers article{background:var(--soft)}.layers p{color:#475569;font-size:.83rem;line-height:1.55}.layers small{color:#64748b;line-height:1.45}
  .score-row{display:flex;align-items:baseline;gap:12px;margin-top:12px}.score-row strong{font-size:2rem}.score-row span{font-weight:800;color:#334155}
  .probabilities{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:13px 0}.probabilities div{padding:10px;border-radius:9px;background:#fff;border:1px solid var(--line)}.probabilities span{display:block;font-size:.63rem;color:#64748b}.probabilities strong{color:#0f172a}
  .planning{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 20px 18px}
  .warning{margin:0 20px 18px;padding:11px 13px;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;border-radius:9px;font-size:.75rem}
  footer{border-top:1px solid var(--line);background:#f8fafc;padding:13px 20px;font-size:.68rem;color:#64748b}footer a{color:#047857;font-weight:900;text-decoration:none}
  @media(max-width:800px){.scanner-head{display:none}.scanner button{grid-template-columns:1fr 1fr 1fr}.scanner button span:nth-of-type(3),.scanner button span:nth-of-type(4){display:none}.facts{grid-template-columns:repeat(2,1fr)}.layers{grid-template-columns:1fr}.planning{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.terminal{border-radius:14px}.terminal-bar,.section-title,footer{align-items:flex-start;flex-direction:column}.terminal-bar{padding:18px}.scanner{margin:12px}.facts,.layers,.planning{padding-left:12px;padding-right:12px}.facts{grid-template-columns:1fr 1fr}.facts article:last-child{grid-column:1/-1}.updated{font-size:.64rem}.probabilities{grid-template-columns:1fr 1fr 1fr}}
</style>
