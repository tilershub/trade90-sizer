<script>
  import { TrendingUp, TrendingDown, Target } from 'lucide-svelte';

  const ASSET_CONFIGS = {
    'EURUSD': { name: 'EUR/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'GBPUSD': { name: 'GBP/USD', pipValue: 0.0001, priceDecimals: 5, category: 'Forex Majors' },
    'USDJPY': { name: 'USD/JPY', pipValue: 0.01, priceDecimals: 3, category: 'Forex Majors' },
    'XAUUSD': { name: 'XAU/USD (Gold)', pipValue: 0.1, priceDecimals: 2, category: 'Metals' },
    'US30': { name: 'US30 (Dow Jones)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'NAS100': { name: 'NAS100 (Nasdaq)', pipValue: 1.0, priceDecimals: 2, category: 'Indices' },
    'BTCUSD': { name: 'BTC/USD', pipValue: 1.0, priceDecimals: 2, category: 'Crypto' },
  };

  let pair = 'EURUSD';
  let balance = '100000';
  let riskPercent = '0.5';
  let entryPrice = '1.0850';
  let stopLoss = '1.0825';
  let takeProfit = '1.0900';
  let direction = 'buy';

  $: config = ASSET_CONFIGS[pair] || ASSET_CONFIGS['EURUSD'];

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

    let pipValuePerLot = (pair === 'USDJPY') ? 1000 : (pair === 'BTCUSD' ? 1 : 10);

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

<div class="p-4 font-sans bg-slate-950">
  <div class="max-w-md mx-auto">
    <div class="text-center mb-6 pt-4">
      <div class="flex items-center justify-center gap-2 mb-2">
        <Target class="w-8 h-8 text-emerald-400" />
        <h1 class="text-2xl font-black text-white tracking-tighter uppercase">POSITION SIZER</h1>
      </div>
      <p class="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Institutional Risk Framework</p>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
      <label for="pair-select" class="block text-slate-400 text-[10px] uppercase font-bold mb-2">Trading Asset</label>
      <select id="pair-select" bind:value={pair} aria-label="Select Trading Pair" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none">
        {#each Object.entries(ASSET_CONFIGS) as [key, cfg]}
          <option value={key}>{cfg.name}</option>
        {/each}
      </select>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
      <span class="block text-slate-400 text-[10px] uppercase font-bold mb-3">Order Direction</span>
      <div class="grid grid-cols-2 gap-3">
        <button on:click={() => direction = 'buy'} aria-label="Set direction to Buy" class={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${direction === 'buy' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}><TrendingUp class="w-4 h-4" />BUY</button>
        <button on:click={() => direction = 'sell'} aria-label="Set direction to Sell" class={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${direction === 'sell' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}><TrendingDown class="w-4 h-4" />SELL</button>
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
      <div>
        <label for="balance" class="block text-slate-400 text-[10px] uppercase font-bold mb-2">Account Equity ($)</label>
        <input id="balance" type="number" bind:value={balance} aria-label="Account Balance" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700" />
      </div>
      <div>
        <label for="risk" class="block text-slate-400 text-[10px] uppercase font-bold mb-2">Risk Percent (%)</label>
        <input id="risk" type="number" bind:value={riskPercent} aria-label="Risk Percentage" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700" />
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
      <input type="number" bind:value={entryPrice} aria-label="Entry Price" placeholder="Entry" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700" />
      <input type="number" bind:value={stopLoss} aria-label="Stop Loss Price" placeholder="Stop Loss" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700" />
      <input type="number" bind:value={takeProfit} aria-label="Take Profit Price" placeholder="Take Profit" class="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700" />
    </div>

    {#if calculations}
      <div class="bg-emerald-500 text-black rounded-2xl p-6 mb-4 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
        <span class="text-[10px] uppercase font-black opacity-70">Recommended Position Size</span>
        <div class="text-5xl font-black my-1">{calculations.lotSize}</div>
        <span class="text-[10px] uppercase font-bold">Standard Lots</span>
      </div>
    {/if}
  </div>
</div>
