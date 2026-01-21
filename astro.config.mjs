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
      canonicalURL: true,
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