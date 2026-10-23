<script>
 import {POSITION_SYMBOLS,calculatePositionSize,instrumentSpecification} from "../lib/trade90-position-size.js";
 let symbol="EURUSD";
 let balance=10000;
 let riskPercent=1;
 let stopDistance=35;
 let entryPrice=150;
 let quoteToUsd=1.30;
 let extraStopDistance=0;
 let roundTripCommissionPerLot=0;
 $: spec=instrumentSpecification(symbol);
 $: usdBase=spec?.kind==="forex" && spec.base==="USD" && spec.quote!=="USD";
 $: cross=spec?.kind==="forex" && spec.quote!=="USD" && spec.base!=="USD";
 $: result=calculatePositionSize({symbol,balance,riskPercent,stopDistance,entryPrice,quoteToUsd,extraStopDistance,roundTripCommissionPerLot});
 const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
 const qty=n=>new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(n);
 const precision=n=>new Intl.NumberFormat("en-US",{maximumFractionDigits:4}).format(n);
 function changeSymbol(){stopDistance=symbol==="XAUUSD"?10:35;extraStopDistance=0;}
 function reset(){symbol="EURUSD";balance=10000;riskPercent=1;stopDistance=35;entryPrice=150;quoteToUsd=1.30;extraStopDistance=0;roundTripCommissionPerLot=0;}
