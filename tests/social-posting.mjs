import assert from 'node:assert/strict';
import { parseFeed, composeX, xLength, composeFacebook, oauthHeader, channelsFromEnv, plan, run } from '../scripts/post-social.mjs';

// OAuth 1.0a against the worked example in X's "Creating a signature" documentation.
const signed = oauthHeader({ method: 'POST', url: 'https://api.twitter.com/1.1/statuses/update.json?include_entities=true', params: { status: 'Hello Ladies + Gentlemen, a signed OAuth request!' },
  consumerKey: 'xvz1evFS4wEEPTGEFPHBog', consumerSecret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw', token: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb', tokenSecret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE',
  nonce: 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg', timestamp: 1318622958 });
assert.equal(signed.signature, 'hCtSmYh+iHYCEqBWrE7C7hYmtUk=');
assert.match(signed.header, /^OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce=/);
assert.ok(!signed.header.includes('kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw') && !signed.header.includes('LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE'), 'Secrets never appear in the header');

const item = (n, date, category = 'Guide') => `<item><title>Guide ${n} &amp; more</title><link>https://tradeninety.com/learn/g${n}/</link><guid isPermaLink="true">https://tradeninety.com/learn/g${n}/</guid><pubDate>${new Date(date).toUTCString()}</pubDate><category>${category}</category><description>Answer ${n} &lt;b&gt; text</description></item>`;
const feed = items => '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>t</title>' + items.join('') + '<item><title>Off-site</title><link>https://evil.example/x/</link><pubDate>Mon, 16 Nov 2026 00:00:00 GMT</pubDate></item></channel></rss>';
const parsed = parseFeed(feed([item(1, '2026-11-10T12:00:00Z'), item(2, '2026-11-12T12:00:00Z', 'Weekly digest')]));
assert.deepEqual(parsed.map(i => [i.title, i.link, i.description, i.category]), [['Guide 1 & more', 'https://tradeninety.com/learn/g1/', 'Answer 1 <b> text', 'Guide'], ['Guide 2 & more', 'https://tradeninety.com/learn/g2/', 'Answer 2 <b> text', 'Weekly digest']], 'Entities decoded; other hosts ignored');
assert.throws(() => parseFeed('<html>error</html>'));

const long = { title: 'T'.repeat(200), link: 'https://tradeninety.com/weekly/2026-w46/', description: 'D '.repeat(400), category: 'Weekly digest' };
for (const sample of [long, parsed[0], { ...parsed[0], description: '' }]) {
  const text = composeX(sample);
  assert.ok(xLength(text) <= 280, 'X post within 280 characters: ' + xLength(text));
  assert.ok(text.includes(sample.link)); assert.equal((text.match(/https?:\/\//g) || []).length, 1, 'Exactly one link');
}
const fb = composeFacebook(long);
assert.equal(fb.link, long.link); assert.ok(fb.message.length < 900 && fb.message.endsWith('not trading advice.'));

assert.deepEqual(channelsFromEnv({}), { x: false, facebook: false });
assert.deepEqual(channelsFromEnv({ X_API_KEY: 'a', X_API_SECRET: 'b', X_ACCESS_TOKEN: 'c', X_ACCESS_SECRET: ' ' }), { x: false, facebook: false }, 'Blank secret disables the channel');
assert.deepEqual(channelsFromEnv({ FB_PAGE_ID: '1', FB_PAGE_TOKEN: 't' }), { x: false, facebook: true });

// First run seeds; nothing is posted.
assert.deepEqual(plan(parsed, null, { x: true, facebook: true }), { seed: parsed.map(i => i.link), jobs: [] });
const seeded = { seededAt: '2026-11-15T00:00:00Z', posted: { [parsed[0].link]: { x: { skipped: 'existing at setup' }, facebook: { skipped: 'existing at setup' } } } };
const later = plan(parsed, seeded, { x: true, facebook: false });
assert.deepEqual(later.jobs.map(j => [j.channel, j.item.link]), [['x', parsed[1].link]], 'Only new items, only enabled channels');
const many = parseFeed(feed([1, 2, 3, 4].map(n => item(n, '2026-11-1' + n + 'T12:00:00Z'))));
assert.deepEqual(plan(many, { seededAt: 'x', posted: {} }, { x: true, facebook: false }).jobs.map(j => j.item.link), ['https://tradeninety.com/learn/g1/', 'https://tradeninety.com/learn/g2/'], 'Oldest first, capped per run');

// End-to-end with a fake network: seed, then post, then record only successes.
const calls = [];
const net = fail => async (url, options = {}) => {
  calls.push([String(url), options.method || 'GET']);
  if (String(url).endsWith('/rss.xml')) return { ok: true, status: 200, text: async () => feed([item(1, '2026-11-10T12:00:00Z'), item(2, '2026-11-12T12:00:00Z')]) };
  if (String(url).startsWith('https://api.x.com/2/tweets')) { assert.match(options.headers.Authorization, /^OAuth /); assert.ok(JSON.parse(options.body).text.includes('https://tradeninety.com/')); return fail === 'x' ? { ok: false, status: 402, json: async () => ({ title: 'CreditsDepleted' }) } : { ok: true, status: 201, json: async () => ({ data: { id: '111' } }) }; }
  if (String(url).startsWith('https://graph.facebook.com/123/feed')) { assert.equal(options.body.get('link').startsWith('https://tradeninety.com/'), true); return { ok: true, status: 200, json: async () => ({ id: '123_456' }) }; }
  throw new Error('Unexpected request ' + url);
};
const env = { X_API_KEY: 'k', X_API_SECRET: 's', X_ACCESS_TOKEN: 't', X_ACCESS_SECRET: 'ts', FB_PAGE_ID: '123', FB_PAGE_TOKEN: 'page-token' };
const now = new Date('2026-11-15T05:00:00Z');
const first = await run({ env, fetcher: net(), now, state: null });
assert.equal(first.changed, true); assert.equal(Object.keys(first.state.posted).length, 2); assert.equal(calls.filter(c => c[1] === 'POST').length, 0, 'Seeding never posts');
const base = { seededAt: first.state.seededAt, posted: { 'https://tradeninety.com/learn/g1/': first.state.posted['https://tradeninety.com/learn/g1/'] } };
const second = await run({ env, fetcher: net(), now, state: base });
assert.deepEqual(second.state.posted['https://tradeninety.com/learn/g2/'], { x: { id: '111', at: now.toISOString() }, facebook: { id: '123_456', at: now.toISOString() } });
assert.equal(second.failures, 0);
const again = await run({ env, fetcher: net(), now, state: second.state });
assert.equal(again.changed, false, 'Nothing is posted twice');
const partial = await run({ env, fetcher: net('x'), now, state: base });
assert.equal(partial.failures, 1); assert.equal(partial.state.posted['https://tradeninety.com/learn/g2/'].x, undefined, 'A failed post is retried next run'); assert.ok(partial.state.posted['https://tradeninety.com/learn/g2/'].facebook.id);
assert.ok(!JSON.stringify(partial.log).includes('page-token') && !JSON.stringify(partial.log).includes('"ts"'), 'Secrets are never logged');
const before = calls.length; const dry = await run({ env, fetcher: net(), now, state: base, dryRun: true });
assert.equal(calls.slice(before).filter(c => c[1] === 'POST').length, 0); assert.equal(dry.changed, false); assert.ok(dry.log.some(l => l.startsWith('[dry run] x:')));
const down = await run({ env, fetcher: async () => ({ ok: false, status: 404 }), now, state: base });
assert.equal(down.changed, false); assert.match(down.log[0], /Feed not available/);
console.log('Social posting passed: OAuth signature vector, feed parsing, post composition, seeding, limits, retries and secret hygiene.');
