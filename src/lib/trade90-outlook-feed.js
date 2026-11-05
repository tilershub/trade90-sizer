// Explicitly support published contracts; never replace a usable snapshot with
// a partial response, a future run, or an older CDN copy.
export function validateOutlookFeed(value, current, now=Date.now()) {
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(!object(value)||![2,3,4,5,6].includes(value.schemaVersion))return 'Unsupported research data format';
 const generated=Date.parse(value.generatedAt);
 if(!Number.isFinite(generated)||generated>now+300000)return 'Invalid research publication date';
 if(generated<Date.parse(current?.generatedAt))return 'An older research snapshot was returned';
 if(!object(value.pairs)||!object(value.banks))return 'Incomplete research response';
 const symbols=Object.keys(current?.pairs||{});
 if(!symbols.length||symbols.some(symbol=>!object(value.pairs[symbol])))return 'Missing currency pairs';
 for(const symbol of symbols){
  const p=value.pairs[symbol];
  if(!['widening','narrowing','unchanged','unclear','unavailable'].includes(p.state)||
     !Number.isFinite(Date.parse(p.expiresAt))||p.base!==symbol.slice(0,3)||p.quote!==symbol.slice(3))return 'Invalid pair assessment';
  for(const code of [p.base,p.quote]){
   const b=value.banks[code];
   if(!object(b)||!Array.isArray(b.drivers)||!Number.isFinite(Date.parse(b.expiresAt)))return 'Incomplete bank evidence';
   if(b.drivers.some(d=>!object(d.latest)||!Number.isFinite(d.latest.value)||typeof d.latest.date!=='string'||!Number.isFinite(Date.parse(d.latest.date))))return 'Invalid economic observation';
  }
 }
 return null;
}

export async function fetchResearchJson(url,fetcher=fetch,timeoutMs=12000){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetcher(url,{cache:'no-store',signal:controller.signal});
  if(!response.ok)throw new Error('Research request failed ('+response.status+')');
  return await response.json();
 }finally{clearTimeout(timeout);}
}
