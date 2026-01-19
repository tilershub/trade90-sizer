import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://tradeninety.com",
  integrations: [
    svelte(),
    sitemap(),
    robotsTxt({
      policy: [{ userAgent: "*", allow: "/" }],
    }),
  ],
});