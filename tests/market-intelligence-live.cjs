const {chromium} = require("playwright");
(async()=>{
 const base="https://tradeninety.com";
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:false});
 const failures=[],api=[];
 page.on("pageerror",err=>failures.push(err.message));
 page.on("response",res=>{if(res.url().includes("/api/market-"))api.push({path:res.url().split("?")[0],code:res.status()})});
 const res=await page.goto(base+"/market-intelligence/?diagnostics=20261014",{
   timeout:30000,waitUntil:"domcontentloaded",
 });
 console.log("PUBLIC_PAGE",res.status(),await page.title());
 await page.waitForTimeout(4500);
 const visible=await page.locator("#mi-content").isVisible().catch(()=>false);
 const loading=await page.locator("#mi-loading").isVisible().catch(()=>false);
 const error=loading ? await page.locator("#mi-loading").textContent() : null;
 const banner=await page.locator("#mi-feed-status").textContent().catch(()=>null);
 const macroVisible=await page.locator("#mi-macro-alert").isVisible().catch(()=>false);
 const macroMessage=await page.locator("#mi-macro-description").textContent().catch(()=>null);
 const classification=await page.locator("#mi-bias").textContent().catch(()=>null);
 const headline=await page.locator("#mi-assessment-heading").textContent().catch(()=>null);
 console.log("BROWSER_STATE",JSON.stringify({visible,loading,error,banner,macroVisible,macroMessage,classification,headline,api,failures}).slice(0,5000));
 const apiPayload=await page.evaluate(async()=>{
   try {const r=await fetch("/api/market-intelligence?diagnostics=20261014",{cache:"no-store"});
     const j=await r.json();
     return {code:r.status,status:j.status,generated_at:j.generated_at,
       event:j.high_impact,assessment:j.assessment_integrity,
       markets:(j.markets||[]).filter(x=>["XAU/USD","EUR/USD","USD/JPY"].includes(x.symbol)).map(x=>({
         symbol:x.symbol,bias:x.published_bias,current:x.current_direction,
         use:x.published_bias_use,event:x.high_impact_event?.status,preEvent:x.pre_event_snapshot,
         warnings:x.warnings?.slice(0,3)
       }))};
   }catch(e){return {error:String(e)}}
 });
 console.log("PRODUCTION_API",JSON.stringify(apiPayload).slice(0,6000));
 await browser.close();
 if(res.status()!==200 || !visible || loading || failures.length)process.exitCode=1;
 if(!macroVisible || !apiPayload?.event || apiPayload.event.status!=="released_or_due")process.exitCode=1;
 if(apiPayload?.markets?.some(m=>m.current!=="Not established"||m.use!=="historical_only"))process.exitCode=1;
 if(apiPayload?.event?.official_release?.headline_yoy_pct!==3.7 || apiPayload?.event?.official_release?.core_mom_pct!==0.3){
   console.error("FAIL: verified October 14 CPI release actuals absent after backend fix");
   process.exitCode=1;
 }
 if(classification!=="Not established"){
   console.error("FAIL: current market view still displays archived bullish label",classification);
   process.exitCode=1;
 }
})().catch(err=>{console.error("DIAGNOSTIC_ERROR",err);process.exitCode=1});
