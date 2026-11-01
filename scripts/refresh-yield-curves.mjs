import fs from 'node:fs/promises';
import {normalizeYieldHistory,coverageReport,validDate} from '../src/lib/trade90-yield-research.js';
const output='src/data/trade90-yield-curves.json';
const old=JSON.parse(await fs.readFile(output,'utf8'));
const now=new Date(),today=now.toISOString().slice(0,10);
const start=new Date(now.getTime()-540*86400000).toISOString().slice(0,10);
const snapshot={schemaVersion:2,generatedAt:now.toISOString(),asOf:null,
 notes:'Source-dated observed 2Y and 10Y yields only; official government benchmark yields and modeled euro area spot rates must not be treated as identical instruments.',
 currencies:{...old.currencies},failures:{}};
function rows(csv){
 const out=[];let a=[],f='',quoted=false;
 for(let i=0;i<csv.length;i++){const c=csv[i];
  if(c==='"'&&quoted&&csv[i+1]==='"'){f+='"';i++;continue;}
  if(c==='"'){quoted=!quoted;continue;}
  if(c===','&&!quoted){a.push(f);f='';continue;}
  if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&csv[i+1]==='\n')i++;a.push(f);if(a.some(x=>x.trim()))out.push(a);a=[];f='';continue;}
  f+=c;
 }
 a.push(f);if(a.some(x=>x.trim()))out.push(a);return out;
}
async function load(url,label){
 const r=await fetch(url,{headers:{'User-Agent':'TRADE90/1.0 source-linked bond research'},signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error(label+' HTTP '+r.status);
 return r.text();
}
function publish(code,history,{provider,source,yieldType,definition,series}){
 const v=normalizeYieldHistory(history);
 if(!v.length)throw Error('No verified pair of 2Y and 10Y observations');
 const last=v.at(-1);
 snapshot.currencies[code]={verified:true,asOf:last.date,provider,source,yieldType,definition,series,
  yields:{'2Y':last['2Y'],'10Y':last['10Y']},history:v};
 console.log(code,last.date,v.length+' history observations');
}
function joinSeries(two,ten){
 const map=new Map(ten.map(x=>[x.date,x.value]));
 return two.filter(x=>map.has(x.date)).map(x=>({date:x.date,'2Y':x.value,'10Y':map.get(x.date)}));
}
async function us(){
 const observations=[];
 for(const year of [now.getUTCFullYear()-1,now.getUTCFullYear()]){
  const url='https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/'+year+'/all?type=daily_treasury_yield_curve&field_tdr_date_value='+year+'&page&_format=csv';
  const data=rows(await load(url,'US Treasury '+year)),h=(data.shift()||[]).map(x=>x.trim().toLowerCase());
  const di=h.indexOf('date'),two=h.findIndex(x=>['2 yr','2-year','2 year'].includes(x)),ten=h.findIndex(x=>['10 yr','10-year','10 year'].includes(x));
  if([di,two,ten].includes(-1))throw Error('US Treasury columns unavailable');
  for(const v of data){
   const m=/^(\d{1,2})\/(\d{1,2})\/(20\d{2})$/.exec(v[di]||'');
   const date=m?m[3]+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0'):null;
   if(date&&date<=today)observations.push({date,'2Y':Number(v[two]),'10Y':Number(v[ten])});
  }
 }
 publish('USD',observations,{provider:'US Treasury',source:'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve',
 yieldType:'government_par',definition:'US Treasury constant maturity par curve',series:{'2Y':'2 Yr','10Y':'10 Yr'}});
}
async function canada(){
 const url='https://www.bankofcanada.ca/valet/observations/V39051,V39055/json?start_date='+start;
 const data=JSON.parse(await load(url,'Bank of Canada Valet'));
 publish('CAD',(data.observations||[]).map(r=>({date:r.d,'2Y':Number(r.V39051?.v),'10Y':Number(r.V39055?.v)})),
 {provider:'Bank of Canada',source:'https://www.bankofcanada.ca/rates/interest-rates/canadian-bonds/',
 yieldType:'government_benchmark',definition:'Canadian government benchmark bonds (selected issues close to stated maturity)',
 series:{'2Y':'V39051','10Y':'V39055'}});
}
async function ecbOne(tenor){
 const key='B.U2.EUR.4F.G_N_C.SV_C_YM.SR_'+tenor;
 const url='https://data-api.ecb.europa.eu/service/data/YC/'+key+'?format=csvdata&startPeriod='+start;
 const csv=rows(await load(url,'ECB '+tenor)),head=(csv.shift()||[]).map(x=>x.toUpperCase());
 const di=head.indexOf('TIME_PERIOD'),vi=head.indexOf('OBS_VALUE');
 if(di<0||vi<0)throw Error('ECB series headings unavailable');
 return csv.map(r=>({date:r[di],value:Number(r[vi])})).filter(v=>validDate(v.date)&&v.date<=today&&Number.isFinite(v.value));
}
async function ecb(){
 const [two,ten]=await Promise.all(['2Y','10Y'].map(ecbOne));
 publish('EUR',joinSeries(two,ten),{provider:'ECB Data Portal',
 source:'https://data.ecb.europa.eu/data/datasets/YC/YC.B.U2.EUR.4F.G_N_C.SV_C_YM.SR_2Y',
 yieldType:'euroarea_modeled_spot',definition:'Svensson modeled euro-area zero-coupon spot curve, continuously compounded; not a German Bund benchmark',
 series:{'2Y':'YC.B.U2.EUR.4F.G_N_C.SV_C_YM.SR_2Y','10Y':'YC.B.U2.EUR.4F.G_N_C.SV_C_YM.SR_10Y'}});
}
async function fred(code,ids,key){
 if(!Array.isArray(ids)||ids.length!==2||ids.some(x=>!/^[A-Z0-9_]+$/.test(x)))throw Error('Explicit approved FRED series IDs required');
 async function one(id){
  const u=new URL('https://api.stlouisfed.org/fred/series/observations');
  for(const [k,v] of Object.entries({series_id:id,api_key:key,file_type:'json',observation_start:start}))u.searchParams.set(k,v);
  // Don't expose credential-bearing URLs in logs or errors.
  const response=await fetch(u,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('FRED '+code+' HTTP '+response.status);
  const d=await response.json();
  return (d.observations||[]).map(r=>({date:r.date,value:Number(r.value)})).filter(x=>validDate(x.date)&&Number.isFinite(x.value)&&x.date<=today);
 }
 const [two,ten]=await Promise.all(ids.map(one));
 publish(code,joinSeries(two,ten),{provider:'FRED configured source',source:'https://fred.stlouisfed.org/series/'+ids[0],
 yieldType:'government_benchmark',definition:'Configured government benchmark yield series; original publisher definitions require independent review',series:{'2Y':ids[0],'10Y':ids[1]}});
}
let config={};
try{config=JSON.parse(process.env.TRADE90_FRED_YIELD_SERIES||'{}')}catch{snapshot.failures._config='Invalid JSON for FRED series configuration'}
const tasks=[['USD',us],['CAD',canada],['EUR',ecb]];
for(const code of ['GBP','JPY','AUD','NZD','CHF']){
 if(process.env.FRED_API_KEY&&config[code])tasks.push([code,()=>fred(code,config[code],process.env.FRED_API_KEY)]);
 else snapshot.failures[code]='Official series adapter or reviewed FRED mapping not configured';
}
await Promise.all(tasks.map(async([code,fn])=>{try{await fn()}catch(e){snapshot.failures[code]=String(e.message||e).slice(0,160);console.warn(code,'fetch not confirmed:',snapshot.failures[code])}}));
for(const [code,c] of Object.entries(snapshot.currencies)){
 if(!c?.verified){delete snapshot.currencies[code];continue;}
 if(!Array.isArray(c.history)||!c.history.length)c.history=normalizeYieldHistory([{date:c.asOf,...c.yields}]);
 c.yieldType=c.yieldType||'unclassified';
}
snapshot.asOf=Object.values(snapshot.currencies).map(c=>c.asOf).filter(validDate).sort().at(-1)||null;
const report={schemaVersion:1,checkedAt:snapshot.generatedAt,coverage:coverageReport(snapshot,snapshot.generatedAt),failures:snapshot.failures};
await fs.writeFile(output,JSON.stringify(snapshot,null,2)+'\n');
await fs.writeFile('public/data/yield-source-status.json',JSON.stringify(report,null,2)+'\n');
console.log('Current yield providers:',Object.entries(report.coverage).filter(([,v])=>v.status==='current').map(([k])=>k));
if(!Object.values(report.coverage).some(v=>v.status==='current'))process.exitCode=1;
