import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { HUBS } from '../lib/hubs';

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

  const items = [
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
  <title>TRADE90 — Education for Funded Traders</title>
  <link>${base}/</link>
  <description>Practical education on trading psychology, risk management, and disciplined execution for funded traders.</description>
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
