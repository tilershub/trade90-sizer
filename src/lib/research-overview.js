export const finite = (value) => typeof value === 'number' && Number.isFinite(value);
export function researchOverview(pair, generatedAt, previous, now = Date.now()) {
  const p = pair ?? {};
  const age = (date) => typeof date === 'string' ? (now - Date.parse(date)) / 60000 : NaN;
  const quoteAge = age(p.live?.updated_at);
  const modelAge = age(generatedAt);
  const quoteFresh = finite(p.live?.price) && p.live.price > 0 && Number.isFinite(quoteAge) && quoteAge >= -1 && quoteAge <= 15;
  const modelFresh = Number.isFinite(modelAge) && modelAge >= -1 && modelAge <= 720;
  const basisMismatch = p.symbol === 'XAU/USD' && !/spot/i.test(p.price_basis ?? '');
  const audit = (p.model?.audit ?? []).filter(x => finite(x.contribution));
  const bullish = audit.filter(x => x.contribution > 0).sort((a,b) => b.contribution-a.contribution).slice(0,3);
  const bearish = audit.filter(x => x.contribution < 0).sort((a,b) => a.contribution-b.contribution).slice(0,3);
  const validation = p.validation?.horizons?.find(x => x.Horizon === '5D');
  const lift = finite(validation?.['Model accuracy']) && finite(validation?.['Majority baseline']) ? validation['Model accuracy'] - validation['Majority baseline'] : null;
  const gaps = [];
  if (!quoteFresh) gaps.push('Current quote is missing or older than 15 minutes. Check the provider timestamp before using it.');
  if (!modelFresh) gaps.push('Research is missing a valid update time or is older than 12 hours. Its outlook may have changed.');
  if (basisMismatch) gaps.push('Gold research uses a different price basis from the spot quote. Historical levels are research references, not spot entry or stop levels.');
  if (!validation || lift === null) gaps.push('Comparable five-day model and baseline results are unavailable. A predictive advantage has not been established here.');
  else if (lift <= 0) gaps.push('The five-day model did not outperform its majority baseline in the reported test. Its probabilities alone do not establish a trading advantage.');
  if (!finite(p.sample_size) || p.sample_size < 30) gaps.push('The scenario sample is small or unavailable; historical frequencies may be unstable.');
  if (p.quality?.stale_inputs?.length) gaps.push(`Excluded stale inputs: ${p.quality.stale_inputs.join(', ')}.`);
  if (!p.events?.upcoming?.length) gaps.push('No upcoming events were supplied. This does not establish that the calendar is clear.');
  const changes = [];
  if (previous?.symbol === p.symbol) {
    if (finite(p.score) && finite(previous.score)) changes.push(`Evidence score changed by ${(p.score - previous.score).toFixed(1)} points.`);
    if (p.market?.regime && previous.market?.regime && p.market.regime !== previous.market.regime) changes.push(`Volatility regime changed from ${previous.market.regime} to ${p.market.regime}.`);
    if (p.bias && previous.bias && p.bias !== previous.bias) changes.push(`Leading historical scenario changed from ${previous.bias} to ${p.bias}.`);
  }
  return { quoteFresh, modelFresh, basisMismatch, bullish, bearish, lift, validation, gaps, changes,
    condition: !modelFresh ? 'Research needs refreshing' : bullish.length && bearish.length ? 'Evidence is mixed' : bullish.length ? 'Evidence leans bullish' : bearish.length ? 'Evidence leans bearish' : 'Insufficient contribution data' };
}
