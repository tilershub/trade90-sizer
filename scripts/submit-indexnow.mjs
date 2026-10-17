/**
 * TRADE90 IndexNow (Bing and other participating engines).
 * Not Google's restricted Indexing API. A successful POST only requests discovery.
 * Expects dist/sitemap.xml from npm run build, verifies the public domain key
 * before notifying search engines, and refuses other-host or retired URLs.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const ORIGIN="https://tradeninety.com";
const KEY="16fd9ce1153b9709c9289b771fdbc3c9afd1d0be";
const KEY_URL=ORIGIN+"/"+KEY+".txt";
const ROOT=new URL("../dist/",import.meta.url);
const BASE_URLS=new Set(["/","/rate-gaps/","/pairs/","/decisions/","/central-banks/"]);
const BANKS=["fed","ecb","boe","boj","rba","rbnz","boc","snb"];
const forbidden=/^\/(?:404(?:\/|$)|calculator\/|tools\/|research\/)/i;

export function readSitemap(xml){
 if(!xml.includes("<urlset")||!xml.includes("</urlset>"))throw Error("Not a complete sitemap URL set");
 const locs=[...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m=>m[1].trim());
 if(!locs.length||new Set(locs).size!==locs.length)throw Error("Empty or duplicate sitemap URLs");
 for(const loc of locs){
  const u=new URL(loc);
  if(u.origin!==ORIGIN||u.search||u.hash||forbidden.test(u.pathname)||!u.pathname.endsWith("/"))throw Error("Invalid sitemap URL: "+loc);
 }
 return locs;
}
export function selectChangedUrls(urls,changedPaths=null){
 if(changedPaths===null)return urls;
 const changes=changedPaths.map(x=>x.trim()).filter(Boolean);
 if(!changes.length)return [];
 const important=changes.some(path=>
  /^src\/(?:components|lib)\//.test(path)
  || /^src\/data\/trade90-(?:policy|decision|rate|v3)/.test(path)
  || /^src\/pages\/(?:pairs\/\[pair\]|central-banks\/\[bank\])\.astro$/.test(path)
  || /^src\/layouts\//.test(path)
  || /^scripts\/(?:publish-sitemap|submit-indexnow)\.mjs$/.test(path)
  || /^astro\.config\.mjs$/.test(path));
 if(important)return urls;
 const wanted=new Set();
 for(const path of changes){
  if(path==="src/pages/index.astro")wanted.add("/");
  else if(path==="src/pages/404.astro")continue;
  else if(/^src\/pages\/.+\.astro$/.test(path)){
    let leaf=path.replace(/^src\/pages\//,"").replace(/\.astro$/,"");
    leaf=leaf.endsWith("/index")?leaf.slice(0,-6):leaf;
    wanted.add("/"+leaf+"/");
  } else if(path==="public/robots.txt"||path==="public/sitemap.xml")continue;
  else if(path.startsWith("src/styles/")||path.startsWith("tests/")||path.startsWith("docs/")||path.startsWith(".github/")||path.startsWith("public/"))continue;
  else if(path.startsWith("src/"))return urls;
 }
 return urls.filter(loc=>wanted.has(new URL(loc).pathname));
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function verifyLiveKey(fetcher=fetch,attempts=10){
 for(let n=1;n<=attempts;n++){
  try{
   const response=await fetcher(KEY_URL,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   if(response.ok&&(await response.text()).trim()===KEY)return true;
  }catch{}
  if(n<attempts)await pause(15000);
 }
 throw Error("TRADE90 IndexNow verification key not yet served from "+KEY_URL+"; wait for hosting to deploy and re-run");
}
export async function submitIndexNow(urls,fetcher=fetch){
 const response=await fetcher("https://api.indexnow.org/indexnow",{
  method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},
  body:JSON.stringify({host:"tradeninety.com",key:KEY,keyLocation:KEY_URL,urlList:urls}),
  signal:AbortSignal.timeout(30000)
 });
 const body=(await response.text()).slice(0,600);
 if(![200,202].includes(response.status))throw Error("IndexNow submission failed HTTP "+response.status+": "+body);
 return {status:response.status,message:response.status===202?"Accepted; key/search-engine validation pending":"Acknowledged by IndexNow service",count:urls.length};
}
export async function main(args=process.argv.slice(2)){
 const sitemapPath=new URL("sitemap.xml",ROOT);
 if(!existsSync(sitemapPath))throw Error("Run npm run build before IndexNow submission");
 const allUrls=readSitemap(readFileSync(sitemapPath,"utf8"));
 const changedPathArg=args.find(a=>a.startsWith("--changed-file="));
 const changed=changedPathArg?readFileSync(changedPathArg.slice("--changed-file=".length),"utf8").split(/\r?\n/):null;
 const urls=selectChangedUrls(allUrls,changed);
 if(!urls.length){console.log("IndexNow: no indexable content changed; nothing submitted");return;}
 if(args.includes("--dry-run")){
  console.log(JSON.stringify({status:"dry-run",changed:changed??"all",submitted:false,urls},null,2));
  return;
 }
 await verifyLiveKey();
 const result=await submitIndexNow(urls);
 console.log(JSON.stringify({indexNow:result,notice:"Submission is not a guarantee of crawling, indexing or search ranking"}));
}
if(process.argv[1] && resolve(fileURLToPath(import.meta.url))===resolve(process.argv[1])){
 main().catch(e=>{console.error(e.message);process.exitCode=1});
}