</script>
<div class="risk-calculator" aria-label="Trade90 position size and risk calculator">
  <div class="calc-top">
    <div>
      <div class="eyebrow">RISK FIRST · NO TRADE SIGNALS</div>
      <h2>Position Size Calculator</h2>
      <p>Enter your planned stop distance and maximum account risk. TRADE90 calculates a lot size that stays within your risk budget under the stated assumptions.</p>
    </div>
    <button class="reset" type="button" on:click={reset}>Reset</button>
  </div>
  <div class="calc-layout">
    <form class="calc-form" on:submit|preventDefault aria-label="Position size calculator inputs">
      <div class="form-row">
        <label for="size-symbol">Instrument</label>
        <select id="size-symbol" bind:value={symbol} on:change={changeSymbol}>
          <optgroup label="Gold"><option value="XAUUSD">XAU/USD · Gold</option></optgroup>
          <optgroup label="Forex pairs">{#each POSITION_SYMBOLS.filter(s=>s!=="XAUUSD") as item}<option value={item}>{item.slice(0,3)}/{item.slice(3)}</option>{/each}</optgroup>
        </select>
        <p class="hint">{spec?.kind==="gold"?"Gold stop distance is USD per troy ounce, not broker-specific pips.":spec?.quote==="JPY"?"JPY forex pip size is 0.01.":"Forex pip size is 0.0001, except JPY-quoted pairs."}</p>
      </div>
      <div class="two">
        <div class="form-row"><label for="size-balance">Account balance (USD)</label><input id="size-balance" type="number" min="0.01" step="any" bind:value={balance} inputmode="decimal"/></div>
        <div class="form-row"><label for="size-risk">Risk per trade (%)</label><input id="size-risk" type="number" min="0.01" max="100" step="any" bind:value={riskPercent} inputmode="decimal"/></div>
      </div>
      <div class="two">
        <div class="form-row"><label for="size-stop">Stop-loss distance ({spec?.stopUnit})</label><input id="size-stop" type="number" min="0.01" step="any" bind:value={stopDistance} inputmode="decimal"/></div>
        <div class="form-row"><label for="size-buffer">Extra slippage buffer ({spec?.stopUnit})</label><input id="size-buffer" type="number" min="0" step="any" bind:value={extraStopDistance} inputmode="decimal"/></div>
      </div>
      {#if usdBase}
        <div class="form-row"><label for="size-entry">Indicative USD/{spec.quote} price</label><input id="size-entry" type="number" min="0.000001" step="any" bind:value={entryPrice} inputmode="decimal"/><p class="hint">Required to estimate the USD pip value. Enter your own current USD/{spec.quote} price; no live quote is fetched.</p></div>
      {:else if cross}
        <div class="form-row"><label for="size-quote-usd">USD value of 1 {spec.quote}</label><input id="size-quote-usd" type="number" min="0.000001" step="any" bind:value={quoteToUsd} inputmode="decimal"/><p class="hint">For {symbol.slice(0,3)}/{spec.quote}, enter how many USD equal 1 {spec.quote}. Example: EUR/GBP needs GBP-to-USD conversion. This is manual, not a live rate.</p></div>
      {/if}
      <div class="form-row"><label for="size-fee">Round-trip commission (USD per standard lot)</label><input id="size-fee" type="number" min="0" step="any" bind:value={roundTripCommissionPerLot} inputmode="decimal"/><p class="hint">Optional. Include opening and closing commission per lot. Spread is not automatically included; include an allowance in the buffer where appropriate.</p></div>
      <div class="source-note"><strong>Calculation scope:</strong> USD-denominated accounts, conventional 100,000-base-unit forex lots or 100-troy-ounce XAU/USD lots, 0.01-lot step. Confirm your broker's symbol specification and minimum volume. No market data or trade execution is involved.</div>
    </form>
    <section class="calc-result" aria-live="polite" aria-label="Calculated trade risk and position size">
      <div class="result-eyebrow">CALCULATED POSITION</div>
      {#if result.ok}
        <div class="lots">{result.lots.toFixed(2)} <small>lots</small></div>
        <p class="result-caption">Rounded down to 0.01 lot to avoid exceeding the modeled risk allowance.</p>
        {#if result.belowMinimum}
          <p class="issue" role="status">Your budget is too small for the assumed 0.01 minimum lot. Do not round up to 0.01 lot without accepting more risk.</p>
        {/if}
        {#if riskPercent>2}<p class="issue" role="status">Risk above 2% per trade can lead to large account drawdowns, particularly with leverage.</p>{/if}
        <div class="numbers">
          <div><span>Risk budget</span><strong>{money(result.riskBudget)}</strong></div>
          <div><span>Modeled loss at stop</span><strong>{money(result.modeledRisk)}</strong></div>
          <div><span>Modeled account risk</span><strong>{precision(result.modeledRiskPercent)}%</strong></div>
          <div><span>{spec.kind==="gold"?"Gold exposure":"Base currency exposure"}</span><strong>{qty(result.exposure)} {spec.kind==="gold"?"oz":spec.base}</strong></div>
        </div>
        <div class="math-lines">
          <p><strong>Value per {spec.kind==="gold"?"$1/oz move":"pip"}, 1 lot:</strong> {money(result.usdPerDistanceUnitLot)}</p>
          <p><strong>Modeled stop + buffer:</strong> {qty(result.adjustedDistance)} {spec.stopUnit}</p>
          <p><strong>Modeled loss for 1 lot:</strong> {money(result.riskPerLot)} (including entered commission)</p>
          <p><strong>Quote conversion:</strong> {result.conversionBasis}</p>
        </div>
        <p class="caution">{result.caveat}</p>
      {:else}
        <p class="issue" role="alert">{result.error}</p>
        <p class="caution">Enter valid numbers to calculate a position size. No trade is placed.</p>
      {/if}
    </section>
  </div>
</div>
<style>
.risk-calculator{background:#111c30;border:1px solid #334155;border-radius:16px;padding:24px;color:#e2e8f0}
.calc-top{display:flex;align-items:start;justify-content:space-between;gap:16px;margin-bottom:20px}
.eyebrow,.result-eyebrow{color:#93c5fd;font-size:.76rem;font-weight:800;letter-spacing:.075em}
.calc-top h2{font-size:1.6rem;line-height:1.2;letter-spacing:-.03em;margin:7px 0;color:#f8fafc}
.calc-top p{font-size:.95rem;color:#cbd5e1;line-height:1.65;max-width:680px;margin:5px 0}
.reset{background:#1e293b;border:1px solid #64748b;border-radius:9px;color:#f8fafc;min-height:42px;padding:7px 15px;cursor:pointer;font-weight:680}
.calc-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.93fr);gap:18px}
.calc-form{border:1px solid #334155;border-radius:12px;padding:19px;background:#0f172a}
.form-row{display:flex;flex-direction:column;gap:7px;margin-bottom:18px}
.form-row label{font-size:.9rem;font-weight:700;color:#f8fafc}
.form-row input,.form-row select{background:#17283e;color:#f8fafc;border:1px solid #64748b;border-radius:9px;padding:11px 12px;min-height:46px;width:100%}
.form-row input:focus-visible,.form-row select:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
.form-row .hint{margin:0;font-size:.82rem;line-height:1.55;color:#cbd5e1}
.two{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.source-note{background:#142539;border-radius:10px;border:1px solid #334155;padding:14px;color:#cbd5e1;font-size:.83rem;line-height:1.65}
.source-note strong{color:#f8fafc}
.calc-result{border:1px solid #256554;background:#0a3028;border-radius:12px;padding:22px;align-self:start}
.lots{font-size:clamp(2.4rem,5vw,3.75rem);font-weight:870;letter-spacing:-.065em;color:#d1fae5;line-height:1.13;margin:12px 0 5px;font-variant-numeric:tabular-nums}
.lots small{font-size:.3em;letter-spacing:0}
.result-caption{font-size:.84rem;line-height:1.5;color:#cbd5e1;margin:0 0 20px}
.numbers{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.numbers>div{background:#103d32;border:1px solid #2f6f5b;padding:12px;border-radius:9px;min-width:0}
.numbers span{display:block;font-size:.76rem;color:#cbd5e1;margin-bottom:5px}
.numbers strong{font-size:1.13rem;font-variant-numeric:tabular-nums;color:#f8fafc;overflow-wrap:anywhere}
.math-lines{border-top:1px solid #3c715f;padding-top:10px}
.math-lines p{font-size:.85rem;color:#cbd5e1;line-height:1.65;margin:9px 0}
.math-lines strong{color:#f8fafc}
.caution{font-size:.83rem;color:#e2e8f0;line-height:1.6;border-left:3px solid #93c5fd;padding:9px 12px;background:#153e34;margin:15px 0 0}
.issue{background:#fff7ed;color:#9a3412;border:1px solid #fdba74;border-radius:9px;padding:12px;font-size:.89rem;line-height:1.6}
@media(max-width:820px){.calc-layout{grid-template-columns:1fr}.calc-result{width:100%}}
@media(max-width:510px){.risk-calculator{padding:14px}.calc-form,.calc-result{padding:14px}.calc-top h2{font-size:1.35rem}.calc-top{gap:9px}.reset{padding:7px 10px}.two{grid-template-columns:1fr 1fr;gap:9px}.form-row label{font-size:.81rem}.form-row input{padding:9px}.numbers strong{font-size:1rem}}
</style>