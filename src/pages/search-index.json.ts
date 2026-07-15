import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { HUBS } from '../lib/hubs';

// Build-time search index consumed by /search/ (client-side filtering).
export const GET: APIRoute = async () => {
  const articles = await getCollection('articles');
  const posts = await getCollection('posts');

  const items = [
    ...articles.map((a) => {
      const path = a.id.replace(/\.mdx?$/, '');
      return {
        title: a.data.title,
        desc: a.data.description,
        url: `/${path}/`,
        section: HUBS[a.data.hub]?.name ?? a.data.hub,
        type: 'guide',
      };
    }),
    ...posts.map((p) => ({
      title: p.data.title,
      desc: p.data.excerpt ?? '',
      url: `/blog/${p.id.replace(/\.mdx?$/, '')}/`,
      section: 'Blog',
      type: 'post',
    })),
    // Tools (static entries so they're findable too)
    { title: 'Position Size Calculator', desc: 'Exact lot size for any trade across 45+ instruments, with funded-account limits enforced.', url: '/tools/position-size-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Drawdown Calculator', desc: 'Account drawdown after a losing streak, and the gain required to recover.', url: '/tools/drawdown-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Risk / Reward Calculator', desc: 'R:R ratio, break-even win rate, and expected value.', url: '/risk-reward-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Pip Value Calculator', desc: 'Pip and point values for forex, gold, indices, and crypto.', url: '/pip-value-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Profit / Loss Calculator', desc: 'Dollar result of a trade from instrument, lot size, and pip movement.', url: '/tools/profit-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Compounding Calculator', desc: 'Project account growth at a steady monthly return.', url: '/tools/compounding-calculator/', section: 'Tools', type: 'tool' },
    { title: "Today's Dashboard", desc: 'Session clock, daily risk budget, and daily checklist — your trading day in one place.', url: '/today/', section: 'Platform', type: 'tool' },
    { title: 'Trading Journal', desc: 'Log trades in R-multiples and track win rate, expectancy, and plan adherence.', url: '/journal/', section: 'Platform', type: 'tool' },
    { title: 'Trading Plan Builder', desc: 'Write a complete six-section trading plan and export it.', url: '/tools/trading-plan-builder/', section: 'Platform', type: 'tool' },
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
