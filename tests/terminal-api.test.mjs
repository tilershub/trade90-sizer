import assert from "node:assert/strict";
import test from "node:test";

import { onRequestGet } from "../functions/api/terminal-snapshot.js";

const baseSnapshot = {
  schema_version: 1,
  generated_at: "2026-08-16T00:00:00.000Z",
  pairs: [{ symbol: "EUR/USD", price: 1.15 }, { symbol: "XAU/USD", price: 4600 }],
};

const chartPayload = {
  chart: {
    result: [
      {
        meta: {
          regularMarketPrice: 1.16,
          chartPreviousClose: 1.15,
          regularMarketTime: 1786838400,
          regularMarketDayHigh: 1.17,
          regularMarketDayLow: 1.14,
          exchangeTimezoneName: "Europe/London",
        },
        timestamp: [1786838100, 1786838400],
        indicators: { quote: [{ close: [1.155, 1.16] }] },
      },
    ],
  },
};

test("terminal endpoint merges live quotes into the model snapshot", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("terminal-snapshot.json")) {
      return new Response(JSON.stringify(baseSnapshot), { status: 200 });
    }
    assert.ok(!decodeURIComponent(String(url)).includes('GC=F'));
    if (String(url).includes('api.gold-api.com')) {
      return Response.json({ symbol: 'XAU', currency: 'USD', price: 4371.1, updatedAt: new Date().toISOString() });
    }
    return new Response(JSON.stringify(chartPayload), { status: 200 });
  };

  try {
    const response = await onRequestGet();
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.live_quote_count, 9);
    assert.equal(payload.pairs[0].live.price, 1.16);
    assert.equal(payload.pairs[0].live.intraday.length, 2);
    assert.equal(payload.pairs[1].live.price, 4371.1);
    assert.equal(payload.pairs[1].live.provider, 'Gold API');
    assert.equal(payload.pairs[1].live.change_pct, null);
    assert.deepEqual(payload.pairs[1].live.intraday, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("terminal endpoint fails honestly when the model snapshot is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });

  try {
    const response = await onRequestGet();
    const payload = await response.json();
    assert.equal(response.status, 502);
    assert.equal(payload.ok, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

for (const [name, overrides] of [
  ['stale', { updatedAt: new Date(Date.now() - 3600_000).toISOString() }],
  ['future', { updatedAt: new Date(Date.now() + 3600_000).toISOString() }],
  ['null price', { price: null }],
  ['zero price', { price: 0 }],
  ['wrong currency', { currency: 'EUR' }],
  ['wrong symbol', { symbol: 'GC=F' }],
  ['missing time', { updatedAt: null }],
  ['provider outage', null],
]) {
  test(`gold ${name} does not fall back to futures or break FX quotes`, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      assert.ok(!decodeURIComponent(String(url)).includes('GC=F'));
      if (String(url).includes('terminal-snapshot.json')) return Response.json(baseSnapshot);
      if (String(url).includes('api.gold-api.com')) {
        if (!overrides) return new Response('Unavailable', { status: 503 });
        return Response.json({ symbol: 'XAU', currency: 'USD', price: 4371.1, updatedAt: new Date().toISOString(), ...overrides });
      }
      return Response.json(chartPayload);
    };
    try {
      const payload = await (await onRequestGet()).json();
      assert.equal(payload.pairs[1].live, null);
      assert.equal(payload.pairs[1].price, 4600); // Research series retained separately.
      assert.equal(payload.pairs[0].live.price, 1.16);
      assert.equal(payload.live_quote_count, 8);
    } finally { globalThis.fetch = originalFetch; }
  });
}
