/**
 * Post new TRADE90 feed items to X and a Facebook Page.
 * - Reads the LIVE feed, so only pages that are already deployed are shared.
 * - A channel is active only when all of its secrets are present.
 * - First run records existing items without posting (no backlog flood).
 * - At most MAX_PER_RUN items per run; state is committed by the workflow.
 * Secrets are read from the environment and never printed.
 */
import crypto from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const FEED_URL = "https://tradeninety.com/rss.xml";
export const STATE_PATH = "scripts/state/social-posted.json";
export const MAX_PER_RUN = 2;
const ORIGIN = "https://tradeninety.com/";
const unesc = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

export function parseFeed(xml) {
  if (!/<rss[\s>]/.test(xml) || !xml.includes("</channel>")) throw new Error("Not a complete RSS feed");
  const tag = (item, name) => { const m = item.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">")); return m ? unesc(m[1].trim()) : ""; };
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]).map(item => ({
    title: tag(item, "title"), link: tag(item, "link"), description: tag(item, "description"), category: tag(item, "category"), date: Date.parse(tag(item, "pubDate"))
  })).filter(i => i.title && i.link.startsWith(ORIGIN) && Number.isFinite(i.date));
}

const clip = (text, max) => text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
const TAGS = { "Weekly digest": "#forex #centralbanks", "Rate decision": "#forex #interestrates", "Guide": "#forex #trading" };
// X counts every URL as 23 characters. Keep the whole post within 280.
export function composeX(item) {
  const tags = TAGS[item.category] || "#forex";
  const budget = 280 - 23 - tags.length - 4; // two blank-line separators
  const head = clip(item.title, Math.min(budget, 140));
  const room = budget - head.length - 2;
  const body = room >= 40 && item.description ? "\n\n" + clip(item.description, room) : "";
  return head + body + "\n\n" + item.link + "\n" + tags;
}
export const xLength = text => text.replace(/https?:\/\/\S+/g, "x".repeat(23)).length;
export function composeFacebook(item) {
  return { message: item.title + "\n\n" + clip(item.description || "", 600) + "\n\nEducational research, not trading advice.", link: item.link };
}

const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
// OAuth 1.0a (HMAC-SHA1). For a JSON body only OAuth and query parameters are signed.
export function oauthHeader({ method, url, params = {}, consumerKey, consumerSecret, token, tokenSecret, nonce = crypto.randomBytes(16).toString("hex"), timestamp = Math.floor(Date.now() / 1000) }) {
  const u = new URL(url);
  const oauth = { oauth_consumer_key: consumerKey, oauth_nonce: nonce, oauth_signature_method: "HMAC-SHA1", oauth_timestamp: String(timestamp), oauth_token: token, oauth_version: "1.0" };
  const all = { ...Object.fromEntries(u.searchParams), ...params, ...oauth };
  const normalized = Object.keys(all).map(k => [enc(k), enc(all[k])]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1).map(p => p.join("=")).join("&");
  const base = [method.toUpperCase(), enc(u.origin + u.pathname), enc(normalized)].join("&");
  const signature = crypto.createHmac("sha1", enc(consumerSecret) + "&" + enc(tokenSecret)).update(base).digest("base64");
  return { signature, header: "OAuth " + Object.entries({ ...oauth, oauth_signature: signature }).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => enc(k) + '="' + enc(v) + '"').join(", ") };
}

export function channelsFromEnv(env) {
  const has = keys => keys.every(k => typeof env[k] === "string" && env[k].trim());
  return { x: has(["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"]), facebook: has(["FB_PAGE_ID", "FB_PAGE_TOKEN"]) };
}

// Decide what to do without touching the network. Oldest unposted items go first.
export function plan(items, state, channels, max = MAX_PER_RUN) {
  const posted = state?.posted || {};
  if (!state?.seededAt) return { seed: items.map(i => i.link), jobs: [] };
  const jobs = [];
  for (const channel of Object.keys(channels).filter(c => channels[c])) {
    const pending = items.filter(i => !posted[i.link]?.[channel]).sort((a, b) => a.date - b.date).slice(0, max);
    for (const item of pending) jobs.push({ channel, item });
  }
  return { seed: [], jobs };
}

async function postX(item, env, fetcher) {
  const url = "https://api.x.com/2/tweets";
  const { header } = oauthHeader({ method: "POST", url, consumerKey: env.X_API_KEY, consumerSecret: env.X_API_SECRET, token: env.X_ACCESS_TOKEN, tokenSecret: env.X_ACCESS_SECRET });
  const response = await fetcher(url, { method: "POST", headers: { Authorization: header, "Content-Type": "application/json" }, body: JSON.stringify({ text: composeX(item) }), signal: AbortSignal.timeout(20000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.data?.id) throw new Error("X rejected the post: HTTP " + response.status + " " + (data?.title || data?.detail || ""));
  return String(data.data.id);
}
async function postFacebook(item, env, fetcher) {
  const { message, link } = composeFacebook(item);
  const response = await fetcher("https://graph.facebook.com/" + encodeURIComponent(env.FB_PAGE_ID) + "/feed", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ message, link, access_token: env.FB_PAGE_TOKEN }), signal: AbortSignal.timeout(20000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.id) throw new Error("Facebook rejected the post: HTTP " + response.status + " " + (data?.error?.message || ""));
  return String(data.id);
}

export async function run({ env = process.env, fetcher = fetch, now = new Date(), state, dryRun = false }) {
  const channels = channelsFromEnv(env);
  const feed = await fetcher(FEED_URL, { headers: { Accept: "application/rss+xml" }, signal: AbortSignal.timeout(20000) });
  if (!feed.ok) return { state, changed: false, log: ["Feed not available yet (HTTP " + feed.status + "); nothing to do."] };
  const items = parseFeed(await feed.text());
  const next = { schemaVersion: 1, seededAt: state?.seededAt || null, posted: { ...(state?.posted || {}) } };
  const log = [], { seed, jobs } = plan(items, state, channels);
  let changed = false, failures = 0;
  if (seed.length) {
    next.seededAt = now.toISOString();
    for (const link of seed) next.posted[link] = { x: { skipped: "existing at setup" }, facebook: { skipped: "existing at setup" } };
    return { state: next, changed: true, failures, log: ["First run: recorded " + seed.length + " existing items without posting. New items will be shared from now on."] };
  }
  if (!channels.x && !channels.facebook) log.push("No channel secrets configured; nothing posted.");
  for (const { channel, item } of jobs) {
    if (dryRun) { log.push("[dry run] " + channel + ": " + (channel === "x" ? composeX(item) : composeFacebook(item).message).replace(/\n+/g, " | ")); continue; }
    try {
      const id = channel === "x" ? await postX(item, env, fetcher) : await postFacebook(item, env, fetcher);
      next.posted[item.link] = { ...(next.posted[item.link] || {}), [channel]: { id, at: now.toISOString() } };
      changed = true; log.push("Posted to " + channel + ": " + item.link);
    } catch (error) { failures++; log.push("FAILED " + channel + " for " + item.link + ": " + error.message); }
  }
  if (!jobs.length && (channels.x || channels.facebook)) log.push("No new items to share.");
  return { state: next, changed, failures, log };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const state = existsSync(STATE_PATH) ? JSON.parse(readFileSync(STATE_PATH, "utf8")) : null;
  const result = await run({ state, dryRun: process.argv.includes("--dry-run") || process.env.DRY_RUN === "true" });
  for (const line of result.log) console.log(line);
  if (result.changed) writeFileSync(STATE_PATH, JSON.stringify(result.state, null, 2) + "\n");
  if (result.failures) process.exitCode = 1;
}
