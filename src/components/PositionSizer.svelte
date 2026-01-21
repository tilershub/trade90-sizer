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

  let pair = 'EURUSD';
  let balance = 100000;
  let riskPercent = 0.5;
  let entryPrice = 1.08500;
  let stopLoss = 1.08000;
  let takeProfit = 1.09500;
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
      <p class="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">Trade Smart • Veteran Owned</p>
    </footer>
  </div>
</div>
