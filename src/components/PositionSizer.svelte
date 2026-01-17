<script>
  import { onMount } from 'svelte';
  import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle2, Activity } from 'lucide-svelte';

  const ASSET_CONFIGS = {
    // Forex Majors
    'EURUSD': { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'GBPUSD': { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDJPY': { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Majors' },
    'USDCHF': { name: 'USD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'AUDUSD': { name: 'AUD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'NZDUSD': { name: 'NZD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDCAD': { name: 'USD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    // Metals
    'XAUUSD': { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2, category: 'Metals' },
    'XAGUSD': { name: 'XAG/USD (Silver)', pipValue: 0.01, priceDecimals: 3, category: 'Metals' },
    // Indices
    'US30': { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'NAS100': { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'SPX500': { name: 'SPX500 (S&P 500)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    // Crypto
    'BTCUSD': { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'ETHUSD': { name: 'ETH/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    // Commodities
    'USOIL': { name: 'US Oil (WTI)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
  };

  let pair = 'EURUSD';
  let balance = '100000';
  let riskPercent = '0.5';
  let entryPrice = '1.0850';
  let stopLoss = '1.0825';
  let takeProfit = '1.0900';
  let direction = 'buy';
  
  // ADR State
  let adrPips = 0;
  let isLoadingAdr = false;

  $: config = ASSET_CONFIGS[pair];

  // Automated ADR Fetching (5-Day Average)
  async function updateADR(symbol) {
    isLoadingAdr = true;
    try {
      // Note: You should move this to a secure backend or use an environment variable for the API key
      const API_KEY = 'YOUR_FMP_API_KEY'; 
      const res = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=5&apikey=${API_KEY}`);
      const data = await res.json();
      
      if (data.historical) {
        const avgRange = data.historical.reduce((acc, day) => acc + (day.high - day.low), 0) / 5;
        adrPips = avgRange / config.pipValue;
      }
    } catch (e) {
      console.error("ADR Fetch Error", e);
      adrPips = 75; // Fallback default
    } finally {
      isLoadingAdr = false;
    }
  }

  // Trigger ADR fetch when pair changes
  $: if (pair) updateADR(pair);

  $: calculations = (() => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    if (bal <= 0 || risk <= 0 || entry <= 0 || sl <= 0) return null;

    // 1. Basic Risk Math
    const riskAmount = (bal * risk) / 100;
    const slDistance = Math.abs(entry - sl);
    const slPips = slDistance / config.pipValue;
    const tpDistance = tp > 0 ? Math.abs(entry - tp) : 0;
    const tpPips = tpDistance / config.pipValue;

    // 2. Volatility Logic (ADR Boundaries)
    const adrVal = adrPips * config.pipValue;
    const adrHigh = entry + adrVal;
    const adrLow = entry - adrVal;

    // Rules: 
    // Buy: SL < ADR Low | TP > Entry && TP <= ADR High
    // Sell: SL > ADR High | TP < Entry && TP >= ADR Low
    let slOk = direction === 'buy' ? sl < adrLow : sl > adrHigh;
    let tpOk = direction === 'buy' ? (tp > entry && tp <= adrHigh) : (tp < entry && tp >= adrLow);
    let isVolatilityAdjusted = slOk && tpOk;

    // 3. Lot Sizing
    let pipValuePerLot = 10;
    if (pair === 'USDJPY') pipValuePerLot = 1000;
    else if (['XAUUSD', 'US30', 'NAS100', 'SPX500'].includes(pair)) pipValuePerLot = 10;
    else if (pair === 'BTCUSD' || pair === 'ETHUSD') pipValuePerLot = 1;

    const lotSize = riskAmount / (slPips * pipValuePerLot);
    const potentialProfit = tpPips > 0 ? lotSize * tpPips * pipValuePerLot : 0;
    const rrRatio = tpPips > 0 ? tpPips / slPips : 0;

    return {
      lotSize: lotSize.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      potentialProfit: potentialProfit.toFixed(2),
      rrRatio: rrRatio.toFixed(2),
      adrHigh: adrHigh.toFixed(config.priceDecimals),
      adrLow: adrLow.toFixed(config.priceDecimals),
      isVolatilityAdjusted,
      slOk,
      tpOk
    };
  })();
</script>

<div class="min-h-screen bg-slate-950 p-4 font-sans text-slate-200">
  <div class="max-w-md mx-auto">
    <div class="text-center mb-8 pt-4">
      <div class="flex items-center justify-center gap-3 mb-2">
        <Activity class="w-8 h-8 text-emerald-500 animate-pulse" />
        <h1 class="text-2xl font-black tracking-tighter text-white uppercase">Volatility Sizer</h1>
      </div>
      <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Risk Management</p>
    </div>

    <div class="space-y-4">
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Asset Pair</label>
          <select bind:value={pair} class="w-full bg-transparent text-white font-bold focus:outline-none">
            {#each Object.entries(ASSET_CONFIGS) as [key, cfg]}
              <option value={key} class="bg-slate-900">{cfg.name}</option>
            {/each}
          </select>
        </div>
        <div class="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl flex gap-1">
          <button on:click={() => direction = 'buy'} class="flex-1 rounded-xl py-2 text-[10px] font-black transition-all {direction === 'buy' ? 'bg-emerald-500 text-black' : 'text-slate-500'}">BUY</button>
          <button on:click={() => direction = 'sell'} class="flex-1 rounded-xl py-2 text-[10px] font-black transition-all {direction === 'sell' ? 'bg-rose-500 text-black' : 'text-slate-500'}">SELL</button>
        </div>
      </div>

      <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div class="flex justify-between items-center">
          <label class="text-[10px] font-black uppercase text-slate-500">Balance / Risk %</label>
          {#if calculations}
            <span class="text-[10px] font-bold text-emerald-500">${calculations.riskAmount} at risk</span>
          {/if}
        </div>
        <div class="flex gap-4">
          <input type="number" bind:value={balance} class="w-2/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Balance" />
          <input type="number" bind:value={riskPercent} class="w-1/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Risk %" step="0.1" />
        </div>
      </div>

      <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Entry Price</label>
          <input type="number" bind:value={entryPrice} class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold outline-none" step={config.pipValue} />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Stop Loss</label>
            <input type="number" bind:value={stopLoss} class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono outline-none" step={config.pipValue} />
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Take Profit</label>
            <input type="number" bind:value={takeProfit} class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono outline-none" step={config.pipValue} />
          </div>
        </div>
      </div>

      {#if calculations}
        <div class="bg-emerald-500 rounded-3xl p-6 text-black shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]">
          <div class="flex justify-between items-start mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest opacity-70">Recommended Position Size</span>
            <Target class="w-5 h-5 opacity-50" />
          </div>
          <div class="text-6xl font-black tracking-tighter mb-1">{calculations.lotSize}</div>
          <div class="text-[10px] font-black uppercase tracking-widest">Standard Lots</div>
          
          <div class="mt-6 pt-6 border-t border-black/10 grid grid-cols-2 gap-4">
            <div>
              <p class="text-[9px] font-black uppercase opacity-60">Risk:Reward</p>
              <p class="text-xl font-black">1:{calculations.rrRatio}</p>
            </div>
            <div>
              <p class="text-[9px] font-black uppercase opacity-60">Potential Profit</p>
              <p class="text-xl font-black">${calculations.potentialProfit}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 border {calculations.isVolatilityAdjusted ? 'border-emerald-500/30' : 'border-rose-500/30'} p-5 rounded-3xl space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Volatility Analysis</h3>
            {#if calculations.isVolatilityAdjusted}
              <span class="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" /> ADJUSTED
              </span>
            {:else}
              <span class="bg-rose-500/10 text-rose-500 text-[10px] font-black px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle class="w-3 h-3" /> NOISE RISK
              </span>
            {}
          </div>

          <div class="grid grid-cols-2 gap-6 py-2 border-y border-slate-800/50">
            <div>
              <p class="text-[9px] font-black text-slate-500 uppercase mb-1">ADR Low (Floor)</p>
              <p class="text-xs font-mono font-bold text-white">{calculations.adrLow}</p>
              <p class="text-[8px] mt-1 {calculations.slOk ? 'text-emerald-500' : 'text-rose-500'} uppercase font-bold">
                {calculations.slOk ? '✓ SL Protected' : '⚠ SL in noise'}
              </p>
            </div>
            <div>
              <p class="text-[9px] font-black text-slate-500 uppercase mb-1">ADR High (Ceiling)</p>
              <p class="text-xs font-mono font-bold text-white">{calculations.adrHigh}</p>
              <p class="text-[8px] mt-1 {calculations.tpOk ? 'text-emerald-500' : 'text-rose-500'} uppercase font-bold">
                {calculations.tpOk ? '✓ Realistic TP' : '⚠ TP out of range'}
              </p>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-[10px]">
            <span class="text-slate-500 font-bold">5-DAY AVG RANGE</span>
            <span class="text-white font-black">{adrPips.toFixed(1)} PIPS</span>
          </div>
        </div>
      {/if}

    </div>

    <p class="text-center mt-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
      TRADE90 Proprietary Risk Logic
    </p>
  </div>
</div>

<style>
  /* Hide arrows on number inputs */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
