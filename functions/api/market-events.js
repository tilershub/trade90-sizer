// Same-origin Cloudflare Pages proxy to TRADE90's link-only news evidence service.
// Never treats an indexed headline as a verified event or price movement.
const UPSTREAM = "https://trade90-platform.onrender.com/market-intelligence/events.json";
const HEADERS = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"public, max-age=60, s-maxage=120",
  "x-content-type-options":"nosniff",
};
function response(status, data) {return new Response(JSON.stringify(data),{status,headers:HEADERS})}
export async function onRequestGet() {
  try {
    const upstream = await fetch(UPSTREAM,{
      headers:{"accept":"application/json","user-agent":"TRADE90-public-evidence/1.0"},
      signal:AbortSignal.timeout(12000),
      cf:{cacheEverything:true,cacheTtl:120},
    });
    if(!upstream.ok)throw Error("Backend unavailable");
    const data=await upstream.json();
    if(!data || !Array.isArray(data.topics) || !Number.isFinite(Date.parse(data.checked_at))) {
      throw Error("Unexpected evidence schema");
    }
    return response(200,data);
  } catch {
    return response(503,{
      status:"unavailable",
      detail:"News discovery feed is currently unavailable. An outage does not mean no events are happening.",
      topics:[],
    });
  }
}
