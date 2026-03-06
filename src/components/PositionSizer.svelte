<script>
  // ✅ High-Performance Inline SVGs (No external dependencies)
  const IconTarget = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>`;
  const IconUp = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 17 10-10M7 7h10v10"/></svg>`;
  const IconDown = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M7 17h10V7"/></svg>`;

  const ASSET_CONFIGS = {
    // --- FOREX MAJORS ---
    'EURUSD': { name: 'EUR/USD', pip: 0.0001, cat: 'Forex Majors' },
    'GBPUSD': { name: 'GBP/USD', pip: 0.0001, cat: 'Forex Majors' },
    'USDJPY': { name: 'USD/JPY', pip: 0.01, cat: 'Forex Majors' },
    'USDCHF': { name: 'USD/CHF', pip: 0.0001, cat: 'Forex Majors' },
    'AUDUSD': { name: 'AUD/USD', pip: 0.0001, cat: 'Forex Majors' },
    'USDCAD': { name: 'USD/CAD', pip: 0.0001, cat: 'Forex Majors' },
    'NZDUSD': { name: 'NZD/USD', pip: 0.0001, cat: 'Forex Majors' },

    // --- FOREX CROSSES ---
    'EURGBP': { name: 'EUR/GBP', pip: 0.0001, cat: 'Forex Crosses' },
    'EURJPY': { name: 'EUR/JPY', pip: 0.01, cat: 'Forex Crosses' },
    'EURAUD': { name: 'EUR/AUD', pip: 0.0001, cat: 'Forex Crosses' },
    'EURNZD': { name: 'EUR/NZD', pip: 0.0001, cat: 'Forex Crosses' },
    'EURCAD': { name: 'EUR/CAD', pip: 0.0001, cat: 'Forex Crosses' },
    'EURCHF': { name: 'EUR/CHF', pip: 0.0001, cat: 'Forex Crosses' },
    'GBPJPY': { name: 'GBP/JPY', pip: 0.01, cat: 'Forex Crosses' },
    'GBPAUD': { name: 'GBP/AUD', pip: 0.0001, cat: 'Forex Crosses' },
    'GBPNZD': { name: 'GBP/NZD', pip: 0.0001, cat: 'Forex Crosses' },
    'GBPCAD': { name: 'GBP/CAD', pip: 0.0001, cat: 'Forex Crosses' },
    'GBPCHF': { name: 'GBP/CHF', pip: 0.0001, cat: 'Forex Crosses' },
    'AUDJPY': { name: 'AUD/JPY', pip: 0.01, cat: 'Forex Crosses' },
    'AUDNZD': { name: 'AUD/NZD', pip: 0.0001, cat: 'Forex Crosses' },
    'AUDCAD': { name: 'AUD/CAD', pip: 0.0001, cat: 'Forex Crosses' },
    'AUDCHF': { name: 'AUD/CHF', pip: 0.0001, cat: 'Forex Crosses' },
    'NZDJPY': { name: 'NZD/JPY', pip: 0.01, cat: 'Forex Crosses' },
    'NZDCAD': { name: 'NZD/CAD', pip: 0.0001, cat: 'Forex Crosses' },
    'NZDCHF': { name: 'NZD/CHF', pip: 0.0001, cat: 'Forex Crosses' },
    'CADJPY': { name: 'CAD/JPY', pip: 0.01, cat: 'Forex Crosses' },
    'CADCHF': { name: 'CAD/CHF', pip: 0.0001, cat: 'Forex Crosses' },
    'CHFJPY': { name: 'CHF/JPY', pip: 0.01, cat: 'Forex Crosses' },

    // --- METALS & COMMODITIES ---
    'XAUUSD': { name: 'XAU/USD (Gold)', pip: 0.1, cat: 'Metals' },
    'XAGUSD': { name: 'XAG/USD (Silver)', pip: 0.01, cat: 'Metals' },
    'USOIL': { name: 'WTI Oil', pip: 0.01, cat: 'Commodities' },
    'UKOIL': { name: 'Brent Oil', pip: 0.01, cat: 'Commodities' },

    // --- INDICES ---
    'US30': { name: 'US30 (Dow Jones)', pip: 1.0, cat: 'Indices' },
    'NAS100': { name: 'NAS100 (Nasdaq)', pip: 1.0, cat: 'Indices' },
    'SPX500': { name: 'SPX500 (S&P 500)', pip: 1.0, cat: 'Indices' },
    'GER40': { name: 'GER40 (DAX)', pip: 1.0, cat: 'Indices' },
    'UK100': { name: 'UK100 (FTSE)', pip: 1.0, cat: 'Indices' },
    'FRA40': { name: 'FRA40 (CAC)', pip: 1.0, cat: 'Indices' },
    'JPN225': { name: 'JPN225 (Nikkei)', pip: 1.0, cat: 'Indices' },
    'HK50': { name: 'HK50 (Hang Seng)', pip: 1.0, cat: 'Indices' },

    // --- CRYPTO ---
    'BTCUSD': { name: 'BTC/USD', pip: 1.0, cat: 'Crypto' },
    'ETHUSD': { name: 'ETH/USD', pip: 1.0, cat: 'Crypto' },
    'SOLUSD': { name: 'SOL/USD', pip: 0.01, cat: 'Crypto' },
    'XRPUSD': { name: 'XRP/USD', pip: 0.0001, cat: 'Crypto' },
    'ADAUSD': { name: 'ADA/USD', pip: 0.0001, cat: 'Crypto' },
    'DOTUSD': { name: 'DOT/USD', pip: 0.01, cat: 'Crypto' },
    'LINKUSD': { name: 'LINK/USD', pip: 0.01, cat: 'Crypto' }
  };

  const DEFAULTS = {
    // Forex Majors — 1:1 R:R (tp = entry + (entry − sl))
    'EURUSD': { entry: 1.0850, sl: 1.0800, tp: 1.0900 },
    'GBPUSD': { entry: 1.2650, sl: 1.2590, tp: 1.2710 },
    'USDJPY': { entry: 149.50, sl: 148.80, tp: 150.20 },
    'USDCHF': { entry: 0.8950, sl: 0.8900, tp: 0.9000 },
    'AUDUSD': { entry: 0.6350, sl: 0.6300, tp: 0.6400 },
    'USDCAD': { entry: 1.3650, sl: 1.3590, tp: 1.3710 },
    'NZDUSD': { entry: 0.5950, sl: 0.5900, tp: 0.6000 },
    // Forex Crosses — 1:1 R:R
    'EURGBP': { entry: 0.8560, sl: 0.8510, tp: 0.8610 },
    'EURJPY': { entry: 162.00, sl: 161.20, tp: 162.80 },
    'EURAUD': { entry: 1.7100, sl: 1.7020, tp: 1.7180 },
    'EURNZD': { entry: 1.8200, sl: 1.8110, tp: 1.8290 },
    'EURCAD': { entry: 1.4800, sl: 1.4720, tp: 1.4880 },
    'EURCHF': { entry: 0.9700, sl: 0.9640, tp: 0.9760 },
    'GBPJPY': { entry: 189.00, sl: 188.00, tp: 190.00 },
    'GBPAUD': { entry: 1.9900, sl: 1.9800, tp: 2.0000 },
    'GBPNZD': { entry: 2.1200, sl: 2.1090, tp: 2.1310 },
    'GBPCAD': { entry: 1.7200, sl: 1.7110, tp: 1.7290 },
    'GBPCHF': { entry: 1.1300, sl: 1.1230, tp: 1.1370 },
    'AUDJPY': { entry: 94.80,  sl: 94.20,  tp: 95.40  },
    'AUDNZD': { entry: 1.0700, sl: 1.0650, tp: 1.0750 },
    'AUDCAD': { entry: 0.8700, sl: 0.8650, tp: 0.8750 },
    'AUDCHF': { entry: 0.5680, sl: 0.5640, tp: 0.5720 },
    'NZDJPY': { entry: 89.50,  sl: 88.90,  tp: 90.10  },
    'NZDCAD': { entry: 0.8120, sl: 0.8070, tp: 0.8170 },
    'NZDCHF': { entry: 0.5300, sl: 0.5260, tp: 0.5340 },
    'CADJPY': { entry: 109.50, sl: 108.80, tp: 110.20 },
    'CADCHF': { entry: 0.6550, sl: 0.6510, tp: 0.6590 },
    'CHFJPY': { entry: 167.00, sl: 166.20, tp: 167.80 },
    // Metals & Commodities — 1:1 R:R
    'XAUUSD': { entry: 2950.00, sl: 2935.00, tp: 2965.00 },
    'XAGUSD': { entry: 33.50,   sl: 33.00,   tp: 34.00  },
    'USOIL':  { entry: 72.00,   sl: 71.00,   tp: 73.00  },
    'UKOIL':  { entry: 76.00,   sl: 75.00,   tp: 77.00  },
    // Indices — 1:1 R:R
    'US30':   { entry: 43500, sl: 43300, tp: 43700 },
    'NAS100': { entry: 21500, sl: 21350, tp: 21650 },
    'SPX500': { entry: 5900,  sl: 5860,  tp: 5940  },
    'GER40':  { entry: 22000, sl: 21850, tp: 22150 },
    'UK100':  { entry: 8700,  sl: 8650,  tp: 8750  },
    'FRA40':  { entry: 8100,  sl: 8050,  tp: 8150  },
    'JPN225': { entry: 38500, sl: 38200, tp: 38800 },
    'HK50':   { entry: 21000, sl: 20800, tp: 21200 },
    // Crypto — 1:1 R:R
    'BTCUSD': { entry: 95000, sl: 93500, tp: 96500 },
    'ETHUSD': { entry: 3400,  sl: 3300,  tp: 3500  },
    'SOLUSD': { entry: 185.00, sl: 180.00, tp: 190.00 },
    'XRPUSD': { entry: 2.5000, sl: 2.4000, tp: 2.6000 },
    'ADAUSD': { entry: 0.9500, sl: 0.9100, tp: 0.9900 },
    'DOTUSD': { entry: 8.50,   sl: 8.20,   tp: 8.80  },
    'LINKUSD': { entry: 18.00, sl: 17.20,  tp: 18.80 },
  };

  export let initialPair = 'EURUSD';
  let pair = initialPair;
  let balance = 100000;
  let riskPercent = 0.5;

  const d = DEFAULTS[initialPair] ?? DEFAULTS['EURUSD'];
  let entryPrice = d.entry;
  let stopLoss   = d.sl;
  let takeProfit = d.tp;
  let direction = 'buy';

  $: config = ASSET_CONFIGS[pair];

  // ✅ Instant Logic (Fixed for all asset types)
  $: calculations = (() => {
    const bal = parseFloat(balance);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!bal || !risk || !entry || !sl || bal <= 0) return null;

    const riskAmount = (bal * risk) / 100;
    const slDistance = Math.abs(entry - sl);
    if (slDistance === 0) return null;

    const slPips = slDistance / config.pip;
    const tpDistance = tp > 0 ? Math.abs(entry - tp) : 0;
    const tpPips = tpDistance / config.pip;

    // Logic for Pip Value per 1.0 Standard Lot
    let pipValuePerLot = 10; 
    if (pair.includes('JPY')) pipValuePerLot = 1000;
    else if (pair === 'XAUUSD') pipValuePerLot = 10; 
    else if (config.cat === 'Indices' || config.cat === 'Crypto' || config.cat === 'Commodities') {
      pipValuePerLot = 1; // Calculating based on point value
    }

    const lotSize = riskAmount / (slPips * pipValuePerLot);
    const potentialProfit = tpPips > 0 ? lotSize * tpPips * pipValuePerLot : 0;
    const rrRatio = tpPips > 0 ? tpPips / slPips : 0;

    return {
      lotSize: lotSize.toFixed(2),
      riskAmount: riskAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      profit: potentialProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      rr: rrRatio.toFixed(2)
    };
  })();
