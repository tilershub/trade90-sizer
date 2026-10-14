// Same-origin Cloudflare Pages proxy for the existing TRADE90 research backend.
// Keep the public brand/domain independent of the Render application's hostname.
const UPSTREAM = "https://trade90-platform.onrender.com/market-intelligence/data.json";
const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=30, s-maxage=60",
  "x-content-type-options": "nosniff",
};

function respond(status, data) {
  return new Response(JSON.stringify(data), {status, headers: HEADERS});
}

export async function onRequestGet() {
  try {
    const response = await fetch(UPSTREAM, {
      headers: {"accept": "application/json", "user-agent": "TRADE90-public-research/1.0"},
      signal: AbortSignal.timeout(12000),
      cf: {cacheEverything: true, cacheTtl: 60},
    });
    if (!response.ok) throw new Error("Upstream research unavailable");
    const data = await response.json();
    if (data?.status !== "ok" || !Array.isArray(data.markets) || data.markets.length < 1 ||
        !Number.isFinite(Date.parse(data.generated_at))) {
      throw new Error("Unexpected research schema");
    }
    return respond(200, data);
  } catch {
    return respond(503, {
      status: "unavailable",
      detail: "TRADE90's dated research briefing is temporarily unavailable. Check the original terminal.",
    });
  }
}
