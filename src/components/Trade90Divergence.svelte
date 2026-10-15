<script>
  import { getPairs, formatBp } from "../lib/trade90-rates.js";
  import Trade90OutlookEvidence from "./Trade90OutlookEvidence.svelte";
  import Trade90ForwardRates from "./Trade90ForwardRates.svelte";
  import Trade90PolicyUpdates from "./Trade90PolicyUpdates.svelte";
  import Trade90NextDecisions from "./Trade90NextDecisions.svelte";
  export let snapshot;

  const banks = snapshot.banks;
  const allPairs = getPairs(banks);
  const lastDecisions = [...banks].sort((a,b) => b.decisionDate.localeCompare(a.decisionDate));
  let activeTab = "current";
  let query = "";
  let currency = "ALL";
  let type = "ALL";
  let order = "high";
  let selected = allPairs[0].symbol;
  let horizon = "6M";
  let showAllSources = false;

  $: filtered = allPairs.filter(pair =>
    (currency === "ALL" || pair.base === currency || pair.quote === currency)
    && (type === "ALL" || (type === "MAJORS" ? (pair.base === "USD" || pair.quote === "USD") : (pair.base !== "USD" && pair.quote !== "USD")))
    && pair.symbol.includes(query.trim().toUpperCase().replace(/[^A-Z]/g, ""))
  ).sort((a,b) => order === "high" ? b.absBp - a.absBp || a.symbol.localeCompare(b.symbol) : a.absBp - b.absBp || a.symbol.localeCompare(b.symbol));
  $: detail = allPairs.find(pair => pair.symbol === selected) || allPairs[0];
  const date = value => new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});

  function choosePair(symbol) {
    selected = symbol;
    activeTab = "details";
  }
</script>

