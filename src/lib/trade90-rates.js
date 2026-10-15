export const PAIR_SYMBOLS = [
  "EURUSD", "USDJPY", "GBPUSD", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD",
  "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURNZD", "EURCAD",
  "GBPJPY", "GBPCHF", "GBPAUD", "GBPNZD", "GBPCAD",
  "AUDJPY", "AUDCHF", "AUDNZD", "AUDCAD",
  "NZDJPY", "NZDCHF", "NZDCAD",
  "CADJPY", "CADCHF", "CHFJPY"
];
export function getPairs(banks) {
  if (!Array.isArray(banks) || banks.length !== 8) throw new Error("Expected eight central banks.");
  const byCode = Object.fromEntries(banks.map(bank => [bank.code, bank]));
  if (Object.keys(byCode).length !== 8) throw new Error("Duplicate central bank currency.");
  const pairs = PAIR_SYMBOLS.map(symbol => {
    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3);
    if (!byCode[base] || !byCode[quote]) throw new Error("Rate unavailable: " + symbol);
    const baseRate = byCode[base].rate, quoteRate = byCode[quote].rate;
    if (!Number.isFinite(baseRate) || !Number.isFinite(quoteRate)) throw new Error("Invalid rate: " + symbol);
    const signedBp = Math.round((baseRate - quoteRate) * 100000) / 1000;
    return {
      symbol, label: base + "/" + quote, base, quote, baseRate, quoteRate,
      signedBp, absBp: Math.abs(signedBp),
      higher: signedBp === 0 ? "Equal" : (signedBp > 0 ? base : quote),
      baseBank: byCode[base], quoteBank: byCode[quote]
    };
  }).sort((a,b) => b.absBp - a.absBp || a.symbol.localeCompare(b.symbol));
  if (pairs.length !== 28 || new Set(pairs.map(p=>[p.base,p.quote].sort().join("-"))).size !== 28) {
    throw new Error("Invalid 28-pair currency coverage.");
  }
  return pairs;
}
export const formatBp = value => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
