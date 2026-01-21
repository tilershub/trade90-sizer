import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://tradeninety.com",
  integrations: [
    tailwind(),
    svelte(),

    // ✅ Sitemap: exclude utility/auth redirect pages
    sitemap({
      filter: (page) => {
        return !["/join", "/login", "/logout"].some((p) => page.endsWith(p));
      },
    }),

    // ✅ Robots: allow everything but block utility/auth routes + include sitemap URL
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