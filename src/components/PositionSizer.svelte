<script>
  // ✅ High-Performance Inline SVGs (No external dependencies)
  const IconTarget = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>`;
  const IconUp = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 17 10-10M7 7h10v10"/></svg>`;
  const IconDown = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M7 17h10V7"/></svg>`;
  const IconShield = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const IconShieldLg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const IconWarning = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

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

  // --- Account Mode ---
  const MODE_SETTINGS = {
    funded: { riskPercent: 0.5, dailyTarget: 1.0, maxTradeRisk: 0.5 },
    real:   { riskPercent: 1.0, dailyTarget: 3.0, maxTradeRisk: 2.0 },
  };

  export let initialPair = 'EURUSD';
  let pair = initialPair;
  let balance = 100000;
  let accountMode = 'funded';
  let riskPercent = MODE_SETTINGS.funded.riskPercent;

  const d = DEFAULTS[initialPair] ?? DEFAULTS['EURUSD'];
  let entryPrice = d.entry;
  let stopLoss   = d.sl;
  let takeProfit = d.tp;
  let direction = 'buy';

  // Daily tracker state
  let dailyRiskLogged = 0;

  function switchMode(mode) {
    accountMode = mode;
    riskPercent = MODE_SETTINGS[mode].riskPercent;
  }

  function logTrade() {
    dailyRiskLogged = parseFloat((dailyRiskLogged + parseFloat(riskPercent)).toFixed(4));
  }

  function resetDay() {
    dailyRiskLogged = 0;
  }

  $: config = ASSET_CONFIGS[pair];
  $: modeSettings = MODE_SETTINGS[accountMode];
  $: dailyTarget = modeSettings.dailyTarget;
  $: maxTradeRisk = modeSettings.maxTradeRisk;

  // --- Risk State ---
  $: riskState = (() => {
    const r = parseFloat(riskPercent) || 0;
    if (accountMode === 'funded') {
      if (r <= 0.5)  return 'safe';
      if (r <= 0.75) return 'caution';
      if (r <= 1.0)  return 'aggressive';
      return 'dangerous';
    } else {
      if (r <= 1.0)  return 'safe';
      if (r <= 1.5)  return 'caution';
      if (r <= 2.0)  return 'aggressive';
      return 'dangerous';
    }
  })();

  // Risk state visual tokens
  $: riskStateConfig = (() => {
    const map = {
      safe:       { label: 'SAFE',       cardBg: 'bg-emerald-500', glow: 'shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)]',  badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/30', textOnCard: 'text-black', icon: '✓' },
      caution:    { label: 'CAUTION',    cardBg: 'bg-amber-400',   glow: 'shadow-[0_0_50px_-10px_rgba(251,191,36,0.5)]',   badgeBg: 'bg-amber-500/20',   badgeText: 'text-amber-400',   badgeBorder: 'border-amber-500/30',   textOnCard: 'text-black', icon: '!' },
      aggressive: { label: 'AGGRESSIVE', cardBg: 'bg-orange-500',  glow: 'shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)]',   badgeBg: 'bg-orange-500/20',  badgeText: 'text-orange-400',  badgeBorder: 'border-orange-500/30',  textOnCard: 'text-white', icon: '!!' },
      dangerous:  { label: 'DANGEROUS',  cardBg: 'bg-rose-600',    glow: 'shadow-[0_0_50px_-10px_rgba(225,29,72,0.5)]',    badgeBg: 'bg-rose-500/20',    badgeText: 'text-rose-400',    badgeBorder: 'border-rose-500/30',    textOnCard: 'text-white', icon: '!!!' },
    };
    return map[riskState];
  })();

  // --- Daily Tracker Computed Values ---
  $: projectedDailyRisk = parseFloat((dailyRiskLogged + parseFloat(riskPercent || 0)).toFixed(4));
  $: dailyProgressPct = Math.min((dailyRiskLogged / dailyTarget) * 100, 100);
  $: safeTradesRemaining = Math.max(0, Math.floor((dailyTarget - dailyRiskLogged) / (parseFloat(riskPercent) || 1)));
  $: dailyWouldExceed = projectedDailyRisk > dailyTarget;
  $: exceedsMaxTradeRisk = parseFloat(riskPercent) > maxTradeRisk;

  // Progress bar color
  $: progressBarColor = (() => {
    if (dailyProgressPct < 50)  return 'bg-emerald-500';
    if (dailyProgressPct < 75)  return 'bg-amber-400';
    if (dailyProgressPct < 100) return 'bg-orange-500';
    return 'bg-rose-500';
  })();

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

    <!-- Header -->
    <header class="text-center mb-6 pt-4">
      <div class="flex items-center justify-center gap-3 mb-2">
        <span class="text-emerald-400">{@html IconTarget}</span>
        <h1 class="text-2xl font-black tracking-tighter uppercase">POSITION SIZER</h1>
      </div>
      <p class="text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase">Multi-Asset Protocol</p>
    </header>

    <!-- 1. Account Mode Toggle -->
    <div class="bg-gray-900 rounded-2xl p-3 mb-4 border border-white/5 shadow-2xl">
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          on:click={() => switchMode('funded')}
          class="py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all {accountMode === 'funded' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 border border-white/5 hover:border-white/10'}"
        >
          <span class={accountMode === 'funded' ? 'text-black' : 'text-gray-500'}>{@html IconShield}</span>
          Funded Account
        </button>
        <button
          type="button"
          on:click={() => switchMode('real')}
          class="py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all {accountMode === 'real' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 border border-white/5 hover:border-white/10'}"
        >
          Real Account
        </button>
      </div>
    </div>

    <!-- 2. Trade90 Safety System Badge (Funded Mode Only) -->
    {#if accountMode === 'funded'}
      <div class="flex justify-center mb-4">
        <div class="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5">
          <span class="text-emerald-400">{@html IconShield}</span>
          <span class="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Trade90 Safety System Active</span>
        </div>
      </div>
    {/if}

    <!-- 3. Asset Selector -->
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

    <!-- 4. Direction Toggle -->
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

    <!-- 5. Input Fields with Microcopy -->
    <div class="bg-gray-900 rounded-2xl p-4 mb-4 border border-white/5 shadow-2xl space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="balance" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Account ($)</label>
          <input id="balance" type="number" bind:value={balance} class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <p class="text-gray-600 text-[9px] mt-1 leading-tight">Your current account equity or challenge balance</p>
        </div>
        <div>
          <label for="risk" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Risk (%)</label>
          <input id="risk" type="number" bind:value={riskPercent} step="0.1" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          {#if accountMode === 'funded'}
            <p class="text-emerald-700 text-[9px] mt-1 leading-tight">Trade90 Safety System: 0.5% max per trade</p>
          {:else}
            <p class="text-gray-600 text-[9px] mt-1 leading-tight">Conservative traders risk 1% or less per trade</p>
          {/if}
        </div>
      </div>

      <div>
        <label for="entry" class="block text-gray-400 text-[10px] font-bold mb-1 uppercase">Entry Price</label>
        <input id="entry" type="number" bind:value={entryPrice} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        <p class="text-gray-600 text-[9px] mt-1 leading-tight">Your planned trade entry price</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="sl" class="block text-rose-400 text-[10px] font-bold mb-1 uppercase">Stop Loss</label>
          <input id="sl" type="number" bind:value={stopLoss} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-rose-500 focus:outline-none" />
          <p class="text-gray-600 text-[9px] mt-1 leading-tight">Price where your trade idea is invalidated</p>
        </div>
        <div>
          <label for="tp" class="block text-emerald-400 text-[10px] font-bold mb-1 uppercase">Take Profit</label>
          <input id="tp" type="number" bind:value={takeProfit} step="0.00001" class="w-full bg-gray-800 rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <p class="text-gray-600 text-[9px] mt-1 leading-tight">Your target — used to calculate R:R ratio</p>
        </div>
      </div>
    </div>

    <!-- 6. Warning Banner -->
    {#if exceedsMaxTradeRisk}
      <div class="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4">
        <span class="text-amber-400 mt-0.5 shrink-0">{@html IconWarning}</span>
        <p class="text-amber-300 text-xs font-bold leading-relaxed">
          {#if accountMode === 'funded'}
            This trade exceeds the Trade90 Safety System limit of 0.5% per trade
          {:else}
            Risk above 2% per trade is considered aggressive by institutional standards
          {/if}
        </p>
      </div>
    {/if}

    <!-- 7. Results -->
    <div class="min-h-[240px]">
      {#if calculations}

        <!-- a. Main Lot Size Card (color = risk state) -->
        <div class="{riskStateConfig.cardBg} {riskStateConfig.glow} rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div class="flex items-start justify-between mb-1">
            <p class="{riskStateConfig.textOnCard} text-[10px] font-black uppercase tracking-widest opacity-70">Recommended Position</p>
            <!-- Risk State Badge -->
            <span class="inline-flex items-center gap-1 {riskStateConfig.badgeBg} border {riskStateConfig.badgeBorder} rounded-full px-2.5 py-0.5">
              <span class="{riskStateConfig.badgeText} text-[9px] font-black uppercase tracking-widest">{riskStateConfig.icon} {riskStateConfig.label}</span>
            </span>
          </div>
          <div class="text-6xl font-black {riskStateConfig.textOnCard} tracking-tighter">{calculations.lotSize}</div>
          <p class="{riskStateConfig.textOnCard} text-xs font-bold uppercase opacity-80">Standard Lots</p>
        </div>

        <!-- b. Grid: Dollar Risk, R:R, Stop Pips -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase mb-1">Total Risk</p>
            <p class="text-rose-400 text-lg font-black">${calculations.riskAmount}</p>
          </div>
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase mb-1">R:R Ratio</p>
            <p class="text-white text-lg font-black">1:{calculations.rr}</p>
          </div>
          <div class="bg-gray-900 border border-white/5 rounded-xl p-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase mb-1">Stop Pips</p>
            <p class="text-white text-lg font-black">{calculations.slPips}</p>
          </div>
        </div>

        <!-- c. Daily Risk Tracker Panel -->
        <div class="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-4 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">{@html IconShield}</span>
              <span class="text-white text-xs font-black uppercase tracking-tight">Daily Risk Budget</span>
            </div>
            <button type="button" on:click={resetDay} class="text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-gray-300 transition-colors">
              Reset Day
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                class="{progressBarColor} h-2 rounded-full transition-all duration-300"
                style="width: {dailyProgressPct}%"
              ></div>
            </div>
          </div>

          <!-- Stats Rows -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[11px]">Used of daily target</span>
              <span class="text-white text-[11px] font-black">{dailyRiskLogged.toFixed(2)}% of {dailyTarget.toFixed(1)}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[11px]">Safe trades remaining today</span>
              <span class="{safeTradesRemaining > 0 ? 'text-emerald-400' : 'text-rose-400'} text-[11px] font-black">{safeTradesRemaining}</span>
            </div>
          </div>

          <!-- Daily Exceeded Warning -->
          {#if dailyWouldExceed}
            <div class="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-3">
              <span class="text-rose-400 shrink-0 mt-0.5">{@html IconWarning}</span>
              <p class="text-rose-300 text-[10px] font-bold leading-relaxed">
                Adding this trade would exceed your {dailyTarget.toFixed(1)}% daily risk target
              </p>
            </div>
          {/if}

          <!-- Log Trade Button -->
          <button
            type="button"
            on:click={logTrade}
            class="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-gray-800 border border-white/10 text-white hover:bg-gray-700 hover:border-white/20 active:scale-95"
          >
            Log Trade ({riskPercent}%)
          </button>
        </div>

      {/if}
    </div>

    <!-- 8. Footer -->
    <footer class="text-center mt-8 pb-6">
      {#if accountMode === 'funded'}
        <p class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em]">Trade90 Safety System &bull; 0.5% Max Per Trade &bull; 1% Daily Cap</p>
      {:else}
        <p class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Trade Smart &bull; Manage Risk &bull; Stay Consistent</p>
      {/if}
    </footer>

  </div>
</div>