<section class="dashboard" aria-label="Central bank rate divergence dashboard">
  <div class="stats">
    <div class="stat">
      <div class="statname">Largest current policy-rate gap</div>
      <div class="statval">{formatBp(allPairs[0].absBp)} <small>bp</small></div>
      <div class="statfoot">{allPairs[0].label} <span>· {allPairs[0].higher} has the higher rate</span></div>
    </div>
    <div class="stat">
      <div class="statname">FX pairs compared</div>
      <div class="statval">28</div>
      <div class="statfoot">8 central banks · 7 USD majors + 21 crosses</div>
    </div>
    <div class="stat">
      <div class="statname">Policy-rate snapshot</div>
      <div class="statval dateval">{date(snapshot.asOf)}</div>
      <div class="statfoot">Verified sources · not a live rates feed</div>
    </div>
  </div>

  <div class="board">
    <nav class="tabs" aria-label="Rate divergence views">
      <button class:active={activeTab === "current"} on:click={() => activeTab = "current"} aria-current={activeTab === "current" ? "page" : undefined}>Current rate gaps</button>
      <button class:active={activeTab === "expected"} on:click={() => activeTab = "expected"} aria-current={activeTab === "expected" ? "page" : undefined}>Expected rate gaps</button>
      <button class:active={activeTab === "changes"} on:click={() => activeTab = "changes"} aria-current={activeTab === "changes" ? "page" : undefined}>What changed</button>
      <button class:active={activeTab === "details"} on:click={() => activeTab = "details"} aria-current={activeTab === "details" ? "page" : undefined}>Currency pair details</button>
    </nav>

    {#if activeTab === "current"}
      <div class="panelhead">
        <div><h2>Current rate gaps</h2><p>All 28 currency pairs, ranked by the absolute difference in their official policy-rate benchmarks.</p></div>
        <span class="sourcepill">Sourced snapshot</span>
      </div>
      <div class="controls">
        <label class="searchfield"><span>Search pair</span><input type="search" placeholder="EUR/USD, AUDJPY…" bind:value={query} /></label>
        <label><span>Currency</span><select bind:value={currency}>
          <option value="ALL">All eight</option>
          {#each banks as bank}<option value={bank.code}>{bank.code}</option>{/each}
        </select></label>
        <label><span>Pair type</span><select bind:value={type}><option value="ALL">All 28 pairs</option><option value="MAJORS">USD pairs</option><option value="CROSSES">Crosses</option></select></label>
        <label><span>Sort</span><select bind:value={order}><option value="high">Largest first</option><option value="low">Smallest first</option></select></label>
      </div>
      <div class="tablewrap">
        <table>
          <thead><tr><th class="rank">#</th><th>Currency pair</th><th class="number">Absolute gap</th><th class="number signed">Base − quote</th><th class="higher">Higher-rate currency</th><th class="extra">Benchmarks</th><th></th></tr></thead>
          <tbody>
            {#each filtered as pair,i (pair.symbol)}
              <tr>
                <td class="rank">{i + 1}</td>
                <td><button class="pairlink" on:click={() => choosePair(pair.symbol)} aria-label={"See " + pair.label + " rate details"}>{pair.label}</button></td>
                <td class="number boldnum">{formatBp(pair.absBp)} <small>bp</small></td>
                <td class="number signed">{pair.signedBp > 0 ? "+" : ""}{formatBp(pair.signedBp)} <small>bp</small></td>
                <td class="higher"><span class="currencychip">{pair.higher}</span></td>
                <td class="extra">{pair.baseRate.toFixed(pair.baseRate===3.875?3:2)}% / {pair.quoteRate.toFixed(pair.quoteRate===3.875?3:2)}%</td>
                <td><button class="rowarrow" aria-label={"View " + pair.label} on:click={() => choosePair(pair.symbol)}>→</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if filtered.length === 0}<p class="empty">No currency pairs match these filters.</p>{/if}
      <div class="tablefoot"><span>Showing {filtered.length} of 28 pair combinations.</span><span><strong>Note:</strong> largest absolute spread does not mean the strongest expected currency.</span></div>
    {:else if activeTab === "expected"}
      <div class="panelhead">
        <div><h2>Expected rate gaps</h2><p>Compare future policy-rate differentials once verified and comparable market-implied pricing is available.</p></div>
        <span class="sourcepill">Source-validated</span>
      </div>
      <div class="horizons" aria-label="Forecast horizon">
        <button class:active={horizon === "3M"} on:click={() => horizon = "3M"}>3 months</button>
        <button class:active={horizon === "6M"} on:click={() => horizon = "6M"}>6 months</button>
        <button class:active={horizon === "12M"} on:click={() => horizon = "12M"}>12 months</button>
      </div>
      <div class="notice"><strong>What counts as a verified expectation?</strong><p>Numerical forward gaps require licensed, timestamp-aligned market-implied policy levels for both banks. The published observations below include reported market pricing, surveys and commentary; these cannot be combined with a forward-rate feed or treated as interchangeable.</p></div>
      <Trade90OutlookEvidence mode="expected" />
      <Trade90ForwardRates mode="expected" {horizon} policyBanks={banks} onPairSelect={choosePair} />
    {:else if activeTab === "changes"}
      <div class="panelhead"><div><h2>What changed</h2><p>Official policy-rate decisions, presented separately from changes in market expectations. <a href="/central-banks/">Browse central-bank policy updates →</a></p></div><span class="sourcepill">Source-linked</span></div>
      <div class="notice"><strong>How to interpret the change</strong><p>Quantified 24-hour and 7-day revisions require archived, timestamped market-price snapshots. The dated reports below are separately attributed examples and may not represent the latest market position.</p></div>
      <Trade90ForwardRates mode="changes" {horizon} policyBanks={banks} onPairSelect={choosePair} />
      <Trade90OutlookEvidence mode="changes" />
      <h3 class="subheading">Latest verified central-bank decisions</h3>
      <div class="decisions">
        {#each lastDecisions as bank}
          <div class="decision"><span class="day">{date(bank.decisionDate)}</span><div class="decisionbody"><strong>{bank.short} · {bank.code}</strong><span>{bank.decision} · {bank.benchmark} {bank.rate.toFixed(bank.rate === 3.875 ? 3 : 2)}%</span></div><a href={bank.source} target="_blank" rel="noopener noreferrer" aria-label={"Official " + bank.short + " decision source"}>Source ↗</a></div>
        {/each}
      </div>
    {:else}
      <div class="panelhead"><div><h2>Currency pair details</h2><p>Choose a pair to compare its two central banks and the exact calculation behind its policy-rate gap.</p></div><span class="sourcepill">Official benchmarks</span></div>
      <label class="detailselect">Selected currency pair
        <select bind:value={selected}>
          {#each allPairs as pair}<option value={pair.symbol}>{pair.label}</option>{/each}
        </select>
      </label>
      <div class="detailhero">
        <div><span class="smallcaps">SELECTED PAIR</span><h3>{detail.label}</h3><p>{detail.baseBank.short} compared with {detail.quoteBank.short}</p></div>
        <div class="detailgap"><strong>{formatBp(detail.absBp)} <small>bp</small></strong><span>Absolute policy-rate gap</span></div>
      </div>
      <div class="compare">
        <div class="bankdetail">
          <span class="smallcaps">BASE · {detail.base}</span><h4>{detail.baseBank.name}</h4><strong>{detail.baseBank.rate.toFixed(detail.baseBank.rate===3.875?3:2)}%</strong>
          <p>{detail.baseBank.benchmark}</p><p>Effective {date(detail.baseBank.effectiveDate)}</p><a href={detail.baseBank.source} target="_blank" rel="noopener noreferrer">Official source ↗</a>
        </div>
        <div class="bankdetail">
          <span class="smallcaps">QUOTE · {detail.quote}</span><h4>{detail.quoteBank.name}</h4><strong>{detail.quoteBank.rate.toFixed(detail.quoteBank.rate===3.875?3:2)}%</strong>
          <p>{detail.quoteBank.benchmark}</p><p>Effective {date(detail.quoteBank.effectiveDate)}</p><a href={detail.quoteBank.source} target="_blank" rel="noopener noreferrer">Official source ↗</a>
        </div>
      </div>
      <div class="interpretation"><strong>{detail.higher === "Equal" ? "Equal policy benchmarks" : detail.higher + " has the higher policy rate"}</strong><p>The signed {detail.label} base-minus-quote spread is {detail.signedBp > 0 ? "+" : ""}{formatBp(detail.signedBp)} basis points. This measures two official benchmark rates, not the actual return from holding this currency pair.</p></div>
      <div class="notice quieter"><strong>Forward expectations for {detail.label}</strong><p>Exact 3-, 6- and 12-month expected policy-rate gaps display only when source observations are aligned and appropriately licensed. Separately published outlook commentary adds context; it is not the same as a calculated forward spread.</p></div>
      <Trade90ForwardRates mode="pair" policyBanks={banks} selectedPair={detail} />
      <Trade90OutlookEvidence mode="pair" pair={detail} />
      <Trade90NextDecisions pair={detail} />
      <div class="pair-policy-updates"><Trade90PolicyUpdates pair={detail} /></div>
    {/if}
  </div>
  <section class="centralbank">
    <div class="belowhead"><div><h2>{activeTab === "details" ? "Central banks for " + detail.label : "Eight central banks"}</h2><p>{activeTab === "details" ? "Only the two official benchmarks used for this pair, with source links and effective dates." : "Benchmarks used for every rate gap. Source links and effective dates are shown below."}</p></div><button on:click={() => showAllSources = !showAllSources}>{showAllSources ? "Hide details" : "Source details"} {showAllSources ? "↑" : "↓"}</button></div>
    <div class="bankgrid">
      {#each (activeTab === "details" ? [detail.baseBank, detail.quoteBank] : banks) as bank}
        <div class="bankcard">
          <div class="banktop"><strong>{bank.code}</strong><span>{bank.short}</span></div>
          <div class="bankrate">{bank.rate.toFixed(bank.rate===3.875?3:2)}%</div>
          <div class="bankname">{bank.name}</div>
          {#if showAllSources}<div class="bankmeta">{bank.benchmark}<br />Effective {date(bank.effectiveDate)}<br /><a href={bank.source} target="_blank" rel="noopener noreferrer">Official publication ↗</a></div>{/if}
        </div>
      {/each}
    </div>
  </section>
  <p class="footnote">Method: rank by absolute (base-rate − quote-rate). USD is the Federal Reserve target-range midpoint; EUR uses the ECB deposit facility rate. These are different national policy benchmarks, not directly tradeable deposit yields. <a href="/methodology/">Calculation and data methodology →</a></p>
</section>

<style>
.dashboard{padding:4px 0 20px}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 18px}
.stat{padding:20px;background:#fff;border:1px solid #dce5ed;border-radius:14px}
.statname{font-size:.78rem;color:#637388;font-weight:650}
.statval{font-size:2.05rem;color:#10233b;font-weight:850;letter-spacing:-.055em;margin-top:4px;line-height:1.25}
.statval small{font-size:.55em;font-weight:600;color:#647a8e}
.statval.dateval{font-size:1.45rem;letter-spacing:-.035em;padding-top:8px}
.statfoot{font-size:.79rem;font-weight:720;margin-top:8px}.statfoot span{font-weight:400;color:#718096}
.board{background:#fff;border:1px solid #dce5ed;border-radius:17px;overflow:hidden}
.tabs{display:flex;overflow-x:auto;white-space:nowrap;border-bottom:1px solid #e1e8f0;scrollbar-width:thin;padding:0 12px}
.tabs button{border:0;border-bottom:3px solid transparent;background:#fff;color:#607187;padding:17px 16px 14px;cursor:pointer;font-size:.91rem;font-weight:710;white-space:nowrap}
.tabs button.active{color:#1165a4;border-bottom-color:#1384b5}
.tabs button:hover{background:#f2f7fb}
.panelhead{padding:24px 24px 12px;display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.panelhead h2{margin:0;font-size:1.45rem;letter-spacing:-.025em;line-height:1.3}
.panelhead p{color:#637388;margin:5px 0 0;font-size:.87rem;max-width:780px}
.sourcepill{background:#e9f7f2;color:#126d59;border-radius:20px;padding:5px 10px;white-space:nowrap;font-size:.73rem;font-weight:720}
.sourcepill.amber{background:#fff5e2;color:#97611c}
.controls{display:grid;grid-template-columns:minmax(145px,1.6fr) repeat(3,minmax(110px,1fr));gap:10px;padding:12px 24px 20px}
.controls label,.detailselect{display:flex;flex-direction:column;gap:5px;font-size:.72rem;font-weight:690;color:#526478}
.controls input,.controls select,.detailselect select{width:100%;padding:10px 11px;color:#17283f;background:#fff;border:1px solid #ccd9e6;border-radius:9px;min-width:0}
.tablewrap{overflow-x:auto;width:100%}
table{width:100%;border-collapse:collapse;text-align:left;font-variant-numeric:tabular-nums}
th{font-weight:750;text-transform:uppercase;letter-spacing:.06em;font-size:.66rem;color:#67788a;background:#f3f7fb;padding:12px 16px;white-space:nowrap}
td{padding:11px 16px;border-bottom:1px solid #ebeff5;white-space:nowrap;font-size:.84rem}
tr:last-child td{border-bottom:0}
tbody tr:hover{background:#f8fbfd}
.rank{color:#8090a0;width:36px;padding-left:24px}
.number{text-align:right}
.number small{color:#7b8999}
.boldnum{font-weight:780;color:#0c334f}
.pairlink{border:0;padding:4px 0;background:none;color:#125b91;font-size:.91rem;font-weight:790;cursor:pointer;text-decoration:underline;text-decoration-color:transparent}
.pairlink:hover{text-decoration-color:currentColor}
.currencychip{background:#e7f4f2;color:#15675e;font-weight:780;font-size:.74rem;border-radius:6px;padding:4px 8px}
.rowarrow{background:none;border:0;color:#477b9e;font-weight:750;font-size:1.14rem;cursor:pointer}
.tablefoot{padding:14px 24px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:.75rem;color:#67798c;border-top:1px solid #e5eaf1}
.horizons{display:flex;gap:7px;padding:8px 24px 16px}
.horizons button{border:1px solid #ccd9e6;border-radius:9px;padding:8px 16px;background:#f6f9fc;color:#526478;cursor:pointer}
.horizons button.active{background:#183752;color:#fff;border-color:#183752}
.notice{margin:8px 24px 23px;border:1px solid #eddbb3;background:#fffbef;border-radius:12px;padding:17px 18px;color:#624e29;font-size:.84rem}
.notice p{margin:5px 0 0;line-height:1.65}.notice.quieter{margin:16px 24px;background:#f3f7fb;border-color:#dce5ed;color:#4b6278}
.muted{color:#8996a5}.empty{padding:12px 24px;color:#637388}
.subheading{margin:7px 24px 10px;font-size:1.1rem}
.decisions{padding:0 24px 20px}
.decision{display:flex;gap:16px;align-items:center;border-bottom:1px solid #e5eaf1;padding:12px 2px}
.decision .day{font-size:.8rem;color:#637388;min-width:100px}
.decisionbody{flex:1;display:flex;flex-direction:column;font-size:.85rem;gap:2px}
.decisionbody span{color:#637388}
.decision a{font-size:.77rem;white-space:nowrap}
.detailselect{margin:12px 24px 16px;max-width:280px}
.detailhero{margin:0 24px 12px;border:1px solid #dce5ed;background:#f3f7fb;border-radius:13px;padding:20px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.smallcaps{font-size:.66rem;letter-spacing:.09em;color:#738398;font-weight:780}
.detailhero h3{font-size:1.8rem;letter-spacing:-.04em;margin:0}.detailhero p{margin:2px 0;color:#637388;font-size:.83rem}
.detailgap{text-align:right}.detailgap strong{font-size:1.8rem;letter-spacing:-.03em;display:block}.detailgap small{font-size:.55em}.detailgap span{display:block;font-size:.73rem;color:#667a8b}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 24px}
.bankdetail{border:1px solid #dce5ed;border-radius:12px;padding:20px}
.bankdetail h4{font-size:1rem;margin:8px 0}.bankdetail strong{font-size:1.8rem;letter-spacing:-.03em}
.bankdetail p{font-size:.81rem;color:#64758a;margin:5px 0}.bankdetail a{font-size:.8rem;display:inline-block;margin-top:10px}
.interpretation{margin:16px 24px;padding:18px;background:#eaf6f3;border:1px solid #cae8e0;border-radius:12px;color:#16483c}
.interpretation p{font-size:.85rem;margin:6px 0 0}
.centralbank{padding-top:32px}
.belowhead{display:flex;align-items:center;justify-content:space-between;gap:16px}
.belowhead h2{margin:0;font-size:1.45rem;letter-spacing:-.02em}
.belowhead p{font-size:.85rem;color:#637388;margin:4px 0 16px}
.belowhead button{color:#0e6192;background:none;border:0;cursor:pointer;text-decoration:underline;white-space:nowrap}
.bankgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.bankcard{padding:16px 18px;border:1px solid #dce5ed;border-radius:13px;background:#fff}
.banktop{display:flex;justify-content:space-between;gap:9px}.banktop strong{font-size:.91rem}.banktop span{font-size:.75rem;color:#718498}
.bankrate{font-size:1.65rem;font-weight:800;letter-spacing:-.045em;margin:6px 0 0}
.bankname{font-size:.76rem;color:#637388}.bankmeta{font-size:.75rem;color:#586b80;border-top:1px solid #e3e9ef;margin-top:10px;padding-top:10px}
.bankmeta a{display:inline-block;margin-top:4px}
.footnote{color:#6c7b8b;font-size:.77rem;line-height:1.65;margin-top:18px}
@media(max-width:820px){.stats{grid-template-columns:1fr 1fr}.stats .stat:last-child{grid-column:1/-1}.controls{grid-template-columns:1fr 1fr}.extra{display:none}.bankgrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.stat{padding:15px}.statval{font-size:1.65rem}.statval.dateval{font-size:1.22rem}.statfoot{font-size:.7rem}.tabs button{font-size:.79rem;padding:14px 12px}.panelhead{padding:18px 14px 8px;display:block}.panelhead h2{font-size:1.23rem}.panelhead p{font-size:.78rem}.sourcepill{display:inline-block;margin-top:9px}.controls{padding:12px 14px 18px;gap:8px}.controls select,.controls input{font-size:.81rem;padding:9px}.rank{padding-left:12px;width:24px}th,td{padding:10px 9px}.signed,.higher,.extra{display:none}.tablefoot{padding:12px 14px}.notice{margin:8px 14px 18px;padding:12px}.horizons{padding:10px 14px}.decisions{padding:0 14px 20px}.decision{gap:9px}.decision .day{min-width:68px;font-size:.7rem}.decisionbody{font-size:.75rem}.decision a{font-size:.7rem}.subheading{margin:8px 14px}.detailselect{margin:12px 14px}.detailhero{margin:0 14px 10px;padding:14px}.detailhero h3{font-size:1.4rem}.detailgap strong{font-size:1.4rem}.compare{grid-template-columns:1fr;padding:0 14px}.bankdetail{padding:14px}.interpretation{margin:14px;padding:14px}.notice.quieter{margin:14px}.bankcard{padding:12px}.bankgrid{gap:7px}.belowhead h2{font-size:1.22rem}}

/* TRADE90 original identity: black + slate surfaces, white text, emerald emphasis.
   Only skin changes: formulas, data sources, table order and interactions remain unchanged. */
.dashboard{color:#f8fafc}
.stat,.board,.bankcard{background:#111c30;border-color:#334155}
.statname,.statfoot span,.panelhead p,.belowhead p,.bankname,.banktop span,.footnote,.tablefoot,.detailhero p,.detailgap span,.bankdetail p,.decision .day,.decisionbody span{color:#94a3b8}
.statval,.statval small,.bankrate,.panelhead h2,.belowhead h2,.subheading,.bankdetail h4,.bankdetail strong,.detailhero h3,.detailgap strong{color:#f8fafc}
.statval small{color:#94a3b8}
.statfoot{color:#e2e8f0}
.tabs{border-color:#334155}
.tabs button{background:#111c30;color:#cbd5e1}
.tabs button.active{color:#6ee7b7;border-bottom-color:#10b981}
.tabs button:hover{background:#1e293b;color:#f8fafc}
.sourcepill{background:#073b32;color:#6ee7b7}
.sourcepill.amber{background:#3a2c17;color:#fbd38d}
.controls label,.detailselect{color:#cbd5e1}
.controls input,.controls select,.detailselect select{background:#0b1424;color:#f8fafc;border-color:#475569}
.controls input::placeholder{color:#94a3b8}
.controls input:focus,.controls select:focus,.detailselect select:focus{border-color:#10b981}
th{background:#18263a;color:#cbd5e1}
td{border-color:#273549;color:#e2e8f0}
tbody tr:hover{background:#18263a}
.rank,.muted,.number small{color:#94a3b8}
.boldnum{color:#f8fafc}
.pairlink{color:#6ee7b7}
.pairlink:hover{color:#a7f3d0}
.currencychip{background:#064e3b;color:#a7f3d0}
.rowarrow{color:#6ee7b7}
.tablefoot{border-color:#334155}
.horizons button{border-color:#475569;background:#18263a;color:#cbd5e1}
.horizons button.active{background:#065f46;border-color:#10b981;color:#fff}
.notice{background:#2b2518;border-color:#775b23;color:#f5deb0}
.notice.quieter{background:#17253a;border-color:#334155;color:#cbd5e1}
.decision{border-color:#334155}
.decision a,.bankmeta a{color:#6ee7b7}
.detailhero{background:#18263a;border-color:#334155}
.detailgap strong small{color:#94a3b8}
.bankdetail{background:#101a2b;border-color:#334155}
.bankdetail a{color:#6ee7b7}
.interpretation{background:#073b32;border-color:#116b50;color:#d1fae5}
.interpretation p{color:#c7f9e7}
.bankcard{background:#111c30}
.bankmeta{border-color:#334155;color:#cbd5e1}
.belowhead button{color:#6ee7b7}
.footnote a{color:#6ee7b7}
.empty{color:#94a3b8}

.pair-policy-updates{padding:0 24px 24px}
.forward-info{color:#94a3b8;font-size:.78rem;padding:0 24px 10px;margin:0}
@media(max-width:600px){.forward-info{padding:0 14px 12px}.pair-policy-updates{padding:0 14px 16px}}
</style>
