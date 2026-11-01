// Source-validated daily (or explicitly monthly) sovereign yield curves.
// The series are NOT equivalent to OIS futures or policy-rate forecasts.
// Strict 2Y/10Y matching, observed dates, and transparent source status.
import fs from 'node:fs/promises';
const file='src/data/trade90-yield-curves.json';
const previous=JSON.parse(await fs.readFile(file,'utf8'));
const now=new Date(),today=now.toISOString().slice(0,10),todayMs=Date.parse(today+'T00:00:00Z');
const codes=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
const sources={
 USD:{name:'US Treasury par yield',kind:'sovereign_par_yield',frequency:'daily',url:'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve'},
 EUR:{name:'ECB euro-area AAA government spot curve',kind:'fitted_sovereign_spot',frequency:'daily',url:'https://data.ecb.europa.eu/data/datasets/YC'},
 GBP:{name:'Bank of England nominal gilt fitted spot curve',kind:'fitted_sovereign_spot',frequency:'daily',url:'https://www.bankofengland.co.uk/statistics/yield-curves'},
 JPY:{name:'Japan Ministry of Finance constant-maturity JGB yield',kind:'sovereign_constant_maturity',frequency:'daily',url:'https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/index.htm'},
 AUD:{name:'RBA Australian government bond assessed closing yield',kind:'sovereign_assessed_yield',frequency:'weekly_publication',url:'https://www.rba.gov.au/statistics/tables/'},
 NZD:{name:'RBNZ wholesale government benchmark closing yields',kind:'sovereign_benchmark_yield',frequency:'daily',url:'https://www.rbnz.govt.nz/en/statistics/series/exchange-and-interest-rates/wholesale-interest-rates'},
 CAD:{name:'Bank of Canada selected government bond benchmark yields',kind:'sovereign_benchmark_yield',frequency:'daily',url:'https://www.bankofcanada.ca/rates/interest-rates/canadian-bonds/'},
 CHF:{name:'SNB Swiss Confederation fitted yield curve (monthly)',kind:'fitted_sovereign_spot',frequency:'monthly',url:'https://data.snb.ch/en/topics/ziredev/cube/rendoblim'}
};
const isDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s&&s<=today;
const rate=x=>{const raw=String(x??'').replace(/,/g,'').trim();if(!raw||raw==='.'||raw==='-'||raw==='..')return null;const n=Number(raw);return Number.isFinite(n)&&n>-10&&n<35?n:null};
const toDate=x=>{x=String(x||'').trim();if(isDate(x))return x;let m=x.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);if(m){let d=m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');return isDate(d)?d:null;}m=x.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(m){let d=m[3]+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0');return isDate(d)?d:null;}let d=Date.parse(x);return Number.isFinite(d)?new Date(d).toISOString().slice(0,10):null};
const row=(date,two,ten)=>{const asOf=toDate(date),r2=rate(two),r10=rate(ten);return asOf&&r2!==null&&r10!==null?{date:asOf,'2Y':r2,'10Y':r10}:null};
function parseCSV(text){const lines=String(text).replace(/^\uFEFF/,'').split(/\r?\n/);return lines.map(line=>{let res=[],s='',quoted=false;for(let i=0;i<line.length;i++){let c=line[i];if(c==='"'&&quoted&&line[i+1]==='"'){s+='"';i++}else if(c==='"'){quoted=!quoted}else if(c===','&&!quoted){res.push(s.trim());s=''}else{s+=c}}res.push(s.trim());return res})}
async function get(url,timeout=23000){const r=await fetch(url,{headers:{'User-Agent':'TRADE90 research data collection (https://tradeninety.com/data-policy/)','Accept':'text/csv, application/json, text/plain, text/html;q=0.8'},signal:AbortSignal.timeout(timeout)});if(!r.ok)throw Error('HTTP '+r.status+' at '+new URL(url).hostname);return r.text()}
function normalized(raw){const byDate=new Map();for(const x of raw){if(x&&isDate(x.date)&&Number.isFinite(x['2Y'])&&Number.isFinite(x['10Y']))byDate.set(x.date,x)}return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-400)}
function mergeTenors(a,b){const map=new Map(a.map(x=>[x.date,x.value]));return normalized(b.map(x=>row(x.date,map.get(x.date),x.value)))}
async function usd(){const yr=now.getUTCFullYear(),u='https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/'+yr+'/all?type=daily_treasury_yield_curve&field_tdr_date_value='+yr+'&page&_format=csv';const csv=parseCSV(await get(u));const h=csv.shift().map(x=>x.toLowerCase());const i=(...names)=>h.findIndex(x=>names.includes(x));const d=i('date'),a=i('2 yr','2-year','2 year'),b=i('10 yr','10-year','10 year');if([d,a,b].some(x=>x<0))throw Error('Treasury maturity headers changed');return csv.map(x=>row(x[d],x[a],x[b]))}
async function eur(){const basic='https://data-api.ecb.europa.eu/service/data/YC/YC.B.U2.EUR.4F.G_N_A.SV_C_YM.SR_';async function series(t){const csv=parseCSV(await get(basic+t+'?lastNObservations=400&format=csvdata'));const h=csv.shift();const d=h.indexOf('TIME_PERIOD'),v=h.indexOf('OBS_VALUE');if(d<0||v<0)throw Error('ECB CSV field schema changed');return csv.filter(x=>x[d]&&x[v]).map(x=>({date:x[d],value:rate(x[v])})).filter(x=>x.value!==null)}return mergeTenors(await series('2Y'),await series('10Y'))}
async function cad(){const json=JSON.parse(await get('https://www.bankofcanada.ca/valet/observations/V39051,V39055/json?recent=400'));return(json.observations||[]).map(x=>row(x.d,x.V39051?.v,x.V39055?.v))}
async function aud(){const csv=parseCSV(await get('https://www.rba.gov.au/statistics/tables/csv/f2-data.csv'));let d=-1,a=-1,b=-1;for(let i=0;i<Math.min(csv.length,20);i++){const cells=csv[i];const ia=cells.indexOf('FCMYGBAG2D'),ib=cells.indexOf('FCMYGBAG10D');if(ia>=0&&ib>=0){a=ia;b=ib;d=0;break}}if(a<0||b<0)throw Error('RBA F2 identifiers not found');return csv.map(x=>row(x[d],x[a],x[b]))}
async function jpy(){const url='https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcme.csv';const csv=parseCSV(await get(url));let h=csv.findIndex(x=>/^date$/i.test(x[0]||''));if(h<0)throw Error('MOF date heading missing');const cols=csv[h].map(x=>x.trim().toLowerCase().replace(/\s/g,''));const i2=cols.findIndex(x=>/^(2|2y|2yr|2years?)$/.test(x)),i10=cols.findIndex(x=>/^(10|10y|10yr|10years?)$/.test(x));if(i2<0||i10<0)throw Error('MOF 2Y/10Y columns missing');return csv.slice(h+1).map(x=>row(x[0],x[i2],x[i10]))}
async function chf(){const url='https://data.snb.ch/api/cube/rendoblim/data/csv/en?dimSel=D0(2J,10J)&fromDate=2025-01';const raw=await get(url);const rows=raw.split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));const sep=rows.find(x=>x.includes(';'))?';':',';const h=rows[0]?.split(sep).map(x=>x.toLowerCase().trim())||[];const di=h.findIndex(x=>/date|period/.test(x)),mi=h.findIndex(x=>/item|maturity|d0/.test(x)),vi=h.findIndex(x=>/value/.test(x));if([di,mi,vi].some(x=>x<0))throw Error('SNB monthly schema unavailable');const d=new Map();for(const line of rows.slice(1)){const x=line.split(sep),date=x[di]?.trim(),m=x[mi]?.trim(),val=rate(x[vi]);if(!/^(2J|10J)$/.test(m)||val===null||!/\d{4}-\d{2}/.test(date))continue;const key=date.slice(0,7)+'-01';const item=d.get(key)||{date:key};item[m==='2J'?'2Y':'10Y']=val;d.set(key,item)}return [...d.values()].map(x=>row(x.date,x['2Y'],x['10Y']))}
async function fred(code){const key=process.env.FRED_API_KEY;let config={};try{config=JSON.parse(process.env.TRADE90_FRED_YIELD_SERIES||'{}')}catch{}const ids=config[code];if(!key||!Array.isArray(ids)||ids.length!==2||ids.some(x=>!/^[A-Z0-9_]+$/.test(x)))throw Error('Source adapter not yet configured; requires exact validated 2Y/10Y source mapping');async function series(id){const u='https://api.stlouisfed.org/fred/series/observations?series_id='+id+'&api_key='+encodeURIComponent(key)+'&file_type=json&sort_order=desc&limit=400';const d=JSON.parse(await get(u));return(d.observations||[]).map(x=>({date:x.date,value:rate(x.value)})).filter(x=>x.value!==null)}return mergeTenors(await series(ids[0]),await series(ids[1]))}
const adapters={USD:usd,EUR:eur,CAD:cad,AUD:aud,JPY:jpy,CHF:chf,GBP:()=>fred('GBP'),NZD:()=>fred('NZD')};
const currencies={},health={};const run=await Promise.allSettled(codes.map(async code=>({code,history:normalized(await adapters[code]())})));
for(let i=0;i<codes.length;i++){
 const code=codes[i],result=run[i],meta=sources[code],old=previous.currencies?.[code];
 let history=[],error=null;
 if(result.status==='fulfilled'&&result.value.history.length)history=result.value.history;
 else error=result.status==='rejected'?String(result.reason?.message||result.reason):'No matched source observations';
 if(old?.history?.length){history=normalized([...old.history,...history])}
 if(!history.length&&old?.verified&&old.asOf){history=normalized([row(old.asOf,old.yields?.['2Y'],old.yields?.['10Y'])])}
 const latest=history.at(-1);
 const age=latest?(todayMs-Date.parse(latest.date+'T00:00:00Z'))/86400000:null;
 const maxAge=meta.frequency==='monthly'?50:meta.frequency==='weekly_publication'?12:8;
 const verified=Boolean(latest&&age>=0&&age<=maxAge&&!error);
 const status=verified?'current':latest?'stale_or_source_failed':'unavailable';
 if(latest){currencies[code]={verified,asOf:latest.date,source:meta.url,kind:meta.kind,frequency:meta.frequency,provider:meta.name,yields:{'2Y':latest['2Y'],'10Y':latest['10Y']},history}}
 health[code]={status,source:meta.url,kind:meta.kind,frequency:meta.frequency,latestObservation:latest?.date||null,historyPoints:history.length,checkedAt:now.toISOString(),error:error||null,observationAgeDays:age};
 console.log(code+': '+status+' '+(latest?.date||'—')+' '+(error||''));
}
const summary={total:8,current:codes.filter(c=>health[c].status==='current').length,stale:codes.filter(c=>health[c].status==='stale_or_source_failed').length,unavailable:codes.filter(c=>health[c].status==='unavailable').length};
const output={schemaVersion:2,asOf:codes.map(c=>currencies[c]?.asOf).filter(Boolean).sort().at(-1)||null,generatedAt:now.toISOString(),coverage:summary,notes:'2Y and 10Y sovereign yields. Instrument definitions and publication frequencies differ; pair spreads are context only. Never use this file as policy-rate forecasts.',currencies,health};
await fs.writeFile(file,JSON.stringify(output,null,2)+'\n');
await fs.writeFile('public/data/yield-curve-status.json',JSON.stringify({schemaVersion:1,generatedAt:output.generatedAt,coverage:summary,health},null,2)+'\n');
if(!summary.current)process.exitCode=1;
