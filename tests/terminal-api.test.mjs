import assert from "node:assert/strict";
import test from "node:test";

import { onRequestGet } from "../functions/api/terminal-snapshot.js";

const baseSnapshot = {
  schema_version: 1,
  generated_at: "2026-08-16T00:00:00.000Z",
  pairs: [{ symbol: "EUR/USD", price: 1.15 }],
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
