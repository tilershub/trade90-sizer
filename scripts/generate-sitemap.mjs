import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const SITE = "https://tradeninety.com";

const urls = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/blog/", changefreq: "daily", priority: "0.8" },
  { loc: "/about/", changefreq: "yearly", priority: "0.8" },
  { loc: "/contact/", changefreq: "yearly", priority: "0.8" },
  { loc: "/privacy/", changefreq: "yearly", priority: "0.8" },
  { loc: "/disclaimer/", changefreq: "yearly", priority: "0.8" },

  { loc: "/blog/forex-trading-in-the-usa-a-beginners-guide-to-the-worlds-largest-financial-market/", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/what-is-leverage-in-forex-trading-explained-simply-for-beginners/", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/what-is-risk-to-reward-ratio/", changefreq: "weekly", priority: "0.64" },
  { loc: "/blog/funded-trading-strategies/", changefreq: "weekly", priority: "0.64" }
];

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

if (!existsSync(resolve("dist"))) mkdirSync(resolve("dist"), { recursive: true });

writeFileSync(resolve("dist/sitemap.xml"), xml, "utf8");

// Debug: prints the FIRST LINE so you can confirm in Cloudflare logs
console.log("✅ Generated dist/sitemap.xml - first line:", xml.split("\n")[0]);