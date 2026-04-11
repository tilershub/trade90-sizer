import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://tradeninety.com", // MUST be absolute, no trailing slash
  integrations: [
    tailwind(),
    svelte(),

    sitemap({
      filter: (page) =>
        !['/join/', '/login/', '/logout/'].includes(new URL(page).pathname),
      lastmod: new Date(),
      serialize(item) {
        // Priority mapping — highest priority for funded-trader conversion pages
        const highPriority = [
          '/',
          '/funded-trader-risk-calculator/',
          '/ftmo-position-size-calculator/',
          '/prop-firm-risk-management/',
          '/how-to-calculate-position-size/',
          '/calculator/',
          '/pip-value-calculator/',
          '/risk-reward-calculator/',
        ];
        const medPriority = ['/about/', '/blog/', '/calculator/'];
        const url = new URL(item.url);
        const path = url.pathname;

        if (highPriority.includes(path)) {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (path.startsWith('/blog/') && path !== '/blog/') {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        if (path.startsWith('/calculator/') && path !== '/calculator/') {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }
        return { ...item, priority: 0.6, changefreq: 'monthly' };
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
