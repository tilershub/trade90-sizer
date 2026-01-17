<script>
  import { TrendingUp, TrendingDown, Target, Activity, AlertTriangle, CheckCircle2 } from 'lucide-svelte';

  const ASSET_CONFIGS = {
    // Forex Majors
    'EURUSD': { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'GBPUSD': { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDJPY': { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Majors' },
    'USDCHF': { name: 'USD/CHF', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'AUDUSD': { name: 'AUD/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDCAD': { name: 'USD/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    
    // Forex Crosses
    'EURGBP': { name: 'EUR/GBP', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    'EURJPY': { name: 'EUR/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'GBPJPY': { name: 'GBP/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'AUDJPY': { name: 'AUD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Crosses' },
    'GBPCAD': { name: 'GBP/CAD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Crosses' },
    
    // Metals
    'XAUUSD': { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2, category: 'Metals' },
    'XAGUSD': { name: 'XAG/USD (Silver)', pipValue: 0.01, priceDecimals: 3, category: 'Metals' },
    
    // Indices
    'US30': { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'NAS100': { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'SPX500': { name: 'SPX500 (S&P 500)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'GER40': { name: 'GER40 (DAX)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    
    // Crypto
    'BTCUSD': { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'ETHUSD': { name: 'ETH/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
    'SOLUSD': { name: 'SOL/USD', pipValue: 0.01, priceDecimals: 3, category: 'Crypto' },
    
    // Commodities
    'USOIL': { name: 'US Oil (WTI)', pipValue: 0.01, priceDecimals: 2, category: 'Commodities' },
    'NATGAS': { name: 'Natural Gas', pipValue: 0.001, priceDecimals: 3, category: 'Commodities' },
  };

  let pair = 'EURUSD';
  let balance = 100000;
  let riskPercent = 0.5;
  let entryPrice = 1.0850;
  let stopLoss = 1.0825;
  let takeProfit = 1.0900;
  let direction = 'buy';
  let adrPips = 85; 

  $: config = ASSET_CONFIGS[pair];

  $: calculations = (() => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    if (bal <= 0 || risk <= 0 || entry <= 0 || sl <= 0) return null;

    const riskAmount = (bal * risk) / 100;
    const slDistance = Math.abs(entry - sl);
    const slPips = slDistance / config.pipValue;
    const tpDistance = tp > 0 ? Math.abs(entry - tp) : 0;
    const tpPips = tpDistance / config.pipValue;

    // Institutional Volatility Boundaries (ADR 5-Day)
    const adrVal = adrPips * config.pipValue;
    const adrHigh = entry + adrVal;
    const adrLow = entry - adrVal;

    // Safety Rules
    const slOk = direction === 'buy' ? sl < adrLow : sl > adrHigh;
    const tpOk = direction === 'buy' ? (tp > entry && tp <= adrHigh) : (tp < entry && tp >= adrLow);
    
    let pipValuePerLot = 10;
    if (config.category === 'Indices') pipValuePerLot = 1;
    else if (pair === 'USDJPY' || config.pipValue === 0.01) pipValuePerLot = 1000;
    else if (pair === 'XAUUSD') pipValuePerLot = 10;
    else if (config.category === 'Crypto') pipValuePerLot = 1;

    const lotSize = riskAmount / (slPips * pipValuePerLot);

    return {
      lotSize: lotSize.toFixed(2),
      riskAmount: riskAmount.toLocaleString(),
      rrRatio: tpPips > 0 ? (tpPips / slPips).toFixed(2) : '0.00',
      adrHigh: adrHigh.toFixed(config.priceDecimals),
      adrLow: adrLow.toFixed(config.priceDecimals),
      isAdjusted: slOk && tpOk,
      slOk, tpOk,
      potentialProfit: (lotSize * tpPips * pipValuePerLot).toFixed(2)
    };
  })();
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
      <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Asset Selection</label>
      <select bind:value={pair} class="w-full bg-transparent text-white font-bold outline-none">
        {#each [...new Set(Object.values(ASSET_CONFIGS).map(v => v.category))] as cat}
          <optgroup label={cat}>
            {#each Object.entries(ASSET_CONFIGS).filter(([_, v]) => v.category === cat) as [key, cfg]}
              <option value={key} class="bg-slate-900">{cfg.name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </div>
    <div class="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl flex gap-1">
      <button on:click={() => direction = 'buy'} class="flex-1 rounded-xl py-2 text-[10px] font-black transition-all {direction === 'buy' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}">BUY</button>
      <button on:click={() => direction = 'sell'} class="flex-1 rounded-xl py-2 text-[10px] font-black transition-all {direction === 'sell' ? 'bg-rose-500 text-black shadow-lg shadow-rose-500/20' : 'text-slate-500'}">SELL</button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
      <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Balance ($)</label>
      <input type="number" bind:value={balance} class="w-full bg-transparent text-white font-bold outline-none" />
    </div>
    <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
      <label class="block text-[10px] font-black uppercase text-slate-500 mb-2">Risk (%)</label>
      <input type="number" bind:value={riskPercent} step="0.1" class="w-full bg-transparent text-white font-bold outline-none" />
    </div>
  </div>

  <div class="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl space-y-4">
    <div class="flex items-center gap-2 mb-2">
      <Activity class="w-4 h-4 text-slate-500" />
      <span class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Entry & Exit Levels</span>
    </div>
    <input type="number" bind:value={entryPrice} step={config.pipValue} class="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl font-mono text-white outline-none" placeholder="Entry Price" />
    <div class="grid grid-cols-2 gap-4">
      <input type="number" bind:value={stopLoss} step={config.pipValue} class="bg-slate-800/50 border border-slate-700 p-3 rounded-xl font-mono text-white outline-none" placeholder="Stop Loss" />
      <input type="number" bind:value={takeProfit} step={config.pipValue} class="bg-slate-800/50 border border-slate-700 p-3 rounded-xl font-mono text-white outline-none" placeholder="Take Profit" />
    </div>
  </div>

  {#if calculations}
    
    <div class="bg-emerald-500 p-8 rounded-[2.5rem] text-black shadow-2xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
        <Target size={120} />
      </div>
      <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Lot Size</span>
      <div class="text-7xl font-black tracking-tighter mb-6">{calculations.lotSize}</div>
      <div class="grid grid-cols-2 gap-8 pt-6 border-t border-black/10">
        <div>
          <p class="text-[10px] font-black opacity-60 uppercase mb-1">Risk:Reward</p>
          <p class="text-2xl font-black">1:{calculations.rrRatio}</p>
        </div>
        <div>
          <p class="text-[10px] font-black opacity-60 uppercase mb-1">Potential Gain</p>
          <p class="text-2xl font-black">${calculations.potentialProfit}</p>
        </div>
      </div>
    </div>

    <div class="bg-slate-900 border {calculations.isAdjusted ? 'border-emerald-500/30' : 'border-rose-500/30'} p-6 rounded-[2.5rem] transition-all duration-500">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Volatility Check</h3>
        <span class="px-4 py-1.5 rounded-full text-[9px] font-black border {calculations.isAdjusted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'} transition-all">
          {calculations.isAdjusted ? 'VOLATILITY PROTECTED' : 'NOISE WARNING'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-8">
        <div>
          <p class="text-[9px] font-black text-slate-500 uppercase mb-1">Stop Boundary (ADR)</p>
          <p class="text-sm font-mono font-bold text-white">{direction === 'buy' ? calculations.adrLow : calculations.adrHigh}</p>
          <p class="text-[9px] mt-2 font-black {calculations.slOk ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1">
            {#if calculations.slOk}<CheckCircle2 size={10}/> SL IS SAFE{:else}<AlertTriangle size={10}/> SL IN NOISE{/if}
          </p>
        </div>
        <div>
          <p class="text-[9px] font-black text-slate-500 uppercase mb-1">Target Limit (ADR)</p>
          <p class="text-sm font-mono font-bold text-white">{direction === 'buy' ? calculations.adrHigh : calculations.adrLow}</p>
          <p class="text-[9px] mt-2 font-black {calculations.tpOk ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1">
            {#if calculations.tpOk}<CheckCircle2 size={10}/> TP REALISTIC{:else}<AlertTriangle size={10}/> TP TOO FAR{/if}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  select { appearance: none; -webkit-appearance: none; }
</style>
