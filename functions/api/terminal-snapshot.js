const SNAPSHOT_SOURCE =
  "https://raw.githubusercontent.com/tilershub/usdjpy-research-lab/main/public/terminal-snapshot.json";

const LIVE_TICKERS = {
  "EUR/USD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",
  "USD/JPY": "JPY=X",
  "USD/CHF": "CHF=X",
  "USD/CAD": "CAD=X",
  "AUD/USD": "AUDUSD=X",
  "NZD/USD": "NZDUSD=X",
  "BTC/USD": "BTC-USD",
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  "x-content-type-options": "nosniff",
};

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function fetchJson(url, cacheTtl) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "TRADE90-terminal/2.0",
    },
    cf: { cacheEverything: true, cacheTtl },
  });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}

function downsample(points, maximum = 96) {
  if (points.length <= maximum) return points;
  const step = Math.ceil(points.length / maximum);
  const sampled = points.filter((_, index) => index % step === 0);
  const last = points.at(-1);
  if (last && sampled.at(-1)?.time !== last.time) sampled.push(last);
  return sampled;
}

function normalizeQuote(symbol, payload) {
  const result = payload?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta) return null;

  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const intraday = [];
  for (let index = 0; index < Math.min(timestamps.length, closes.length); index += 1) {
    const close = Number(closes[index]);
    if (Number.isFinite(close)) {
      intraday.push({ time: new Date(timestamps[index] * 1000).toISOString(), close });
    }
  }

  const latestFromSeries = intraday.at(-1)?.close;
  const price = Number(meta.regularMarketPrice ?? latestFromSeries);
  if (!Number.isFinite(price)) return null;
  const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose);
  const change = Number.isFinite(previousClose) ? price - previousClose : null;
  const changePct = Number.isFinite(previousClose) && previousClose !== 0 ? change / previousClose : null;
  const updatedAt = Number(meta.regularMarketTime)
    ? new Date(meta.regularMarketTime * 1000).toISOString()
    : intraday.at(-1)?.time ?? null;

  return {
    symbol,
    price,
    previous_close: Number.isFinite(previousClose) ? previousClose : null,
    change,
    change_pct: changePct,
    day_high: Number.isFinite(Number(meta.regularMarketDayHigh)) ? Number(meta.regularMarketDayHigh) : null,
    day_low: Number.isFinite(Number(meta.regularMarketDayLow)) ? Number(meta.regularMarketDayLow) : null,
    updated_at: updatedAt,
    timezone: meta.exchangeTimezoneName ?? null,
    provider: "Yahoo Finance",
    interval: "5m",
    intraday: downsample(intraday),
  };
}

async function loadQuote(symbol, ticker) {
  const encodedTicker = encodeURIComponent(ticker);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodedTicker}?range=1d&interval=5m&includePrePost=false`;
  const payload = await fetchJson(url, 300);
  return normalizeQuote(symbol, payload);
}


async function loadGoldQuote() {
  // GC=F is a futures contract, not XAU/USD. Never use it as a spot fallback.
  const payload = await fetchJson("https://api.gold-api.com/price/XAU/USD", 30);
  const price = payload?.price;
  const timestamp = typeof payload?.updatedAt === "string" ? Date.parse(payload.updatedAt) : NaN;
  const age = Date.now() - timestamp;
  if (payload?.symbol !== "XAU" || payload?.currency !== "USD" ||
      typeof price !== "number" || !Number.isFinite(price) || price <= 0 ||
      !Number.isFinite(timestamp) || age > 15 * 60_000 || age < -60_000) return null;
  return {
    symbol: "XAU/USD", price, updated_at: new Date(timestamp).toISOString(),
    provider: "Gold API", instrument_type: "spot", currency: "USD",
    unit: "troy ounce", previous_close: null, change: null, change_pct: null,
    day_high: null, day_low: null, interval: null, intraday: [],
  };
}

export async function onRequestGet() {
  let snapshot;
  try {
    snapshot = await fetchJson(SNAPSHOT_SOURCE, 60);
  } catch (error) {
    return jsonResponse(502, {
      ok: false,
      error: "The research snapshot is temporarily unavailable.",
      detail: error instanceof Error ? error.message : "Unknown upstream error",
    });
  }

  if (snapshot?.schema_version !== 1 || !Array.isArray(snapshot?.pairs)) {
    return jsonResponse(502, { ok: false, error: "The research snapshot format is invalid." });
  }

  const results = await Promise.allSettled(
    [...Object.entries(LIVE_TICKERS).map(([symbol, ticker]) => loadQuote(symbol, ticker)), loadGoldQuote()]
  );
  const quotes = new Map();
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) quotes.set(result.value.symbol, result.value);
  }

  const pairs = snapshot.pairs.map((pair) => ({
    ...pair,
    live: quotes.get(pair.symbol) ?? null,
  }));

  return jsonResponse(200, {
    ...snapshot,
    ok: true,
    served_at: new Date().toISOString(),
    live_quote_count: quotes.size,
    live_quote_cadence: "Indicative quotes refresh every five minutes when the upstream market is available",
    pairs,
  });
}
