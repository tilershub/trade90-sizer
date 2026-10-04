import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { HUBS } from '../lib/hubs';
import publicResearch from '../data/public-research.json';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://tradeninety.com').replace(/\/$/, '');

  const articles = await getCollection('articles');
  const posts = await getCollection('posts');

  const researchDate = new Date(publicResearch.generated_at);
  const researchSummary = Object.values(publicResearch.markets ?? {})
    .map((market: any) => `${market.symbol}: ${market.structure}`)
    .join(' · ');

  const items = [
    {
      title: 'TRADE90 Market Research Snapshot',
      description: `Latest published FX, Gold and Bitcoin research structure across nine markets. ${researchSummary}`,
      url: `${base}/research/`,
      date: researchDate,
      category: 'Market Research',
    },
    ...articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      url: `${base}/${a.id.replace(/\.mdx?$/, '')}/`,
      date: new Date(a.data.updated),
      category: HUBS[a.data.hub]?.name ?? a.data.hub,
    })),
    ...posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt ?? '',
      url: `${base}/blog/${p.id.replace(/\.mdx?$/, '')}/`,
      date: new Date(p.data.published_at),
      category: 'Blog',
    })),
  ]
    .filter((i) => !isNaN(i.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastBuild = items[0]?.date ?? new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>TRADE90 — Market Research & Risk Management</title>
  <link>${base}/</link>
  <description>Current FX, Gold and Bitcoin research plus practical risk-management and trading-process tools.</description>
  <language>en</language>
  <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
  <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (i) => `  <item>
    <title>${escapeXml(i.title)}</title>
    <link>${i.url}</link>
    <guid isPermaLink="true">${i.url}</guid>
    <description>${escapeXml(i.description)}</description>
    <category>${escapeXml(i.category)}</category>
    <pubDate>${i.date.toUTCString()}</pubDate>
  </item>`
  )
  .join('\n')}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
