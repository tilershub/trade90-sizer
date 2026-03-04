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
      // Exclude redirect-only pages and auth portals
      filter: (page) =>
        !['/join/', '/login/', '/logout/'].includes(new URL(page).pathname),

      // Set crawl priority and change frequency per page type
      serialize(item) {
        const path = new URL(item.url).pathname;

        if (path === '/') {
          return { ...item, changefreq: 'daily', priority: 1.0 };
        }
        if (path.startsWith('/calculator/')) {
          return { ...item, changefreq: 'monthly', priority: 0.9 };
        }
        if (path.startsWith('/blog/')) {
          return { ...item, changefreq: 'weekly', priority: 0.8 };
        }
        if (path === '/blog' || path === '/blog/') {
          return { ...item, changefreq: 'daily', priority: 0.8 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.6 };
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