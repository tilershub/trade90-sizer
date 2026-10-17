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
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        // Keep error/retired routes out of the sitemap even if generated.
        return !/^\/(?:404\/?)$/.test(path) &&
          !/^\/(?:calculator|tools|research)\//.test(path);
      },
      serialize(item) {
        const p = new URL(item.url).pathname;
        if (p === "/") return {...item,priority:1.0,changefreq:"weekly"};
        if (p === "/methodology/" || p === "/learn/") return {...item,priority:0.8,changefreq:"monthly"};
        if (p.startsWith("/learn/")) return {...item,priority:0.7,changefreq:"monthly"};
        return {...item,priority:0.4,changefreq:"monthly"};
      }
    }),
    robotsTxt({
      policy: [{userAgent:"*",allow:"/"}],
      sitemap:"https://tradeninety.com/sitemap.xml"
    })
  ]
});
