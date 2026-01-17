<script>
  import { Activity, Target, AlertTriangle, CheckCircle2 } from 'lucide-svelte';

  const ASSET_CONFIGS = {
    'EURUSD': { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5 },
    'GBPUSD': { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5 },
    'USDJPY': { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3 },
    'XAUUSD': { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2 },
    'US30': { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2 },
    'NAS100': { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2 },
    'BTCUSD': { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2 },
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

  // Reactive calculation block
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

    // Institutional Volatility Boundaries
    const adrVal = adrPips * config.pipValue;
    const adrHigh = entry + adrVal;
    const adrLow = entry - adrVal;

    // Rules: Buy (SL < Low, TP <= High) | Sell (SL > High, TP >= Low)
    const slOk = direction === 'buy' ? sl < adrLow : sl > adrHigh;
    const tpOk = direction === 'buy' ? (tp > entry && tp <= adrHigh) : (tp < entry && tp >= adrLow);
    
    let pipValuePerLot = 10;
    if (pair === 'USDJPY') pipValuePerLot = 1000;
    else if (pair === 'BTCUSD') pipValuePerLot = 1;

    const lotSize = riskAmount / (slPips * pipValuePerLot);

    return {
      lotSize: lotSize.toFixed(2),
      riskAmount: riskAmount.toLocaleString(),
      rrRatio: tpPips > 0 ? (tpPips / slPips).toFixed(2) : '0.00',
      adrHigh: adrHigh.toFixed(config.priceDecimals),
      adrLow: adrLow.toFixed(config.priceDecimals),
      isAdjusted: slOk && tpOk,
      slOk,
      tpOk
    };
  })();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Activity class="text-emerald-500 w-5 h-5" />
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trade Configuration</span>
    </div>
    <div class="flex bg-slate-800 p-1 rounded-xl">
      <button on:click={() => direction = 'buy'} class="px-4 py-1.5 rounded-lg text-[10px] font-black transition-all {direction === 'buy' ? 'bg-emerald-500 text-black' : 'text-slate-500'}">BUY</button>
      <button on:click={() => direction = 'sell'} class="px-4 py-1.5 rounded-lg text-[10px] font-black transition-all {direction === 'sell' ? 'bg-rose-500 text-black' : 'text-slate-500'}">SELL</button>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl">
        <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Asset</label>
        <select bind:value={pair} class="w-full bg-transparent font-bold text-white outline-none">
          {#each Object.entries(ASSET_CONFIGS) as [key, cfg]}
            <option value={key} class="bg-slate-900">{cfg.name}</option>
          {/each}
        </select>
      </div>
      <div class="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl">
        <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Risk %</label>
        <input type="number" bind:value={riskPercent} step="0.1" class="w-full bg-transparent font-bold text-white outline-none" />
      </div>
    </div>

    <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-2">Entry & Levels</label>
      <div class="space-y-3">
        <input type="number" bind:value={entryPrice} step={config.pipValue} class="w-full bg-slate-800/50 p-2 rounded-lg font-mono text-sm border border-slate-700 text-white outline-none" />
        <div class="grid grid-cols-2 gap-3">
          <input type="number" bind:value={stopLoss} step={config.pipValue} class="bg-slate-800/50 p-2 rounded-lg font-mono text-sm border border-slate-700 text-white outline-none" placeholder="SL" />
          <input type="number" bind:value={takeProfit} step={config.pipValue} class="bg-slate-800/50 p-2 rounded-lg font-mono text-sm border border-slate-700 text-white outline-none" placeholder="TP" />
        </div>
      </div>
    </div>
  </div>

  {#if calculations}
    <div class="bg-emerald-500 p-6 rounded-[2rem] text-black shadow-xl">
      <div class="flex justify-between items-start mb-1">
        <span class="text-[10px] font-black uppercase opacity-60">Position Size</span>
        <Target class="w-5 h-5 opacity-40" />
      </div>
      <div class="text-6xl font-black tracking-tighter leading-none mb-4">{calculations.lotSize}</div>
      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-black/10">
        <div>
          <p class="text-[9px] font-black opacity-60 uppercase">R:R Ratio</p>
          <p class="text-lg font-black">1:{calculations.rrRatio}</p>
        </div>
        <div>
          <p class="text-[9px] font-black opacity-60 uppercase">Risk Amount</p>
          <p class="text-lg font-black">${calculations.riskAmount}</p>
        </div>
      </div>
    </div>

    <div class="bg-slate-900 border {calculations.isAdjusted ? 'border-emerald-500/30' : 'border-rose-500/30'} p-5 rounded-[2rem]">
      <div class="flex justify-between items-center mb-4">
        <span class="text-[10px] font-black uppercase text-slate-500">Volatility Analysis</span>
        <span class="px-3 py-1 rounded-full text-[9px] font-black border {calculations.isAdjusted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}">
          {calculations.isAdjusted ? 'ADR ADJUSTED' : 'NOISE RISK'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-[9px] font-bold text-slate-500 uppercase mb-1">Safety Floor</p>
          <p class="text-xs font-mono font-bold text-white">{direction === 'buy' ? calculations.adrLow : calculations.adrHigh}</p>
          <p class="text-[8px] mt-1 font-black {calculations.slOk ? 'text-emerald-500' : 'text-rose-500'}">
            {calculations.slOk ? '✓ SL PROTECTED' : '⚠ SL IN NOISE'}
          </p>
        </div>
        <div>
          <p class="text-[9px] font-bold text-slate-500 uppercase mb-1">Session Ceiling</p>
          <p class="text-xs font-mono font-bold text-white">{direction === 'buy' ? calculations.adrHigh : calculations.adrLow}</p>
          <p class="text-[8px] mt-1 font-black {calculations.tpOk ? 'text-emerald-500' : 'text-rose-500'}">
            {calculations.tpOk ? '✓ TARGET REALISTIC' : '⚠ TP OUT OF RANGE'}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
