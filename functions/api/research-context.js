const SOURCE = 'https://raw.githubusercontent.com/tilershub/usdjpy-research-lab/main/public/research-context.json';
export async function onRequestGet() {
  try {
    const response = await fetch(SOURCE, {headers:{accept:'application/json'},cf:{cacheTtl:60,cacheEverything:true},signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('Source unavailable');
    const data = await response.json();
    if (data.schema_version!==1 || data.methodology!=='research-context-1' || !Array.isArray(data.indicators) || !Number.isFinite(Date.parse(data.generated_at))) throw new Error('Invalid research context');
    return new Response(JSON.stringify(data),{headers:{'content-type':'application/json','cache-control':'public, max-age=60, s-maxage=60','x-content-type-options':'nosniff'}});
  } catch {
    return new Response(JSON.stringify({error:'Macro research is temporarily unavailable.'}),{status:502,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }
}
