<script>
  // ✅ Inline SVG icons (removes lucide-svelte dependency for smaller bundle)
  const IconTarget = () => `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="8"></circle>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
  </svg>`;

  const IconUp = () => `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M7 17l10-10"></path>
    <path d="M7 7h10v10"></path>
  </svg>`;

  const IconDown = () => `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M7 7l10 10"></path>
    <path d="M7 17h10V7"></path>
  </svg>`;

  const ASSET_CONFIGS = {
    // Forex Majors
    EURUSD: { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    GBPUSD: { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    USDJPY: { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Majors' },
    USDCHF: { name: 'USD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    AUDUSD: { name: 'AUD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    NZDUSD: { name: 'NZD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    USDCAD: { name: 'USD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },

    // Forex Crosses
    EURGBP: { name: 'EUR/GBP', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    EURJPY: { name: 'EUR/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    EURAUD: { name: 'EUR/AUD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    EURNZD: { name: 'EUR/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    EURCAD: { name: 'EUR/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    EURCHF: { name: 'EUR/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    GBPJPY: { name: 'GBP/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    GBPAUD: { name: 'GBP/AUD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    GBPNZD: { name: 'GBP/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    GBPCAD: { name: 'GBP/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    GBPCHF: { name: 'GBP/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    AUDJPY: { name: 'AUD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    AUDNZD: { name: 'AUD/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    AUDCAD: { name: 'AUD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    AUDCHF: { name: 'AUD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    NZDJPY: { name: 'NZD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    NZDCAD: { name: 'NZD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    NZDCHF: { name: 'NZD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    CADJPY: { name: 'CAD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    CADCHF: { name: 'CAD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    CHFJPY: { name: 'CHF/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },

    // Metals
    XAUUSD: { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2, category: 'Metals' },
    XAGUSD: { name: 'XAG/USD (Silver)', pipValue: 0.01, priceDecimals: 3, category: 'Metals' },

    // Indices
    US30: { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    NAS100: { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    SPX500: { name: 'SPX500 (S&P 500)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    UK100: { name: 'UK100 (FTSE)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    GER40: { name: 'GER40 (DAX)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    FRA40: { name: 'FRA40 (CAC)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    AUS200: { name: 'AUS200 (ASX)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    JPN225: { name: 'JPN225 (Nikkei)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    HK50: { name: 'HK50 (Hang Seng)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },

    // Crypto
    BTCUSD: { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    ETHUSD: { name: 'ETH/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    LTCUSD: { name: 'LTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    XRPUSD: { name: 'XRP/USD', pipValue: 0.0001, priceDecimals: 4, category: 'Crypto' },
    ADAUSD: { name: 'ADA/USD', pipValue: 0.0001, priceDecimals: 4, category: 'Crypto' },

    // Commodities
    USOIL: { name: 'US Oil (WTI)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
    UKOIL: { name: 'UK Oil (Brent)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
  };

  let pair = 'EURUSD';
  let balance = '100000';
  let riskPercent = '0.5';
  let entryPrice = '1.0850';
  let stopLoss = '1.0800';
  let takeProfit = '1.0900';
  let direction = 'buy';

  $: config = ASSET_CONFIGS[pair];

  // ✅ Debounced calculations (reduces CPU while typing)
  let calculations = null;
  let _t;

  function recompute() {
    clearTimeout(_t);
    _t = setTimeout(() => {
      const bal = parseFloat(balance) || 0;
      const risk = parseFloat(riskPercent) || 0;
      const entry = parseFloat(entryPrice) || 0;
      const sl = parseFloat(stopLoss) || 0;
      const tp = parseFloat(takeProfit) || 0;

      if (bal <= 0 || risk <= 0 || entry <= 0 || sl <= 0) {
        calculations = null;
        return;
      }

      const riskAmount = (bal * risk) / 100;
      const slDistance = Math.abs(entry - sl);
      const slPips = slDistance / config.pipValue;
      const tpDistance = tp > 0 ? Math.abs(entry - tp) : 0;
      const tpPips = tpDistance / config.pipValue;

      let pipValuePerLot = 10;
      if (pair === 'USDJPY') pipValuePerLot = 1000;
      else if (pair === 'XAUUSD') pipValuePerLot = 10;
      else if (pair === 'US30' || pair === 'NAS100') pipValuePerLot = 10;
      else if (pair === 'BTCUSD') pipValuePerLot = 1;

      const lotSize = riskAmount / (slPips * pipValuePerLot);
      const potentialProfit = tpPips > 0 ? lotSize * tpPips * pipValuePerLot : 0;
      const rrRatio = tpPips > 0 ? tpPips / slPips : 0;

      calculations = {
        lotSize: lotSize.toFixed(2),
        riskAmount: riskAmount.toFixed(2),
        slPips: slPips.toFixed(1),
        tpPips: tpPips > 0 ? tpPips.toFixed(1) : '0.0',
        potentialProfit: potentialProfit.toFixed(2),
        rrRatio: rrRatio > 0 ? rrRatio.toFixed(2) : '0.00'
      };
    }, 80);
  }

  $: recompute();
</script>

<div class="bg-gray-950 p-4 font-sans selection:bg-emerald-500/30">
  <div class="max-w-md mx-auto">
    <header class="text-center mb-6 pt-4">
      <div class="flex items-center justify-center gap-2 mb-2">
        <!-- ✅ FIXED: {@html ...} must be inside element -->
        <span class="text-emerald-400" aria-hidden="true">{@html IconTarget()}</span>
        <h1 class="text-2xl font-black text-white tracking-tighter uppercase">POSITION SIZER</h1>
      </div>
      <p class="text-gray-200 text-xs font-bold tracking-[0.2em] uppercase">Risk Framework</p>
    </header>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl">
      <label for="asset-pair" class="block text-gray-200 text-sm font-bold mb-2">Trading Asset</label>

      <select
        id="asset-pair"
        bind:value={pair}
        class="w-full bg-gray-800 text-white rounded-xl px-4 py-3.5 text-base border border-white/10 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
      >
        <optgroup label="Forex Majors">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Forex Majors') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>

        <optgroup label="Forex Crosses">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Forex Crosses') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>

        <optgroup label="Metals">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Metals') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>

        <optgroup label="Indices">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Indices') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>

        <optgroup label="Crypto">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Crypto') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>

        <optgroup label="Commodities">
          {#each Object.entries(ASSET_CONFIGS).filter(([k, v]) => v.category === 'Commodities') as [key, cfg]}
            <option value={key}>{cfg.name}</option>
          {/each}
        </optgroup>
      </select>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl">
      <span class="block text-gray-200 text-sm font-bold mb-3">Direction</span>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          on:click={() => (direction = 'buy')}
          class={`py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            direction === 'buy' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-200 border border-white/5'
          }`}
        >
          <!-- ✅ FIXED -->
          <span aria-hidden="true">{@html IconUp()}</span>
          BUY
        </button>

        <button
          type="button"
          on:click={() => (direction = 'sell')}
          class={`py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            direction === 'sell' ? 'bg-rose-500 text-white' : 'bg-gray-800 text-gray-200 border border-white/5'
          }`}
        >
          <!-- ✅ FIXED -->
          <span aria-hidden="true">{@html IconDown()}</span>
          SELL
        </button>
      </div>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl space-y-4">
      <div>
        <label for="acc-balance" class="block text-gray-200 text-sm font-bold mb-2">Account Balance ($)</label>
        <input
          id="acc-balance"
          type="number"
          bind:value={balance}
          inputmode="decimal"
          class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-lg border border-white/10 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label for="risk-percent" class="block text-gray-200 text-sm font-bold mb-2">Risk (%)</label>
        <input
          id="risk-percent"
          type="number"
          bind:value={riskPercent}
          inputmode="decimal"
          class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-lg border border-white/10 focus:ring-2 focus:ring-emerald-500"
        />
        {#if calculations}
          <div class="mt-2 text-xs font-bold text-emerald-400">Risk Amount: ${calculations.riskAmount}</div>
        {/if}
      </div>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl space-y-4">
      <div>
        <label for="entry-price" class="block text-gray-200 text-sm font-bold mb-2">Entry Price</label>
        <input
          id="entry-price"
          type="number"
          bind:value={entryPrice}
          inputmode="decimal"
          class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/10"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="stop-loss" class="block text-rose-400 text-sm font-bold mb-2">Stop Loss</label>
          <input
            id="stop-loss"
            type="number"
            bind:value={stopLoss}
            inputmode="decimal"
            class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/10"
          />
        </div>

        <div>
          <label for="take-profit" class="block text-emerald-400 text-sm font-bold mb-2">Take Profit</label>
          <input
            id="take-profit"
            type="number"
            bind:value={takeProfit}
            inputmode="decimal"
            class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/10"
          />
        </div>
      </div>
    </div>

    <div class="min-h-[220px]">
      {#if calculations}
        <div class="bg-emerald-500 rounded-2xl p-6 mb-4 shadow-xl">
          <div class="text-black text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Position Size</div>
          <div class="text-6xl font-black text-black tracking-tighter">{calculations.lotSize}</div>
          <div class="text-black text-xs font-bold uppercase mt-1">Standard Lots</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <div class="text-gray-200 text-[10px] font-bold uppercase mb-1">R:R Ratio</div>
            <div class="text-white text-xl font-black">1:{calculations.rrRatio}</div>
          </div>

          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <div class="text-gray-200 text-[10px] font-bold uppercase mb-1">Potential</div>
            <div class="text-emerald-400 text-xl font-black">${calculations.potentialProfit}</div>
          </div>
        </div>
      {/if}
    </div>

    <footer class="text-center mt-6 pb-4">
      <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        Veteran Position Sizing • Trade Smart, Risk Less
      </p>
    </footer>
  </div>
</div>