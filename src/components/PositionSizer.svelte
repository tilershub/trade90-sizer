<script>
  import { TrendingUp, TrendingDown, Target } from 'lucide-svelte';

  const ASSET_CONFIGS = {
    // Forex Majors
    'EURUSD': { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'GBPUSD': { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDJPY': { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Majors' },
    'USDCHF': { name: 'USD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'AUDUSD': { name: 'AUD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'NZDUSD': { name: 'NZD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDCAD': { name: 'USD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    
    // Forex Crosses
    'EURGBP': { name: 'EUR/GBP', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'EURJPY': { name: 'EUR/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'EURAUD': { name: 'EUR/AUD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'EURNZD': { name: 'EUR/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'EURCAD': { name: 'EUR/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'EURCHF': { name: 'EUR/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'GBPJPY': { name: 'GBP/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'GBPAUD': { name: 'GBP/AUD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'GBPNZD': { name: 'GBP/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'GBPCAD': { name: 'GBP/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'GBPCHF': { name: 'GBP/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'AUDJPY': { name: 'AUD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'AUDNZD': { name: 'AUD/NZD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'AUDCAD': { name: 'AUD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'AUDCHF': { name: 'AUD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'NZDJPY': { name: 'NZD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'NZDCAD': { name: 'NZD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'NZDCHF': { name: 'NZD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'CADJPY': { name: 'CAD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'CADCHF': { name: 'CAD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'CHFJPY': { name: 'CHF/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    
    // Metals
    'XAUUSD': { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2, category: 'Metals' },
    'XAGUSD': { name: 'XAG/USD (Silver)', pipValue: 0.01, priceDecimals: 3, category: 'Metals' },
    
    // Indices
    'US30': { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'NAS100': { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'SPX500': { name: 'SPX500 (S&P 500)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'UK100': { name: 'UK100 (FTSE)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'GER40': { name: 'GER40 (DAX)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'FRA40': { name: 'FRA40 (CAC)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'AUS200': { name: 'AUS200 (ASX)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'JPN225': { name: 'JPN225 (Nikkei)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'HK50': { name: 'HK50 (Hang Seng)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    
    // Crypto
    'BTCUSD': { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'ETHUSD': { name: 'ETH/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'LTCUSD': { name: 'LTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'XRPUSD': { name: 'XRP/USD', pipValue: 0.0001, priceDecimals: 4, category: 'Crypto' },
    'ADAUSD': { name: 'ADA/USD', pipValue: 0.0001, priceDecimals: 4, category: 'Crypto' },
    
    // Commodities
    'USOIL': { name: 'US Oil (WTI)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
    'UKOIL': { name: 'UK Oil (Brent)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
  };

  let pair = 'EURUSD';
  let balance = '100000';
  let riskPercent = '0.5';
  let entryPrice = '1.0850';
  let stopLoss = '1.0825';
  let takeProfit = '1.0900';
  let direction = 'buy';

  $: config = ASSET_CONFIGS[pair];

  $: calculations = (() => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    if (bal <= 0 || risk <= 0 || entry <= 0 || sl <= 0) {
      return null;
    }

    const riskAmount = (bal * risk) / 100;
    const slDistance = Math.abs(entry - sl);
    const slPips = slDistance / config.pipValue;
    const tpDistance = tp > 0 ? Math.abs(entry - tp) : 0;
    const tpPips = tpDistance / config.pipValue;

    let pipValuePerLot = 10;
    if (pair === 'USDJPY') {
      pipValuePerLot = 1000;
    } else if (pair === 'XAUUSD') {
      pipValuePerLot = 10;
    } else if (pair === 'US30' || pair === 'NAS100') {
      pipValuePerLot = 10;
    } else if (pair === 'BTCUSD') {
      pipValuePerLot = 1;
    }

    const lotSize = riskAmount / (slPips * pipValuePerLot);
    const potentialProfit = tpPips > 0 ? lotSize * tpPips * pipValuePerLot : 0;
    const rrRatio = tpPips > 0 ? tpPips / slPips : 0;

    return {
      lotSize: lotSize.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips > 0 ? tpPips.toFixed(1) : '0.0',
      potentialProfit: potentialProfit.toFixed(2),
      rrRatio: rrRatio > 0 ? rrRatio.toFixed(2) : '0.00'
    };
  })();
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 font-sans">
  <div class="max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6 pt-4">
      <div class="flex items-center justify-center gap-2 mb-2">
        <Target class="w-8 h-8 text-emerald-400" />
        <h1 class="text-2xl font-bold text-white">POSITON SIZER</h1>
      </div>
      <p class="text-gray-400 text-sm">Risk Analyzer</p>
    </div>

    <!-- Pair Selector -->
    <div class="bg-gray-800 rounded-2xl p-4 mb-4 shadow-xl border border-gray-700">
      <label class="block text-gray-300 text-sm font-semibold mb-2">
        Pair
      </label>
      <select
        bind:value={pair}
        class="w-full bg-gray-700 text-white rounded-xl px-4 py-3.5 text-base border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

    <!-- Direction Toggle -->
    <div class="bg-gray-800 rounded-2xl p-4 mb-4 shadow-xl border border-gray-700">
      <label class="block text-gray-300 text-sm font-semibold mb-3">
        Direction
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          on:click={() => direction = 'buy'}
          class={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            direction === 'buy'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          <TrendingUp class="w-5 h-5" />
          BUY
        </button>
        <button
          on:click={() => direction = 'sell'}
          class={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            direction === 'sell'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          <TrendingDown class="w-5 h-5" />
          SELL
        </button>
      </div>
    </div>

    <!-- Account Settings -->
    <div class="bg-gray-800 rounded-2xl p-4 mb-4 shadow-xl border border-gray-700 space-y-4">
      <div>
        <label class="block text-gray-300 text-sm font-semibold mb-2">
          Account Balance ($)
        </label>
        <input
          type="number"
          bind:value={balance}
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="100000"
          step="1000"
        />
      </div>

      <div>
        <label class="block text-gray-300 text-sm font-semibold mb-2">
          Risk (%)
        </label>
        <input
          type="number"
          bind:value={riskPercent}
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="0.5"
          step="0.1"
        />
        {#if calculations}
          <div class="mt-1 text-xs text-emerald-400">
            Risk Amount: ${calculations.riskAmount}
          </div>
        {/if}
      </div>
    </div>

    <!-- Trade Levels -->
    <div class="bg-gray-800 rounded-2xl p-4 mb-4 shadow-xl border border-gray-700 space-y-4">
      <div>
        <label class="block text-gray-300 text-sm font-semibold mb-2">
          Entry Price
        </label>
        <input
          type="number"
          bind:value={entryPrice}
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1.0850"
          step={config.pipValue}
        />
      </div>

      <div>
        <label class="block text-gray-300 text-sm font-semibold mb-2">
          Stop Loss Price
        </label>
        <input
          type="number"
          bind:value={stopLoss}
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
          placeholder="1.0825"
          step={config.pipValue}
        />
        {#if calculations}
          <div class="mt-1 text-xs text-rose-400">
            {calculations.slPips} pips
          </div>
        {/if}
      </div>

      <div>
        <label class="block text-gray-300 text-sm font-semibold mb-2">
          Take Profit Price
        </label>
        <input
          type="number"
          bind:value={takeProfit}
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="1.0900"
          step={config.pipValue}
        />
        {#if calculations}
          <div class="mt-1 text-xs text-emerald-400">
            {calculations.tpPips} pips
          </div>
        {/if}
      </div>
    </div>

    <!-- Results -->
    {#if calculations}
      <!-- Lot Size -->
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 mb-4 shadow-xl">
        <div class="text-emerald-100 text-sm font-semibold mb-2">
          Position Size
        </div>
        <div class="text-5xl font-bold text-white mb-1">
          {calculations.lotSize}
        </div>
        <div class="text-emerald-100 text-xs">
          Lots (Standard)
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-700">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-700 rounded-xl p-3">
            <div class="text-gray-400 text-xs mb-1">Risk:Reward</div>
            <div class="text-white text-xl font-bold">1:{calculations.rrRatio}</div>
          </div>
          
          <div class="bg-gray-700 rounded-xl p-3">
            <div class="text-gray-400 text-xs mb-1">Potential Profit</div>
            <div class="text-emerald-400 text-xl font-bold">${calculations.potentialProfit}</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer -->
    <div class="text-center mt-6 pb-4">
      <p class="text-gray-500 text-xs">
        PRO Position Sizing • Trade Smart, Risk Less
      </p>
    </div>
  </div>
</div>
