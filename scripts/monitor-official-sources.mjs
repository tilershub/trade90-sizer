#!/usr/bin/env node
// Official-source monitor: find and retain official publication links, NEVER change rates.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {pathToFileURL} from "node:url";
export const SOURCES=[
 {code:"USD",bank:"Fed",url:"https://www.federalreserve.gov/feeds/press_monetary.xml",domain:"federalreserve.gov"},
 {code:"EUR",bank:"ECB",url:"https://www.ecb.europa.eu/rss/press.html",domain:"ecb.europa.eu"},
 {code:"GBP",bank:"BoE",url:"https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes",domain:"bankofengland.co.uk"},
 {code:"JPY",bank:"BoJ",url:"https://www.boj.or.jp/en/whatsnew/",domain:"boj.or.jp"},
 {code:"AUD",bank:"RBA",url:"https://www.rba.gov.au/media-releases/",domain:"rba.gov.au"},
 {code:"NZD",bank:"RBNZ",url:"https://www.rbnz.govt.nz/news-and-events/news",domain:"rbnz.govt.nz"},
 {code:"CAD",bank:"BoC",url:"https://www.bankofcanada.ca/press/press-releases/",domain:"bankofcanada.ca"},
 {code:"CHF",bank:"SNB",url:"https://www.snb.ch/en/news-publications/media-releases",domain:"snb.ch"}
];
const relevant=/monetary|policy|interest.rate|cash.rate|bank.rate|official.cash.rate|fomc|governing.council|minutes|inflation.report|assessment|overnight.rate|target.rate/i;
const file=resolve("public/data/official-source-monitor.json");
const decode=s=>s.replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
const plain=s=>decode(s.replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()).slice(0,220);
export function verifiedSourceUrl(href,source){
 try{const u=new URL(decode(href),source.url);if(u.protocol!=="https:"||u.username||u.password||u.port||u.hostname!==new URL(source.url).hostname)return null;u.hash="";return u.href;}catch{return null;}
}
export function extractOfficialLinks(body,source){
 if(typeof body!=="string"||body.length>3000000)throw Error("Invalid official source body");
 const links=[];
 const add=(name,href)=>{
  const title=plain(name),url=verifiedSourceUrl(href,source);
  if(!url||title.length<16||!relevant.test(title)||url===source.url)return;
  if(new URL(url).pathname==="/")return;
  links.push({title,url});
 };
 for(const [,item] of body.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)){
  const title=item.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const link=item.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1]||item.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1];
  if(title&&link)add(title,link);
 }
 if(!links.length){
  for(const [,attrs,anchorText] of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
   const href=attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
   if(href)add(anchorText,href);
  }
 }
 return [...new Map(links.map(l=>[l.url,l])).values()].slice(0,16);
}
export function nextSnapshot(previous,results,stamp){
 const old=new Map((previous?.sources||[]).map(x=>[x.code,x]));
 const changes=[],failed=[];
 const sources=SOURCES.map(s=>{
  const existing=old.get(s.code),r=results[s.code];
  if(!r?.ok){failed.push({code:s.code,error:String(r?.error||"No data").slice(0,160)});return {...s,status:"unavailable",lastSuccessAt:existing?.lastSuccessAt||null,items:existing?.items||[]};}
  const before=new Set((existing?.items||[]).map(x=>x.url));
  // First run is the baseline: do not open issues for historical headlines.
  if(existing?.lastSuccessAt)for(const item of r.items)if(!before.has(item.url))changes.push({...item,code:s.code,bank:s.bank});
  return {...s,status:"available",lastSuccessAt:stamp,items:r.items};
 });
 return {snapshot:{schemaVersion:1,status:failed.length===SOURCES.length?"unavailable":failed.length?"partial":"monitored",lastScanAt:stamp,
 explanation:"Auto-detected links to central-bank publications. NOT verified rate changes or current live rates.",
 sources},changes,failed};
}
export async function scanOne(source,fetcher=fetch){
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),12500);
 try{
  const res=await fetcher(source.url,{redirect:"follow",signal:c.signal,headers:{"user-agent":"TRADE90OfficialSourceWatch/1.0 (+https://tradeninety.com/data-policy/)","accept":"application/rss+xml, application/atom+xml, text/xml, text/html"}});
  if(!res.ok)throw Error("HTTP "+res.status);
  const final=new URL(res.url||source.url);
  if(final.hostname!==new URL(source.url).hostname)throw Error("Unexpected redirect");
  const items=extractOfficialLinks(await res.text(),source);
  if(!items.length)throw Error("No relevant links extracted");
  return {ok:true,items};
 }catch(e){return {ok:false,error:String(e.message||e)};}
 finally{clearTimeout(timer);}
}
export async function runMonitor({fetcher=fetch,now=()=>new Date().toISOString()}={}){
 let prior={schemaVersion:1,status:"awaiting_first_scan",sources:[]};
 try{prior=JSON.parse(readFileSync(file,"utf8"));}catch{}
 const results={};
 for(const s of SOURCES){results[s.code]=await scanOne(s,fetcher);console.log(s.code+": "+(results[s.code].ok?"found "+results[s.code].items.length+" links":results[s.code].error));}
 const {snapshot,changes,failed}=nextSnapshot(prior,results,now());
 if(failed.length===SOURCES.length && !(prior.sources||[]).length)throw Error("All initial source checks failed");
 mkdirSync(dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(snapshot,null,2)+"\n");
 const report=changes.length?"Automatically detected "+changes.length+" official publication link(s):\n\n"+changes.slice(0,16).map(x=>"- "+x.code+" "+x.bank+": ["+x.title+"]("+x.url+")").join("\n")+"\n\nLINK DISCOVERY ONLY. Do not change policy rates without verified benchmark and effective date.":"";
 writeFileSync("/tmp/trade90-source-alert.md",report);
 writeFileSync("/tmp/trade90-source-monitor-result.json",JSON.stringify({changes,failed}));
 console.log("New links: "+changes.length+"; failed sources: "+failed.length+"; NO policy rates modified.");
 return {snapshot,changes,failed};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runMonitor().catch(e=>{console.error(e);process.exitCode=1;});
