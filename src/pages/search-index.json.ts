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
    { title: 'Position Size Calculator', desc: 'Calculate position size across 45+ instruments with configurable per-trade and daily risk guardrails.', url: '/tools/position-size-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Drawdown Calculator', desc: 'Account drawdown after a losing streak, and the gain required to recover.', url: '/tools/drawdown-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Risk / Reward Calculator', desc: 'R:R ratio, break-even win rate, and expected value.', url: '/risk-reward-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Pip Value Calculator', desc: 'Pip and point values for forex, gold, indices, and crypto.', url: '/pip-value-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Profit / Loss Calculator', desc: 'Dollar result of a trade from instrument, lot size, and pip movement.', url: '/tools/profit-calculator/', section: 'Tools', type: 'tool' },
    { title: 'Compounding Calculator', desc: 'Project account growth at a steady monthly return.', url: '/tools/compounding-calculator/', section: 'Tools', type: 'tool' },
    { title: "Today's Dashboard", desc: 'Session clock, daily risk budget, and daily checklist — your trading day in one place.', url: '/today/', section: 'Platform', type: 'tool' },
    { title: 'Trading Journal', desc: 'Log trades in R-multiples and track win rate, expectancy, and plan adherence.', url: '/journal/', section: 'Platform', type: 'tool' },
    { title: 'Trading Plan Builder', desc: 'Write a complete six-section trading plan and export it.', url: '/tools/trading-plan-builder/', section: 'Platform', type: 'tool' },
    { title: 'Economic Calendar', desc: 'Track scheduled global economic releases and central-bank events, then open the affected TRADE90 market research.', url: '/economic-calendar/', section: 'Research', type: 'tool' },
    { title: 'Market Research Today', desc: 'Current cross-market research desk for FX, Gold and Bitcoin with structure, volatility, positioning and coverage flags.', url: '/research/today/', section: 'Research', type: 'research' },
    { title: 'EUR/USD Research', desc: 'Current EUR/USD market structure, macro context, positioning, volatility and evidence balance.', url: '/research/eurusd/', section: 'Research', type: 'research' },
    { title: 'GBP/USD Research', desc: 'Current GBP/USD market structure, macro context, positioning, volatility and evidence balance.', url: '/research/gbpusd/', section: 'Research', type: 'research' },
    { title: 'USD/JPY Research', desc: 'Current USD/JPY market structure with US, Japan and global macro context.', url: '/research/usdjpy/', section: 'Research', type: 'research' },
    { title: 'USD/CHF Research', desc: 'Current USD/CHF market structure, macro context, positioning and source coverage.', url: '/research/usdchf/', section: 'Research', type: 'research' },
    { title: 'USD/CAD Research', desc: 'Current USD/CAD market structure, macro context, positioning and source coverage.', url: '/research/usdcad/', section: 'Research', type: 'research' },
    { title: 'AUD/USD Research', desc: 'Current AUD/USD market structure, macro context, positioning and source coverage.', url: '/research/audusd/', section: 'Research', type: 'research' },
    { title: 'NZD/USD Research', desc: 'Current NZD/USD market structure, macro context, positioning and source coverage.', url: '/research/nzdusd/', section: 'Research', type: 'research' },
    { title: 'Gold XAU/USD Research', desc: 'Current Gold research with spot quote context, COMEX history, real yields, positioning and volatility.', url: '/research/xauusd/', section: 'Research', type: 'research' },
    { title: 'Bitcoin BTC/USD Research', desc: 'Current Bitcoin research with market structure, volatility, macro liquidity and positioning context.', url: '/research/btcusd/', section: 'Research', type: 'research' },
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
