import { writeFileSync } from "fs";
import { resolve } from "path";

const SITE = "https://tradeninety.com";

const urls = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/blog/", priority: "0.8", changefreq: "daily" },
  { loc: "/about/", priority: "0.8", changefreq: "yearly" },
  { loc: "/contact/", priority: "0.8", changefreq: "yearly" },
  { loc: "/privacy/", priority: "0.8", changefreq: "yearly" },
  { loc: "/disclaimer/", priority: "0.8", changefreq: "yearly" },

  // blog posts
  { loc: "/blog/forex-trading-in-the-usa-a-beginners-guide-to-the-worlds-largest-financial-market/", priority: "0.8", changefreq: "weekly" },
  { loc: "/blog/what-is-leverage-in-forex-trading-explained-simply-for-beginners/", priority: "0.8", changefreq: "weekly" },
  { loc: "/blog/what-is-risk-to-reward-ratio/", priority: "0.64", changefreq: "weekly" },
  { loc: "/blog/funded-trading-strategies/", priority: "0.64", changefreq: "weekly" },
];

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${SITE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>
`).join("")}
</urlset>`;

writeFileSync(resolve("dist/sitemap.xml"), xml.trim());
console.log("✅ sitemap.xml generated");