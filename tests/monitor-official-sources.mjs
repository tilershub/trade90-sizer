import assert from "node:assert/strict";
import {SOURCES,verifiedSourceUrl,extractOfficialLinks,nextSnapshot,scanOne} from "../scripts/monitor-official-sources.mjs";
assert.equal(SOURCES.length,8);
assert.equal(new Set(SOURCES.map(s=>s.code)).size,8);
for(const source of SOURCES){
 assert.ok(source.url.startsWith("https://"));
 assert.ok(source.url.includes(source.domain));
 assert.equal(verifiedSourceUrl("https://evil.com/mopo/decision",source),null);
 assert.equal(verifiedSourceUrl("http://"+source.domain+"/decision",source),null);
 assert.equal(verifiedSourceUrl("javascript:alert(1)",source),null);
}
const fed=SOURCES.find(s=>s.code==="USD");
const rss='<rss><channel><item><title>Federal Open Market Committee announces its monetary policy decision</title><link>https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm</link></item></channel></rss>';
const rssItems=extractOfficialLinks(rss,fed);
assert.equal(rssItems.length,1);assert.match(rssItems[0].title,/Open Market Committee/);
// Real Fed RSS feeds wrap link content in CDATA. Never publish a malformed /feeds/%3C![CDATA URL.
const fedCdata='<rss><channel><item><title>Federal Reserve issues FOMC statement</title><link><![CDATA[https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm]]></link></item></channel></rss>';
const fedDecoded=extractOfficialLinks(fedCdata,fed);
assert.equal(fedDecoded.length,1);
assert.equal(fedDecoded[0].url,"https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm");
assert.equal(verifiedSourceUrl("<![CDATA[https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm]]>",fed),fedDecoded[0].url);
assert.equal(verifiedSourceUrl("<![CDATA[https://evil.com/malware]]>",fed),null);
assert.equal(verifiedSourceUrl("/feeds/%3C![CDATA[https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm]]%3E",fed),null);
assert.equal(verifiedSourceUrl("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",fed),null,"Not a new release");
const oldMalformed="https://www.federalreserve.gov/feeds/%3C![CDATA[https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm]]%3E";
const parsedExisting=nextSnapshot({schemaVersion:1,sources:[{code:"USD",status:"available",lastSuccessAt:"2026-10-17T10:00:00Z",items:[{title:"Federal Reserve issues FOMC statement",url:oldMalformed}]}]},
 {USD:{ok:true,items:fedDecoded}},"2026-10-17T11:00:00Z");
assert.equal(parsedExisting.changes.length,0,"Fixing CDATA must not trigger a false new-release notification");
const html='<html><a href="/media-releases/2026/mr-26-30.html"><strong>Statement</strong> by the Monetary Policy Board: Interest Rate Decision</a><a href="https://fake.rba.gov.au/rates">Cash rate updated</a><a href="/media-releases/about/">About the bank</a></html>';
const rba=SOURCES.find(s=>s.code==="AUD");
const items=extractOfficialLinks(html,rba);
assert.equal(items.length,1);
assert.equal(items[0].url,"https://www.rba.gov.au/media-releases/2026/mr-26-30.html");
const baseline=Object.fromEntries(SOURCES.map(s=>[s.code,{ok:true,items:s.code==="USD"?rssItems:items.map(i=>({...i,url:"https://"+s.domain+"/news/2026/new-policy-decision"}))}]));
const a=nextSnapshot({schemaVersion:1,status:"awaiting_first_scan",sources:[]},baseline,"2026-10-17T05:00:00.000Z");
assert.equal(a.snapshot.sources.length,8);assert.equal(a.changes.length,0);assert.equal(a.failed.length,0);
const b=nextSnapshot(a.snapshot,{...baseline,USD:{ok:true,items:[{title:"New monetary policy rate announcement",url:"https://www.federalreserve.gov/newsevents/pressreleases/monetary20261029a.htm"},...rssItems]}}, "2026-10-17T06:00:00.000Z");
assert.equal(b.changes.length,1);assert.equal(b.changes[0].code,"USD");
const c=nextSnapshot(b.snapshot,{...baseline,USD:{ok:false,error:"503 Service Unavailable"}}, "2026-10-17T07:00:00.000Z");
assert.equal(c.failed.length,1);assert.equal(c.snapshot.sources.find(s=>s.code==="USD").items.length,2,"Keep last-known links when source goes offline");
const f=async()=>({ok:true,url:fed.url,text:async()=>rss});
assert.equal((await scanOne(fed,f)).items.length,1);
assert.equal((await scanOne(fed,async()=>({ok:true,url:"https://evil.com/rss",text:async()=>rss}))).ok,false);
assert.equal((await scanOne(fed,async()=>({ok:false,status:503}))).ok,false);
console.log("8 bank source discovery guards, RSS/HTML parsing, initial baseline, changed links, fail-safe behavior verified.");
