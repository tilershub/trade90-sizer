import assert from "node:assert/strict";
import {calculatePositionSize, instrumentSpecification, POSITION_SYMBOLS} from "../src/lib/trade90-position-size.js";
import {PAIR_SYMBOLS} from "../src/lib/trade90-rates.js";

const near=(actual,expected,msg)=>assert.ok(Math.abs(actual-expected)<0.000001,msg+": expected "+expected+", got "+actual);
assert.equal(POSITION_SYMBOLS.length,29);
assert.deepEqual(POSITION_SYMBOLS.filter(x=>x!=="XAUUSD").sort(),[...PAIR_SYMBOLS].sort());
assert.equal(instrumentSpecification("USDJPY").pipSize,.01);
assert.equal(instrumentSpecification("EURUSD").pipSize,.0001);
assert.equal(instrumentSpecification("XAUUSD").lotContract,100);
assert.equal(instrumentSpecification("BTCUSD"),null);

let r=calculatePositionSize({symbol:"EURUSD",balance:10000,riskPercent:1,stopDistance:50});
assert.ok(r.ok);
near(r.riskBudget,100,"One-percent budget");
near(r.usdPerDistanceUnitLot,10,"USD-quoted EUR/USD pip value");
near(r.riskPerLot,500,"EUR/USD 50-pip risk per lot");
near(r.lots,.20,"EUR/USD position size");
near(r.modeledRisk,100,"EUR/USD projected loss");

r=calculatePositionSize({symbol:"USDJPY",balance:10000,riskPercent:1,stopDistance:50,entryPrice:150});
assert.ok(r.ok);
near(r.usdPerDistanceUnitLot,1000/150,"USDJPY pip value converted to USD");
near(r.lots,.30,"USDJPY lot size at illustrative manually entered price");
near(r.modeledRisk,100,"USDJPY loss with 0.30 lots");

r=calculatePositionSize({symbol:"EURGBP",balance:10000,riskPercent:1,stopDistance:40,quoteToUsd:1.30});
assert.ok(r.ok);
near(r.usdPerDistanceUnitLot,13,"GBP quote pip value in USD");
near(r.lots,.19,"Manual GBP/USD quote conversion on cross");
near(r.modeledRisk,98.8,"EURGBP budget rounded down");

r=calculatePositionSize({symbol:"XAUUSD",balance:10000,riskPercent:1,stopDistance:5});
assert.ok(r.ok);
near(r.usdPerDistanceUnitLot,100,"Gold risk per $1/oz for 100-ounce lot");
near(r.riskPerLot,500,"Gold $5/oz stop");
near(r.lots,.20,"Gold lot size");

r=calculatePositionSize({symbol:"EURUSD",balance:10000,riskPercent:1,stopDistance:50,extraStopDistance:2,roundTripCommissionPerLot:7});
assert.ok(r.ok);
near(r.riskPerLot,527,"Commission and 2 extra stop pips");
near(r.lots,.18,"Commission buffer conservative rounding");
near(r.modeledRisk,94.86,"Actual modelled loss after rounding");
assert.ok(r.modeledRisk<=r.riskBudget);

r=calculatePositionSize({symbol:"EURUSD",balance:10,riskPercent:1,stopDistance:50});
assert.ok(r.ok&&r.belowMinimum);
near(r.lots,0,"Below 0.01 lot is never rounded up");
near(r.modeledRisk,0,"Do not claim nonzero risk for zero lots");

for (const input of [
{symbol:"EURUSD",balance:0,riskPercent:1,stopDistance:30},
{symbol:"EURUSD",balance:1000,riskPercent:0,stopDistance:30},
{symbol:"EURUSD",balance:1000,riskPercent:101,stopDistance:30},
{symbol:"EURUSD",balance:1000,riskPercent:1,stopDistance:0},
{symbol:"EURUSD",balance:1000,riskPercent:1,stopDistance:30,extraStopDistance:-1},
{symbol:"EURUSD",balance:1000,riskPercent:1,stopDistance:30,roundTripCommissionPerLot:-1},
{symbol:"USDJPY",balance:1000,riskPercent:1,stopDistance:30},
{symbol:"EURGBP",balance:1000,riskPercent:1,stopDistance:30},
{symbol:"XAUUSD",balance:NaN,riskPercent:1,stopDistance:5},
{symbol:"BTCUSD",balance:1000,riskPercent:1,stopDistance:30}
]) {
  const invalid=calculatePositionSize(input);
  assert.equal(invalid.ok,false,JSON.stringify(input));
  assert.equal(typeof invalid.error,"string");
}
for (const symbol of POSITION_SYMBOLS) {
  const spec=instrumentSpecification(symbol);
  const input={symbol,balance:10000,riskPercent:1.1,stopDistance:15,
    ...(spec.base==="USD"&&spec.quote!=="USD"?{entryPrice:150}:{}),
    ...(spec.quote!=="USD"&&spec.base!=="USD"?{quoteToUsd:1.3}:{})};
  const actual=calculatePositionSize(input);
  assert.ok(actual.ok,symbol+": "+actual.error);
  assert.ok(actual.modeledRisk<=actual.riskBudget+0.0000001,"Unrounded over-budget risk for "+symbol);
  assert.ok(Number.isFinite(actual.lots)&&actual.lots>=0,"Invalid lot value "+symbol);
}
console.log("Risk-first calculator: 28 FX pairs + XAUUSD validated; conservative volume rounding, manual currency conversion, execution costs and invalid inputs pass.");
