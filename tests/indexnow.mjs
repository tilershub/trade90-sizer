import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {readSitemap,selectChangedUrls,submitIndexNow,verifyLiveKey} from "../scripts/submit-indexnow.mjs";
const root="https://tradeninety.com";
const paths=["/","/pairs/","/rate-gaps/","/pairs/eur-usd/","/pairs/usd-jpy/","/central-banks/fed/","/decisions/","/learn/"];
const xml='<?xml version="1.0"?><urlset>'+paths.map(p=>'<url><loc>'+root+p+'</loc></url>').join("")+'</urlset>';
const all=readSitemap(xml);
assert.deepEqual(all,paths.map(p=>root+p));
for(const bad of [
 xml.replace(root+"/pairs/eur-usd/",root+"/calculator/eurusd/"),
 xml.replace(root+"/pairs/eur-usd/",root+"/pairs/eur-usd/?bogus=1"),
 xml.replace(root+"/pairs/eur-usd/","https://thirdparty.example/pairs/eur-usd/"),
 xml.replace("</urlset>","<url><loc>"+root+"/pairs/eur-usd/</loc></url></urlset>")
])assert.throws(()=>readSitemap(bad));
assert.deepEqual(selectChangedUrls(all,["src/pages/index.astro"]),[root+"/"]);
assert.deepEqual(selectChangedUrls(all,["src/pages/pairs/index.astro"]),[root+"/pairs/"]);
assert.deepEqual(selectChangedUrls(all,["src/styles/trade90-reading.css"]),[]);
assert.deepEqual(selectChangedUrls(all,["public/data/official-source-monitor.json"]),[]);
assert.deepEqual(selectChangedUrls(all,["src/data/trade90-policy-snapshot.json"]),all);
assert.deepEqual(selectChangedUrls(all,["src/pages/pairs/[pair].astro"]),all);
assert.deepEqual(selectChangedUrls(all,null),all);
const keyFile=readFileSync(new URL("../public/16fd9ce1153b9709c9289b771fdbc3c9afd1d0be.txt",import.meta.url),"utf8").trim();
assert.equal(keyFile,"16fd9ce1153b9709c9289b771fdbc3c9afd1d0be");
let verifiedUrl="";
await verifyLiveKey(async(url)=>{verifiedUrl=url;return {ok:true,text:async()=>keyFile};},1);
assert.equal(verifiedUrl,root+"/"+keyFile+".txt");
let posted=null;
const result=await submitIndexNow([root+"/pairs/eur-usd/"],async(url,options)=>{posted={url,options};return {status:202,text:async()=>"Accepted"};});
assert.equal(result.status,202);
assert.equal(posted.url,"https://api.indexnow.org/indexnow");
const body=JSON.parse(posted.options.body);
assert.equal(body.host,"tradeninety.com");
assert.equal(body.key,keyFile);
assert.equal(body.keyLocation,root+"/"+keyFile+".txt");
assert.deepEqual(body.urlList,[root+"/pairs/eur-usd/"]);
await assert.rejects(()=>submitIndexNow([root+"/"],async()=>({status:403,text:async()=>"Wrong key"})),/HTTP 403/);
console.log("IndexNow publisher verified: canonical-only routes, no stale/retired links, public key and real response gating.");