</script>

<div class="min-h-screen bg-gray-950 p-4 font-sans text-white">
  <div class="max-w-md mx-auto">
    <header class="text-center mb-6 pt-4">
      <div class="flex items-center justify-center gap-3 mb-2">
        <span class="text-emerald-400">{@html IconTarget}</span>
        <h1 class="text-2xl font-black tracking-tighter uppercase">POSITION SIZER</h1>
      </div>
      <p class="text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase">Multi-Asset Protocol</p>
    </header>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl">
      <label for="asset-pair" class="block text-gray-200 text-xs font-bold mb-2 uppercase tracking-tight">Trading Asset</label>
      <select id="asset-pair" bind:value={pair} class="w-full bg-gray-800 text-white rounded-xl px-4 py-3.5 border border-white/10 focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none">
        {#each ['Forex Majors', 'Forex Crosses', 'Metals', 'Indices', 'Crypto', 'Commodities'] as category}
          <optgroup label={category}>
            {#each Object.entries(ASSET_CONFIGS).filter(([_, c]) => c.cat === category) as [id, c]}
              <option value={id}>{c.name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl">
      <div class="grid grid-cols-2 gap-3">
        <button type="button" on:click={() => direction = 'buy'} class="py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all {direction === 'buy' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 border border-white/5'}">
          {@html IconUp} BUY
        </button>
        <button type="button" on:click={() => direction = 'sell'} class="py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all {direction === 'sell' ? 'bg-rose-500 text-white' : 'bg-gray-800 text-gray-400 border border-white/5'}">
          {@html IconDown} SELL
        </button>
      </div>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="balance" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Account ($)</label>
          <input id="balance" type="number" bind:value={balance} class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10" />
        </div>
        <div>
          <label for="risk" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Risk (%)</label>
          <input id="risk" type="number" bind:value={riskPercent} step="0.1" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10" />
        </div>
      </div>
      
      <div>
        <label for="entry" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Entry Price</label>
        <input id="entry" type="number" bind:value={entryPrice} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="sl" class="block text-rose-400 text-[10px] font-bold mb-1 uppercase">Stop Loss</label>
          <input id="sl" type="number" bind:value={stopLoss} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10" />
        </div>
        <div>
          <label for="tp" class="block text-emerald-400 text-[10px] font-bold mb-1 uppercase">Take Profit</label>
          <input id="tp" type="number" bind:value={takeProfit} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10" />
        </div>
      </div>
    </div>

    <div class="min-h-[240px]">
      {#if calculations}
        <div class="bg-emerald-500 rounded-2xl p-6 mb-4 shadow-[0_0_50px_-10px_rgba(16,185,129,0.4)]">
          <p class="text-black text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Recommended Position</p>
          <div class="text-6xl font-black text-black tracking-tighter">{calculations.lotSize}</div>
          <p class="text-black text-xs font-bold uppercase">Standard Lots</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase mb-1">R:R Ratio</p>
            <p class="text-white text-xl font-black">1:{calculations.rr}</p>
          </div>
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase mb-1">Total Risk</p>
            <p class="text-rose-400 text-xl font-black">${calculations.riskAmount}</p>
          </div>
        </div>
      {/if}
    </div>

    <footer class="text-center mt-8 pb-6">
      <p class="text-gray-200 text-[10px] font-bold uppercase tracking-[0.4em]">Trade Smart • Veteran Owned</p>
    </footer>
  </div>
</div>
