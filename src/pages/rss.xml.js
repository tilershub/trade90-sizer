// RSS 2.0 feed of dated research: weekly digests, verified decisions and guides.
import { weeklyDigests, decisionArchive } from "../lib/trade90-content-data.js";
import { archiveRateText, decisionVerb } from "../lib/trade90-decision-archive.js";
import { longDate } from "../lib/trade90-weekly.js";
import { lessons } from "../data/v2-lessons.js";
const ORIGIN = "https://tradeninety.com";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function feedItems() {
  const items = [];
  for (const d of weeklyDigests().completed) items.push({ title: "Central bank rates this week: " + d.rangeLabel, link: ORIGIN + "/weekly/" + d.slug + "/", date: new Date(Date.parse(d.end + "T00:00:00Z") + 86400000), description: d.summary, category: "Weekly digest" });
  for (const d of decisionArchive()) {
    const verb = decisionVerb(d), rate = archiveRateText(d);
    items.push({ title: d.short + " decision, " + longDate(d.decisionDate) + ": rate " + ({ held: "held at ", raised: "raised to ", cut: "cut to ", adjusted: "set at " })[verb] + rate, link: ORIGIN + "/decisions/" + d.id + "/", date: new Date(d.decisionDate + "T12:00:00Z"),
      description: "The " + d.bank + " decision of " + longDate(d.decisionDate) + ": " + d.decision + ", benchmark " + rate + ". Includes the effect on " + d.code + " policy-rate gaps and the next scheduled decision.", category: "Rate decision" });
  }
  for (const l of lessons) items.push({ title: l.title, link: ORIGIN + "/learn/" + l.slug + "/", date: new Date(l.updated + "T12:00:00Z"), description: l.answer || l.description, category: "Guide" });
  return items.filter(i => Number.isFinite(i.date.getTime())).sort((a, b) => b.date - a.date || a.link.localeCompare(b.link)).slice(0, 60);
}
export function GET() {
  const items = feedItems();
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'
    + "<title>TRADE90: central bank rates and forex rate gaps</title><link>" + ORIGIN + "/</link>"
    + "<description>Weekly digests, verified central bank decisions and guides on interest-rate differentials across 28 forex pairs.</description>"
    + "<language>en</language>" + '<atom:link href="' + ORIGIN + '/rss.xml" rel="self" type="application/rss+xml"/>'
    + (items[0] ? "<lastBuildDate>" + items[0].date.toUTCString() + "</lastBuildDate>" : "")
    + items.map(i => "<item><title>" + esc(i.title) + "</title><link>" + i.link + '</link><guid isPermaLink="true">' + i.link + "</guid><pubDate>" + i.date.toUTCString() + "</pubDate><category>" + esc(i.category) + "</category><description>" + esc(i.description) + "</description></item>").join("")
    + "</channel></rss>\n";
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
