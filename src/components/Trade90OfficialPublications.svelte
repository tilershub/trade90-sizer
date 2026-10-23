<script>
 import {onMount} from "svelte";
 export let pair=null;
 let report=null,loading=true,error="";
 $: codes=pair?[pair.base,pair.quote]:[];
 $: codeSet=new Set(codes);
 $: sources=(report?.sources||[]).filter(s=>!pair||codeSet.has(s.code));
 const currentDate=()=>new Date().toISOString().slice(0,10);
 const futureTitle=t=>/to be published|upcoming|scheduled for release/i.test(t);
 const dateOfUrl=url=>{
   let p="";try{p=new URL(url).pathname}catch{return null}
   let m=p.match(/monetary(20\d\d)(\d\d)(\d\d)[a-z]\.htm$/i)||p.match(/pre_(20\d\d)(\d\d)(\d\d)$/i);
   if(m)return m[1]+"-"+m[2]+"-"+m[3];
   m=p.match(/\/(20\d\d)\/(\d\d)\/(?:fad-press-release|ocr-)/i);
   return m?m[1]+"-"+m[2]+"-01":null;
 };
 $: links=sources.flatMap(source=>(source.items||[]).map((item,i)=>({...item,code:source.code,bank:source.bank,rank:i})))
   .filter(x=>x.title&&x.url&&!futureTitle(x.title)&&(!dateOfUrl(x.url)||dateOfUrl(x.url)<=currentDate()))
   .slice(0,pair?6:12);
 onMount(()=>{
  let disposed=false;
  fetch("/data/official-source-monitor.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Source scan unavailable");return r.json();})
  .then(data=>{if(!disposed)report=data;}).catch(e=>{if(!disposed)error="The most recent official source scan could not be retrieved."})
  .finally(()=>{if(!disposed)loading=false;});
  return ()=>{disposed=true;};
 });
 const time=s=>s?new Date(s).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})+" UTC":"Not yet available";
</script>
<section class="official-watch" aria-label="Automatically discovered official central bank publications">
 <div class="heading"><div>
  <span class="eyebrow">AUTOMATED OFFICIAL SOURCE WATCH</span>
  <h2>{pair?"Recent publication links for "+pair.label:"Recent official central bank publication links"}</h2>
  <p>Links detected from official bank publication channels. A new publication is <strong>not necessarily an interest-rate decision</strong> and is not a verified policy-rate change.</p>
 </div></div>
 {#if loading}
  <p class="notice">Loading recent source scan…</p>
 {:else if error}
  <p class="notice">{error} Current verified policy-rate figures remain separate.</p>
 {:else}
  <p class="status">Last source scan: <strong>{time(report?.lastScanAt)}</strong> · {sources.filter(x=>x.status==="available").length} of {sources.length} selected bank channels reached.</p>
  {#if links.length}
   <div class="items">{#each links as item (item.url)}
    <a href={item.url} target="_blank" rel="noopener noreferrer" class="link">
     <span>{item.code} · {item.bank}</span>
     <strong>{item.title.replace(/&#\d+;|&[a-z]+;/gi," ").slice(0,160)}</strong>
     <small>View official publication ↗</small>
    </a>
   {/each}</div>
  {:else}
   <p class="notice">No matching official publication links were obtained in the latest scan.</p>
  {/if}
 {/if}
 <p class="fine">Automatically collected links are shown for reference, not verified AI-written summaries or streaming data. For rate and source-quality definitions, see <a href="/data-policy/">TRADE90's data policy</a>.</p>
</section>
<style>
.official-watch{padding:20px 24px 24px;border-top:1px solid #334155;background:#111c30;color:#f8fafc}
.eyebrow{font-size:.75rem;color:#60a5fa;font-weight:790;letter-spacing:.07em}
.heading h2{font-size:1.32rem;letter-spacing:-.02em;margin:6px 0;color:#f8fafc}
.heading p{font-size:.89rem;color:#cbd5e1;line-height:1.65;margin:6px 0}
.heading strong{color:#f8fafc}
.status,.fine,.notice{font-size:.8rem;color:#a5b4c8;line-height:1.6}
.status strong{color:#e2e8f0}
.items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:15px 0}
.link{display:flex;flex-direction:column;gap:7px;padding:15px;border:1px solid #334155;background:#17263a;border-radius:10px;color:#f8fafc;text-decoration:none}
.link:hover{border-color:#3b82f6}
.link span{font-size:.73rem;color:#93c5fd}
.link strong{font-size:.89rem;line-height:1.48;overflow-wrap:anywhere}
.link small{font-size:.75rem;color:#a5b4c8}
.fine a{color:#93c5fd;text-decoration:underline}
@media(max-width:650px){.official-watch{padding:16px 14px}.items{grid-template-columns:1fr}}
:global(html[data-theme="light"]) .official-watch{background:#fff;color:#0f172a;border-color:#cbd5e1}
:global(html[data-theme="light"]) .heading h2,:global(html[data-theme="light"]) .heading strong,:global(html[data-theme="light"]) .link strong{color:#0f172a}
:global(html[data-theme="light"]) .heading p,:global(html[data-theme="light"]) .status,:global(html[data-theme="light"]) .notice,:global(html[data-theme="light"]) .fine,:global(html[data-theme="light"]) .link small{color:#334155}
:global(html[data-theme="light"]) .status strong{color:#0f172a}
:global(html[data-theme="light"]) .eyebrow,:global(html[data-theme="light"]) .link span,:global(html[data-theme="light"]) .fine a{color:#1d4ed8}
:global(html[data-theme="light"]) .link{background:#f8fafc;border-color:#cbd5e1;color:#0f172a}
</style>