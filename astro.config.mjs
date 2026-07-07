import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://tradeninety.com", // MUST be absolute, no trailing slash

  // 301 redirects: legacy URLs → new hub architecture (trailing-slash canonical)
  redirects: {
    '/learn/': '/risk-management/',
    '/learn/position-sizing/': '/risk-management/position-sizing/',
    '/learn/risk-management/': '/risk-management/',
    '/learn/funded-accounts/': '/prop-firms/',
    '/how-to-calculate-position-size/': '/risk-management/position-sizing/',
    '/prop-firm-risk-management/': '/risk-management/',
  },

  integrations: [
    tailwind(),
    svelte(),

    sitemap({
      filter: (page) =>
        !['/join/', '/login/', '/logout/'].includes(new URL(page).pathname),
      lastmod: new Date(),
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;

        // Top priority: homepage, hub pillars, foundation guide, primary tools
        const highPriority = [
          '/',
          '/psychology/',
          '/risk-management/',
          '/risk-management/position-sizing/',
          '/trading-plans/',
          '/prop-firms/',
          '/performance/',
          '/tools/',
          '/tools/position-size-calculator/',
        ];
        if (highPriority.includes(path)) {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }

        // Hub articles (two path segments under a hub)
        const hubPrefixes = ['/psychology/', '/risk-management/', '/trading-plans/', '/prop-firms/', '/performance/'];
        if (hubPrefixes.some((p) => path.startsWith(p) && path !== p)) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }

        // Other tools + prop firm reference
        if (path.startsWith('/tools/') || ['/pip-value-calculator/', '/risk-reward-calculator/', '/best-prop-firms-usa/', '/calculator/'].includes(path)) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }

        // Blog posts
        if (path.startsWith('/blog/') && path !== '/blog/') {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }

        // Instrument calculators
        if (path.startsWith('/calculator/') && path !== '/calculator/') {
          return { ...item, priority: 0.6, changefreq: 'monthly' };
        }

        // Legacy calculator pages retained for continuity
        if (['/funded-trader-risk-calculator/', '/ftmo-position-size-calculator/'].includes(path)) {
          return { ...item, priority: 0.5, changefreq: 'monthly' };
        }

        return { ...item, priority: 0.5, changefreq: 'monthly' };
      },
    }),

    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/join", "/login", "/logout"],
        },
      ],
      sitemap: "https://tradeninety.com/sitemap-index.xml",
    }),
  ],
});
