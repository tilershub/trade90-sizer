export const finite = value => typeof value === 'number' && Number.isFinite(value);

export function safeSource(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

export function contextFresh(context, now = Date.now()) {
  const age = now - Date.parse(context?.generated_at);
  return Number.isFinite(age) && age >= -60000 && age <= 8 * 3600000;
}

export function marketCurrencies(symbol) {
  if (typeof symbol !== 'string') return [];
  const [base, quote] = symbol.split('/');
  return [base, quote].filter(Boolean);
}

export function relevantIndicators(context, symbol) {
  const countries = symbol === 'USD/JPY' ? ['US','JP','Global'] : ['US','Global'];
  return (context?.indicators ?? []).filter(row => countries.includes(row.country));
}

export function technicalConditions(pair) {
  const rows = (pair?.history ?? []).filter(row => finite(row.close) && row.close > 0);
  const empty = {trend:'Unavailable', volatility:null, volatilityRank:null, averageMove:null, low:null, high:null, change20:null, date:null, observations:rows.length};
  if (rows.length < 21) return empty;
  const last = rows.at(-1), tail = rows.slice(-20);
  const returns = rows.slice(1).map((row,i) => row.close / rows[i].close - 1);
  const sd = arr => {
    if (arr.length < 2) return 0;
    const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
    return Math.sqrt(arr.reduce((a,b)=>a+(b-mean)**2,0)/(arr.length-1));
  };
  const recent = sd(returns.slice(-20));
  const windows = returns.slice(19).map((_,i)=>sd(returns.slice(i,i+20)));
  const annualization = pair?.symbol === 'BTC/USD' ? 365 : 252;
  return {
    trend:finite(last.ema_fast)&&finite(last.ema_slow)
      ? (last.ema_fast>last.ema_slow?'EMA 20 above EMA 50':last.ema_fast<last.ema_slow?'EMA 20 below EMA 50':'Moving averages equal')
      : 'Moving averages unavailable',
    volatility:recent*Math.sqrt(annualization),
    volatilityRank:windows.length ? windows.filter(x=>x<=recent).length/windows.length : null,
    annualization,
    rankWindows:windows.length,
    averageMove:rows.slice(-20).reduce((sum,row,i)=>sum+Math.abs(row.close-rows[rows.length-21+i].close),0)/20,
    low:Math.min(...tail.map(x=>x.close)),
    high:Math.max(...tail.map(x=>x.close)),
    change20:last.close/rows.at(-21).close-1,
    date:last.date,
    observations:rows.length
  };
}

export function evidenceNotes(context, symbol, now=Date.now()) {
  if (!contextFresh(context,now)) return ['Macro context is unavailable or beyond its refresh window. Check source dates before drawing conclusions.'];
  const rows = relevantIndicators(context,symbol).filter(x=>x.status==='available'&&finite(x.value));
  const notes=[];
  if (symbol==='USD/JPY') {
    const spread=context.comparisons?.find(x=>x.id==='USJP10Y'&&x.status==='available');
    if (spread&&finite(spread.value)) notes.push(`The aligned monthly US–Japan 10-year yield spread is ${spread.value.toFixed(2)} percentage points${finite(spread.change)?`, ${spread.change>0?'wider':spread.change<0?'narrower':'unchanged'} versus the preceding observation`:''}. This is historical context, not today's policy-rate gap.`);
  }
  for (const id of ['DFII10','VIXCLS','DCOILWTICO']) {
    const row=rows.find(x=>x.id===id);
    if (row&&finite(row.change)) notes.push(`${row.label}: ${row.change>0?'increased':row.change<0?'decreased':'unchanged'} versus the previous observation (${row.observed_at?.slice(0,10)}).`);
  }
  return notes.length?notes:['No sufficiently current comparable indicators are available.'];
}

function eventTime(event) {
  const value = Date.parse(event?.time);
  return Number.isFinite(value) ? value : null;
}

export function nextCatalyst(context, symbol, now = Date.now()) {
  const currencies = marketCurrencies(symbol);
  const relevant = (context?.events ?? [])
    .filter(event => currencies.includes(event?.currency) && eventTime(event) !== null)
    .sort((a,b) => eventTime(a) - eventTime(b));

  const upcoming = relevant.find(event => eventTime(event) >= now - 60000);
  if (upcoming) {
    return {
      status: 'upcoming',
      event: upcoming,
      time: eventTime(upcoming),
      msUntil: Math.max(0, eventTime(upcoming) - now),
    };
  }

  const released = [...relevant].reverse().find(event => {
    const time = eventTime(event);
    return time !== null && now - time <= 12 * 3600000;
  });
  if (released) {
    const actual = Number(released.actual);
    const forecast = Number(released.forecast);
    return {
      status: 'released',
      event: released,
      time: eventTime(released),
      surprise: finite(actual) && finite(forecast) ? actual - forecast : null,
    };
  }

  return {
    status: 'unavailable',
    event: null,
    calendarStatus: context?.calendar_status ?? 'Unavailable',
    note: context?.calendar_note ?? 'No verified event calendar is connected for this market.',
  };
}

function volatilityLabel(rank) {
  if (!finite(rank)) return 'Unavailable';
  if (rank >= 0.75) return 'High vs supplied history';
  if (rank <= 0.25) return 'Low vs supplied history';
  return 'Mid-range vs supplied history';
}

function positioningSummary(context, symbol) {
  const currencies = marketCurrencies(symbol);
  const rows = (context?.positioning ?? [])
    .filter(item => currencies.includes(item?.currency) && item?.available)
    .sort((a,b) => Date.parse(b?.date) - Date.parse(a?.date));
  if (!rows.length) return { label:'Unavailable', detail:'No relevant CFTC positioning record is supplied.' };

  const crowded = rows.find(item => item.crowding && item.crowding !== 'Balanced');
  const item = crowded ?? rows[0];
  const detail = item.crowding && item.crowding !== 'Balanced'
    ? `${item.currency} futures: ${item.crowding}. Treat futures positioning as context, not a spot-FX signal.`
    : `${item.currency} futures positioning is labelled ${item.crowding ?? 'available'} in the latest supplied report.`;
  return { label:item.crowding ?? 'Available', detail, date:item.date, stale:Boolean(item.stale) };
}

export function marketResearchBrief(context, pair, now = Date.now()) {
  const technical = technicalConditions(pair);
  const fresh = contextFresh(context, now);
  const indicators = relevantIndicators(context, pair?.symbol);
  const available = indicators.filter(row => row?.status === 'available' && finite(row?.value));
  const catalyst = nextCatalyst(context, pair?.symbol, now);
  const positioning = positioningSummary(context, pair?.symbol);

  let macro = 'US and global macro context only.';
  if (pair?.symbol === 'USD/JPY') {
    const spread = context?.comparisons?.find(item => item?.id === 'USJP10Y' && item?.status === 'available' && finite(item?.value));
    macro = spread
      ? `US–Japan 10Y spread: ${spread.value.toFixed(2)} pp${finite(spread.change) ? ` (${spread.change >= 0 ? '+' : ''}${spread.change.toFixed(2)} pp vs prior comparable observation)` : ''}.`
      : 'US–Japan comparison is connected, but the aligned 10Y spread is unavailable.';
  } else if (pair?.symbol === 'XAU/USD') {
    macro = 'Gold context currently uses US real-yield, dollar and global-risk observations; spot-flow coverage remains limited.';
  } else if (pair?.symbol === 'BTC/USD') {
    macro = 'Bitcoin context currently uses US/global liquidity and risk conditions; exchange funding and liquidation feeds are not connected.';
  }

  const supporting = [];
  const conflicts = [];
  const missing = [];

  const trendUp = technical.trend === 'EMA 20 above EMA 50';
  const trendDown = technical.trend === 'EMA 20 below EMA 50';
  if (finite(technical.change20) && (trendUp || trendDown)) {
    const aligned = (trendUp && technical.change20 > 0) || (trendDown && technical.change20 < 0);
    const statement = `20-session return is ${technical.change20 >= 0 ? 'positive' : 'negative'} while ${technical.trend.toLowerCase()}.`;
    (aligned ? supporting : conflicts).push(statement);
  }

  const liveChange = pair?.live?.change_pct;
  if (finite(liveChange) && (trendUp || trendDown) && liveChange !== 0) {
    const aligned = (trendUp && liveChange > 0) || (trendDown && liveChange < 0);
    const statement = `Current-session change is ${liveChange > 0 ? 'positive' : 'negative'} relative to the longer moving-average structure.`;
    (aligned ? supporting : conflicts).push(statement);
  }

  if (finite(technical.volatilityRank) && technical.volatilityRank >= 0.75) {
    conflicts.push(`Volatility is in the upper quartile of the supplied rolling history (${Math.round(technical.volatilityRank * 100)}th percentile), increasing uncertainty around simple trend readings.`);
  }

  if (positioning.label !== 'Unavailable' && positioning.label !== 'Balanced') {
    conflicts.push(positioning.detail);
  }

  if (!fresh) missing.push('Macro context is outside the eight-hour terminal refresh window.');
  if (!available.length) missing.push('No current macro indicators are available for this market in the connected context.');
  if (pair?.symbol !== 'USD/JPY' && !['XAU/USD','BTC/USD'].includes(pair?.symbol)) {
    missing.push('Full second-economy macro coverage is not yet connected for this FX pair.');
  }
  if (catalyst.status === 'unavailable') missing.push('No verified upcoming calendar event is available in the current feed.');
  if (!context?.policy_expectations || !Object.keys(context.policy_expectations).length) {
    missing.push('Market-implied policy expectations are not currently populated in this snapshot.');
  }

  if (!supporting.length) supporting.push('No additional independent observation clearly aligns with the current price structure.');
  if (!conflicts.length) conflicts.push('No direct contradiction was detected from the limited evidence used in this brief.');

  return {
    technical,
    structure: technical.trend,
    change20: technical.change20,
    volatility: technical.volatility,
    volatilityRank: technical.volatilityRank,
    volatilityLabel: volatilityLabel(technical.volatilityRank),
    macro,
    catalyst,
    positioning,
    quality: {
      fresh,
      available: available.length,
      total: indicators.length,
      generatedAt: context?.generated_at ?? null,
    },
    supporting: supporting.slice(0,3),
    conflicts: conflicts.slice(0,3),
    missing: missing.slice(0,4),
  };
}

function latestRelevantCommunication(context, symbol) {
  const currencies = marketCurrencies(symbol);
  return (context?.communications ?? [])
    .filter(item => currencies.includes(item?.currency) && Number.isFinite(Date.parse(item?.published_at)))
    .sort((a,b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0] ?? null;
}

export function researchContextChanges(previous, current, symbol, now = Date.now()) {
  if (!previous || !current) return [];
  const changes = [];
  const currentRows = relevantIndicators(current, symbol);
  const previousRows = relevantIndicators(previous, symbol);
  const previousById = new Map(previousRows.map(row => [row?.id, row]));

  for (const row of currentRows) {
    const before = previousById.get(row?.id);
    if (!before || !row?.id) continue;
    const currentObserved = Date.parse(row?.observed_at);
    const previousObserved = Date.parse(before?.observed_at);
    if (Number.isFinite(currentObserved) && Number.isFinite(previousObserved) && currentObserved > previousObserved) {
      changes.push(`New ${row.label ?? row.id} observation (${String(row.observed_at).slice(0,10)}).`);
      if (changes.length >= 2) break;
    }
  }

  const currencies = marketCurrencies(symbol);
  for (const item of (current?.positioning ?? []).filter(row => currencies.includes(row?.currency) && row?.available)) {
    const before = (previous?.positioning ?? []).find(row => row?.currency === item.currency && row?.available);
    if (before && Number.isFinite(Date.parse(item?.date)) && Date.parse(item.date) > Date.parse(before?.date)) {
      changes.push(`New CFTC ${item.currency} positioning report; current crowding label: ${item.crowding ?? 'not classified'}.`);
      break;
    }
  }

  const currentCommunication = latestRelevantCommunication(current, symbol);
  const previousCommunication = latestRelevantCommunication(previous, symbol);
  if (
    currentCommunication &&
    Number.isFinite(Date.parse(currentCommunication.published_at)) &&
    (!previousCommunication || Date.parse(currentCommunication.published_at) > Date.parse(previousCommunication.published_at))
  ) {
    changes.push(`New ${currentCommunication.source ?? 'official'} communication: ${currentCommunication.headline ?? 'new document'}.`);
  }

  const currentCatalyst = nextCatalyst(current, symbol, now);
  const previousCatalyst = nextCatalyst(previous, symbol, now);
  if (
    currentCatalyst.status === 'upcoming' &&
    (previousCatalyst.status !== 'upcoming' ||
      currentCatalyst.event?.event !== previousCatalyst.event?.event ||
      currentCatalyst.event?.time !== previousCatalyst.event?.time)
  ) {
    changes.push(`Calendar update: ${currentCatalyst.event?.currency ?? ''} ${currentCatalyst.event?.event ?? 'event'} added or changed.`.trim());
  }

  const previousFresh = contextFresh(previous, now);
  const currentIsFresh = contextFresh(current, now);
  if (previousFresh !== currentIsFresh) {
    changes.push(currentIsFresh ? 'Macro research context is fresh again.' : 'Macro research context moved outside the refresh window.');
  }

  return changes.slice(0,4);
}
