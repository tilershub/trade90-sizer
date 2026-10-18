// USD-account position size arithmetic. This calculator does NOT retrieve
// broker contract specifications, exchange rates, slippage or live prices.
import { PAIR_SYMBOLS } from "./trade90-rates.js";

export const POSITION_SYMBOLS = [...PAIR_SYMBOLS, "XAUUSD"];
export const CONTRACT_FX_UNITS = 100000; // Conventional FX standard lot
export const CONTRACT_GOLD_OZ = 100;     // Common XAU/USD lot; broker-dependent
export const DEFAULT_LOT_STEP = 0.01;

const finitePositive = n => typeof n === "number" && Number.isFinite(n) && n > 0;
const nonnegative = n => typeof n === "number" && Number.isFinite(n) && n >= 0;

export function instrumentSpecification(symbol) {
  if (symbol === "XAUUSD") return {
    symbol, base:"XAU", quote:"USD", kind:"gold",
    pipSize:null, lotContract:CONTRACT_GOLD_OZ,
    stopUnit:"USD per ounce", priceExample:"e.g. 12.50"
  };
  if (!PAIR_SYMBOLS.includes(symbol)) return null;
  const base = symbol.slice(0,3), quote = symbol.slice(3);
  return {
    symbol, base, quote, kind:"forex",
    pipSize:quote==="JPY" ? 0.01 : 0.0001,
    lotContract:CONTRACT_FX_UNITS,
    stopUnit:"pips",priceExample:"e.g. 35"
  };
}

export function calculatePositionSize({
  symbol="EURUSD",
  balance,
  riskPercent,
  stopDistance,
  entryPrice=null,
  quoteToUsd=null,
  extraStopDistance=0,
  roundTripCommissionPerLot=0,
  lotStep=DEFAULT_LOT_STEP
}={}) {
  const specification=instrumentSpecification(symbol);
  if(!specification) return {ok:false,error:"Choose one of the supported FX pairs or XAU/USD."};
  if(!finitePositive(balance)) return {ok:false,error:"Enter a valid positive account balance in USD."};
  if(!finitePositive(riskPercent) || riskPercent>100) return {ok:false,error:"Risk must be greater than 0% and no more than 100%."};
  if(!finitePositive(stopDistance)) return {ok:false,error:"Stop distance must be greater than zero."};
  if(!nonnegative(extraStopDistance)) return {ok:false,error:"The extra stop buffer cannot be negative."};
  if(!nonnegative(roundTripCommissionPerLot)) return {ok:false,error:"Commission cannot be negative."};
  if(!finitePositive(lotStep) || lotStep>1) return {ok:false,error:"The broker lot step must be between 0 and 1 lot."};

  let conversion=1, conversionBasis="USD is the quote currency.";
  if(specification.kind==="forex" && specification.quote!=="USD"){
    if(specification.base==="USD"){
      if(!finitePositive(entryPrice))return {ok:false,error:"Enter the current USD/"+specification.quote+" price to convert pip value into USD."};
      conversion=1/entryPrice;
      conversionBasis="Indicative 1 ÷ USD/"+specification.quote+" entry price (manually entered).";
    }else{
      if(!finitePositive(quoteToUsd))return {ok:false,error:"Enter the USD value of one "+specification.quote+" (manual quote-to-USD conversion)."};
      conversion=quoteToUsd;
      conversionBasis="Manually entered 1 "+specification.quote+" = "+quoteToUsd+" USD.";
    }
  }
  // For FX, one pip is 0.0001 quote currency except JPY pairs (0.01).
  // For XAU/USD, distance means USD move per troy ounce, NOT broker-defined "pips".
  const usdPerDistanceUnitLot=specification.kind==="gold"
    ?specification.lotContract
    :specification.lotContract*specification.pipSize*conversion;
  const riskBudget=balance*riskPercent/100;
  const adjustedDistance=stopDistance+extraStopDistance;
  const riskPerLot=adjustedDistance*usdPerDistanceUnitLot+roundTripCommissionPerLot;
  if(!finitePositive(riskPerLot))return {ok:false,error:"Unable to calculate the amount at risk for the selected instrument."};
  const unroundedLots=riskBudget/riskPerLot;
  if(!Number.isFinite(unroundedLots)||unroundedLots>100000)return {ok:false,error:"This result exceeds supported sizing limits. Check the inputs."};
  // Round DOWN to avoid a recommendation above the chosen cash-risk budget.
  const lots=Math.floor((unroundedLots+1e-10)/lotStep)*lotStep;
  const validLots=Number(lots.toFixed(8));
  const modeledRisk=validLots*riskPerLot;
  return {
    ok:true,
    symbol, specification, conversion, conversionBasis,
    balance,riskPercent,riskBudget,stopDistance,extraStopDistance,
    adjustedDistance,usdPerDistanceUnitLot,riskPerLot,
    roundTripCommissionPerLot,lotStep,
    rawLots:unroundedLots,lots:validLots,
    exposure:validLots*specification.lotContract,
    modeledRisk,modeledRiskPercent:modeledRisk/balance*100,
    remainingBudget:Math.max(0,riskBudget-modeledRisk),
    belowMinimum:validLots===0,
    caveat:"Modeled loss at the stop only. Gaps, execution slippage beyond the buffer, spread, funding and broker contract differences can increase actual losses."
  };
}
