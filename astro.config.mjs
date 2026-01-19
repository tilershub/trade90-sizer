import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tradeninety.com',
  output: 'static',
  integrations: [
    svelte(),
    tailwind(),
    sitemap({
      // prevents sitemap from choking + keeps SEO clean
      filter: (page) => !page.pathname.startsWith('/category/')
    }),
  ],
});