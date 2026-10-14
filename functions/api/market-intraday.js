// Cloudflare Pages same-origin proxy: all market calculations and API credentials
// remain on the Render backend. The vendor feed is disabled until licensed.
const UPSTREAM = "https://trade90-platform.onrender.com/market-intelligence/intraday.json";
const SYMBOLS = new Set(["XAU/USD","EUR/USD","GBP/USD","USD/JPY","USD/CHF",
  "USD/CAD","AUD/USD","NZD/USD","BTC/USD"]);
const INTERVALS = new Set(["15min","1h"]);
const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function respond(status, payload) {
  return new Response(JSON.stringify(payload), {status, headers: HEADERS});
}

export async function onRequestGet({request}) {
  const query = new URL(request.url).searchParams;
  const symbol = (query.get("symbol") || "").trim().toUpperCase();
  const interval = (query.get("interval") || "15min").trim();
  if (!SYMBOLS.has(symbol) || !INTERVALS.has(interval)) {
    return respond(400, {status:"invalid", detail:"Unsupported market or timeframe"});
  }
  const url = new URL(UPSTREAM);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);
  try {
    const response = await fetch(url.toString(), {
      headers: {"accept":"application/json", "user-agent":"TRADE90-public-intraday/1.0"},
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json();
    if (!data || !["current","stale","not_configured","unavailable","invalid","pending"].includes(data.status)) {
      throw new Error("Unrecognized provider status");
    }
    if (data.status === "current" || data.status === "stale") {
      // Never forward a valid-looking market result for another symbol/timeframe.
      if (data.symbol !== symbol || data.interval !== interval) throw new Error("Market mismatch");
      if (!Number.isFinite(Date.parse(data.observed_at))) throw new Error("Missing timestamp");
    }
    return respond(response.ok ? 200 : 503, data);
  } catch {
    return respond(503, {
      status:"unavailable",
      detail:"Intraday research is temporarily unavailable. Published research remains separate.",
    });
  }
}
