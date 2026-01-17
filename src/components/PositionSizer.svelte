          <div class="flex justify-between items-center">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Volatility Analysis</h3>
            {#if calculations.isVolatilityAdjusted}
              <span class="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" /> VOLATILITY ADJUSTED
              </span>
            {:else}
              <span class="bg-rose-500/10 text-rose-500 text-[10px] font-black px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle class="w-3 h-3" /> NOISE RISK
              </span>
            {/if} </div>
