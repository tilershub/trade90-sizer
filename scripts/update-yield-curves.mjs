#!/usr/bin/env node
/**
 * TRADE90 yield updater. Providers must return JSON:
 * { "currency":"AUD", "observations":[{"date":"2026-10-22","2Y":4.1,"10Y":4.4}, ...],
 *   "source":"https://official-source/series", "license":"approved license id" }
 * Never publish data merely because it is publicly accessible.
 */
import fs from 'node:fs/promises';
const file='src/data/trade90-yield-curves.json';
const config=JSON.parse(await fs.readFile('src/data/trade90-yield-providers.json','utf8'));
const existing=JSON.parse(await fs.readFile(file,'utf8'));
const allowed=new Set(['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF']);
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&Date.parse(s+'T00:00:00Z')<=Date.now();
const next={...existing,currencies:{...existing.currencies}};
function parseTreasuryCsv(csv,currency,source){
 const lines=csv.trim().split(/\r?\n/).map(line=>line.split(','));
 const header=lines.shift().map(v=>v.replace(/^\"|\"$/g,'').trim());
 const dateIndex=header.findIndex(h=>h==='Date'),two=header.findIndex(h=>/^2\s*(Yr|YR|Year)$/i.test(h)),ten=header.findIndex(h=>/^10\s*(Yr|YR|Year)$/i.test(h));
 if(dateIndex<0||two<0||ten<0)throw Error('Treasury CSV tenor columns missing');
 const observations=lines.map(row=>{const m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(row[dateIndex]||'');return m?{date:m[3]+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0'),'2Y':Number(row[two]),'10Y':Number(row[ten])}:null;}).filter(Boolean);
 return {currency,source,observations};
}
let updates=0;
for(const entry of config.providers||[]){
 if(!allowed.has(entry.currency)||entry.enabled!==true)continue;
 if(entry.redistributionApproved!==true||!entry.licenseReviewedAt||!isDate(entry.licenseReviewedAt)){console.warn(entry.currency+': license not approved; skipped');continue;}
 if(!/^https:\/\//.test(entry.endpoint||'')||!/^https:\/\//.test(entry.source||''))throw Error(entry.currency+': invalid source URL');
 const url=new URL(entry.endpoint);
 if(!Array.isArray(entry.allowedHosts)||!entry.allowedHosts.includes(url.hostname))throw Error(entry.currency+': endpoint host not allowlisted');
 try{
  const response=await fetch(url,{headers:{'Accept':'application/json','User-Agent':'TRADE90-Yield-Research/1.0 (+https://tradeninety.com)'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const payload=entry.format==='us-treasury-csv' ? parseTreasuryCsv(await response.text(),entry.currency,entry.source) : await response.json();
  if(payload.currency!==entry.currency||!Array.isArray(payload.observations))throw Error('provider schema mismatch');
  const observations=payload.observations.filter(o=>isDate(o.date)&&Number.isFinite(o['2Y'])&&Number.isFinite(o['10Y'])&&o['2Y']!==0&&o['10Y']!==0&&Math.abs(o['2Y'])<100&&Math.abs(o['10Y'])<100).sort((a,b)=>b.date.localeCompare(a.date));
  if(!observations.length)throw Error('no valid observations');
  const latest=observations[0],old=next.currencies[entry.currency];
  if(old&&old.asOf>latest.date){console.warn(entry.currency+': older observation ignored');continue;}
  next.currencies[entry.currency]={verified:true,asOf:latest.date,source:entry.source,license:entry.license,licenseReviewedAt:entry.licenseReviewedAt,provider:entry.endpoint,yields:{'2Y':latest['2Y'],'10Y':latest['10Y']}};
  updates++;console.log(entry.currency+': '+latest.date+' verified observation');
 }catch(error){console.error(entry.currency+': '+error.message+'; retaining previous data');}
}
if(updates){next.asOf=new Date().toISOString();await fs.writeFile(file,JSON.stringify(next,null,2)+'\n');}
console.log('Yield data updated for '+updates+' currencies; unavailable currencies remain unpopulated.');
